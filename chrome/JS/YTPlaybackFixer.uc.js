
 // ==UserScript==
 // @name        YouTube Playback Fixer - Firefox fx-autoconfig
 // @include     main
 // ==/UserScript==

 (() => {
   'use strict';

   const ACTOR = 'YTPlaybackFixerV5';

   try {
     ChromeUtils.registerWindowActor(ACTOR, {
       remoteTypes: ['web'],
       safeForUntrustedWebProcess: true,

       child: {
         esModuleURI:
           'chrome://userscripts/content/YTPlaybackFixer/YTPlaybackFixerChild.sys.mjs',
         events: {
           DOMContentLoaded: { capture: true }
         }
       },

       matches: ['https://www.youtube.com/*'],
       allFrames: false
     });

     console.log('[YTPlaybackFixer] V5 actor registered');
   } catch (error) {
     if (!/already|duplicate/i.test(String(error))) {
       console.error(
         '[YTPlaybackFixer] Actor registration:',
         error
       );
     }
   }

   function attachToTabs() {
     const gb = window.gBrowser;

     if (!gb || gb.__ytPlaybackFixerV5Ready) return;

     gb.__ytPlaybackFixerV5Ready = true;

     const activate = browser => {
       if (
         !browser?.currentURI?.spec?.startsWith(
           'https://www.youtube.com/'
         )
       ) return;

       try {
         browser.browsingContext
           ?.currentWindowGlobal
           ?.getActor(ACTOR)
           ?.sendAsyncMessage('Start');
       } catch (error) {
         console.debug(
           '[YTPlaybackFixer] Actor not ready:',
           String(error)
         );
       }
     };

     gb.tabContainer.addEventListener(
       'TabSelect',
       () => activate(gb.selectedBrowser)
     );

     gb.tabContainer.addEventListener(
       'TabOpen',
       e => {
         window.setTimeout(
           () => activate(e.target.linkedBrowser),
           350
         );
       }
     );

     gb.addTabsProgressListener({
       onLocationChange(browser, progress) {
         if (progress?.isTopLevel) {
           window.setTimeout(
             () => activate(browser),
             350
           );
         }
       }
     });

     window.setTimeout(() => {
       for (const browser of gb.browsers) {
         activate(browser);
       }
     }, 1500);
   }

   if (document.readyState === 'complete') {
     attachToTabs();
   } else {
     window.addEventListener(
       'load',
       attachToTabs,
       { once: true }
     );
   }
 })();
