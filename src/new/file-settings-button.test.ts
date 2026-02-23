import { describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  subscribe: vi.fn(),
  viewStream: {},
  openDialog: vi.fn(),
}))

vi.mock('src/utilities/callbag', () => ({
  default: { subscribe: mocks.subscribe },
}))

describe('file settings button registration', () => {
  test('is disabled by default (icon removed)', async () => {
    await import('./file-settings-button')
    expect(mocks.subscribe).not.toHaveBeenCalled()
  })

  test('can be explicitly enabled', async () => {
    const mod = await import('./file-settings-button')
    await mod.registerFileSettingsButton(true, {
      stream: mocks.viewStream,
      openDialog: mocks.openDialog,
      tooltip: 'Edit mindmap settings',
    })

    expect(mocks.subscribe).toHaveBeenCalledTimes(1)
    expect(mocks.subscribe).toHaveBeenCalledWith(mocks.viewStream, expect.any(Function))

    const handler = mocks.subscribe.mock.calls[0][1] as (view: any) => void
    const addAction = vi.fn()

    handler({ addAction, editor: { id: 'editor' } })

    expect(addAction).toHaveBeenCalledWith(
      'dot-network',
      'Edit mindmap settings',
      expect.any(Function)
    )

    const onClick = addAction.mock.calls[0][2] as () => void
    onClick()

    expect(mocks.openDialog).toHaveBeenCalledWith({ id: 'editor' })
  })
})
