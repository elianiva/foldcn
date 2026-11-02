# foldcn ↔ shadcn/ui v4 `bases/base/ui` parity

> **Status:** every component in `packages/registry/registry/default/ui/*.ts` derives from `bases/base/ui` per [`deriving-from-base.md`](deriving-from-base.md). Class strings are the upstream `cn-*` tokens, resolved at build time ([ADR-014](adr/014-derive-from-base-via-tokens.md), [ADR-015](adr/015-vendor-token-css-verbatim.md)). Remaining divergence is behavioral, mostly `@foldkit/ui` primitive ceilings. Browser image comparisons are still outstanding.

The user-facing version of this list is `packages/web/src/catalog/gaps.ts`, which drives the "Differences vs shadcn/ui" callouts and sidebar parity dots. When the two disagree, `gaps.ts` wins; update it in the same change that adds or removes a behavior.

Reference checkout: `~/Development/repos/shadcn-ui/ui/apps/v4/registry/bases/base/ui`, with tokens from `registry/styles/style-nova.css`.

## Coverage

- **Renames:** foldcn `menu` ↔ upstream `dropdown-menu`; foldcn `fieldset` ↔ upstream `field`; foldcn `toast` covers upstream `sonner`.
- **foldcn-only:** animation, date-picker, drag-and-drop, file-drop, listbox, nav, virtual-list. Kept in sync with `foldcnOnly` in `packages/web/src/catalog/parity.ts`.
- **Charts:** twelve Foldkit SVG chart APIs are available in their own Charts section with Recharts-shaped names and a gallery entry for every chart example on the Recharts index. The API pages list supported props and remaining behavior gaps; the preview gallery is not full Recharts behavior parity.
- `native-select` is a separate item, though `select.ts` also exports a native variant.
- Components with no `@foldkit/ui` primitive (questionnaire, message-scroller, resizable) are authored in place as Foldkit submodels; their deltas are in `gaps.ts`.

## Open functional gaps

Foldkit primitive ceilings are the usual cause. Each is a behavioral difference, not a styling one.

| Component        | Gap                                                                                                                                                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| menu family      | No submenu, checkbox-item, radio-item, destructive, or inset kinds. Submenus flatten to labelled groups; checkbox/radio rows run off demo state and close the panel on toggle. Select is flat too (no groups, labels, or scroll arrows).     |
| context-menu     | Right-click opens via `OnContextMenu`, but the panel anchors to the trigger region, not the pointer.                                                                                                                                         |
| menubar          | Independent menus in a bar. No ArrowLeft/Right traversal between menus and no open-on-hover of the next trigger.                                                                                                                             |
| toast            | Swipe-to-dismiss is opt-in via `init({ swipeToDismiss })`; lift `Toast.subscriptions` once at the app root. Only a swipe plays the full leave animation; close, the timer, and Dismiss unmount after ~60ms and cut off the card's slide-out. |
| drawer           | Handle drag and all four directions work. No snap points, nested stacks, or non-modal drawers.                                                                                                                                               |
| navigation-menu  | Delayed hover/focus and single-open coordination match. No shared viewport, indicator, or activation-direction animation; each item is its own anchored Popover.                                                                             |
| sidebar          | Desktop cookie hydration needs a wrapper marker when the initial DOM must be corrected before model hydration.                                                                                                                               |
| combobox         | Filtering is parent-owned. No chips UI for multi-select, no clear button.                                                                                                                                                                    |
| calendar         | Single-date only (no ranges or week numbers); drill-down grids instead of dropdown captions.                                                                                                                                                 |
| slider           | Single thumb, horizontal only.                                                                                                                                                                                                               |
| progress         | Indeterminate renders an empty track; animated indeterminacy awaits primitive support.                                                                                                                                                       |
| input-otp        | Numeric only (no pattern/alphanumeric mode). `onInput` fires on every change; `onComplete` alone is the update channel when `onInput` is absent.                                                                                             |
| input-group      | Addons do not focus the input on click; Foldkit has no scoped click-to-focus attribute.                                                                                                                                                      |
| command          | Data-driven API, not cmdk children. See [command-composition.md](command-composition.md). Full visual parity with cmdk is unverified.                                                                                                        |
| resizable        | Sizes are numeric percentages, not upstream's string/unit API. No panel/separator `disabled`, `disableDoubleClick`, `resizeTargetMinimumSize`, or F6 focus cycling.                                                                          |
| message-scroller | No visibility tracking, prepend preservation, or anchored-turn tail spacer.                                                                                                                                                                  |
| radio-group      | Keeps Foldkit's PageUp/PageDown and readonly navigation; emits `data-checked` rather than Base UI's state attribute.                                                                                                                         |

## Recurring drift patterns

- **State attributes:** Foldkit emits `data-enter`/`data-leave`, `data-active`, `data-checked`/`-selected`/`-open`, and `data-placement`; Base UI emits `data-open`/`data-closed`, `data-starting-style`/`data-ending-style`, `data-highlighted`, and `data-side`. The mapping table is in [`deriving-from-base.md`](deriving-from-base.md).

## Class-level drift

Not tracked here. Diff the authored file against the upstream `.tsx`, or run `.agents/skills/verify-parity`.
