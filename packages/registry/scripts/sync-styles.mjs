/**
 * sync-styles.mjs — vendor the shadcn v4 style token CSS files into this repo.
 *
 * foldcn vendors the per-style `cn-*` token layers from shadcn-ui/ui verbatim
 * (see ADR-015): apps/v4/registry/styles/style-<name>.css is copied
 * byte-for-byte, keeping upstream file names, so refreshing is a plain copy
 * and any intentional divergence would show up as a reviewable diff.
 *
 * The foldkit adaptation of animation-state hooks (data-open:/data-closed: →
 * data-enter:/data-leave:) is NOT baked into the vendored files — it happens
 * at resolve time in scripts/resolve-styles.mjs, leaving these artifacts
 * byte-identical to upstream.
 *
 * Provenance (upstream commit + sync date) is recorded in
 * registry/styles/README.md, which this script regenerates on every run.
 * The style CSS files themselves never carry headers — that would break
 * byte-identity with upstream.
 *
 * Usage:
 *   node scripts/sync-styles.mjs [--shadcn-dir <path>] [--check]
 *
 * SHADCN_UI_DIR env var or --shadcn-dir points at the shadcn/ui checkout
 * (the directory containing apps/v4). --check verifies vendored files match
 * the checkout instead of writing (for pre-sync drift review).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REGISTRY_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const VENDORED_DIR = join(REGISTRY_DIR, 'registry', 'styles')

// --- args -----------------------------------------------------------------

const args = process.argv.slice(2)
const readFlag = (name) => {
  const i = args.indexOf(name)
  return i === -1 ? undefined : args[i + 1]
}
const checkOnly = args.includes('--check')
const shadcnDir = resolve(
  readFlag('--shadcn-dir') ?? process.env.SHADCN_UI_DIR ?? '/Users/elianiva/Development/repos/shadcn-ui/ui',
)
const upstreamStylesDir = join(shadcnDir, 'apps', 'v4', 'registry', 'styles')

if (!existsSync(join(upstreamStylesDir, 'style-nova.css'))) {
  console.error(`shadcn checkout not usable — missing ${join(upstreamStylesDir, 'style-nova.css')}`)
  console.error('pass --shadcn-dir <path to shadcn/ui repo containing apps/v4>')
  process.exit(1)
}

// --- upstream commit ------------------------------------------------------

let upstreamCommit = 'unknown'
try {
  upstreamCommit = execFileSync('git', ['-C', shadcnDir, 'rev-parse', '--short=7', 'HEAD'], {
    encoding: 'utf8',
  }).trim()
} catch {
  console.error('warning: could not read HEAD commit from the shadcn checkout')
}

// --- collect upstream style files ------------------------------------------

const styleFiles = readdirSync(upstreamStylesDir)
  .filter((f) => /^style-[\w-]+\.css$/.test(f))
  .sort()

if (!styleFiles.includes('style-nova.css')) {
  console.error('upstream styles directory has no style-nova.css — layout changed upstream?')
  process.exit(1)
}

// --- verify or write -------------------------------------------------------

if (checkOnly) {
  const drifted = styleFiles.filter((file) => {
    const vendored = join(VENDORED_DIR, file)
    return (
      !existsSync(vendored) ||
      readFileSync(vendored, 'utf8') !== readFileSync(join(upstreamStylesDir, file), 'utf8')
    )
  })
  if (drifted.length > 0) {
    console.error(`vendored styles differ from ${upstreamCommit}:\n  ${drifted.join('\n  ')}`)
    process.exit(1)
  }
  console.log(`sync-styles: --check clean (${styleFiles.length} files match upstream ${upstreamCommit})`)
  process.exit(0)
}

rmSync(VENDORED_DIR, { recursive: true, force: true })

const today = new Date().toISOString().slice(0, 10)
mkdirSync(VENDORED_DIR, { recursive: true })
for (const file of styleFiles) {
  const source = readFileSync(join(upstreamStylesDir, file), 'utf8')
  // Byte-identical copy — do not prepend headers or reformat.
  writeFileSync(join(VENDORED_DIR, file), source)
}

writeFileSync(
  join(VENDORED_DIR, 'README.md'),
  `# Vendored shadcn styles

The \`style-*.css\` files in this directory are **verbatim copies** of
[shadcn-ui/ui](https://github.com/shadcn-ui/ui)
\`apps/v4/registry/styles/style-*.css\` — the \`cn-*\` utility-token layers that
style the shadcn v4 BASE registry components foldcn derives from.

foldcn components emit those \`cn-*\` token classes verbatim (ADR-014); each
style defines what the tokens resolve to. \`style-nova.css\` is foldcn's default
style; the others are vendored so alternative styles can be adopted later
without another sourcing step. The files are consumed at build time by
\`scripts/resolve-styles.mjs\`; nothing here ships to users directly.

**License: MIT** — © shadcn, see LICENSE in the upstream repository
(https://github.com/shadcn-ui/ui/blob/main/LICENSE).

## Syncing

Vendored from upstream commit \`${upstreamCommit}\` on ${today}.

\`\`\`bash
# refresh from a local checkout (default: ~/Development/repos/shadcn-ui/ui)
node packages/registry/scripts/sync-styles.mjs [--shadcn-dir <path>]

# review drift without writing
node packages/registry/scripts/sync-styles.mjs --check
\`\`\`

Keep the copies byte-identical: no headers, no formatting, no foldkit edits.
foldkit-specific adaptations live in \`registry/default/style/cn-compat.css\`
and in \`scripts/resolve-styles.mjs\`.
`,
)

console.log(`sync-styles: vendored ${styleFiles.length} files from upstream ${upstreamCommit} (${today})`)
console.log(`  ${styleFiles.join('\n  ')}`)
