---
name: verify-parity
description: Verify foldcn components match upstream shadcn/ui at https://ui.shadcn.com/docs/components. Use when checking parity, auditing drift, porting a component, or before syncing vendored styles.
---

# Verify Parity

Compare foldcn against upstream shadcn v4 base registry (`bases/base/ui`) on existence, token fidelity, attributes, and behavior.

## Data shape

```
ParityReport = {
  inventory: { foldcnOnly, upstreamOnly, paired },
  tokenFidelity: { leakedTokens, unmappedTokens, driftedClasses },
  attributes: { missingSlots, wrongStateAttr },
  behavior: { functionalGaps },
  visual: { stateMatrix, imageDiffs, styleCoverage }
}
Verdict = MATCHES | MINOR | MAJOR | MISSING | FOLDCN_ONLY
VisualVerdict = VISUAL_MATCH | VISUAL_MINOR | VISUAL_MAJOR  // per state
```

Encode findings as this shape, not scattered conditionals. See [checklist](references/parity-checklist.md) and [visual parity](references/visual-parity.md).

## Workflow

### 1. Source upstream

**Do:**

- Prefer local checkout at `$SHADCN_UI_DIR` or `~/Development/repos/shadcn-ui/ui` → `apps/v4/registry/bases/base/ui` + `apps/v4/registry/styles`.
- Fallback: fetch `https://ui.shadcn.com/docs/components` and component pages, or run `scripts/fetch-upstream.mjs`.
- Record commit SHA if using checkout. See [upstream source](references/upstream-source.md).

**Completion:** upstream component list and `cn-*` token definitions are available.

### 2. Inventory

**Do:**

```bash
node .agents/skills/verify-parity/scripts/verify-parity.mjs --inventory
# or without checkout:
node .agents/skills/verify-parity/scripts/fetch-upstream.mjs && node .agents/skills/verify-parity/scripts/verify-parity.mjs --inventory
```

Compare `packages/registry/registry/default/ui/registry.json` (60 items) against upstream `bases/base/ui` (and `docs/shadcn-base-parity-audit.md` not-covered lists). Classify each as paired, foldcn-only, or upstream-only.

**Completion:** every name accounted for with Verdict.

### 3. Token fidelity

**Do:**

```bash
node packages/registry/scripts/resolve-styles.mjs
pnpm --filter @foldcn/registry run build
```

Checks:

- No `cn-*` literal survives in resolved output (build asserts this).
- Every `cn-*` in authored `registry/default/ui/*.ts` exists in the style map (`cn-compat.css` + vendored `style-nova.css`). Unmapped tokens are intentional no-ops per `docs/deriving-from-base.md` Known no-op hooks — verify warning list matches that doc.
- Resolved classes equal upstream `bases/base/ui` token resolution (byte-identical class strings before resolution, per `docs/deriving-from-base.md`).

**Completion:** zero leaked literals, unmapped list reviewed, class strings diffable against upstream.

### 4. Attributes and state

**Do:** For each paired component, diff:

- `data-slot` coverage (every part stamped, per upstream).
- State attributes per `docs/deriving-from-base.md` mapping table: `data-enter`/`data-leave` vs `data-open`/`data-closed`, `data-side` vs `data-placement`, `aria-disabled`/`data-disabled` twins, `data-active` vs `data-highlighted`.
- See [checklist](references/parity-checklist.md) for exact selectors to grep.

**Completion:** attribute table has no unexplained drift.

### 5. Behavioral gaps

