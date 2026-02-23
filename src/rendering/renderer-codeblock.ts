import { ButtonComponent, Editor, EditorPosition, Platform } from 'obsidian'
import autoBind from 'auto-bind'
import GrayMatter from 'gray-matter'

import { CodeBlockSettings, FileSettings, globalSettings, GlobalSettings } from 'src/settings/filesystem'
import { cssClasses } from 'src/constants'
import { assert, isObjectEmpty, notNullish } from 'src/utilities/utilities'
import { createMarkmap, getOptions, transformMarkdown, splitMarkdown } from 'src/rendering/renderer-common'
import { renderCodeblocks$ } from 'src/rendering/style-features'
import Callbag, { dragAndDrop, fromEvent } from 'src/utilities/callbag'
import { CodeBlockSettingsDialog } from 'src/settings/dialogs'
import { CodeBlock } from 'src/new/codeBlockHandler'
import { svgs } from 'src/internal-links/handle-internal-links'
import { strings } from 'src/translation'
import { fitWithoutAnimation } from './fit-without-animation'
import { applyMobileCodeblockLayout, shouldPreferHeightLayout } from './mobile-codeblock-layout'


export type CodeBlockRenderer = ReturnType<typeof CodeBlockRenderer>
export function CodeBlockRenderer(codeBlock: CodeBlock) {
  const { component, containerEl, markdownView, editor, file } = codeBlock

  // createMarkmap should take the full markdown and render
  // transformMarkdown should be merged into this
  const { markmap, svg } = createMarkmap({ parent: containerEl, toolbar: false })

  svgs.register(component, svg, file)

  const fileText = editor.getValue()
  const { settings: fileSettings } = splitMarkdown('file', fileText)
  const { settings: codeBlockSettings, body } = splitMarkdown('codeBlock', codeBlock.markdown)
  const rootNode = transformMarkdown(codeBlock.markdown)
  const settings = new SettingsManager(codeBlock, fileSettings, codeBlockSettings)

  SizeManager(component, containerEl, svg, settings)

  if (markdownView.getMode() === 'source')
    SettingsDialog(codeBlock, body, codeBlockSettings, fileSettings, editor)

  void render(true)

  Callbag.subscribe(renderCodeblocks$, () => {
    void render()
  })

  async function render(initial = false) {
    const markmapOptions = getOptions(settings.merged)
    await markmap.setData(rootNode,
      initial
        ? { ...markmapOptions, duration: 0 }
        : markmapOptions)

    const preferHeightLayoutBeforeFit = shouldPreferHeightLayout(containerEl, Platform.isMobile)
    applyMobileCodeblockLayout(markmap, containerEl, preferHeightLayoutBeforeFit)

    if (initial)
      await fitWithoutAnimation(markmap)

    // Re-apply after fit/resize settles so mobile horizontal-scroll state persists.
    const preferHeightLayoutAfterFit = shouldPreferHeightLayout(containerEl, Platform.isMobile)
    applyMobileCodeblockLayout(markmap, containerEl, preferHeightLayoutAfterFit)

    const { classList } = containerEl.parentElement!
    settings.merged.highlight
      ? classList.add   (cssClasses.highlight)
      : classList.remove(cssClasses.highlight)
  }
}

class SettingsManager {
  private newHeight: number | undefined
  private readonly DEFAULT_HEIGHT = 150
  private settings: {
    global: GlobalSettings
    file: FileSettings
    codeBlock: CodeBlockSettings
  }

  constructor(
    private codeBlock: CodeBlock,
    fileSettings: FileSettings,
    codeBlockSettings: CodeBlockSettings
  ) {
    autoBind(this)
    this.settings = {
      global: globalSettings,
      file: fileSettings,
      codeBlock: codeBlockSettings
    }
  }

  get merged(): CodeBlockSettings {
    return { ...this.settings.global, ...this.settings.file, ...this.settings.codeBlock, height: this.height }
  }

  set global(s: GlobalSettings) {
    this.settings.global = s
  }

  set file(s: FileSettings) {
    this.settings.file = s
  }

  get height() {
    return this.newHeight ?? this.settings.codeBlock.height ?? this.DEFAULT_HEIGHT
  }
  set height(height: number) {
    if (height === this.settings.codeBlock.height)
      this.newHeight = undefined
    else
      this.newHeight = height
  }

  saveHeight() {
    if (this.newHeight === undefined) return
    this.updateFrontmatter(settings => {
      settings.height = this.height
    })
    this.newHeight = undefined
  }

