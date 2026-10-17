
 // ==UserScript==
 // @name           Tab Highlight Plus - Zen Tabs & Folders
 // @description    In-menu normal/Zen pickers, folder inheritance, full/border style, HEX/RGB
 // @version        3.4.2
 // @include        main
 // ==/UserScript==
 (() => {
   'use strict';
   if (window.__tabHighlightPlusV342) return;
   window.__tabHighlightPlusV342 = true;

   const FONT_SIZE = '11px';
   const TAB_KEY = 'highlighted_HT';
   const TAB_MODE_KEY = 'highlighted_HT_mode';
   const FOLDER_PREF = 'userChromeJS.tabHighlight.folderColors.v3';
   const TAB_MODE_PREF = 'userChromeJS.tabHighlight.tabMode.v3';
   const FOLDER_MODE_PREF = 'userChromeJS.tabHighlight.folderMode.v3';
   const SCOPE_PREF = 'userChromeJS.tabHighlight.folderScope.v3_1';
   const CUSTOM_PREF = 'userChromeJS.tabHighlight.lastCustomColor';
   const QUICK_COLOR = '#C5DE92';
   const STYLE_ID = 'uc-th-v342-style';

   const XUL = tag => document.createXULElement(tag);
   const HTML = tag => document.createElementNS(
     'http://www.w3.org/1999/xhtml',
     tag
   );

   const PALETTE = [
     ['#EF4444','#F87171','#FB7185','#F9A8D4','#EC4899','#DB2777','#BE123C','#881337'],
     ['#F97316','#FB923C','#FDBA74','#F59E0B','#FBBF24','#FDE047','#FACC15','#CA8A04'],
     ['#D9F99D','#A3E635','#84CC16','#65A30D','#4ADE80','#22C55E','#16A34A','#047857'],
     ['#99F6E4','#2DD4BF','#14B8A6','#06B6D4','#22D3EE','#38BDF8','#0EA5E9','#0284C7'],
     ['#93C5FD','#60A5FA','#3B82F6','#2563EB','#6366F1','#818CF8','#8B5CF6','#6D28D9'],
     ['#A78BFA','#C4B5FD','#D8B4FE','#C084FC','#A855F7','#7E22CE','#9333EA','#D946EF'],
     ['#F5F5F4','#D6D3D1','#A8A29E','#78716C','#57534E','#334155','#1E293B','#0F172A'],
     ['#FECACA','#FED7AA','#FEF08A','#BBF7D0','#A5F3FC','#BFDBFE','#DDD6FE','#FBCFE8']
   ];

   let SS;

   try {
     SS = window.SessionStore ||
       ChromeUtils.importESModule(
         'resource:///modules/sessionstore/SessionStore.sys.mjs'
       ).SessionStore;
   } catch (error) {
     console.error(
       '[Tab Highlight Plus] SessionStore unavailable:',
       error
     );
     return;
   }

   function prefGet(key, fallback = '') {
     try {
       return Services.prefs.getStringPref(key, fallback);
     } catch {
       return fallback;
     }
   }

   function prefSet(key, value) {
     try {
       Services.prefs.setStringPref(key, value);
     } catch (error) {
       console.warn(
         '[Tab Highlight Plus] Pref save:',
         error
       );
     }
   }

   const modeOf = mode =>
     mode === 'border' ? 'border' : 'full';

   const scopeOf = scope =>
     scope === 'header' ? 'header' : 'all';

   const defaultMode = type => modeOf(prefGet(
     type === 'folder'
       ? FOLDER_MODE_PREF
       : TAB_MODE_PREF,
     'full'
   ));

   const defaultScope = () =>
     scopeOf(prefGet(SCOPE_PREF, 'all'));

   function normalizeColor(input) {
     if (typeof input !== 'string') return null;

     const value = input.trim();

     let match =
       /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);

     if (match) {
       const hex = match[1].length === 3
         ? [...match[1]].map(ch => ch + ch).join('')
         : match[1];

       return '#' + hex.toUpperCase();
     }

     match =
       /^(?:rgb\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/i.exec(value);

     if (!match) return null;

     const nums = match.slice(1).map(Number);

     if (nums.some(num => num > 255)) return null;

     return '#' + nums
       .map(num => num.toString(16).padStart(2, '0'))
       .join('')
       .toUpperCase();
   }

   function textColor(hex) {
     const rgb = [1, 3, 5].map(
       i => parseInt(hex.slice(i, i + 2), 16) / 255
     );

     const linear = rgb.map(n =>
       n <= .04045
         ? n / 12.92
         : ((n + .055) / 1.055) ** 2.4
     );

     const lum =
       linear[0] * .2126 +
       linear[1] * .7152 +
       linear[2] * .0722;

     return lum < .179
       ? '#FFFFFF'
       : '#101820';
   }

   function hsvHex(h, s, v) {
     const f = n => {
       const k = (n + h / 60) % 6;

       return Math.round(
         (
           v -
           v * s *
           Math.max(Math.min(k, 4 - k, 1), 0)
         ) * 255
       );
     };

     return '#' + [f(5), f(3), f(1)]
       .map(n => n.toString(16).padStart(2, '0'))
       .join('')
       .toUpperCase();
   }

   function hexHSV(hex) {
     const [r, g, b] = [1, 3, 5].map(
       i => parseInt(hex.slice(i, i + 2), 16) / 255
     );

     const max = Math.max(r, g, b);
     const min = Math.min(r, g, b);
     const d = max - min;

     let h = 0;

     if (d) {
       if (max === r) {
         h = ((g - b) / d) % 6;
       } else if (max === g) {
         h = (b - r) / d + 2;
       } else {
         h = (r - g) / d + 4;
       }

       h = (h * 60 + 360) % 360;
     }

     return {
       h,
       s: max ? d / max : 0,
       v: max
     };
   }

   function attr(el, name, value) {
     if (el.getAttribute(name) !== value) {
       el.setAttribute(name, value);
     }
   }

   function delAttr(el, name) {
     if (el.hasAttribute(name)) {
       el.removeAttribute(name);
     }
   }

   function css(el, name, value, priority = '') {
     if (
       el.style.getPropertyValue(name) !== value ||
       el.style.getPropertyPriority(name) !== priority
     ) {
       el.style.setProperty(
         name,
         value,
         priority
       );
     }
   }

   const restoredTabs = new WeakSet();
   let refreshPending = false;

   function scheduleRefresh() {
     if (refreshPending) return;

     refreshPending = true;

     window.requestAnimationFrame(() => {
       refreshPending = false;
       syncColors();
     });
   }

   function colorTab(
     tab,
     color,
     mode = defaultMode('tab'),
     save = true
   ) {
     if (!tab?.matches?.('.tabbrowser-tab')) return;

     const hex = color ? normalizeColor(color) : null;
     if (color && !hex) return;

     if (hex) {
       attr(tab, 'uc-th-explicit', hex);
       attr(tab, 'uc-th-explicit-mode', modeOf(mode));
     } else {
       delAttr(tab, 'uc-th-explicit');
       delAttr(tab, 'uc-th-explicit-mode');
     }

     restoredTabs.add(tab);

     if (save) {
       try {
         if (hex) {
           SS.setCustomTabValue(tab, TAB_KEY, hex);
           SS.setCustomTabValue(
             tab,
             TAB_MODE_KEY,
             modeOf(mode)
           );
         } else {
           SS.deleteCustomTabValue(tab, TAB_KEY);
           SS.deleteCustomTabValue(tab, TAB_MODE_KEY);
         }
       } catch (error) {
         console.warn(
           '[Tab Highlight Plus] Save tab:',
           error
         );
       }
     }

     scheduleRefresh();
   }

   function restoreTab(tab, force = false) {
     if (!tab?.matches?.('.tabbrowser-tab')) return;
     if (restoredTabs.has(tab) && !force) return;

     restoredTabs.add(tab);

     try {
       const hex = normalizeColor(
         SS.getCustomTabValue(tab, TAB_KEY)
       );

       if (hex) {
         attr(tab, 'uc-th-explicit', hex);

         attr(
           tab,
           'uc-th-explicit-mode',
           modeOf(
             SS.getCustomTabValue(tab, TAB_MODE_KEY)
           )
         );
       } else {
         delAttr(tab, 'uc-th-explicit');
         delAttr(tab, 'uc-th-explicit-mode');
       }
     } catch {}

     scheduleRefresh();
   }

   function loadFolderData() {
     try {
       const data = JSON.parse(
         prefGet(FOLDER_PREF, '{}')
       );

       return data &&
         typeof data === 'object' &&
         !Array.isArray(data)
           ? data
           : {};
     } catch {
       return {};
     }
   }

   const folderData = loadFolderData();

   function folderSetting(folder) {
     if (!folder?.id) return null;

     const raw = folderData[folder.id];

     const data = typeof raw === 'string'
       ? {
           color: raw,
           mode: 'full',
           scope: 'all'
         }
       : raw;

     const color = normalizeColor(data?.color);

     return color
       ? {
           color,
           mode: modeOf(data.mode),
           scope: scopeOf(data.scope || 'all')
         }
       : null;
   }

   function colorFolder(
     folder,
     color,
     mode = defaultMode('folder'),
     scope = defaultScope()
   ) {
     if (
       !folder?.matches?.('zen-folder') ||
       !folder.id
     ) return;

     const hex = color ? normalizeColor(color) : null;
     if (color && !hex) return;

     if (hex) {
       folderData[folder.id] = {
         color: hex,
         mode: modeOf(mode),
         scope: scopeOf(scope)
       };
     } else {
       delete folderData[folder.id];
     }

     prefSet(FOLDER_PREF, JSON.stringify(folderData));
     scheduleRefresh();
   }

   function parentFolder(item) {
     const seen = new Set();
     let group = item?.group || null;

     while (group && !seen.has(group)) {
       seen.add(group);

       if (
         group.matches?.('zen-folder') ||
         group.isZenFolder
       ) {
         return group;
       }

       group =
         group.group ||
         group.parentElement?.closest?.('zen-folder') ||
         null;
     }

     return item?.parentElement?.closest?.('zen-folder') ||
       null;
   }

   function folderChildren(folder) {
     try {
       if (
         folder.allItems &&
         typeof folder.allItems[Symbol.iterator] === 'function'
       ) {
         return Array.from(folder.allItems);
       }
     } catch {}

     const container =
       folder.groupContainer ||
       folder.querySelector(
         ':scope > .tab-group-container'
       );

     return container
       ? Array.from(container.children)
       : [];
   }

   function displayTab(tab, setting) {
     if (!setting?.color) {
       delAttr(tab, 'uc-th-mode');
       delAttr(tab, 'uc-th-source');

       for (const property of [
         '--uc-th-color',
         '--uc-th-foreground',
         'background-color',
         'border-radius'
       ]) {
         tab.style.removeProperty(property);
       }

       return;
     }

     attr(tab, 'uc-th-mode', modeOf(setting.mode));

     attr(
       tab,
       'uc-th-source',
       setting.source || 'folder'
     );

     css(tab, '--uc-th-color', setting.color);

     css(
       tab,
       '--uc-th-foreground',
       textColor(setting.color)
     );

     if (setting.mode === 'full') {
       css(
         tab,
         'background-color',
         setting.color,
         'important'
       );

       css(
         tab,
         'border-radius',
         '6px',
         'important'
       );
     } else {
       tab.style.removeProperty('background-color');
       tab.style.removeProperty('border-radius');
     }
   }

   function displayFolder(folder, setting) {
     if (!setting?.color) {
       delAttr(folder, 'uc-th-folder-mode');

       folder.style.removeProperty('--uc-fh-color');
       folder.style.removeProperty('--uc-fh-foreground');

       return;
     }

     attr(
       folder,
       'uc-th-folder-mode',
       modeOf(setting.mode)
     );

     css(folder, '--uc-fh-color', setting.color);

     css(
       folder,
       '--uc-fh-foreground',
       textColor(setting.color)
     );
   }

   function syncColors() {
     if (!window.gBrowser) return;

     const folders = [
       ...document.querySelectorAll('zen-folder')
     ];

     const folderSources = new Map();
     const tabSources = new Map();
     const visited = new Set();

     function walk(folder, inherited) {
       if (visited.has(folder)) return;

       visited.add(folder);

       const own = folderSetting(folder);

       folderSources.set(
         folder,
         own || inherited
       );

       const next = own
         ? (own.scope === 'all' ? own : null)
         : inherited;

       for (const child of folderChildren(folder)) {
         if (
           child.matches?.('zen-folder') ||
           child.isZenFolder
         ) {
           walk(child, next);
         } else if (
           child.matches?.('.tabbrowser-tab')
         ) {
           tabSources.set(child, next);
         } else if (child.querySelectorAll) {
           child.querySelectorAll('.tabbrowser-tab')
             .forEach(tab => tabSources.set(tab, next));

           child.querySelectorAll('zen-folder')
             .forEach(folder => walk(folder, next));
         }
       }
     }

     for (const folder of folders) {
       if (!parentFolder(folder)) {
         walk(folder, null);
       }
     }

     for (const folder of folders) {
       if (!visited.has(folder)) {
         walk(folder, null);
       }
     }

     for (const folder of folders) {
       displayFolder(
         folder,
         folderSources.get(folder) ||
           folderSetting(folder)
       );
     }

     for (const tab of gBrowser.tabs) {
       if (!restoredTabs.has(tab)) {
         restoreTab(tab);
       }

       const explicit = normalizeColor(
         tab.getAttribute('uc-th-explicit')
       );

       if (explicit) {
         displayTab(tab, {
           color: explicit,
           mode: modeOf(
             tab.getAttribute('uc-th-explicit-mode')
           ),
           source: 'tab'
         });

         continue;
       }

       let inherited = tabSources.get(tab);

       if (inherited === undefined) {
         let folder = parentFolder(tab);
         const seen = new Set();

         inherited = null;

         while (folder && !seen.has(folder)) {
           seen.add(folder);

           const own = folderSetting(folder);

           if (own) {
             inherited = own.scope === 'all'
               ? own
               : null;
             break;
           }

           folder = parentFolder(folder);
         }
       }

       displayTab(
         tab,
         inherited
           ? {
               ...inherited,
               source: 'folder'
             }
           : null
       );
     }

     document.documentElement.setAttribute(
       'uc-th-version',
       '3.4.2'
     );
   }

   function contextTabs() {
     const tab =
       window.TabContextMenu?.contextTab ||
       gBrowser.selectedTab;

     if (!tab) return [];

     const selected = Array.from(
       gBrowser.selectedTabs || []
     );

     return selected.length > 1 &&
       selected.includes(tab)
         ? selected
         : [tab];
   }

   let contextFolder = null;

   function snapshot(type) {
     return type === 'folder'
       ? {
           type,
           folder: contextFolder
         }
       : {
           type,
           tabs: contextTabs().slice()
         };
   }

   function applyTo(target, color) {
     if (!target) return;

     if (target.type === 'folder') {
       if (!target.folder?.isConnected) return;

       const own = folderSetting(target.folder);

       colorFolder(
         target.folder,
         color,
         own?.mode || defaultMode('folder'),
         own?.scope || defaultScope()
       );
     } else {
       for (const tab of target.tabs || []) {
         if (!tab?.isConnected) continue;

         colorTab(
           tab,
           color,
           tab.getAttribute('uc-th-explicit-mode') ||
             defaultMode('tab')
         );
       }
     }

     if (color) {
       prefSet(
         CUSTOM_PREF,
         normalizeColor(color)
       );
     }
   }

   function initialColor(target) {
     if (target?.type === 'folder') {
       return (
         folderSetting(target.folder)?.color ||
         normalizeColor(prefGet(CUSTOM_PREF)) ||
         '#7C3AED'
       );
     }

     return (
       normalizeColor(
         target?.tabs?.[0]?.getAttribute('uc-th-explicit')
       ) ||
       normalizeColor(prefGet(CUSTOM_PREF)) ||
       '#7C3AED'
     );
   }

   function changeMode(type, mode) {
     mode = modeOf(mode);

     prefSet(
       type === 'folder'
         ? FOLDER_MODE_PREF
         : TAB_MODE_PREF,
       mode
     );

     if (type === 'folder') {
       const own = folderSetting(contextFolder);

       if (own) {
         colorFolder(
           contextFolder,
           own.color,
           mode,
           own.scope
         );
       }
     } else {
       for (const tab of contextTabs()) {
         const color = tab.getAttribute(
           'uc-th-explicit'
         );

         if (color) {
           colorTab(tab, color, mode);
         }
       }
     }
   }

   function changeScope(scope) {
     scope = scopeOf(scope);

     prefSet(SCOPE_PREF, scope);

     const own = folderSetting(contextFolder);

     if (own) {
       colorFolder(
         contextFolder,
         own.color,
         own.mode,
         scope
       );
     }
   }

   function menuItem(parent, label, fn) {
     const item = XUL('menuitem');

     item.setAttribute('label', label);
     item.addEventListener('command', fn);

     parent.appendChild(item);

     return item;
   }

   function buildPickerBody(popup) {
     const wrapper = XUL('vbox');
     wrapper.classList.add('uc-th-ui');

     const body = HTML('div');
     body.className = 'uc-th-body';

     wrapper.appendChild(body);

     const tabs = HTML('div');
     tabs.className = 'uc-th-picker-tabs';

     const normalButton = HTML('button');
     const zenButton = HTML('button');

     normalButton.type = 'button';
     zenButton.type = 'button';

     normalButton.textContent = 'Normal picker';
     zenButton.textContent = 'Zen picker';

     normalButton.className =
       'uc-th-tab-button uc-th-active';

     zenButton.className =
       'uc-th-tab-button';

     tabs.append(normalButton, zenButton);
     body.appendChild(tabs);

     // Normal 8x8 palette.
     const normal = HTML('div');
     normal.className = 'uc-th-normal-view';

     const palette = HTML('div');
     palette.className = 'uc-th-grid';

     for (const row of PALETTE) {
       for (const color of row) {
         const swatch = HTML('button');

         swatch.type = 'button';
         swatch.className = 'uc-th-swatch';
         swatch.title = color;

         swatch.setAttribute(
           'aria-label',
           color
         );

         swatch.style.backgroundColor = color;

         swatch.addEventListener(
           'click',
           () => {
             applyTo(
               popup.__ucTHtarget,
               color
             );

             popup.hidePopup();
           }
         );

         palette.appendChild(swatch);
       }
     }

     normal.appendChild(palette);

     const normalExtra = HTML('div');
     normalExtra.className = 'uc-th-normal-extra';

     const nativeLabel = HTML('span');
     nativeLabel.textContent = 'More colors';

     const nativeColor = HTML('input');
     nativeColor.type = 'color';
     nativeColor.title = 'Open browser color chooser';
     nativeColor.value = '#7C3AED';

     nativeColor.addEventListener(
       'change',
       () => {
         const color = normalizeColor(
           nativeColor.value
         );

         if (color) {
           applyTo(
             popup.__ucTHtarget,
             color
           );

           popup.hidePopup();
         }
       }
     );

     normalExtra.append(
       nativeLabel,
       nativeColor
     );

     normal.appendChild(normalExtra);

     // Zen-style rainbow picker.
     const zen = HTML('div');
     zen.className = 'uc-th-zen-view';
     zen.hidden = true;

     const pad = HTML('div');
     pad.className = 'uc-th-gradient-pad';
     pad.title = 'Drag to select color';

     const marker = HTML('span');
     marker.className = 'uc-th-marker';

     pad.appendChild(marker);

     const chips = HTML('div');
     chips.className = 'uc-th-chips';

     const samples = [
       '#FFF6E8',
       '#F4A7C5',
       '#D3B6EA',
       '#EA7C8D',
       '#F78B73',
       '#E2D27C',
       '#58E8BB',
       '#9FA9C4'
     ];

     for (const color of samples) {
       const chip = HTML('button');

       chip.type = 'button';
       chip.className = 'uc-th-chip';
       chip.style.backgroundColor = color;
       chip.title = color;

       chip.addEventListener(
         'click',
         () => setPreview(color)
       );

       chips.appendChild(chip);
     }

     const brightnessRow = HTML('div');
     brightnessRow.className = 'uc-th-brightness';

     const brightnessLabel = HTML('span');
     brightnessLabel.textContent = 'Brightness';

     const brightness = HTML('input');
     brightness.type = 'range';
     brightness.min = '10';
     brightness.max = '100';
     brightness.value = '100';

     brightnessRow.append(
       brightnessLabel,
       brightness
     );

     const valueRow = HTML('div');
     valueRow.className = 'uc-th-value-row';

     const preview = HTML('span');
     preview.className = 'uc-th-preview';

     const hexInput = HTML('input');
     hexInput.className = 'uc-th-hex';
     hexInput.type = 'text';
     hexInput.placeholder = '#RRGGBB or rgb(…)';

     valueRow.append(
       preview,
       hexInput
     );

     const actionRow = HTML('div');
     actionRow.className = 'uc-th-actions';

     const back = HTML('button');
     back.type = 'button';
     back.textContent = 'Back';

     const apply = HTML('button');
     apply.type = 'button';
     apply.className = 'uc-th-apply';
     apply.textContent = 'Apply color';

     actionRow.append(
       back,
       apply
     );

     zen.append(
       pad,
       chips,
       brightnessRow,
       valueRow,
       actionRow
     );

     body.append(normal, zen);

     let picked = '#7C3AED';
     let hue = 0;
     let sat = .9;
     let val = 1;

     function setPreview(
       input,
       updateMarker = true
     ) {
       const hex = normalizeColor(input);

       if (!hex) return;

       picked = hex;
       hexInput.value = hex;
       preview.style.backgroundColor = hex;
       nativeColor.value = hex;

       if (updateMarker) {
         const hsv = hexHSV(hex);

         hue = hsv.h;
         sat = hsv.s;
         val = hsv.v;

         const y = val < .999
           ? .5 + (1 - val) / 1.7
           : sat / 2;

         marker.style.left =
           `${(hue / 360) * 100}%`;

         marker.style.top =
           `${Math.max(0, Math.min(100, y * 100))}%`;

         brightness.value = String(
           Math.round(val * 100)
         );
       }
     }

     function pointerPick(event) {
       const rect = pad.getBoundingClientRect();

       const x = Math.max(
         0,
         Math.min(
           1,
           (event.clientX - rect.left) / rect.width
         )
       );

       const y = Math.max(
         0,
         Math.min(
           1,
           (event.clientY - rect.top) / rect.height
         )
       );

       hue = x * 360;
       sat = y < .5 ? y * 2 : 1;

       val = y < .5
         ? 1
         : Math.max(
             .1,
             1 - (y - .5) * 1.7
           );

       marker.style.left = `${x * 100}%`;
       marker.style.top = `${y * 100}%`;

       brightness.value = String(
         Math.round(val * 100)
       );

       setPreview(
         hsvHex(hue, sat, val),
         false
       );
     }

     let dragging = false;

     pad.addEventListener(
       'pointerdown',
       event => {
         if (event.button !== 0) return;

         dragging = true;

         try {
           pad.setPointerCapture(event.pointerId);
         } catch {}

         pointerPick(event);
         event.preventDefault();
       }
     );

     pad.addEventListener(
       'pointermove',
       event => {
         if (dragging) {
           pointerPick(event);
         }
       }
     );

     for (const event of [
       'pointerup',
       'pointercancel',
       'lostpointercapture'
     ]) {
       pad.addEventListener(event, () => {
         dragging = false;
       });
     }

     brightness.addEventListener(
       'input',
       () => {
         val = Number(brightness.value) / 100;

         setPreview(
           hsvHex(hue, sat, val),
           false
         );
       }
     );

     hexInput.addEventListener(
       'change',
       () => {
         const candidate = normalizeColor(
           hexInput.value
         );

         if (candidate) {
           setPreview(candidate);
         } else {
           hexInput.value = picked;
         }
       }
     );

     apply.addEventListener(
       'click',
       () => {
         applyTo(
           popup.__ucTHtarget,
           normalizeColor(hexInput.value) || picked
         );

         popup.hidePopup();
       }
     );

     hexInput.addEventListener(
       'keydown',
       event => {
         if (event.key === 'Enter') {
           event.preventDefault();
           apply.click();
         }
       }
     );

     back.addEventListener(
       'click',
       () => showView('normal')
     );

     let extras = [];

     function showView(view) {
       const isZen = view === 'zen';

       normal.hidden = isZen;
       zen.hidden = !isZen;

       normalButton.classList.toggle(
         'uc-th-active',
         !isZen
       );

       zenButton.classList.toggle(
         'uc-th-active',
         isZen
       );

       for (const extra of extras) {
         extra.hidden = isZen;
       }
     }

     normalButton.addEventListener(
       'click',
       () => showView('normal')
     );

     zenButton.addEventListener(
       'click',
       () => {
         setPreview(
           initialColor(
             popup.__ucTHtarget
           )
         );

         showView('zen');
       }
     );

     // Keep pointer interaction inside the same menu.
     for (const event of [
       'mousedown',
       'mouseup',
       'click',
       'dblclick'
     ]) {
       body.addEventListener(
         event,
         e => e.stopPropagation()
       );
     }

     return {
       wrapper,

       setExtras(items) {
         extras = items;
       },

       reset() {
         showView('normal');

         setPreview(
           initialColor(
             popup.__ucTHtarget
           )
         );
       }
     };
   }

   function buildMenu(parent, type, id) {
     if (
       !parent ||
       document.getElementById(id)
     ) return;

     const menu = XUL('menu');
     menu.id = id;

     menu.setAttribute(
       'label',
       type === 'folder'
         ? 'Highlight Folder'
         : 'Highlight Tab(s)'
     );

     const popup = XUL('menupopup');
     popup.classList.add('uc-th-popup');

     menu.appendChild(popup);

     const styles = XUL('menu');
     styles.setAttribute(
       'label',
       'Highlight style'
     );

     const stylePopup = XUL('menupopup');
     styles.appendChild(stylePopup);

     for (const [value, label] of [
       ['full', 'Full background'],
       ['border', 'Border only']
     ]) {
       const item = menuItem(
         stylePopup,
         label,
         () => changeMode(type, value)
       );

       item.setAttribute('type', 'radio');
       item.setAttribute(
         'name',
         `uc-th-style-${type}`
       );

       item.dataset.value = value;
     }

     stylePopup.addEventListener(
       'popupshowing',
       event => {
         if (event.target !== stylePopup) return;

         const chosen = type === 'folder'
           ? folderSetting(contextFolder)?.mode ||
             defaultMode('folder')
           : defaultMode('tab');

         for (const item of stylePopup.children) {
           if (item.dataset.value === chosen) {
             item.setAttribute('checked', 'true');
           } else {
             item.removeAttribute('checked');
           }
         }
       }
     );

     popup.appendChild(styles);

     if (type === 'folder') {
       const scopes = XUL('menu');

       scopes.setAttribute(
         'label',
         'Apply folder color to'
       );

       const scopePopup = XUL('menupopup');
       scopes.appendChild(scopePopup);

       for (const [value, label] of [
         ['header', 'Folder header only'],
         ['all', 'Folder + all tabs & subfolders']
       ]) {
         const item = menuItem(
           scopePopup,
           label,
           () => changeScope(value)
         );

         item.setAttribute('type', 'radio');
         item.setAttribute('name', 'uc-th-scope');
         item.dataset.value = value;
       }

       scopePopup.addEventListener(
         'popupshowing',
         event => {
           if (event.target !== scopePopup) return;

           const chosen =
             folderSetting(contextFolder)?.scope ||
             defaultScope();

           for (const item of scopePopup.children) {
             if (item.dataset.value === chosen) {
               item.setAttribute('checked', 'true');
             } else {
               item.removeAttribute('checked');
             }
           }
         }
       );

       popup.appendChild(scopes);
     }

     popup.appendChild(
       XUL('menuseparator')
     );

     const picker = buildPickerBody(popup);
     popup.appendChild(picker.wrapper);

     const separator = XUL('menuseparator');
     popup.appendChild(separator);

     const custom = menuItem(
       popup,
       'Custom HEX / RGB…',
       () => {
         const target = snapshot(type);
         const value = {
           value: initialColor(target)
         };

         if (!Services.prompt.prompt(
           window,
           'Custom highlight color',
           'HEX (#FF8800) or RGB (rgb(255,136,0)):',
           value,
           null,
           { value: false }
         )) {
           return;
         }

         const hex = normalizeColor(
           value.value
         );

         if (!hex) {
           Services.prompt.alert(
             window,
             'Invalid color',
             'Use #RGB, #RRGGBB, or rgb(255,128,64).'
           );
           return;
         }

         applyTo(target, hex);
       }
     );

     const reuse = menuItem(
       popup,
       'Reuse last custom color',
       () => {
         const hex = normalizeColor(
           prefGet(CUSTOM_PREF)
         );

         if (hex) {
           applyTo(snapshot(type), hex);
         }
       }
     );

     const separator2 = XUL('menuseparator');
     popup.appendChild(separator2);

     const remove = menuItem(
       popup,
       'Remove highlight (None)',
       () => applyTo(snapshot(type), null)
     );

     picker.setExtras([
       separator,
       custom,
       reuse,
       separator2,
       remove
     ]);

     popup.addEventListener(
       'popupshowing',
       event => {
         if (event.target !== popup) return;

         popup.__ucTHtarget = snapshot(type);
         picker.reset();

         const recent = normalizeColor(
           prefGet(CUSTOM_PREF)
         );

         reuse.disabled = !recent;

         reuse.setAttribute(
           'label',
           recent
             ? `Reuse custom: ${recent}`
             : 'Reuse last custom color'
         );
       }
     );

     const anchor = document.getElementById(
       type === 'folder'
         ? 'context_zenFolderChangeIcon'
         : 'context_pinTab'
     );

     if (anchor?.parentNode === parent) {
       parent.insertBefore(
         menu,
         anchor.nextSibling
       );
     } else {
       parent.appendChild(menu);
     }
   }

   function createMenus() {
     buildMenu(
       document.getElementById('tabContextMenu'),
       'tab',
       'uc-th-tabs-menu'
     );

     const popup = document.getElementById(
       'zenFolderActions'
     );

     if (!popup) return;

     buildMenu(
       popup,
       'folder',
       'uc-th-folder-menu'
     );

     if (popup.__ucTHV341Ready) return;

     popup.__ucTHV341Ready = true;

     popup.addEventListener(
       'popupshowing',
       event => {
         if (event.target !== popup) return;

         const candidate = popup.triggerNode
           ?.closest?.('zen-folder');

         if (candidate) {
           contextFolder = candidate;
         }

         const menu = document.getElementById(
           'uc-th-folder-menu'
         );

         if (menu) {
           menu.hidden =
             !contextFolder?.isConnected;
         }
       }
     );
   }

   function addStyles() {
     if (document.getElementById(STYLE_ID)) return;

     const style = HTML('style');
     style.id = STYLE_ID;

     style.textContent = `
       .tabbrowser-tab .tab-label,
       .tabbrowser-tab .tab-text,
       zen-folder > .tab-group-label-container > .tab-group-label {
         font-size: ${FONT_SIZE} !important;
         font-weight: 500 !important;
       }

       .tabbrowser-tab[uc-th-mode] .tab-background {
         border-radius: 6px !important;
       }

       .tabbrowser-tab[uc-th-mode="full"] .tab-background {
         background: var(--uc-th-color) !important;
         background-image: none !important;
         border: 0 !important;
         box-shadow: none !important;
       }

       .tabbrowser-tab[uc-th-mode="full"]
       :is(.tab-label,.tab-text,.tab-label-container) {
         color: var(--uc-th-foreground) !important;
         font-size: ${FONT_SIZE} !important;
         font-weight: 600 !important;
         opacity: 1 !important;
       }

       .tabbrowser-tab[uc-th-mode="border"] .tab-background {
         border: 2px solid var(--uc-th-color) !important;
         box-shadow: inset 0 0 0 1px var(--uc-th-color) !important;
       }

       zen-folder[uc-th-folder-mode="full"]
       > .tab-group-label-container {
         background: var(--uc-fh-color) !important;
         border-radius: 7px !important;
         box-shadow: none !important;
       }

       zen-folder[uc-th-folder-mode="border"]
       > .tab-group-label-container {
         border-radius: 7px !important;
         box-shadow: inset 0 0 0 2px var(--uc-fh-color) !important;
       }

       zen-folder[uc-th-folder-mode="full"]
       > .tab-group-label-container
       :is(label,.tab-group-label) {
         color: var(--uc-fh-foreground) !important;
         font-size: ${FONT_SIZE} !important;
         font-weight: 600 !important;
         opacity: 1 !important;
       }

       .uc-th-popup {
         min-width: 0 !important;
       }

       .uc-th-ui {
         width: 224px !important;
         min-width: 224px !important;
         max-width: 224px !important;
       }

       .uc-th-body {
         box-sizing: border-box;
         width: 224px;
         padding: 6px;
         color: #f5f5f5;
         font: 11px system-ui, sans-serif;
       }

       .uc-th-body [hidden] {
         display: none !important;
       }

       /* Equal, transparent picker buttons */
       .uc-th-picker-tabs {
         display: grid !important;
         grid-template-columns:
           repeat(2, minmax(0, 1fr)) !important;
         align-items: stretch !important;
         gap: 6px !important;
         width: 100% !important;
         padding: 0 !important;
         margin: 0 0 8px !important;
         box-sizing: border-box !important;
       }

       .uc-th-body .uc-th-tab-button {
         appearance: none !important;
         -moz-appearance: none !important;
         box-sizing: border-box !important;

         display: flex !important;
         align-items: center !important;
         justify-content: center !important;

         width: 100% !important;
         min-width: 0 !important;
         max-width: none !important;

         height: 30px !important;
         min-height: 30px !important;
         max-height: 30px !important;

         padding: 0 4px !important;
         margin: 0 !important;

         border: 1px solid #777 !important;
         border-radius: 8px !important;

         background: transparent !important;
         background-color: transparent !important;
         background-image: none !important;

         box-shadow: none !important;
         text-shadow: none !important;

         color: #e3e3e3 !important;
         font: 600 10px/1 system-ui, sans-serif !important;

         text-align: center !important;
         white-space: nowrap !important;
         cursor: pointer !important;
         outline-offset: -2px !important;
       }

       .uc-th-body .uc-th-tab-button:hover {
         background: transparent !important;
         border-color: #ccc !important;
       }

       .uc-th-body .uc-th-tab-button.uc-th-active {
         background: transparent !important;
         background-image: none !important;
         border-color: #f0f0f0 !important;
         color: #fff !important;
         box-shadow:
           inset 0 0 0 1px #f0f0f0 !important;
       }

       .uc-th-body .uc-th-tab-button:focus-visible {
         outline: 1px solid #c6d4ff !important;
       }

       /*
        * V3.4.2 FIX
        * Fill the full menu width with 8 equal columns.
        */
       .uc-th-grid {
         display: grid !important;
         grid-template-columns:
           repeat(8, minmax(0, 1fr)) !important;
         gap: 4px !important;
         width: 100% !important;
         box-sizing: border-box !important;
         padding: 0 !important;
       }

       .uc-th-swatch {
         appearance: none !important;
         display: block;
         width: 100% !important;
         min-width: 0 !important;
         height: 22px;
         box-sizing: border-box;
         padding: 0;
         margin: 0;
         border: 1px solid #777;
         border-radius: 6px;
         cursor: pointer;
       }

       .uc-th-swatch:hover {
         outline: 2px solid white;
         outline-offset: -2px;
       }

       .uc-th-normal-extra {
         display: flex;
         justify-content: space-between;
         align-items: center;
         margin-top: 8px;
         padding: 3px 2px 0;
         color: #ddd;
       }

       .uc-th-normal-extra input[type=color] {
         height: 24px;
         width: 55px;
         padding: 0;
         border: 1px solid #888;
         border-radius: 6px;
         background: #222;
         cursor: pointer;
       }

       .uc-th-zen-view {
         width: 100%;
       }

       .uc-th-gradient-pad {
         position: relative;
         width: 210px;
         height: 153px;
         box-sizing: border-box;
         border: 1px solid #aaa;
         border-radius: 9px;
         cursor: crosshair;
         touch-action: none;

         background:
           linear-gradient(
             to bottom,
             #fff,
             transparent 48%,
             #000e
           ),
           linear-gradient(
             to right,
             #f55,
             #ffe655,
             #54e59f,
             #51d8ee,
             #687af0,
             #d05bee,
             #f55
           );
       }

       .uc-th-marker {
         position: absolute;
         left: 50%;
         top: 50%;
         transform: translate(-50%,-50%);

         width: 14px;
         height: 14px;
         border-radius: 50%;
         border: 3px solid #fff;

         box-shadow:
           0 0 0 1px #111,
           0 1px 5px #0009;

         pointer-events: none;
       }

       .uc-th-chips {
         display: flex;
         justify-content: space-between;
         gap: 4px;
         margin-top: 9px;
       }

       .uc-th-chip {
         width: 22px;
         height: 22px;
         min-width: 22px;
         padding: 0;
         border-radius: 50%;
         border: 2px solid #777;
         cursor: pointer;
       }

       .uc-th-chip:hover {
         outline: 2px solid #fff;
       }

       .uc-th-brightness {
         display: flex;
         align-items: center;
         gap: 8px;
         margin: 10px 0 8px;
       }

       .uc-th-brightness input {
         min-width: 0;
         flex: 1;
         accent-color: #bfb1fa;
       }

       .uc-th-value-row {
         display: flex;
         align-items: center;
         gap: 7px;
       }

       .uc-th-preview {
         width: 26px;
         height: 26px;
         flex: 0 0 26px;
         border-radius: 5px;
         border: 1px solid #aaa;
       }

       .uc-th-hex {
         box-sizing: border-box;
         width: 100%;
         min-width: 0;
         flex: 1;
         padding: 5px;
         border: 1px solid #777;
         border-radius: 5px;
         background: #1b1b1b;
         color: #fff;
         font: 11px monospace;
       }

       .uc-th-actions {
         display: grid;
         grid-template-columns: 1fr 1fr;
         gap: 6px;
         margin-top: 9px;
       }

       .uc-th-actions button {
         height: 28px;
         border: 1px solid #777;
         border-radius: 6px;
         background: #444;
         color: #eee;
         cursor: pointer;
       }

       .uc-th-actions .uc-th-apply {
         background: #405d9f;
         border-color: #6c8ed0;
       }
     `;

     document.documentElement.appendChild(style);
   }

   function init() {
     if (!window.gBrowser?.tabContainer) return;

     addStyles();
     createMenus();

     for (const tab of gBrowser.tabs) {
       restoreTab(tab);
     }

     scheduleRefresh();

     const tabs = gBrowser.tabContainer;

     tabs.addEventListener(
       'mousedown',
       event => {
         if (
           event.button !== 0 ||
           !event.altKey
         ) return;

         const tab = event.target.closest?.(
           '.tabbrowser-tab'
         );

         if (!tab) return;

         colorTab(
           tab,
           tab.getAttribute(
             'uc-th-explicit'
           ) === QUICK_COLOR
             ? null
             : QUICK_COLOR
         );
       }
     );

     tabs.addEventListener(
       'contextmenu',
       event => {
         const folder = event.target.closest?.(
           'zen-folder'
         );

         if (
           folder &&
           event.target.closest?.(
             '.tab-group-label-container'
           )
         ) {
           contextFolder = folder;
         }
       },
       true
     );

     for (const event of [
       'SSTabRestoring',
       'SSTabRestored',
       'TabOpen'
     ]) {
       tabs.addEventListener(event, e => {
         window.setTimeout(
           () => restoreTab(e.target, true),
           100
         );
       });
     }

     window.addEventListener(
       'SSWindowRestored',
       () => {
         for (const tab of gBrowser.tabs) {
           restoreTab(tab, true);
         }

         scheduleRefresh();
       }
     );

     const observer = new MutationObserver(
       records => {
         for (const record of records) {
           for (const node of [
             ...record.addedNodes,
             ...record.removedNodes
           ]) {
             if (node.nodeType !== 1) continue;

             if (
               node.matches?.(
                 'zen-folder,.tabbrowser-tab'
               ) ||
               node.querySelector?.(
                 'zen-folder,.tabbrowser-tab'
               )
             ) {
               scheduleRefresh();
               return;
             }
           }
         }
       }
     );

     observer.observe(tabs, {
       childList: true,
       subtree: true
     });

     window.addEventListener(
       'unload',
       () => observer.disconnect(),
       { once: true }
     );

     for (const delay of [
       600,
       1600,
       3500
     ]) {
       window.setTimeout(() => {
         createMenus();

         for (const tab of gBrowser.tabs) {
           restoreTab(tab);
         }

         scheduleRefresh();
       }, delay);
     }

     console.log(
       '[Tab Highlight Plus] v3.4.2 full-width color palette ready'
     );
   }

   if (document.readyState === 'complete') {
     init();
   } else {
     window.addEventListener(
       'load',
       init,
       { once: true }
     );
   }
 })();
