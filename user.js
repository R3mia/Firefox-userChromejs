
/**
 * ZEN BROWSER / FIREFOX — REMIA USER.JS
 * Audit date: 2026-11-07
 * Source: https://github.com/R3mia/Firefox-userChromejs/blob/main/user.js
 *
 * PURPOSE: Preserve all existing preference values; organize and explain each one.
 * - Active: user_pref(...);
 * - Reference only / DISABLED: // user_pref(...);
 * - Obsolete: // user_pref(...); // [OBSOLETE] ...
 * - Support uncertain in your Zen version: [VERIFY] annotations.
 *
 * Previously mislabeled "DISABLED" preferences that were still executable
 * were commented out in the audited source. Duplicate keys were consolidated,
 * retaining their first occurrence (except the intentional DNS TTL override removal).
 *
 * NOTE: Not every preference is guaranteed to work in every Zen version.
 * Check about:config and the source code for your installed build.
 * Removing or commenting a preference does NOT reset values stored in prefs.js.
 */

// ============================================================================
// [01] ZEN INTERFACE, WORKSPACES & PORTABLE
// ============================================================================
// --- ACTIVE ---
user_pref("zen.portable.mode", false); // Enable Zen portable-mode behavior if supported by this build.
user_pref("zen.view.experimental-rounded-view", false); // Toggle Zen's experimental rounded content view.
user_pref("zen.view.compact.animate-sidebar", true); // Animate the sidebar in Compact Mode.
user_pref("zen.theme.gradient", false); // Toggle Zen interface gradients.
user_pref("zen.theme.acrylic-elements", false); // Toggle translucent acrylic-style interface elements.
user_pref("zen.downloads.download-animation", false); // Animate Zen's download interface.
user_pref("zen.view.grey-out-inactive-windows", false); // Dim unfocused Zen windows.
user_pref("zen.watermark.enabled", false); // Show Zen's watermark where supported.
user_pref("zen.startup.smooth-scroll-in-tabs", true); // Enable smooth scrolling within the tab list at startup.
user_pref("zen.tabs.dim-pending", true); // Dim pending or not-yet-loaded tabs.
user_pref("ui.tooltipDelay", 80); // Delay before showing tooltips (milliseconds).
user_pref("ui.submenuDelay", 0); // Delay before opening submenus (milliseconds).
user_pref("zen.workspaces.continue-where-left-off", true); // Resume the workspace used in the previous session.
user_pref("zen.urlbar.show-protections-icon", true); // Show the tracking protection shield in Zen's URL bar.
user_pref("zen.updates.show-update-notification", false); // Hide Zen Browser update notifications.
user_pref("zen.tabs.essentials.max", 48); // Increase the maximum number of Essential tabs.


// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("widget.non-native-theme.scrollbar.style", 2); // Override the scrollbar appearance; may differ by OS.
user_pref("ui.tooltip.delay_ms", 60); // Alternative tooltip delay setting; may not be read by current Zen builds. [VERIFY: possible legacy alias]
user_pref("widget.non-native-theme.use-theme-accent", false); // Use the system accent color in the non-native theme.
user_pref("zen.view.experimental-no-window-controls", true); // Completely remove window control buttons.
user_pref("zen.view.hide-window-controls", true); // Hide window controls in supported toolbar layouts.
user_pref("zen.view.experimental-force-window-controls-left", false); // Prevent window controls from being forced to the left.
user_pref("zen.tabs.show-newtab-vertical", false); // Show the New Tab button in the vertical tab list.
user_pref("zen.view.show-newtab-button-top", false); // Move the New Tab button to the top.
user_pref("zen.urlbar.replace-newtab", true); // Use the traditional New Tab page instead // Disabl automatically opening the Floating URL Bar

// ============================================================================
// [02] MOUSE, SMOOTH SCROLLING & SCROLLBARS
// ============================================================================
// --- ACTIVE ---
user_pref("general.smoothScroll.mouseWheel.durationMaxMS", 180); // Maximum mouse-wheel smooth-scroll animation duration (ms).
user_pref("general.smoothScroll.mouseWheel.durationMinMS", 90); // Minimum mouse-wheel smooth-scroll animation duration (ms).
user_pref("apz.overscroll.enabled", true); // Enable overscroll effects through Asynchronous Panning and Zooming (APZ).
user_pref("general.smoothScroll", true); // Enable smooth scrolling.
user_pref("mousewheel.default.delta_multiplier_y", 175); // Multiply vertical wheel scrolling distance (100 = 100%).
user_pref("mousewheel.min_line_scroll_amount", 7); // Minimum number of lines scrolled per wheel event.

// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("mousewheel.enable_pixel_scrolling", false); // Enable pixel-precision scrolling for wheels and touchpads.
user_pref("ui.useOverlayScrollbars", 1); // Force overlay scrollbars where supported by the platform.
user_pref("general.smoothScroll.msdPhysics.continuousMotionMaxDeltaMS", 12); // Time threshold for treating MSD scrolling as continuous motion.
user_pref("general.smoothScroll.msdPhysics.enabled", true); // Enable mass-spring-damper (MSD) smooth-scroll physics.
user_pref("general.smoothScroll.msdPhysics.motionBeginSpringConstant", 600); // MSD spring stiffness when scrolling begins.
user_pref("general.smoothScroll.msdPhysics.regularSpringConstant", 650); // MSD spring stiffness during normal scrolling.
user_pref("general.smoothScroll.msdPhysics.slowdownMinDeltaMS", 25); // Minimum time delta used for MSD scroll slowdown.
user_pref("general.smoothScroll.msdPhysics.slowdownMinDeltaRatio", "2"); // Time-delta ratio threshold for MSD slowdown.
user_pref("general.smoothScroll.msdPhysics.slowdownSpringConstant", 250); // MSD spring stiffness during scroll slowdown.
user_pref("general.smoothScroll.currentVelocityWeighting", "1"); // Weight applied to current scroll velocity.
user_pref("general.smoothScroll.stopDecelerationWeighting", "1"); // Weight applied to deceleration when scrolling stops.

// ============================================================================
// [03] DNS, DOH/NEXTDNS & GEOLOCATION
// ============================================================================
// --- ACTIVE ---
user_pref("network.trr.uri", "https://ultralow.dns.nextdns.io/ae9823"); // NextDNS Ultralow DNS-over-HTTPS (TRR) endpoint.
user_pref("network.trr.custom_uri", "https://ultralow.dns.nextdns.io/ae9823"); // Custom DoH endpoint configured through browser DNS settings.
user_pref("network.trr.mode", 3); // TRR mode: 3 means DoH-only, without fallback to regular DNS.

// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("network.dnsCacheExpiration", 3600); // Fallback DNS-cache TTL in seconds when no DNS TTL is available. [KEEP DEFAULT: NextDNS DoH provides its own TTL]
user_pref("network.dns.disablePrefetch", true); // Disable proactive DNS prefetching when true.
user_pref("network.dns.disablePrefetchFromHTTPS", true); // Disable DNS prefetching originating from HTTPS pages.
user_pref("network.dns.blockDotOnion", true); // Prevent ordinary DNS from resolving .onion hostnames.
user_pref("geo.provider.network.url", "https://beacondb.net/v1/geolocate"); // Network-based geolocation provider endpoint.
user_pref("geo.provider.ms-windows-location", false); // Use Windows system location services.
user_pref("geo.provider.use_corelocation", false); // Use Apple Core Location on macOS.
user_pref("geo.provider.use_geoclue", false); // Use GeoClue location services on Linux.
user_pref("geo.enabled", false); // Enable the Geolocation API; websites must still request permission.
user_pref("geo.wifi.logging.enabled", false); // Enable Wi-Fi geolocation diagnostic logging. [VERIFY: implementation may have changed]

