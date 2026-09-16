# Visual Parity — Images and States vs Upstream

Static token comparison can be byte-identical while pixels diverge (different attribute hooks, missing transition windows, wrong `disabled` twin, popover `data-side` vs `data-placement` mismatch, etc.). Visual parity closes that gap by exercising every user-visible state and comparing rendered images against upstream.

## State matrix (source of truth)

States are derived from upstream `registry/styles/style-nova.css` selectors and `apps/v4/registry/bases/base/ui/*.tsx` props. The checklist's §6a table is the inventory — this doc is the capture/diff contract.

| State bucket                  | Upstream cue                                                          | Foldcn mapping                                                                                                                           | Notes                                                                          |
| ----------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `idle`                        | base `cn-*`                                                           | same                                                                                                                                     | always applicable                                                              |
| `hover`                       | `hover:`, `group-hover:`, `data-hover`                                | same (`cn-compat.css` may twin)                                                                                                          | `agent-browser hover <ref>` (ref from `snapshot -s`); CSS has `hover:` utility |
| `focus-visible`               | `focus-visible:`, `focus:`, `data-focus`                              | same                                                                                                                                     | `locator.focus()` + `:focus-visible`                                           |
| `active` / `pressed`          | `active:`, `data-active`, `aria-pressed`                              | `data-active` (foldkit) — authored class uses correct prefix per deriving-from-base.md                                                   | press-hold snapshot                                                            |
| `disabled`                    | `disabled:`, `aria-disabled:`, `data-disabled:`                       | `aria-disabled:` + `data-disabled:` twins (native `disabled:` never matches foldkit)                                                     | `isDisabled:true` fixture                                                      |
| `open` / `closed`             | `data-open:`, `data-closed:`, `data-state=open`                       | `data-enter:`/`data-leave:` transition windows + `data-open` persistent (rewrite in `resolve-styles.mjs` ENTER_UTILITIES/EXIT_UTILITIES) | capture both mid-transition and at-rest                                        |
| `checked` / `selected` / `on` | `data-checked`, `data-selected`, `aria-checked`, `data-state=checked` | `data-checked`/`data-selected`/`data-active` — class prefix mapped in source                                                             | toggle control                                                                 |
| `invalid`                     | `aria-invalid:`, `data-invalid`                                       | same                                                                                                                                     | `aria-invalid=true`                                                            |
| `indeterminate`               | `value===undefined`                                                   | progress empty track (gap #2)                                                                                                            | progress without value                                                         |
| `empty` / `loading`           | conditional render                                                    | same                                                                                                                                     | command empty, skeleton                                                        |
| `orientation` / `side`        | `data-orientation`, `data-side`, `data-placement`                     | `data-side` derived from `data-placement`                                                                                                | both axes where applicable                                                     |

Component-specific states (e.g. `calendar` drill levels, `tabs` orientation `horizontal`/`vertical`, `sidebar` `offcanvas`/`icon`/`none × left`/`right`) extend the matrix — add rows where upstream props or style selectors imply a distinct visual.

A state a component never has is `N/A`. A state that needs a missing prerequisite (auth, entitlement, OS, external service) is `verified-unreachable` with the concrete prerequisite and the route attempted. If the map doesn't list that prerequisite, that's drift — fix the map.

## Capture protocol

### Inputs

- **Foldcn target:** `packages/web` item page `/docs/<name>` or a resolved fixture under `styles/default/ui/<name>.ts` rendered in isolation. The demo is the canonical target because it renders the resolved tree users actually ship. Style switching is via `active-style.ts` live bindings — capture per style by setting `localStorage["foldcn-style"]` before load or by pointing at `styles/<style>/ui/` fixtures.
- **Upstream target:** preferred — local `apps/v4` dev server (`http://localhost:3000` by convention, set via `SHADCN_URL`); fallback — `https://ui.shadcn.com/docs/components/<name>` reference renders (discover via `web_search` for `site:ui.shadcn.com/docs/components <name>` when no checkout, then fetch with `agent-browser read https://ui.shadcn.com/docs/components/<name>` or `scripts/fetch-upstream.mjs`). Record the commit SHA when using a checkout.
- **Themes:** `light` and `dark` via `agent-browser set media light|dark` (toggles `prefers-color-scheme`, not just a class).
- **Viewport:** `1280×800`, `deviceScaleFactor: 1` via `agent-browser set viewport 1280 800`; `agent-browser set media <scheme> reduced-motion` for idle snapshots; allow motion for `data-enter`/`data-leave` captures where the transition window is the subject.

### How to capture (agent-browser snapshot + screenshot)

The harness (`scripts/verify-visual-parity.mjs --images`) uses the `agent-browser` CLI core loop (run `agent-browser skills get core` first for the version-matched guide). No Playwright dependency.

```bash
# one-off setup (once per machine)
npm i -g agent-browser && agent-browser install
agent-browser doctor --quick  # verify browser

# per run — isolate one browser per worktree (the harness honors this when exported,
# otherwise it derives its own worktree-scoped id):
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix verify-parity)"
S="$AGENT_BROWSER_SESSION"
```

Per paired component × applicable state × theme × style, the harness runs the core loop:

```bash
agent-browser --session "$S" open "$FOLDCN_URL/docs/<name>"
agent-browser --session "$S" set viewport 1280 800
agent-browser --session "$S" set media light reduced-motion  # or dark
agent-browser --session "$S" snapshot -s '[data-slot="<name>"]' -i       # scoped a11y tree, get @eN ref for state
agent-browser --session "$S" snapshot -i --json  # optional: JSON for attr diff
# drive the state (use the @eN ref from the snapshot; re-snapshot after each mutation):
#   hover:            agent-browser --session "$S" hover @eN
#   focus-visible:    agent-browser --session "$S" focus @eN
#   active/pressed:   agent-browser --session "$S" click @eN  # or eval to set data-active
#   open/expanded:    agent-browser --session "$S" click @eN-trigger  # then wait / snapshot for data-enter
#   disabled/invalid: fixture already renders isDisabled/aria-invalid — snapshot asserts aria-disabled
agent-browser --session "$S" screenshot "[data-slot=\"<name>\"]" ".tmp/visual-parity/<name>/<state>/light-default.png"  # element crop
# same for upstream:
agent-browser --session "$S" open "$SHADCN_URL/docs/components/<name>"  # or local apps/v4
agent-browser --session "$S" snapshot -s '[data-slot="<name>"]' -i
agent-browser --session "$S" screenshot "[data-slot=\"<name>\"]" ".tmp/visual-parity/<name>/<state>/light-default-upstream.png"
agent-browser --session "$S" close  # after all components
```

Key patterns from `agent-browser skills get core` the harness relies on:

- `snapshot -i` vs `snapshot -i --json` — human vs machine diff (JSON includes roles, names, `ref`, and `attributes` for state-attr comparison).
- `snapshot -s "<selector>"` — scope to the component root so refs are stable per state.
- Refs (`@e1`, `@e2`, …) are fresh per snapshot — re-snapshot after any `hover`/`click`/`open` that mutates the page.
- `wait --text "..."` / `wait --load networkidle` / `wait @eN` after open/click before snapshot.
- `get styles @eN` / `eval` for computed-style spot checks when snapshot attrs aren't enough.
- `screenshot "<selector>" <path>` — element crop avoids full-page chrome drift; `screenshot --full` is only for layout debugging.

Evidence is written to `.tmp/visual-parity/<component>/<state>/<theme>-<style>.png` and `<theme>-<style>-upstream.png` plus `diff.png` when pixel-compared. Without `agent-browser` (`which agent-browser` fails), the harness skips image capture and reports `images: skipped — no browser (install agent-browser)` — the run is still useful via `--states` (CSS coverage).

### Where evidence lives

```
.tmp/visual-parity/
  button/
    idle/light-default.png
    idle/light-default-upstream.png
    idle/light-default-diff.png
    hover/light-default.png
    disabled/dark-default.png
    ...
  dialog/
    open/light-default.png
    ...
```

Gitignored. The `ParityReport.visual` section references these paths. Don't commit them; do keep them as run evidence (the maintain-verification-skill invariant: evidence survives cleanup at its named location).

## Diff and thresholds

- **Tooling:** `pixelmatch` (optional peer) for pixel diff; if absent, the harness reports `diff: unavailable — install pixelmatch` and falls back to snapshot-attr + existence checks. Install with `pnpm add -D pixelmatch pngjs` or `npm i -D pixelmatch pngjs`.
- **Comparison — two layers:**
  1. **Snapshot attrs (agent-browser):** JSON snapshot (`snapshot -i --json -s '[data-slot="<name>"]'`) is diffed for `data-slot` + state attrs (`aria-disabled`/`data-disabled`, `data-enter`/`data-leave`, `data-active`, `aria-invalid`, `data-checked`/`data-selected`). Missing or wrong attr is `VISUAL_MAJOR` even if pixels are close — it means the style hook will never match.
  2. **Pixels (agent-browser screenshot + pixelmatch):** element crops via `screenshot "[data-slot]"` must be identically sized; differing sizes are `VISUAL_MAJOR` (layout drift).
- **Verdicts (pixel):**
  - `≤1%` differing pixels → `VISUAL_MATCH` (antialiasing / subpixel text noise).
  - `1–5%` → `VISUAL_MINOR` (token-level drift — e.g. `rounded-md` vs `rounded-lg`, `h-9` vs `h-8`).
  - `>5%` or missing capture → `VISUAL_MAJOR` (structural or state-hook drift).
  - Token drift that is invisible at pixels (e.g. an inert selector that never matched) is still drift in token fidelity (§3), but visual verdict reflects what the user sees.
- **Diff image:** `pixelmatch` output written to `…/diff.png` with red overlay on differing pixels.

## Harness modes

| Invocation                                                    | What it does                                                                                               | Requires                                                                                                                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `node scripts/verify-visual-parity.mjs --states`              | Enumerate state matrix, check CSS coverage in resolved output, no browser                                  | nothing (reads `registry.json`, `style-nova.css`, `bases/base/ui` — or `web_search` for upstream list when no checkout)                     |
| `node scripts/verify-visual-parity.mjs --images`              | `--states` + `agent-browser` snapshot + screenshot + attr+pixel diff                                       | `agent-browser` (`npm i -g agent-browser && agent-browser install`), running foldcn + upstream servers (or `--foldcn-url` / `--shadcn-url`) |
| `node scripts/verify-visual-parity.mjs --all-styles --images` | Repeat per style (`nova`…`rhea`)                                                                           | same + all style builds (`resolve-styles.mjs` already emits them)                                                                           |
| `node scripts/verify-parity.mjs --visual`                     | Unified run: inventory + tokens + attributes + behavior + visual (delegates to `verify-visual-parity.mjs`) | same as `--images` when `agent-browser` available; otherwise CSS fallback + warning                                                         |

Flags:

- `--foldcn-url <url>` — foldcn preview (default `http://localhost:5173`).
- `--shadcn-url <url>` — upstream preview (default `http://localhost:3000` or `https://ui.shadcn.com`).
- `--theme <light|dark|both>` — theme subset (default `both`).
- `--component <name>` — single component filter.
- `--out <dir>` — evidence root (default `.tmp/visual-parity`).
- `SHADCN_UI_DIR` / `FOLDCN_URL` / `SHADCN_URL` env fallbacks honored.

## Multi-style coverage

At minimum `default` (nova) is compared — it's the `dist/r` catalog and web demo default. `--all-styles` repeats the matrix for `vega`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`. Vendored `style-*.css` must stay byte-identical (ADR-015); cross-style structural drift is `VISUAL_MAJOR`, token-value drift is `VISUAL_MINOR`.

## What a visual gap means

- **Visual `MAJOR` + token `MAJOR`:** expected — class strings or attributes still diverge.
- **Visual `MAJOR` + token `MATCHES`:** attribute/state-hook mismatch, animation-window mismatch (`data-open` vs `data-enter`), or behavioral difference (hover vs click, missing `data-side`) — fix the attribute mapping or compat layer, not the class string.
- **Visual `MINOR` + token `MINOR`:** metric drift (`h-9` vs `h-8`, `rounded-md` vs `rounded-lg`, density) — intentional or pending design decision; record in audit Scorecard.
- Don't edit `registry/styles/style-*.css` to fix a visual — those are vendored byte-identical. Fix `cn-compat.css` or the component's view/attrs.

## CI note

Visual image diffs are opt-in for CI: they need `agent-browser` (`npm i -g agent-browser && agent-browser install`) and running preview servers. Snapshot attr diffs run even without `pixelmatch`; pixel diffs need `pixelmatch` + `pngjs`. The unified `verify-parity.mjs --visual` exits non-zero on `VISUAL_MAJOR` but passes on `images: skipped` with a warning — so CI without a browser still runs `--states` CSS coverage. For image evidence in CI, run:

```bash
pnpm --filter @foldcn/web build && pnpm --filter @foldcn/web preview &
SHADCN_UI_DIR=~/Development/repos/shadcn-ui/ui pnpm --prefix ~/Development/repos/shadcn-ui/ui/apps/v4 dev &
# or use web_search + agent-browser read against https://ui.shadcn.com when no checkout
npm i -g agent-browser && agent-browser install
agent-browser doctor --quick
node .agents/skills/verify-parity/scripts/verify-visual-parity.mjs --images
```

For upstream discovery without a checkout, `web_search` (Exa) enumerates `https://ui.shadcn.com/docs/components` and `agent-browser read https://ui.shadcn.com/docs/components/<name>` fetches reference renders — `scripts/fetch-upstream.mjs` does the same via `fetch` when `SHADCN_UI_DIR` is unset.
