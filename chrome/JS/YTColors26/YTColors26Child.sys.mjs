
/*
 * YTColors26 - Firefox fx-autoconfig content actor
 * v7.1 - native borders + restored whole-card old-video dimming
 * Keep the existing chrome/JS/YTColors26.uc.js unchanged.
 */

const COLORS = Object.freeze({
  newly: '#16a978',
  recent: '#6cd1f0',
  lately: '#e9dbe9',
  latterly: '#806697',
  old: '#4e4c49',
  live: '#9e4733',
  upcoming: '#f5e4d2'
});

const CARD = [
  'ytd-rich-item-renderer:not([is-shelf-item])',
  'ytd-video-renderer',
  'ytd-grid-video-renderer',
  'ytd-compact-video-renderer'
].join(',');

const META = [
  '#metadata-line span',
  '.inline-metadata-item',
  '.yt-content-metadata-view-model__metadata-text',
  '.ytContentMetadataViewModelMetadataText',
  '#metadata-line'
].join(',');

const LIVE = [
  'ytd-thumbnail-overlay-time-status-renderer[overlay-style="LIVE"]',
  'ytd-badge-supported-renderer.badge-style-type-live-now',
  'badge-shape[class*="live"]',
  'yt-live-badge-view-model'
].join(',');

const AGO =
  /\b\d+\s*(years?|yrs?|months?|mos?|weeks?|days?|hours?|hrs?|minutes?|mins?|seconds?|secs?|mo|[ywdhms])\s+ago\b/i;

const COMPACT =
  /\b\d+\s*(years?|yrs?|months?|mos?|weeks?|days?|hours?|hrs?|minutes?|mins?|seconds?|secs?|mo|[ywdh])\b/i;

const STORAGE_KEY = 'CentAnni_lastSeenVideoID';

// Adjust the brightness of old videos:
// 1.0 = normal, 0.7 = 70% opacity, 0.5 = more dimmed
const OLD_OPACITY = '0.4';

function ageKind(unit) {
  const u = unit.toLowerCase();

  if (/^(years?|yrs?|y)$/.test(u)) return 'old';
  if (/^(months?|mos?|mo)$/.test(u)) return 'latterly';
  if (/^(weeks?|w)$/.test(u)) return 'lately';
  if (/^(days?|d)$/.test(u)) return 'recent';

  return 'newly';
}

export class YTColors26Child extends JSWindowActorChild {

  actorCreated() {
    this.start();
  }

  handleEvent(event) {
    if (event.type === 'DOMContentLoaded') this.start();
  }

  receiveMessage(message) {
    if (message.name === 'Start') this.start();
  }

