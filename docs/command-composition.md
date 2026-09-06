# Command and CommandDialog guide

This guide describes the implementation in this checkout. The changes are pending review; the published registry and showcase may still contain the previous implementation.

## Install and import

Once this version is published, install the Command registry item:

```sh
npx shadcn@latest add @foldcn/command
```

The item includes `command.ts` and `command-score.ts`, with Dialog, InputGroup, icons, and utilities as registry dependencies. CommandDialog is exported from the same module:

```ts
import * as Command from '@/components/ui/command'
```

`Command.Model`, `Command.Message`, `Command.update`, and `Command.view` provide the stateful inline palette. `Command.CommandDialog` owns a palette and its Dialog lifecycle. The separate `Command.Command` function and its `input`, `list`, `group`, `item`, `empty`, `separator`, and `shortcut` properties are low-level markup builders; using those builders alone does not wire interaction.

The stateful view renders each row through `Command.item`. That builder owns option semantics, command styles, and selected/disabled/checked attributes. Its `attributes` option accepts IDs and event handlers; the stateful view supplies navigation and selection handlers.

## Wire an inline palette

Add `Command.Model` to your parent model schema and initialize it with a unique DOM-safe ID:

```ts
const command = Command.init({ id: 'app-command' })

const items: ReadonlyArray<Command.Item> = [
  { value: 'calendar', label: 'Calendar', keywords: ['schedule', 'events'] },
  { value: 'billing', label: 'Billing', keywords: ['payment'], shortcut: '⌘B' },
  { value: 'calculator', label: 'Calculator', isDisabled: true },
]
```

Define a parent message carrying `Command.Message`. Use `Update.foldChild` to read and write the child model, call `Command.update`, map child messages, and handle out-messages. Preserve returned commands: keyboard navigation uses them to scroll the active item into view.

Render the child through `h.submodel`. In this example, `Message.GotCommandMessage` is your parent message constructor:

```ts
h.submodel({
  slotId: model.command.id,
  model: model.command,
  view: Command.view,
  viewInputs: { items, label: 'Search commands', loop: true },
  toParentMessage: (message) => Message.GotCommandMessage({ message }),
})
```

Handle the `Selected` out-message to run the action identified by `value`. Selection preserves the query and leaves the inline list visible. `SearchChanged` reports input changes; `ValueChanged` reports explicit keyboard or pointer activation. A search change clears the stored active value, and the view falls back to the first enabled result. That fallback does not emit `ValueChanged`.

The complete parent wiring is in `packages/web/src/demo/views/command.ts`. Its `slice` and `fields` belong to the showcase harness; applications can use their own parent model and update function.

## Configure items and filtering

Each item needs a unique, stable `value`. The optional `label` defaults to that value. `content` replaces the rendered label with custom HTML, while filtering still uses `label ?? value`. Keep a textual label when supplying icons or other custom content.

The default filter uses the cmdk scoring algorithm adapted in `command-score.ts`. It trims the query, label, and keywords, matches fuzzy subsequences and keyword aliases, and sorts matching items by descending score. Equal scores preserve declaration order. With an empty query, items retain declaration order within their groups.

Use `group` on items and `groups: [{ value, heading }]` in view inputs to label sections. Group members stay contiguous; the highest-ranked member determines its group's position. Declared groups with no results remain mounted but hidden. Separators between sections appear only when the query is empty.

The following options change rendering or filtering:

- `filter(labelOrValue, search, keywords)` supplies a custom numeric score. Positive scores match; zero or negative scores are excluded unless forced to render.
- `shouldFilter: false` bypasses filtering and ranking. The application supplies results, which are still grouped together.
- Item `forceMount: true` retains that item regardless of its score. Group `forceMount: true` retains all its items and keeps the group visible when empty.
- `isDisabled: true` keeps a matching item visible but excludes it from activation and selection.
- `isChecked: true` displays a check indicator. It does not create checkbox state or toggle the item.
- `shortcut` displays a hint; it does not register a hotkey and replaces the check indicator.
- `loading: true` adds a progressbar row with `loadingText`, defaulting to “Loading commands...”. Loading state and asynchronous fetching belong to the application.
- `emptyText` defaults to “No results found.” The empty row appears when there are no results, including while loading. Disabled results count as results.
- `label`, `placeholder`, and `className` configure the accessible name, input placeholder, and palette container.

