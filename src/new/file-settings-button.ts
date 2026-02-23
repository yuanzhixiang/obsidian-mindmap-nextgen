import Callbag from 'src/utilities/callbag'


export const fileSettingsButtonEnabled = false

type Dependencies = {
  stream: any
  openDialog: (editor: unknown) => unknown
  tooltip: string
}

export async function registerFileSettingsButton(
  enable: boolean = fileSettingsButtonEnabled,
  dependencies: Partial<Dependencies> = {}
) {
  if (!enable) return

  const stream = dependencies.stream ??
    (await import('src/new/active-markdown-view')).newActiveMarkdownView$

  const openDialog = dependencies.openDialog ??
    (async (editor: unknown) => {
      const { FileSettingsDialog } = await import('src/settings/dialogs')
      new FileSettingsDialog(editor as any).open()
    })

  const tooltip = dependencies.tooltip ?? 'Edit mindmap settings'

  Callbag.subscribe(stream, (view: any) =>
    view.addAction('dot-network', tooltip,
      () => openDialog(view.editor)))
}

void registerFileSettingsButton()