**Do:** Check `docs/shadcn-base-parity-audit.md` Functional gaps (#1–#12) against current code:

- #1 button disabled twins, #2 progress indeterminate, #3 switch hidden input, #4 input-otp onComplete, #5 hover-card hover vs click, #6 context-menu pointer anchoring, #7 menubar traversal, #8 command filtering, #9 toast swipe/stack, #10 sidebar persistence, #11 avatar fallback, #12 inert classes.
- Mark each FIXED or OPEN with file:line evidence.

**Completion:** gap list is current, no fixed gap regressed.

### 6. Visual parity (images + states)

**Do:** Compare rendered output per visual state against upstream, not just resolved class strings. See [visual parity](references/visual-parity.md) for the full state matrix and harness.

```bash
# snapshot + screenshot diff via agent-browser (no Playwright):
agent-browser --version  # ensure 0.35+ installed; run `agent-browser skills get core` first
node .agents/skills/verify-parity/scripts/verify-visual-parity.mjs --states --images
# or run the unified harness (inventory + tokens + visual):
node .agents/skills/verify-parity/scripts/verify-parity.mjs --visual
```

### Component update (e2e)

**Do:** after touching `packages/registry/registry/default/ui/<name>.ts` (or its demo view),
prove the component still renders in every applicable state before calling it done:

```bash
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix verify-parity)"
node .agents/skills/verify-parity/scripts/verify-visual-parity.mjs --states --component <name>
FOLDCN_URL=http://localhost:5173 \
  node .agents/skills/verify-parity/scripts/verify-visual-parity.mjs --images --component <name>
```

Manual equivalent per state (same core loop the harness runs): `agent-browser open
"http://localhost:5173/docs/<name>"` → `snapshot -s '[data-slot="<name>"]' -i` →
`hover|focus|click @eN` (canonical `@eN` ref form, re-snapshot after each mutation) →
`screenshot '[data-slot="<name>"]' .tmp/visual-parity/<name>/<state>/light-default.png`.
Evidence lands in `.tmp/visual-parity/<name>/<state>/` (gitignored). The demo route is
`/docs/<name>` (see `packages/web/src/route.ts`) — not a hash route.

Checks:

- **State matrix:** every paired component exercised in every applicable state — `idle`, `hover`, `focus-visible`, `active/pressed`, `disabled`, `open`/`closed` (overlays, accordions), `checked`/`selected`/`on` (toggles, checkboxes, tabs), `invalid`, plus component-specific states (e.g. `indeterminate` for progress, `empty` for command). States sourced from upstream `style-nova.css` selectors, `bases/base/ui` props, and (when no checkout) `web_search` against `https://ui.shadcn.com/docs/components` + `agent-browser read` of component pages. The [checklist](references/parity-checklist.md) §6 enumerates the matrix; any state that cannot be reached is `verified-unreachable` with prerequisite (auth, OS, external) and route attempted.
- **Images per state (agent-browser):** capture screenshots of foldcn (via `packages/web` demo or `styles/default` resolved fixtures) and upstream (local `apps/v4` dev server or `https://ui.shadcn.com` reference renders — sourced via `web_search` / `agent-browser read` when no checkout) at identical viewport (`1280×800`, `deviceScaleFactor 1`), theme (`light` + `dark` via `agent-browser set media`), and density. Core loop per state: `agent-browser open <url>` → `agent-browser snapshot -i -s '[data-slot="<name>"]'` → `agent-browser hover|focus|click @eN` (canonical `@eN` ref form; re-snapshot after each mutation) for the target state → `agent-browser screenshot "[data-slot=\"<name>\"]" <out.png>` (element crop, not full page, to avoid chrome drift). Diff with pixel comparison (`pixelmatch` where available, otherwise existence/size check) — CSS computed-style fallback when `agent-browser` is absent.
- **Thresholds:** ≤1% pixel diff = `VISUAL_MATCH`, 1–5% = `VISUAL_MINOR` (token-level drift), >5% or missing state = `VISUAL_MAJOR`. Token drift that is invisible at rendered pixels still counts as drift in §3, but visual verdict reflects what the user sees.
- **Multi-style coverage:** at minimum `default` (nova) against upstream `nova`; when `--all-styles` is set, repeat for `vega`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea` and report per-style visual verdicts. Vendored `style-*.css` must stay byte-identical (ADR-015) so cross-style drift is token-level, not structural.
- **Evidence:** screenshots and diff images are written to `.tmp/visual-parity/<component>/<state>/` (gitignored) and the report references them by path. The harness never edits product code — a missing or wrong visual is doc drift (fix the map) or a product regression (file it, don't paper over it).

**Completion:** every paired component has a visual verdict per applicable state with image evidence or an explicit `verified-unreachable` reason; no state is skipped silently.

### 7. Report

**Do:** Emit `ParityReport` with verdicts per component (MATCHES/MINOR/MAJOR) matching `docs/shadcn-base-parity-audit.md` Scorecard. Update that file's Status blockquote if fixes landed. Do not edit `packages/registry/registry/styles/style-*.css` (vendored, byte-identical per ADR-015).

**Completion:** report covers inventory, tokens, attributes, behavior with file references.

## Quick verify (CI)

```bash
node .agents/skills/verify-parity/scripts/verify-parity.mjs          # inventory + tokens (attributes + behavior are manual checklist steps)
node .agents/skills/verify-parity/scripts/verify-parity.mjs --visual # + visual/state image diffs (needs agent-browser + preview servers)
node .agents/skills/verify-parity/scripts/verify-visual-parity.mjs --states  # state matrix only (no browser)
```

Exits non-zero on leaked `cn-*` or (with `--visual`) visual `VISUAL_MAJOR`. Inventory drift and audit staleness warn but do not fail.

Visual image diffs are opt-in for CI — they require `agent-browser` (`npm i -g agent-browser && agent-browser install`) and running preview servers. The `--states` / `--images` flags control which visual sub-steps run. Without `agent-browser` the harness falls back to a CSS state-coverage check and warns that image evidence is missing. Upstream docs are resolved via `web_search` + `agent-browser read https://ui.shadcn.com/docs/components/<name>` when no local `SHADCN_UI_DIR` checkout is present.

## References

- `docs/deriving-from-base.md` — recipe for porting (class strings, data-slot, compat layer).
- `docs/shadcn-base-parity-audit.md` — last full audit, scorecard, and gap list.
- `docs/feature-map.md` — pipeline, style system, and breakage notes.
- `packages/registry/scripts/sync-styles.mjs --check` — vendored CSS drift check.
- `references/visual-parity.md` — state matrix, capture protocol, diff thresholds, harness modes.
- `references/parity-checklist.md` §6 — visual checklist (states × themes × styles).
