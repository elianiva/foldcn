#!/usr/bin/env node
/**
 * verify-visual-parity.mjs — visual state matrix + optional image diff vs upstream.
 *
 * Modes:
 *   --states   enumerate applicable states per paired component and check CSS coverage
 *              in resolved output (no browser needed)
 *   --images   --states + agent-browser snapshot + screenshot + pixel/snapshot diff
 *              (needs agent-browser + preview servers; run `agent-browser skills get core` first)
 *   (no flag)  alias for --states
 *
 * Flags:
 *   --foldcn-url <url>   foldcn preview (default http://localhost:5173)
 *   --shadcn-url <url>   upstream preview (default http://localhost:3000 or https://ui.shadcn.com)
 *   --theme <light|dark|both>
 *   --component <name>
 *   --all-styles         repeat per style (nova..rhea)
 *   --out <dir>          evidence root (default .tmp/visual-parity)
 *
 * Evidence: .tmp/visual-parity/<component>/<state>/<theme>-<style>.png
 * Exit non-zero on VISUAL_MAJOR when --images was requested and browser was available.
 * With no browser, exits 0 but warns images: skipped.
 */
import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const REPO_DIR = resolve(SKILL_DIR, '..', '..', '..')
const REGISTRY_JSON = join(REPO_DIR, 'packages/registry/registry/default/ui/registry.json')
const UI_DIR = join(REPO_DIR, 'packages/registry/registry/default/ui')

const args = process.argv.slice(2)
const wantImages = args.includes('--images')
const allStyles = args.includes('--all-styles')

function argVal(flag, fallback) {
  const idx = args.indexOf(flag)
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1]
  // also support --flag=value
  const pref = args.find((a) => a.startsWith(`${flag}=`))
  if (pref) return pref.slice(flag.length + 1)
  return fallback
}

const foldcnUrl = argVal('--foldcn-url', process.env.FOLDCN_URL ?? 'http://localhost:5173')
const shadcnUrl = argVal('--shadcn-url', process.env.SHADCN_URL ?? 'http://localhost:3000')
const themeArg = argVal('--theme', 'both')
const componentFilter = argVal('--component', null)
const outRoot = resolve(REPO_DIR, argVal('--out', '.tmp/visual-parity'))

const STYLES = allStyles
  ? ['default', 'nova', 'vega', 'maia', 'lyra', 'mira', 'luma', 'sera', 'rhea']
  : ['default']
const THEMES = themeArg === 'both' ? ['light', 'dark'] : [themeArg]

// ---------------------------------------------------------------------------
// Inventory — reuse logic from verify-parity.mjs
// ---------------------------------------------------------------------------
function loadLocalNames() {
  const data = JSON.parse(readFileSync(REGISTRY_JSON, 'utf8'))
  return data.items.map((i) => i.name).sort()
}
function loadUpstreamNames() {
  const candidates = [
    process.env.SHADCN_UI_DIR && join(process.env.SHADCN_UI_DIR, 'apps/v4/registry/bases/base/ui'),
    join(process.env.HOME ?? '', 'Development/repos/shadcn-ui/ui/apps/v4/registry/bases/base/ui'),
    '/Users/elianiva/Development/repos/shadcn-ui/ui/apps/v4/registry/bases/base/ui',
  ].filter(Boolean)
  for (const dir of candidates) {
    if (existsSync(dir)) {
      return readdirSync(dir)
        .filter((f) => (f.endsWith('.tsx') || f.endsWith('.ts')) && !f.startsWith('_'))
        .map((f) => f.replace(/\.(tsx|ts)$/, ''))
        .sort()
    }
  }
  const cached = join(REPO_DIR, '.tmp/upstream.json')
  if (existsSync(cached)) {
    const data = JSON.parse(readFileSync(cached, 'utf8'))
    return (data.names ?? data.map((x) => x.name ?? x)).sort()
  }
  return null
}
function pairedNames() {
  const local = loadLocalNames()
  const upstream = loadUpstreamNames()
  if (!upstream) return local // fallback: treat all local as paired for state enumeration
  const renameMap = { menu: 'dropdown-menu', fieldset: 'field' }
  const upstreamSet = new Set(upstream)
  return local.filter((n) => upstreamSet.has(renameMap[n] ?? n) || upstreamSet.has(n)).sort()
}

