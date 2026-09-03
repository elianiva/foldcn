# foldcn ↔ shadcn/ui v4 `bases/base/ui` parity audit

> **Status (post-migration):** every file in `packages/registry/registry/default/ui/*.ts`
> now derives from `bases/base/ui` per `docs/deriving-from-base.md` — class strings are
> the upstream `cn-*` token compositions, resolved at build time from the vendored
> `registry/styles/style-nova.css` plus hand-written deltas in `style/cn-compat.css` (see [ADR-014](adr/014-derive-from-base-via-tokens.md)/[ADR-015](adr/015-vendor-token-css-verbatim.md)). The verdicts below were written
> against the **pre-migration legacy port** and are kept for the functional-gap analysis
> only; class-material diffs (radius/surface/ring columns) are resolved as of this
> branch. Primitive-level gaps (menus without submenu/checkbox kinds, static sidebar,
> presentational command, click-vs-hover popover family) still stand.
>
> **Functional-gap update (2026-08-22):** gaps #1–#4 below are FIXED:
> #1 button disabled → `aria-disabled:`/`data-disabled:` twins added in `packages/registry/registry/default/style/cn-compat.css` (button block);
> #2 progress indeterminate → `undefined` now renders an empty track (`packages/registry/registry/default/ui/progress.ts`; animated indeterminate still awaits primitive support);
> #3 switch hidden input → Foldkit's `attributes.hiddenInput` is now rendered (`packages/registry/registry/default/ui/switch.ts`);
> #4 input-otp `onComplete` → documented intentional update-channel fallback with an in-code comment (`packages/registry/registry/default/ui/input-otp.ts`).
> Gaps #5–#12 are unchanged.

Reference: `/Users/elianiva/Development/repos/shadcn-ui/ui/apps/v4/registry/bases/base/ui` (Base UI–backed registry), with `cn-*` tokens resolved via `registry/styles/style-nova.css`. Lineage checked against `registry/new-york-v4/ui` (legacy inline-class registry).

## Headline

**foldcn does not match the base registry — it is a port of the legacy `new-york-v4` files.** Class strings match legacy nearly verbatim (with `data-[state=open/closed]` swapped for `data-[enter]/data-[leave]`). The v4 base registry has since moved to:

- `cn-*` utility-token classes resolved per style (all 8 styles agree on core values, e.g. button default hover `bg-primary/80`, not legacy `/90`)
- a different material language: `bg-black/10 supports-backdrop-filter:backdrop-blur-xs` scrims, `bg-popover ring-1 ring-foreground/10 rounded-lg/xl p-2.5/p-4` surfaces, soft-tinted destructive variants (`bg-destructive/10 text-destructive`), `h-8` control scale, `rounded-lg`
- richer composition hooks (`has-data-[slot=…]`, `group-data-[size=…]`, `aria-expanded:` trigger styles, `in-data-[slot=button-group]:`) and `cn-font-heading` on titles

Beyond styling, several foldcn components are missing their **defining behaviors** entirely (see "Functional gaps").

## Scorecard (52 compared pairs)

| Verdict     | Count | Components                                                                                                                                                                                                                                                                                                    |
| ----------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MATCHES     | 4     | label, separator, spinner, kbd                                                                                                                                                                                                                                                                                |
| MINOR DIFFS | 18    | input, textarea, checkbox, avatar, card, skeleton, popover, tooltip, tabs, breadcrumb, toggle, item, fieldset↔field, slider, aspect-ratio, direction, marker, table                                                                                                                                           |
| MAJOR DIFFS | 30    | button, switch, radio-group, select, menu, context-menu, menubar, combobox, command, dialog, alert-dialog, sheet, drawer, hover-card, accordion, collapsible, navigation-menu, toggle-group, alert, badge, empty, progress, input-group, input-otp, button-group, calendar, resizable, sonner, toast, sidebar |

### Not covered (no counterpart)

- **foldcn-only (7):** animation, date-picker, drag-and-drop, file-drop, listbox, nav, virtual-list
- **base-only, missing from foldcn (10):** attachment, bubble, carousel, chart, message, message-scroller, native-select (partially covered inside foldcn `select.ts`), pagination, questionnaire, scroll-area
- Renames: foldcn `menu` ↔ base `dropdown-menu`; foldcn `fieldset` ↔ base `field`.
- Manifest `ui/registry.json`: 60 entries ↔ 60 files, no mismatches.

## Functional gaps (behavior, not just classes)

