
<a id="top"></a>

<div align="center">

# 🦊 Firefox userChromeJS

**Small scripts. Better tabs. More control.**

A collection of browser-chrome customizations for **Firefox** and **Zen Browser** — from tab highlighting to YouTube tools and memory management.

[![Firefox](https://img.shields.io/badge/Firefox-userChromeJS-FF7139?logo=firefoxbrowser&logoColor=white)](https://www.mozilla.org/firefox/)
[![Zen Browser](https://img.shields.io/badge/Zen_Browser-compatible-6875D9)](https://zen-browser.app/)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL--2.0-blue)](LICENSE)

**[🚀 Install](#install) · [🎨 Appearance](#appearance) · [🧠 Memory](#memory) · [▶️ YouTube](#youtube) · [🛠 Help](#help)**

</div>

> [!NOTE]
> **Everything below is collapsed by default.** Click a section's arrow to read it. Install only the scripts you want.

### Choose a script

| Category | Script | In one sentence |
|:--|:--|:--|
| 🎨 Appearance | [**Tab Highlight Plus**](#tab-highlight) | Color tabs, Zen folders, and their contents. |
| 🖱️ Tabs | [**Double Click Duplicate Tab**](#duplicate-tab) | Double-click a tab to duplicate it. |
| 🧠 Memory | [**Extreme Memory Controller**](#extreme-memory) | Manage inactive tabs and request memory cleanup. |
| 🧹 Memory | [**Periodic Memory Cleaner**](#periodic-memory) | Request memory cleanup at a fixed interval. |
| 🌈 YouTube | [**YTColors26**](#yt-colors) | Color video cards by upload age. |
| ▶️ YouTube | [**YTPlaybackFixer**](#yt-playback) | Attempt playback recovery and preferred-quality selection. |

---

<a id="install"></a>
<details>
<summary><strong>🚀 01 · Getting started</strong> — Requirements & installation</summary>

#### What you need

- Firefox or Zen Browser with a working browser-chrome script loader, such as [**fx-autoconfig**](https://github.com/MrOtherGuy/fx-autoconfig).
- Access to your browser profile: `about:support` → **Profile Folder** → **Open Folder**.

#### Install in 4 steps

1. Install and configure your `userChrome.js` loader following its documentation.
2. Copy the desired files from [`chrome/JS`](chrome/JS) into the matching folder in your profile. **Keep required subfolders.**
3. Remove older copies of the *same* script to avoid duplicates.
4. In `about:support`, select **Clear startup cache** (if available), then fully restart your browser.

```text
<profile>/
└── chrome/
    └── JS/
        ├── dblclickDuplicateTab.uc.js
        ├── highlightTab.uc.js
        ├── extreme-memory-controller.uc.js
        ├── Periodically_clean_Firefox_memory.js
        ├── YTColors26.uc.js
        ├── YTColors26/
        │   └── YTColors26Child.sys.mjs
        ├── YTPlaybackFixer.uc.js
        └── YTPlaybackFixer/
            └── YTPlaybackFixerChild.sys.mjs
```

> [!IMPORTANT]
> The two YouTube scripts need their respective `.sys.mjs` child modules **and** a working `chrome://userscripts/content/` mapping. A `.uc.js` file alone is insufficient. The memory-cleaner file has a plain `.js` extension; your loader may require explicit registration or renaming.

These are **privileged browser scripts**, not Tampermonkey/Violentmonkey scripts. Browser updates can break internal APIs or selectors.

[↑ Back to top](#top)

</details>

<a id="appearance"></a>
<a id="tab-highlight"></a>
<details>
<summary><strong>🎨 02 · Tab Highlight Plus</strong> — Color tabs & Zen folders</summary>

**File:** [`highlightTab.uc.js`](chrome/JS/highlightTab.uc.js) · **Version:** 3.4.2

**What it offers**

- 64 preset colors in a compact **8 × 8** grid.
- **Normal** and **Zen-style** pickers in the same menu; HEX/RGB values supported.
- **Full background** or **Border only** styling.
- Color **only the folder header** or **the folder and its contents**.
- Individual tab color overrides, multi-tab selection, saved colors, and automatic text contrast.

**How to use:** Right-click a tab → **Highlight Tab(s)**; or right-click a Zen folder → **Highlight Folder**. **Alt + left-click** a tab to toggle the quick color.

**Quick customization:** Edit these values at the top of the script:

```js
const FONT_SIZE = '11px';
const QUICK_COLOR = '#C5DE92';
```

Folder inheritance uses Zen-specific internals, so it may be affected by browser updates or other sidebar mods.

[↑ Back to top](#top)

</details>

<a id="duplicate-tab"></a>
<details>
<summary><strong>🖱️ 03 · Double Click Duplicate Tab</strong> — Faster tab duplication</summary>

**File:** [`dblclickDuplicateTab.uc.js`](chrome/JS/dblclickDuplicateTab.uc.js) · **Version:** 1.0

**Double-click an existing tab** to duplicate it and switch to the copy.

To duplicate **in the background**, use the alternative `gBrowser.duplicateTab(tab)` line already included in the script instead of assigning `gBrowser.selectedTab`.

[↑ Back to top](#top)

</details>

<a id="memory"></a>
<a id="extreme-memory"></a>
<details>
<summary><strong>🧠 04 · Extreme Memory Controller</strong> — Idle tab management</summary>

**File:** [`extreme-memory-controller.uc.js`](chrome/JS/extreme-memory-controller.uc.js) · **Version:** 34.3

Monitors tab activity, detects audio/Picture-in-Picture, attempts suspension, discards eligible inactive tabs, and requests memory cleanup.

| Setting | Default |
|:--|--:|
| Suspend inactive regular tabs | 10 min |
| Discard inactive regular tabs | 15 min |
| Discard inactive **pinned** tabs | 25 min |
| Memory cleanup | Every 30 min |

**Customize:** `IDLE_SUSPEND`, `IDLE_DISCARD`, `PINNED_DISCARD`, and `CLEAN_MEMORY_PERIOD` near the top of the file.

> [!CAUTION]
> This script can interrupt background activity and unload tabs, **including pinned tabs**. Unsaved work may be lost. Test cautiously; its suspension API is browser-version-dependent.

[↑ Back to top](#top)

</details>

<a id="periodic-memory"></a>
<details>
<summary><strong>🧹 05 · Periodic Memory Cleaner</strong> — Simple timed cleanup</summary>

**File:** [`Periodically_clean_Firefox_memory.js`](chrome/JS/Periodically_clean_Firefox_memory.js)

Requests Firefox garbage collection and memory minimization at a configurable interval; it does **not** guarantee lower RAM usage.

```js
const cleanMemory_period = 2 * 60 * 1000; // 2 minutes
```

**Tip:** Try this script **or** Extreme Memory Controller first, not both at once. The source header credits [garywill/firefoxtaskmonitor](https://github.com/garywill/firefoxtaskmonitor) and notes testing with Firefox 102.

[↑ Back to top](#top)

</details>

<a id="youtube"></a>
<a id="yt-colors"></a>
<details>
<summary><strong>🌈 06 · YTColors26</strong> — YouTube age-based video borders</summary>

**Files:** [`YTColors26.uc.js`](chrome/JS/YTColors26.uc.js) + [`YTColors26Child.sys.mjs`](chrome/JS/YTColors26/YTColors26Child.sys.mjs)

- Colors video cards based on their upload age; includes live/upcoming categories.
- Dims older video cards and can mark the last-seen subscriptions video.
- Uses visibility-based processing and reacts to new cards during infinite scrolling.

**Customize:** Edit `COLORS` and `OLD_OPACITY` in the **child module**. YouTube layout and localized age labels can affect detection.

[↑ Back to top](#top)

</details>

<a id="yt-playback"></a>
<details>
<summary><strong>▶️ 07 · YTPlaybackFixer</strong> — Playback recovery & quality control</summary>

**Files:** [`YTPlaybackFixer.uc.js`](chrome/JS/YTPlaybackFixer.uc.js) + [`YTPlaybackFixerChild.sys.mjs`](chrome/JS/YTPlaybackFixer/YTPlaybackFixerChild.sys.mjs)

- Tries to recover from playback errors, stalls, and buffering problems.
- Adds playback status/quality controls near supported YouTube video titles.
- Offers quality requests from lower resolutions through `hd1080`, `hd1440`, `hd2160`, and `highres`, plus `auto` / `Disable`.

> [!WARNING]
> YouTube can override quality API requests. **Selecting 4K does not guarantee 4K playback.** Confirm with **Settings → Quality** and **Stats for Nerds**. Recovery may restart playback.

The child module retains attribution to upstream **YouTube – Playback Fixer** by brizzle.

[↑ Back to top](#top)

</details>

<a id="help"></a>
<details>
<summary><strong>🛠️ 08 · Troubleshooting</strong> — Common fixes</summary>

| Problem | First thing to check |
|:--|:--|
| Script/menu doesn't appear | Loader configuration, correct path, startup cache, duplicate scripts. |
| YouTube actor fails | Correct `.sys.mjs` companion path and `chrome://userscripts/content/` mapping. |
| Zen folder children stay uncolored | **Highlight Folder → Apply folder color to → Folder + all tabs & subfolders**. |
| Colors disappear on restart | Restored tab session / unchanged Zen folder ID. |
| Playback quality doesn't change | Verify actual quality in **Stats for Nerds**; YouTube may override it. |
| Tabs reload unexpectedly | Disable memory-controller scripts or lengthen inactivity timeouts. |

**Browser Console:** `Ctrl + Shift + J` — include relevant errors, your Firefox/Zen version, and the script name when [reporting an issue](https://github.com/R3mia/Firefox-userChromejs/issues).

[↑ Back to top](#top)

</details>

<details>
<summary><strong>📜 09 · License, credits & contributions</strong></summary>

This repository includes an [MPL-2.0 license](LICENSE). Individual scripts can also include third-party copyright and license notices; **preserve those notices** when reusing code.

**Acknowledgements:** [fx-autoconfig](https://github.com/MrOtherGuy/fx-autoconfig) · [Ulf3000 / Firefox Highlight Tabs](https://github.com/Ulf3000/Firefox-Highlight-Tabs) · [garywill / firefoxtaskmonitor](https://github.com/garywill/firefoxtaskmonitor) · brizzle (YouTube Playback Fixer upstream).

Contributions and compatibility reports are welcome: [**Open an issue**](https://github.com/R3mia/Firefox-userChromejs/issues) or submit a pull request. Include your browser version, loader, affected script, and reproduction steps.

[↑ Back to top](#top)

</details>

---

<div align="center">

**[↑ Back to top](#top) · [Browse all scripts](chrome/JS) · [Report an issue](https://github.com/R3mia/Firefox-userChromejs/issues)**

<sub>Community-maintained experiments · Not affiliated with Mozilla, Zen Browser, or YouTube</sub>

</div>
