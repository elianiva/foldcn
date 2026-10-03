import { Effect, FileSystem } from 'effect'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chartItemNames } from '../src/catalog/charts'

export { htmlToMarkdown, extractMain } from '../src/markdown'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const PROJECT_DIR = resolve(SCRIPT_DIR, '..')
const REGISTRY_DIR = resolve(PROJECT_DIR, '../registry/registry/default')

export type LlmItem = Readonly<{
  name: string
  title: string
  description: string
  category: string
}>

export type LlmsDocLayout = Readonly<{
  title: string
  quote: string
  sections: ReadonlyArray<Readonly<{ heading: string; body: ReadonlyArray<string> }>>
}>

type LlmsContext = Readonly<{ origin: string; items: ReadonlyArray<LlmItem> }>

type SectionComposer = (ctx: LlmsContext) => ReadonlyArray<string>

const GITHUB_REPO = 'https://github.com/elianiva/foldcn'
const GITHUB_ISSUES_NEW = `${GITHUB_REPO}/issues/new`
const SHADCN_COMPONENT_BASE = 'https://ui.shadcn.com/docs/components'

const buildParityIssueUrl = (): string => {
  const title = '[parity] <name>: shadcn incompatibility'
  const body = [
    '### Component',
    '<name>',
    '',
    '### Parity status',
    'diverged',
    '',
    '### Known gaps',
    '- (see item page Differences vs shadcn/ui callout)',
    '',
    '### Links',
    '- Foldcn: https://foldcn.elianiva.com/docs/<name>',
    `- shadcn/ui: ${SHADCN_COMPONENT_BASE}/<name>`,
    '',
    '### Describe the incompatibility',
    'Please describe what differs from shadcn/ui and how to reproduce it.',
  ].join('\n')
  const params = new URLSearchParams({ title, body })
  return `${GITHUB_ISSUES_NEW}?${params.toString()}`
}

const buildRequestIssueUrl = (): string => {
  const title = '[request] <component name>'
  const body = [
    '### What component would you like?',
    '',
    '<!-- e.g. Data Table, Carousel -->',
    '',
    '### Why is it needed?',
    '',
    '<!-- Describe your use case and why existing components do not cover it -->',
    '',
    '### shadcn/ui reference (if any)',
    '',
    '<!-- e.g. https://ui.shadcn.com/docs/components/... -->',
  ].join('\n')
  const params = new URLSearchParams({ title, body, labels: 'enhancement' })
  return `${GITHUB_ISSUES_NEW}?${params.toString()}`
}

const LLMS_TITLE = '# foldcn'

const LLMS_QUOTE =
  '> Copy-paste components for Foldkit — a shadcn-style registry built on @foldkit/ui with Foldkit TEA architecture and Tailwind CSS. Foldkit-only — not React. Implements the shadcn registry contract (`components.json` namespace + static `r/{name}.json` + `npx shadcn add`). If you need React, use [shadcn/ui](https://ui.shadcn.com) instead. Install any item with `npx shadcn@latest add @foldcn/<name>`.'

// ---------------------------------------------------------------------------
// Section composers (table/registry of sections over scattered pushes)
// ---------------------------------------------------------------------------

const composeDocs: SectionComposer = ({ origin, items }) => [
  '## Docs',
  `- [Home](${origin}/index.md): shadcn components for Foldkit — the registry landing page.`,
  `- [Components](${origin}/docs.md): Browse the full catalog of ${items.length} components, blocks and utilities.`,
  `- [Charts guide](${origin}/docs/charts.md): Use Foldkit charts with Recharts-shaped component and parameter names.`,
]

const composeForAgents: SectionComposer = ({ origin }) => {
  const parityUrl = buildParityIssueUrl()
  const requestUrl = buildRequestIssueUrl()
  return [
    '## For agents',
    '- **Scope — Foldkit-only, not React:** built on `@foldkit/ui` with Foldkit TEA + Tailwind CSS. For React use [shadcn/ui](https://ui.shadcn.com) instead.',
    '- **When to use foldcn vs shadcn/ui:** Foldkit apps → foldcn (`@foldcn/*`, Foldkit TEA + `@foldkit/ui` primitives); React apps → shadcn/ui. Do not mix — state models and primitives differ.',
    '- **How to choose:** foldcn is **not a React library** — components are Foldkit submodels/helpers, not React components. If your stack is React, ignore foldcn.',
    '- **Install contract (3 steps):** 1) register namespace `npx shadcn@latest registry add @foldcn=https://foldcn.elianiva.com/r/{name}.json` 2) install base `npx shadcn@latest add @foldcn/foldcn` (writes theme variables + core deps) 3) add components `npx shadcn@latest add @foldcn/<name>` (dependencies are pulled automatically — check the item page for required deps).',
    `- **Parity:** some components intentionally diverge from shadcn/ui — see the “Differences vs shadcn/ui” callout on each item page (e.g. \`${origin}/docs/<name>.md\`) and the [parity audit](${GITHUB_REPO}/blob/master/docs/shadcn-base-parity-audit.md). Agents should check the item Markdown for gaps before assuming parity.`,
    `- **Differences vs shadcn/ui:** compare at \`${SHADCN_COMPONENT_BASE}/<name>\` (foldcn-only components have no upstream). Report incompatibilities via [parity issue](${parityUrl}).`,
    `- **Request a component:** [open a request issue](${requestUrl}) — include use case and optional shadcn/ui reference.`,
    '- **Content negotiation:** every page has a Markdown twin — append `.md` to any URL (e.g. `/docs/button.md`) or send `Accept: text/markdown` to get Markdown directly.',
    `- **Source & docs:** registry lives at [${GITHUB_REPO}](${GITHUB_REPO}); item sources are copy-paste — no npm package.`,
  ]
}

