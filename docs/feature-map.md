# Feature map

Conceptual companion to `CONTEXT.md` (which owns glossary and decisions). This file covers what you cannot discover by grepping.

## Product intent

Foldcn is a copy-paste registry. Users install source files they own. It is Foldkit-only and speaks the shadcn contract (`components.json` namespace + `shadcn add` + static `r/` JSON). No npm library, no server.

```sh
npx shadcn@latest add @foldcn/foldcn
npx shadcn@latest add @foldcn/button @foldcn/dialog
```

## Component families

| Family                   | Pattern                                                       | When                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Helpers**              | Stateless builder (`ViewConfig + builder → Html`)             | Simple controls: button, input, switch, checkbox                                                                                                                              |
| **Submodels**            | Stateful (`Model + Message + update + view` via `h.submodel`) | Focus/open/selection: dialog, popover, menu, calendar, toast. Some re-export `@foldkit/ui`, others (toggle, accordion, collapsible, resizable, command) are authored in place |
| **Presentational ports** | Static markup, no state machine                               | Layout matching shadcn: badge, separator, card, table, sidebar                                                                                                                |

If it manages focus, open state, or selection → submodel. If purely visual → helper or presentational.

## Pipeline

1. **Author** with `cn-*` token classes only. Class strings stay character-identical to upstream `bases/base/ui/*.tsx` so diffs are readable. Visual deltas go to CSS, never to class strings. See `docs/deriving-from-base.md`.
2. **Resolve** via `scripts/resolve-styles.mjs` — merges `cn-compat.css` ahead of vendored `style-*.css`, substitutes every `cn-*` occurrence, rewrites animation selectors (`data-open:`→`data-enter:`, `data-closed:`→`data-leave:`), strips inert tokens. Output: gitignored `styles/<style>/` trees.
3. **Build** via `scripts/build.mjs` — resolve → `shadcn build` on `styles/default/` → emit `dist/r/` (+ `dist/r/styles/<style>/`). Deploy copies `dist/r` to web assets.
4. **Serve** — static SSG + Cloudflare Worker (`packages/web/src/worker.ts`) for `/r/` cache headers and Markdown negotiation. Vite middleware mirrors this locally.

Tokens a style does not define strip to nothing during resolve (matching upstream) with a warning. Preset propagation (e.g. `fontHeading`) resolves at build time via CSS vars — see ADR-014.

## Style system

Vendored CSS (`registry/styles/style-*.css`) is byte-identical to upstream — never edit. Hand-written Foldkit deltas live in `registry/default/style/cn-compat.css` (e.g. `aria-disabled`/`data-disabled` twins, `cn-font-heading` bridge, `no-scrollbar`). Resolve keeps them separate; syncing stays a plain `diff`. See ADR-015 and `registry/styles/README.md`.

Command owns its query and active value; CommandDialog owns both Command and Dialog submodels. Items, actions, and global shortcuts belong to the caller. See [Command and CommandDialog](command-composition.md). The resolver preserves `cmdk-*` selectors because the stateful view emits those attributes.

## Demo harness

- **Slices** — each `packages/web/src/demo/views/<name>.ts` exports a `slice` (fields + init + messages + handlers + subscriptions). See `slice.ts`.
- **Assemble** — `demo/assemble.ts` spreads slices into one `Model`/`Message`/`update` triple, type-safely (`tagsExhaustive` ensures exhaustiveness).
- **Style switching** — `scripts/generate-style-shims.mjs` emits live-binding shims into `src/generated/registry/` which `src/active-style.ts` rebinds synchronously on `setActiveStyle()`. No reload, no state loss; consumers read bindings inside view functions. Blocks import via `@/components/ui` alias resolved through shims. Boot with a stored non-default style uses `Runtime.run` instead of `Runtime.hydrate` (`src/entry.ts`) because prerendered HTML is always default-styled. Storage key: `foldcn-style`. Tailwind scans all nine trees via `@source` lines in `src/styles.css`.

## What breaks easily

- **Disabled is never native.** Foldkit emits `aria-disabled`/`data-disabled`, not `disabled`. Styling keyed only on `disabled:` never matches. Add compat twins in `cn-compat.css` for any new disabled-capable control.
- **Animation windows.** Base UI keys enter on `data-open:` and exit on `data-closed:`. Foldkit emits `data-enter`/`data-leave` only during transition. Resolve rewrites `data-open:`→`data-enter:` and `data-closed:`→`data-leave:` for enter/exit utilities only; persistent open styling on `data-open:` stays untouched. See `resolve-styles.mjs`.
- **Placement vs side.** Popover/tooltip emit `data-placement` (`bottom-start`); styles expect `data-side` (`bottom`). Views must emit `data-side` from placement. Logical sides `inline-start/end` have no Foldkit equivalent.
- **Menu ceiling.** Submenu, checkbox/radio items, destructive variant, and inset have no `@foldkit/ui` primitive. Dropdown/context/menubar cannot reach parity until the primitive does. Menubar is independent menus, not roving. Context menu has no pointer anchoring. Hover card is click-toggled.
- **`cn-*` must not leak.** Resolved output must contain no `cn-*` literal or the build fails. Copy token form, put visual deltas in `cn-compat.css`.
- **Blocks compose via alias.** `@/components/ui/*` in blocks resolves through shims via Vite alias. Breaking that alias locks blocks to one style.
- **Tailwind scan coverage.** Every resolved tree must be listed in `styles.css` `@source` lines or utilities go missing in production.
- **Hydration quirk.** `entry.ts` checks `activeRegistryStyle()` at boot — non-default stored style forces client render over hydration.

## Where to look next

- `CONTEXT.md` — glossary, ADR index, repo orientation.
- `docs/deriving-from-base.md` — recipe for porting a component from upstream Base UI.
- `docs/shadcn-base-parity-audit.md` — gap analysis against the live Base registry.
- `docs/adr/` — individual ADRs.
- `packages/registry/scripts/sync-styles.mjs` + `registry/styles/README.md` — vendoring provenance.
- `packages/web/src/demo/{slice,assemble}.ts` — harness contract.
