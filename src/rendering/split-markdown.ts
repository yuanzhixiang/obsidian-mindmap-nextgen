import { CodeBlockSettings, FileSettings } from 'src/settings/filesystem'


const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

type FrontmatterInfo = {
  frontmatter: string
  contentStart: number
}

export type SplitMarkdownHelpers = {
  getFrontMatterInfo(markdown: string): FrontmatterInfo
  parseYaml(yaml: string): unknown
}

export function splitMarkdown<Type extends 'file' | 'codeBlock'>(
  type: Type,
  markdown: string,
  helpers: SplitMarkdownHelpers
) {
  const { frontmatter, contentStart } = helpers.getFrontMatterInfo(markdown)
  const body = markdown.slice(0, contentStart)
  let parsed: Record<string, unknown> = {}

  if (frontmatter) {
    try {
      const candidate = helpers.parseYaml(frontmatter)
      if (candidate === null || candidate === undefined)
        parsed = {}
      else if (isObjectRecord(candidate))
        parsed = candidate
      else
        throw new Error(`frontmatter must be an object, got ${typeof candidate}`)
    }
    catch (error) {
      const details = error instanceof Error ? error.message : String(error)
      throw new Error(`[mindmap-nextgen] Invalid YAML frontmatter in ${type}: ${details}`)
    }
  }

  type Settings =
    Type extends 'file' ? FileSettings : CodeBlockSettings
  const markmapSettings = parsed.markmap
  const settings = (isObjectRecord(markmapSettings) ? markmapSettings : {}) as Settings
  return { body, settings }
}
