// Build-time helpers for the LLM-friendly output: turning each prerendered
// page's HTML into Markdown, and assembling the `llms.txt` / `llms-full.txt`
// index files. Everything here is derived from the rendered page and the
// registry manifest, so there is nothing to maintain by hand.

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { NodeHtmlMarkdown } from 'node-html-markdown'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const PROJECT_DIR = resolve(SCRIPT_DIR, '..')
const REGISTRY_DIR = resolve(PROJECT_DIR, '../registry/registry/default')

// Elements that carry no prose value for an LLM: chrome, navigation, controls.
// (The sidebar `<aside>` and breadcrumb `<nav>` live inside `<main>` on item
// pages, so we drop them here rather than in the extraction step.)
const MD = new NodeHtmlMarkdown({
  codeFence: '```',
  codeBlockStyle: 'fenced',
  bulletMarker: '-',
  emDelimiter: '_',
  strongDelimiter: '**',
  useInlineLinks: true,
  ignore: ['button', 'script', 'style', 'aside', 'nav', 'svg', 'img'],
  maxConsecutiveNewlines: 2,
})

/** Pull the `<main>…</main>` region out of a rendered page (falls back to the
 *  whole document if, for some reason, no `<main>` was emitted). */
export const extractMain = (html: string): string => {
  const start = html.search(/<main[\s>]/i)
  if (start === -1) return html
  const end = html.indexOf('</main>', start)
  if (end === -1) return html
  return html.slice(start, end + '</main>'.length)
}

// node-html-markdown reads fence languages from a `language-*` class on the
// `<code>` element, but the registry code blocks carry the language on the
// wrapping `<pre data-language="ts">` with a bare `<code>` inside. Copy it
// across before translating.
const annotateCodeLanguages = (html: string): string =>
  html.replace(
    /(<pre[^>]*\bdata-language="([\w-]+)"[^>]*>\s*<code)>/g,
    (_match, open: string, language: string) => `${open} class="language-${language}">`,
  )

// Flex/grid layouts separate inline siblings with CSS `gap`, so the serialized
// HTML carries no whitespace between them and the converter would jam them
// into one word ("PreviewInteractive demo", "CtrlShift⌘K"). Inline elements
// closed immediately before another element get one space inserted. Void
// elements count as separators too ("<label>Email</label><input><span>…").
// Regions inside <pre> are skipped — highlighted tokens are adjacent spans
// whose spacing is significant source code.
const INLINE_SIBLINGS = 'span|code|kbd|a|strong|em|b|i|small|time|abbr|label|option'
const VOID_ELEMENTS = 'input|img|br|hr|select'
const JAMMED_SIBLINGS = new RegExp(
  `(</(?:${INLINE_SIBLINGS})>)\\s*(<(?:${INLINE_SIBLINGS}|${VOID_ELEMENTS})[\\s>/])`,
  'g',
)

const separateInlineSiblings = (html: string): string =>
  html
    .split(/(<pre[\s\S]*?<\/pre>)/g)
    .map((part, index) => (index % 2 === 1 ? part : part.replace(JAMMED_SIBLINGS, '$1 $2')))
    .join('')

/** Resolve root-relative Markdown links against the site origin so they keep
 *  working when the file is read outside the context of the page it came from
 *  (an agent fetching `/docs/button.md` has no base URL to resolve against).
 *  Applied to the translated Markdown rather than the source HTML so literal
 *  `href="…"` text inside code listings is never touched. */
const absolutizeLinks = (markdown: string, origin: string): string =>
  markdown.replace(/\]\((\/[^)\s]*)\)/g, (_match, path: string) => `](${origin}${path})`)

/** Convert a rendered page's HTML to clean Markdown. */
export const htmlToMarkdown = (html: string, origin: string): string => {
  const main = extractMain(html)
  const markdown = MD.translate(separateInlineSiblings(annotateCodeLanguages(main)))
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return `${absolutizeLinks(markdown, origin)}\n`
}

export type LlmItem = Readonly<{
  name: string
  title: string
  description: string
  category: string
}>

const TYPE_TO_CATEGORY: Readonly<Record<string, string>> = {
  'registry:style': 'Base',
  'registry:lib': 'Lib',
  'registry:ui': 'Components',
  'registry:block': 'Blocks',
}

const GROUP_FILES = ['style', 'lib', 'ui', 'blocks'] as const

/** Enumerate every registry item (name, title, description, category) straight
 *  from the manifest JSON — no `?raw` imports, so this runs under plain Node. */
export const loadRegistryItems = (): ReadonlyArray<LlmItem> => {
  const items: LlmItem[] = []
  for (const group of GROUP_FILES) {
    const file = resolve(REGISTRY_DIR, group, 'registry.json')
    const json = JSON.parse(readFileSync(file, 'utf8')) satisfies {
      items?: ReadonlyArray<{
        name?: string
        title?: string
        description?: string
        type?: string
      }>
    }
    for (const it of json.items ?? []) {
      const name = it.name
      if (name === undefined || name === '') continue
      items.push({
        name,
        title: it.title ?? name,
        description: it.description ?? '',
        category: TYPE_TO_CATEGORY[it.type ?? ''] ?? 'Components',
      })
    }
  }
  return items
}

/** Build the root `llms.txt` — the deterministic, agent-readable site map. */
export const buildLlmsTxt = (items: ReadonlyArray<LlmItem>, origin: string): string => {
  const lines: string[] = []
  lines.push('# foldcn')
  lines.push('')
  lines.push(
    '> Copy-paste components for Foldkit — a shadcn-style registry built on @foldkit/ui with Foldkit TEA architecture and Tailwind CSS. Install any item with `npx shadcn@latest add @foldcn/<name>`.',
  )
  lines.push('')
  lines.push('## Docs')
  lines.push(`- [Home](${origin}/index.md): shadcn components for Foldkit — the registry landing page.`)
  lines.push(
    `- [Components](${origin}/docs.md): Browse the full catalog of ${items.length} components, blocks and utilities.`,
  )
  lines.push('')

  for (const category of ['Base', 'Lib', 'Components', 'Blocks']) {
    const group = items.filter((item) => item.category === category)
    if (group.length === 0) continue
    lines.push(`## ${category}`)
    for (const item of group) {
      lines.push(`- [${item.title}](${origin}/docs/${item.name}.md): ${item.description}`)
    }
    lines.push('')
  }

  lines.push('## Optional')
  lines.push(
    `- [llms-full.txt](${origin}/llms-full.txt): Every page as a single concatenated Markdown file.`,
  )
  lines.push('')
  return lines.join('\n')
}

/** Build `llms-full.txt` — every page concatenated, each marked by source path. */
export const buildLlmsFull = (
  sections: ReadonlyArray<{ path: string; markdown: string }>,
  origin: string,
): string => {
  const parts: string[] = []
  parts.push('# foldcn — full Markdown')
  parts.push('')
  parts.push(
    `> Concatenation of every page on ${origin}, generated automatically from the rendered site. Each section is delimited by an HTML comment marking its source path.`,
  )
  for (const section of sections) {
    parts.push('')
    parts.push(`<!-- ${section.path} -->`)
    parts.push('')
    parts.push(section.markdown.trim())
  }
  return `${parts.join('\n')}\n`
}
