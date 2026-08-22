# foldcn

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/github/stars/elianiva/foldcn)](https://github.com/elianiva/foldcn)

A **shadcn-style component registry for [Foldkit](https://foldkit.dev)**. Copy-paste styled components built on [`@foldkit/ui`](https://foldkit.dev/ui/overview), themed with Tailwind CSS variables — the same distribution model as shadcn/ui, for the Elm-architecture world of Foldkit.

- **30 registry items** — every `@foldkit/ui` component, styled, plus a base style, utilities, icons and composed blocks.
- **Self-contained modules** — each item is a single `.ts` file with types, state and styled view. Copy it in, wire it up, done.
- **Pure Foldkit** — Model/Message/update/View throughout. No React.

## Install

Requirements: a Foldkit project with Tailwind CSS v4. Start with the base style, which installs the core dependencies (`foldkit`, `effect`, `@foldkit/ui`, `clsx`, `tailwind-merge`, `lucide`, `tw-animate-css`) and writes the theme variables into your CSS:

```bash
npx shadcn@latest registry add @foldcn=https://foldcn.elianiva.com/r/{name}.json
npx shadcn@latest add @foldcn/foldcn
```

Or add the namespace manually to your `components.json`:

```json
{
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "@foldcn": "https://foldcn.elianiva.com/r/{name}.json"
  }
}
```

## Components

```bash
npx shadcn@latest add @foldcn/button @foldcn/input @foldcn/dialog
```

| Category      | Items                                                                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Base**      | `@foldcn/foldcn` (style)                                                                                                                                                                      |
| **Lib**       | `@foldcn/utils` (cn), `@foldcn/icons` (lucide → h.svg)                                                                                                                                        |
| **Helpers**   | `button`, `input`, `textarea`, `select`, `checkbox`, `switch`, `fieldset`, `disclosure`, `nav`, `card`                                                                                        |
| **Submodels** | `dialog`, `popover`, `tooltip`, `menu`, `listbox`, `combobox`, `tabs`, `radio-group`, `slider`, `calendar`, `date-picker`, `toast`, `animation`, `file-drop`, `virtual-list`, `drag-and-drop` |
| **Blocks**    | `login-form`, `settings-page`, `data-table`                                                                                                                                                   |

## Usage

### Stateless helpers

```ts
import { Submodel } from 'foldkit'
import { button } from '@/components/ui/button'
import { input } from '@/components/ui/input'

export const view = Submodel.defineView<Model, Message>((model, h) =>
  h.div(
    [],
    [
      input<Message>(
        {
          id: 'email',
          label: 'Email',
          value: model.email,
          onInput: (value) => UpdatedEmail({ value }),
        },
        h,
      ),
      button<Message>({ onClick: Submitted() }, 'Submit', h),
    ],
  ),
)
```

### Submodels (Elm wiring)

```ts
import * as Dialog from "@/components/ui/dialog"

// Model
dialog: Dialog.Model,

// init
dialog: Dialog.init({ id: "confirm" }),

// update
const foldDialog = Update.foldChild({
  update: Dialog.update,
  read: model => Option.some(model.dialog),
  write: (model, next) => evo(model, { dialog: () => next }),
  toParentMessage: message => GotDialogMessage({ message }),
  foldOutMessage: outMessage => model => [model, []],
}),

// view
h.submodel({
  slotId: model.dialog.id,
  model: model.dialog,
  view: Dialog.view,
  viewInputs: Dialog.styledViewInputs<Message>({
    content: ({ closeButton, title, description }, h) => [
      h.h2([...title, h.Class("text-lg font-semibold")], ["Confirm"]),
      h.div([h.Class("flex justify-end gap-2")], [
        h.button([...closeButton, h.Class("rounded-md border border-input px-4 py-2 text-sm")], ["Cancel"]),
        h.button([...closeButton, h.Class("rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground")], ["Confirm"]),
      ]),
    ],
  }, h),
  toParentMessage: message => GotDialogMessage({ message }),
}),
```

Submodel items export the full `@foldkit/ui` surface (`init`, `update`, `view`, `Model`, `Message`, `OutMessage`) plus a `styledViewInputs` factory that bakes in the foldcn styling. List-style submodels (`menu`, `listbox`, `combobox`, `tabs`, `radio-group`) use the `create<Value>()` bundle pattern:

```ts
export const CityListbox = Listbox.create<City>()

h.submodel({
  slotId: model.listbox.id,
  model: model.listbox,
  view: CityListbox.view,
  viewInputs: Listbox.viewInputs<City, City>({
    items: cities,
    maybeSelectedValue: model.maybeCity,
    itemToConfig: (city, { isSelected }) => ({
      className: isSelected ? 'font-semibold' : '',
      content: h.span([], [city]),
    }),
    buttonContent: h.span([], ['Select a city']),
  }),
  toParentMessage: (message) => GotListboxMessage({ message }),
})
```

### Toast

`toast` is a factory — bind it to your payload schema:

```ts
export const ToastPayload = S.Struct({
  title: S.String,
  maybeDescription: S.Option(S.String),
})
export const ToastStack = Toast.make(ToastPayload)

// in update: ToastStack.show(model.toast, { payload, variant: "Success" })
// in view: render with ToastStack.view + ToastStack.entryView
```

## Theme

The base style installs the full shadcn token set (`background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `card`, `popover`, `chart-1..5`) as CSS variables in `:root` / `.dark`, with Tailwind v4 `@theme inline` mappings so `bg-background`, `text-foreground`, etc. resolve. Customize by editing the variables in `src/index.css` — same mental model as shadcn/ui.

## Development

```bash
git clone git@github.com:elianiva/foldcn.git
cd foldcn
pnpm install
pnpm dev            # start the showcase site
pnpm typecheck      # typecheck all packages
pnpm test           # run tests
pnpm validate       # validate the registry
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## LLM-friendly

Every page is published as Markdown in addition to HTML, generated automatically at build time (no manual upkeep):

- **`/llms.txt`** — an agent-readable index of the whole site. **`/llms-full.txt`** is the concatenated full text of every page.
- **`/docs/<name>.md`** — the Markdown twin of any component or block page.
- **Content negotiation** — request a page with `Accept: text/markdown` (or append `.md`) and the Worker serves the Markdown with `Content-Type: text/markdown`. Browsers keep receiving HTML.

```sh
curl -H "Accept: text/markdown" https://foldcn.elianiva.com/docs/button
curl https://foldcn.elianiva.com/docs/button.md
curl https://foldcn.elianiva.com/llms.txt
```

## License

[MIT](LICENSE)