  start() {
    if (this.started || !this.document?.documentElement) return;

    if (
      !/^https:\/\/(?:[a-z0-9-]+\.)*youtube\.com\//i
        .test(this.document.URL)
    ) return;

    this.started = true;
    this.doc = this.document;
    this.win = this.contentWindow;

    this.registered = new WeakSet();
    this.near = new WeakMap();
    this.lastKind = new WeakMap();
    this.lastMarked = new WeakMap();
    this.cleaned = new WeakSet();
    this.dimmed = new WeakSet();
    this.pending = new Set();

    this.flushID = null;
    this.discoverID = null;
    this.wasSubs = false;
    this.previousID = null;
    this.savedOnVisit = false;

    // Native CSS border, keeping the v7 border fix.
    this.styleElement = this.doc.createElement('style');
    this.styleElement.id = 'ytcolors26-native-border-v7-1';

    this.styleElement.textContent = `
      :is(
        ytd-rich-item-renderer,
        ytd-video-renderer,
        ytd-grid-video-renderer,
        ytd-compact-video-renderer
      ):is(
        [data-ytcolors26-kind],
        [data-ytcolors26-lastseen]
      ) {
        box-sizing: border-box !important;
        border: 2px solid var(--ytcolors26-color) !important;
        border-radius: 12px !important;
        overflow: hidden !important;
      }
    `;

    (
      this.doc.head ||
      this.doc.documentElement
    ).append(this.styleElement);

    this.doc.documentElement.dataset.ytcolors26Running =
      'native-border-v7.1-dimming';

    // Only process cards near the visible area.
    this.intersector = new this.win.IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const card = entry.target;

          this.near.set(card, entry.isIntersecting);

          if (entry.isIntersecting) {
            this.enqueue(card);
          } else {
            this.pending.delete(card);
          }
        }
      },
      {
        rootMargin: '350px 0px',
        threshold: 0
      }
    );

    // Detect new cards and timestamp changes without full rescans.
    this.observer = new this.win.MutationObserver(
      mutations => {
        for (const m of mutations) {
          const target = m.target;

          const host = target.nodeType === 1
            ? target.closest?.(CARD)
            : target.parentElement?.closest(CARD);

          if (host && this.near.get(host)) {
            this.enqueue(host);
          }

          if (m.type !== 'childList') continue;

          for (const node of m.addedNodes) {
            if (node.nodeType !== 1) continue;

            if (node.matches(CARD)) {
              this.register(node);
            }

            if (node.childElementCount) {
              node.querySelectorAll(CARD).forEach(
                card => this.register(card)
              );
            }
          }
        }
      }
    );

    this.observer.observe(
      this.doc.documentElement,
      {
        subtree: true,
        childList: true,
        characterData: true
      }
    );

    // Handle YouTube single-page navigation.
    this.onNavigate = () => {
      this.updateSubscriptionState();

      if (this.discoverID !== null) {
        this.win.clearTimeout(this.discoverID);
      }

      this.discoverID = this.win.setTimeout(() => {
        this.discoverID = null;
        this.discover();
      }, 200);
    };

    for (const event of [
      'yt-navigate-finish',
      'yt-page-data-updated',
      'popstate',
      'pageshow'
    ]) {
      this.win.addEventListener(
        event,
        this.onNavigate
      );
    }

    this.discover();

    console.log(
      '[YTColors26] v7.1 native border + old-video dimming active'
    );
  }

  discover() {
    if (!this.started) return;

    this.updateSubscriptionState();

    this.doc.querySelectorAll(CARD).forEach(card => {
      this.register(card);

      if (this.near.get(card)) {
        this.enqueue(card);
      }
    });

    this.saveNewestSubscriptionVideo();
  }

  register(card) {
    if (this.registered.has(card)) return;

    this.registered.add(card);
    this.intersector.observe(card);
  }

  enqueue(card) {
    if (
      !this.started ||
      !card.isConnected ||
      !this.near.get(card)
    ) return;

    this.pending.add(card);
    this.scheduleFlush();
  }

  scheduleFlush() {
    if (
      this.flushID !== null ||
      !this.pending.size
    ) return;

    this.flushID = this.win.requestIdleCallback(
      deadline => {
        this.flushID = null;
        this.flush(deadline);
      },
      { timeout: 450 }
    );
  }

  // Process small batches to minimize impact on YouTube.
  flush(deadline) {
    const begin = this.win.performance.now();
    let count = 0;

    for (const card of this.pending) {
      this.pending.delete(card);

      if (
        card.isConnected &&
        this.near.get(card)
      ) {
        this.colorCard(card);
      }

      count++;

      if (
        count >= 20 ||
        this.win.performance.now() - begin >= 6 ||
        (
          count >= 4 &&
          !deadline.didTimeout &&
          deadline.timeRemaining() < 2
        )
      ) {
        break;
      }
    }

    this.scheduleFlush();
  }

  // Detect video upload age.
  kind(card) {
    if (card.querySelector(LIVE)) {
      return 'live';
    }

    for (const node of card.querySelectorAll(META)) {
      const text = node.textContent?.trim() || '';

      if (!text) continue;

      if (
        /\b(scheduled|upcoming|premieres?\s+(?:in|on))\b/i
          .test(text)
      ) {
        return 'upcoming';
      }

      if (/\bjust now\b/i.test(text)) {
        return 'newly';
      }

      const match =
        text.match(AGO) ||
        text.match(COMPACT);

      if (match) {
        return ageKind(match[1]);
      }
    }

    const fallback = (
      card.textContent || ''
    ).match(AGO);

    return fallback
      ? ageKind(fallback[1])
      : null;
  }

  videoID(card) {
    const link = card?.querySelector(
      'a[href*="/watch?v="], a[href*="/shorts/"]'
    );

    if (!link) return null;

    try {
      const url = new URL(
        link.href,
        this.doc.URL
      );

      return url.pathname.startsWith('/shorts/')
        ? url.pathname.split('/')[2]
        : url.searchParams.get('v');
    } catch {
      return null;
    }
  }

  colorCard(card) {
    const kind = this.kind(card);

    const marked = Boolean(
      this.wasSubs &&
      this.previousID &&
      this.videoID(card) === this.previousID
    );

    if (this.wasSubs && !this.savedOnVisit) {
      this.saveNewestSubscriptionVideo();
    }

    // Clean leftover styles from previous versions once.
    if (!this.cleaned.has(card)) {
      this.cleaned.add(card);

      card.querySelectorAll(
        ':scope > .ytcolors26-border-overlay'
      ).forEach(element => element.remove());

      for (const name of [
        'outline',
        'outline-offset',
        'clip-path',
        'opacity',
        'border-radius'
      ]) {
        card.style.removeProperty(name);
      }
    }

    // ==========================================
    // FIX: RESTORE OLD VIDEO DIMMING
    // ==========================================
    // Apply opacity directly to the whole video card.
    // Works independently of YouTube's nested card structure.
    if (kind === 'old') {
      if (
        card.style.getPropertyValue('opacity') !== OLD_OPACITY ||
        card.style.getPropertyPriority('opacity') !== 'important'
      ) {
        card.style.setProperty(
          'opacity',
          OLD_OPACITY,
          'important'
        );
      }

      this.dimmed.add(card);

    } else if (this.dimmed.has(card)) {
      // Restore normal opacity when a card is reused or
      // reclassified as something other than an old video.
      card.style.removeProperty('opacity');
      this.dimmed.delete(card);
    }

    // Avoid rewriting unchanged borders and attributes.
    if (
      this.lastKind.has(card) &&
      this.lastKind.get(card) === kind &&
      this.lastMarked.get(card) === marked &&
      card.hasAttribute('data-ytcolors26-kind') === Boolean(kind) &&
      card.hasAttribute('data-ytcolors26-lastseen') === marked
    ) {
      return;
    }

    if (kind) {
      card.setAttribute(
        'data-ytcolors26-kind',
        kind
      );
    } else {
      card.removeAttribute(
        'data-ytcolors26-kind'
      );
    }

    if (marked) {
      card.setAttribute(
        'data-ytcolors26-lastseen',
        'true'
      );
    } else {
      card.removeAttribute(
        'data-ytcolors26-lastseen'
      );
    }

    if (kind || marked) {
      card.style.setProperty(
        '--ytcolors26-color',
        marked ? '#7F00FF' : COLORS[kind]
      );
    } else {
      card.style.removeProperty(
        '--ytcolors26-color'
      );
    }

    this.lastKind.set(card, kind);
    this.lastMarked.set(card, marked);
  }

  updateSubscriptionState() {
    const onSubs =
      this.win.location.pathname ===
      '/feed/subscriptions';

    if (onSubs && !this.wasSubs) {
      try {
        this.previousID =
          this.win.localStorage.getItem(
            STORAGE_KEY
          );
      } catch {
        this.previousID = null;
      }

      this.savedOnVisit = false;

    } else if (!onSubs && this.wasSubs) {
      this.previousID = null;

      this.doc.querySelectorAll(
        '[data-ytcolors26-lastseen]'
      ).forEach(card => {
        card.removeAttribute(
          'data-ytcolors26-lastseen'
        );
      });
    }

    this.wasSubs = onSubs;
  }

  saveNewestSubscriptionVideo() {
    if (
      !this.wasSubs ||
      this.savedOnVisit
    ) return;

    const card = this.doc.querySelector(
      'ytd-browse[page-subtype="subscriptions"] ' +
      'ytd-rich-item-renderer:not([is-shelf-item])'
    );

    const id = this.videoID(card);

    if (!id) return;

    try {
      this.win.localStorage.setItem(
        STORAGE_KEY,
        id
      );
    } catch {}

    this.savedOnVisit = true;
  }

  didDestroy() {
    this.started = false;

    this.observer?.disconnect();
    this.intersector?.disconnect();

    if (!this.win) return;

    if (this.flushID !== null) {
      this.win.cancelIdleCallback(
        this.flushID
      );
    }

    if (this.discoverID !== null) {
      this.win.clearTimeout(
        this.discoverID
      );
    }

    for (const event of [
      'yt-navigate-finish',
      'yt-page-data-updated',
      'popstate',
      'pageshow'
    ]) {
      this.win.removeEventListener(
        event,
        this.onNavigate
      );
    }

    this.pending?.clear();
    this.styleElement?.remove();
  }
}
