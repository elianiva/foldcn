import { metaDescriptionFor, pageUrlFor, seoForPath, SITE_NAME, SITE_ORIGIN } from '../src/seo'
import { ogImageUrlFor } from './og-image'

const escapeAttr = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const replaceOrThrow = (
  html: string,
  pattern: RegExp,
  replacement: string,
  path: string,
): string => {
  if (!pattern.test(html)) {
    throw new Error(
      `Head rewrite for ${path} matched nothing with ${pattern}. The markup in index.html no longer has the shape this pattern expects.`,
    )
  }
  return html.replace(pattern, () => replacement)
}

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_ORIGIN,
  description: metaDescriptionFor('/'),
}

export const injectMetaTags = (html: string, path: string): string => {
  const meta = seoForPath(path)
  const pageUrl = pageUrlFor(path)
  const ogImage = ogImageUrlFor(path)
  const title = escapeAttr(meta.title)
  const description = escapeAttr(metaDescriptionFor(path))

  const replacements: ReadonlyArray<readonly [RegExp, string]> = [
    [/<title>[^<]*<\/title>/, `<title>${title}</title>`],
    [/name="description"\s+content="[^"]*"/, `name="description" content="${description}"`],
    [/rel="canonical"\s+href="[^"]*"/, `rel="canonical" href="${pageUrl}"`],
    [/property="og:url"\s+content="[^"]*"/, `property="og:url" content="${pageUrl}"`],
    [/property="og:title"\s+content="[^"]*"/, `property="og:title" content="${title}"`],
    [
      /property="og:description"\s+content="[^"]*"/,
      `property="og:description" content="${description}"`,
    ],
    [/property="og:image"\s+content="[^"]*"/, `property="og:image" content="${ogImage}"`],
    [/property="og:image:alt"\s+content="[^"]*"/, `property="og:image:alt" content="${title}"`],
    [/name="twitter:title"\s+content="[^"]*"/, `name="twitter:title" content="${title}"`],
    [
      /name="twitter:description"\s+content="[^"]*"/,
      `name="twitter:description" content="${description}"`,
    ],
    [/name="twitter:image"\s+content="[^"]*"/, `name="twitter:image" content="${ogImage}"`],
    [/name="twitter:image:alt"\s+content="[^"]*"/, `name="twitter:image:alt" content="${title}"`],
  ]

  const rewritten = replacements.reduce(
    (current, [pattern, replacement]) => replaceOrThrow(current, pattern, replacement, path),
    html,
  )

  if (path !== '/') return rewritten
  return replaceOrThrow(
    rewritten,
    /<\/head>/,
    `<script type="application/ld+json">${JSON.stringify(WEBSITE_SCHEMA)}</script>\n  </head>`,
    path,
  )
}

export const buildSitemap = (paths: ReadonlyArray<string>, lastmod: string): string => {
  const entries = paths
    .map(
      (path) => `<url>\n  <loc>${pageUrlFor(path)}</loc>\n  <lastmod>${lastmod}</lastmod>\n</url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}