  private updateFrontmatter(update: (settings: CodeBlockSettings) => void) {
    const editor = this.codeBlock.editor
    const sectionInfo = this.codeBlock.getSectionInfo()
    assert(notNullish, sectionInfo)
    const lineStart = EditorLine(sectionInfo.lineStart + 1)
    const lineEnd   = EditorLine(sectionInfo.lineEnd)

    const text = editor.getRange(lineStart, lineEnd)

    const gm = GrayMatter(text)
    gm.data.markmap ??= {}
    update(gm.data.markmap)
    isObjectEmpty(gm.data.markmap) && delete gm.data.markmap

    editor.replaceRange(
      GrayMatter.stringify(gm.content, gm.data),
      lineStart, lineEnd
    )
  }
}

const EditorLine = (line: number): EditorPosition => ({ line, ch: 0 })

function SizeManager(
  component: CodeBlock['component'],
  containerEl: CodeBlock['containerEl'],
  svg: SVGSVGElement,
  settings: SettingsManager
) {
  svg.style.height = settings.height + 'px'

  const resizeHandle = document.createElement('hr')
  containerEl.prepend(resizeHandle)
  resizeHandle.classList.add('workspace-leaf-resize-handle')

  const syncHandlePosition = () => {
    const scrolling = containerEl.classList.contains('mmng-mobile-horizontal-scroll')
    if (scrolling) {
      resizeHandle.style.width = `${containerEl.clientWidth}px`
      resizeHandle.style.transform = `translateX(${containerEl.scrollLeft}px)`
    }
    else {
      resizeHandle.style.width = '100%'
      resizeHandle.style.transform = ''
    }
  }
  syncHandlePosition()
  containerEl.addEventListener('scroll', syncHandlePosition, { passive: true })

  const resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(syncHandlePosition)
    : null
  resizeObserver?.observe(containerEl)

  const drag$ = dragAndDrop(resizeHandle)

  Callbag.subscribe(drag$, drag => {
    settings.height += drag.changeFromPrevious.y
    svg.style.height = settings.height + 'px'
    syncHandlePosition()
  })

  Callbag.subscribe(fromEvent(document, 'mouseup'), settings.saveHeight)
  component.register(() => {
    containerEl.removeEventListener('scroll', syncHandlePosition)
    resizeObserver?.disconnect()
  })
}

function SettingsDialog(codeBlock: CodeBlock, body: string, codeBlockSettings: CodeBlockSettings, fileSettings: FileSettings, editor: Editor) {
  const fileSettingsProxy = new Proxy({} as FileSettings, {
    get: (_, key: keyof FileSettings) => fileSettings[key],
    has: (_, key) => key in fileSettings,
    set<Key extends keyof FileSettings>(_: unknown, key: Key, value: FileSettings[Key]) {
      fileSettings[key] = value
      updateFileFrontmatter()
      return true
    },
    deleteProperty(_, key: keyof FileSettings) {
      delete fileSettings[key]
      updateFileFrontmatter()
      return true
    }
  })

  function updateFileFrontmatter() {
    const frontmatter = isObjectEmpty(fileSettings) ? {} : { markmap: fileSettings }
    editor.setValue(GrayMatter.stringify(body, frontmatter))
  }

  const codeBlockProxy = new Proxy(codeBlockSettings, {
    set<Key extends keyof CodeBlockSettings>(_: unknown, key: Key, value: CodeBlockSettings[Key]) {
      codeBlockSettings[key] = value
      updateCodeBlockFrontmatter()
      return true
    },
    deleteProperty(_, key: keyof CodeBlockSettings) {
      delete codeBlockSettings[key]
      updateCodeBlockFrontmatter()
      return true
    }
  })

  function updateCodeBlockFrontmatter() {
    const sectionInfo = codeBlock.getSectionInfo()
    assert(notNullish, sectionInfo)
    const lineStart = EditorLine(sectionInfo.lineStart + 1)
    const lineEnd   = EditorLine(sectionInfo.lineEnd)

    const text = editor.getRange(lineStart, lineEnd)

    const bodyText = GrayMatter(text).content
    const frontmatter = isObjectEmpty(codeBlockSettings) ? {} : { markmap: codeBlockSettings }

    editor.replaceRange(
      GrayMatter.stringify(bodyText, frontmatter),
      lineStart, lineEnd
    )
  }

  const button = new ButtonComponent(codeBlock.containerEl.parentElement!)
    .setClass('edit-block-button')
    .setClass('codeblock-settings-button')
    .setIcon('sliders-horizontal')
    .setTooltip(strings.blockSettingsButton)

  button.onClick(() => new CodeBlockSettingsDialog(fileSettingsProxy, codeBlockProxy).open())
}
