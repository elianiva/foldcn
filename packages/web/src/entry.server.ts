import { Effect } from 'effect'
import { Server } from 'foldkit/experimental'

import { items } from './catalog'
import { init } from './init'
import { htmlToMarkdown } from './markdown'
import { view } from './view'

export const prerenderPaths: ReadonlyArray<string> = [
  '/',
  '/docs',
  '/docs/charts',
  ...items.map((item) => `/docs/${item.name}`),
]

const prefersMarkdown = (request: Request): boolean =>
  /text\/markdown/i.test(request.headers.get('accept') ?? '')

const isMarkdownPath = (pathname: string): boolean => pathname.endsWith('.md')

const sourcePathForMarkdown = (pathname: string): string => {
  if (pathname === '/index.md') return '/'
  if (pathname.endsWith('.md')) return pathname.slice(0, -3)
  return pathname
}

export const renderPage = (request: Request) =>
  Effect.gen(function* () {
    const url = new URL(request.url)
    const wantsMarkdown = isMarkdownPath(url.pathname) || prefersMarkdown(request)

    // Normalize `.md` URLs to their source page before routing. `/docs/avatar.md`
    // renders the same as `/docs/avatar`, and `/index.md` maps to `/`.
    const renderUrl = wantsMarkdown
      ? new URL(sourcePathForMarkdown(url.pathname) + url.search, request.url).toString()
      : request.url

    const renderedApplication = yield* Server.renderToString(
      { routing: {}, init, view },
      { url: renderUrl, buildId: import.meta.env.FOLDKIT_BUILD_ID },
    )

    if (wantsMarkdown) {
      // Wrap the fragment in a minimal document with <title> so Defuddle
      // preserves the h1 (otherwise it infers the title from the h1 and
      // strips it as a duplicate).
      const docTitle = renderedApplication.title ?? ''
      const fullHtml = `<!DOCTYPE html><html><head><title>${docTitle.replace(/</g, '&lt;')}</title></head><body>${renderedApplication.html}</body></html>`
      const markdown = yield* htmlToMarkdown(fullHtml, url.origin)
      return Server.Responded(
        new Response(markdown, {
          headers: {
            'content-type': 'text/markdown; charset=utf-8',
            vary: 'accept',
          },
        }),
      )
    }

    return Server.Rendered(renderedApplication)
  }).pipe(Effect.runPromise)