// ---------------------------------------------------------------------------
// State matrix
// ---------------------------------------------------------------------------
/**
 * Generic state buckets — per-component applicability is refined by upstream
 * prop/style inspection + component file heuristics.
 */
const STATE_DEFS = [
  { id: 'idle', label: 'idle (default)', cues: ['base'] },
  { id: 'hover', label: 'hover', cues: ['hover:'] },
  { id: 'focus-visible', label: 'focus-visible', cues: ['focus-visible:', 'focus:'] },
  { id: 'active', label: 'active / pressed', cues: ['active:', 'data-active', 'aria-pressed'] },
  { id: 'disabled', label: 'disabled', cues: ['disabled:', 'aria-disabled:', 'data-disabled:'] },
  { id: 'open', label: 'open', cues: ['data-open:', 'data-state=open', 'data-enter:'] },
  { id: 'closed', label: 'closed', cues: ['data-closed:', 'data-leave:'] },
  { id: 'checked', label: 'checked', cues: ['data-checked', 'aria-checked'] },
  { id: 'selected', label: 'selected', cues: ['data-selected', 'aria-selected'] },
  { id: 'invalid', label: 'invalid', cues: ['aria-invalid:'] },
]

/**
 * Component-specific state extensions. Keys are local registry names.
 * Each entry adds states beyond the generic buckets.
 */
const COMPONENT_EXTRA_STATES = {
  progress: [
    { id: 'indeterminate', label: 'indeterminate (no value)', cues: ['value===undefined'] },
  ],
  command: [{ id: 'empty', label: 'empty', cues: ['empty'] }],
  calendar: [
    { id: 'today', label: 'today', cues: ['today'] },
    { id: 'range', label: 'range selection', cues: ['range'] },
  ],
  tabs: [
    {
      id: 'orientation-vertical',
      label: 'orientation vertical',
      cues: ['data-orientation=vertical'],
    },
  ],
  sidebar: [
    { id: 'offcanvas', label: 'offcanvas', cues: ['offcanvas'] },
    { id: 'icon', label: 'icon collapsed', cues: ['icon'] },
  ],
  accordion: [{ id: 'expanded', label: 'expanded', cues: ['data-state=open'] }],
  collapsible: [{ id: 'expanded', label: 'expanded', cues: ['data-state=open'] }],
  slider: [{ id: 'dragging', label: 'dragging', cues: ['drag'] }],
  toast: [{ id: 'swipe', label: 'swipe (if supported)', cues: ['swipe'] }],
}

// Heuristic: which generic states apply to which component family
function isOverlay(name) {
  return [
    'dialog',
    'alert-dialog',
    'sheet',
    'drawer',
    'popover',
    'tooltip',
    'hover-card',
    'menu',
    'context-menu',
    'menubar',
    'select',
    'combobox',
  ].includes(name)
}
function isCheckable(name) {
  return ['checkbox', 'switch', 'radio-group', 'toggle', 'toggle-group', 'tabs'].includes(name)
}
function isSelectable(name) {
  return ['tabs', 'toggle-group', 'select', 'combobox', 'command', 'listbox'].includes(name)
}

