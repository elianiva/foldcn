import type { WorkerEnv } from '../../../alchemy.run'

/**
 * foldcn runs on Cloudflare Workers via alchemy (`Cloudflare.Website` with
 * `assets.runWorkerFirst`). Routing:
 *
 *   - `/r/{name}.json` and `/r/registry.json` — the shadcn install contract.
 *     The compiled registry is copied into the static assets during the build
 *     (`dist/client/r`), so we fetch it through `env.ASSETS` and attach cache
 *     headers tuned for an immutable, content-addressed-ish registry: clients
 *     revalidate every 10 minutes, CDN holds it for a day.
 *   - every other path falls through to the static site (SSG HTML + assets),
 *     except that Markdown-aware clients get the generated `.md` twin instead.
 */
const REGISTRY_CACHE = 'public, max-age=600, stale-while-revalidate=86400'

const registryPath = (pathname: string): string | undefined =>
  pathname === '/r/registry.json'
    ? '/r/registry.json'
    : /^\/r\/[a-z0-9-]+\.json$/i.test(pathname)
      ? pathname
      : undefined

const asRegistryResponse = (res: Response): Response => {
  const headers = new Headers(res.headers)
  headers.set('cache-control', REGISTRY_CACHE)
  headers.set('content-type', 'application/json; charset=utf-8')
  // Registry items are deterministic per build: never re-render, just revalidate.
  headers.set('vary', 'accept-encoding')
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  })
}

/** Parse the `q` parameter for a media type in an `Accept` header, or null. */
const qValue = (accept: string, type: string): number | null => {
  const re = new RegExp(`${type.replace('/', '\\/')}\\s*(?:;\\s*q=([0-9.]+))?`, 'i')
  const match = accept.match(re)
  if (match === null) return null
  return match[1] === undefined ? 1 : Number(match[1])
}

/**
 * True when the client explicitly prefers Markdown over HTML: it lists
 * `text/markdown` and either sends no `text/html`, or weights Markdown higher.
 * Browsers (which send `text/html, …`) therefore keep getting HTML.
 */
const prefersMarkdown = (request: Request): boolean => {
  const accept = request.headers.get('accept') ?? ''
  if (!/text\/markdown/i.test(accept)) return false
  const htmlQ = qValue(accept, 'text/html')
  if (htmlQ === null) return true
  // `text/markdown` is present (checked above), so this resolves to a number;
  // the nullish default mirrors `qValue`'s no-`q`-param behaviour.
  const markdownQ = qValue(accept, 'text/markdown') ?? 1
  return markdownQ > htmlQ
}

/** Map a page path to its generated Markdown sibling. */
const markdownPathFor = (pathname: string): string =>
  pathname === '/' ? '/index.md' : `${pathname.replace(/\/$/, '')}.md`

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    const url = new URL(request.url)
    const registryFile = registryPath(url.pathname)
    if (registryFile !== undefined) {
      // A 404 for `/r/unknown.json` (or a missing `registry.json`) should
      // surface as JSON, not fall through to an HTML 404 page.
      const res = await env.ASSETS.fetch(
        new Request(new URL(registryFile, request.url).toString(), request),
      )
      if (res.status === 404) {
        return new Response(JSON.stringify({ error: `Registry item not found: ${registryFile}` }), {
          status: 404,
          headers: { 'content-type': 'application/json; charset=utf-8' },
        })
      }
      return asRegistryResponse(res)
    }

    // Markdown content negotiation. Active only for HTML pages (never for
    // already-Markdown `.md`, the manifest `.txt`, or binary assets), and only
    // when the client prefers Markdown. This powers both
    // `curl -H "Accept: text/markdown"` and the `/path.md` URL convention.
    const wantsMarkdown =
      !/\.(md|txt)$/i.test(url.pathname) && prefersMarkdown(request)
    const assetUrl = wantsMarkdown ? new URL(markdownPathFor(url.pathname), request.url) : url

    const res = await env.ASSETS.fetch(new Request(assetUrl.toString(), request))
    if (res.status === 404) {
      // No Markdown sibling (or a genuinely missing page): serve the normal
      // asset, which is either the HTML page or the static 404.
      if (wantsMarkdown) return env.ASSETS.fetch(request)
      return res
    }

    const headers = new Headers(res.headers)
    if (assetUrl.pathname.endsWith('.md')) {
      headers.set('content-type', 'text/markdown; charset=utf-8')
    }
    // Distinguish negotiated responses so shared caches don't serve Markdown to
    // a browser that asked for HTML, and vice versa.
    headers.set('vary', 'accept')
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    })
  },
}