// ============================================================================
// [04] NETWORK CONNECTIONS, HTTP, PREFETCH & PROXY
// ============================================================================
// --- ACTIVE ---
user_pref("network.http.pacing.requests.enabled", false); // Enable HTTP request pacing and throttling.
user_pref("network.ssl_tokens_cache_capacity", 10240); // Capacity of cached TLS security/session tokens.
user_pref("network.prefetch-next", false); // Allow link/resource prefetching suggested by web pages.
user_pref("network.predictor.enabled", false); // Enable history-based network connection prediction.
user_pref("network.predictor.enable-prefetch", false); // Enable resource prefetching by the network predictor.

// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("network.http.max-connections", 1800); // Maximum number of concurrent HTTP connections.
user_pref("network.http.max-persistent-connections-per-server", 10); // Maximum keep-alive HTTP connections per server.
user_pref("network.http.max-urgent-start-excessive-connections-per-host", 5); // Maximum extra urgent-start connections per host.
user_pref("network.http.request.max-start-delay", 5); // Maximum scheduling delay for some HTTP requests. [VERIFY: older scheduling preference]
user_pref("network.http.speculative-parallel-limit", 0); // Maximum simultaneous speculative/preconnect connections.
user_pref("browser.urlbar.speculativeConnect.enabled", false); // Preconnect to anticipated results from the address bar.
user_pref("network.buffer.cache.size", 65535); // Size of each cached network I/O buffer in bytes.
user_pref("network.buffer.cache.count", 48); // Number of reusable cached network I/O buffers.
user_pref("browser.places.speculativeConnect.enabled", false); // Preconnect using Places, history, and bookmarks.
user_pref("captivedetect.canonicalURL", ""); // Test URL used to detect captive portals such as Wi-Fi sign-in pages.
user_pref("network.captive-portal-service.enabled", false); // Detect captive portal sign-in pages.
user_pref("network.connectivity-service.enabled", false); // Enable network connectivity diagnostics.
user_pref("network.proxy.socks_remote_dns", true); // Resolve hostnames through a SOCKS proxy when one is configured.

// ============================================================================
// [05] CACHE, MEMORY & SESSION RESTORE & BACK-FORWARD CACHE
// ============================================================================
// --- ACTIVE ---
user_pref("browser.cache.disk.enable", false); // Enable the HTTP disk cache; false avoids disk caching.
user_pref("browser.cache.memory.enable", true); // Enable the HTTP memory cache.
user_pref("browser.cache.memory.capacity", -1); // Memory cache limit in KiB; -1 lets Firefox manage it.
user_pref("browser.cache.memory.max_entry_size", -1); // Maximum size of a memory-cache entry; -1 uses automatic behavior.
user_pref("browser.tabs.unloadOnLowMemory", true); // Permit unloading tabs under low-memory conditions.
user_pref("browser.sessionstore.restore_on_demand", true); // Restore tabs lazily when they are selected.
user_pref("browser.sessionstore.restore_pinned_tabs_on_demand", true); // Restore pinned tabs on demand instead of loading them all immediately.
user_pref("browser.sessionstore.interval", 60000); // Interval between session-state saves (milliseconds).

// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("browser.privatebrowsing.forceMediaMemoryCache", true); // Force media caching in Private Browsing to use memory.
user_pref("media.memory_cache_max_size", 65536); // Maximum media memory-cache size (KiB).
user_pref("browser.sessionstore.privacy_level", 2); // Control how much sensitive session information is saved.
 //user_pref("browser.sessionstore.max_tabs_undo", 0); // Number of recently closed tabs that can be restored.
user_pref("media.cache_readahead_limit", 3600); // Maximum media readahead buffering duration in seconds.
user_pref("media.cache_resume_threshold", 1800); // Buffered-media threshold for resuming caching (seconds).
user_pref("browser.sessionstore.idleDelay", 180); // Idle delay for session-store operations.
user_pref("browser.sessionstore.collect_zoom", false); // Collect and restore per-tab zoom information.
user_pref("browser.sessionhistory.max_total_viewers", 0); // Maximum cached page viewers for navigation.
user_pref("fission.bfcacheInParent", false); // Browser Back-Forward Cache in parent process.
user_pref("fission.disableSessionHistoryInParent", true); // Controls parent-process session history.

// ============================================================================
// [06] RENDERING, GRAPHICS & FULLSCREEN & JAVASCRIPT
// ============================================================================
// --- ACTIVE ---
user_pref("image.mem.decode_bytes_at_a_time", 32768); // Number of image bytes decoded in each processing pass.
user_pref("svg.context-properties.content.enabled", true); // Allow SVG CSS context-properties in web content.
user_pref("gfx.content.skia-font-cache-size", 20); // Size of Skia's font cache used for content rendering.
user_pref("gfx.canvas.accelerated.cache-size", 512); // Cache size for hardware-accelerated canvas rendering.
user_pref("content.notify.interval", 100000); // Interval between content-processing notifications (microseconds).
user_pref("full-screen-api.transition-duration.enter", "0 0"); // Duration of the fullscreen entry transition.
user_pref("full-screen-api.transition-duration.leave", "0 0"); // Duration of the fullscreen exit transition.
user_pref("nglayout.initialpaint.delay", 250); // Delay before the first document paint (milliseconds).
user_pref("nglayout.initialpaint.delay_in_oopif", 250); // Delay before first paint in out-of-process iframes (milliseconds).
user_pref("browser.preferences.defaultPerformanceSettings.enabled", false); // Use recommended performance settings.
user_pref("layers.acceleration.disabled", false); // Use hardware acceleration when available.

// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("full-screen-api.warning.timeout", 0); // Duration of the warning displayed when entering fullscreen (ms).
user_pref("gfx.font_rendering.opentype_svg.enabled", false); // Permit SVG glyphs embedded in OpenType fonts.
user_pref("webgl.disabled", true); // Disable WebGL, which can break 3D websites and games.
user_pref("webgl.min_capability_mode", true); // Expose a reduced WebGL capability set.
user_pref("webgl.disable-extensions", true); // Disable or hide WebGL extensions.
user_pref("webgl.disable-fail-if-major-performance-caveat", true); // Bypass a performance caveat check during WebGL context creation.
user_pref("webgl.enable-debug-renderer-info", false); // Allow websites to read extended GPU details through WebGL.
user_pref("dom.maxHardwareConcurrency", 2); // Limit the CPU thread count exposed by navigator.hardwareConcurrency.
user_pref("browser.display.use_document_fonts", 0); // Allow website-specified fonts; 0 means disabled.
user_pref("dom.script_loader.bytecode_cache.strategy", -1); // JavaScript bytecode cache strategy.
user_pref("javascript.options.mem.gc_balanced_heap_limits", true); // Enable balanced JavaScript GC heap limits.


// ============================================================================
// [07] VIDEO, AUDIO & PDF
// ============================================================================
// --- ACTIVE ---
user_pref("media.videocontrols.picture-in-picture.enable-when-switching-tabs.enabled", true); // Permit Picture-in-Picture when switching tabs, where supported.
user_pref("media.videocontrols.picture-in-picture.enabled", true); // Enable video Picture-in-Picture.
user_pref("pdfjs.enableScripting", false); // Allow JavaScript execution inside the built-in PDF viewer.

// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("pdfjs.disabled", false); // Disable the built-in PDF viewer when true.
user_pref("media.video_stats.enabled", false); // Expose video playback statistics to web APIs where supported.
user_pref("media.autoplay.default", 5); // Autoplay policy; 5 generally blocks automatic playback of all media.
user_pref("media.gmp-gmpopenh264.enabled", false); // Enable the OpenH264 media codec module.
user_pref("media.gmp-manager.url", ""); // Update endpoint for Gecko Media Plugin modules.
user_pref("dom.webaudio.enabled", false); // Enable the Web Audio API.

