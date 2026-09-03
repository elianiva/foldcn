import { Console, Effect, FileSystem } from 'effect'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { NodeRuntime, NodeServices } from '@effect/platform-node'
import { Server } from 'foldkit/experimental'

import type * as ServerEntry from '../src/entry.server'
import { buildLlmsFull, buildLlmsTxt, htmlToMarkdown, loadRegistryItems } from './markdown'
import { generateOgImages } from './og-image'
import { buildSitemap, injectMetaTags } from './seo'
import { SITE_ORIGIN } from '../src/seo'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const PROJECT_DIR = resolve(SCRIPT_DIR, '..')
const CLIENT_DIR = resolve(PROJECT_DIR, 'dist/client')
const SERVER_ENTRY_PATH = resolve(PROJECT_DIR, 'dist/server/entry.server.js')

const loadServerEntry = Effect.tryPromise({
  try: () => import(pathToFileURL(SERVER_ENTRY_PATH).href),
  catch: (cause) =>
    new Error(`Failed to load server entry at ${SERVER_ENTRY_PATH}: ${String(cause)}`, {
      cause,
    }),
})

type PrerenderSection = {
  readonly path: string
  readonly markdown: string
}

const assertNormalizedSameOriginPath = (path: string): void => {
  const url = new URL(path, SITE_ORIGIN)
  if (url.origin !== SITE_ORIGIN || url.pathname !== path) {
    throw new Error(`Cannot generate the non-normalized same-origin path "${path}".`)
  }
}

const outputFileFor = (path: string): string => {
  assertNormalizedSameOriginPath(path)
  return path === '/'
    ? resolve(CLIENT_DIR, 'index.html')
    : resolve(CLIENT_DIR, path.slice(1), 'index.html')
}

// The Markdown sibling sits next to each `index.html` so both the `/path.md`
// URL convention and the Worker's content negotiation can resolve it.
const markdownFileFor = (path: string): string => {
  assertNormalizedSameOriginPath(path)
  return path === '/' ? resolve(CLIENT_DIR, 'index.md') : resolve(CLIENT_DIR, `${path.slice(1)}.md`)
}

const writeFileEnsuringDir = (fs: FileSystem.FileSystem, filePath: string, content: string) =>
  Effect.gen(function* () {
    yield* fs.makeDirectory(dirname(filePath), { recursive: true })
    yield* fs.writeFileString(filePath, content)
  })

const ensureStaticRenderable = (result: Server.EntryResult, path: string) =>
  Effect.gen(function* () {
    if (result._tag === 'Responded') {
      return yield* Effect.die(
        new Error(
          `Cannot write the complete Response returned while generating "${path}" to a static HTML file.`,
        ),
      )
    }
    if (result.status !== undefined && result.status !== 200) {
      return yield* Effect.die(
        new Error(
          `Cannot preserve status ${result.status} while generating "${path}" as a static HTML file.`,
        ),
      )
    }
    if (result.headers !== undefined) {
      return yield* Effect.die(
        new Error(
          `Cannot preserve response headers while generating "${path}" as a static HTML file.`,
        ),
      )
    }
    return result
  })

const prerenderPage = (
  fs: FileSystem.FileSystem,
  template: string,
  serverEntry: typeof ServerEntry,
  path: string,
  index: number,
  total: number,
) =>
  Effect.gen(function* () {
    // `renderPage` honors the foldkit server-entry contract: a plain function
    // returning a `Promise<EntryResult>` (the same shape the dev host calls).
    const result = yield* Effect.promise(() =>
      serverEntry.renderPage(new Request(`${SITE_ORIGIN}${path}`)),
    )
    const rendered = yield* ensureStaticRenderable(result, path)

    const html = Server.injectIntoTemplate(template, rendered.application)
    const taggedHtml = injectMetaTags(html, path)
    const htmlFile = outputFileFor(path)
    yield* writeFileEnsuringDir(fs, htmlFile, taggedHtml)
    yield* Console.log(`Generated ${path} [${index + 1}/${total}] → ${htmlFile}`)

    // LLM-friendly Markdown twin of this page (via Defuddle).
    // Use the full injected HTML (with <title>) so Defuddle correctly
    // preserves the page's h1 instead of treating it as a duplicate title.
    const markdown = yield* htmlToMarkdown(html, SITE_ORIGIN)
    const mdFile = markdownFileFor(path)
    yield* writeFileEnsuringDir(fs, mdFile, markdown)

    return { path, markdown } as const
  })

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const template = yield* fs.readFileString(resolve(CLIENT_DIR, 'index.html'))
  const serverEntry = yield* loadServerEntry

  const total = serverEntry.prerenderPaths.length
  yield* generateOgImages(serverEntry.prerenderPaths, CLIENT_DIR)
  const sections: Array<PrerenderSection> = []
  for (const [index, path] of serverEntry.prerenderPaths.entries()) {
    const section = yield* prerenderPage(fs, template, serverEntry, path, index, total)
    sections.push(section)
  }

  const items = yield* loadRegistryItems()
  yield* writeFileEnsuringDir(fs, resolve(CLIENT_DIR, 'llms.txt'), buildLlmsTxt(items, SITE_ORIGIN))
  yield* Console.log('Generated /llms.txt')

  const today = new Date().toISOString().slice(0, 10)
  yield* writeFileEnsuringDir(
    fs,
    resolve(CLIENT_DIR, 'sitemap.xml'),
    buildSitemap(serverEntry.prerenderPaths, today),
  )
  yield* Console.log('Generated /sitemap.xml')

  yield* writeFileEnsuringDir(
    fs,
    resolve(CLIENT_DIR, 'llms-full.txt'),
    buildLlmsFull(sections, SITE_ORIGIN),
  )
  yield* Console.log('Generated /llms-full.txt')
}).pipe(Effect.provide(NodeServices.layer))

NodeRuntime.runMain(program)
