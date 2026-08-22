# foldcn — Domain Model

## What

A **shadcn-style component registry** for the Foldkit ecosystem. Users install copy-paste component source code via the `shadcn` CLI, styled with Tailwind CSS, built on `@foldkit/ui` (headless, Elm-architecture components using Effect-TS).

## Glossary

| Term               | Definition                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **registry**       | A collection of JSON manifests describing distributable code items (components, styles, utilities, blocks). Served via static JSON or a hosted endpoint. |
| **registry item**  | A single distributable unit (e.g., `button`, `dialog`, `login-form`). Defined by a `registry-item.json` with files, deps, CSS vars.                      |
| **registry:style** | A base style item that installs CSS variables, core dependencies, and theme tokens. The foundation users install first.                                  |
| **registry:ui**    | A UI component item. Single file, self-contained module with types + logic + styled view.                                                                |
| **registry:block** | A composed, multi-file item that combines multiple registry:ui components into a ready-to-use page or section.                                           |
| **registry:lib**   | A utility library item (e.g., `cn()` class merger).                                                                                                      |
| **submodel**       | A Foldkit UI stateful component pattern: Model + Message + update + OutMessage + view. Wired via `h.submodel`.                                           |
| **helper**         | A Foldkit UI stateless component pattern: called directly with ViewConfig + builder callback, returns Html. No Model/Message.                            |
| **namespace**      | A registry identifier prefixed with `@` (e.g., `@foldcn`). Users configure it in `components.json` to install items by name.                             |
| **base trio**      | The three core peer dependencies every foldcn component assumes: `foldkit`, `effect`, `@foldkit/ui`. Installed by the base style.                        |

## Architecture Decisions

### ADR-001: Full design system, not just themes

foldcn provides a complete design system: a base `registry:style` (CSS vars, core deps, base CSS) PLUS individual `registry:ui` items for every @foldkit/ui component. Not just color tokens.

### ADR-002: Pure Foldkit, no React

Target audience: Foldkit projects using `foldkit` + `effect` + `@foldkit/ui`. No React component variants. Registry items assume the Elm architecture pattern (Model/Message/update/View).

### ADR-003: Hosted registry with `@foldcn` namespace

Users configure `components.json` with `"@foldcn": "https://foldkit.dev/r/{name}.json"` and install via `shadcn add @foldcn/button`. Hosted on static hosting (Cloudflare Pages / Vercel / GitHub Pages) — built with `shadcn build`, zero server logic.

### ADR-004: Self-contained component modules

Each `registry:ui` item is a single `.ts` file containing everything: Model type, Message type, update function, and styled view function. Users copy the file and it works — no manual wiring of types. For stateless helpers (Button, Input, etc.), the file exports a view function. For stateful submodels (Dialog, Menu, etc.), it re-exports init/update/view from @foldkit/ui with styled view wrappers.

### ADR-005: Tailwind CSS with shadcn's token vocabulary

Base style mirrors shadcn's full CSS variable set: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `ring`, `card`, `popover`, `sidebar-*`, etc. Uses `oklch()` color values. Users customize by editing CSS vars — same mental model as shadcn.

### ADR-006: Dependency strategy

Base `registry:style` installs the "base trio" (`foldkit`, `effect`, `@foldkit/ui`) plus `tailwind-merge`, `clsx`, `tw-animate-css`. Individual `registry:ui` items only declare extra deps they need beyond the base (e.g., `lucide` for icons). Avoids version conflicts and redundant installs.

### ADR-007: `lucide` for icons, wrapped with `h.`

Uses vanilla `lucide` (not `lucide-react`). SVGs are wrapped via Foldkit's `h.svg` / `h.path` functions. Components that include icons (Select chevron, etc.) import from `lucide` and render via `h.`.

### ADR-008: Animations — dual approach

Base style includes `tw-animate-css` for Tailwind animation classes. Components that need enter/leave transitions use Foldkit's `Animation` submodel to trigger those CSS animations. CSS defines keyframes, Foldkit triggers them.

### ADR-009: 2-3 showcase blocks

Registry includes composed blocks: `login-form`, `settings-page`, `data-table`. Multi-file `registry:block` items that demonstrate component composition. Serve as copy-paste starters and documentation.