// ============================================================================
// [08] DOWNLOADS & FILE HANDLING
// ============================================================================
// --- ACTIVE ---
user_pref("browser.download.panel.shown", true); // Remember whether the Downloads panel has been shown.
user_pref("browser.download.alwaysOpenInSystemViewerContextMenuItem", true); // Show an option to open downloads in the operating system's viewer.
user_pref("browser.download.alwaysOpenPanel", true); // Open the Downloads panel automatically for new downloads.
user_pref("browser.download.always_ask_before_handling_new_types", true); // Ask how to handle previously unseen file types.
user_pref("browser.download.open_pdf_attachments_inline", true); // Open PDF attachments in a browser tab when possible.
user_pref("browser.download.useDownloadDir", false); // Use the default download directory; false asks for a save location.
user_pref("browser.download.manager.addToRecentDocs", false); // Add downloaded files to Windows Recent Documents when true.
user_pref("browser.helperApps.deleteTempFileOnExit", true); // Remove temporary files opened by external applications on exit.

// ============================================================================
// [09] PRIVACY, COOKIES & FINGERPRINTING
// ============================================================================
// --- ACTIVE ---
user_pref("network.http.referer.XOriginTrimmingPolicy", 2); // Trim cross-origin Referer data; 2 sends the origin only.
user_pref("privacy.globalprivacycontrol.enabled", true); // Send Global Privacy Control (GPC) in normal windows.
user_pref("privacy.globalprivacycontrol.pbmode.enabled", true); // Send GPC in Private Browsing windows.
user_pref("privacy.globalprivacycontrol.functionality.enabled", true); // Enable the underlying GPC feature when supported. [VERIFY: internal gate may vary by build]
user_pref("privacy.query_stripping.enabled", true); // Remove known tracking parameters from URLs in normal windows.
user_pref("privacy.query_stripping.enabled.pbmode", true); // Remove known tracking parameters from URLs in Private Browsing.
user_pref("privacy.userContext.enabled", true); // Enable Firefox Containers to isolate site data by container.
user_pref("privacy.userContext.ui.enabled", true); // Display the Firefox Containers user interface.
user_pref("privacy.antitracking.isolateContentScriptResources", true); // Isolate extension content-script resources from tracking.
user_pref("privacy.trackingprotection.allow_list.baseline.enabled", true); // Use baseline compatibility exceptions for Tracking Protection.
user_pref("privacy.trackingprotection.allow_list.convenience.enabled", true); // Use additional compatibility exceptions for Tracking Protection.
user_pref("privacy.trackingprotection.enabled", true); // Enable Tracking Protection in regular browsing.
user_pref("privacy.trackingprotection.pbmode.enabled", true); // Enable Tracking Protection in Private Browsing.
user_pref("privacy.resistFingerprinting", false); // Enable strict Resist Fingerprinting (RFP); can affect window size. [KEEP false: avoid forced Zen window resizing]
user_pref("privacy.fingerprintingProtection", true); // Enable targeted fingerprinting protection without strict RFP.
user_pref("browser.contentblocking.category", "strict"); // Enhanced Tracking Protection category; strict enables stricter rules.
user_pref("general.useragent.override", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.6.0) Gecko/20100101 Firefox/153.6.0"); // Change useragent
user_pref("general.buildID.override", "20181001000000"); // Overrides the browser's build ID.
user_pref("general.appversion.override", "5.0 (Windows)"); // Overrides the application version exposed to websites.
user_pref("general.oscpu.override", "Windows NT 10.0; Win64; x64"); // Overrides the operating system and CPU information
user_pref("general.platform.override", "Win32"); // Overrides the platform identifier exposed through
user_pref("privacy.sanitize.sanitizeOnShutdown", false); // Disable automatic browsing data cleanup on shutdown.
user_pref("privacy.clearOnShutdown_v2.cookiesAndStorage", false); // Disable automatic browsing data cleanup on shutdown.
user_pref("privacy.clearOnShutdown_v2.cache", false); // Preserve temporary cached files on shutdown.
user_pref("privacy.clearOnShutdown.cookies", false);
user_pref("privacy.clearOnShutdown.offlineApps", false);
user_pref("privacy.clearSiteData.browsingHistoryAndDownloads", true); // Clear browsing and download history.
user_pref("privacy.clearSiteData.cookiesAndStorage", false); // Preserve cookies, site storage, and logins.
user_pref("privacy.clearSiteData.cache", true); // Clear temporary cached files and pages.
user_pref("privacy.clearSiteData.formdata", true); // Clear saved form and search history.
user_pref("privacy.clearSiteData.formdata", true); // Clear saved form and search history.
user_pref("privacy.clearSiteData.siteSettings", false); // Preserve website permissions and preferences.
user_pref("privacy.clearHistory.browsingHistoryAndDownloads", true); // Clear browsing and download history.
user_pref("privacy.clearHistory.cookiesAndStorage", false); // Preserve cookies and site storage.
user_pref("privacy.clearHistory.cache", true); // Clear temporary browser cache.
user_pref("privacy.clearHistory.formdata", true); // Clear saved form and search history.
user_pref("privacy.clearHistory.siteSettings", false); //  Preserve site-specific settings.
user_pref("privacy.sanitize.timeSpan", 1); // Default time range for manual data clearing. // 0 = Everything // 1 = Last hour // 2 = Last two hours // 3 = Last four hours // 4 = Today



// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("network.http.referer.trimmingPolicy", 2); // General Referer trimming policy.
user_pref("privacy.spoof_english", 1); // Spoof English language information to reduce language fingerprinting.
user_pref("privacy.firstparty.isolate", true); // Enable older First-Party Isolation, which may conflict with modern cookie partitioning.
user_pref("browser.formfill.enable", false); // Store and autocomplete form data.
user_pref("signon.formlessCapture.enabled", false); // Capture login details from pages without a form element.
user_pref("signon.privateBrowsingCapture.enabled", false); // Permit password-save prompts in Private Browsing.
user_pref("signon.autofillForms", true); // Autofill saved usernames and passwords.
user_pref("beacon.enabled", false); // Enable navigator.sendBeacon for background data submission.
user_pref("dom.event.clipboardevents.enabled", true); // Allow websites to receive copy, cut, and paste events.
user_pref("dom.allow_cut_copy", true); // Allow authorized scripts to invoke cut/copy commands.
user_pref("browser.send_pings", false); // Permit hyperlink ping requests used for click tracking.
user_pref("browser.send_pings.require_same_host", true); // Restrict ping requests to the appropriate host when pings are enabled.
user_pref("network.cookie.cookieBehavior", 1); // Cookie policy: 1 blocks third-party cookies, unlike modern default partitioning.
user_pref("network.cookie.thirdparty.sessionOnly", true); // Retain third-party cookies only for the current session.
//user_pref("browser.privatebrowsing.autostart", true); // Always start in permanent Private Browsing mode.
user_pref("places.history.enabled", false); // Store browsing history in the Places database.
user_pref("signon.rememberSignons", true); // Allow Firefox to save website usernames and passwords.
user_pref("signon.generation.enabled", false); // Suggest strong passwords when creating accounts.
user_pref("network.cookie.lifetimePolicy", 0); // Cookie lifetime policy: 2 limits cookies to the session. 0 = Accept normal cookie expiration rules.
user_pref("signon.autofillForms.http", false); // Autofill passwords on insecure HTTP pages.
user_pref("browser.formfill.expire_days", 0); // Number of days to retain previously entered form data.
user_pref("layout.css.visited_links_enabled", false); // Allow CSS :visited link styling.
user_pref("cookiebanners.service.mode", 2); // Cookie banner handling in normal windows.
user_pref("cookiebanners.service.mode.privateBrowsing", 2); // Cookie banner handling in Private Browsing.
user_pref("browser.privatebrowsing.vpnpromourl", ""); // Legacy Firefox Private Browsing VPN promotion URL.
user_pref("devtools.webide.enabled", false); // Disable WebIDE and ADB extension download.
user_pref("devtools.webide.autoinstallADBExtension", false); // Disable WebIDE and ADB extension download.
user_pref("offline-apps.allow_by_default", false); // Enforce websites to ask to store data for offline use.



