import { Schema as S, pipe } from 'effect'
import {
  defineRouteUnion,
  literal,
  mapTo,
  oneOf,
  parseUrlWithFallback,
  root,
  schemaSegment,
  slash,
} from 'foldkit/route'

// ROUTES
//   "/"            → Home (category grid)
//   "/docs"         → the components index (the docs landing)
//   "/docs/:name"   → a single registry item
//   anything else  → NotFound

export const AppRoute = defineRouteUnion({
  Home: {},
  Components: {},
  ChartGuide: {},
  Item: { name: S.String },
  NotFound: { path: S.String },
})
export type AppRoute = typeof AppRoute.Type

const homeRouter = pipe(root, mapTo(AppRoute.Home))
const docsRouter = pipe(literal('docs'), mapTo(AppRoute.Components))
const chartGuideRouter = pipe(literal('docs'), slash(literal('charts')), mapTo(AppRoute.ChartGuide))
const itemRouter = pipe(
  literal('docs'),
  slash(schemaSegment('name', S.String)),
  mapTo(AppRoute.Item),
)

// Item before index so `/docs/:name` is not swallowed by the bare
// `/docs` route; both are disjoint, but order keeps intent explicit.
export const routeParser = oneOf(chartGuideRouter, itemRouter, docsRouter, homeRouter)

export const parseRoute = parseUrlWithFallback(routeParser, AppRoute.NotFound)
