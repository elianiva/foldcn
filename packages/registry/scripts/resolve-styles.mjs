/**
 * resolve-styles.mjs — emit installable component trees with `cn-*` utility
 * tokens pre-resolved into concrete Tailwind classes.
 *
 * This mirrors the shadcn v4 registry pipeline (apps/v4/scripts/build-registry.mts):
 * authored components reference semantic `cn-*` token classes; a style map built
 * from a style CSS substitutes every token occurrence inside string literals with
 * its resolved utilities. Demos render the resolved tree and the registry build
 * ships it, so neither needs the token CSS loaded at runtime — exactly how
 * ui.shadcn.com demos work.
 *
 * Style CSS sources (see ADR-014/ADR-015):
 *   registry/styles/style-*.css           vendored verbatim from shadcn-ui/ui,
 *                                         refreshed by scripts/sync-styles.mjs
 *   registry/default/style/cn-compat.css  hand-written foldkit deltas, merged
 *                                         FIRST so they win tailwind-merge conflicts
 *
 * The foldkit animation-state rewrite (data-open:<enter anim> → data-enter:,
 * data-closed:<exit anim> → data-leave:) is applied HERE, to the style-map
 * values — never to the vendored files, which stay byte-identical to upstream.
 *
 * Outputs (gitignored, regenerate via this script or `pnpm --filter @foldcn/registry build`):
 *   styles/<style>/ui/*.ts       transformed component sources
 *   styles/<style>/lib/*.ts      verbatim copies (no tokens to resolve)
 *   styles/<style>/blocks/**     verbatim copies (no tokens to resolve)
 *
 * The transform is intentionally simpler than upstream's ts-morph transformer:
 * foldcn sources are plain `.ts` view factories whose class strings only ever
 * appear as static string literals (variable/object-literal initializers,
 * `cn(...)` arguments), so walking every string literal subsumes upstream's
 * cva/className/mergeProps appliers. Unlike upstream we keep NO allowlist —
 * foldcn resolves every token, including `cn-font-heading` / `cn-rtl-flip`
 * which are defined in cn-compat.css rather than left for CLI-side rewriting.
 *
 * Usage: node scripts/resolve-styles.mjs
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Node, Project } from 'ts-morph'
import { twMerge } from 'tailwind-merge'

import { createStyleMap } from './lib/create-style-map.mjs'

const REGISTRY_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_DIR = join(REGISTRY_DIR, 'registry', 'default')
const STYLES_OUT_ROOT = join(REGISTRY_DIR, 'styles')

/**
 * Style combinations to emit. foldcn derives from the vendored shadcn `nova`
 * style tokens (registry/styles/style-nova.css — see ADR-015); add entries
 * here when additional vendored styles are adopted. Compat CSS concatenates
 * FIRST so its deltas win tailwind-merge conflicts against the vendored layer.
 */
const STYLES = [
  {
    name: 'default',
    title: 'Default',
    cssFiles: ['registry/default/style/cn-compat.css', 'registry/styles/style-nova.css'],
  },
]

// Directories copied verbatim into each style tree. They contain no `cn-*`
// references today; the assertion below keeps that guarantee honest.
const VERBATIM_DIRS = ['lib', 'blocks']
const TOKEN_DIR = 'ui'
const TOKEN_SOURCE_EXT = '.ts'

// --- foldkit animation-state rewrite ---------------------------------------

/**
 * tw-animate-css utilities + project keyframe animations whose Base UI
 * `data-open:` / `data-closed:` hooks must be re-keyed for foldkit.
 *
 * foldkit overlay/panel state machine (verified in @foldkit/ui dist):
 *   EnterStart     → data-closed data-enter  data-transition
 *   EnterAnimating →           data-enter  data-transition
 *   LeaveStart     →           data-leave  data-transition
 *   LeaveAnimating → data-closed data-leave data-transition
 *   idle open      → data-open
 *
 * Re-keying animations onto data-enter/data-leave means each animation plays
 * exactly once during its transition window; persistent open styling keyed on
 * `data-open:` keeps working because foldkit emits that attribute verbatim.
 */
const ENTER_UTILITIES =
  /^(animate-in|fade-in-[\w.]+|zoom-in-[\w.]+|spin-in-[\w.]+|slide-in-from-[\w.-]+|animate-accordion-down)$/
const EXIT_UTILITIES =
  /^(animate-out|fade-out-[\w.]+|zoom-out-[\w.]+|spin-out-[\w.]+|slide-out-to-[\w.-]+|animate-accordion-up)$/

/** Applied to style-map values so vendored style CSS stays byte-identical upstream. */
const foldkitCompat = (classes) =>
  classes
    .split(/\s+/)
    .map((utility) => {
      const m = utility.match(/^(data-open|data-closed):([\w./-]+)$/)
      if (!m) return utility
      const [, state, value] = m
      if (state === 'data-open' && ENTER_UTILITIES.test(value)) return `data-enter:${value}`
      if (state === 'data-closed' && EXIT_UTILITIES.test(value)) return `data-leave:${value}`
      return utility
    })
    .join(' ')