// ============================================================================
// [10] TLS, CERTIFICATES & ENCRYPTION
// ============================================================================
// --- ACTIVE ---
user_pref("security.tls.enable_0rtt_data", false); // Allow TLS 1.3 0-RTT early data; disabling avoids replay risks.
user_pref("network.negotiate-auth.allow-insecure-ntlm-v1", false); // Allow insecure NTLMv1 integrated authentication; false is safer.
user_pref("security.ssl.treat_unsafe_negotiation_as_broken", true); // Treat unsafe TLS renegotiation as an insecure connection.
user_pref("security.tls.version.enable-deprecated", false); // Allow deprecated TLS protocol versions when true.
user_pref("network.stricttransportsecurity.preloadlist", true); // Use the built-in HSTS preload list.

// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("security.ask_for_password", 2); // Legacy NSS certificate-store password prompt behavior.
user_pref("security.password_lifetime", 1); // Legacy NSS certificate-store password lifetime.
user_pref("security.ssl.enable_ocsp_stapling", true); // Allow OCSP stapling during the TLS handshake.
user_pref("security.ssl.enable_ocsp_must_staple", true); // Enforce OCSP Must-Staple when certificates require it.
user_pref("security.ssl.disable_session_identifiers", true); // Disable TLS session identifiers; can affect session reuse.
user_pref("security.tls.version.min", 3); // Minimum supported TLS version; 3 corresponds to TLS 1.2.
user_pref("security.tls.version.max", 4); // Maximum supported TLS version; 4 corresponds to TLS 1.3.
user_pref("security.tls.version.fallback-limit", 4); // TLS downgrade fallback limit, encoded as a TLS version value.
user_pref("security.pki.sha1_enforcement_level", 1); // Policy for acceptance of SHA-1 certificate signatures.
user_pref("security.certerrors.mitm.auto_enable_enterprise_roots", false); // Automatically trust enterprise roots when TLS interception is detected.
user_pref("security.enterprise_roots.enabled", false); // Trust root certificates supplied by the operating system or enterprise.
user_pref("security.ssl3.rsa_null_sha", false); // TLS cipher-suite setting for RSA NULL SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.rsa_null_md5", false); // TLS cipher-suite setting for RSA NULL MD5; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.ecdhe_rsa_null_sha", false); // TLS cipher-suite setting for ECDHE RSA NULL SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.ecdhe_ecdsa_null_sha", false); // TLS cipher-suite setting for ECDHE ECDSA NULL SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.ecdh_rsa_null_sha", false); // TLS cipher-suite setting for ECDH RSA NULL SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.ecdh_ecdsa_null_sha", false); // TLS cipher-suite setting for ECDH ECDSA NULL SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.rsa_seed_sha", false); // TLS cipher-suite setting for RSA SEED SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.rsa_rc4_40_md5", false); // TLS cipher-suite setting for RSA RC4 40 MD5; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.rsa_rc2_40_md5", false); // TLS cipher-suite setting for RSA RC2 40 MD5; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.rsa_1024_rc4_56_sha", false); // TLS cipher-suite setting for RSA 1024 RC4 56 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.rsa_camellia_128_sha", false); // TLS cipher-suite setting for RSA CAMELLIA 128 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.ecdhe_rsa_aes_128_sha", false); // TLS cipher-suite setting for ECDHE RSA AES 128 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.ecdhe_ecdsa_aes_128_sha", false); // TLS cipher-suite setting for ECDHE ECDSA AES 128 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.ecdh_rsa_aes_128_sha", false); // TLS cipher-suite setting for ECDH RSA AES 128 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.ecdh_ecdsa_aes_128_sha", false); // TLS cipher-suite setting for ECDH ECDSA AES 128 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.dhe_rsa_camellia_128_sha", false); // TLS cipher-suite setting for DHE RSA CAMELLIA 128 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.dhe_rsa_aes_128_sha", false); // TLS cipher-suite setting for DHE RSA AES 128 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.ecdhe_ecdsa_aes_128_gcm_sha256", false); // TLS cipher-suite setting for ECDHE ECDSA AES 128 GCM SHA256; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.ecdhe_rsa_aes_128_gcm_sha256", false); // TLS cipher-suite setting for ECDHE RSA AES 128 GCM SHA256; leave modern browser cipher defaults unchanged.
user_pref("security.tls13.aes_128_gcm_sha256", false); // TLS 1.3 cipher-suite toggle (AES 128 GCM SHA256); keep browser defaults.
user_pref("security.ssl3.ecdh_ecdsa_rc4_128_sha", false); // TLS cipher-suite setting for ECDH ECDSA RC4 128 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.ecdh_rsa_rc4_128_sha", false); // TLS cipher-suite setting for ECDH RSA RC4 128 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.ecdhe_ecdsa_rc4_128_sha", false); // TLS cipher-suite setting for ECDHE ECDSA RC4 128 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.ecdhe_rsa_rc4_128_sha", false); // TLS cipher-suite setting for ECDHE RSA RC4 128 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.rsa_rc4_128_md5", false); // TLS cipher-suite setting for RSA RC4 128 MD5; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.rsa_rc4_128_sha", false); // TLS cipher-suite setting for RSA RC4 128 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.tls.unrestricted_rc4_fallback", false); // Allow fallback to obsolete insecure RC4 encryption.
user_pref("security.ssl3.dhe_dss_des_ede3_sha", false); // TLS cipher-suite setting for DHE DSS DES EDE3 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.dhe_rsa_des_ede3_sha", false); // TLS cipher-suite setting for DHE RSA DES EDE3 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.ecdh_ecdsa_des_ede3_sha", false); // TLS cipher-suite setting for ECDH ECDSA DES EDE3 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.ecdh_rsa_des_ede3_sha", false); // TLS cipher-suite setting for ECDH RSA DES EDE3 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.ecdhe_ecdsa_des_ede3_sha", false); // TLS cipher-suite setting for ECDHE ECDSA DES EDE3 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.ecdhe_rsa_des_ede3_sha", false); // TLS cipher-suite setting for ECDHE RSA DES EDE3 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.rsa_des_ede3_sha", false); // TLS cipher-suite setting for RSA DES EDE3 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.rsa_fips_des_ede3_sha", false); // TLS cipher-suite setting for RSA FIPS DES EDE3 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.deprecated.rsa_des_ede3_sha", false); // TLS cipher-suite setting for RSA DES EDE3 SHA; leave modern browser cipher defaults unchanged. [LEGACY: weak or removed cipher]
user_pref("security.ssl3.ecdh_rsa_aes_256_sha", false); // TLS cipher-suite setting for ECDH RSA AES 256 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.ecdh_ecdsa_aes_256_sha", false); // TLS cipher-suite setting for ECDH ECDSA AES 256 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.rsa_camellia_256_sha", false); // TLS cipher-suite setting for RSA CAMELLIA 256 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.rsa_aes_128_gcm_sha256", false); // TLS cipher-suite setting for RSA AES 128 GCM SHA256; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.rsa_aes_256_gcm_sha384", false); // TLS cipher-suite setting for RSA AES 256 GCM SHA384; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.ecdhe_ecdsa_chacha20_poly1305_sha256", true); // TLS cipher-suite setting for ECDHE ECDSA CHACHA20 POLY1305 SHA256; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.ecdhe_rsa_chacha20_poly1305_sha256", true); // TLS cipher-suite setting for ECDHE RSA CHACHA20 POLY1305 SHA256; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.dhe_rsa_camellia_256_sha", false); // TLS cipher-suite setting for DHE RSA CAMELLIA 256 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.dhe_rsa_aes_256_sha", false); // TLS cipher-suite setting for DHE RSA AES 256 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.dhe_dss_aes_128_sha", false); // TLS cipher-suite setting for DHE DSS AES 128 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.dhe_dss_aes_256_sha", false); // TLS cipher-suite setting for DHE DSS AES 256 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.dhe_dss_camellia_128_sha", false); // TLS cipher-suite setting for DHE DSS CAMELLIA 128 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.dhe_dss_camellia_256_sha", false); // TLS cipher-suite setting for DHE DSS CAMELLIA 256 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.rsa_aes_256_sha", false); // TLS cipher-suite setting for RSA AES 256 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.rsa_aes_128_sha", false); // TLS cipher-suite setting for RSA AES 128 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.ecdhe_rsa_aes_256_sha", false); // TLS cipher-suite setting for ECDHE RSA AES 256 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.ssl3.ecdhe_ecdsa_aes_256_sha", false); // TLS cipher-suite setting for ECDHE ECDSA AES 256 SHA; leave modern browser cipher defaults unchanged.
user_pref("security.tls.enable_kyber", true); // Older post-quantum TLS feature toggle; avoid forcing it. [VERIFY: newer builds may use ML-KEM controls]
user_pref("browser.ssl_override_behavior", 1); // Legacy behavior when adding exceptions for certificate errors.

