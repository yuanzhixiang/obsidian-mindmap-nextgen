import { describe, expect, test, vi } from 'vitest'

import { fitWithoutAnimation } from './fit-without-animation'


describe('fitWithoutAnimation', () => {
  test('temporarily disables animation, fits twice, then restores duration', async () => {
    const markmap = {
      options: { duration: 500 },
      setOptions(options: { duration: number }) {
        this.options.duration = options.duration
      },
      fit: vi.fn(async () => {}),
    }

    const frame = vi.fn(async () => {})

    await fitWithoutAnimation(markmap, frame)

    expect(frame).toHaveBeenCalledTimes(3)
    expect(markmap.fit).toHaveBeenCalledTimes(2)
    expect(markmap.options.duration).toBe(500)
  })
})
