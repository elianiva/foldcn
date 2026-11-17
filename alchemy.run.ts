import * as Alchemy from 'alchemy'
import * as Cloudflare from '@alchemy.run/cloudflare'
import * as Effect from 'effect/Effect'

export type WorkerEnv = Cloudflare.InferEnv<typeof Website>

/**
 * foldcn — the shadcn-style registry site for Foldkit.
 *
 * The site is a static Foldkit app (SSG HTML in `dist/client`) with a Worker
 * in front (`assets.runWorkerFirst`). The Worker owns the `/r/*.json`
 * install contract (served from the compiled registry copied into the static
 * assets) and falls through to the static site for everything else.
 */
const Website = Cloudflare.Website.StaticSite(
  'Website',
  Alchemy.Stack.useSync((stack) => ({
    // `turbo run build` builds the registry first, then the web app (which
    // copies the compiled registry into `dist/client/r` for the Worker).
    command: 'pnpm build',
    main: './packages/web/src/worker.ts',
    outdir: './packages/web/dist/client',
    domain: stack.stage === 'prod' ? 'foldcn.elianiva.com' : undefined,
    assets: {
      runWorkerFirst: true,
    },
  })),
)

export default Alchemy.Stack(
  'Foldcn',
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const website = yield* Website
    return {
      url: website.url,
    }
  }),
)