// --- OBSOLETE — NOT APPLIED ---
// user_pref("network.security.esni.enabled", true); // Old ESNI control; ECH replaced ESNI in Firefox 85. [OBSOLETE]

// ============================================================================
// [11] WEB SECURITY, SAFE BROWSING & PERMISSIONS
// ============================================================================
// --- ACTIVE ---
user_pref("permissions.default.desktop-notification", 2); // Default desktop notification permission; 2 means block.
user_pref("dom.security.https_only_mode", true); // Use HTTPS-Only Mode and warn for HTTP-only websites.
user_pref("security.webauthn.always_allow_direct_attestation", false); // Automatically allow WebAuthn direct attestation when true.
user_pref("security.remote_settings.crlite_filters.enabled", true); // Enable CRLite certificate-revocation data.
user_pref("security.mixed_content.block_active_content", true); // Block active mixed HTTP content on HTTPS pages.
user_pref("security.fileuri.strict_origin_policy", true); // Enforce strict same-origin policy for file:// URLs.
user_pref("browser.safebrowsing.blockedURIs.enabled", true); // Block malicious URLs identified by Safe Browsing.
user_pref("browser.safebrowsing.enabled", true); // Legacy high-level Safe Browsing toggle; confirm support in your build.
user_pref("browser.safebrowsing.phishing.enabled", true); // Enable phishing protection.
user_pref("browser.safebrowsing.malware.enabled", true); // Enable malware protection.
user_pref("security.csp.enable", true); // Enforce Content Security Policy (CSP).
user_pref("security.sri.enable", true); // Enforce Subresource Integrity (SRI).
user_pref("security.insecure_field_warning.contextual.enabled", true); // Show warnings for insecure password fields.

// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("security.dialog_enable_delay", 1000); // Delay before enabling some privileged install confirmations (ms).
user_pref("security.mixed_content.block_display_content", true); // Block passive mixed content where supported.
user_pref("security.csp.experimentalEnabled", true); // Legacy experimental CSP feature flag.
user_pref("security.insecure_password.ui.enabled", true); // Legacy UI warning for passwords on HTTP pages.
user_pref("network.auth.subresource-http-auth-allow", 1); // Policy for HTTP authentication in subresource requests.
user_pref("network.file.disable_unc_paths", true); // Block Windows UNC network paths in file URL handling.
user_pref("browser.contentanalysis.enabled", false); // Enable enterprise content analysis features.
user_pref("browser.contentanalysis.default_result", 0); // Default result used by enterprise content analysis.
user_pref("network.jar.open-unsafe-types", false); // Allow unsafe JAR content types.

// --- OBSOLETE — NOT APPLIED ---
// user_pref("security.xpconnect.plugin.unrestricted", false); // Obsolete XPConnect privilege setting for old plugins. [OBSOLETE]

// ============================================================================
// [12] TABS, WINDOWS & STARTUP
// ============================================================================
// --- ACTIVE ---
user_pref("browser.ctrlTab.sortByRecentlyUsed", true); // Switch tabs in most-recently-used order with Ctrl+Tab.
user_pref("browser.tabs.groups.smart.enabled", false); // Enable Smart Tab Groups.
user_pref("browser.tabs.groups.smart.userEnabled", false); // Allow the user-facing Smart Tab Groups feature.
user_pref("browser.shell.checkDefaultBrowser", false); // Check whether Firefox/Zen is the system's default browser.
user_pref("browser.shell.didSkipDefaultBrowserCheckOnFirstRun", true); // Remember that the first-run default-browser check was skipped.
user_pref("browser.tabs.hoverPreview.enabled", false); // Show tab previews on mouse hover.
user_pref("browser.tabs.closeWindowWithLastTab", false); // Close a window after its last tab is closed.
user_pref("browser.privateWindowSeparation.enabled", false); // Separate Private windows in the OS taskbar grouping.
user_pref("browser.bookmarks.openInTabClosesMenu", false); // Close the Bookmarks menu after opening an item in a tab.
user_pref("browser.shell.shortcutFavicons", false); // Use website favicons for OS shortcuts.
user_pref("browser.overlink-delay", 10); // Delay before showing a hovered link target in the status area (ms).
user_pref("browser.backspace_action", 0); // Backspace behavior; 0 navigates back one page.
user_pref("browser.profiles.enabled", true); // Enable the newer Firefox Profiles feature.
user_pref("browser.startup.page", 3); // Startup mode; 3 restores previous windows and tabs.
user_pref("browser.onboarding.enabled", false); // Disable onboarding junk.
user_pref("browser.startup.windowsLaunchOnLogin.defaultEnabled", false); // Do not enable automatic launch at Windows login by default.


// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("browser.bookmarks.max_backups", 0); // Maximum number of automatic bookmark backups.
user_pref("browser.startup.homepage_override.mstone", "ignore"); // Version marker used for post-update welcome pages.
user_pref("browser.startup.homepage", "chrome://browser/content/blanktab.html"); // Startup homepage when session restore is not in use.
user_pref("browser.link.open_newwindow", 3); // Handle target=_blank links; 3 opens them in a new tab.
user_pref("browser.link.open_newwindow.restriction", 0); // Rules for converting JavaScript popups to tabs or windows.
user_pref("browser.startup.homepage_override.buildID", "20100101"); // Stored build ID for post-update page behavior.
user_pref("browser.startup.blankWindow", false); // Control display of a blank startup window.
user_pref("browser.taskbar.lists.enabled", false); // Enable Windows taskbar Jump Lists.
user_pref("browser.taskbar.lists.frequent.enabled", false); // Show frequently visited sites in Jump Lists.
user_pref("browser.taskbar.lists.maxListItemCount", 0); // Maximum number of Jump List entries.
user_pref("browser.taskbar.lists.refreshInSeconds", 2147483647); // Jump List refresh interval in seconds.
user_pref("browser.taskbar.lists.tasks.enabled", false); // Display browser tasks in Windows Jump Lists.
user_pref("browser.taskbar.previews.max", 0); // Maximum number of taskbar tab previews.


// ============================================================================
// [13] SEARCH & ADDRESS BAR
// ============================================================================
// --- ACTIVE ---
user_pref("network.IDN_show_punycode", true); // Display international domain names as Punycode instead of Unicode.
user_pref("browser.urlbar.suggest.calculator", true); // Show calculator results directly in the address bar.
user_pref("browser.urlbar.unitConversion.enabled", true); // Show unit conversions directly in the address bar.
user_pref("browser.urlbar.quicksuggest.enabled", false); // Enable extra Firefox Suggest results.
user_pref("browser.urlbar.trending.featureGate", false); // Enable trending searches in the address bar.
user_pref("browser.search.suggest.enabled", false); // Send queries to the search engine to request suggestions.
user_pref("browser.urlbar.trimHttps", true); // Hide the https:// prefix in the displayed address when possible.
user_pref("browser.urlbar.untrimOnUserInteraction.featureGate", true); // Reveal the complete URL on user interaction.
user_pref("browser.search.separatePrivateDefault.ui.enabled", true); // Show the UI for choosing a separate Private search engine.
user_pref("browser.search.update", true); // Allow updates to installed search-engine configurations.
user_pref("browser.urlbar.suggest.quicksuggest.nonsponsored", false); // Show nonsponsored Firefox Suggest results.
user_pref("browser.urlbar.suggest.quicksuggest.sponsored", false); // Show sponsored Firefox Suggest results.
user_pref("browser.urlbar.suggest.searches", false); // Show search-engine suggestions in the address bar.
user_pref("browser.search.separatePrivateDefault", true); // Allow a separate default search engine for Private Browsing.
user_pref("browser.tabs.searchclipboardfor.middleclick", false); // Search clipboard contents on middle-click where supported.
user_pref("browser.urlbar.showSearchTerms.enabled", false); // Display search terms instead of the result URL in the address bar.
user_pref("findbar.highlightAll", true); // Highlight every match when using Find in Page.

// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("browser.urlbar.autoFill", false); // Autocomplete addresses as you type.
user_pref("browser.urlbar.autoFill.typed", false); // Autocomplete addresses previously entered manually.
user_pref("browser.urlbar.autocomplete.enabled", false); // Older global address-bar autocomplete switch. [VERIFY: may no longer be used]
user_pref("browser.urlbar.groupLabels.enabled", false); // Display group labels in address-bar suggestions.
user_pref("browser.urlbar.addons.featureGate", false); // Enable addons suggestions in the address bar.
user_pref("browser.urlbar.amp.featureGate", false); // Enable amp suggestions in the address bar.
user_pref("browser.urlbar.importantDates.featureGate", false); // Enable importantDates suggestions in the address bar.
user_pref("browser.urlbar.market.featureGate", false); // Enable market suggestions in the address bar.
user_pref("browser.urlbar.mdn.featureGate", false); // Enable mdn suggestions in the address bar.
user_pref("browser.urlbar.weather.featureGate", false); // Enable weather suggestions in the address bar.
user_pref("browser.urlbar.wikipedia.featureGate", false); // Enable wikipedia suggestions in the address bar.
user_pref("browser.urlbar.yelp.featureGate", false); // Enable yelp suggestions in the address bar.
user_pref("browser.urlbar.yelpRealtime.featureGate", false); // Enable yelpRealtime suggestions in the address bar.
user_pref("browser.search.countryCode", "JP"); // Country code used for search engine configuration.
user_pref("browser.search.region", "JP"); // Geographic region used for search preferences.
user_pref("browser.search.geoip.url", ""); // IP-based location lookup endpoint for search region detection.
user_pref("browser.search.geoSpecificDefaults", false); // Older region-specific search defaults mechanism.
user_pref("browser.urlbar.trimURLs", true); // Legacy behavior for shortening displayed URLs.
user_pref("browser.urlbar.filter.javascript", true); // Filter javascript: entries from address-bar suggestions.
user_pref("browser.urlbar.suggest.history", false); // Suggest results from browsing history in the address bar.
user_pref("keyword.enabled", true); // Search when entered text does not resemble a URL.
user_pref("browser.fixup.alternate.enabled", false); // Try completing short hostnames with www or domain suffixes.
user_pref("browser.fixup.hide_user_pass", true); // Hide embedded username/password details in URL-related UI.

// ============================================================================
// [14] NEW TAB, HOMEPAGE & BROWSER PROMOTIONS
// ============================================================================
// --- ACTIVE ---
user_pref("browser.newtabpage.activity-stream.showSponsored", false); // Show sponsored content on the New Tab page.
user_pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false); // Show sponsored Top Sites on New Tab.
user_pref("browser.newtabpage.activity-stream.telemetry.ping.endpoint", ""); // Disable Activity Stream telemetry.
user_pref("browser.newtabpage.activity-stream.feeds.section.topstories", false); // Show Top Stories on New Tab.
user_pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons", false); // Show contextual add-on recommendations.
user_pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features", false); // Show contextual feature recommendations.
user_pref("browser.preferences.moreFromMozilla", false); // Display Mozilla product promotions in Settings.
user_pref("browser.uitour.enabled", false); // Enable the built-in user-interface tour.
user_pref("browser.discovery.enabled", false); // Enable browser discovery and suggestion content.
user_pref("browser.compactmode.show", true); // Show Compact density mode when available.
user_pref("browser.newtabpage.activity-stream.default.sites", ""); // Default suggested sites on New Tab.
user_pref("browser.newtabpage.activity-stream.showSponsoredCheckboxes", false); // Display options for sponsored content.
user_pref("browser.newtabpage.activity-stream.showWeather", false); // Show the weather widget on New Tab.
user_pref("browser.topsites.contile.enabled", false); // Enable Contile-provided Top Sites.
user_pref("browser.newtabpage.activity-stream.feeds.topsites", false); // Display frequent sites on New Tab.
user_pref("browser.pagethumbnails.capturing_disabled", true); // Disable capture of page thumbnails.
user_pref("browser.newtabpage.activity-stream.feeds.snippets", false); // Show older New Tab snippets/messages. [VERIFY: legacy snippets]
user_pref("browser.vpn_promo.enabled", false); // Display Mozilla VPN promotions.
user_pref("browser.chrome.site_icons", true); // Show site favicons in legacy browser chrome.

// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("browser.aboutwelcome.enabled", false); // Show the welcome/onboarding flow after installation or updates.
user_pref("browser.newtabpage.enabled", false); // Enable the built-in New Tab page.
user_pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr", false); // Older global contextual feature recommendation option. [VERIFY: split into sub-options]
user_pref("browser.aboutHomeSnippets.updateUrl", ""); // Update endpoint for old about:home snippets. [VERIFY: legacy mechanism]
user_pref("browser.newtabpage.activity-stream.enabled", false); // Enable the Activity Stream New Tab framework.
user_pref("lightweightThemes.update.enabled", false); // Update older lightweight Firefox themes.
user_pref("browser.pocket.enabled", false); // Old Pocket integration preference. [VERIFY: integration changed]
user_pref("browser.newtab.preload", false); // Preload New Tab page content.

// --- OBSOLETE — NOT APPLIED ---
// user_pref("browser.newtabpage.enhanced", false); // Legacy enhanced Directory Tiles on New Tab. [OBSOLETE]
// user_pref("browser.newtabpage.directory.ping", ""); // Legacy Directory Tiles tracking endpoint. [OBSOLETE]
// user_pref("browser.newtabpage.directory.source", "data:text/plain,{}"); // Legacy Directory Tiles content source. [OBSOLETE]
// user_pref("browser.newtab.url", "about:blank"); // Legacy New Tab URL override removed in Firefox 41. [OBSOLETE]

// ============================================================================
// [15] EXTENSIONS, BLOCKLIST & REMOTE SETTINGS
// ============================================================================
// --- ACTIVE ---
user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true); // Allow loading userChrome.css and userContent.css.
user_pref("extensions.ml.enabled", false); // Enable machine-learning APIs for extensions.
user_pref("extensions.htmlaboutaddons.recommendations.enabled", false); // Show extension recommendations in about:addons.
user_pref("extensions.webcompat.enable_shims", true); // Enable Firefox WebCompat compatibility shims.
user_pref("extensions.quarantinedDomains.enabled", true); // Protect sensitive domains through extension quarantine.
user_pref("extensions.update.enabled", true); // Check for and install extension updates.
user_pref("extensions.blocklist.enabled", true); // Use Mozilla's dangerous-extension blocklist.
//user_pref("services.settings.server", "https://firefox.settings.services.mozilla.com/v1"); // Mozilla Remote Settings base server; do not use an individual collection URL.
user_pref("extensions.blocklist.url", "https://firefox.settings.services.mozilla.com/v1/buckets/blocklists/collections/addons-bloomfilters/records"); //Uptodate Blocklist v3
user_pref("extensions.blocklist.useMLBF.stashes", true); // Enable efficient incremental MLBF updates
user_pref("extensions.blocklist.useMLBF", true); // Enable the Mozilla Laminar Bloom Filter (MLBF) blocklist mechanism.

// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("extensions.webextensions.restrictedDomains", ""); // Domains on which WebExtensions have restricted privileges; do not clear casually.
user_pref("extensions.postDownloadThirdPartyPrompt", false); // Warn about add-on installs from external sources.
user_pref("extensions.webcompat-reporter.enabled", false); // Enable the WebCompat reporting extension.
user_pref("extensions.pocket.enabled", false); // Older Pocket add-on integration setting. [VERIFY: legacy integration]
user_pref("services.blocklist.update_enabled", true); // Enable updates through the old blocklist mechanism.