1. **button — disabled is visually broken.** Foldkit emits `aria-disabled="true"` + `data-disabled=""` (never native `disabled`), but foldcn ships only `disabled:pointer-events-none disabled:opacity-50`. The `:disabled` pseudo-class never matches → disabled buttons look enabled and stay tabbable (`tabindex="0"` always emitted).
2. **progress — indeterminate renders a full bar.** `value === undefined` applies no transform; indicator is `w-full` → 100%. Legacy used `100 - (value || 0)`; base primitive has true indeterminate. Also no `role="progressbar"`/ARIA values, no Label/Value parts.
3. **switch — form payload dropped.** Config accepts `name`/`value` but `toView` never renders the hidden input Foldkit supplies (checkbox does) → nothing submits.
4. **input-otp — `onComplete` fires on partial values** when `onInput` is absent (fall-through at the end of the `OnInput` handler).
5. **hover-card — click-toggled, not hover.** It reuses the Popover submodel; there is no hover-intent delay/grace model. Trigger semantics are the component's defining behavior.
6. **context-menu — not a context menu.** Opens on activation at a fixed anchor; no right-click/pointer-position anchoring.
7. **menubar — no menubar behavior.** Each trigger is an independent Menu bundle; no ArrowLeft/Right traversal, no open-on-hover-of-next-trigger.
8. **command — pure markup.** No filtering, arrow-key nav, Enter-to-select, roving tabindex, or Dialog wrapper; `[cmdk-group-heading]` selectors in its classes match nothing.
9. **toast/sonner — no swipe-to-dismiss, no stack expansion** (index-based scale/peek choreography absent); hover-pause restarts the _full_ duration on resume. foldcn emits literal `cn-toast` but defines no such rule in its CSS (inert class).
10. **sidebar — interactive shell with one remaining gap.** Collapse modes (`offcanvas|icon|none`), side/variant props, mobile Sheet path, ⌘/Ctrl+B shortcut, rail, all 20+ parts (`groupAction/groupContent/menuAction/menuBadge/menuSkeleton/menuSub*`, `input`, RTL flip), and shared collapsed-mode menu-button tooltip composition are now ported. Remaining: desktop cookie hydration still needs its wrapper marker when the initial DOM must be corrected before model hydration.
11. **avatar — no image loading/error fallback chain** (stateless `<img>`; base swaps to Fallback automatically).
12. **Inert/dead classes:** `peer-disabled:*` on input/textarea labels (no `.peer` sibling exists); command's cmdk selectors (above).

> **2026-08-26 sidebar:** the static-paint bucket for sidebar is closed. The collapsible app shell, keyboard shortcut, mobile sheet, rail, and the `menu* / group* / input` sub-parts were added to `packages/registry/registry/default/ui/sidebar.ts`, and the demo at `packages/web/src/demo/views/sidebar.ts` now embeds the provider submodel, exercises `offcanvas|icon|none × left|right × sidebar|floating|inset`, and lifts the breakpoint/keyboard subscriptions.

## Recurring drift patterns

- **State attributes:** foldcn `data-enter/leave`, `data-active/-checked/-selected/-open`, `data-placement` vs base `data-open/data-closed`, `data-starting-style/data-ending-style`, `data-highlighted/data-focused`, `data-side`. Same compiled selector semantics where they overlap, incompatible names otherwise.
- **data-slot coverage:** dialog/alert-dialog/sheet/drawer and the menu family emit **none**; base stamps slots on every part (its own classes key off them, e.g. `has-data-[slot=alert-action]`).
- **Menu-family capability ceiling:** Foldkit primitives have no submenu, checkbox-item, radio-item, destructive variant, or inset concepts anywhere — so dropdown/context/menubar/select can't reach base API parity without primitive work.
- **Metrics:** foldcn legacy scale (h-9 inputs/buttons, px-3/px-4, rounded-md, shadow-xs) vs base h-8/h-7 scale, px-2.5, rounded-lg, ring instead of border+shadow.
- **Focus rings:** mostly aligned (`ring-[3px] ring-ring/50 border-ring`); accordion still uses legacy `ring-2 ring-offset-2`.

## Per-component notes (condensed)

### Forms