export function resolveStyles() {
  const created = []

  for (const style of STYLES) {
    const cssText = style.cssFiles
      .map((file) => {
        const path = join(REGISTRY_DIR, file)
        if (!existsSync(path)) throw new Error(`missing style css: ${path}`)
        return readFileSync(path, 'utf8')
      })
      .join('\n')

    // Compat deltas concatenated first land LAST in merged duplicate values
    // (createStyleMap prepends later duplicates), so under tailwind-merge's
    // last-wins rule the delta wins. Vendored classes get the foldkit
    // animation-state rewrite applied uniformly over the merged map.
    const rawStyleMap = createStyleMap(cssText)
    const styleMap = Object.fromEntries(
      Object.entries(rawStyleMap).map(([token, classes]) => [token, foldkitCompat(classes)]),
    )
    if (Object.keys(styleMap).length === 0) {
      throw new Error(`style "${style.name}" produced an empty cn-* map`)
    }

    const outDir = join(STYLES_OUT_ROOT, style.name)
    rmSync(outDir, { recursive: true, force: true })

    created.push(...transformTokenDir(style, styleMap, outDir))
    for (const dir of VERBATIM_DIRS) created.push(...copyVerbatim(style, dir, outDir))
  }

  return created
}

function transformTokenDir(style, styleMap, outDir) {
  const sourceDir = join(DEFAULT_DIR, TOKEN_DIR)
  const files = readdirSync(sourceDir).filter(
    (file) => file.endsWith('.ts') && file !== 'registry.json',
  )

  // One shared in-memory project: edits stay formatted because only literal
  // contents change.
  const project = new Project({ useInMemoryFileSystem: true })
  const unmappedTokens = new Set()

  const written = []
  for (const file of files) {
    const source = readFileSync(join(sourceDir, file), 'utf8')
    const sourceFile = project.createSourceFile(file, source, { overwrite: true })
    transformSourceFile(sourceFile, styleMap, unmappedTokens)

    const output = sourceFile.getFullText()
    assertNoTokenLiterals(file, output)

    const outPath = join(outDir, TOKEN_DIR, file)
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, output)
    written.push(join(style.name, TOKEN_DIR, file))
  }

  if (unmappedTokens.size > 0) {
    console.warn(
      `resolve-styles [${style.name}]: tokens referenced by components but absent from the style map ` +
        `(stripped from output — check cn-compat.css and registry/styles/style-nova.css for drift):\n  ${[...unmappedTokens].join('\n  ')}`,
    )
  }

  return written
}

function copyVerbatim(style, dir, outDir) {
  const sourceDir = join(DEFAULT_DIR, dir)
  if (!existsSync(sourceDir)) return []

  const targetDir = join(outDir, dir)
  cpSync(sourceDir, targetDir, { recursive: true })

  // Drop registry manifests from the verbatim copy — they are authoring
  // metadata, not shippable source.
  rmSync(join(targetDir, 'registry.json'), { force: true })
  return []
}

// --- string-literal transformer ---------------------------------------------
// Adapted from shadcn-ui/ui packages/shadcn/src/styles/transform-style-map.ts
// (MIT): same extraction/removal/merge helpers, applied to every string
// literal instead of only cva/className/mergeProps positions.

function transformSourceFile(sourceFile, styleMap, unmappedTokens) {
  sourceFile.forEachDescendant((node) => {
    if (!isStringLiteralLike(node)) return

    const value = node.getLiteralText()
    const tokens = extractCnClasses(value)
    if (tokens.length === 0) return

    for (const token of tokens) {
      if (!(token in styleMap)) unmappedTokens.add(token)
    }

    const resolution = tokens
      .map((token) => styleMap[token])
      .filter((classes) => Boolean(classes))
      .join(' ')

    node.setLiteralValue(removeCnClasses(mergeClasses(resolution, value)))
  })
}

function isStringLiteralLike(node) {
  return Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)
}

function extractCnClasses(str) {
  return Array.from(str.matchAll(/\bcn-[\w-]+\b/g), (match) => match[0])
}

function removeCnClasses(str) {
  return str
    .replace(/\bcn-[\w-]+\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function mergeClasses(newClasses, existing) {
  return twMerge(newClasses, existing)
}

function assertNoTokenLiterals(file, output) {
  const project = new Project({ useInMemoryFileSystem: true })
  const check = project.createSourceFile(`${file}.check`, output, { overwrite: true })
  const offenders = []

  check.forEachDescendant((node) => {
    if (isStringLiteralLike(node) && /\bcn-[\w-]+\b/.test(node.getLiteralText())) {
      offenders.push(node.getLiteralText().slice(0, 120))
    }
  })

  if (offenders.length > 0) {
    throw new Error(
      `resolve-styles: ${file} still contains cn-* string literals after transform:\n  ${offenders.join('\n  ')}`,
    )
  }
}

// --- CLI entry ---------------------------------------------------------------

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isMain) {
  const written = resolveStyles()
  console.log(`resolve-styles: emitted ${written.length} transformed files for ${STYLES.map((s) => s.name).join(', ')}`)
}
