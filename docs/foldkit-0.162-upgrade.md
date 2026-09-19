# Foldkit 0.162.0 upgrade and component impact

Verified against npm on 2026-09-19. The workspace previously used 0.156.0.
The linked [0.160.0–0.161.0 release post](https://foldkit.dev/blog/foldkit-0-161-0)
is included in the upgrade, but the latest published release is **0.162.0**.
Its additional change renames `Subscription.keyboardShortcuts` to
`Subscription.keyBindings`, `shortcut` to `keys`, and the associated public types.
See the [core changelog](https://github.com/foldkit/foldkit/blob/main/packages/foldkit/CHANGELOG.md)
and [UI changelog](https://github.com/foldkit/foldkit/blob/main/packages/ui/CHANGELOG.md).

## Dependency changes

- `foldkit`, `@foldkit/ui`, `@foldkit/devtools`: 0.162.0.
- `@foldkit/vite-plugin`: 0.23.0; this repository already uses Vite 8.
- Effect, platform-browser, and platform-node: exact 4.0.0-rc.115 pins.
- A scoped pnpm override keeps platform-node's node-shared dependency on rc.115:
  its upstream range otherwise resolves rc.116, which requires a different Effect peer.
- The shipped base registry item now installs the matching Foldkit/UI ranges,
  exact Effect version, and newly required platform-browser peer. Previously it
  installed unversioned Foldkit/UI with Effect rc.109.
- Vitest remains unchanged: this repo does not use `@effect/vitest`, so the post's
  Vitest 5 migration does not apply.

## Required compatibility changes implemented

Paths in this table are relative to `packages/registry/registry/default/ui/`.

| Component                                       | Impact and change                                                                                                                                                                                                                                                                |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dialog, AlertDialog, Sheet                      | Upstream `init` now always starts closed. Exposed animated `boot(config)` for initially open instances; callers must fold the result into their parent with `Update.foldChildInit` so Commands and OutMessages are preserved. Added `hasDescription` forwarding to styled views. |
| Drawer                                          | Removed the obsolete `init({ isOpen })` API; use `boot(config)` for initially open drawers. Boot folds the nested Dialog result, including mapped Commands and OutMessage. Added description forwarding through both view layers.                                                |
| Toast                                           | Upstream viewport/entry wrappers changed from `ol`/`li` to `div`. Height measurement now selects direct children by ID, retaining its toast-card check; otherwise stacked toast geometry silently stopped measuring.                                                             |
| Input, Textarea, Checkbox, Switch, NativeSelect | 0.159.0 made descriptions opt-in. Helpers now set `hasDescription` exactly when they render a description, preserving accessible help text without dangling references.                                                                                                          |
| RadioGroup                                      | The default labelled option path now opts into descriptions when `optionDescription` supplies them. Legacy custom rows still own their content; callers needing custom description flags can use the underlying bundle view.                                                     |
| CommandDialog, Sidebar, dialog demos            | Enabled descriptions where the composed dialog actually renders one. The docs navigation sheet has no description and remains opted out.                                                                                                                                         |
| Sidebar and Command demo                        | Removed obsolete explicit event/message generic arguments from `Subscription.fromEventFilterMap`; target/event inference now supplies the event type. Existing shortcut behavior is preserved.                                                                                   |
| Animation                                       | The styled `element` type now derives from upstream `ViewInputs`; `textarea` is no longer a valid animation wrapper because it cannot render child content.                                                                                                                      |
| Combobox regression test                        | Preserve the literal selected value in the expected OutMessage; newer Scene steps validate it against the bundle's narrow value union.                                                                                                                                           |

Consumer migration: remove `isOpen: false` from Dialog-family init calls;
replace initially open init calls with boot plus an init fold. When providing
Dialog/AlertDialog/Sheet/Drawer content with a description, pass
`hasDescription: true`. These are source-copy components: existing installed
copies need the source changes as well as the dependency update.

## Benefits inherited from upstream

| Components                                                                                       | Benefit / limits                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dialog, AlertDialog, Sheet, Drawer, CommandDialog, Sidebar's mobile sheet, docs navigation sheet | Modal background isolation now includes inertness, assistive-technology hiding, late-mounted content, stacked dialogs, and improved focus restoration. Earlier intervening fixes also prevent cancelling a nested file picker from closing its dialog. Runtime behavior comes from the shared Dialog primitive. |
| Combobox, including Multi                                                                        | Empty filtered results no longer expose nonexistent active options or an expanded listbox; the modal backdrop remains dismissible. Foldcn Command has its own state machine and does not inherit this Combobox fix.                                                                                             |
| Tabs and controls backed by upstream Menu/Listbox/Combobox/Popover/Disclosure                    | `aria-controls` references track whether the target panel exists. Foldcn Tabs renders only the active panel, matching the new default; no `panelMount: 'All'` is needed. If a future view keeps all panels mounted, it must opt into `All`.                                                                     |
| Accordion, Collapsible                                                                           | Animated collapsed content is now inert and hidden from assistive technology.                                                                                                                                                                                                                                   |
| DragAndDrop                                                                                      | Keyboard drag cancellation happens synchronously: handled Tab/Space/arrows no longer move focus or scroll before the stream processes them.                                                                                                                                                                     |
| Anchored overlays                                                                                | Intervening 0.158.1 fixes positioning under fixed ancestors for anchored panels, relevant to the menu/select/combobox/popover/tooltip families and compositions using those primitives.                                                                                                                         |
| All showcase submodels                                                                           | Updated DevTools shows resolved Command destination paths; this is diagnostic improvement, not new component behavior.                                                                                                                                                                                          |

## Follow-up opportunities implemented

### Shortcuts

Sidebar now uses `Subscription.keyBindings` for Mod+B. Command uses Mod+K.
Both allow typing and ignore held-key repeats, composition events, and extra
modifiers. Default cancellation happens inside the listener. The Command entry
receives its enabled state from the application's route Model through
`Subscription.lift`, so navigating away disables it without reading browser
location from an event callback.

### Calendar and DatePicker localization

Correction to the initial assessment: both components already accept `locale`
in `init`. Locale belongs to the Calendar Model. The styled factories now forward
all upstream `ViewLabels`, including the four new grid and week callbacks.

DatePicker adds `locale` for trigger formatting and `placeholder` for empty
selection. Pass `model.calendar.locale` to keep the trigger and panel consistent.
Omitting `locale` preserves the existing ISO trigger format. Hidden form values
remain ISO dates regardless of the displayed language.

The Calendar and DatePicker routes each show a separate German example, with
independent selection state. The example locale defines day-first date formats,
German names, Monday-first weeks, and translated navigation and grid labels.
The live examples and their source snippets use the same view files.

### Collapsed previews

`Collapsible.ViewInputs.peek` and `AccordionItemViewInput.peek` accept a CSS
height. Providing it enables the animated panel path even when `isAnimated` is
false or omitted. The underlying Disclosure keeps collapsed content inert and
hidden from assistive technology. Both documentation routes include an interactive
preview with a link that becomes available when opened.

### Composite initialization

- Application startup folds the Demo init result with `Update.foldChildInit`,
  retaining child Commands before adding the browser-environment Command.
- `CommandDialog.boot(config)` folds Dialog's opening result, preserving Commands
  and forwarding its Opened OutMessage. Dialog update results use `foldChildStep`.
- Drawer already uses `foldChildInit` for its boot result from the upgrade.
- HoverCard, NavigationMenu, and demo slices initialize plain child Models with
  no Commands or OutMessages. Their existing init functions remain appropriate.

### Architecture lint

Installed `@foldkit/oxlint-plugin` 0.14.0 and enabled all eight rules introduced
in the linked releases as errors in the existing lint gate:

- `acquire-release-constructs-in-acquire-body`
- `no-direct-submodel-state-update`
- `require-fold-for-child-update-result`
- `prefer-option-over-nullable-in-model`
- `no-route-query-constructor-default`
- `no-switch-on-message-tag`
- `prefer-command-mapmessage`
- `no-prevent-default-in-stream-operator`

Existing message switches now use exhaustive Effect matching. Questionnaire's
Model stores shortcut absence with `Schema.Option`; its caller-facing init
configuration still accepts an optional shortcut mode. Consumers that persist
Questionnaire Models must migrate that field when updating their copied source.

The rerunnable `packages/registry/scripts/migrate-message-switches.mjs` codemod
handles terminal switch cases and refuses cases needing manual review.

The complete recommended preset was also audited and reported 192 diagnostics.
It reports older conventions
such as Schema aliases, mapped-row keys, empty children arrays, and child-message
construction across this repository. Those older rules are not enabled by this
release-focused adoption; the eight newly introduced rules are enforced.

No new menu primitives are announced in these releases: they do not by themselves
provide submenu, checkbox/radio menu-item, or roving-menubar support. Presentational
components such as Badge, Card, Separator, and Table need no release-specific migration.

## Verification boundary

Passed after the follow-ups: `pnpm fmt`, `pnpm lint`, `pnpm typecheck`,
`pnpm test` with 91 tests across 10 files, `pnpm validate` with 73 registry items,
and `pnpm build` with 75 prerendered routes. The generated Calendar, DatePicker,
Collapsible, and Accordion pages each contain their new rendered example and
matching source snippet. Running the message-switch codemod again changes nothing.

Focused follow-up tests render the real Calendar, DatePicker, Accordion, and
Collapsible demo views. They check localized headings and date order, inert
previews, single-open accordion behavior, actual keyboard event listeners, and
CommandDialog boot effects. The shortcut tests wait for listener registration
and check disposal, default cancellation, typing, repeat, and composition behavior.

Live Chrome verification was attempted with both local preview hostnames. The
browser automation connection rejected navigation with `ERR_BLOCKED_BY_CLIENT`.
Rendered Scene tests and real DOM event tests passed; there is no completed
live-browser or screen-reader audit.

The existing `capnp-es` TypeScript 5 peer warning remains with this workspace's
TypeScript 7 installation. Alchemy 2.0.0-beta.75 still pins its auxiliary
`@effect/sql-d1`, `@effect/sql-sqlite-do`, and `@effect/vitest` packages to
rc.112; its shared Effect runtime resolves to rc.115, as do Foldkit and all
platform packages. Style resolution also reports missing token warnings. Nothing
was committed or deployed.