- **button — MAJOR.** Variant/size keys identical; defaults identical. Diffs: destructive solid vs soft-tinted; outline lacks `aria-expanded:*` and explicit `border-border`, keeps legacy `shadow-xs`; ghost/secondary hover colors differ; size scale h-9/8/10 vs h-8/7/9(+xs h-6); missing `has-data-[icon=inline-*]` padding hooks and `in-data-[slot=button-group]:rounded-lg`; plus the disabled bug above.
- **input / textarea — MINOR.** Legacy strings verbatim; base differs in h-8, rounded-lg, px-2.5, `disabled:bg-input/50 dark:disabled:bg-input/80`, `dark:aria-invalid:border-destructive/50`; foldcn adds `shadow-xs` + selection colors. API superset (label/description wrapper baked in).
- **checkbox — MINOR.** Anatomy/hit-area match. Diffs: unchecked track `bg-input/90`+`shadow-xs` vs transparent; `transition-shadow` vs `transition-colors`; missing `aria-invalid:aria-checked:border-primary` precedence and Field integration hooks.
- **switch — MAJOR.** Track 20×36 vs 18.4×32; thumb travel fixed px vs `calc(100%-2px)` (sm thumb lands flush); custom cubic-bezier motion; zero invalid styling; hidden-input drop (bug #3).
- **radio-group — MAJOR.** Paradigm clash: foldcn renders p-4 option cards (checked = border color only); exports circle/dot indicator classes but `styledViewInputs` renders neither. Keyboard is richer (PageUp/PageDown, readonly navigate mode); attr names diverge (`data-checked` vs `data-state=checked`).

### Menus & selection

- **select — MAJOR.** Flat options only (no groups/labels/separators/scroll arrows); activedescendant focus vs item focus; h-9/rounded-md vs h-8/rounded-lg material. Native `<select>` export ≈ base native-select.
- **menu ↔ dropdown-menu — MAJOR.** Plain items only (no checkbox/radio/sub/destructive/inset); panel `min-w-48 rounded-md border` vs `min-w-32 rounded-lg ring-foreground/10`; zero data-slots; shortcut not accent-on-focus.
- **context-menu — MAJOR.** Same gaps as menu + no pointer anchoring (bug #6).
- **menubar — MAJOR.** Bar of independent live menus (per-menu open/keyboard/typeahead/disabled/groups all work; anchor gap 8 = upstream sideOffset; group + checkbox/radio/sub token constants ported, demo covers every upstream example interactively). Still no cross-menu keyboard model (bug #7 — OPEN); submenu/checkbox/radio/destructive/inset item kinds need primitive work (demo uses labeled groups + state-managed check/radio rows).
- **combobox — MAJOR.** Parent-owned filtering; no chips UI for multi-select, no clear button, no Empty row; panel metrics differ.
- **command — MAJOR.** Presentational only (bug #8); item selection `bg-accent` vs base `bg-muted`.

### Overlays

- **dialog / alert-dialog / sheet / drawer — MAJOR.** Shared FoldkitDialog engine vs four distinct base primitives. Scrim `black/50` vs `black/10`+blur; panel `border bg-background rounded-lg p-6 shadow-lg sm:max-w-lg` vs `bg-popover ring-foreground/10 rounded-xl p-4 sm:max-w-sm`; footer plain vs muted attached band; title lg/semibold vs base/medium+heading font; duration 200 vs 100; no data-slots; alert-dialog missing Media part + `size` prop; drawer is a static bottom dialog vs gesture drawer (drag/snap/axes). Interaction set otherwise strong (focus trap, scroll lock, Esc, backdrop close, focus targeting).
- **popover — MINOR.** Same anatomy incl. slots; chrome `border p-4 rounded-md w-72` vs `ring p-2.5 gap-2.5 rounded-lg`; enter-only animation (unmount kills exit).
- **tooltip — MINOR.** Deliberate mirror; radius xl vs md, kbd radius, no exit animation, no closeDelay concept.
- **hover-card — MAJOR.** Click vs hover (bug #5).

### Disclosure & navigation

- **accordion — MAJOR.** Opinionated stack skin; grid-rows animation vs `animate-accordion-down/up`; single rotating chevron vs icon swap; legacy py-4/ring-2 metrics.
- **collapsible — MAJOR.** Opinionated card skin (bordered trigger + panel) vs base's unstyled parts; single `title`/`content` config instead of free-form children.
- **tabs — MINOR.** Full keyboard/activation parity (roving tabindex, orientation, automatic/manual). Diffs: `data-selected` vs `data-active`; h-9 vs h-8 list; line underline offset.
- **navigation-menu — MAJOR.** Delayed hover/focus behavior and single-open-item coordination now match the primitive's core interaction. Still no shared viewport/indicator/popup management or activation-direction animation; each item remains an independently anchored Popover.
- **breadcrumb — MINOR.** Visuals match; missing `.ellipsis` part and `aria-label="breadcrumb"`, page `role/aria-current`, separator `role=presentation`; no rtl-flip.
- **toggle — MINOR.** Pressed/hover colors + size scale from legacy; `aria-pressed` correctly emitted.
- **toggle-group — MAJOR.** Always-joined bordered strip vs loose flex joining only at `spacing=0`; no spacing/orientation props; item defaults outline+sm vs default+default.

### Display

- **alert — MAJOR.** Legacy density (`px-4 py-3`, icon col calc) vs base `px-2.5 py-2`, link underlines, `AlertAction` slot + `pr-18`.
- **avatar — MINOR.** Fallback/badge/group visuals match; missing inset border overlay, `object-cover`, fallback chain (bug #11).
- **badge — MAJOR.** `rounded-full` vs `rounded-4xl` + fixed h-5; destructive solid vs tinted; outline/ghost hover accent vs muted; missing icon-padding hooks.
- **card — MINOR.** Correct base architecture (`--card-spacing`, `data-size`, ring); denser base values wanted (spacing 4 vs 6, rounded-xl vs 2xl, footer muted band, sm title shrink).
- **separator — MATCHES.** Vertical `h-full` vs `self-stretch` only.
- **skeleton — MINOR.** `bg-accent` vs `bg-muted`.
- **spinner — MATCHES.** Wrapper span instead of styled svg; no `data-slot`.
- **kbd — MATCHES.**
- **empty — MAJOR.** Legacy large layout (title lg, media size-10, md:p-12) vs dense nova (title sm, media size-8, gap-4, rounded-xl).
- **progress — MAJOR.** See bug #2; also track `h-2 bg-primary/20` vs `h-1 bg-muted` split root/track/indicator architecture.

### Composite inputs

- **input-group — MINOR.** Full part set (Group/Addon/Button/Text/Input/Textarea) with `role=group`, align variants, and frame-level invalid/focus states keyed off `data-slot=input-group-control`; addon-click-focus missing (foldkit has no scoped click-to-focus attribute).
- **input-otp — MAJOR.** Standalone cells vs joined pill; no Group/Slot/Separator parts; onComplete quirk (bug #4).
- **button-group — MAJOR.** Outer-frame model vs child corner-cutting; no orientation/Text/Separator, no `role=group`.
- **item — MINOR.** Full part parity minus `xs` size; padding/radius/hover drift; media boxed vs bare.
- **fieldset ↔ field — MINOR.** Near-complete part mapping incl. container-query responsive orientation; spacing drift; checked-label card tint/radius differ.
- **slider — MINOR.** Solid keyboard/drag (arrows/Home/End/PageUp/Dn); single-thumb only (no range), view hardcodes horizontal; thumb/track metrics differ.
- **calendar — MAJOR.** Days/Months/Years drill grids vs react-day-picker dropdown captions; circular day cells vs banded square range cells; single-date only (no ranges/week numbers); today ring vs bg-muted.

### Misc

- **table — MINOR.** Slots identical. foldcn adds `border-collapse *:border-border` (in neither registry); misses `has-aria-expanded:bg-muted/50`; head `text-muted-foreground` vs base `text-foreground`; keeps legacy checkbox translate-y.
- **resizable — MAJOR.** Hand-rolled 2-pane percentage splitter (hidden range input) vs react-resizable-panels: no min/max/collapsible/N-panes, no hit-area/focus-ring on handle, slot named `resizable` not `resizable-panel-group`.
- **sidebar — MINOR (was MAJOR — fixed 2026-08-26).** Interactive shell (provider submodel, mobile sheet, keyboard shortcut, rail, all parts) now matches upstream. Remaining behavioral gaps are the two items noted in bug #10; class diffs reduced to separator and menu refinements that the style tokens already absorb.
- **sonner — MAJOR.** Foldkit toast engine restyled; no theme sync, no `--normal-*`/`--radius` wiring, `bg-background rounded-lg` vs popover/`rounded-2xl`; inert `cn-toast` class.
- **toast — MAJOR.** Single entry is a close visual copy (colors/focus/icon/close hit-area match); missing swipe, stack expansion, Action part, portal/viewport composition; exit fade 200ms vs 500ms cubic-bezier choreography.
- **direction — MINOR.** Wrapper div with `dir` vs React context provider; extra `w-full` div; no data-slot.
- **marker — MINOR.** Identical except content drops `*:[a]:underline-offset-3`.
- **aspect-ratio — MINOR.** Inline `aspect-ratio` style vs `--ratio` var; ratio optional (base requires it); adds `w-full`.

## What parity would require

> 2026-08 update: the foundation for this is in place — see `docs/deriving-from-base.md`
> and [ADR-014](adr/014-derive-from-base-via-tokens.md). Components now derive from `bases/base/ui` via the generated `cn-*`
> token layer (`button` is migrated as the reference). Functional gaps #1–#4
> (button disabled, progress indeterminate, switch hidden input, input-otp
> onComplete) were fixed as of 2026-08-22 — see the Status blockquote above for
> evidence. Remaining work: migrate the other components following the recipe,
> and address the remaining functional gaps below.

1. Fix the functional bugs first (button/switch/progress/input-otp disabled-form-indeterminate paths) — they're independent of styling.
2. Decide the target: re-derive visuals from `bases/base/ui/*.tsx` + resolve `cn-*` tokens (either inline the resolved utilities, as today, or ship a foldcn `cn-*` layer — currently none exists, so any literal `cn-*` class foldcn emits is dead).
3. Menu-family API parity (submenus, checkbox/radio items, destructive) needs @foldkit/ui primitive work before the styled layers can follow.
4. Port the missing 10 base components or document them as out of scope.
