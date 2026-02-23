import { describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const listen = vi.fn()
  const pushCodeblocks = vi.fn()
  const pushTabs = vi.fn()
  const subject = vi.fn()
    .mockReturnValueOnce({ source: {}, push: pushCodeblocks })
    .mockReturnValueOnce({ source: {}, push: pushTabs })

  return {
    listen,
    pushCodeblocks,
    pushTabs,
    subject,
    registerStyleElement: vi.fn(),
    addStyleRule: vi.fn(),
  }
})

vi.mock('src/settings/filesystem', () => ({
  globalSettings: {
    defaultThickness: '1',
    depth1Thickness: '1',
    depth2Thickness: '1',
    depth3Thickness: '1',
    lineHeight: '1em',
  },
  settingChanges: { listen: mocks.listen },
}))

vi.mock('./style-tools', () => ({
  globalStyle: {
    registerStyleElement: mocks.registerStyleElement,
    add: mocks.addStyleRule,
  },
  settingTriggers: {
    defaultThickness: 'defaultThickness',
    depth1Thickness: 'depth1Thickness',
    depth2Thickness: 'depth2Thickness',
    depth3Thickness: 'depth3Thickness',
    lineHeight: 'lineHeight',
  },
}))

vi.mock('src/utilities/callbag', () => ({
  default: { subject: mocks.subject },
}))


describe('style-features setting listeners', () => {
  test('re-renders tabs and codeblocks when lockCanvasScroll changes', async () => {
    await import('./style-features')

    const registration = mocks.listen.mock.calls
      .find(([key]) => key === 'lockCanvasScroll')

    expect(registration).toBeTruthy()

    const listener = registration?.[1] as undefined | (() => void)
    expect(listener).toBeTypeOf('function')

    listener?.()

    expect(mocks.pushTabs).toHaveBeenCalledTimes(1)
    expect(mocks.pushCodeblocks).toHaveBeenCalledTimes(1)
  })
})
