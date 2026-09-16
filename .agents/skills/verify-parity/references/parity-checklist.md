# Parity Checklist

Check every paired component against these dimensions. Use Verdict values from the skill's data shape.

## 1. Inventory

- Read `packages/registry/registry/default/ui/registry.json` names.
- Read upstream `apps/v4/registry/bases/base/ui/*.tsx` names (or fetched `https://ui.shadcn.com/docs/components` list).
- Normalize renames: `menu` ↔ `dropdown-menu`, `fieldset` ↔ `field`.
- Classify:
  - `foldcnOnly`: exists locally, not upstream (animation, date-picker, drag-and-drop, file-drop, listbox, nav, virtual-list).
  - `upstreamOnly`: exists upstream, not locally (attachment, bubble, carousel, chart, message, message-scroller, native-select is partially covered, pagination, questionnaire, scroll-area — confirm against current docs).
  - `paired`: both sides.

## 2. Token fidelity

- Authored file `packages/registry/registry/default/ui/<name>.ts` contains only `cn-*` tokens in class strings.
- Run `node packages/registry/scripts/resolve-styles.mjs` and check stderr warning list against `docs/deriving-from-base.md` Known no-op hooks.
- Run `pnpm --filter @foldcn/registry run build` — asserts no `cn-*` literal in shipped `dist/r/*.json`.
- For each paired component, compare its `cn-*` class strings character-identical to upstream `bases/base/ui/<name>.tsx` (minus React-isms, foldkit state attr renames handled in resolve).

## 3. Attributes and state

Grep each component for:

| Check       | Upstream emits                     | foldcn should emit                                         | How to verify                                                                                                          |
| ----------- | ---------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| data-slot   | `data-slot="button"` etc.          | same                                                       | `grep -n "data-slot" packages/registry/registry/default/ui/<name>.ts` vs upstream                                      |
| enter/leave | `data-open:` + `data-closed:` anim | `data-enter:` + `data-leave:`                              | `resolve-styles.mjs` rewrites ENTER_UTILITIES/EXIT_UTILITIES — verify no raw `data-open:animate-in` in authored source |
| side        | `data-side="bottom"`               | `data-side` derived from `data-placement`                  | view emits `data-side` attr                                                                                            |
| disabled    | native `disabled`                  | `aria-disabled` + `data-disabled` twins in `cn-compat.css` | check `cn-compat.css` has twins for the component's token                                                              |
| highlighted | `data-highlighted`                 | `data-active`                                              | class string uses correct prefix                                                                                       |

## 4. Behavior

Cross-check against `docs/shadcn-base-parity-audit.md` Functional gaps:

1. button disabled twins
2. progress indeterminate
3. switch hidden input
4. input-otp onComplete
5. hover-card hover vs click
6. context-menu pointer anchoring
7. menubar traversal
8. command filtering
9. toast/sonner swipe/stack
10. sidebar persistence/tooltip
11. avatar fallback chain
12. inert classes (`peer-disabled:*`, `[cmdk-*]`)

For each: read the component file, confirm FIXED has code evidence or OPEN has issue reference.

## 5. Style system

- `packages/registry/registry/styles/style-*.css` byte-identical to upstream (run `node packages/registry/scripts/sync-styles.mjs --check`).
- `packages/registry/registry/default/style/cn-compat.css` contains only foldkit deltas with reason comments.
- `packages/web/src/styles.css` `@source` lines cover every `styles/<style>/` tree.

## 6. Visual parity (images + states)

Compare rendered pixels per state, not just class strings. See [visual parity](visual-parity.md) for capture protocol and thresholds.

### 6a. State matrix — enumerate before capturing

Run:

```bash
node .agents/skills/verify-parity/scripts/verify-visual-parity.mjs --states
```

This parses upstream `style-nova.css` selectors and `bases/base/ui/*.tsx` props to emit the applicable state set per component, then checks foldcn's resolved output and demo coverage:

