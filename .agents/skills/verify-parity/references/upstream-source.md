# Upstream Source

Foldcn derives from the shadcn v4 BASE registry, not the legacy inline registry.

## Canonical source

- Repo: `https://github.com/shadcn-ui/ui`
- Path: `apps/v4/registry/bases/base/ui/*.tsx` (components) + `apps/v4/registry/styles/style-*.css` (tokens)
- Docs: `https://ui.shadcn.com/docs/components` (rendered from same registry)
- Vendored copies: `packages/registry/registry/styles/style-*.css` (byte-identical, refreshed by `sync-styles.mjs`)
- Component sources: copy `cn-*` class strings verbatim per `docs/deriving-from-base.md`

## Sourcing options

### 1. Local checkout (preferred)

```bash
# default location used by sync-styles.mjs
ls ~/Development/repos/shadcn-ui/ui/apps/v4/registry/bases/base/ui

# or set explicitly
SHADCN_UI_DIR=/path/to/ui node .agents/skills/verify-parity/scripts/verify-parity.mjs --inventory
```

Record the commit:

```bash
git -C $SHADCN_UI_DIR rev-parse --short=7 HEAD
```

Compare vendored CSS drift:

```bash
node packages/registry/scripts/sync-styles.mjs --check
```

### 2. Live docs (no checkout) — fetch + web_search + agent-browser

```bash
node .agents/skills/verify-parity/scripts/fetch-upstream.mjs
```

This fetches `https://ui.shadcn.com/docs/components` and enumerates component pages. It writes `.tmp/upstream.json` with `{ name, url }` list for the inventory step. Use when the checkout is unavailable.

When the harness needs rendered upstream pages for visual parity (not just the list), use `web_search` + `agent-browser read`:

```bash
# discover the component page via web_search (Exa) — or browse directly:
agent-browser open https://ui.shadcn.com/docs/components/button
agent-browser snapshot -i --json   # verify rendered structure
agent-browser read https://ui.shadcn.com/docs/components/button  # markdown-friendly fetch for docs text
```

`web_search` with `{ queries: ["site:ui.shadcn.com/docs/components button", ...] }` is the inventory fallback when neither checkout nor `.tmp/upstream.json` exists — `verify-visual-parity.mjs --states` will note `upstream: web_search`. For pixel comparisons, `agent-browser screenshot` against `https://ui.shadcn.com/docs/components/<name>` is the live reference render; prefer a local `apps/v4` dev server (`SHADCN_URL=http://localhost:3000`) for determinism when available.

### 3. Existing audit

`docs/shadcn-base-parity-audit.md` lists renames, foldcn-only and upstream-only components, and open behavioral gaps. Use it as a baseline, but re-verify against live upstream.

## When to refresh vendored styles

```bash
node packages/registry/scripts/sync-styles.mjs
node packages/registry/scripts/sync-styles.mjs --check
pnpm --filter @foldcn/registry build
```

Keep vendored files byte-identical (ADR-015). Visual deltas go to `registry/default/style/cn-compat.css`.
