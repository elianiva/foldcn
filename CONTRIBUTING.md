# Contributing to foldcn

Thanks for picking this up! This doc covers the implicit stuff like the gotchas and conventions you won't get from just browsing the tree. Your agents can explore the codebase freely; use this as the cheat sheet :)

## Prerequisites

- Node ≥ 20, pnpm 11+

```bash
git clone git@github.com:elianiva/foldcn.git
cd foldcn
pnpm install
```

## How it fits together

- **Authored source** lives in `packages/registry/registry/default/`, one file per component.
- **Resolved source** in `packages/registry/styles/default/` is gitignored and generated. Don't edit it. They're generated based on the selected shadcn style based on the components in the registry.
- **Showcase site** in `packages/web/` auto-discovers components and demos as long as you follow the convention.

Check `docs/adr/` for architecture decisions and `docs/deriving-from-base.md` for the full derivation recipe.

## The two things that will bite you

**1. `cn-*` tokens, not real classes**

Authored components emit only `cn-*` tokens (e.g. `cn-button cn-button-variant-default`), kept character-identical to upstream shadcn base so diffs stay clean. `scripts/resolve-styles.mjs` swaps them for concrete Tailwind classes at build time.

- Never inline resolved utilities in authored files.
- Never edit vendored `registry/styles/style-*.css` (byte-identical to upstream). Foldkit-specific deltas go in `registry/default/style/cn-compat.css`.

**2. Never run bare `shadcn build`**

It would ship unresolved `cn-*` tokens. Always:

```bash
pnpm --filter @foldcn/registry run build   # resolve → shadcn build → token swap
```

For local dev / typecheck / tests, the web's `predev`/`prebuild` hooks re-resolve automatically — just run:

```bash
pnpm dev          # showcase site
pnpm typecheck
pnpm test
pnpm validate     # registry schema check
```

## Adding a component

Three things:

**1. Source** - `packages/registry/registry/default/ui/<name>.ts`
Self-contained module: types, logic, styled view in one file. Match the pattern of a nearby component (helper vs submodel vs presentational — see `docs/adr/011-styled-view-factories.md`).

**2. Manifest** - `packages/registry/registry/default/ui/registry.json`
Add `name`, `type`, `title`, `description`, `files`. Only declare `dependencies` beyond what the base style already provides (`foldkit`, `effect`, `@foldkit/ui`, `cn`, `lucide`, `tw-animate-css`). If it intentionally diverges from shadcn (primitive ceiling, no pointer anchoring, etc.), add a short note to `packages/web/src/catalog/gaps.ts`.

**3. Demo** - `packages/web/src/demo/views/<name>.ts`
Export a `slice` + view. Import from `@foldcn/registry/styles/default/ui/<name>` (the resolved path, not the authored one). `assemble.ts` picks it up automatically. See any existing file in `demo/views/`. The shape is always the same.

Then:

```bash
pnpm --filter @foldcn/registry run validate
pnpm typecheck && pnpm test
```

## Submitting

Fork, branch, keep commits focused, run `pnpm fmt && pnpm typecheck && pnpm test && pnpm validate`, open a PR with what/why.

Issues → [github.com/elianiva/foldcn/issues](https://github.com/elianiva/foldcn/issues)

## License

By contributing, you agree your contributions are [MIT](LICENSE).