## Configure navigation

Focus stays in the search input. The list uses `role="listbox"`, items use `role="option"`, and `aria-activedescendant` identifies the active item.

- Arrow Up and Arrow Down move through enabled results. Navigation clamps at the ends unless `loop: true` is set.
- Home and End select the first and last enabled results. Meta+Arrow Up/Down also jumps to an edge.
- Alt+Arrow Up/Down moves to an adjacent group, falling back to ordinary navigation when no adjacent group exists.
- Ctrl+N/J and Ctrl+P/K move down and up by default. Set `vimBindings: false` to disable these bindings.
- Enter emits `Selected` for the active enabled item. IME composition events are ignored.
- Pointer movement activates enabled items, except for touch input. `disablePointerSelection: true` disables hover activation; clicking still selects.

The mounted palette measures its list content and exposes `--cmdk-list-height` for CSS animation. It emits `cmdk-*` attributes used by the upstream group styles.

## Add a dialog

Use one `Command.CommandDialog.Model` in the parent schema and one parent message carrying `Command.CommandDialog.Message`:

```ts
const commandDialog = Command.CommandDialog.init({
  id: 'app-command-dialog',
  closeOnSelect: true,
  resetOnOpen: true,
})
```

Fold child updates through `Command.CommandDialog.update`, and render `Command.CommandDialog.view` through `h.submodel`. Pass the same item and filtering options as the inline view. The dialog also accepts `title`, `description`, `showCloseButton`, and `panelClass`. Its title and description provide accessible context and are visually hidden. The close button is omitted by default.

Call `Command.CommandDialog.open(model.commandDialog)` or `.close(model.commandDialog)` from the parent update. Store the returned model and map the returned commands to the parent message. The underlying Dialog handles initial input focus, modal focus management, dismissal, animation, and focus restoration.

By default, `closeOnSelect` and `resetOnOpen` are both false: selection leaves the dialog open, and reopening preserves the query. With `closeOnSelect: true`, selection closes the dialog and emits `Selected`. With `resetOnOpen: true`, opening a closed dialog clears its query and active value. `isAnimated` defaults to true.

The wrapper forwards Command out-messages and Dialog `Opened`/`Closed` events. Closing through selection returns `Selected`; callers should not require a separate `Closed` out-message for that path.

Register global shortcuts in the application. The showcase scopes ⌘K/Ctrl+K to `/docs/command` and disables Vim bindings inside its dialog so Ctrl+K can toggle it. Inline Ctrl+K remains an upward-navigation binding. Item shortcut hints do not execute actions.

## Check the showcase

Start `pnpm --filter @foldcn/web dev` and open `/docs/command` on the local server. The inline example keeps its search after selection. The dialog example opts into closing after selection and resetting on reopen.

1. Search for `clndr` inline and press Enter. Calendar runs, and the inline query remains.
2. Clear the search and use arrow keys, Home, and End. Navigation skips Calculator.
3. Open the command palette and search for `payment`. Billing is the matching action.
4. Select Billing. The dialog closes and the run counter increments.
5. Reopen the dialog. Its query is empty. Hover over and click an enabled result to run it.
6. Search for an unmatched query. The empty message appears, and Enter runs nothing.
7. Press Escape to dismiss the dialog, then check the application shortcut and restored focus.

The browser regression script is `packages/web/scripts/verify-command-composition.mjs`. From the local page's browser console:

```js
const { verifyCommandComposition } = await import('/scripts/verify-command-composition.mjs')
await verifyCommandComposition()
```

These are verification instructions, not a claim that browser checks have passed for every style. Unit coverage lives in `packages/web/src/command-behavior.test.ts`.

## Scope relative to cmdk

This is a data-driven Foldkit API, not a drop-in React cmdk API. Items and groups come from view inputs rather than child registration. CommandDialog composes Foldkit Dialog. Nested command pages, asynchronous requests, application actions, and global shortcuts remain application-owned. The implementation does not establish complete behavioral or visual parity with cmdk.
