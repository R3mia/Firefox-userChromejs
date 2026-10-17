
# 🦊 Firefox userChromeJS

**A collection of Firefox and Zen Browser UI tweaks, tab tools, memory utilities, and YouTube enhancements.** Built for browser-chrome JavaScript loaders such as [fx-autoconfig](https://github.com/MrOtherGuy/fx-autoconfig).

**[Browse scripts](chrome/JS) · [Report an issue](https://github.com/R3mia/Firefox-userChromejs/issues) · [License](LICENSE)**

> Click any section below to expand it. **Every section starts closed.**

---

<details>
<summary><strong>📚 Script overview</strong></summary>

| Script | What it does | Platform |
| --- | --- | --- |
| [dblclickDuplicateTab.uc.js](chrome/JS/dblclickDuplicateTab.uc.js) | Double-click a tab to duplicate it and switch to the copy. | Firefox / Zen |
| [highlightTab.uc.js](chrome/JS/highlightTab.uc.js) | Color tabs and Zen folders with a compact palette and two color pickers. | Firefox / Zen; folder tools require Zen |
| [extreme-memory-controller.uc.js](chrome/JS/extreme-memory-controller.uc.js) | Monitor inactive tabs, attempt suspension/discard, and request periodic memory cleanup. | Firefox / Zen (experimental) |
| [Periodically_clean_Firefox_memory.js](chrome/JS/Periodically_clean_Firefox_memory.js) | Request Firefox memory minimization at a configurable interval. | Firefox / Zen (legacy script) |
| [YTColors26.uc.js](chrome/JS/YTColors26.uc.js) | Add age-based video borders, old-video dimming, and a subscriptions marker on YouTube. | YouTube in Firefox / Zen |
| [YTPlaybackFixer.uc.js](chrome/JS/YTPlaybackFixer.uc.js) | Attempt YouTube playback recovery and expose preferred-quality controls. | YouTube in Firefox / Zen (experimental) |

**Each script is optional.** Install only what you need. The YouTube scripts require their corresponding `.sys.mjs` files (see Installation).

</details>

<details>
<summary><strong>🧩 Requirements and compatibility</strong></summary>

- Firefox or **Zen Browser** with a working **browser-chrome JavaScript loader**, for example [MrOtherGuy/fx-autoconfig](https://github.com/MrOtherGuy/fx-autoconfig).
- Access to your browser's profile directory (`about:support` → **Profile Folder** → **Open Folder**).
- A loader configuration that loads scripts from `chrome/JS/` (or the path specified by your own loader).
- For **YTColors26** and **YTPlaybackFixer**, the loader must also expose child modules at the `chrome://userscripts/content/` paths referenced in the scripts.

> [!IMPORTANT]
> These are **privileged browser UI scripts**, not Tampermonkey/Violentmonkey webpage userscripts. Firefox/Zen internals change over time, and the scripts have **not** been verified against every version, theme, or operating system.

</details>

<details>
<summary><strong>📥 Installation</strong></summary>

1. Install and configure [fx-autoconfig](https://github.com/MrOtherGuy/fx-autoconfig), following its own instructions for your browser/version.
2. Open `about:support` and click **Open Folder** next to your profile folder.
3. Copy the script(s) you want into the loader's `chrome/JS/` directory, keeping any required subfolders.
4. Remove older versions of the **same** script to avoid duplicate menus, event listeners, or actor registrations.
5. In `about:support`, choose **Clear startup cache** (when available), then **fully restart** Firefox/Zen.

Expected paths for the files documented here:

```text
<browser profile>/
└── chrome/
    └── JS/
        ├── dblclickDuplicateTab.uc.js
        ├── extreme-memory-controller.uc.js
        ├── highlightTab.uc.js
        ├── Periodically_clean_Firefox_memory.js
        ├── YTColors26.uc.js
        ├── YTColors26/
        │   └── YTColors26Child.sys.mjs
        ├── YTPlaybackFixer.uc.js
        └── YTPlaybackFixer/
            └── YTPlaybackFixerChild.sys.mjs
```

**YouTube dependencies:** Do **not** install only the `.uc.js` entry point. Keep its matching folder and `.sys.mjs` child module, otherwise the actor will not start.

**Legacy memory cleaner:** `Periodically_clean_Firefox_memory.js` ends in `.js`, not `.uc.js`. Some loaders may require you to rename or explicitly register it; follow your loader's discovery rules.

</details>

<details>
<summary><strong>🖱️ Double Click Duplicate Tab</strong></summary>

**File:** [`dblclickDuplicateTab.uc.js`](chrome/JS/dblclickDuplicateTab.uc.js) · **Version:** 1.0

Double-click an existing tab to make a duplicate and automatically switch to the new tab.

To create the duplicate **in the background** instead, edit the script: comment out the line that assigns `gBrowser.selectedTab` and enable the alternative `gBrowser.duplicateTab(tab)` line already included in the source.

This depends on browser tab internals, so behavior may differ with custom tab bars.

</details>

<details>
<summary><strong>🎨 Tab Highlight Plus — Tabs & Zen Folders</strong></summary>

**File:** [`highlightTab.uc.js`](chrome/JS/highlightTab.uc.js) · **Version:** 3.4.2

- **64 preset colors** in a full-width 8 × 8 grid.
- **Normal picker:** preset colors and a native color input.
- **Zen-style picker:** gradient pad, circular color presets, brightness slider, and HEX/RGB entry.
- **Full background** and **Border only** tab/folder styles.
- Zen folder options for **Folder header only** or **Folder + all tabs & subfolders**.
- Explicitly colored tabs take priority over inherited folder colors.
- Multiple selected tabs, automatic text contrast, and compact **11px** sidebar labels.
- Saved tab colors via Firefox SessionStore and folder colors via browser preferences.

**Use it:** Right-click a tab → **Highlight Tab(s)**, or right-click a Zen folder header → **Highlight Folder**. Use **Alt + left-click** on a tab to toggle the quick color.

**Custom color examples:** `#F80`, `#FF8800`, `rgb(255,136,0)`, `255,136,0`.

**Customize:** Near the top of the file, change:

```js
const FONT_SIZE = '11px';
const QUICK_COLOR = '#C5DE92';
```

You can also edit the `PALETTE` array. Folder appearance and inheritance depend on Zen's internal markup and may need adjustments after browser updates.

</details>

<details>
<summary><strong>🧠 Extreme Memory Controller</strong></summary>

**File:** [`extreme-memory-controller.uc.js`](chrome/JS/extreme-memory-controller.uc.js) · **Version:** 34.3

A more aggressive tab-management experiment. It monitors idle time, skips the selected tab and tabs detected as playing audio or Picture-in-Picture, attempts to suspend inactive tabs, discards eligible tabs, and requests Firefox memory minimization.

Default values in the script:

| Setting | Default | Purpose |
| --- | --- | --- |
| `IDLE_SUSPEND` | `10` minutes | Attempt to suspend inactive, unpinned tabs. |
| `IDLE_DISCARD` | `15` minutes | Discard eligible inactive, unpinned tabs. |
| `PINNED_DISCARD` | `25` minutes | Pinned tabs are **not exempt** from discard. |
| `TAB_BATCH` | `15` tabs | Number of tabs scanned per batch. |
| `OPTIMIZE_INTERVAL` | `15000` ms | Tab-scan interval. |
| `CLEAN_MEMORY_PERIOD` | `30*60*1000` ms | Memory cleanup about every 30 minutes. |

The script also logs a tab status/score report to the Browser Console roughly every 30 seconds.

> [!CAUTION]
> This script may stop activity or unload a page without asking. **Unsaved form data, in-progress tasks, and even pinned tabs could be affected.** Its suspension logic uses browser internals that may no longer work in all versions. Test with nonessential tabs and adjust timeouts before routine use.

</details>

<details>
<summary><strong>🧹 Periodically Clean Firefox Memory</strong></summary>

**File:** [`Periodically_clean_Firefox_memory.js`](chrome/JS/Periodically_clean_Firefox_memory.js)

A simpler, older periodic memory-cleanup script originally credited in its header to **garywill** ([firefoxtaskmonitor](https://github.com/garywill/firefoxtaskmonitor)). The header notes testing on Firefox 102 with xiaoxiaoflood's loader.

The cleanup interval is set in milliseconds:

```js
const cleanMemory_period = 2*60*1000; // 2 minutes
```

It requests garbage collection and memory minimization in the first browser window. This is **not** a guaranteed reduction in actual RAM usage.

> [!TIP]
> **Pick one memory-cleanup strategy first.** Extreme Memory Controller already requests periodic memory minimization; running both can cause redundant cleanup activity.

</details>

<details>
<summary><strong>🌈 YTColors26 — YouTube Video Age Colors</strong></summary>

**Files:** [`YTColors26.uc.js`](chrome/JS/YTColors26.uc.js) + [`YTColors26Child.sys.mjs`](chrome/JS/YTColors26/YTColors26Child.sys.mjs)

The `.uc.js` entry point registers a Firefox window actor. The child module handles YouTube cards and styles their borders by upload age, including live/upcoming categories. It also dims older videos and keeps track of a last-seen subscription video marker.

- Uses `IntersectionObserver` and batched updates to reduce unnecessary work.
- Handles new cards loaded as you scroll and YouTube's single-page navigation.
- Styles videos in supported list/grid contexts with rounded borders.

Adjust age-category colors in the child module's `COLORS` object. Adjust old-video dimming with:

```js
const OLD_OPACITY = '0.4'; // Current repository value
```

`1.0` means no dimming; smaller values dim the entire old-video card more strongly. Age identification depends on YouTube metadata and can be affected by locale or YouTube UI changes.

</details>

<details>
<summary><strong>▶️ YTPlaybackFixer — YouTube Recovery & Quality</strong></summary>

**Files:** [`YTPlaybackFixer.uc.js`](chrome/JS/YTPlaybackFixer.uc.js) + [`YTPlaybackFixerChild.sys.mjs`](chrome/JS/YTPlaybackFixer/YTPlaybackFixerChild.sys.mjs)

Registers the `YTPlaybackFixerV5` window actor and runs a YouTube playback monitor. The child module attempts recovery from playback errors, prolonged stalls, and empty/critical buffering. It also adds a recovery counter and a quality selector near supported video titles.

Quality options include `highres`, `hd2160`, `hd1440`, `hd1080`, `hd720`, lower qualities, `auto`, and `Disable`.

- **`auto`:** Do not enforce a fixed quality.
- **`Disable`:** Disable playback recovery and quality enforcement in the script.
- **Specific quality:** Request the chosen quality using YouTube's player APIs.

> [!WARNING]
> YouTube can ignore or override quality requests. **A successful API call or installed hook does not guarantee that playback actually switched resolution.** Confirm using YouTube **Settings → Quality** and **Stats for Nerds**. Automatic recovery can also restart or reload video playback.

The child module is an adaptation based on **YouTube – Playback Fixer v4.3 by brizzle**, whose MIT notice is retained in the file.

</details>

<details>
<summary><strong>🔧 Troubleshooting</strong></summary>

**No custom menu / no script effect?** Confirm the script loader is installed and enabled, the file is in the right loader directory, and there are no duplicate versions. Clear the startup cache and restart.

**YouTube actor isn't starting?** Verify the `.sys.mjs` companion file exists at exactly the path referenced by the `.uc.js` entry point, including case, and that `chrome://userscripts/content/` resolves in your loader.

**Folder color isn't inherited?** In **Highlight Folder → Apply folder color to**, choose **Folder + all tabs & subfolders**. Zen updates can change its folder membership APIs and CSS structure.

**Video borders, quality, or playback recovery behave differently?** YouTube changes its HTML and internal player API regularly. Check the Browser Console with **Ctrl + Shift + J** and include any errors in an issue.

**Memory cleanup causes tab reloads or interruptions?** Disable Extreme Memory Controller and/or increase its configured idle timeouts. Don't run both cleanup scripts until you've compared their behavior.

When opening a [bug report](https://github.com/R3mia/Firefox-userChromejs/issues), include your browser version, loader, installed script(s), relevant console errors, and a screenshot if helpful.

</details>

<details>
<summary><strong>⚠️ Safety notes and limitations</strong></summary>

- These scripts run with **privileged browser access**. Read the source before enabling unfamiliar scripts, and keep a backup of your browser profile.
- This collection is **experimental and version-sensitive**; it isn't an official Mozilla, Zen Browser, or YouTube project.
- Aggressive memory scripts can interrupt background work or unload tabs.
- YouTube appearance and playback behavior depend on interfaces outside this repository's control.
- Use or adapt individual scripts according to their applicable copyright and license notices.

</details>

<details>
<summary><strong>📜 License and credits</strong></summary>

This repository contains a [Mozilla Public License 2.0](LICENSE) file. **Preserve copyright and license notices included in individual scripts**, which may contain third-party code under different terms.

Acknowledgements:

- [MrOtherGuy / fx-autoconfig](https://github.com/MrOtherGuy/fx-autoconfig) — browser-chrome script loader.
- [Ulf3000 / Firefox Highlight Tabs](https://github.com/Ulf3000/Firefox-Highlight-Tabs) — original tab-highlighting concept.
- [garywill / firefoxtaskmonitor](https://github.com/garywill/firefoxtaskmonitor) — credited source for the periodic memory-cleaning script.
- **brizzle** — upstream YouTube Playback Fixer, credited with an MIT license notice in the playback child module.

</details>

<details>
<summary><strong>🤝 Feedback and contributions</strong></summary>

Pull requests, compatibility reports, fixes, and suggestions are welcome. Please describe the change, indicate which browser version you tested, and keep attribution/license headers intact.

- [Open an issue](https://github.com/R3mia/Firefox-userChromejs/issues)
- [Browse the scripts](chrome/JS)
- [Return to repository](https://github.com/R3mia/Firefox-userChromejs)

</details>