const CATEGORY_ORDER = ['Base', 'Lib', 'Components', 'Charts', 'Blocks'] as const

const composeOptional: SectionComposer = ({ origin }) => [
  '## Optional',
  `- [llms-full.txt](${origin}/llms-full.txt): Every page as a single concatenated Markdown file.`,
]

const composeSource: SectionComposer = () => [
  '## Source',
  `- [GitHub](${GITHUB_REPO}): source, issues and parity audit.`,
  `- [shadcn/ui](https://ui.shadcn.com) — the React counterpart; use it instead if your stack is React.`,
]

const TYPE_TO_CATEGORY = {
  'registry:style': 'Base',
  'registry:lib': 'Lib',
  'registry:ui': 'Components',
  'registry:block': 'Blocks',
} as const

const isRegistryType = (type: string): type is keyof typeof TYPE_TO_CATEGORY =>
  type in TYPE_TO_CATEGORY

const GROUP_FILES = ['style', 'lib', 'ui', 'blocks'] as const

export const loadRegistryItems = Effect.fn(function* () {
  const fs = yield* FileSystem.FileSystem
  const items = yield* Effect.all(
    GROUP_FILES.map((group) =>
      Effect.gen(function* () {
        const file = yield* fs.readFileString(resolve(REGISTRY_DIR, group, 'registry.json'))
        // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: registry.json shape
        const json = JSON.parse(file) as {
          items?: ReadonlyArray<{
            name?: string
            title?: string
            description?: string
            type?: string
          }>
        }

        return (
          json.items
            ?.filter((it) => it.name !== undefined && it.name !== '')
            .map((it) => ({
              name: it.name ?? '',
              title: it.title ?? it.name ?? '',
              description: it.description ?? '',
              category: (() => {
                const type = it.type ?? ''
                return chartItemNames.has(it.name ?? '')
                  ? 'Charts'
                  : isRegistryType(type)
                    ? TYPE_TO_CATEGORY[type]
                    : 'Components'
              })(),
            })) ?? []
        )
      }),
    ),
    { concurrency: 'unbounded' },
  )
  return items.flat()
})

/** Build the structured layout then render it to Markdown. */
const renderLlmsDoc = (doc: LlmsDocLayout): string => {
  const lines: Array<string> = []
  lines.push(doc.title, '', doc.quote, '')
  for (const section of doc.sections) {
    lines.push(`## ${section.heading}`)
    lines.push(...section.body)
    lines.push('')
  }
  return `${lines.join('\n')}\n`.replace(/\n{3,}/g, '\n\n')
}

export const buildLlmsTxt = (items: ReadonlyArray<LlmItem>, origin: string): string => {
  const ctx: LlmsContext = { origin, items }

  const docsBody = composeDocs(ctx).slice(1)
  const forAgentsBody = composeForAgents(ctx).slice(1)
  const optionalBody = composeOptional(ctx).slice(1)
  const sourceBody = composeSource(ctx).slice(1)

  const doc: LlmsDocLayout = {
    title: LLMS_TITLE,
    quote: LLMS_QUOTE,
    sections: [
      { heading: 'Docs', body: docsBody },
      { heading: 'For agents', body: forAgentsBody },
      ...CATEGORY_ORDER.flatMap((category) => {
        const group = items.filter((item) => item.category === category)
        if (group.length === 0) return []
        return [
          {
            heading: category,
            body: group.map(
              (item) => `- [${item.title}](${origin}/docs/${item.name}.md): ${item.description}`,
            ),
          },
        ]
      }),
      { heading: 'Optional', body: optionalBody },
      { heading: 'Source', body: sourceBody },
    ],
  }

  return renderLlmsDoc(doc)
}

export const buildLlmsFull = (
  sections: ReadonlyArray<{ path: string; markdown: string }>,
  origin: string,
): string => {
  const parts: Array<string> = []
  parts.push('# foldcn — full Markdown')
  parts.push('')
  parts.push(
    `> Concatenation of every page on ${origin}, generated automatically from the rendered site. Each section is delimited by an HTML comment marking its source path.`,
  )
  parts.push('')
  parts.push(
    `> For the indexed overview, install contract, parity notes and agent guidance see [${origin}/llms.txt](${origin}/llms.txt) — Foldkit-only (not React); React users should use [shadcn/ui](https://ui.shadcn.com) instead.`,
  )
  for (const section of sections) {
    parts.push('')
    parts.push(`<!-- ${section.path} -->`)
    parts.push('')
    parts.push(section.markdown.trim())
  }
  return `${parts.join('\n')}\n`
}
