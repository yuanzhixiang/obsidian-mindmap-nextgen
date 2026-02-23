import { beforeEach, describe, expect, test, vi } from 'vitest'

import { splitMarkdown } from './split-markdown'

describe('splitMarkdown', () => {
  const mocks = {
    getFrontMatterInfo: vi.fn(),
    parseYaml: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns body and markmap settings from valid frontmatter', () => {
    const markdown = `---\nmarkmap:\n  height: 336\n---\n# Title\n`
    mocks.getFrontMatterInfo.mockReturnValue({
      frontmatter: 'markmap:\n  height: 336\n',
      contentStart: 30,
    })
    mocks.parseYaml.mockReturnValue({
      markmap: { height: 336 },
    })

    const result = splitMarkdown('codeBlock', markdown, mocks)

    expect(result.body).toBe(markdown.slice(0, 30))
    expect(result.settings).toEqual({ height: 336 })
    expect(mocks.parseYaml).toHaveBeenCalledWith('markmap:\n  height: 336\n')
  })

  test('does not parse yaml when frontmatter is empty', () => {
    const markdown = '# Title\n'
    mocks.getFrontMatterInfo.mockReturnValue({
      frontmatter: '',
      contentStart: 0,
    })

    const result = splitMarkdown('file', markdown, mocks)

    expect(result).toEqual({
      body: '',
      settings: {},
    })
    expect(mocks.parseYaml).not.toHaveBeenCalled()
  })

  test('throws clear error when yaml parsing fails', () => {
    mocks.getFrontMatterInfo.mockReturnValue({
      frontmatter: 'markmap: [',
      contentStart: 0,
    })
    mocks.parseYaml.mockImplementation(() => {
      throw new Error('Unexpected end of flow sequence')
    })

    expect(() => splitMarkdown('codeBlock', 'x', mocks)).toThrowError(
      '[mindmap-nextgen] Invalid YAML frontmatter in codeBlock: Unexpected end of flow sequence'
    )
  })

  test('throws clear error when yaml root is not an object', () => {
    mocks.getFrontMatterInfo.mockReturnValue({
      frontmatter: '123',
      contentStart: 0,
    })
    mocks.parseYaml.mockReturnValue(123)

    expect(() => splitMarkdown('file', 'x', mocks)).toThrowError(
      '[mindmap-nextgen] Invalid YAML frontmatter in file: frontmatter must be an object, got number'
    )
  })

  test('returns empty settings when markmap value is not an object', () => {
    mocks.getFrontMatterInfo.mockReturnValue({
      frontmatter: 'markmap: true',
      contentStart: 5,
    })
    mocks.parseYaml.mockReturnValue({
      markmap: true,
    })

    const result = splitMarkdown('file', 'abcde12345', mocks)

    expect(result.body).toBe('abcde')
    expect(result.settings).toEqual({})
  })
})