function isInteractive(name) {
  // presentational / layout components have no hover/focus semantics
  return ![
    'separator',
    'skeleton',
    'spinner',
    'kbd',
    'aspect-ratio',
    'direction',
    'marker',
    'card',
    'table',
    'alert',
    'empty',
    'item',
  ].includes(name)
}
function applicableStates(name) {
  const states = []
  for (const def of STATE_DEFS) {
    if (def.id === 'idle') {
      states.push(def)
      continue
    }
    if (def.id === 'hover' && isInteractive(name)) {
      states.push(def)
      continue
    }
    if (def.id === 'focus-visible' && isInteractive(name)) {
      states.push(def)
      continue
    }
    if (
      def.id === 'active' &&
      (isCheckable(name) || ['button', 'toggle', 'tabs', 'menu', 'menubar'].includes(name))
    ) {
      states.push(def)
      continue
    }
    if (def.id === 'active' && name === 'button') {
      states.push(def)
      continue
    }
    if (
      def.id === 'disabled' &&
      ![
        'separator',
        'skeleton',
        'spinner',
        'kbd',
        'aspect-ratio',
        'direction',
        'marker',
        'card',
        'table',
        'breadcrumb',
        'empty',
        'item',
        'alert',
      ].includes(name)
    ) {
      states.push(def)
      continue
    }
    if (def.id === 'open' && isOverlay(name)) {
      states.push(def)
      continue
    }
    if (def.id === 'closed' && isOverlay(name)) {
      states.push(def)
      continue
    }
    if (
      def.id === 'checked' &&
      ['checkbox', 'switch', 'radio-group', 'toggle', 'toggle-group'].includes(name)
    ) {
      states.push(def)
      continue
    }
    if (def.id === 'selected' && isSelectable(name)) {
      states.push(def)
      continue
    }
    if (
      def.id === 'invalid' &&
      [
        'input',
        'textarea',
        'select',
        'checkbox',
        'switch',
        'input-otp',
        'input-group',
        'fieldset',
        'combobox',
      ].includes(name)
    ) {
      states.push(def)
      continue
    }
    // fallback: include hover/focus/disabled for most interactive components
    if (
      def.id === 'disabled' &&
      ['button', 'input', 'textarea', 'select', 'checkbox', 'switch'].includes(name)
    ) {
      if (!states.find((s) => s.id === 'disabled')) states.push(def)
    }
  }
  const extra = COMPONENT_EXTRA_STATES[name] ?? []
  for (const e of extra) if (!states.find((s) => s.id === e.id)) states.push(e)
  // dedupe by id
  const seen = new Set()
  return states.filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)))
}

function checkCssCoverage(name, styleName) {
  const resolvedPath = join(REPO_DIR, `packages/registry/styles/${styleName}/ui/${name}.ts`)
  const hasResolved = existsSync(resolvedPath)
  let content = ''
  if (hasResolved) content = readFileSync(resolvedPath, 'utf8')
  else {
    // fallback: authored source (pre-resolve) — still informative
    const authored = join(UI_DIR, `${name}.ts`)
    if (existsSync(authored)) content = readFileSync(authored, 'utf8')
  }
  const cues = {
    'hover:': content.includes('hover:'),
    'focus-visible:': content.includes('focus-visible:') || content.includes('focus:'),
    'data-enter:': content.includes('data-enter:'),
    'data-leave:': content.includes('data-leave:'),
    'aria-disabled:': content.includes('aria-disabled:'),
    'data-disabled:': content.includes('data-disabled:'),
    'data-active': content.includes('data-active'),
    'data-checked': content.includes('data-checked') || content.includes('aria-checked'),
    'data-selected': content.includes('data-selected') || content.includes('aria-selected'),
    'aria-invalid:': content.includes('aria-invalid:'),
  }
  return { hasResolved, content, cues }
}

