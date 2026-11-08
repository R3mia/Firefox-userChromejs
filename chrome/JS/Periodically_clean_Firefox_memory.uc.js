// ==UserScript==
// @name           Smart Firefox Memory Cleaner
// @description    Periodic cleanup, customizable toolbar menu and tab/process memory monitor
// @version        2.6
// @include        main
// ==/UserScript==

(() => {
  'use strict';

  const VERSION = '2.6';

  if (!/^chrome:\/\/browser\/content\/browser\.(xhtml|xul)([?#]|$)/
    .test(document.documentURI)) return;

  if (window.SmartMemoryCleaner?.version === VERSION &&
      window.SmartMemoryCleaner.ready) return;

  window.SmartMemoryCleaner?.stop?.();

  const S = globalThis.Services || ChromeUtils.importESModule(
    'resource://gre/modules/Services.sys.mjs'
  ).Services;

  const { classes: Cc, interfaces: Ci } = Components;

  const CONFIG = Object.freeze({
    AUTO_INTERVAL_MS:    15 * 60 * 1000,
    STARTUP_GRACE_MS:     2 * 60 * 1000,
    CHECK_INTERVAL_MS:       30 * 1000,
    ONLY_WHEN_IDLE:      false,
    SYSTEM_IDLE_MS:          30 * 1000,
    SKIP_MEDIA:          false,
    SAMPLE_AFTER_MS:         2500,
    CALLBACK_TIMEOUT_MS:  2 * 60 * 1000,
    SHOW_TAB_MENU:       true,
    DEBUG:              false,
    MONITOR_REFRESH_MS:  5000
  });

  const PREF = {
    enabled: 'userChromeJS.smartMemoryCleaner.enabled',
    state: 'userChromeJS.smartMemoryCleaner.history.v21',
    lock: 'userChromeJS.smartMemoryCleaner.lock.v21',
    interval: 'userChromeJS.smartMemoryCleaner.intervalMinutes',
    idleOnly: 'userChromeJS.smartMemoryCleaner.idleOnly',
    skipMedia: 'userChromeJS.smartMemoryCleaner.skipMedia',
    background: 'userChromeJS.smartMemoryCleaner.monitorBackground',
    toolbarRevision: 'userChromeJS.smartMemoryCleaner.toolbarRevision'
  };

  const MENU_ID = 'smart-memory-cleaner-menu';
  const BUTTON_ID = 'smart-memory-cleaner-button';
  const TOOLBAR_POPUP_ID = 'smart-memory-cleaner-toolbar-popup';
  const TOOLBAR_REVISION = 26;
  const PANEL_ID = 'smart-memory-monitor-panel';
  const STYLE_ID = 'smart-memory-cleaner-style';
  const HTML_NS = 'http://www.w3.org/1999/xhtml';

  const ICON_URL = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#7c8fa8" stroke-width="1.4"><rect x="3.5" y="3.5" width="9" height="9" rx="1.5"/><path d="M6 0v3m4-3v3M6 13v3m4-3v3M0 6h3m-3 4h3m10-4h3m-3 4h3M6 6h4v4H6z"/></svg>'
  );

  const OPTIONS = {
    idleOnly: CONFIG.ONLY_WHEN_IDLE,
    skipMedia: CONFIG.SKIP_MEDIA,
    background: false
  };

  const NAME = '[SmartMemoryCleaner]';
  const WINDOW_ID = S.uuid.generateUUID().toString();
  const LOCK_STALE_MS = CONFIG.CALLBACK_TIMEOUT_MS + 30000;
  const timers = new Set();

  let initialized = false;
  let disposed = false;
  let running = false;
  let observingStartup = false;
  let startedAt = 0;
  let intervalId = null;
  let memoryManager = null;
  let idleService = null;
  let lastDecision = 'Waiting for browser startup';

  let customizableUI = null;
  let ownsWidget = false;
  let lastToolbarError = '';

  let monitor = null;
  let procRequest = null;

  function log(...args) {
    console.log(NAME, ...args);
  }

  function later(callback, delay) {
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (!disposed) callback();
    }, delay);

    timers.add(id);
    return id;
  }

  function cancel(id) {
    window.clearTimeout(id);
    timers.delete(id);
  }

  function enabled() {
    return S.prefs.getBoolPref(PREF.enabled, true);
  }

  function option(key) {
    return S.prefs.getBoolPref(PREF[key], OPTIONS[key]);
  }

  function intervalMS() {
    const minutes = S.prefs.getIntPref(
      PREF.interval,
      CONFIG.AUTO_INTERVAL_MS / 60000
    );

    return [5, 10, 15, 30, 60].includes(minutes)
      ? minutes * 60000
      : CONFIG.AUTO_INTERVAL_MS;
  }

  function setIntervalMinutes(minutes) {
    if (disposed || ![5, 10, 15, 30, 60].includes(minutes)) {
      return false;
    }

    S.prefs.setIntPref(PREF.interval, minutes);
    automaticCheck();

    return true;
  }

  function setOption(key, value) {
    if (!Object.hasOwn(OPTIONS, key) || disposed) {
      return false;
    }

    S.prefs.setBoolPref(PREF[key], Boolean(value));

    if (key === 'background') {
      refreshMonitor();
    } else {
      automaticCheck();
    }

    return true;
  }

  function setEnabled(value) {
    if (disposed) return false;

    S.prefs.setBoolPref(PREF.enabled, Boolean(value));

    log('Automatic cleanup:', value ? 'enabled' : 'disabled');
    automaticCheck();

    return enabled();
  }

  function freshState() {
    return {
      lastAttempt: 0,
      lastSuccess: 0,
      lastBeforeMB: null,
      lastAfterMB: null,
      lastDeltaMB: null,
      lastReason: 'Never run',
      lastError: '',
      totalAttempts: 0,
      automaticAttempts: 0,
      manualAttempts: 0
    };
  }

  function readState() {
    const state = freshState();

    try {
      const saved = JSON.parse(
        S.prefs.getStringPref(PREF.state, '{}')
      );

      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        for (const key of Object.keys(state)) {
          if (Object.hasOwn(saved, key)) {
            state[key] = saved[key];
          }
        }
      }
    } catch {}

    for (const key of [
      'lastAttempt',
      'lastSuccess',
      'totalAttempts',
      'automaticAttempts',
      'manualAttempts'
    ]) {
      const value = Number(state[key]);

      state[key] = Number.isFinite(value) && value >= 0
        ? value
        : 0;
    }

    for (const key of ['lastAttempt', 'lastSuccess']) {
      if (state[key] > Date.now()) {
        state[key] = 0;
      }
    }

    return state;
  }

  function saveState(state) {
    S.prefs.setStringPref(PREF.state, JSON.stringify(state));
  }

  function manager() {
    return memoryManager ||= Cc[
      '@mozilla.org/memory-reporter-manager;1'
    ].getService(Ci.nsIMemoryReporterManager);
  }

  function parentRSS() {
    try {
      const bytes = Number(manager().residentFast);

      return Number.isFinite(bytes) && bytes > 0
        ? Math.round(bytes / 1048576)
        : null;
    } catch {
      return null;
    }
  }

  function idleMS() {
    try {
      idleService ||= Cc[
        '@mozilla.org/widget/useridleservice;1'
      ].getService(Ci.nsIUserIdleService);

      const value = Number(idleService.idleTime);

      return Number.isFinite(value) && value >= 0
        ? value
        : null;
    } catch {
      idleService = null;
      return null;
    }
  }

  function browserWindows() {
    const result = [];
    const windows = S.wm.getEnumerator('navigator:browser');

    while (windows.hasMoreElements()) {
      const win = windows.getNext();

      if (win && !win.closed) {
        result.push(win);
      }
    }

    return result;
  }

  function isCoordinator() {
    return browserWindows().find(win =>
      win.SmartMemoryCleaner?.version === VERSION &&
      win.SmartMemoryCleaner.ready
    ) === window;
  }

  function mediaActive() {
    return browserWindows().some(win => {
      for (const tab of win.gBrowser?.tabs || []) {
        if (
          tab.soundPlaying ||
          tab.hasPictureInPicture ||
          tab.hasAttribute('soundplaying') ||
          tab.hasAttribute('pictureinpicture') ||
          tab.hasAttribute('sharing') ||
          tab.sharingState?.camera ||
          tab.sharingState?.microphone ||
          tab.sharingState?.screen
        ) {
          return true;
        }
      }

      return false;
    });
  }

  function getLock() {
    try {
      const lock = JSON.parse(
        S.prefs.getStringPref(PREF.lock, '{}')
      );

      return lock && typeof lock === 'object'
        ? lock
        : {};
    } catch {
      return {};
    }
  }

  function lockActive(now = Date.now()) {
    const lock = getLock();

    return Number.isFinite(lock.time) &&
      lock.time > 0 &&
      now >= lock.time &&
      now - lock.time < LOCK_STALE_MS;
  }

  function acquireLock() {
    const now = Date.now();

    if (lockActive(now)) return null;

    const token = `${WINDOW_ID}:${now}`;

    S.prefs.setStringPref(
      PREF.lock,
      JSON.stringify({ token, time: now })
    );

    return getLock().token === token ? token : null;
  }

  function releaseLock(token) {
    if (getLock().token === token) {
      S.prefs.clearUserPref(PREF.lock);
    }
  }

  function nextAutomaticAt(state = readState()) {
    return Math.max(
      startedAt + CONFIG.STARTUP_GRACE_MS,
      state.lastAttempt
        ? state.lastAttempt + intervalMS()
        : 0
    );
  }

  function eligibility() {
    const now = Date.now();
    const state = readState();
    const dueAt = nextAutomaticAt(state);

    let reason = 'Ready';

    if (disposed) {
      reason = 'Stopped';
    } else if (!initialized) {
      reason = 'Waiting for browser startup';
    } else if (!enabled()) {
      reason = 'Automatic mode disabled';
    } else if (!isCoordinator()) {
      reason = 'Scheduled by another window';
    } else if (running || lockActive(now)) {
      reason = 'Cleanup already running';
    } else if (now < startedAt + CONFIG.STARTUP_GRACE_MS) {
      reason = 'Startup grace period';
    } else if (now < dueAt) {
      reason = 'Waiting for next scheduled cleanup';
    } else if (option('idleOnly')) {
      const idle = idleMS();

      if (idle === null) {
        reason = 'Idle service unavailable';
      } else if (idle < CONFIG.SYSTEM_IDLE_MS) {
        reason = 'Waiting for system idle';
      }
    }

    if (
      reason === 'Ready' &&
      option('skipMedia') &&
      mediaActive()
    ) {
      reason = 'Waiting for audio / PiP / sharing to stop';
    }

    return {
      ready: reason === 'Ready',
      reason,
      dueAt,
      state
    };
  }

  function formatTime(value) {
    return value
      ? new Date(value).toLocaleString()
      : 'Never';
  }

  function inspect() {
    const e = eligibility();

    return {
      version: VERSION,
      automaticEnabled: enabled(),
      coordinator: initialized && !disposed && isCoordinator(),
      cleanupRunning: running || lockActive(),
      decision: e.reason,
      intervalMinutes: intervalMS() / 60000,

      nextScheduledCleanup:
        !initialized || disposed
          ? 'Inactive'
          : !enabled()
            ? 'Disabled'
            : e.dueAt <= Date.now()
              ? 'Due; see decision above'
              : formatTime(e.dueAt),

      secondsUntilDue: Math.max(
        0,
        Math.ceil((e.dueAt - Date.now()) / 1000)
      ),

      onlyWhenIdle: option('idleOnly'),
      skipMedia: option('skipMedia'),
      monitorOpen: Boolean(monitor),

      ...toolbarState(),

      lastAttempt: formatTime(e.state.lastAttempt),
      lastParentCompletion: formatTime(e.state.lastSuccess),
      automaticAttempts: e.state.automaticAttempts,
      manualAttempts: e.state.manualAttempts,
      parentRSS_MB: parentRSS() ?? 'Unavailable',
      lastParentRSSChange_MB: e.state.lastDeltaMB,
      lastReason: e.state.lastReason,
      lastError: e.state.lastError || 'None',
      lastAutoCheck: lastDecision
    };
  }

  function showStatus() {
    const status = inspect();

    console.table(status);

    S.prompt.alert(
      window,
      `Memory Cleaner ${VERSION}`,
      Object.entries(status)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n') +
      '\n\nRSS measurements cover the parent process only.\n' +
      'Child-process completion is not tracked; RAM reduction is not guaranteed.'
    );
  }

  function runCleanup(reason = 'Manual request', automatic = false) {
    if (disposed || !initialized || running) {
      return false;
    }

    const token = acquireLock();
    if (!token) return false;

    running = true;

    const before = parentRSS();
    const state = readState();

    state.lastAttempt = Date.now();
    state.lastReason = reason;
    state.lastError = '';
    state.totalAttempts += 1;
    state[automatic ? 'automaticAttempts' : 'manualAttempts'] += 1;

    saveState(state);

    let finished = false;
    let settleTimer = null;
    let timeoutTimer = null;

    function finish(success, error = '') {
      if (finished || disposed) return;

      finished = true;

      cancel(settleTimer);
      cancel(timeoutTimer);

      const updated = readState();

      if (success) {
        const after = parentRSS();

        updated.lastSuccess = Date.now();
        updated.lastBeforeMB = before;
        updated.lastAfterMB = after;

        updated.lastDeltaMB =
          before !== null && after !== null
            ? before - after
            : null;

        updated.lastError = '';

        log(
          'Parent minimization finished; children were requested separately.',
          '| Parent RSS:',
          before ?? '?',
          '->',
          after ?? '?',
          'MB'
        );
      } else {
        updated.lastError = String(error || 'Unknown error');

        console.warn(
          NAME,
          'Cleanup failed:',
          updated.lastError
        );
      }

      try {
        saveState(updated);
      } finally {
        running = false;
        releaseLock(token);
      }
    }

    timeoutTimer = later(
      () => finish(false, 'Parent callback timed out'),
      CONFIG.CALLBACK_TIMEOUT_MS
    );

    try {
      const service = manager();

      S.obs.notifyObservers(null, 'child-mmu-request');

      service.minimizeMemoryUsage(() => {
        if (!finished && !disposed && settleTimer === null) {
          settleTimer = later(
            () => finish(true),
            CONFIG.SAMPLE_AFTER_MS
          );
        }
      });

      log('Started:', reason);
      return true;
    } catch (error) {
      finish(false, error);
      return false;
    }
  }

  function automaticCheck() {
    if (disposed) return;

    try {
      const e = eligibility();

      if (CONFIG.DEBUG && e.reason !== lastDecision) {
        log('Auto:', e.reason);
      }

      lastDecision = e.reason;

      if (e.ready) {
        runCleanup('Automatic periodic cleanup', true);
      }
    } catch (error) {
      lastDecision = `Auto-check error: ${error}`;
      console.error(NAME, lastDecision);
    }
  }

  function resetStats() {
    if (disposed || running || lockActive()) {
      return false;
    }

    saveState(freshState());
    log('Cleanup statistics reset.');

    return true;
  }

  function xul(doc, tag, attributes = {}) {
    const node = doc.createXULElement(tag);

    for (const [key, value] of Object.entries(attributes)) {
      node.setAttribute(key, value);
    }

    return node;
  }

  function setXULBoolean(node, attribute, value) {
    if (value) {
      node.setAttribute(attribute, 'true');
    } else {
      node.removeAttribute(attribute);
    }
  }

  function html(tag, className = '', text = '') {
    const node = document.createElementNS(HTML_NS, tag);

    node.className = className;
    node.textContent = text;

    return node;
  }

  function performAction(action, value) {
    if (disposed || !initialized) return;

    switch (action) {
      case 'clean':
        return runCleanup('Manual menu request');

      case 'monitor':
        return toggleMonitor();

      case 'refresh':
        return refreshMonitor();

      case 'auto':
        return setEnabled(!enabled());

      case 'interval':
        return setIntervalMinutes(Number(value));

      case 'idleOnly':
      case 'skipMedia':
      case 'background':
        return setOption(action, !option(action));

      case 'status':
        return showStatus();

      case 'processes':
        return window.openTrustedLinkIn('about:processes', 'tab');

      case 'memory':
        return window.openTrustedLinkIn('about:memory', 'tab');

      case 'showButton':
        if (!ensureToolbar(true)) {
          showStatus();
        }
        return;

      case 'palette':
        return showInCustomizeToolbar();

      case 'customize':
        return window.gCustomizeMode?.enter();

      case 'reset':
        return resetStats();
    }
  }

  function buildPopup(doc) {
    const owner = doc.defaultView;

    const popup = xul(doc, 'menupopup', {
      position: 'after_end'
    });

    function item(label, action, type = '', parent = popup, value = '') {
      const node = xul(doc, 'menuitem', {
        label,
        'data-action': action,
        'data-value': value
      });

      if (type) {
        node.setAttribute('type', type);
        node.setAttribute('autocheck', 'false');
      }

      parent.appendChild(node);
      return node;
    }

    item('Minimize memory now', 'clean');
    item('Tab Memory Monitor (Ctrl+Alt+M)', 'monitor', 'checkbox');
    item('Refresh memory monitor', 'refresh');

    popup.appendChild(xul(doc, 'menuseparator'));

    item('Automatic cleanup', 'auto', 'checkbox');

    const intervals = xul(doc, 'menu', {
      label: 'Cleanup interval'
    });

    const intervalPopup = xul(doc, 'menupopup');

    for (const minutes of [5, 10, 15, 30, 60]) {
      item(
        `${minutes} minutes`,
        'interval',
        'radio',
        intervalPopup,
        String(minutes)
      );
    }

    intervals.appendChild(intervalPopup);
    popup.appendChild(intervals);

    item('Only clean when idle', 'idleOnly', 'checkbox');
    item('Pause cleanup during audio / PiP / sharing', 'skipMedia', 'checkbox');
    item('Monitor: include processes without local tabs', 'background', 'checkbox');

    const schedule = xul(doc, 'menuitem', {
      disabled: 'true',
      label: 'Next: ...'
    });

    popup.appendChild(schedule);
    popup.appendChild(xul(doc, 'menuseparator'));

    item('Show cleanup status', 'status');
    item('Open Firefox Process Manager', 'processes');
    item('Open about:memory', 'memory');
    item('Show toolbar button', 'showButton');
    item('Show in Customize Toolbar...', 'palette');
    item('Customize Toolbar...', 'customize');
    item('Reset cleanup statistics', 'reset');

    popup.addEventListener('command', event => {
      const node = event.target.closest?.('menuitem[data-action]');

      if (!node || !popup.contains(node)) return;

      owner.SmartMemoryCleaner?.performAction(
        node.getAttribute('data-action'),
        node.getAttribute('data-value')
      );

      event.stopPropagation();
    });

    popup.addEventListener('popupshowing', event => {
      if (event.target !== popup) return;

      const api = owner.SmartMemoryCleaner;
      const status = api?.ready ? api.status() : null;

      for (const node of popup.querySelectorAll('menuitem[data-action]')) {
        const action = node.getAttribute('data-action');

        const checks = status
          ? {
              monitor: status.monitorOpen,
              auto: status.automaticEnabled,
              idleOnly: status.onlyWhenIdle,
              skipMedia: status.skipMedia,
              background: api.option('background'),

              interval:
                Number(node.getAttribute('data-value')) ===
                status.intervalMinutes
            }
          : {};

        if (Object.hasOwn(checks, action)) {
          setXULBoolean(node, 'checked', checks[action]);
        }

        const disabled =
          !status ||
          (action === 'clean' && status.cleanupRunning) ||
          (action === 'refresh' && !status.monitorOpen) ||
          (action === 'reset' && status.cleanupRunning);

        setXULBoolean(node, 'disabled', disabled);
      }

      schedule.setAttribute(
        'label',
        status
          ? `Next: ${status.nextScheduledCleanup}`
          : 'Cleaner not ready'
      );
    });

    return popup;
  }

  function addMenu() {
    if (!CONFIG.SHOW_TAB_MENU || disposed) return;

    const context = document.getElementById('tabContextMenu');

    if (!context || document.getElementById(MENU_ID)) {
      return;
    }

    const menu = xul(document, 'menu', {
      id: MENU_ID,
      label: 'Memory Cleaner'
    });

    menu.appendChild(buildPopup(document));
    context.appendChild(menu);
  }

  function decorateToolbarButton(button) {
    button.setAttribute('label', 'Memory Cleaner');

    button.setAttribute(
      'tooltiptext',
      'Memory Cleaner: cleanup and Tab Memory Monitor'
    );

    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('removable', 'true');
    button.setAttribute('image', ICON_URL);

    button.setAttribute(
      'style',
      `list-style-image:url("${ICON_URL}") !important;`
    );

    setXULBoolean(button, 'disabled', false);
    setXULBoolean(button, 'hidden', false);
    setXULBoolean(button, 'collapsed', false);
  }

  function paletteContainsButton() {
    const palette = window.gNavToolbox?.palette;

    if (
      !palette ||
      typeof customizableUI?.getUnusedWidgets !== 'function'
    ) {
      return null;
    }

    return customizableUI.getUnusedWidgets(palette).some(
      widget => widget.id === BUTTON_ID
    );
  }

  function toolbarState() {
    try {
      const registered =
        customizableUI?.getWidget(BUTTON_ID)?.provider ===
        (customizableUI?.PROVIDER_API || 'api');

      return {
        toolbarRegistered: registered,

        toolbarLocation: registered
          ? customizableUI.getPlacementOfWidget(BUTTON_ID)?.area ||
            'Customization palette'
          : 'Not registered',

        toolbarInPalette: registered
          ? paletteContainsButton() ?? 'Unknown'
          : false,

        toolbarError: lastToolbarError || 'None'
      };
    } catch (error) {
      return {
        toolbarRegistered: false,
        toolbarLocation: 'Unavailable',
        toolbarError: String(error)
      };
    }
  }

  function loadCustomizableUI() {
    let candidate;

    try {
      candidate = ChromeUtils.importESModule(
        'resource:///modules/CustomizableUI.sys.mjs'
      ).CustomizableUI;
    } catch (error) {
      candidate =
        globalThis.CustomizableUI?.CustomizableUI ||
        globalThis.CustomizableUI;

      if (!candidate) throw error;
    }

    if (
      typeof candidate?.createWidget !== 'function' ||
      typeof candidate?.getWidget !== 'function'
    ) {
      throw new Error('CustomizableUI is not ready.');
    }

    return candidate;
  }

  function ensureToolbar(place = false) {
    if (disposed) return false;

    try {
      customizableUI ||= loadCustomizableUI();

      const provider = customizableUI.PROVIDER_API || 'api';
      let widget = customizableUI.getWidget(BUTTON_ID);

      if (
        widget?.provider === provider &&
        widget.type === 'custom'
      ) {
        customizableUI.destroyWidget(BUTTON_ID);
        widget = null;
      }

      if (widget?.provider !== provider) {
        customizableUI.createWidget({
          id: BUTTON_ID,
          type: 'button',
          label: 'Memory Cleaner',
          tooltiptext: 'Memory Cleaner',
          removable: true,
          showInPrivateBrowsing: true,

          // No defaultArea: leave the widget in Customize Toolbar.
          onCreated: decorateToolbarButton,

          onCommand(event) {
            const doc =
              event.target?.ownerDocument ||
              event.currentTarget?.ownerDocument;

            doc?.defaultView.SmartMemoryCleaner
              ?.openToolbarPopup(event);
          }
        });

        ownsWidget = true;
      }

      widget = customizableUI.getWidget(BUTTON_ID);

      if (widget?.provider !== provider) {
        throw new Error('Toolbar widget was not registered.');
      }

      // Move earlier automatically placed versions into the palette once.
      // Later checks preserve the user's chosen placement.
      if (
        S.prefs.getIntPref(PREF.toolbarRevision, 0) <
        TOOLBAR_REVISION
      ) {
        customizableUI.removeWidgetFromArea(BUTTON_ID);

        if (customizableUI.getPlacementOfWidget(BUTTON_ID)) {
          throw new Error(
            'The widget is still assigned to a toolbar.'
          );
        }

        if (paletteContainsButton() === false) {
          throw new Error(
            'Registered widget is missing from the customization palette.'
          );
        }

        S.prefs.setIntPref(
          PREF.toolbarRevision,
          TOOLBAR_REVISION
        );
      }

      // Explicit menu action: place the button on the navigation toolbar.
      if (place) {
        customizableUI.addWidgetToArea(
          BUTTON_ID,
          customizableUI.AREA_NAVBAR || 'nav-bar'
        );
      }

      const button =
        document.getElementById(BUTTON_ID) ||
        widget.forWindow?.(window)?.node;

      if (button) {
        decorateToolbarButton(button);
      }

      lastToolbarError = '';
      return true;
    } catch (error) {
      const message = String(error);

      if (message !== lastToolbarError) {
        console.warn(NAME, 'Toolbar:', message);
      }

      lastToolbarError = message;
      return false;
    }
  }

  async function showInCustomizeToolbar() {
    if (!ensureToolbar()) {
      showStatus();
      return;
    }

    try {
      closeToolbarPopup();

      customizableUI.removeWidgetFromArea(BUTTON_ID);

      if (paletteContainsButton() === false) {
        throw new Error(
          'Memory Cleaner is not listed among unused widgets.'
        );
      }

      await window.gCustomizeMode?.enter();
    } catch (error) {
      lastToolbarError = String(error);
      showStatus();
    }
  }

  function openToolbarPopup(event) {
    if (disposed || !initialized) return;

    later(() => {
      const button = document.getElementById(BUTTON_ID);
      if (!button) return;

      let popup = document.getElementById(TOOLBAR_POPUP_ID);

      if (!popup) {
        popup = buildPopup(document);
        popup.id = TOOLBAR_POPUP_ID;

        for (const [topic, open] of [
          ['popupshown', true],
          ['popuphidden', false]
        ]) {
          popup.addEventListener(topic, () => {
            const currentButton = document.getElementById(BUTTON_ID);

            if (currentButton) {
              setXULBoolean(currentButton, 'open', open);
            }
          });
        }

        (
          document.getElementById('mainPopupSet') ||
          document.documentElement
        ).appendChild(popup);
      }

      if (
        popup.state === 'open' ||
        popup.state === 'showing'
      ) {
        popup.hidePopup();
      } else {
        const anchor = button.hasAttribute('overflowedItem')
          ? customizableUI
              ?.getWidget(BUTTON_ID)
              ?.forWindow?.(window)
              ?.anchor || button
          : button;

        popup.openPopup(
          anchor,
          'after_end',
          0,
          0,
          false,
          false,
          event
        );
      }
    }, 0);
  }

  function closeToolbarPopup() {
    const popup = document.getElementById(TOOLBAR_POPUP_ID);

    if (popup) {
      popup.hidePopup();
      popup.remove();
    }
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = html('style');
    style.id = STYLE_ID;

    style.textContent = `
      #${PANEL_ID} {
        --panel-padding: 0px;
        --panel-border-radius: 12px;
      }

      #${PANEL_ID} .smc-box {
        color: var(--arrowpanel-color, CanvasText);
        background: var(--arrowpanel-background, Canvas);
        font: menu;
        font-size: 12px;
        box-sizing: border-box;
        overflow: hidden;
        border-radius: 10px;
      }

      #${PANEL_ID} .smc-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        border-bottom: 1px solid var(--arrowpanel-border-color, GrayText);
        cursor: move;
        touch-action: none;
        user-select: none;
      }

      #${PANEL_ID} .smc-title {
        flex: 1;
        font-weight: 650;
        font-size: 13px;
      }

      #${PANEL_ID} button {
        appearance: none;
        font: inherit;
        color: inherit;
        background: var(
          --button-bgcolor,
          color-mix(in srgb, currentColor 8%, transparent)
        );
        border: 0;
        border-radius: 6px;
        padding: 6px 9px;
        cursor: pointer;
      }

      #${PANEL_ID} button:hover {
        background: color-mix(in srgb, currentColor 15%, transparent);
      }

      #${PANEL_ID} button:focus-visible {
        outline: 2px solid AccentColor;
        outline-offset: -2px;
      }

      #${PANEL_ID} .smc-meta,
      #${PANEL_ID} .smc-foot {
        padding: 9px 12px;
        line-height: 1.5;
        opacity: .8;
        overflow-wrap: anywhere;
      }

      #${PANEL_ID} .smc-list {
        overflow: auto;
        padding: 0 8px 8px;
      }

      #${PANEL_ID} details {
        margin-top: 6px;
        border: 1px solid var(--arrowpanel-border-color, GrayText);
        border-radius: 8px;
        overflow: hidden;
      }

      #${PANEL_ID} summary {
        list-style: none;
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 10px;
        cursor: pointer;
        user-select: none;
      }

      #${PANEL_ID} summary::before {
        content: '▸';
        opacity: .7;
      }

      #${PANEL_ID} details[open] > summary::before {
        content: '▾';
      }

      #${PANEL_ID} .smc-process {
        flex: 1;
        min-width: 0;
        overflow-wrap: anywhere;
      }

      #${PANEL_ID} .smc-bytes {
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }

      #${PANEL_ID} .smc-tab {
        display: flex;
        gap: 8px;
        text-align: start;
        width: 100%;
        box-sizing: border-box;
        background: transparent;
        border-radius: 0;
        padding: 8px 12px 8px 28px;
      }

      #${PANEL_ID} .smc-tab-text {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      #${PANEL_ID} .smc-tab[data-selected="true"] {
        color: AccentColor;
      }

      #${PANEL_ID} .smc-muted {
        opacity: .65;
        font-size: 11px;
      }

      #${PANEL_ID} .smc-empty {
        padding: 12px;
        opacity: .7;
      }

      #${PANEL_ID} .smc-foot {
        border-top: 1px solid var(--arrowpanel-border-color, GrayText);
        font-size: 11px;
      }
    `;

    document.documentElement.appendChild(style);
  }

  function formatBytes(bytes) {
    if (bytes === null || !Number.isFinite(bytes)) {
      return 'Unavailable';
    }

    return bytes >= 1073741824
      ? `${(bytes / 1073741824).toFixed(2)} GiB`
      : `${(bytes / 1048576).toFixed(1)} MiB`;
  }

  function mapProcesses(snapshot) {
    const groups = new Map();
    const outerPids = new Map();

    for (const proc of [
      snapshot,
      ...(snapshot.children || [])
    ]) {
      const pid = Number(proc.pid);

      if (!Number.isFinite(pid) || pid <= 0) {
        continue;
      }

      const memory = Number(proc.memory);

      groups.set(pid, {
        key: String(pid),
        pid,
        type: String(proc.type || 'unknown'),

        bytes:
          proc.memory != null &&
          Number.isFinite(memory) &&
          memory >= 0
            ? memory
            : null,

        tabs: []
      });

      for (const info of proc.windows || []) {
        if (info.outerWindowId) {
          outerPids.set(
            String(info.outerWindowId),
            pid
          );
        }
      }
    }

    const unmapped = {
      key: 'unmapped',
      pid: null,
      type: 'Unloaded / not mapped',
      bytes: null,
      tabs: []
    };

    let tabCount = 0;

    for (const tab of window.gBrowser?.tabs || []) {
      if (tab.closing) continue;

      tabCount++;

      const memberships = new Map();

      const title =
        tab.label ||
        tab.getAttribute('label') ||
        'Untitled';

      const attach = (value, top) => {
        const pid = Number(value) === -1
          ? Number(snapshot.pid)
          : Number(value);

        if (groups.has(pid)) {
          memberships.set(
            pid,
            Boolean(top || memberships.get(pid))
          );
        }
      };

      try {
        if (!tab.hasAttribute('pending')) {
          const browser = tab.linkedBrowser;

          if (browser && browser.isConnected !== false) {
            const root = browser.browsingContext;
            const stack = root ? [root] : [];

            while (stack.length) {
              const context = stack.pop();

              attach(
                context.currentWindowGlobal?.osPid,
                context === root
              );

              for (const child of context.children || []) {
                stack.push(child);
              }
            }

            if (![...memberships.values()].includes(true)) {
              attach(
                outerPids.get(String(browser.outerWindowID)),
                true
              );
            }
          }
        }
      } catch {}

      if (!memberships.size) {
        unmapped.tabs.push({
          tab,
          title,
          subframe: false
        });
      }

      for (const [pid, top] of memberships) {
        groups.get(pid).tabs.push({
          tab,
          title,
          subframe: !top
        });
      }
    }

    const processes = [...groups.values()];

    const reported = processes.filter(
      proc => proc.bytes !== null
    );

    const list = processes.filter(
      proc => option('background') || proc.tabs.length
    );

    list.sort((a, b) =>
      (b.bytes ?? -1) - (a.bytes ?? -1) ||
      a.pid - b.pid
    );

    if (unmapped.tabs.length) {
      list.push(unmapped);
    }

    return {
      groups: list,
      tabCount,
      processCount: processes.length,
      reportedCount: reported.length,

      totalBytes: reported.reduce(
        (sum, proc) => sum + proc.bytes,
        0
      )
    };
  }

  function requestProcessInfo() {
    if (!procRequest) {
      procRequest = Promise.resolve()
        .then(() => {
          if (typeof ChromeUtils.requestProcInfo !== 'function') {
            throw new Error(
              'Process information is unavailable in this Firefox build.'
            );
          }

          return ChromeUtils.requestProcInfo();
        })
        .finally(() => {
          procRequest = null;
        });
    }

    return procRequest;
  }

  function renderMonitor(view, data) {
    const scrollTop = view.content.scrollTop;

    for (const node of view.content.querySelectorAll('details[data-pid]')) {
      view.expanded.set(
        node.getAttribute('data-pid'),
        node.open
      );
    }

    const liveKeys = new Set(
      data.groups.map(proc => proc.key)
    );

    for (const key of view.expanded.keys()) {
      if (!liveKeys.has(key)) {
        view.expanded.delete(key);
      }
    }

    const fragment = document.createDocumentFragment();
    view.tabRows = [];

    for (const proc of data.groups) {
      const group = html('details');

      group.setAttribute('data-pid', proc.key);
      group.open = view.expanded.get(proc.key) ?? true;

      const summary = html('summary');

      summary.appendChild(
        html(
          'span',
          'smc-process',

          proc.pid === null
            ? proc.type
            : `${proc.type} · PID ${proc.pid} · ${proc.tabs.length} tab(s)`
        )
      );

      summary.appendChild(
        html('strong', 'smc-bytes', formatBytes(proc.bytes))
      );

      group.appendChild(summary);

      for (const row of proc.tabs) {
        const index = view.tabRows.push(row.tab) - 1;
        const button = html('button', 'smc-tab');

        button.type = 'button';

        button.setAttribute(
          'data-tab-index',
          String(index)
        );

        button.setAttribute(
          'data-selected',
          String(window.gBrowser.selectedTab === row.tab)
        );

        button.title = row.title;

        button.appendChild(
          html('span', 'smc-tab-text', row.title)
        );

        if (row.subframe) {
          button.appendChild(
            html('span', 'smc-muted', 'frame')
          );
        }

        group.appendChild(button);
      }

      if (!proc.tabs.length) {
        group.appendChild(
          html(
            'div',
            'smc-empty',
            'No mapped tabs from this window'
          )
        );
      }

      fragment.appendChild(group);
    }

    if (!data.groups.length) {
      fragment.appendChild(
        html('div', 'smc-empty', 'No tabs to display.')
      );
    }

    view.content.replaceChildren(fragment);
    view.content.scrollTop = scrollTop;

    const total = data.reportedCount
      ? formatBytes(data.totalBytes)
      : 'Unavailable';

    view.meta.textContent =
      `${data.tabCount} tabs in this window · ` +
      `Reported process total: ${total} ` +
      `(${data.reportedCount}/${data.processCount} processes)`;

    view.foot.textContent =
      `Updated ${new Date().toLocaleTimeString()} · ` +
      `Every ${CONFIG.MONITOR_REFRESH_MS / 1000}s while open. ` +
      'Values belong to whole processes; tabs may share or span processes. ' +
      'On Windows: commit size.';
  }

  async function refreshMonitor() {
    const view = monitor;

    if (!view || view.busy || disposed) {
      return;
    }

    cancel(view.timer);
    view.busy = true;

    try {
      const snapshot = await requestProcessInfo();

      if (monitor === view && !disposed) {
        renderMonitor(
          view,
          mapProcesses(snapshot)
        );
      }
    } catch (error) {
      if (monitor === view && !disposed) {
        view.meta.textContent =
          `Unable to read process information: ${error.message || error}`;

        view.tabRows = [];
        view.content.replaceChildren();
      }
    } finally {
      view.busy = false;

      if (monitor === view && !disposed) {
        view.timer = later(
          refreshMonitor,
          CONFIG.MONITOR_REFRESH_MS
        );
      }
    }
  }

  function hideMonitor() {
    const view = monitor;
    if (!view) return;

    monitor = null;

    cancel(view.timer);
    view.controller.abort();

    view.tabRows.length = 0;
    view.expanded.clear();

    view.panel.hidePopup();
    view.panel.remove();
  }

  function showMonitor() {
    if (disposed || !initialized || monitor) {
      return;
    }

    installStyle();

    const panel = xul(document, 'panel', {
      id: PANEL_ID,
      noautohide: 'true',
      noautofocus: 'true',
      consumeoutsideclicks: 'false',
      role: 'dialog',
      'aria-label': 'Tab Memory Monitor'
    });

    const root = html('div', 'smc-box');

    root.style.width =
      `${Math.min(470, Math.max(240, window.innerWidth - 40))}px`;

    const header = html('div', 'smc-head');

    header.appendChild(
      html('span', 'smc-title', 'Tab Memory Monitor')
    );

    for (const [label, action, title] of [
      ['Clean', 'clean', 'Minimize memory now'],
      ['↻', 'refresh', 'Refresh process information'],
      ['×', 'close', 'Close monitor']
    ]) {
      const button = html('button', '', label);

      button.type = 'button';
      button.title = title;

      button.setAttribute('aria-label', title);
      button.setAttribute('data-monitor-action', action);

      header.appendChild(button);
    }

    const meta = html(
      'div',
      'smc-meta',
      'Reading process information...'
    );

    const content = html('div', 'smc-list');

    content.style.maxHeight =
      `${Math.max(100, Math.min(420, window.innerHeight - 250))}px`;

    const foot = html(
      'div',
      'smc-foot',
      'Current-window tabs, grouped by process.'
    );

    root.append(header, meta, content, foot);
    panel.appendChild(root);

    const view = {
      panel,
      root,
      meta,
      content,
      foot,
      busy: false,
      timer: null,
      tabRows: [],
      expanded: new Map(),
      controller: new AbortController(),
      drag: null
    };

    monitor = view;

    const listenerOptions = {
      signal: view.controller.signal
    };

    root.addEventListener('click', event => {
      const button = event.target.closest?.('button');

      if (!button || !root.contains(button)) return;

      const action = button.getAttribute('data-monitor-action');

      if (action === 'close') {
        hideMonitor();
      } else if (action === 'refresh') {
        refreshMonitor();
      } else if (action === 'clean') {
        meta.textContent =
          runCleanup('Manual monitor request')
            ? 'Memory minimization requested.'
            : 'A cleanup is already running.';
      } else if (button.hasAttribute('data-tab-index')) {
        const tab = view.tabRows[
          Number(button.getAttribute('data-tab-index'))
        ];

        if (
          tab &&
          !tab.closing &&
          tab.isConnected !== false &&
          [...window.gBrowser.tabs].includes(tab)
        ) {
          window.gBrowser.selectedTab = tab;
          window.focus();
        }
      }
    }, listenerOptions);

    header.addEventListener('pointerdown', event => {
      if (
        event.button !== 0 ||
        event.target.closest?.('button')
      ) {
        return;
      }

      const rect = panel.getOuterScreenRect();

      view.drag = {
        x: event.screenX,
        y: event.screenY,
        left: rect.left,
        top: rect.top
      };

      header.setPointerCapture(event.pointerId);
      event.preventDefault();
    }, listenerOptions);

    header.addEventListener('pointermove', event => {
      if (!view.drag) return;

      const rect = panel.getOuterScreenRect();
      const screen = window.screen;
      const left = screen.availLeft ?? 0;
      const top = screen.availTop ?? 0;

      panel.moveTo(
        Math.max(
          left,
          Math.min(
            view.drag.left + event.screenX - view.drag.x,
            left + screen.availWidth - rect.width
          )
        ),

        Math.max(
          top,
          Math.min(
            view.drag.top + event.screenY - view.drag.y,
            top + screen.availHeight - rect.height
          )
        )
      );
    }, listenerOptions);

    const endDrag = () => {
      view.drag = null;
    };

    header.addEventListener(
      'pointerup',
      endDrag,
      listenerOptions
    );

    header.addEventListener(
      'pointercancel',
      endDrag,
      listenerOptions
    );

    panel.addEventListener('popuphidden', event => {
      if (event.target === panel && monitor === view) {
        hideMonitor();
      }
    }, listenerOptions);

    (
      document.getElementById('mainPopupSet') ||
      document.documentElement
    ).appendChild(panel);

    try {
      panel.openPopupAtScreen(
        window.mozInnerScreenX +
          Math.max(12, window.innerWidth - 500),
        window.mozInnerScreenY + 85,
        false
      );

      refreshMonitor();
    } catch (error) {
      hideMonitor();

      console.error(
        NAME,
        'Could not open memory monitor:',
        error
      );
    }
  }

  function toggleMonitor() {
    if (monitor) {
      hideMonitor();
    } else {
      showMonitor();
    }
  }

  function onKeyDown(event) {
    if (event.defaultPrevented || event.repeat) {
      return;
    }

    if (
      event.ctrlKey &&
      event.altKey &&
      !event.shiftKey &&
      !event.metaKey &&
      event.key.toLowerCase() === 'm'
    ) {
      event.preventDefault();
      event.stopPropagation();

      toggleMonitor();
    } else if (monitor && event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();

      hideMonitor();
    }
  }

  function removeStartupHooks() {
    window.removeEventListener('load', onLoad);

    if (observingStartup) {
      S.obs.removeObserver(
        startupObserver,
        'browser-delayed-startup-finished'
      );

      observingStartup = false;
    }
  }

  function init() {
    if (disposed || initialized || !window.gBrowser) {
      return;
    }

    removeStartupHooks();

    initialized = true;
    startedAt = Date.now();

    installStyle();
    addMenu();
    ensureToolbar();

    window.addEventListener(
      'keydown',
      onKeyDown,
      true
    );

    later(() => {
      addMenu();
      ensureToolbar();
    }, 1500);

    later(() => ensureToolbar(), 5000);

    intervalId = window.setInterval(
      automaticCheck,
      CONFIG.CHECK_INTERVAL_MS
    );

    later(
      automaticCheck,
      CONFIG.STARTUP_GRACE_MS
    );

    automaticCheck();

    log(
      `v${VERSION} ready. Auto: ${enabled() ? 'ON' : 'OFF'}.`,
      `Interval: ${intervalMS() / 60000} min.`,
      'Toolbar: Memory Cleaner. Monitor shortcut: Ctrl+Alt+M.'
    );
  }

  function onLoad() {
    if (
      window.gBrowser &&
      (
        !window.gBrowserInit ||
        window.gBrowserInit.delayedStartupFinished
      )
    ) {
      init();
    }
  }

  const startupObserver = {
    observe(subject) {
      if (subject === window) init();
    }
  };

  function stop() {
    if (disposed) return;

    disposed = true;

    hideMonitor();
    removeStartupHooks();

    window.removeEventListener('unload', stop);
    window.removeEventListener('keydown', onKeyDown, true);

    if (intervalId !== null) {
      window.clearInterval(intervalId);
    }

    for (const id of timers) {
      window.clearTimeout(id);
    }

    timers.clear();

    if (running) {
      const state = readState();

      state.lastError =
        'Owner window closed or cleaner stopped before completion';

      try {
        saveState(state);
      } catch {}

      // The native cleanup cannot be cancelled.
      // Leave its lock until the stale-lock timeout.
    }

    running = false;

    document.getElementById(MENU_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();

    closeToolbarPopup();

    document.getElementById(BUTTON_ID)
      ?.setAttribute('disabled', 'true');

    if (ownsWidget) {
      try {
        for (const win of browserWindows()) {
          win.SmartMemoryCleaner?.closeToolbarPopup?.();
        }

        customizableUI.destroyWidget(BUTTON_ID);
        ownsWidget = false;

        browserWindows().find(
          win => win.SmartMemoryCleaner?.ready
        )?.SmartMemoryCleaner.ensureToolbar();
      } catch (error) {
        console.warn(
          NAME,
          'Toolbar cleanup:',
          error
        );
      }
    }

    if (window.SmartMemoryCleaner === api) {
      delete window.SmartMemoryCleaner;
    }
  }

  const api = Object.freeze({
    version: VERSION,

    get ready() {
      return initialized && !disposed;
    },

    runNow: () => runCleanup('Manual console request'),

    status: inspect,
    showStatus,
    check: eligibility,

    enable: () => setEnabled(true),
    disable: () => setEnabled(false),

    resetStats,
    option,
    setOption,
    setIntervalMinutes,
    performAction,

    ensureToolbar,
    openToolbarPopup,
    closeToolbarPopup,
    showInCustomizeToolbar,

    showMonitor,
    hideMonitor,
    toggleMonitor,
    refreshMonitor,

    getTabProcessInfo: async () =>
      mapProcesses(await requestProcessInfo()),

    stop
  });

  window.SmartMemoryCleaner = api;

  window.addEventListener(
    'unload',
    stop,
    { once: true }
  );

  if (
    window.gBrowser &&
    (
      !window.gBrowserInit ||
      window.gBrowserInit.delayedStartupFinished
    )
  ) {
    init();
  } else {
    S.obs.addObserver(
      startupObserver,
      'browser-delayed-startup-finished'
    );

    observingStartup = true;

    window.addEventListener(
      'load',
      onLoad,
      { once: true }
    );
  }
})();