### ADR-010: `components.json` template

Ship a recommended `components.json` for Foldkit projects with `@foldcn` namespace pre-configured and aliases (`@ui`, `@lib`, `@hooks`) pointing to standard directories. Uses `style: "default"` (the only schema-valid value) and `tsx: true` so source files install as `.ts`.

### ADR-011: Styled view factories

Stateful submodels (Dialog, Popover, Tooltip, Tabs, RadioGroup, Slider, Calendar, DatePicker, FileDrop) ship their `@foldkit/ui` `view` re-exported plus a `styledViewInputs` factory: `X.styledViewInputs({...}, h)` returns the styled `ViewInputs`. The caller passes their own `h` so content callbacks can dispatch parent messages (the `toView` callbacks of these components receive no `h`). List-style submodels (Menu, Listbox, Combobox, Tabs, RadioGroup) use the `create<Value>()` bundle pattern from `@foldkit/ui` and a `viewInputs` factory that fills in the styled class names.

### ADR-012: `card` primitive

`card` is a pure layout component (no `@foldkit/ui` backing) shipped as `registry:ui` with styled class constants — used by the blocks.

### ADR-013: Registry items are `.ts`, source is the build input

The registry repo's source files live under `registry/default/` and are the input to `shadcn build`, which emits the flattened catalog + per-item JSON into `public/r/`. Imports use `@/` aliases (`@/lib/utils`, `@/components/ui/*`) so the CLI rewrites them per the user's `components.json` on install.

### ADR-014: Derive from the shadcn v4 BASE registry via a `cn-*` token layer

foldcn components are derivations of `shadcn-ui/ui` `apps/v4/registry/bases/base/ui/*.tsx` (Base UI registry, `nova` style) — not the legacy inline-class registry they were originally seeded from. Authored component files emit only `cn-*` utility-token classes, kept character-identical to upstream so class strings stay diffable. The token definitions are vendored verbatim from upstream (`registry/styles/style-*.css`, see ADR-015), merged with hand-written foldkit deltas (`style/cn-compat.css`). Matching shadcn's own pipeline, `scripts/resolve-styles.mjs` substitutes every token occurrence with its resolved Tailwind classes into the gitignored `styles/default/{ui,lib,blocks}` tree — that tree is what the web demo renders and what `shadcn build` ships, so neither demos nor installs need the token CSS loaded (the style item carries only theme setup). foldkit state-attribute differences (enter/leave animation windows, aria-disabled instead of native disabled, placement vs side) are resolved in the compat layer, by emitting derived attributes in the view, or by rewriting animation-state hooks in the resolve step — never by editing copied class strings or vendored CSS. Recipe: `docs/deriving-from-base.md`.

### ADR-015: Vendor shadcn's per-style token CSS verbatim

The shadcn token layers (`apps/v4/registry/styles/style-*.css`, one file per style) are vendored **byte-identical** into `packages/registry/registry/styles/` and credited to shadcn (MIT). We deliberately do NOT build runtime compatibility against the live shadcn registry: vendored copies keep foldcn self-contained and make syncing a dumb copy (`scripts/sync-styles.mjs`, run periodically against a local checkout; provenance commit + date recorded in `registry/styles/README.md`). Byte-identity is the contract: no headers, no reformatting, no foldkit rewrites inside these files — drift against a fresh checkout is always reviewable with plain `diff`. The foldkit animation-state rewrite (`data-open:`/`data-closed:` → `data-enter:`/`data-leave:`) therefore happens at resolve time in `resolve-styles.mjs`, not in the artifact.

`style-nova.css` is wired as foldcn's default style today. The other seven styles (vega, maia, lyra, mira, luma, sera, rhea) ship as inert data so a future opt-in style needs no new sourcing step — only pipeline wiring (resolved tree + registry item), which is intentionally deferred until there is a product reason.

## Component Inventory

All ~20 @foldkit/ui components, organized by type:

### Stateless helpers (registry:ui)

| Component  | Description                             |
| ---------- | --------------------------------------- |
| Button     | Accessible button with variants + sizes |
| Input      | Text input with label + description     |
| Textarea   | Multi-line text input                   |
| Checkbox   | Toggle with indeterminate state         |
| Switch     | On/off toggle                           |
| Select     | Native select with chevron              |
| Fieldset   | Groups related form controls            |
| Disclosure | Show/hide toggle (accordion/FAQ)        |
| Nav        | URL-driven navigation landmark          |
| Card       | Pure layout container                   |

