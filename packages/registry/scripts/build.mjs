import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { resolveStyles } from './resolve-styles.mjs'

const REGISTRY_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(REGISTRY_DIR, 'dist/r')

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: REGISTRY_DIR,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

// 0. Emit the resolved component trees (styles/default/{ui,lib,blocks}) that
//    both the web demo and the publishable registry JSONs consume — the shadcn
//    parity behaviour: installed sources carry concrete Tailwind classes, not
//    raw `cn-*` tokens.
console.log('resolving cn-* style tokens…')
resolveStyles()

// 1. Build the registry catalog with the shadcn CLI. `-c` pins the working
//    directory (this package) and `-o` puts the flattened catalog + per-item
//    JSON wherever we like — the deploy worker serves them from here. The
//    CLI does not clean its output directory, so a removed item (or a removed
//    style) would linger and stay resolvable from `r/`; wipe it first.
rmSync(OUT_DIR, { recursive: true, force: true })
mkdirSync(OUT_DIR, { recursive: true })
run('pnpm', ['dlx', 'shadcn@latest', 'build', '-c', REGISTRY_DIR, '-o', OUT_DIR])

// 2. Swap every embedded ui source for its resolved counterpart. Item paths
//    stay untouched so install targeting is unchanged — only the shipped code
//    goes from token classes to resolved utilities.
const itemFiles = readdirSync(OUT_DIR)
  .filter((file) => file.endsWith('.json') && file !== 'registry.json')
  .sort()

/** Swap ui sources in one parsed item for the resolved tree of `styleName`. */
const swapItemSources = (item, styleName) => {
  let swapped = 0
  for (const entry of item.files ?? []) {
    const match = entry.path?.match(/^registry\/default\/ui\/([\w-]+\.ts)$/)
    if (!match) continue
    const resolved = readFileSync(
      resolve(REGISTRY_DIR, 'styles', styleName, 'ui', match[1]),
      'utf8',
    )
    if (entry.content !== resolved) {
      entry.content = resolved
      swapped += 1
    }
  }
  return swapped
}

let swapped = 0
for (const file of itemFiles) {
  const itemPath = resolve(OUT_DIR, file)
  const item = JSON.parse(readFileSync(itemPath, 'utf8'))
  swapped += swapItemSources(item, 'default')
  writeFileSync(itemPath, `${JSON.stringify(item, null, 2)}\n`)
}
console.log(
  `resolved sources swapped into ${swapped} file(s) across ${itemFiles.length} item JSONs`,
)

// 2c. Emit opt-in style catalogs under /r/styles/<style>/ — full copies of the
//     catalog with ui sources swapped for that style's resolved tree. The
//     default (nova) top-level catalog stays at /r/*.json; users opt in by
//     pointing their namespace at /r/styles/<style>/{name}.json.
const OPT_IN_STYLES = ['nova', 'vega', 'maia', 'lyra', 'mira', 'luma', 'sera', 'rhea']
let styleItems = []
for (const style of OPT_IN_STYLES) {
  const styleOutDir = resolve(OUT_DIR, 'styles', style)
  mkdirSync(styleOutDir, { recursive: true })
  writeFileSync(
    resolve(styleOutDir, 'registry.json'),
    readFileSync(resolve(OUT_DIR, 'registry.json')),
  )
  let styleSwapped = 0
  for (const file of itemFiles) {
    const item = JSON.parse(readFileSync(resolve(OUT_DIR, file), 'utf8'))
    styleSwapped += swapItemSources(item, style)
    const outPath = resolve(styleOutDir, file)
    writeFileSync(outPath, `${JSON.stringify(item, null, 2)}\n`)
    styleItems.push(`styles/${style}/${file}`)
  }
  console.log(
    `style catalog ${style}: ${itemFiles.length} items → styles/${style}/ (${styleSwapped} sources swapped)`,
  )
}
const allItemFiles = [...itemFiles, ...styleItems]

// 2b. Assert the shipped sources keep the resolver's guarantee: no `cn-*`
//     tokens inside string literals (comments may still reference upstream
//     token names as behavioral documentation). Covers the top-level catalog
//     and every opt-in style catalog.
const { Node, Project } = await import('ts-morph')
const literalOffenders = []
for (const file of allItemFiles) {
  const item = JSON.parse(readFileSync(resolve(OUT_DIR, file), 'utf8'))
  for (const entry of item.files ?? []) {
    if (!entry.path?.endsWith('.ts') || !entry.content) continue
    const sf = new Project({ useInMemoryFileSystem: true }).createSourceFile(
      entry.path,
      entry.content,
      { overwrite: true },
    )
    sf.forEachDescendant((node) => {
      const isLiteral = Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)
      if (isLiteral && /\bcn-[\w-]+\b/.test(node.getLiteralText())) {
        literalOffenders.push(`${file} :: ${entry.path}`)
      }
    })
  }
}
if (literalOffenders.length > 0) {
  console.error(
    `unresolved cn-* literals in shipped sources:\n  ${[...new Set(literalOffenders)].join('\n  ')}`,
  )
  process.exit(1)
}

// 3. Generate a worker index over the built item JSONs so the deploy worker
//    can serve /r/{name}.json and /r/styles/<style>/{name}.json without knowing
//    the item list ahead of time.
const identifierFor = (file) => `_${file.slice(0, -'.json'.length).replace(/[^a-zA-Z0-9]/g, '_')}`

const importLines = allItemFiles.map((file) => `import ${identifierFor(file)} from './${file}'`)
const itemEntries = allItemFiles.map(
  (file) => `  ${JSON.stringify(file.slice(0, -'.json'.length))}: ${identifierFor(file)},`,
)

mkdirSync(OUT_DIR, { recursive: true })

writeFileSync(
  resolve(OUT_DIR, 'worker-index.mjs'),
  `// Generated by packages/registry/scripts/build.mjs — do not edit.
import _registry from './registry.json'
${importLines.join('\n')}

export const catalog = _registry

export const items = {
  registry: _registry,
${itemEntries.join('\n')}
}
`,
)

writeFileSync(
  resolve(OUT_DIR, 'worker-index.d.mts'),
  `// Generated by packages/registry/scripts/build.mjs — do not edit.
export declare const catalog: unknown
export declare const items: Record<string, unknown>
`,
)

const catalog = JSON.parse(readFileSync(resolve(OUT_DIR, 'registry.json'), 'utf8'))
console.log(
  `registry build complete: ${itemFiles.length + 1} items × ${OPT_IN_STYLES.length} styles (${1 + OPT_IN_STYLES.length} catalogs) → ${OUT_DIR}`,
)
console.log(`catalog: ${catalog.name} — homepage ${catalog.homepage}`)
