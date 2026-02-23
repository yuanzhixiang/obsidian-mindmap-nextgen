type Rect = {
  x1: number
  y1: number
  x2: number
  y2: number
}

type MarkmapLike = {
  options: { fitRatio?: number }
  state: { rect?: Rect }
  svg: { node(): SVGElement | null }
}

const NARROW_LAYOUT_MAX_WIDTH = 820
const HEIGHT_FILL_RATIO = 0.95

function getContainerWidth(containerEl: HTMLElement) {
  const self = containerEl.getBoundingClientRect?.().width ?? 0
  const parent = containerEl.parentElement?.getBoundingClientRect?.().width ?? 0
  const fallback = typeof window !== 'undefined' ? window.innerWidth : 0
  return self || containerEl.clientWidth || parent || fallback
}

export function shouldPreferHeightLayout(containerEl: HTMLElement, isMobile: boolean) {
  if (isMobile) return true
  const width = getContainerWidth(containerEl)
  return width > 0 && width <= NARROW_LAYOUT_MAX_WIDTH
}

export function applyMobileCodeblockLayout(markmap: MarkmapLike, containerEl: HTMLElement, preferHeightLayout: boolean) {
  const svg = markmap.svg.node()
  if (!svg) return false
  const setScrollClass = (enabled: boolean) => {
    const method = enabled ? 'add' : 'remove'
    containerEl.classList[method]('mmng-mobile-horizontal-scroll')
  }

  if (!preferHeightLayout) {
    setScrollClass(false)
    svg.style.maxWidth = ''
    svg.style.width = '100%'
    return false
  }

  const rect = markmap.state.rect
  if (!rect) {
    setScrollClass(false)
    return false
  }

  const contentWidth = rect.x2 - rect.x1
  const contentHeight = rect.y2 - rect.y1
  const viewportHeight = svg.getBoundingClientRect().height

  if (!(contentWidth > 0 && contentHeight > 0 && viewportHeight > 0)) {
    setScrollClass(false)
    return false
  }

  const fitRatio = markmap.options.fitRatio ?? 1
  const scaleByHeight = (viewportHeight / contentHeight) * fitRatio * HEIGHT_FILL_RATIO
  const targetWidth = Math.max(containerEl.clientWidth, Math.ceil(contentWidth * scaleByHeight))

  svg.style.maxWidth = 'none'
  svg.style.width = `${targetWidth}px`
  setScrollClass(true)
  return true
}