| State                         | Upstream selector cue                                                    | foldcn equivalent                                                                                             | How to verify (agent-browser)                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `idle` (default)              | no pseudo / base `cn-*`                                                  | same                                                                                                          | `agent-browser open <url>` → `agent-browser snapshot -s '[data-slot="<name>"]'` → `agent-browser screenshot "[data-slot=\"<name>\"]" idle.png`            |
| `hover`                       | `hover:` / `group-hover:` / `data-hover`                                 | same (or `hover:` via `cn-compat.css` twin)                                                                   | `snapshot -s` to get ref → `agent-browser hover @eN` → `screenshot` ; also `agent-browser get styles @eN` should show `hover:` utility                |
| `focus-visible`               | `focus-visible:` / `focus:` / `data-focus`                               | same                                                                                                          | `snapshot` → `agent-browser focus <ref>` → `screenshot`; `snapshot -i` should list `:focus-visible` ring                                                  |
| `active` / `pressed`          | `active:` / `data-active` / `aria-pressed`                               | `data-active` (foldkit) vs `data-highlighted`/`data-active` upstream — verify mapping in `resolve-styles.mjs` | `agent-browser click <ref>` (hold) or `agent-browser eval "el.setAttribute('data-active','')"` → `screenshot`                                             |
| `disabled`                    | `disabled:` / `aria-disabled:` / `data-disabled:`                        | `aria-disabled:` + `data-disabled:` twins (native never matches — see deriving-from-base.md)                  | render fixture with `isDisabled:true` → `snapshot` shows `aria-disabled="true"` → `screenshot`                                                            |
| `open` / `closed`             | `data-open:` / `data-closed:` / `data-state=open`                        | `data-enter:`/`data-leave:` transition windows + `data-open` persistent (rewritten in `resolve-styles.mjs`)   | `snapshot` → `agent-browser click <trigger-ref>` → `wait --text` / `snapshot` shows `data-enter` → `screenshot` during `data-enter` + at rest `data-open` |
| `checked` / `selected` / `on` | `data-checked` / `data-selected` / `aria-checked` / `data-state=checked` | foldkit uses `data-checked`/`data-selected`/`data-active` — class prefix mapped in authored source            | `click <ref>` to toggle → `snapshot` shows `data-checked`/`data-selected` → `screenshot` each                                                             |
| `invalid`                     | `aria-invalid:` / `data-invalid`                                         | same (`aria-invalid` twin)                                                                                    | fixture `aria-invalid=true` → `snapshot` → `screenshot`                                                                                                   |
| `indeterminate`               | `value===undefined` / `data-indeterminate`                               | progress track empty (see gap #2)                                                                             | `progress` with no value → `screenshot`                                                                                                                   |
| `empty` / `loading`           | conditional render                                                       | same                                                                                                          | command empty state, skeleton/spinner → `screenshot`                                                                                                      |
| `orientation` / `side`        | `data-orientation` / `data-side` / `data-placement`                      | `data-side` derived from `data-placement` + `data-orientation` pass-through                                   | `snapshot -s` horizontal vs vertical variant → `screenshot` each                                                                                          |

Mark any state the component legitimately doesn't have as `N/A`. Mark a state that requires unavailable prerequisite (auth, entitlement, OS, external) as `verified-unreachable` with the concrete prerequisite and route attempted — if the map omits that prerequisite, that's drift.

### 6b. Capture protocol — images per state

Run:

```bash
node .agents/skills/verify-parity/scripts/verify-visual-parity.mjs --images
# or with running servers:
FOLDCN_URL=http://localhost:5173 SHADCN_URL=http://localhost:3000 node .agents/skills/verify-parity/scripts/verify-visual-parity.mjs --images
```

For each paired component × applicable state × theme (`light`, `dark`) × style (`default` minimum, `--all-styles` for all 9):

- Render foldcn via `packages/web` item page (`/docs/<name>`) or resolved fixture page, and upstream via local `apps/v4` dev server or `https://ui.shadcn.com/docs/components/<name>` reference (when no checkout, upstream pages are discovered via `web_search` for `site:ui.shadcn.com/docs/components <name>` and fetched via `agent-browser read` / `fetch-upstream.mjs` — see `references/upstream-source.md`).
- Fixed viewport via `agent-browser set viewport 1280 800`, color scheme via `agent-browser set media light|dark`, reduced motion via `agent-browser set media <scheme> reduced-motion` for idle snapshots (allow motion for `data-enter`/`data-leave`). Same font loading.
- Capture element screenshot of `[data-slot="<name>"]` root (or component container) — not full page — at `png` with `agent-browser screenshot "[data-slot=\"<name>\"]" <out.png>` (element crop avoids chrome drift). Drive state first via scoped snapshot + ref interaction:
  ```bash
  export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix verify-parity)"
  S="$AGENT_BROWSER_SESSION"
  agent-browser --session "$S" open "$FOLDCN_URL/docs/<name>"
  agent-browser --session "$S" snapshot -s '[data-slot="<name>"]' -i  # get @eN ref
  agent-browser --session "$S" hover @eN            # or focus/click per state (re-snapshot after each mutation)
  agent-browser --session "$S" screenshot "[data-slot=\"<name>\"]" "$OUT/<state>/<theme>-<style>.png"
  agent-browser --session "$S" close
  ```
  Snapshot (`agent-browser snapshot -i --json`) is also used to assert state attributes directly (`aria-disabled`, `data-enter`, `data-active`) without pixels — so a missing visual is caught structurally even before pixel diff.
- Evidence lands in `.tmp/visual-parity/<component>/<state>/<theme>-<style>.png` plus `diff.png` when a comparison was made. Paths are gitignored; the report references them.

### 6c. Diff and verdicts

- With `agent-browser` + `pixelmatch` (optional peer): pixel-compare `agent-browser screenshot` crops at identical size. Thresholds: `≤1%` diff = `VISUAL_MATCH`, `1–5%` = `VISUAL_MINOR`, `>5%` or missing capture = `VISUAL_MAJOR`. Antialiasing and subpixel text cause ≤1% noise — don't lower the bar. Snapshot JSON (`agent-browser snapshot -i --json`) is also diffed: missing `data-slot` or state attr (`data-enter`/`data-disabled`/`data-active`) is `VISUAL_MAJOR` even if pixels are close.
- Without `agent-browser` (`which agent-browser` fails): the harness falls back to CSS state-coverage (`--states`): it asserts every applicable state's selector appears in the resolved output (`styles/default/ui/<name>.ts` after `resolve-styles.mjs`) and warns `images: skipped — no browser (install agent-browser)` so the run is honest about missing evidence.
- Multi-style: `--all-styles` repeats the matrix for `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`. Cross-style drift is expected only in token values, not structure; flag structural drift as `VISUAL_MAJOR`.

### 6d. Completion

- Every paired component has a row per applicable state with a `VISUAL_*` verdict or `verified-unreachable` reason.
- At least `default` style image evidence exists when `--images` was requested and `agent-browser` is available (`which agent-browser`); otherwise the report explicitly notes `images: skipped`.
- No state is silently omitted — `N/A` and `verified-unreachable` are the only allowed gaps.
