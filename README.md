
# Tab Highlight Plus 🎨

**Tab Highlight Plus** is a `userChrome.js` script for [Zen Browser](https://zen-browser.app/) that lets you highlight **tabs, folders, and tabs inside folders** using customizable colors.

Pick from a compact 64-color palette, a browser-native color chooser, or a Zen-inspired gradient picker—all from the tab or folder context menu. Choose between **full-background** and **border-only** highlighting, and keep your colors across browser restarts.

> [!NOTE]
> This is an unofficial browser-chrome customization, not a regular website userscript or a Zen Browser built-in feature. It depends on internal Firefox/Zen UI elements and may need updates when the browser changes.

## Features

- **64 preset colors** in a compact, full-width **8 × 8 grid**.
- **Two picker views in the same menu**:
  - **Normal picker:** preset swatches and the browser's native color input.
  - **Zen picker:** rainbow gradient, draggable selection circle, round presets, brightness slider, and HEX/RGB input.
- **Two highlight styles:** full background or border only.
- **Zen folder highlighting:** color only the folder header, or apply the folder color to its tabs and nested subfolders.
- **Individual tab overrides:** an explicitly colored tab keeps its own color even inside a colored folder.
- **Multi-tab support:** highlight multiple selected tabs together.
- **Automatic text contrast** for full-background highlights.
- **Smaller sidebar labels** (11px by default).
- **Alt + left-click** a tab to toggle a quick highlight.
- **Saved colors:** tab highlights are stored using Firefox SessionStore; folder highlights are saved using Zen folder IDs.

## Requirements

- **Zen Browser** (the folder features are Zen-specific).
- A working **fx-autoconfig / userChrome.js loader** that runs `.uc.js` files in the browser's main chrome window, such as [MrOtherGuy/fx-autoconfig](https://github.com/MrOtherGuy/fx-autoconfig).

> [!IMPORTANT]
> This script is **not** for Tampermonkey or Violentmonkey. It modifies the browser interface, not webpage content.

## Installation

1. Set up [fx-autoconfig](https://github.com/MrOtherGuy/fx-autoconfig) or another compatible `userChrome.js` loader, following its own installation instructions.
2. In Zen, open `about:support` and find your profile folder using **Open Folder** (wording may vary).
3. In your profile's `chrome/JS/` directory, create a file named **`TabHighlightPlus.uc.js`** and paste in the complete script.
4. Remove or disable older versions of this tab-highlighting script so they do not create duplicate menus or conflicting styles.
5. Go to `about:support`, select **Clear startup cache**, then fully restart Zen Browser.

For the `fx-autoconfig` layout used by this script, the file should look like this:

```text
<Zen profile>/
└── chrome/
    └── JS/
        └── TabHighlightPlus.uc.js
```

If your loader uses a different scripts directory, follow that loader's configuration instead.

## Usage

### Highlight a tab

1. **Right-click** a tab.
2. Open **Highlight Tab(s)**.
3. Choose a color from the **Normal picker**, switch to the **Zen picker**, or choose **Custom HEX / RGB…**.
4. To change the appearance, use **Highlight style → Full background** or **Border only**.

For the normal grid, clicking a swatch applies the color immediately. In the Zen picker, select your color and click **Apply color**.

### Highlight a folder and its contents

1. **Right-click** a Zen folder header.
2. Open **Highlight Folder**.
3. Under **Apply folder color to**, choose:
   - **Folder header only** — color just the folder header.
   - **Folder + all tabs & subfolders** — also color items inside the folder.
4. Choose **Full background** or **Border only**, then pick your color.

Tabs with their own explicit highlight take priority over inherited folder colors. Nested folders with their own highlight can also use a different color.

### Use a custom color

Supported input examples:

```text
#FF8800
#F80
rgb(255, 136, 0)
255,136,0
```

Use **Custom HEX / RGB…**, the **More colors** control, or the HEX/RGB input in the Zen picker. The last selected color is available through **Reuse custom**.

### Remove a highlight

Right-click a tab or folder, open its highlight menu, and choose **Remove highlight (None)**. A tab inside a highlighted folder may return to its inherited folder color after its individual highlight is removed.

### Quick highlight

**Alt + left-click** a tab to toggle the default quick-highlight color (`#C5DE92`).

## Customization

Edit the constants near the beginning of `TabHighlightPlus.uc.js`:

```js
const FONT_SIZE = '11px';
const QUICK_COLOR = '#C5DE92';
```

- Change `FONT_SIZE` to adjust sidebar tab and folder text size (for example, `'12px'`).
- Change `QUICK_COLOR` to choose the Alt-click highlight color.
- Edit the `PALETTE` array to replace any of the 64 preset colors.

After changing the script, clear the startup cache and restart the browser.

## How colors are saved

| Item | Storage | Behavior |
| --- | --- | --- |
| Individual tab color | Firefox `SessionStore` custom tab values | Restored with the tab's session when available |
| Tab highlight style | Firefox `SessionStore` custom tab values | Full or border-only mode per tab |
| Folder color, style, and scope | Firefox preferences, keyed by Zen folder ID | Reapplied to the matching folder after restart |
| Last custom color and default styles | Firefox preferences | Used for future selections |

Existing tab highlights from the earlier `highlighted_HT` script are designed to remain compatible.

## Troubleshooting

**The Highlight menu does not appear**

Check that your `userChrome.js` loader is installed correctly and that `TabHighlightPlus.uc.js` is loaded in the browser's main window. Confirm that older versions are disabled, clear the startup cache, and restart Zen.

**The folder header changes color, but tabs inside do not**

Choose **Highlight Folder → Apply folder color to → Folder + all tabs & subfolders**. Folder inheritance depends on Zen's internal folder/tab structure, which can change between releases.

**The color picker or menu looks wrong**

Check for other `userChrome.css` rules or browser mods affecting context menus, tab backgrounds, buttons, or popup sizing. Try disabling conflicting customizations temporarily.

**Colors disappear after restarting**

Check that the browser restores your tab session and that the folder retains its Zen folder ID. Colors attached to deleted/recreated folders may not follow a new ID.

**How do I check whether the script is running?**

Open the **Browser Console** (`Ctrl + Shift + J`) and look for a message similar to:

```text
[Tab Highlight Plus] v3.4.2 full-width color palette ready
```

## Compatibility and limitations

- Designed for **Zen Browser** using browser-chrome scripting; ordinary Firefox does not have Zen's folder UI.
- Internal Zen/Firefox markup and APIs are not stable, so future browser updates may require script changes.
- Folder inheritance follows Zen's current tab/folder membership data; custom sidebar mods may affect its behavior.
- Custom color input supports 3- and 6-digit HEX and RGB values, but not alpha transparency or HSL.
- The script was developed for the user's setup; compatibility with every Zen version, theme, and operating system is not guaranteed.

## Credits

- Inspired by the original tab-highlight `userChrome.js` script attributed to **Remia**.
- Browser-chrome customization powered by the [fx-autoconfig](https://github.com/MrOtherGuy/fx-autoconfig) ecosystem.
- Zen-inspired gradient picker design is an independent recreation for this script, not an official Zen Browser component.

## Feedback

Bug reports and improvement suggestions are welcome through GitHub Issues. When reporting a problem, include your **Zen Browser version**, **script version**, other active sidebar/menu customizations, and a screenshot or Browser Console error if possible.
