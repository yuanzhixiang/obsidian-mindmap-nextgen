# Mindmap NextGen

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/verocloud/obsidian-mindmap-nextgen/release.yml?logo=github&style=for-the-badge)
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/verocloud/obsidian-mindmap-nextgen?style=for-the-badge&sort=semver)

Obsidian plugin to view your notes as mindmaps using [Markmap](https://markmap.js.org/).

[<img src="https://github.com/user-attachments/assets/dcbda58a-454d-4d45-93ee-0901449ce8c6" width="200">](https://checkout.revolut.com/pay/b8fb99ec-f2b0-4166-a58a-04d4d43d010f)

## Table of contents
+ [Fork-specific changes](#fork-specific-changes)
+ [Usage](#usage)
+ ["More options" menu](#more-options-menu)
  + [Pin/Unpin](#pinunpin)
  + [Copy screenshot](#copy-screenshot)
  + [Collapse all](#collapse-all)
  + [Toggle toolbar](#toggle-toolbar)
+ [Other features](#other-features)
  + [Checkboxes](#checkboxes)
  + [LaTeX](#latex)
  + [Syntax Highlighting](#syntax-highlighting)
+ [Frontmatter](#frontmatter)
+ [Settings](#settings)
  + [Coloring approaches](#coloring-approaches)
  + [Line thickness](#line-thickness)
  + [Highlight inline markmaps](#highlight-inline-markmaps)
  + [Use title as root node](#use-title-as-root-node)
  + [Markmap settings](#markmap-settings)
+ [Installing](#installing)
+ [Contributing](#contributing)

## Fork-specific changes

This fork contains additional behavior and maintenance changes beyond the upstream project.

### 1) Canvas scroll lock (new setting)

- Added a global setting: **Lock canvas scroll**.
- When enabled, markmap interaction is locked (`zoom`, `pan`, `scrollForPan` all disabled).
- Purpose: prevent accidental mindmap zoom/pan while you are scrolling notes.
- It now defaults to **enabled** in this fork.

### 2) Better first-open rendering (no zoom-in jump)

- Improved initial render for both:
  - inline ` ```markmap ` code blocks
  - standalone mindmap tabs
- First paint is now fit-to-view without transition animation.
- Added a stability fit strategy (multi-frame + double fit) to reduce cases where map stops before reaching best-fit.

### 3) UI polish for settings modal

- Adjusted spacing/layout in the **Edit block settings** modal header/content area.
- Goal: remove uneven top spacing and make `global / file / codeBlock` and first setting item align consistently.

### 4) Removed note-header action icon (fork preference)

- Disabled the extra right-top note header action button added by this plugin.
- Behavior is now opt-out by default in this fork (no automatic action icon registration).

### 5) Build/runtime compatibility fixes

- Added `esbuild-register` for stable `webpack.config.ts` loading in local environments.
- Updated webpack output path resolution for better compatibility across config loaders.
- Fixed a TypeScript typing issue in `nextTick()` implementation.

### 6) Added unit tests for fork changes

This fork adds/updates tests for the changes above, including:

- interaction option behavior for scroll lock
- initial fit-without-animation behavior
- render refresh trigger on `lockCanvasScroll` changes
- default settings expectation (`lockCanvasScroll` enabled)
- file settings button registration behavior (disabled by default, optional enable path)

Plus one existing test expectation was corrected to match current markdown-it behavior for links containing spaces in URL.

## Usage

Open the command palette (cmd/ctrl-p) and begin typing the name of one of the 2 commands.

<img width="720" alt="Command palette commands" src="https://user-images.githubusercontent.com/10291002/216599311-75ec8e62-3e99-4e09-abc3-86ff125ab308.png">

What's the difference between a pinned and an unpinned mindmap? A pinned mindmap is linked to a single Markdown document. An unpinned mindmap will update based on whichever document is the last one you clicked on.

You can also insert mindmaps inside your document using a Markdown code block tagged with "markmap". For example:

~~~
```markmap
# Mindmap
## Mindmap
```
~~~


## "More options" menu

This is the menu in the top right of each tab.

<img width="104" alt="image" src="https://user-images.githubusercontent.com/10291002/217636599-1b33270b-4887-4153-aa07-468255ccf5f2.png">


### Pin/Unpin

Switch the tab to unpinned, or pin it to the active document.

### Copy screenshot

Copy a PNG of the mindmap to the clipboard.
Background and text color are configurable in settings or the document's frontmatter.

### Collapse all

Closes all mindmap nodes, leaving just the root visible

### Toggle toolbar

Show or hide the toolbar in the bottom right of the mindmap


## Other Features

### Checkboxes

Checkboxes will be displayed in the mindmap like so:

```
# Housework
## Main
- [x] Dishes
- [ ] Cleaning the bathroom
- [x] Change the light bulbs
- [ ] something else
## [x] Also works on titles
```
![Mindmap checkbox example](images/mind-map-checkboxes.png)

### LaTeX
LaTex expressions will be rendered in your mindmaps. Surround an inline expression with a dollar sign on either side.

`$\frac{\partial f}{\partial t}$`

Or use two dollar signs for a multiline expression.
```
$$
\frac{\partial f}{\partial t}
$$
```

### Syntax Highlighting

This uses highlightjs for syntax highlighting, so you need to use highlightjs compatible colour schemes.
Here's a demonstration of all the colour schemes provided by highlightjs: https://highlightjs.org/examples
Once you've picked a colour scheme, you can download it from here: https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.11.1/styles/

Put the css file in your [Snippets](https://help.obsidian.md/Extending+Obsidian/CSS+snippets) folder and turn it on in Settings > Appearance.

tokyo-dark is a nice pair of themes for light and dark mode.
Mindmap Nextgen is not yet able to switch between light and dark mode syntax highlighting automatically


## Frontmatter

Some settings can be set in each document's frontmatter. Frontmatter settings take precedence over global settings, when set.

The plugin will use any of [markmap's settings](https://markmap.js.org/docs/json-options) except for `extraJs` and `extraCss`).

**Example:**
```markdown
---
markmap:
  screenshotTextColor: #28F48D
  highlight: true
  titleAsRootNode: true
---
```


## Settings

### Coloring approaches
There are three approaches to coloring the branches of the mindmap for you to choose from, either in plugin settings or each document's frontmatter.

#### Branch coloring
This mode will choose random colors per branch. "Color freeze level" decides at what depth the branches will stop changing colors.

#### Depth coloring
In this mode, branches are colored based on their depth in the mindmap. You can choose the first three levels' colors, plus a default color for levels deeper than three.

#### Single color
In this mode, all branches are the same color.


### Line thickness
Set line thickness for the first three depth levels, and a default thickness for levels beyond that.


### Highlight inline markmaps

Frontmatter setting: `highlight`

Add a background to inline markmaps to make them stand out from the rest of the page.


### Use title as root node

Frontmatter setting: `titleAsRootNode`

Generate mindmaps with the title at the bottom level, so you can avoid repeating the title.


### Screenshot settings

Frontmatter settings: `screenshotTextColor`, `screenshotBgColor`

Decide what colors the screenshot function will use.

Take screenshots via the ["More options" menu](#more-options-menu).


### Markmap settings

There is a section in the plugin settings for adjusting the shape and size of different parts of the mindmap. It might seem confusing at first. You'll have to fiddle around with different combinations of settings to get it the way you like.


## Contributing

### Running in development

* Clone this repo into your vault plugins folder.
  * This is at `<vault path>/.obsidian/plugins`
  * Use [Manage Vaults](https://help.obsidian.md/Files+and+folders/Manage+vaults) to find the path to your vault.
  * `cd <vault path>/.obsidian/plugins`
  * `git clone https://github.com/james-tindal/obsidian-mindmap-nextgen`
* Open the repo: `cd obsidian-mindmap-nextgen`
* Install dependencies: `pnpm i`
* Compile and watch for changes: `npm run dev`

&nbsp;
* Go to Settings > Community plugins in Obsidian.
* Ensure restricted mode is off
* Click the reload plugins button
* Enable Mindmap NextGen

### Releasing a new version

* ensure dependency installed: jq
* recommended (single-step on main): run `./release.sh <plugin-version> <minimum-obsidian-version>`
  * example: `./release.sh 0.0.1 1.0.0`
  * this updates `package.json` / `manifest.json` / `versions.json`, commits to `main`, pushes `main`, then creates and pushes the release tag
* legacy (two-step):
  * run `release-1.sh`
  * merge the created branch into main via pull request
  * run `release-2.sh` to create a tag which triggers a Github action to push the new release to the Obsidian plugins registry
