#!/usr/bin/env node
/**
 * verify-parity.mjs — inventory + token parity checks for foldcn vs upstream.
 *
 * Usage:
 *   node .agents/skills/verify-parity/scripts/verify-parity.mjs              # full check (inventory + tokens)
 *   node .agents/skills/verify-parity/scripts/verify-parity.mjs --inventory  # inventory only
 *   node .agents/skills/verify-parity/scripts/verify-parity.mjs --tokens     # token leak check
 *   node .agents/skills/verify-parity/scripts/verify-parity.mjs --visual     # + visual (agent-browser snapshot + screenshot per state)
 *
 * Attributes/state (data-slot, data-enter/leave, data-side, disabled twins) and
 * behavior gaps (#1-12) are manual checklist steps — see references/parity-checklist.md
 * §3-§4. This script covers inventory + built-artifact token leaks and delegates
 * --visual to verify-visual-parity.mjs.
 *
 * Visual requires agent-browser (npm i -g agent-browser && agent-browser install) + preview servers.
 * Run `agent-browser skills get core` first. Upstream without a checkout is discovered
 * via web_search + agent-browser read (see references/upstream-source.md).
 *
 * Exit non-zero on leaked cn-* literals in dist/r or (with --visual) VISUAL_MAJOR.
 * Inventory drift and audit staleness warn but do not fail. Prints a summary.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const REPO_DIR = resolve(SKILL_DIR, '..', '..', '..')
const REGISTRY_JSON = join(REPO_DIR, 'packages/registry/registry/default/ui/registry.json')
const UI_DIR = join(REPO_DIR, 'packages/registry/registry/default/ui')
const AUDIT_PATH = join(REPO_DIR, 'docs/shadcn-base-parity-audit.md')

const args = process.argv.slice(2)
const onlyInventory = args.includes('--inventory')
const onlyTokens = args.includes('--tokens')
const wantVisual = args.includes('--visual') || args.includes('--images')

function loadLocalInventory() {
  const data = JSON.parse(readFileSync(REGISTRY_JSON, 'utf8'))
  const names = data.items.map((i) => i.name).sort()
  return { names, count: names.length }
}

function loadUpstreamInventory() {
  const candidates = [
    process.env.SHADCN_UI_DIR && join(process.env.SHADCN_UI_DIR, 'apps/v4/registry/bases/base/ui'),
    join(process.env.HOME ?? '', 'Development/repos/shadcn-ui/ui/apps/v4/registry/bases/base/ui'),
    '/Users/elianiva/Development/repos/shadcn-ui/ui/apps/v4/registry/bases/base/ui',
  ].filter(Boolean)

  for (const dir of candidates) {
    if (existsSync(dir)) {
      const files = readdirSync(dir)
        .filter(
          (f) =>
            (f.endsWith('.tsx') || f.endsWith('.ts')) && !f.startsWith('_') && !f.startsWith('.'),
        )
        .map((f) => f.replace(/\.(tsx|ts)$/, ''))
        .sort()
      return { source: dir, names: files, commit: tryCommit(dirname(dirname(dirname(dir)))) }
    }
  }

  const cached = join(REPO_DIR, '.tmp/upstream.json')
  if (existsSync(cached)) {
    const data = JSON.parse(readFileSync(cached, 'utf8'))
    return { source: cached, names: data.names ?? data.map((x) => x.name ?? x).sort() }
  }

  return null
}

function tryCommit(repoDir) {
  try {
    return execFileSync('git', ['-C', repoDir, 'rev-parse', '--short=7', 'HEAD'], {
      encoding: 'utf8',
    }).trim()
  } catch {
    return null
  }
}

function classifyInventory(localNames, upstreamNames) {
  if (!upstreamNames) return null
  const localSet = new Set(localNames)
  const upstreamSet = new Set(upstreamNames)
  // Known renames
  const renameMap = { menu: 'dropdown-menu', fieldset: 'field' }
  const reverseRename = { 'dropdown-menu': 'menu', field: 'fieldset' }

  const paired = []
  const foldcnOnly = []
  const upstreamOnly = []

  for (const name of localNames) {
    const upstreamName = renameMap[name] ?? name
    if (upstreamSet.has(upstreamName) || upstreamSet.has(name)) paired.push(name)
    else foldcnOnly.push(name)
  }
  for (const name of upstreamNames) {
    const localName = reverseRename[name] ?? name
    if (!localSet.has(localName) && !localSet.has(name)) upstreamOnly.push(name)
  }

  return { paired: paired.sort(), foldcnOnly: foldcnOnly.sort(), upstreamOnly: upstreamOnly.sort() }
}

function checkLeakedTokens() {
  const offenders = []
  const files = readdirSync(UI_DIR).filter((f) => f.endsWith('.ts') && f !== 'registry.json')
  for (const file of files) {
    const content = readFileSync(join(UI_DIR, file), 'utf8')
    // Check string literals only — comments may reference cn-* intentionally
    // Simple heuristic: find cn-* inside quoted strings
    const literalMatches = [...content.matchAll(/(["'`])[^"'`]*\bcn-[\w-]+\b[^"'`]*\1/g)]
    // Filter to those where the match is inside a class string context — but any literal cn-* is suspect
    // The build's ts-morph check is authoritative; this is a quick pre-check
    if (literalMatches.length > 0) {
      // Count unique tokens in literals
      const tokens = [...content.matchAll(/\bcn-[\w-]+\b/g)].map((m) => m[0])
      if (tokens.length > 0) {
        // Resolve check: authored files SHOULD have cn-* — leaked means post-resolve has them
        // So for authored source we just report presence as info, not failure
        offenders.push({ file, tokens: [...new Set(tokens)] })
      }
    }
  }
  return offenders
}

async function checkBuiltArtifacts() {
  const distDir = join(REPO_DIR, 'packages/registry/dist/r')
  if (!existsSync(distDir))
    return { skipped: 'no dist/r — run pnpm --filter @foldcn/registry build first' }
  const files = readdirSync(distDir).filter((f) => f.endsWith('.json') && f !== 'registry.json')
  const leaked = []
  let hasTsMorph = false
  let tsMorph = null
  try {
    tsMorph = await import('ts-morph')
    hasTsMorph = true
  } catch {
    hasTsMorph = false
  }
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(distDir, file), 'utf8'))
    for (const entry of data.files ?? []) {
      if (!entry.content || !entry.path?.endsWith('.ts')) continue
      if (!/\bcn-[\w-]+\b/.test(entry.content)) continue
      let isLeaked = false
      if (hasTsMorph) {
        const { Project, Node } = tsMorph
        const project = new Project({ useInMemoryFileSystem: true })
        const sf = project.createSourceFile(entry.path, entry.content, { overwrite: true })
        sf.forEachDescendant((node) => {
          const isLiteral = Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)
          if (isLiteral && /\bcn-[\w-]+\b/.test(node.getLiteralText())) isLeaked = true
        })
      } else {
        // Fallback: strip block and line comments before literal check
        const stripped = entry.content
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/[^\n]*\n/g, '\n')
        if (/(["'`])[^"'`]*\bcn-[\w-]+\b/.test(stripped)) isLeaked = true
      }
      if (isLeaked) leaked.push(`${file} :: ${entry.path}`)
    }
  }
  return { leaked }
}

async function main() {
  const local = loadLocalInventory()
  const upstream = loadUpstreamInventory()
  const inventory = upstream ? classifyInventory(local.names, upstream.names) : null

  let ok = true

  console.log('== verify-parity ==\n')
  console.log(`Local registry: ${local.count} items (${REGISTRY_JSON})`)
  if (upstream) {
    console.log(
      `Upstream: ${upstream.names.length} items (source: ${upstream.source}${upstream.commit ? ` @ ${upstream.commit}` : ''})`,
    )
  } else {
    console.log('Upstream: not found (set $SHADCN_UI_DIR or run fetch-upstream.mjs)')
  }

  if (!onlyTokens) {
    console.log('\n-- Inventory --')
    if (!inventory) {
      console.log('  (skipped — no upstream source available)')
      console.log('  Run: node .agents/skills/verify-parity/scripts/fetch-upstream.mjs')
    } else {
      console.log(`  Paired: ${inventory.paired.length} — ${inventory.paired.join(', ')}`)
      console.log(
        `  foldcn-only: ${inventory.foldcnOnly.length} — ${inventory.foldcnOnly.join(', ') || '(none)'}`,
      )
      console.log(
        `  upstream-only: ${inventory.upstreamOnly.length} — ${inventory.upstreamOnly.join(', ') || '(none)'}`,
      )

      // Known expected sets from audit — warn if they drift
      const expectedFoldcnOnly = [
        'animation',
        'date-picker',
        'drag-and-drop',
        'file-drop',
        'listbox',
        'nav',
        'virtual-list',
      ]
      const missingFoldcnOnly = expectedFoldcnOnly.filter((n) => !inventory.foldcnOnly.includes(n))
      const extraFoldcnOnly = inventory.foldcnOnly.filter((n) => !expectedFoldcnOnly.includes(n))
      if (missingFoldcnOnly.length > 0) {
        console.log(`  WARN: expected foldcn-only missing: ${missingFoldcnOnly.join(', ')}`)
      }
      if (extraFoldcnOnly.length > 0) {
        console.log(`  NOTE: new foldcn-only vs audit: ${extraFoldcnOnly.join(', ')}`)
      }
    }
  }

  if (!onlyInventory) {
    console.log('\n-- Token fidelity --')
    const authoredTokens = checkLeakedTokens()
    const built = await checkBuiltArtifacts()

    if (authoredTokens.length > 0) {
      console.log(
        `  Authored cn-* tokens present in ${authoredTokens.length} files (expected — authored sources use cn-*)`,
      )
      // Not a failure — authored sources should have cn-*
    }

    if (built.skipped) {
      console.log(`  Built check: ${built.skipped}`)
    } else if (built.leaked.length > 0) {
      console.log(`  FAIL: leaked cn-* literals in built dist/r:`)
      for (const item of built.leaked) console.log(`    ${item}`)
      ok = false
    } else {
      console.log('  Built dist/r: no leaked cn-* literals')
    }

    // Check resolve-styles warnings would require running it — suggest it
    console.log(
      '  Run `node packages/registry/scripts/resolve-styles.mjs` to see unmapped token warnings',
    )
    console.log('  Run `pnpm --filter @foldcn/registry build` to assert no leaked literals')
  }

  // Visual parity — delegates to verify-visual-parity.mjs (state matrix + agent-browser snapshot/screenshot per state)
  // Opt-in: only when --visual or --images is passed. Default CI run stays fast (inventory + tokens).
  // See references/visual-parity.md; run `agent-browser skills get core` before driving the browser.
  if (wantVisual) {
    // Forward visual flags (both `--flag value` and `--flag=value` forms) to the child harness.
    const passthrough = ['--component', '--theme', '--out', '--foldcn-url', '--shadcn-url']
    const visualArgs = ['--states', '--images']
    for (let i = 0; i < args.length; i++) {
      const a = args[i]
      if (a === '--all-styles') {
        visualArgs.push('--all-styles')
        continue
      }
      for (const flag of passthrough) {
        if (a === flag && args[i + 1] && !args[i + 1].startsWith('--')) {
          visualArgs.push(flag, args[i + 1])
          i++
          break
        }
        if (a.startsWith(`${flag}=`)) {
          visualArgs.push(a)
          break
        }
      }
    }
    console.log('\n-- Visual parity (states + images) --')
    try {
      const { spawnSync } = await import('node:child_process')
      const visualScript = join(SKILL_DIR, 'scripts/verify-visual-parity.mjs')
      const res = spawnSync(process.execPath, [visualScript, ...visualArgs], { stdio: 'inherit' })
      if (res.status !== 0) {
        console.log('  Visual parity: FAIL (see above — VISUAL_MAJOR or capture failure)')
        ok = false
      } else {
        console.log('  Visual parity: PASS')
      }
    } catch (e) {
      console.log(`  Visual parity: skipped — ${e.message}`)
    }
    console.log('  See references/visual-parity.md for capture protocol and thresholds.')
    console.log('  Evidence (when captured): .tmp/visual-parity/<component>/<state>/')
  } else if (!onlyInventory && !onlyTokens) {
    console.log('\n-- Visual parity --')
    console.log('  (skipped — run with --visual for state matrix + image diffs)')
    console.log(
      '  Quick state check: node .agents/skills/verify-parity/scripts/verify-visual-parity.mjs --states',
    )
  }

  // Audit freshness check
  if (existsSync(AUDIT_PATH)) {
    const audit = readFileSync(AUDIT_PATH, 'utf8')
    const statusMatch = audit.match(/> \*\*Status[^*]*\*\*([^\n]*)/)
    if (statusMatch) console.log(`\n-- Audit status --\n  ${statusMatch[0].slice(0, 200)}`)
  }

  console.log(`\n${ok ? 'PASS' : 'FAIL'} — verify-parity ${ok ? 'ok' : 'found issues'}`)
  process.exit(ok ? 0 : 1)
}

main()
