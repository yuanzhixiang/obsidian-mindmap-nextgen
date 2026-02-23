import { describe, expect, test, vi } from 'vitest'

import { applyMobileCodeblockLayout, shouldPreferHeightLayout } from './mobile-codeblock-layout'


describe('applyMobileCodeblockLayout', () => {
  test('uses narrow-width fallback when platform flag is not mobile', () => {
    const containerEl = {
      clientWidth: 360,
      getBoundingClientRect: () => ({ width: 360 }),
      parentElement: null,
    } as unknown as HTMLElement

    expect(shouldPreferHeightLayout(containerEl, false)).toBe(true)
    expect(shouldPreferHeightLayout(containerEl, true)).toBe(true)
  })

  test('uses height-based scale and enables horizontal scroll on mobile', () => {
    const classList = { add: vi.fn(), remove: vi.fn() }
    const containerEl = {
      clientWidth: 360,
      classList,
      parentElement: null,
    } as unknown as HTMLElement

    const svg = {
      style: {} as Record<string, string>,
      getBoundingClientRect: () => ({ height: 600 }),
    } as unknown as SVGElement

    const markmap = {
      options: { fitRatio: 1 },
      state: { rect: { x1: 0, y1: 0, x2: 1000, y2: 500 } },
      svg: { node: () => svg },
    }

    const applied = applyMobileCodeblockLayout(markmap, containerEl, true)

    expect(applied).toBe(true)
    expect(svg.style.width).toBe('1140px')
    expect(svg.style.maxWidth).toBe('none')
    expect(classList.add).toHaveBeenCalledWith('mmng-mobile-horizontal-scroll')
  })

  test('resets to default width on non-mobile', () => {
    const classList = { add: vi.fn(), remove: vi.fn() }
    const containerEl = {
      clientWidth: 360,
      classList,
      parentElement: null,
    } as unknown as HTMLElement

    const svg = {
      style: { width: '800px', maxWidth: 'none' },
      getBoundingClientRect: () => ({ height: 600 }),
    } as unknown as SVGElement

    const markmap = {
      options: { fitRatio: 1 },
      state: { rect: { x1: 0, y1: 0, x2: 1000, y2: 500 } },
      svg: { node: () => svg },
    }

    const applied = applyMobileCodeblockLayout(markmap, containerEl, false)

    expect(applied).toBe(false)
    expect(svg.style.width).toBe('100%')
    expect(svg.style.maxWidth).toBe('')
    expect(classList.remove).toHaveBeenCalledWith('mmng-mobile-horizontal-scroll')
  })
})