// ============================================================================
// [16] AI, ML & AUTOMATION
// ============================================================================
// --- ACTIVE ---
user_pref("browser.ai.control.default", "blocked"); // Default browser AI policy; blocked disables access.
user_pref("browser.ml.enable", false); // Enable Firefox's machine-learning runtime.
user_pref("browser.ml.chat.enabled", false); // Enable AI chat sidebar features.
user_pref("browser.ml.linkPreview.enabled", false); // Enable machine-learning link previews.
user_pref("browser.ml.chat.menu", false); // Display AI Chat in browser menus.

// ============================================================================
// [17] DEVTOOLS, DEBUGGING & USERCHROME
// ============================================================================
// --- ACTIVE ---
user_pref("browser.aboutConfig.showWarning", false); // Display the about:config warning page.
user_pref("devtools.chrome.enabled", true); // Enable Browser Toolbox and chrome-context debugging.
user_pref("devtools.debugger.remote-enabled", true); // Allow remote/chrome debugging; review exposure carefully.
user_pref("devtools.debugger.prompt-connection", true); // Prompt before accepting a remote debugger connection.

// ============================================================================
// [18] UPDATES, TELEMETRY, STUDIES & EXPERIMENTS
// ============================================================================
// --- ACTIVE ---
user_pref("security.ssl.errorReporting.automatic", false); // Automatically submit SSL/TLS error reports.
user_pref("browser.newtabpage.activity-stream.telemetry", false); // Collect New Tab usage telemetry.
user_pref("browser.newtabpage.activity-stream.feeds.telemetry", false); // Collect New Tab feed telemetry.
user_pref("browser.tabs.crashReporting.sendReport", false); // Automatically send tab crash reports.
user_pref("app.update.auto", false); // Allow automatic Firefox/Zen updates. [WARNING: update portable Zen manually if disabled]
user_pref("app.update.service.enabled", false); // Use the Windows background update service.
user_pref("app.update.staging.enabled", false); // Stage updates before applying them.
user_pref("app.update.background.scheduling.enabled", false); // Schedule background update checks.
user_pref("browser.crashReports.unsubmittedCheck.autoSubmit2", false); // Automatically submit pending crash reports.
user_pref("browser.crashReports.unsubmittedCheck.enabled", false); // Check for crash reports that have not been submitted.
user_pref("datareporting.policy.dataSubmissionEnabled", false); // Allow diagnostic data submissions under the reporting policy.
user_pref("datareporting.healthreport.uploadEnabled", false); // Upload Firefox Health Report data.
user_pref("toolkit.telemetry.enabled", false); // Enable Firefox Telemetry, subject to the browser build's policy.
user_pref("toolkit.telemetry.unified", false); // Enable older Unified Telemetry functionality.
user_pref("toolkit.telemetry.archive.enabled", false); // Store local archived telemetry records.
user_pref("app.normandy.enabled", false); // Enable legacy Normandy experimentation. [VERIFY: migration to Nimbus is version-dependent]
user_pref("app.shield.optoutstudies.enabled", false); // Allow participation in Firefox Studies; false opts out.
user_pref("datareporting.usage.uploadEnabled", false); // Upload usage metrics.
user_pref("toolkit.telemetry.newProfilePing.enabled", false); // Send a telemetry ping on profile creation.
user_pref("toolkit.telemetry.shutdownPingSender.enabled", false); // Send telemetry when the browser closes.
user_pref("toolkit.telemetry.updatePing.enabled", false); // Send telemetry associated with updates.
user_pref("toolkit.telemetry.coverage.opt-out", true); // Opt out of Telemetry coverage measurements.
user_pref("toolkit.coverage.opt-out", true); // Opt out of toolkit coverage measurements.
user_pref("messaging-system.rsexperimentloader.enabled", false); // Load messaging/Nimbus experiments through Remote Settings.

// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("app.update.enabled", true); // Legacy updater master switch. [VERIFY: newer builds may ignore it]
user_pref("breakpad.reportURL", ""); // Legacy crash-report submission URL.
user_pref("toolkit.telemetry.server", "data:,"); // Telemetry collection server endpoint.
user_pref("toolkit.telemetry.bhrPing.enabled", false); // Send Browser Hang Reporter pings.
user_pref("toolkit.telemetry.firstShutdownPing.enabled", false); // Send telemetry at the first shutdown.
user_pref("toolkit.telemetry.hybridContent.enabled", false); // Disable Hybdrid Content telemetry.
user_pref("toolkit.coverage.endpoint.base", ""); // Endpoint for coverage measurements.
user_pref("app.normandy.api_url", ""); // Legacy Normandy API endpoint. [VERIFY: may be removed in newer builds]
user_pref("nimbus.rollouts.enabled", false); // Permit remote Nimbus feature rollouts where supported.
user_pref("datareporting.healthreport.service.enabled", false); // Enable the older Firefox Health Report service.
user_pref("network.allow-experiments", false); // Allow older experimental network features.

// --- OBSOLETE — NOT APPLIED ---
// user_pref("experiments.supported", false); // Old pre-Normandy experiments support flag. [OBSOLETE]
// user_pref("experiments.enabled", false); // Old pre-Normandy experiments enable flag. [OBSOLETE]
// user_pref("experiments.manifest.uri", ""); // Old experiments manifest URL. [OBSOLETE]

// ============================================================================
// [19] WEB APIS, OS INTEGRATION & EXTERNAL APPLICATIONS
// ============================================================================
// --- ACTIVE ---
user_pref("browser.translations.panelShown", true); // Remember whether the translation panel has been shown.
user_pref("browser.translations.select.enable", false); // Enable translation of selected text.
user_pref("browser.translations.automaticallyPopup", false); // Automatically open the translation panel when applicable.
user_pref("accessibility.force_disabled", 1); // Disable accessibility engine integration. // Can break screen readers and assistive technologies.

