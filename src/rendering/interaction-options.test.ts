import { describe, expect, test, vi } from 'vitest'

import { defaultScrollForPan, getInteractionOptions } from './interaction-options'


describe('interaction options', () => {
  test('locks zoom and pan when lockCanvasScroll is enabled', () => {
    expect(getInteractionOptions(true)).toEqual({
      zoom: false,
      pan: false,
      scrollForPan: false,
    })
  })

  test('enables zoom and pan when lockCanvasScroll is disabled', () => {
    const options = getInteractionOptions(false)
    expect(options.zoom).toBe(true)
    expect(options.pan).toBe(true)
  })

  test('detects scrollForPan default from Mac user agent', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' })
    expect(defaultScrollForPan()).toBe(true)
    vi.unstubAllGlobals()
  })
})
