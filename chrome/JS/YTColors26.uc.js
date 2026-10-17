
 // ==UserScript==
 // @name        YouTube Video Age Colors - Firefox
 // @include     main
 // ==/UserScript==

 (() => {
   'use strict';
   const ACTOR = 'YTColors26';

   try {
     ChromeUtils.registerWindowActor(ACTOR, {
         // Allow this actor to run in Firefox's isolated web processes.
  remoteTypes: ["web"],
  safeForUntrustedWebProcess: true,

  child: {
    esModuleURI:
      "chrome://userscripts/content/YTColors26/YTColors26Child.sys.mjs",
    events: {
      DOMContentLoaded: { capture: true }
    }
  },

  matches: [
    "https://youtube.com/*",
    "https://*.youtube.com/*"
  ],

  allFrames: false
     });

     console.log('[YTColors26] Registered');
   } catch (error) {
     if (!/already|duplicate/i.test(String(error))) {
       console.error('[YTColors26] Registration error:', error);
     }
   }

   function attach() {
     const gb = window.gBrowser || window._gBrowser;

     if (!gb || gb.__ytColors26Attached) return;
     gb.__ytColors26Attached = true;

     function activate(browser) {
       const uri = browser?.currentURI?.spec || '';

       if (!/^https:\/\/(?:[a-z0-9-]+\.)*youtube\.com\//i.test(uri)) {
         return;
       }

       try {
         const actor = browser.browsingContext
           ?.currentWindowGlobal
           ?.getActor(ACTOR);

         actor?.sendAsyncMessage('Start');
       } catch (error) {
         console.warn(
           '[YTColors26] Content actor activation failed:',
           error
         );
       }
     }

     gb.tabContainer.addEventListener(
       'TabSelect',
       () => activate(gb.selectedBrowser)
     );

     gb.tabContainer.addEventListener('TabOpen', e => {
       window.setTimeout(
         () => activate(e.target.linkedBrowser),
         300
       );
     });

     gb.addTabsProgressListener({
       onLocationChange(browser, webProgress) {
         if (webProgress?.isTopLevel) {
           activate(browser);
         }
       }
     });

     const activateAll = () => {
       for (const browser of gb.browsers) {
         activate(browser);
       }
     };

     activateAll();
     window.setTimeout(activateAll, 1500);
     window.setTimeout(activateAll, 5000);

     console.log('[YTColors26] Tab hooks installed');
   }

   if (document.readyState === 'complete') {
     attach();
   } else {
     window.addEventListener('load', attach, {
       once: true
     });
   }
 })();
