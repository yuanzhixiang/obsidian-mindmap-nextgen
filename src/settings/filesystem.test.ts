import { describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  loadData: vi.fn(() => Promise.resolve({})),
  saveData: vi.fn(),
}))

vi.mock('src/core/main', () => ({
  plugin: {
    loadData: mocks.loadData,
    saveData: mocks.saveData,
  },
}))


describe('default global settings', () => {
  test('lockCanvasScroll is enabled by default', async () => {
    const { defaultSettings } = await import('./filesystem')
    expect(defaultSettings.lockCanvasScroll).toBe(true)
  })
})
