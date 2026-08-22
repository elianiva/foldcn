import { Console, Effect, FileSystem } from 'effect'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { NodeRuntime, NodeServices } from '@effect/platform-node'
import { Server } from 'foldkit/experimental'

import type * as ServerEntry from '../src/entry.server'
import {
  buildLlmsFull,
  buildLlmsTxt,
  htmlToMarkdown,
  loadRegistryItems,
  type LlmItem,
} from './markdown'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const PROJECT_DIR = resolve(SCRIPT_DIR, '..')
const CLIENT_DIR = resolve(PROJECT_DIR, 'dist/client')
const SERVER_ENTRY_PATH = resolve(PROJECT_DIR, 'dist/server/entry.server.js')
const SITE_ORIGIN = 'https://foldcn.elianiva.com'

const loadServerEntry: Effect.Effect<typeof ServerEntry> = Effect.promise(
  () => import(pathToFileURL(SERVER_ENTRY_PATH).href),
)

const outputFileFor = (path: string): string => {
  const url = new URL(path, SITE_ORIGIN)
  if (url.origin !== SITE_ORIGIN || url.pathname !== path) {
    throw new Error(`Cannot generate the non-normalized same-origin path "${path}".`)
  }
  return path === '/'
    ? resolve(CLIENT_DIR, 'index.html')
    : resolve(CLIENT_DIR, path.slice(1), 'index.html')
}

// The Markdown sibling sits next to each `index.html` so both the `/path.md`
// URL convention and the Worker's content negotiation can resolve it.
const markdownFileFor = (path: string): string => {
  const url = new URL(path, SITE_ORIGIN)
  if (url.origin !== SITE_ORIGIN || url.pathname !== path) {
    throw new Error(`Cannot generate the non-normalized same-origin path "${path}".`)
  }
  return path === '/' ? resolve(CLIENT_DIR, 'index.md') : resolve(CLIENT_DIR, `${path.slice(1)}.md`)
}

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const template = yield* fs.readFileString(resolve(CLIENT_DIR, 'index.html'))
  const serverEntry = yield* loadServerEntry

  const sections: { path: string; markdown: string }[] = []

  for (const path of serverEntry.prerenderPaths) {
    const result = yield* Effect.promise(() =>
      serverEntry.renderPage(new Request(`${SITE_ORIGIN}${path}`)),
    )
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
    const html = Server.injectIntoTemplate(template, result.application)
    const outputFile = outputFileFor(path)

    yield* fs.makeDirectory(dirname(outputFile), { recursive: true })
    yield* fs.writeFileString(outputFile, html)
    yield* Console.log(`Generated ${path} (${serverEntry.prerenderPaths.length} pages in catalog)`)

    // LLM-friendly Markdown twin of this page.
    const markdown = htmlToMarkdown(result.application.html, SITE_ORIGIN)
    const mdFile = markdownFileFor(path)
    yield* fs.makeDirectory(dirname(mdFile), { recursive: true })
    yield* fs.writeFileString(mdFile, markdown)
    sections.push({ path, markdown })
  }

  // Agent-readable site index, generated from the registry manifest.
  const items: ReadonlyArray<LlmItem> = loadRegistryItems()
  yield* fs.writeFileString(resolve(CLIENT_DIR, 'llms.txt'), buildLlmsTxt(items, SITE_ORIGIN))
  yield* Console.log('Generated /llms.txt')
  yield* fs.writeFileString(resolve(CLIENT_DIR, 'llms-full.txt'), buildLlmsFull(sections, SITE_ORIGIN))
  yield* Console.log('Generated /llms-full.txt')
}).pipe(Effect.provide(NodeServices.layer))

NodeRuntime.runMain(program)
