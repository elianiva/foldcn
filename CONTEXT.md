# foldcn — Context

Copy-paste shadcn-style component registry for Foldkit (`foldkit` + `effect` + `@foldkit/ui`). Users install source via `shadcn add @foldcn/<name>`. No React variant, no server logic — static JSON under `r/`.

## Glossary

| Term               | Meaning                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **registry**       | Static JSON manifests served at `https://foldcn.elianiva.com/r/{name}.json`.                      |
| **registry:style** | Base item that installs CSS vars, core deps, and theme tokens. Install first.                     |
| **registry:ui**    | Single-file component module (types + logic + styled view).                                       |
| **registry:block** | Multi-file composition of `registry:ui` items (e.g. `login-form`).                                |
| **registry:lib**   | Utility item (e.g. `cn()` merger).                                                                |
| **submodel**       | Stateful Foldkit pattern: `Model + Message + update + OutMessage + view`, wired via `h.submodel`. |
| **helper**         | Stateless Foldkit pattern: `ViewConfig + builder → Html`, no Model/Message.                       |
| **base trio**      | Peer deps every component assumes: `foldkit`, `effect`, `@foldkit/ui`.                            |
| **namespace**      | `@foldcn` prefix configured in `components.json` (`"@foldcn": "…/r/{name}.json"`).                |

## Decisions

ADRs live in [`docs/adr/`](docs/adr/). Index:

| ADR                                                | Title                                               |
| -------------------------------------------------- | --------------------------------------------------- |
| [001](docs/adr/001-full-design-system.md)          | Full design system, not just themes                 |
| [002](docs/adr/002-pure-foldkit.md)                | Pure Foldkit, no React                              |
| [003](docs/adr/003-hosted-registry.md)             | Hosted registry with `@foldcn` namespace            |
| [004](docs/adr/004-self-contained-modules.md)      | Self-contained component modules                    |
| [005](docs/adr/005-tailwind-token-vocabulary.md)   | Tailwind CSS with shadcn's token vocabulary         |
| [006](docs/adr/006-dependency-strategy.md)         | Dependency strategy                                 |
| [007](docs/adr/007-lucide-icons.md)                | `lucide` for icons, wrapped with `h.`               |
| [008](docs/adr/008-dual-animation-approach.md)     | Animations — dual approach                          |
| [009](docs/adr/009-showcase-blocks.md)             | 2–3 showcase blocks                                 |
| [010](docs/adr/010-components-json-template.md)    | `components.json` template                          |
| [011](docs/adr/011-styled-view-factories.md)       | Styled view factories                               |
| [012](docs/adr/012-card-primitive.md)              | `card` primitive                                    |
| [013](docs/adr/013-ts-source-is-build-input.md)    | Registry items are `.ts`, source is the build input |
| [014](docs/adr/014-derive-from-base-via-tokens.md) | Derive from shadcn v4 BASE via `cn-*` token layer   |
| [015](docs/adr/015-vendor-token-css-verbatim.md)   | Vendor shadcn's per-style token CSS verbatim        |
| [016](docs/adr/016-demo-live-binding-shims.md)     | Demo style switching via live-binding shims         |

## Repository orientation

```
packages/registry/registry/default/{style,ui,lib,blocks}/  authored source (cn-* tokens)
packages/registry/registry/styles/style-*.css               vendored upstream CSS (ADR-015, do not edit)
packages/registry/styles/<style>/                           resolved trees (gitignored, ADR-014)
packages/registry/scripts/{resolve-styles,build,sync-styles}.mjs
packages/web/src/demo/{slice,assemble,views/}               demo harness
packages/web/src/{active-style,generated/registry/}         style-switching shims (ADR-016)
```

Inventory and file details are discoverable from the source — see `registry/default/ui/registry.json` (`registry:ui` items), `registry/default/lib/registry.json`, `registry/default/blocks/registry.json`, and `registry.json` at the package root. Install flow: `AGENTS.md` quick rules and `packages/registry/components.json`.