### Stateful submodels (registry:ui)

| Component     | Description                                                         |
| ------------- | ------------------------------------------------------------------- |
| Dialog        | Modal dialog with focus trapping + backdrop                         |
| Menu          | Dropdown menu with keyboard nav + typeahead                         |
| Listbox       | Custom select with selection + keyboard nav                         |
| Combobox      | Autocomplete input with filtering                                   |
| Popover       | Floating panel with arbitrary content                               |
| Tabs          | Tabbed interface with keyboard nav                                  |
| Radio Group   | Radio options with roving tabindex                                  |
| Slider        | Numeric range input with pointer drag                               |
| Calendar      | Inline calendar grid with locale support                            |
| Date Picker   | Input + popover Calendar combo                                      |
| Drag and Drop | Sortable lists + cross-container movement (view-less: helpers only) |
| File Drop     | File input with drag-and-drop                                       |
| Animation     | CSS enter/leave animation coordinator                               |
| Toast         | Transient notification stack (payload-schema factory)               |
| Virtual List  | Virtualized list for large datasets                                 |

### Utilities (registry:lib)

| Item | Description                            |
| ---- | -------------------------------------- |
| cn   | `clsx` + `tailwind-merge` class merger |

### Base (registry:style)

| Item   | Description                                     |
| ------ | ----------------------------------------------- |
| foldcn | Base style: CSS vars, core deps, base CSS rules |

### Blocks (registry:block)

| Item          | Description                                |
| ------------- | ------------------------------------------ |
| login-form    | Login page composing Button + Input + Card |
| settings-page | Settings form with multiple components     |
| data-table    | Data table with sorting/filtering          |

## File Structure

```
foldcn/
├── registry.json                          ← root registry manifest
├── CONTEXT.md                             ← this file
├── components.json                        ← recommended config template
├── registry/
│   ├── styles/                           ← VENDORED shadcn style-*.css, byte-identical (ADR-015)
│   │   ├── README.md                     ← credit + sync provenance (regenerated)
│   │   └── style-{nova,...}.css          ← synced from shadcn-ui/ui (sync-styles.mjs)
│   └── default/
│       ├── style/
│       │   ├── registry.json             ← registry:style base item (cssVars + base css)
│       │   └── cn-compat.css             ← hand-written foldkit deltas
│       ├── ui/
│       │   ├── button.ts                  ← registry:ui
│       │   ├── input.ts
│       │   ├── dialog.ts
│       │   ├── ... (all ~20 components)
│       │   └── tabs.ts
│       ├── lib/
│       │   └── cn.ts                      ← registry:lib
│       ├── blocks/
│       │   ├── login-form/
│       │   │   ├── login-form.json        ← registry:block manifest
│       │   │   ├── page.tsx               ← route page
│       │   │   └── login-form.tsx         ← component
│       │   ├── settings-page/
│       │   └── data-table/
│       └── icons/
│           └── lucide-helpers.ts          ← h.-wrapped lucide SVGs
└── docs/
    └── getting-started.md
```

## User Installation Flow

1. User adds namespace to `components.json`:
   ```json
   { "registries": { "@foldcn": "https://foldkit.dev/r/{name}.json" } }
   ```
2. User installs base style:
   ```bash
   shadcn add @foldcn/foldcn
   ```
   → Installs `foldkit`, `effect`, `@foldkit/ui`, `clsx`, `tailwind-merge`, `tw-animate-css`, CSS vars, base CSS
3. User installs components as needed:
   ```bash
   shadcn add @foldcn/button @foldcn/input @foldcn/dialog
   ```
   → Copies self-contained `.ts` files into `components/ui/`
4. User imports and uses in their Foldkit app:
   ```ts
   import { button } from '@/components/ui/button'
   import { Dialog } from '@/components/ui/dialog'

   // In view:
   button(SubmitForm, 'Submit')

   // In submodel:
   h.submodel(Dialog.init, Dialog.update, Dialog.view(model))
   ```
