# Vendored shadcn styles

The `style-*.css` files in this directory are **verbatim copies** of
[shadcn-ui/ui](https://github.com/shadcn-ui/ui)
`apps/v4/registry/styles/style-*.css` — the `cn-*` utility-token layers that
style the shadcn v4 BASE registry components foldcn derives from.

foldcn components emit those `cn-*` token classes verbatim (ADR-014); each
style defines what the tokens resolve to. `style-nova.css` is foldcn's default
style; the others are vendored so alternative styles can be adopted later
without another sourcing step. The files are consumed at build time by
`scripts/resolve-styles.mjs`; nothing here ships to users directly.

**License: MIT** — © shadcn, see LICENSE in the upstream repository
(https://github.com/shadcn-ui/ui/blob/main/LICENSE).

## Syncing

Vendored from upstream commit `25be24c` on 2026-08-22.

```bash
# refresh from a local checkout (default: ~/Development/repos/shadcn-ui/ui)
node packages/registry/scripts/sync-styles.mjs [--shadcn-dir <path>]

# review drift without writing
node packages/registry/scripts/sync-styles.mjs --check
```

Keep the copies byte-identical: no headers, no formatting, no foldkit edits.
foldkit-specific adaptations live in `registry/default/style/cn-compat.css`
and in `scripts/resolve-styles.mjs`.
