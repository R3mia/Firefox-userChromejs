
/*
 * YouTube Playback Fixer - Firefox/fx-autoconfig adaptation
 * Based on YouTube - Playback Fixer v4.3 by brizzle.
 * MIT License, Copyright (c) 2026 brizzle.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

// This code is run in an origin-matched sandbox,
// not as privileged chrome JavaScript.
function runPlaybackEngine() {
  'use strict';

  if (window.__ytPlaybackFixerV5Stop) return;

  const OPTIONS = [
    'highres', 'hd2160', 'hd1440', 'hd1080', 'hd720',
    'large', 'medium', 'small', 'tiny', 'auto', 'Disable'
  ];

  const CFG = {
    grace: 5500,
    stall: 5000,
    buffering: 10000,
    empty: 6000,
    critical: 4000,
    retryGap: 5000,
    maxVod: 6,
    maxLive: 3
  };

  const KEY = 'ytFixerPreferredQuality';
  const root = document.documentElement;

  const s = {
    page: '',
    player: null,
    hooks: [],
    video: null,
    onError: null,
    graceUntil: Date.now() + CFG.grace,
    retryUntil: 0,
    lastSet: 0,
    lastTime: -1,
    stallSince: 0,
    bufferingSince: 0,
    emptySince: 0,
    criticalSince: 0,
    retries: 0,
    lastRetry: 0,
    timers: new Set(),
    interval: null,
    navTimeout: null,
    stopped: false
  };

  const q = selector => document.querySelector(selector);

  const onVideo = () =>
    /^\/(watch|live)(?:\/|$)/.test(location.pathname);

  const currentPage = () =>
    location.pathname + location.search;

  const player = () =>
    document.getElementById('movie_player');

  const preferred = () => {
    try {
      return localStorage.getItem(KEY) || 'Disable';
    } catch {
      return 'Disable';
    }
  };

  const status = message => {
    root.dataset.ytPlaybackFixerStatus = message;
  };

  const hooksCount = () => {
    root.dataset.ytPlaybackFixerHooks =
      String(s.hooks.length);
  };

  const api = (p, name, ...args) => {
    try {
      if (typeof p?.[name] === 'function') {
        return p[name](...args);
      }
    } catch (error) {
      console.debug(
        '[YTPlaybackFixer] ' + name,
        error
      );
    }
  };

  const playerState = p => {
    const v = api(p, 'getPlayerState');
    return typeof v === 'number' ? v : -1;
  };

  const isLive = p =>
    api(p, 'getVideoData')?.isLive === true;

  function later(fn, delay) {
    const id = setTimeout(() => {
      s.timers.delete(id);
      if (!s.stopped) fn();
    }, delay);

    s.timers.add(id);
  }

  function clearLater() {
    for (const id of s.timers) {
      clearTimeout(id);
    }

    s.timers.clear();
  }

  function resetMonitor() {
    s.lastTime = -1;
    s.stallSince = 0;
    s.bufferingSince = 0;
    s.emptySince = 0;
    s.criticalSince = 0;
  }

  function restoreHooks() {
    for (const {
      p,
      name,
      original,
      wrapper
    } of s.hooks) {
      try {
        if (p[name] === wrapper) {
          p[name] = original;
        }
      } catch (error) {
        console.debug(
          '[YTPlaybackFixer] Restore:',
          error
        );
      }
    }

    s.hooks = [];
    s.player = null;
    hooksCount();
  }

  // For highres, try selecting the highest available
  // quality supported by YouTube's player.
  function targetQuality(p) {
    const pref = preferred();

    if (pref !== 'highres') {
      return pref;
    }

    try {
      const levels = api(
        p,
        'getAvailableQualityLevels'
      );

      if (
        levels &&
        typeof levels.includes === 'function'
      ) {
        for (const level of [
          'highres',
          'hd4320',
          'hd2880',
          'hd2160',
          'hd1440',
          'hd1080',
          'hd720',
          'large',
          'medium',
          'small',
          'tiny'
        ]) {
          if (levels.includes(level)) {
            return level;
          }
        }
      }
    } catch {}

    return 'highres';
  }

  // Intercept YouTube's player quality methods.
  function installHooks(p) {
    if (
      !p ||
      ['auto', 'Disable'].includes(preferred())
    ) {
      if (s.hooks.length) {
        restoreHooks();
      }
      return;
    }

    if (
      s.player === p &&
      s.hooks.length === 2 &&
      s.hooks.every(
        h => p[h.name] === h.wrapper
      )
    ) {
      return;
    }

    restoreHooks();
    s.player = p;

    for (const name of [
      'setPlaybackQuality',
      'setPlaybackQualityRange'
    ]) {
      const original = p[name];

      if (typeof original !== 'function') {
        continue;
      }

      const wrapper = function(requested, maximum) {
        const pref = preferred();

        if (
          pref !== 'auto' &&
          pref !== 'Disable' &&
          (
            name === 'setPlaybackQualityRange' ||
            [1, 3].includes(playerState(p))
          )
        ) {
          requested = targetQuality(p);

          if (name === 'setPlaybackQualityRange') {
            maximum = requested;
          }
        }

        return name === 'setPlaybackQualityRange'
          ? original.call(this, requested, maximum)
          : original.call(this, requested);
      };

      try {
        p[name] = wrapper;

        if (p[name] === wrapper) {
          s.hooks.push({
            p,
            name,
            original,
            wrapper
          });
        }
      } catch (error) {
        console.warn(
          '[YTPlaybackFixer] Hook:',
          name,
          error
        );
      }
    }

    hooksCount();
    status('hooks ' + s.hooks.length + '/2');
  }

  // Reassert quality every 2 seconds if it differs.
  function enforceQuality(p) {
    if (
      !p ||
      ['auto', 'Disable'].includes(preferred())
    ) return;

    if (![1, 3].includes(playerState(p))) return;

    const wanted = targetQuality(p);
    const actual = api(p, 'getPlaybackQuality');

    root.dataset.ytPlaybackFixerTarget = wanted;

    root.dataset.ytPlaybackFixerActual =
      String(actual ?? 'unknown');

    if (
      actual === wanted ||
      Date.now() - s.lastSet < 2000
    ) return;

    s.lastSet = Date.now();

    api(
      p,
      'setPlaybackQualityRange',
      wanted,
      wanted
    );

    api(
      p,
      'setPlaybackQuality',
      wanted
    );
  }

  function detachVideo() {
    if (s.video && s.onError) {
      s.video.removeEventListener(
        'error',
        s.onError
      );
    }

    s.video = null;
    s.onError = null;
  }

  function attachVideo() {
    const video = q(
      '#movie_player video.html5-main-video, #movie_player video'
    );

    if (!video || video === s.video) return;

    detachVideo();
    s.video = video;

    s.onError = () => {
      if ([2, 4].includes(video.error?.code)) {
        recover(
          'Media error ' + video.error.code
        );
      }
    };

    video.addEventListener('error', s.onError);
  }

  function ensurePlay() {
    if (
      !onVideo() ||
      !s.video ||
      s.video.ended ||
      !s.video.paused
    ) return;

    api(player(), 'playVideo');

    try {
      s.video.play()?.catch(() => {});
    } catch {}
  }

  // Counter and quality selection.
  function updateUI() {
    let box = document.getElementById(
      'yt-fixer-controls'
    );

    if (!onVideo()) {
      if (box) box.style.display = 'none';
      return;
    }

    const title = q(
      'ytd-watch-metadata h1, #primary-inner #title h1, #title h1'
    );

    if (!title) return;

    if (!box) {
      box = document.createElement('span');
      box.id = 'yt-fixer-controls';

      box.style.cssText =
        'display:inline-flex;gap:6px;align-items:center;margin-left:10px;vertical-align:middle';

      const count = document.createElement('span');
      count.id = 'yt-fixer-counter';

      count.style.cssText =
        'font:700 13px monospace;background:#272727;color:#fff;padding:3px 6px;min-width:22px;text-align:center';

      const select = document.createElement('select');
      select.id = 'yt-fixer-quality-select';

      select.style.cssText =
        'background:#272727;color:#fff;border:0;padding:3px 5px;font:13px sans-serif;cursor:pointer';

      for (const opt of OPTIONS) {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.append(option);
      }

      select.addEventListener('change', () => {
        try {
          localStorage.setItem(
            KEY,
            select.value
          );
        } catch {}

        s.lastSet = 0;
        restoreHooks();
        tick();
      });

      box.append(count, select);
    }

    if (box.parentElement !== title) {
      title.append(box);
    }

    box.style.display = 'inline-flex';

    const select = box.querySelector('select');
    select.value = preferred();

    select.style.background =
      preferred() === 'Disable'
        ? '#440000'
        : '#272727';

    const count = box.querySelector(
      '#yt-fixer-counter'
    );

    count.textContent =
      String(s.retries).padStart(2, '0');

    count.style.opacity =
      preferred() === 'Disable'
        ? '0.5'
        : '1';
  }

  function navigate() {
    const id = currentPage();

    if (id !== s.page) {
      s.page = id;

      // Keep retry limits across a full page reload
      // of the same video.
      try {
        if (
          sessionStorage.getItem('ytFixerPageID') !== id
        ) {
          sessionStorage.setItem('ytFixerPageID', id);
          sessionStorage.removeItem('ytFixerReloads');
          sessionStorage.removeItem('ytFixerLastTime');
        }

        s.retries = Number(
          sessionStorage.getItem('ytFixerReloads')
        ) || 0;

        s.lastRetry = Number(
          sessionStorage.getItem('ytFixerLastTime')
        ) || 0;
      } catch {
        s.retries = 0;
        s.lastRetry = 0;
      }

      s.graceUntil =
        Date.now() + CFG.grace + 1500;

      s.retryUntil = 0;
      s.lastSet = 0;

      clearLater();
      detachVideo();
      restoreHooks();
      resetMonitor();

      if (onVideo()) {
        later(() => {
          attachVideo();
          ensurePlay();
        }, 1100);
      }
    }

    updateUI();
  }

  // Attempt playback recovery.
  function recover(reason) {
    if (
      !onVideo() ||
      preferred() === 'Disable' ||
      document.hidden
    ) return;

    const now = Date.now();

    if (
      now < s.graceUntil ||
      now < s.retryUntil
    ) return;

    const p = player();
    const live = isLive(p);

    const max = live
      ? CFG.maxLive
      : CFG.maxVod;

    if (
      s.lastRetry &&
      now - s.lastRetry > 60000
    ) {
      s.retries = 0;
    }

    if (s.retries >= max) {
      status(
        'recovery stopped: ' +
        max +
        ' attempts'
      );

      s.retryUntil = now + 60000;
      return;
    }

    s.retries++;
    s.lastRetry = now;

    try {
      sessionStorage.setItem(
        'ytFixerReloads',
        String(s.retries)
      );

      sessionStorage.setItem(
        'ytFixerLastTime',
        String(now)
      );
    } catch {}

    s.retryUntil = now + CFG.retryGap;

    resetMonitor();
    updateUI();

    status(
      `${reason}; recovery ${s.retries}/${max}`
    );

    const id = api(
      p,
      'getVideoData'
    )?.video_id;

    if (
      !id ||
      typeof p?.loadVideoById !== 'function'
    ) {
      location.reload();
      return;
    }

    const resumeAt = live
      ? undefined
      : Math.max(
          0,
          (s.video?.currentTime || 0) - 1
        );

    api(p, 'stopVideo');

    later(() => {
      if (s.page !== currentPage()) return;

      if (live) {
        api(p, 'loadVideoById', id);
      } else {
        api(
          p,
          'loadVideoById',
          id,
          resumeAt
        );
      }

      later(ensurePlay, 700);

    }, live && s.retries === max ? 5000 : 100);
  }

  // Lightweight playback monitoring.
  function tick() {
    if (s.stopped) return;

    if (s.page !== currentPage()) {
      navigate();
    }

    if (!onVideo()) return;

    attachVideo();
    updateUI();

    const p = player();

    installHooks(p);
    enforceQuality(p);

    if (
      preferred() === 'Disable' ||
      document.hidden ||
      Date.now() < s.graceUntil
    ) return;

    const error = q('.ytp-error');

    if (error?.getClientRects().length) {
      recover('YouTube error overlay');
      return;
    }

    const v = s.video;
    if (!v) return;

    const ps = playerState(p);
    const time = v.currentTime || 0;
    const duration = api(p, 'getDuration') || 0;

    if (
      v.ended ||
      v.seeking ||
      ps === 0 ||
      ps === 2 ||
      (v.paused && ps !== 3) ||
      (duration > 0 && time >= duration - 3)
    ) {
      resetMonitor();
      return;
    }

    const now = Date.now();

    const stuck =
      ps === 1 &&
      !v.paused &&
      s.lastTime >= 0 &&
      Math.abs(time - s.lastTime) < 0.05;

    s.stallSince = stuck
      ? s.stallSince || now
      : 0;

    s.lastTime = time;

    const buffering =
      ps === 3 ||
      (!v.paused && v.readyState < 3);

    s.bufferingSince = buffering
      ? s.bufferingSince || now
      : 0;

    let buffer = NaN;

    const bh = parseFloat(
      api(p, 'getVideoStats')?.bh
    );

    if (Number.isFinite(bh) && bh >= 0) {
      buffer = bh;
    } else {
      for (let i = 0; i < v.buffered.length; i++) {
        if (
          v.buffered.start(i) <= time &&
          v.buffered.end(i) >= time
        ) {
          buffer = Math.max(
            0,
            v.buffered.end(i) - time
          );

          break;
        }
      }
    }

    const unhealthy = buffering || stuck;

    s.emptySince =
      unhealthy &&
      Number.isFinite(buffer) &&
      buffer <= 0.05
        ? s.emptySince || now
        : 0;

    s.criticalSince =
      unhealthy &&
      !isLive(p) &&
      Number.isFinite(buffer) &&
      buffer < 0.25
        ? s.criticalSince || now
        : 0;

    if (
      s.stallSince &&
      now - s.stallSince >= CFG.stall
    ) {
      recover('Playback stalled');

    } else if (
      s.emptySince &&
      now - s.emptySince >= CFG.empty
    ) {
      recover('Buffer empty');

    } else if (
      s.criticalSince &&
      now - s.criticalSince >= CFG.critical
    ) {
      recover('Critical buffer');

    } else if (
      s.bufferingSince &&
      now - s.bufferingSince >= CFG.buffering
    ) {
      recover('Endless buffering');
    }
  }

  function navStart() {
    s.graceUntil = Date.now() + 30000;
    resetMonitor();
  }

  function navFinish() {
    clearTimeout(s.navTimeout);

    s.navTimeout = setTimeout(
      navigate,
      100
    );
  }

  function stop() {
    s.stopped = true;

    clearInterval(s.interval);
    clearTimeout(s.navTimeout);

    clearLater();
    detachVideo();
    restoreHooks();

    window.removeEventListener(
      'yt-navigate-start',
      navStart
    );

    window.removeEventListener(
      'yt-navigate-finish',
      navFinish
    );

    window.removeEventListener(
      'yt-page-data-updated',
      navFinish
    );

    window.removeEventListener(
      'popstate',
      navFinish
    );

    delete window.__ytPlaybackFixerV5Stop;
  }

  window.addEventListener(
    'yt-navigate-start',
    navStart
  );

  window.addEventListener(
    'yt-navigate-finish',
    navFinish
  );

  window.addEventListener(
    'yt-page-data-updated',
    navFinish
  );

  window.addEventListener(
    'popstate',
    navFinish
  );

  window.__ytPlaybackFixerV5Stop = stop;

  root.dataset.ytPlaybackFixerRunning =
    'page-sandbox-v5';

  hooksCount();
  status('engine running');

  navigate();
  tick();

  s.interval = setInterval(
    tick,
    1000
  );
}

// IMPORTANT:
// Registered actor: YTPlaybackFixerV5
// Exported class:   YTPlaybackFixerV5Child
export class YTPlaybackFixerV5Child extends JSWindowActorChild {

  actorCreated() {
    this.start();
  }

  handleEvent(event) {
    if (
      event.type === 'DOMContentLoaded' &&
      event.target === this.document
    ) {
      this.start();
    }
  }

  receiveMessage(message) {
    if (message.name === 'Start') {
      this.start();
    }
  }

  start() {
    if (
      this.started ||
      !this.document?.documentElement
    ) return;

    if (
      this.document.location?.hostname !==
      'www.youtube.com'
    ) return;

    this.started = true;

    const root = this.document.documentElement;

    // Set before sandbox initialization, so failures
    // can be distinguished from missing actor loading.
    root.dataset.ytPlaybackFixerRunning =
      'actor-started-v5';

    root.dataset.ytPlaybackFixerStatus =
      'creating sandbox';

    try {
      const win = this.contentWindow;

      this.sandbox = Cu.Sandbox(win, {
        sandboxName:
          'YTPlaybackFixer V5 site-origin sandbox',

        sandboxPrototype: win,
        sameZoneAs: win,
        wantXrays: false
      });

      Cu.evalInSandbox(
        '(' + runPlaybackEngine.toString() + ')();',
        this.sandbox
      );

    } catch (error) {
      root.dataset.ytPlaybackFixerRunning =
        'FAILED';

      root.dataset.ytPlaybackFixerStatus =
        String(error);

      console.error(
        '[YTPlaybackFixer] Sandbox failed:',
        error
      );
    }
  }

  didDestroy() {
    if (!this.sandbox) return;

    try {
      Cu.evalInSandbox(
        'window.__ytPlaybackFixerV5Stop?.()',
        this.sandbox
      );
    } catch {}

    try {
      Cu.nukeSandbox(this.sandbox);
    } catch {}

    this.sandbox = null;
    this.started = false;
  }
}
