# Foldkit 0.163.0 upgrade and component impact

Verified against npm on 2026-09-29. The workspace previously used 0.162.0. See the
[core changelog](https://github.com/foldkit/foldkit/blob/main/packages/foldkit/CHANGELOG.md)
and [UI changelog](https://github.com/foldkit/foldkit/blob/main/packages/ui/CHANGELOG.md).

## Dependency changes

- `foldkit`, `@foldkit/ui`, `@foldkit/devtools`: 0.163.0. `@foldkit/vite-plugin`:
  0.24.0. `@foldkit/oxlint-plugin`: 0.15.0.
- Effect, platform-browser, and platform-node: exact 4.0.0-rc.116 pins. The scoped
  pnpm override that keeps platform-node's node-shared dependency on the workspace's
  Effect release moves with them.
- The shipped base style item installs `foldkit@^0.163.0`, `@foldkit/ui@^0.163.0`,
  `effect@4.0.0-rc.116`, and `@effect/platform-browser@4.0.0-rc.116`.

## Required compatibility changes

| Area                | Impact and change                                                                                                                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Struct helpers      | `evo` was renamed to `modifyFields` and `makeConstrainedEvo` to `makeModifyFieldsFor`; the old names are removed, so the previous release's sources no longer compile. 355 occurrences across 64 files, migrated by the rerunnable `packages/registry/scripts/migrate-evo-to-modify-fields.mjs`. |
| Subscription fields | `Subscription.fromEvent`'s `toMessage` is now `mapEvent`, and so is a `keyBindings` binding's mapper. This workspace's two authored bindings (registry `sidebar.ts`, the Command demo's Mod+K) were updated; no authored `fromEvent` call sites exist.                                           |
| Vite plugin         | 0.24 stops publishing the browser build's unrendered `index.html` and drops `host` from the build manifest, but only for `ssr.build` builds. This workspace runs plain `vite build` plus `scripts/prerender.ts`, so its pipeline is unchanged.                                                   |
| Document metadata   | `Document.canonical` no longer defaults to `window.location`. The showcase already derives `canonical` from the typed route in `packages/web/src/view.ts`, so no caller changed.                                                                                                                 |
| Toast Model/Entry   | The public Toast schemas gained `maybeSwipeConfig`, `swipeState`, and `swipeVersion`, and the Message union gained the pointer, Escape, and settle Messages. Consumers that build state through `Toast.init` and `Toast.show` need no migration.                                                 |

No other registry component needed a source change: the 0.163.0 public `.d.ts` diff for
checkbox, disclosure, switch, and tooltip is documentation only, and the
`h.OnPointerDown` callback gained `pointerId` and `target` as trailing arguments, which
existing callbacks may ignore.

## Behavior inherited

### Toast swipe-to-dismiss (issue #20)

`Toast.init({ swipeToDismiss: { threshold, direction } })` opts into a drag gesture —
default 40px, rightward — and `Toast.subscriptions` must be lifted once at the app root
because the pointermove/pointerup/pointercancel listeners are document-level. Foldkit
attaches the pointer handler, the inline `translate` offset, and the `data-swipe` phase
to the entry wrapper it renders, and settles an entry's leave animation on that same
element. Foldcn's card is absolutely positioned, so the wrapper now owns the viewport
corner anchor and the `translate` transitions (`toastEntryWrapperClass`); the stack math
on the card is unchanged. Distances, opposite-direction clamping, nested-control
exclusion, and `data-toast-swipe-ignore` all come from the primitive.

`packages/web/src/catalog/gaps.ts` records the one remaining difference: dismissals that
are not swipes still unmount after roughly 60ms and cut off the card's own slide-out,
because that card transition is not attached to the element the leave lifecycle waits
on. `docs/shadcn-base-parity-audit.md` carries the same note.

## Verification boundary

Passed after the migration, each command run on its own: `pnpm fmt`, `pnpm lint`,
`pnpm typecheck`, `pnpm test` with 95 tests across 11 files, `pnpm validate` with 73
registry items, `pnpm --filter @foldcn/registry run build`, and
`pnpm --filter @foldcn/web run build` with 75 prerendered routes. Swipe-to-dismiss was
driven in Chrome against the real demo: a 120px drag tracks the pointer exactly, a
release past the threshold holds the offset behind `data-swipe="end"` and runs the
wrapper's 240ms translate to `100vw` before the entry unmounts, a below-threshold
release returns to the exact starting pixel, an opposite-direction drag clamps to zero,
and a drag starting on the close button never enters the gesture.

Run `pnpm test` and `pnpm typecheck` as separate invocations. Both `pretest` and
`pretypecheck` rewrite `packages/registry/styles/`, and concurrent runs of
`resolve-styles.mjs` delete and rewrite the same trees, which fails the sibling task with
`ENOENT` on a style file. This predates the upgrade.
