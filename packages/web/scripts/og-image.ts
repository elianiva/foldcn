import { Console, Effect, FileSystem } from 'effect'
import { resolve } from 'node:path'
import { render } from 'takumi-js'

import { metaDescriptionFor, seoForPath, SITE_ORIGIN } from '../src/seo'

const OG_WIDTH = 1200
const OG_HEIGHT = 630

export const urlPathToSlug = (urlPath: string): string =>
  urlPath === '/' ? 'home' : urlPath.slice(1).replace(/\//g, '-')

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const cardTitleFor = (path: string): string => seoForPath(path).title.replace(/ · foldcn$/, '')

const cardHtmlFor = (path: string): string => {
  const meta = seoForPath(path)
  const section = meta.section === '' ? 'Registry' : meta.section
  return [
    `<div style="width:${OG_WIDTH}px;height:${OG_HEIGHT}px;background:#131313;color:#fafafa;display:flex;align-items:center;justify-content:center;">`,
    `<div style="width:1020px;height:510px;display:flex;flex-direction:column;justify-content:space-between;">`,
    `<div style="display:flex;align-items:center;gap:26px;">`,
    `<div style="width:84px;height:84px;background:#ededed;color:#131313;font-size:48px;font-weight:700;display:flex;align-items:center;justify-content:center;">F</div>`,
    `<div style="font-size:34px;color:#a3a3a3;">foldcn</div>`,
    `</div>`,
    `<div>`,
    `<div style="font-size:88px;font-weight:700;line-height:1.05;letter-spacing:-0.02em;">${escapeHtml(cardTitleFor(path))}</div>`,
    `<div style="font-size:38px;color:#a3a3a3;line-height:1.4;margin-top:18px;">${escapeHtml(metaDescriptionFor(path))}</div>`,
    `</div>`,
    `<div style="display:flex;justify-content:space-between;align-items:flex-end;">`,
    `<div style="font-size:30px;color:#6b6b6b;">${SITE_ORIGIN.replace('https://', '')}</div>`,
    `<div style="font-size:26px;font-weight:700;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.12em;">${escapeHtml(section)}</div>`,
    `</div>`,
    `</div>`,
    `</div>`,
  ].join('')
}

const renderOgImage = (ogDir: string, path: string) =>
  Effect.gen(function* () {
    const png = yield* Effect.tryPromise({
      try: () => render(cardHtmlFor(path), { width: OG_WIDTH, height: OG_HEIGHT }),
      catch: (cause) => new Error(`og image render failed for ${path}: ${String(cause)}`),
    })
    const fs = yield* FileSystem.FileSystem
    const file = resolve(ogDir, `${urlPathToSlug(path)}.png`)
    yield* fs.writeFile(file, Buffer.from(png))
    yield* Console.log(`  ✓ og/${urlPathToSlug(path)}.png`)
  })

export const ogImageUrlFor = (path: string): string =>
  `${SITE_ORIGIN}/og/${urlPathToSlug(path)}.png`

export const generateOgImages = (paths: ReadonlyArray<string>, distDir: string) =>
  Effect.gen(function* () {
    yield* Console.log('Generating OG images...')
    const fs = yield* FileSystem.FileSystem
    const ogDir = resolve(distDir, 'og')
    yield* fs.makeDirectory(ogDir, { recursive: true })
    yield* Effect.forEach(paths, (path) => renderOgImage(ogDir, path), { concurrency: 4 })
    yield* Console.log(`Generated ${paths.length} OG images.`)
  })