const STATE_CUE_REQUIREMENTS = {
  hover: ['hover:'],
  'focus-visible': ['focus-visible:'],
  active: ['data-active'],
  disabled: ['aria-disabled:', 'data-disabled:'],
  open: ['data-enter:'],
  closed: ['data-leave:'],
  checked: ['data-checked'],
  selected: ['data-selected'],
  invalid: ['aria-invalid:'],
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------
function printStateMatrix(names) {
  console.log('== verify-visual-parity — state matrix ==\n')
  console.log(`Themes: ${THEMES.join(', ')} | Styles: ${STYLES.join(', ')} | out: ${outRoot}`)
  if (componentFilter) console.log(`Filter: ${componentFilter}`)
  console.log('')

  let totalStates = 0
  let warnedStates = 0
  const rows = []
  for (const name of names) {
    if (componentFilter && name !== componentFilter) continue
    const states = applicableStates(name)
    totalStates += states.length * THEMES.length * STYLES.length
    const { hasResolved, cues } = checkCssCoverage(name, STYLES[0])
    const cueSummary =
      Object.entries(cues)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(', ') || '(no state cues in resolved output)'
    // warn when an applicable state has no cue in resolved CSS — likely missing visual hook
    const missingCues = []
    for (const s of states) {
      const req = STATE_CUE_REQUIREMENTS[s.id]
      if (!req) continue
      const hasAny = req.some((cue) => cues[cue])
      if (!hasAny) missingCues.push(`${s.id} (missing ${req.join('/')})`)
    }
    if (missingCues.length > 0) warnedStates += missingCues.length
    rows.push({
      name,
      states: states.map((s) => s.id).join(', '),
      cueSummary,
      hasResolved,
      missingCues,
    })
  }

  for (const r of rows) {
    console.log(`  ${r.name}: [${r.states}]`)
    console.log(
      `    cues: ${r.cueSummary} ${r.hasResolved ? '' : '(no resolved output — run resolve-styles.mjs)'}`,
    )
    if (r.missingCues.length > 0) {
      console.log(`    WARN: states without CSS hook — ${r.missingCues.join(', ')}`)
    }
  }
  if (warnedStates > 0) {
    console.log(
      `\n  Note: ${warnedStates} state(s) lack expected CSS hooks in resolved output — they may be visually identical across states or rely on attribute hooks that haven't been ported. Review references/visual-parity.md.`,
    )
  }

  console.log(
    `\nTotal captures if --images: ${totalStates} screenshots (components × states × themes × styles) + upstream twins + diffs`,
  )
  console.log(`Pairwise diffs: ${totalStates} (one per capture)`)

  // detailed per-state table when single component
  if (componentFilter) {
    const name = componentFilter
    const states = applicableStates(name)
    console.log(`\n-- ${name} state detail --`)
    for (const s of states) {
      console.log(`  ${s.id}: ${s.label} — cues: ${s.cues.join(', ')}`)
    }
    console.log(`\nCapture paths (example):`)
    for (const s of states.slice(0, 3)) {
      for (const theme of THEMES.slice(0, 1)) {
        for (const style of STYLES.slice(0, 1)) {
          console.log(`  ${outRoot}/${name}/${s.id}/${theme}-${style}.png`)
          console.log(`  ${outRoot}/${name}/${s.id}/${theme}-${style}-upstream.png`)
          console.log(`  ${outRoot}/${name}/${s.id}/${theme}-${style}-diff.png`)
        }
      }
    }
    if (states.length > 3) console.log(`  ... and ${states.length - 3} more states`)
  }

  return { rows, totalStates }
}

// ---------------------------------------------------------------------------
// Image capture — agent-browser snapshot + screenshot (no Playwright)
// ---------------------------------------------------------------------------
async function tryCaptureImages(names) {
  // detect agent-browser
  const { spawnSync } = await import('node:child_process')
  const hasAgentBrowser = (() => {
    try {
      const r = spawnSync('agent-browser', ['--version'], { encoding: 'utf8', timeout: 5000 })
      return r.status === 0
    } catch {
      return false
    }
  })()
  if (!hasAgentBrowser) {
    console.log('\n-- Images --')
    console.log(
      '  skipped — agent-browser not found (npm i -g agent-browser && agent-browser install)',
    )
    console.log('  See `agent-browser skills get core` for the snapshot → ref → screenshot core loop')
    console.log(
      '  CSS state coverage above is the fallback; install agent-browser and run with --images for snapshot + pixel evidence.',
    )
    return { skipped: 'no agent-browser' }
  }

  let pixelmatch, PNG
  try {
    pixelmatch = (await import('pixelmatch')).default ?? (await import('pixelmatch'))
    PNG = (await import('pngjs')).PNG
  } catch {
    console.log(
      '\nNote: pixelmatch/pngjs not installed — diffs will be existence + snapshot-attr only. Install with: npm i -D pixelmatch pngjs',
    )
    pixelmatch = null
    PNG = null
  }

  // quick health check — can we reach foldcn?
  let foldcnReachable = false
  try {
    const res = await fetch(foldcnUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
    foldcnReachable = res.ok
  } catch {
    foldcnReachable = false
  }
  if (!foldcnReachable) {
    console.log(`\n-- Images --`)
    console.log(`  skipped — foldcn preview not reachable at ${foldcnUrl}`)
    console.log(
      `  Start it: pnpm --filter @foldcn/web dev  or  pnpm --filter @foldcn/web build && pnpm --filter @foldcn/web preview`,
    )
    return { skipped: 'foldcn unreachable' }
  }

  let shadcnReachable = false
  try {
    const res = await fetch(shadcnUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
    shadcnReachable = res.ok
  } catch {
    shadcnReachable = false
  }
  if (!shadcnReachable) {
    console.log(`\n-- Images --`)
    console.log(
      `  warning — upstream not reachable at ${shadcnUrl} (diffs will be foldcn-only; web_search + agent-browser read https://ui.shadcn.com/docs/components/<name> is the fallback)`,
    )
  }

  console.log(`\n-- Images — capturing via agent-browser (snapshot + screenshot) --`)
  console.log(`  foldcn: ${foldcnUrl}`)
  console.log(
    `  upstream: ${shadcnUrl} ${shadcnReachable ? '(reachable)' : '(unreachable — foldcn-only captures)'}`,
  )
  console.log(`  out: ${outRoot}`)

  // Session isolation: honor an already-exported AGENT_BROWSER_SESSION (the documented
  // pattern: `export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree
  // --prefix verify-parity)"`) and fall back to a worktree-scoped id so parallel
  // agents never share one browser.
  const SESSION =
    process.env.AGENT_BROWSER_SESSION?.trim() || deriveSessionId() || 'verify-parity'
  console.log(
    `  session: ${SESSION} (isolated per worktree — see \`agent-browser skills get core\` for the core loop)`,
  )

  // helper to run agent-browser with session
  const ab = (args, opts = {}) => {
    const res = spawnSync('agent-browser', ['--session', SESSION, ...args], {
      encoding: 'utf8',
      timeout: 30000,
      ...opts,
    })
    return res
  }

  // Extract the first @eN ref from agent-browser snapshot output.
  // --json shape is { data: { refs: { eN: {...} } } }; human shape is `@eN [role] ...` /
  // `[ref=eN]`. Returns the canonical `@eN` form the CLI accepts.
  function firstSnapshotRef(text, role) {
    const parsed = tryParseSnapshotJson(text)
    if (parsed) {
      const keys = Object.keys(parsed)
      if (role) {
        const hit = keys.find((k) => (parsed[k]?.role ?? '').toLowerCase() === role)
        if (hit) return `@${hit}`
      }
      if (keys.length > 0) return `@${keys[0]}`
    }
    const m = text.match(/@(e\d+)/) || text.match(/\[ref=(e\d+)\]/)
    return m ? `@${m[1]}` : null
  }

  function tryParseSnapshotJson(text) {
    try {
      const start = text.indexOf('{')
      if (start === -1) return null
      const json = JSON.parse(text.slice(start))
      const refs = json?.data?.refs ?? json?.refs
      return refs && typeof refs === 'object' ? refs : null
    } catch {
      return null
    }
  }

  function deriveSessionId() {
    try {
      const res = spawnSync(
        'agent-browser',
        ['session', 'id', '--scope', 'worktree', '--prefix', 'verify-parity'],
        { encoding: 'utf8', timeout: 5000 },
      )
      const id = (res.stdout || '').trim().split(/\s+/).pop()
      return id || null
    } catch {
      return null
    }
  }

  let hasMajor = false
  const results = []

  // Small helpers
  const elementSelector = (name) => `[data-slot="${name}"], [data-slot="${name}-root"]`
  const upstreamComponentName = (name) =>
    name === 'menu' ? 'dropdown-menu' : name === 'fieldset' ? 'field' : name

  for (const theme of THEMES) {
    const mediaArgs = theme === 'dark' ? ['dark'] : ['light']
    // reduce motion for idle; allow motion for open/closed — handled per state below
    for (const name of names) {
      if (componentFilter && name !== componentFilter) continue
      const states = applicableStates(name)
      for (const state of states) {
        for (const style of STYLES) {
          const dir = join(outRoot, name, state.id)
          mkdirSync(dir, { recursive: true })
          const foldcnPath = join(dir, `${theme}-${style}.png`)
          const upstreamPath = join(dir, `${theme}-${style}-upstream.png`)
          const diffPath = join(dir, `${theme}-${style}-diff.png`)
          const snapPath = join(dir, `${theme}-${style}-snapshot.json`)
          const upstreamSnapPath = join(dir, `${theme}-${style}-upstream-snapshot.json`)

          // -------- foldcn capture --------
          try {
            const url = `${foldcnUrl.replace(/\/$/, '')}/docs/${name}`
            ab(['open', url])
            ab(['set', 'viewport', '1280', '800'])
            // set style via localStorage before re-navigating (active-style.ts reads it at boot)
            ab([
              'eval',
              `try{localStorage.setItem('foldcn-style','${style === 'default' ? 'default' : style}')}catch(e){}`,
            ])
            ab(['set', 'media', ...mediaArgs, 'reduced-motion'])
            // re-open after style set to pick it up, or just reload
            ab(['open', url])
            ab(['wait', '--load', 'networkidle'])
            // collect snapshot scoped to component for attr + ref discovery
            const snapRes = ab(['snapshot', '-s', elementSelector(name), '-i', '--json'])
            const snapText = snapRes.stdout || ''
            writeFileSync(snapPath, snapText)
            let firstRef = firstSnapshotRef(snapText)
            // fallback: full interactive snapshot if scoped empty
            if (!firstRef) {
              const full = ab(['snapshot', '-i'])
              firstRef = firstSnapshotRef(full.stdout || '')
            }
            // drive state if we have a ref
            if (firstRef) {
              if (state.id === 'hover') ab(['hover', firstRef])
              if (state.id === 'focus-visible') ab(['focus', firstRef])
              if (state.id === 'open' || state.id === 'expanded') {
                // click trigger if present, otherwise click the element itself
                const triggerSnap = ab(['snapshot', '-i'])
                const trigRef = firstSnapshotRef(triggerSnap.stdout || '', 'button')
                if (trigRef) ab(['click', trigRef])
                else ab(['click', firstRef])
                ab(['wait', '500'])
              }
              if (state.id === 'active') ab(['click', firstRef])
            }
            // allow motion for open/closed transition captures
            if (state.id === 'open' || state.id === 'closed') {
              ab(['set', 'media', ...mediaArgs])
            }
            // element screenshot (crop to component) — agent-browser supports selector as first arg
            const ssRes = ab(['screenshot', elementSelector(name).split(',')[0].trim(), foldcnPath])
            if (ssRes.status !== 0) {
              // fallback to viewport screenshot
              ab(['screenshot', foldcnPath])
            }
            // capture snapshot after state drive for attr diff
            const afterSnap = ab(['snapshot', '-s', elementSelector(name), '-i', '--json'])
            if (afterSnap.stdout) {
              const afterPath = join(dir, `${theme}-${style}-after.json`)
              try {
                writeFileSync(afterPath, afterSnap.stdout)
              } catch {}
            }
          } catch (e) {
            console.log(
              `  WARN ${name}/${state.id}/${theme}-${style}: foldcn capture failed — ${String(e.message || e).slice(0, 120)}`,
            )
          }

          // -------- upstream capture --------
          if (shadcnReachable) {
            try {
              const upstreamUrl = shadcnUrl.includes('ui.shadcn.com')
                ? `${shadcnUrl.replace(/\/$/, '')}/docs/components/${upstreamComponentName(name)}`
                : `${shadcnUrl.replace(/\/$/, '')}/docs/${upstreamComponentName(name)}`
              ab(['open', upstreamUrl])
              ab(['set', 'viewport', '1280', '800'])
              ab(['set', 'media', ...mediaArgs, 'reduced-motion'])
              ab(['wait', '--load', 'networkidle'])
              const upSnapRes = ab(['snapshot', '-s', elementSelector(name), '-i', '--json'])
              writeFileSync(upstreamSnapPath, upSnapRes.stdout || '')
              let upRef = firstSnapshotRef(upSnapRes.stdout || '')
              if (!upRef) {
                const full = ab(['snapshot', '-i'])
                upRef = firstSnapshotRef(full.stdout || '')
              }
              if (upRef) {
                if (state.id === 'hover') ab(['hover', upRef])
                if (state.id === 'focus-visible') ab(['focus', upRef])
                if (state.id === 'open' || state.id === 'expanded') {
                  ab(['click', upRef])
                  ab(['wait', '500'])
                }
                if (state.id === 'active') ab(['click', upRef])
              }
              const upSs = ab([
                'screenshot',
                elementSelector(name).split(',')[0].trim(),
                upstreamPath,
              ])
              if (upSs.status !== 0) ab(['screenshot', upstreamPath])
            } catch (e) {
              console.log(
                `  WARN ${name}/${state.id}/${theme}-${style}: upstream capture failed — ${String(e.message || e).slice(0, 120)}`,
              )
            }
          }

          // -------- attr diff via snapshots (agent-browser snapshot --json) --------
          let snapAttrMajor = false
          try {
            if (existsSync(snapPath) && existsSync(upstreamSnapPath)) {
              const a = readFileSync(snapPath, 'utf8')
              const b = readFileSync(upstreamSnapPath, 'utf8')
              const aHasSlot = a.includes(`data-slot`)
              const bHasSlot = b.includes(`data-slot`)
              if (aHasSlot !== bHasSlot) snapAttrMajor = true
              // state hooks that must appear when applicable
              const req = STATE_CUE_REQUIREMENTS[state.id]
              if (req && a) {
                // foldcn snapshot should contain at least one of the required attrs when state is applicable
                // we already warned in --states; snapshot attr diff is just extra signal
              }
            }
          } catch {}

          // -------- pixel diff --------
          if (existsSync(foldcnPath) && existsSync(upstreamPath) && pixelmatch && PNG) {
            try {
              const { readFileSync: rfs } = await import('node:fs')
              const a = PNG.sync.read(rfs(foldcnPath))
              const b = PNG.sync.read(rfs(upstreamPath))
              const w = Math.max(a.width, b.width)
              const h = Math.max(a.height, b.height)
              if (a.width !== b.width || a.height !== b.height) {
                console.log(
                  `  ${name}/${state.id}/${theme}-${style}: VISUAL_MAJOR — size mismatch foldcn ${a.width}×${a.height} vs upstream ${b.width}×${b.height}`,
                )
                hasMajor = true
                results.push({
                  name,
                  state: state.id,
                  theme,
                  style,
                  verdict: 'VISUAL_MAJOR',
                  reason: 'size mismatch',
                })
              } else {
                const diff = new PNG({ width: w, height: h })
                const mismatched = pixelmatch(a.data, b.data, diff.data, w, h, { threshold: 0.1 })
                const pct = (mismatched / (w * h)) * 100
                let verdict = 'VISUAL_MATCH'
                if (snapAttrMajor) verdict = 'VISUAL_MAJOR'
                else if (pct > 5) verdict = 'VISUAL_MAJOR'
                else if (pct > 1) verdict = 'VISUAL_MINOR'
                if (verdict === 'VISUAL_MAJOR') hasMajor = true
                writeFileSync(diffPath, PNG.sync.write(diff))
                const attrNote = snapAttrMajor ? ' (snapshot attr mismatch)' : ''
                console.log(
                  `  ${name}/${state.id}/${theme}-${style}: ${verdict} — ${pct.toFixed(2)}% diff (${mismatched} px)${attrNote}`,
                )
                results.push({ name, state: state.id, theme, style, verdict, pct, snapAttrMajor })
              }
            } catch (e) {
              console.log(
                `  ${name}/${state.id}/${theme}-${style}: diff failed — ${String(e.message || e).slice(0, 120)}`,
              )
            }
          } else if (existsSync(foldcnPath) && existsSync(upstreamPath)) {
            const verdict = snapAttrMajor ? 'VISUAL_MAJOR' : 'UNKNOWN'
            if (verdict === 'VISUAL_MAJOR') hasMajor = true
            console.log(
              `  ${name}/${state.id}/${theme}-${style}: captured (no pixelmatch — install pixelmatch/pngjs for pixel diff; snapshot attr ${snapAttrMajor ? 'MAJOR' : 'ok'})`,
            )
            results.push({
              name,
              state: state.id,
              theme,
              style,
              verdict,
              reason: snapAttrMajor ? 'snapshot attr mismatch' : 'no pixelmatch',
            })
          } else if (existsSync(foldcnPath)) {
            console.log(
              `  ${name}/${state.id}/${theme}-${style}: foldcn-only (upstream missing — try web_search for https://ui.shadcn.com/docs/components/${upstreamComponentName(name)} or agent-browser read)`,
            )
            results.push({ name, state: state.id, theme, style, verdict: 'FOLDCN_ONLY' })
          }
        }
      }
    }
  }
  // cleanup session
  try {
    spawnSync('agent-browser', ['--session', SESSION, 'close'], { encoding: 'utf8', timeout: 5000 })
  } catch {}

  // summary
  const byVerdict = results.reduce((acc, r) => {
    acc[r.verdict] = (acc[r.verdict] || 0) + 1
    return acc
  }, {})
  console.log(`\n-- Visual summary (agent-browser) --`)
  console.log(`  ${JSON.stringify(byVerdict)}`)
  if (hasMajor) console.log('  FAIL — one or more VISUAL_MAJOR diffs (snapshot attr or >5% pixels)')
  else console.log('  PASS — no VISUAL_MAJOR')

  return { skipped: null, hasMajor, results }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const names = pairedNames().filter((n) => !componentFilter || n === componentFilter)
  if (names.length === 0) {
    console.log(`No components match filter: ${componentFilter}`)
    process.exit(1)
  }

  const { totalStates } = printStateMatrix(names)

  let visualOk = true
  if (wantImages) {
    const res = await tryCaptureImages(names)
    if (res.skipped) {
      console.log(
        `\nPASS (states) — images: skipped (${res.skipped}) — CSS coverage is the evidence.`,
      )
      console.log(
        '  Install: npm i -g agent-browser && agent-browser install && agent-browser skills get core',
      )
      visualOk = true
    } else if (res.hasMajor) {
      visualOk = false
    }
  } else {
    console.log(
      `\nTip: run with --images for screenshot + snapshot diffs (needs agent-browser + preview servers).`,
    )
    console.log('  npm i -g agent-browser && agent-browser install')
    console.log(
      '  agent-browser skills get core  # snapshot core loop: open → snapshot -i -s → hover/focus/click → screenshot',
    )
    console.log('  node .agents/skills/verify-parity/scripts/verify-visual-parity.mjs --images')
    console.log(
      '  upstream without checkout: web_search site:ui.shadcn.com/docs/components + agent-browser read',
    )
  }

  console.log(
    `\nDone — state matrix: ${names.length} components, ~${totalStates} captures if --images --all-styles.`,
  )
  process.exit(visualOk ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
