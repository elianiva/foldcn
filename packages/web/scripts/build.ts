import { randomUUID } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { NodeRuntime, NodeServices } from '@effect/platform-node'
import { Console, Effect, FileSystem } from 'effect'
import type * as PlatformError from 'effect/PlatformError'
import { ChildProcess, ChildProcessSpawner } from 'effect/process'

// One id names this build, and every command below is given that same id, so
// the client bundle and the server bundle of a deployment agree on which
// deployment they are. FOLDKIT_BUILD_ID is compiled into the bundle by
// @foldkit/vite-plugin; Runtime.hydrate compares it before adopting any DOM.
const supplied = process.env.FOLDKIT_BUILD_ID
const buildId = supplied === undefined || supplied === '' ? randomUUID() : supplied

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const WEB_DIR = resolve(SCRIPT_DIR, '..')
const REGISTRY_DIST = resolve(WEB_DIR, '../registry/dist/r')
const CLIENT_DIR = resolve(WEB_DIR, 'dist/client')

/** Recursively copy a directory of files (the built registry JSON). */
const copyDir = (
  fs: FileSystem.FileSystem,
  fromDir: string,
  toDir: string,
): Effect.Effect<void, PlatformError.PlatformError> =>
  Effect.gen(function* () {
    yield* fs.makeDirectory(toDir, { recursive: true })
    for (const entry of yield* fs.readDirectory(fromDir)) {
      const from = resolve(fromDir, entry)
      const to = resolve(toDir, entry)
      if ((yield* fs.stat(from)).type === 'Directory') {
        yield* copyDir(fs, from, to)
      } else {
        yield* fs.copyFile(from, to)
      }
    }
  })

const steps = [
  ['vite', ['build', '--outDir', 'dist/client']],
  ['vite', ['build', '--ssr', 'src/entry.server.ts', '--outDir', 'dist/server']],
  ['tsx', ['scripts/prerender.ts']],
] as const

/** Run an external command with inherited stdio, dying on a non-zero exit. */
const runStep = ([command, args]: (typeof steps)[number]) =>
  Effect.gen(function* () {
    const spawner = yield* ChildProcessSpawner.ChildProcessSpawner
    const exitCode = yield* spawner.exitCode(
      ChildProcess.make(command, [...args], {
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
        extendEnv: true,
        env: { FOLDKIT_BUILD_ID: buildId },
        shell: process.platform === 'win32',
      }),
    )
    if (exitCode !== ChildProcessSpawner.ExitCode(0)) {
      return yield* Effect.die(
        new Error(`${command} ${args.join(' ')} exited with code ${exitCode}`),
      )
    }
  })

const program = Effect.gen(function* () {
  for (const step of steps) {
    yield* runStep(step)
  }

  // The Cloudflare Worker serves `/r/{name}.json` from the static assets (which
  // it reaches through `env.ASSETS`), so the compiled registry must ship inside
  // the client output directory.
  const fs = yield* FileSystem.FileSystem
  if (!(yield* fs.exists(REGISTRY_DIST))) {
    return yield* Effect.die(
      new Error(
        `Registry build output not found at ${REGISTRY_DIST}. Run the registry build first.`,
      ),
    )
  }
  yield* copyDir(fs, REGISTRY_DIST, resolve(CLIENT_DIR, 'r'))
  yield* Console.log(`Copied registry → ${resolve(CLIENT_DIR, 'r')}`)
}).pipe(Effect.provide(NodeServices.layer))

NodeRuntime.runMain(program)