// --- REFERENCE ONLY — NOT APPLIED — OPTIONAL ---
user_pref("network.early-hints.preconnect.max_connections", 20); // Maximum preconnects initiated by HTTP 103 Early Hints.
user_pref("network.early-hints.enabled", true); // Enable HTTP 103 Early Hints processing.
user_pref("network.early-hints.preconnect.enabled", true); // Allow preconnects initiated by HTTP 103 Early Hints.
user_pref("browser.xul.error_pages.expert_bad_cert", true); // Show advanced certificate-error details.
user_pref("editor.truncate_user_pastes", false); // Limit or truncate unusually large pastes in protected contexts.
user_pref("network.gio.supported-protocols", ""); // Protocols that Linux GIO may open through system handlers.
user_pref("toolkit.winRegisterApplicationRestart", false); // Allow Windows to restart this application after a reboot.
user_pref("dom.disable_window_move_resize", true); // Prevent website scripts from moving or resizing windows.
user_pref("dom.serviceWorkers.enabled", false); // Enable Service Workers used for PWAs and offline caching.
user_pref("dom.webnotifications.enabled", false); // Enable the Web Notifications API.
user_pref("dom.enable_performance", false); // Enable the JavaScript Performance API.
user_pref("dom.enable_resource_timing", false); // Enable Resource Timing APIs.
user_pref("dom.enable_user_timing", false); // Enable performance marks and measures.
user_pref("dom.netinfo.enabled", false); // Expose network information to websites where supported.
user_pref("dom.network.enabled", false); // Older web-network API feature flag.
user_pref("dom.battery.enabled", false); // Enable the Battery Status API.
user_pref("device.sensors.enabled", false); // Enable device sensor APIs.
user_pref("dom.gamepad.enabled", false); // Enable the Gamepad API.
user_pref("dom.vr.enabled", false); // Older WebVR flag, distinct from modern WebXR.
user_pref("dom.vibrator.enabled", false); // Enable vibration APIs where supported.
user_pref("dom.archivereader.enabled", false); // Enable the legacy ArchiveReader API.
user_pref("javascript.options.wasm", false); // Enable WebAssembly.
user_pref("camera.control.face_detection.enabled", false); // Older camera face-detection feature flag.
user_pref("intl.accept_languages", "en-US, en"); // Preferred languages sent in HTTP Accept-Language.
user_pref("intl.locale.matchOS", false); // Older option to match browser locale with the OS.
user_pref("clipboard.autocopy", false); // Automatically copy selected text where supported by the OS.
user_pref("javascript.use_us_english_locale", true); // Older switch for U.S. English JavaScript locale conventions.
user_pref("network.manage-offline-status", false); // Follow OS network status when switching Offline mode.
user_pref("javascript.options.asmjs", false); // Enable legacy asm.js JavaScript optimizations.
user_pref("general.buildID.override", "20100101"); // Override the browser build ID for compatibility or spoofing.
user_pref("network.protocol-handler.warn-external-default", true); // Show a warning before opening external applications.
user_pref("network.protocol-handler.external.http", false); // Allow handing the http URI scheme to an external application.
user_pref("network.protocol-handler.external.https", false); // Allow handing the https URI scheme to an external application.
user_pref("network.protocol-handler.external.javascript", false); // Allow handing the javascript URI scheme to an external application.
user_pref("network.protocol-handler.external.moz-extension", false); // Allow handing the moz-extension URI scheme to an external application.
user_pref("network.protocol-handler.external.ftp", false); // Allow handing the ftp URI scheme to an external application.
user_pref("network.protocol-handler.external.file", false); // Allow handing the file URI scheme to an external application.
user_pref("network.protocol-handler.external.about", false); // Allow handing the about URI scheme to an external application.
user_pref("network.protocol-handler.external.chrome", false); // Allow handing the chrome URI scheme to an external application.
user_pref("network.protocol-handler.external.blob", false); // Allow handing the blob URI scheme to an external application.
user_pref("network.protocol-handler.external.data", false); // Allow handing the data URI scheme to an external application.
user_pref("network.protocol-handler.expose-all", false); // Expose all protocol handlers to the handler UI.
user_pref("network.protocol-handler.expose.http", true); // Expose the http scheme in the protocol-handler UI.
user_pref("network.protocol-handler.expose.https", true); // Expose the https scheme in the protocol-handler UI.
user_pref("network.protocol-handler.expose.javascript", true); // Expose the javascript scheme in the protocol-handler UI.
user_pref("network.protocol-handler.expose.moz-extension", true); // Expose the moz-extension scheme in the protocol-handler UI.
user_pref("network.protocol-handler.expose.ftp", true); // Expose the ftp scheme in the protocol-handler UI.
user_pref("network.protocol-handler.expose.file", true); // Expose the file scheme in the protocol-handler UI.
user_pref("network.protocol-handler.expose.about", true); // Expose the about scheme in the protocol-handler UI.
user_pref("network.protocol-handler.expose.chrome", true); // Expose the chrome scheme in the protocol-handler UI.
user_pref("network.protocol-handler.expose.blob", true); // Expose the blob scheme in the protocol-handler UI.
user_pref("network.protocol-handler.expose.data", true); // Expose the data scheme in the protocol-handler UI.
user_pref("browser.offline-apps.notify", true); // Prompt about legacy offline web application support.
user_pref("network.protocol-handler.external.mpv", true); // Allow websites to open the mpv:// protocol.

// --- OBSOLETE — NOT APPLIED ---
// user_pref("dom.mozTCPSocket.enabled", false); // Old privileged TCP Socket API; no longer available to ordinary websites. [OBSOLETE]
// user_pref("dom.telephony.enabled", false); // Old Web Telephony API, now removed. [OBSOLETE]
// user_pref("plugin.state.flash", 0); // Adobe Flash NPAPI plugin state; Flash support was removed. [OBSOLETE]
// user_pref("plugin.state.java", 0); // Java NPAPI plugin state; general NPAPI support was removed. [OBSOLETE]
// user_pref("dom.ipc.plugins.flash.subprocess.crashreporter.enabled", false); // Legacy crash reporting for the Flash plugin subprocess. [OBSOLETE]
// user_pref("dom.ipc.plugins.reportCrashURL", false); // Old NPAPI plugin crash URL reporting. [OBSOLETE]
// user_pref("plugin.state.libgnome-shell-browser-plugin", 0); // Old GNOME Shell NPAPI plugin state. [OBSOLETE]
// user_pref("plugins.click_to_play", true); // Old NPAPI click-to-play control. [OBSOLETE]
// user_pref("dom.flyweb.enabled", false); // Removed experimental FlyWeb API. [OBSOLETE]
// user_pref("loop.logDomains", false); // Logging for removed Firefox Hello/Loop. [OBSOLETE]
// user_pref("browser.casting.enabled", false); // Old Firefox Casting integration flag. [OBSOLETE]
// user_pref("plugins.update.notifyUser", true); // Old NPAPI plugin update notification setting. [OBSOLETE]

// ============================================================================
// [20] USERCHROME.JS PERF
// ============================================================================
user_pref("second-sidebar.allow-window-dragging", true);
user_pref("second-sidebar.animate-sidebar", true);
user_pref("second-sidebar.animate-web-panel-toolbar", true);
user_pref("second-sidebar.auto-hide", true);
user_pref("second-sidebar.auto-hide-back-button", false);
user_pref("second-sidebar.auto-hide-behavior", "overlay");
user_pref("second-sidebar.auto-hide-edge-gap", true);
user_pref("second-sidebar.auto-hide-forward-button", false);
user_pref("second-sidebar.container-indicator", "left");
user_pref("second-sidebar.default-floating-offset", "small");
user_pref("second-sidebar.hide-web-panel-when-hidden", false);
user_pref("second-sidebar.link-click-modifier", "altshift");
user_pref("second-sidebar.new-web-panel-position", "before");
user_pref("second-sidebar.new-web-panel-spaces", "all");
user_pref("second-sidebar.position", "left");
user_pref("second-sidebar.settings", "{\"position\":\"left\",\"padding\":\"xxsmall\",\"newWebPanelPosition\":\"before\",\"defaultFloatingOffset\":\"small\",\"autoHideBackButton\":false,\"autoHideForwardButton\":false,\"containerBorder\":\"left\",\"tooltip\":\"titleandurl\",\"tooltipFullUrl\":false,\"autoHideSidebar\":true,\"autoHideSidebarBehavior\":\"overlay\",\"sidebarWidgetHideWebPanel\":false,\"sidebarWidgetShortcut\":\"\",\"hideSidebarAnimated\":true,\"hideToolbarAnimated\":true,\"enableSidebarBoxHint\":false}");
user_pref("second-sidebar.show-geometry-hint", false);
user_pref("second-sidebar.show-open-menu-items", true);
user_pref("second-sidebar.show-preview-menu-items", true);
user_pref("second-sidebar.tooltip", "titleandurl");
user_pref("second-sidebar.tooltip-full-url", false);
user_pref("second-sidebar.width", "xxsmall");

// ============================================================================
// [21] ADVANCED FONT SETTINGS
// ============================================================================

user_pref("font.default.x-western", "serif"); // Use Serif as the default proportional font.
user_pref("font.size.variable.x-western", 16); // Set the proportional font size to 16px.
user_pref("font.name.serif.x-western", "JetBrainsMono Nerd Font"); // Set JetBrainsMono Nerd Font as the Serif font.
user_pref("font.name.sans-serif.x-western", "JetBrainsMono Nerd Font"); // Set JetBrainsMono Nerd Font as the Sans-serif font.
user_pref("font.name.monospace.x-western", "JetBrainsMono Nerd Font"); // Set JetBrainsMono Nerd Font as the Monospace font.
user_pref("font.size.monospace.x-western", 13); // Set the Monospace font size to 13px.
user_pref("font.minimum-size.x-western", 0); // Disable the minimum font size restriction.
user_pref("browser.display.use_document_fonts", 0); // Do not allow websites to override your font choices.

// ============================================================================
// END — Original values preserved; no new preferences added.
// ============================================================================
