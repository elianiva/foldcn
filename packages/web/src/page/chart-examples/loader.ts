import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../model'
import type { Message } from '../../message'
import firstView0 from './line/simple'
import firstCode0 from './line/simple.ts?raw'
import firstView1 from './area-chart/AreaChartExample'
import firstCode1 from './area-chart/AreaChartExample.ts?raw'
import firstView2 from './bar-chart/SimpleBarChart'
import firstCode2 from './bar-chart/SimpleBarChart.ts?raw'
import firstView3 from './composed-chart/LineBarAreaComposedChart'
import firstCode3 from './composed-chart/LineBarAreaComposedChart.ts?raw'
import firstView4 from './scatter-chart/SimpleScatterChart'
import firstCode4 from './scatter-chart/SimpleScatterChart.ts?raw'
import firstView5 from './pie-chart/TwoLevelPieChart'
import firstCode5 from './pie-chart/TwoLevelPieChart.ts?raw'
import firstView6 from './radar-chart/SimpleRadarChart'
import firstCode6 from './radar-chart/SimpleRadarChart.ts?raw'
import firstView7 from './radial-bar-chart/SimpleRadialBarChart'
import firstCode7 from './radial-bar-chart/SimpleRadialBarChart.ts?raw'
import firstView8 from './treemap/BundleSizeTreemap'
import firstCode8 from './treemap/BundleSizeTreemap.ts?raw'
import firstView9 from './sunburst-chart/BundleSizeSunburst'
import firstCode9 from './sunburst-chart/BundleSizeSunburst.ts?raw'
import firstView10 from './funnel-chart/simple'
import firstCode10 from './funnel-chart/simple.ts?raw'
import firstView11 from './sankey/simple'
import firstCode11 from './sankey/simple.ts?raw'

export type ExampleView = (model: Model, h: HtmlBuilder<Message>) => Html
type ExampleModule = Readonly<{ default: ExampleView }>
const views = import.meta.glob<ExampleModule>('./**/*.ts')
const sources = import.meta.glob<string>('./**/*.ts', { query: '?raw', import: 'default' })
const loaded = new Map<string, Readonly<{ view: ExampleView; code: string }>>([
  ['line/simple', { view: firstView0, code: firstCode0 }],
  ['area-chart/AreaChartExample', { view: firstView1, code: firstCode1 }],
  ['bar-chart/SimpleBarChart', { view: firstView2, code: firstCode2 }],
  ['composed-chart/LineBarAreaComposedChart', { view: firstView3, code: firstCode3 }],
  ['scatter-chart/SimpleScatterChart', { view: firstView4, code: firstCode4 }],
  ['pie-chart/TwoLevelPieChart', { view: firstView5, code: firstCode5 }],
  ['radar-chart/SimpleRadarChart', { view: firstView6, code: firstCode6 }],
  ['radial-bar-chart/SimpleRadialBarChart', { view: firstView7, code: firstCode7 }],
  ['treemap/BundleSizeTreemap', { view: firstView8, code: firstCode8 }],
  ['sunburst-chart/BundleSizeSunburst', { view: firstView9, code: firstCode9 }],
  ['funnel-chart/simple', { view: firstView10, code: firstCode10 }],
  ['sankey/simple', { view: firstView11, code: firstCode11 }],
])

export const loadedExample = (id: string) => loaded.get(id)
export const loadExample = async (id: string): Promise<void> => {
  if (loaded.has(id)) return
  const path = `./${id}.ts`
  const viewLoader = views[path]
  const sourceLoader = sources[path]
  if (viewLoader === undefined || sourceLoader === undefined)
    throw new Error(`Unknown chart example: ${id}`)
  const [module, code] = await Promise.all([viewLoader(), sourceLoader()])
  loaded.set(id, { view: module.default, code })
}
