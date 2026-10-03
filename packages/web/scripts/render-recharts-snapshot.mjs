// Chart values and snapshot data cross an external input boundary and require runtime narrowing.
/* oxlint-disable anti-slop/no-runtime-typeof */
/** Generate Foldkit examples from the pinned Recharts source snapshot. */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { bundleDisplay } from './recharts-bundle-display.mjs'

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const snapshot = JSON.parse(
  readFileSync(resolve(web, 'scripts/recharts-source-snapshot.json'), 'utf8'),
)
const chartImports = {
  LineChart: 'line-chart',
  AreaChart: 'area-chart',
  BarChart: 'bar-chart',
  ComposedChart: 'composed-chart',
  ScatterChart: 'scatter-chart',
  PieChart: 'pie-chart',
  RadarChart: 'radar-chart',
  RadialBarChart: 'radial-bar-chart',
  Treemap: 'treemap',
  SunburstChart: 'sunburst-chart',
}
const childProps = {
  CartesianGrid: ['horizontal', 'vertical', 'stroke', 'strokeDasharray'],
  XAxis: [
    'dataKey',
    'type',
    'scale',
    'domain',
    'hide',
    'tick',
    'tickCount',
    'ticks',
    'height',
    'width',
    'padding',
    'stroke',
    'unit',
    'label',
  ],
  YAxis: [
    'dataKey',
    'type',
    'domain',
    'hide',
    'tick',
    'tickCount',
    'ticks',
    'niceTicks',
    'width',
    'padding',
    'stroke',
    'unit',
    'label',
    'yAxisId',
    'orientation',
    'mirror',
  ],
  ZAxis: ['dataKey', 'range'],
  Line: [
    'dataKey',
    'name',
    'type',
    'stroke',
    'strokeWidth',
    'strokeDasharray',
    'dot',
    'connectNulls',
    'hide',
    'legendType',
    'yAxisId',
  ],
  Area: [
    'dataKey',
    'data',
    'name',
    'type',
    'stroke',
    'strokeWidth',
    'strokeDasharray',
    'connectNulls',
    'stackId',
    'hide',
    'dot',
    'fill',
    'fillOpacity',
    'yAxisId',
  ],
  Bar: [
    'dataKey',
    'data',
    'name',
    'stroke',
    'fill',
    'stackId',
    'hide',
    'barSize',
    'minPointSize',
    'radius',
    'background',
    'yAxisId',
  ],
  Scatter: ['dataKey', 'data', 'name', 'stroke', 'fill', 'hide', 'shape', 'zDataKey', 'yAxisId'],
  Tooltip: ['defaultIndex'],
  Legend: ['align', 'position', 'wrapperStyle'],
  Brush: ['dataKey', 'height', 'stroke'],
  ReferenceLine: ['x', 'y', 'stroke', 'strokeWidth', 'strokeDasharray', 'label'],
  Pie: [
    'dataKey',
    'data',
    'nameKey',
    'name',
    'cx',
    'cy',
    'innerRadius',
    'outerRadius',
    'startAngle',
    'endAngle',
    'paddingAngle',
    'cornerRadius',
    'fill',
    'stroke',
    'fillOpacity',
    'label',
  ],
  Radar: ['dataKey', 'data', 'name', 'fill', 'stroke', 'fillOpacity'],
  RadialBar: [
    'dataKey',
    'data',
    'name',
    'fill',
    'stroke',
    'background',
    'label',
    'startAngle',
    'endAngle',
    'innerRadius',
    'outerRadius',
  ],
  PolarGrid: [],
  PolarAngleAxis: ['dataKey'],
  PolarRadiusAxis: ['domain', 'angle'],
}
const chartProps = [
  'width',
  'height',
  'responsive',
  'layout',
  'margin',
  'barGap',
  'barCategoryGap',
  'stackOffset',
  'cx',
  'cy',
  'innerRadius',
  'outerRadius',
  'ringPadding',
  'startAngle',
  'endAngle',
  'barSize',
  'padding',
  'nodeInset',
  'nodeGap',
  'aspectRatio',
  'dataKey',
  'nameKey',
]
const expression = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && 'expression' in value
const reference = (value, datasets) =>
  expression(value) && Object.hasOwn(datasets, value.expression) ? value.expression : undefined
const valueCode = (value, datasets) => {
  const name = reference(value, datasets)
  if (name !== undefined) return name
  if (expression(value)) return undefined
  return JSON.stringify(value)
}
const propsCode = (props, allowed, datasets) =>
  allowed.flatMap((key) => {
    if (!Object.hasOwn(props, key)) return []
    if (key === 'tick' && typeof props[key] !== 'boolean') return []
    const value = valueCode(props[key], datasets)
    return value === undefined ? [] : [`${key}: ${value}`]
  })
const dataCode = (datasets, names) => {
  const mock = names.some((name) => datasets[name]?.kind === 'mock')
  const lines = names.map((name) => {
    const dataset = datasets[name]
    return dataset.kind === 'mock'
      ? `const ${name} = generateMockData(${dataset.length}, ${dataset.seed})`
      : `const ${name} = ${JSON.stringify(dataset.value, null, 2)}`
  })
  return { mock, lines }
}
const flatten = (nodes) => nodes.flatMap((node) => [node, ...flatten(node.children)])

/** Returns undefined when source data or the top-level chart cannot be translated safely. */
export const sourceFromSnapshot = ({ family, upstream, title, id }) => {
  const source = snapshot.examples[`${family}/${upstream}`]
  if (source === undefined || source.charts.length === 0) return undefined
  if (family === 'BarChart' && upstream === 'AnimatedBarWidthExample') {
    const code = `/** Source seeded data and monochrome expanding bar shape. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { Bar, BarChart, XAxis, YAxis } from '../../../generated/registry/ui/bar-chart'
import { generateMockData } from '../shared'

const data = generateMockData(15, 5)

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  BarChart({ data, responsive: true, barCategoryGap: 4, children: [
    XAxis({ dataKey: 'label', mirror: true, interval: 1, padding: { right: 30 } }),
    YAxis({ mirror: true, orientation: 'right', padding: { bottom: 30 }, tick: ({ x, y, value }) =>
      h.text([h.Attribute('x', String(x)), h.Attribute('y', String(y)), h.Attribute('fill', '#666'), h.Attribute('font-size', '12'), h.Attribute('text-anchor', 'start'), h.Attribute('transform', 'rotate(90 ' + x + ' ' + y + ')')], [String(value)]) }),
    Bar({ dataKey: 'y', fill: '#000', activeBar: true,
      shape: ({ x, y, width, height, isActive }) => h.rect([
        h.Attribute('x', String(x)), h.Attribute('y', String(y)),
        h.Attribute('width', String(isActive ? width : width * 0.2)),
        h.Attribute('height', String(height)), h.Attribute('fill', '#000'),
        h.Style({ transition: 'width 0.2s ease-out' }),
      ]),
    }),
  ],
    activeIndex: Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => hover.example === '${id}' ? hover.index : null }),
    onActiveIndexChange: (index) => ChartMessage.ChartHovered({ example: '${id}', index }),
    title: 'Animated Bar Width' }, h)
`
    return { code, dataAligned: true }
  }
  if (family === 'BarChart' && upstream === 'ScrollAnimateBarChart') {
    const code = `/** Scroll demonstration layout and seeded series from Recharts. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/bar-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 10)

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div([h.Style({ paddingTop: '50vh' })], [
    BarChart({ data, width: 700, responsive: true, margin: { top: 5, right: 0, left: 0, bottom: 5 }, children: [
      CartesianGrid(), XAxis({ dataKey: 'label' }), YAxis(), Tooltip(), Legend(),
      Bar({ dataKey: 'y', activeBar: true, radius: [10, 10, 0, 0] }),
      Bar({ dataKey: 'x', activeBar: true, radius: [10, 10, 0, 0] }),
    ], activeIndex: Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => hover.example === '${id}' ? hover.index : null }),
      onActiveIndexChange: (index) => ChartMessage.ChartHovered({ example: '${id}', index }), title: 'Animate by Scroll' }, h),
  ])
`
    return { code, dataAligned: true }
  }
  if (family === 'BarChart' && upstream === 'MixBarChart') {
    const code = `/** Source bars and legend focus behavior from Recharts Mix Bar Chart. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/bar-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 823)
const id = '${id}'

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const focused = Option.match(model.chartLegendHover, { onNone: () => null, onSome: (hover) => hover.example === id ? hover.key : null })
  const fill = (key: string, color: string): string => focused === null || focused === key ? color : '#eee'
  return BarChart({ data, responsive: true, width: 700, margin: { top: 20, right: 0, left: 0, bottom: 5 }, children: [
    CartesianGrid(), XAxis({ dataKey: 'label' }), YAxis({ niceTicks: 'snap125' }), Tooltip(), Legend(),
    Bar({ dataKey: 'x', stackId: 'a', stroke: 'none', fill: fill('x', '#8884d8') }),
    Bar({ dataKey: 'y', stackId: 'a', stroke: 'none', fill: fill('y', '#82ca9d') }),
    Bar({ dataKey: 'z', stroke: 'none', fill: fill('z', '#ffc658') }),
  ], onLegendHover: (key) => ChartMessage.ChartLegendHovered({ example: id, key }),
    onLegendClick: (key) => ChartMessage.ChartLegendClicked({ example: id, key }), title: 'Mix Bar Chart' }, h)
}
`
    return { code, dataAligned: true }
  }
  if (family === 'AreaChart' && upstream === 'PreventRightClickExample') {
    const code = `/** Recharts SimpleAreaChart data and context-menu behavior. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Message as ChartMessage } from '../../../message'
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/area-chart'
import { preventRightClickData } from '../shared'

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  h.div([h.OnContextMenu(ChartMessage.ChartHovered({ example: '${id}', index: null }))], [
    AreaChart({ data: preventRightClickData, responsive: true, margin: { top: 20, right: 0, left: 0, bottom: 0 }, children: [
      CartesianGrid(), XAxis({ dataKey: 'label' }), YAxis(), Tooltip(), Area({ dataKey: 'y', type: 'monotone' }),
    ], title: 'Prevent right click menu' }, h),
  ])
`
    return { code, dataAligned: true }
  }
  if (family === 'LineChart' && upstream === 'DynamicZIndexLineChart') {
    const code = `/** Source data, colors, and legend hover order from Recharts. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/line-chart'

const data = ${JSON.stringify(source.datasets.data.value, null, 2)}
const LINE_COLORS = ${JSON.stringify(source.datasets.LINE_COLORS.value, null, 2)}

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const activeKey = Option.match(model.chartLegendHover, { onNone: () => null, onSome: (hover) => hover.example === '${id}' ? hover.key : null })
  return LineChart({ data, responsive: true, margin: { top: 5, right: 0, left: 0, bottom: 5 }, children: [
    CartesianGrid(), XAxis({ dataKey: 'name' }), YAxis(), Tooltip(), Legend(),
    ...Object.entries(LINE_COLORS).map(([key, color]) => Line({ dataKey: key, type: 'monotone', stroke: color, strokeOpacity: activeKey === key ? 0.5 : 1, zIndex: activeKey === key ? 10 : 0 })),
  ], onLegendHover: (key) => ChartMessage.ChartLegendHovered({ example: '${id}', key }), title: 'Dynamic Z-Index Line Chart' }, h)
}
`
    return { code, dataAligned: true }
  }
  if (family === 'LineChart' && upstream === 'HighlightAndZoomLineChart') {
    const code = `/** Source impressions data with drag selection and reset. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/line-chart'

const impressionsData = ${JSON.stringify(source.datasets.impressionsData.value, null, 2)}
const data = impressionsData
const id = '${id}'
const yDomain = (rows: ReadonlyArray<(typeof data)[number]>, key: 'cost' | 'impression', offset: number): [number, number] => {
  const values = rows.map((row) => row[key])
  return [((Math.min(...values) | 0) - offset), ((Math.max(...values) | 0) + offset)]
}

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const range = model.chartZoomRanges[id] ?? [0, data.length - 1]
  const rows = data.slice(range[0], range[1] + 1)
  const hovering = Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => hover.example === id ? hover.index : null })
  const selecting = model.chartSelectionStarts[id]
  const selection = selecting === undefined || hovering === null ? undefined : { fromIndex: selecting - range[0], toIndex: hovering }
  const costDomain = range[0] === 0 && range[1] === data.length - 1 ? [-1, 10] as const : yDomain(rows, 'cost', 1)
  const impressionDomain = range[0] === 0 && range[1] === data.length - 1 ? [30, 519] as const : yDomain(rows, 'impression', 50)
  const xTicks = range[0] === 0 && range[1] === data.length - 1
    ? [1, 6, 11, 16, 20]
    : Array.from(new Set([range[0] + 1, Math.round((range[0] + range[1]) / 2) + 1, range[1] + 1]))
  return h.div([h.Style({ userSelect: 'none' })], [
    h.button([h.Class('mb-1 rounded border px-2 py-0.5 text-xs'), h.OnClick(ChartMessage.ChartZoomReset({ id }))], ['Zoom Out']),
    LineChart({ data: rows, responsive: true, width: 700, margin: { top: 5, right: 0, left: 0, bottom: 5 }, children: [
      CartesianGrid(),
      XAxis({ allowDataOverflow: true, dataKey: 'name', type: 'number', domain: [range[0] + 1, range[1] + 1], ticks: xTicks }),
      YAxis({ yAxisId: '1', type: 'number', domain: costDomain, ticks: range[0] === 0 && range[1] === data.length - 1 ? [-1, 2, 5, 8, 10] : undefined }),
      YAxis({ yAxisId: '2', type: 'number', orientation: 'right', domain: impressionDomain, ticks: range[0] === 0 && range[1] === data.length - 1 ? [30, 180, 330, 480, 519] : undefined }),
      Tooltip(), Line({ yAxisId: '1', type: 'natural', dataKey: 'cost' }), Line({ yAxisId: '2', type: 'natural', dataKey: 'impression' }),
    ], activeIndex: hovering, onActiveIndexChange: (index) => ChartMessage.ChartHovered({ example: id, index }),
      onSelectionStart: (index) => ChartMessage.ChartZoomStarted({ id, index: range[0] + index }),
      onSelectionEnd: (index) => ChartMessage.ChartZoomEnded({ id, index: range[0] + index }),
      selection, title: 'Highlight And Zoom Line Chart' }, h),
  ])
}
`
    return { code, dataAligned: true }
  }
  if (family === 'LineChart' && upstream === 'CompareTwoLines') {
    const code = `/** Portfolio data and initial composition from Recharts Compare Two Lines. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/line-chart'

const data = ${JSON.stringify(source.datasets.data.value, null, 2)}
const domainMin = Math.max(0, 0.75 * Math.min(...data.map((row) => Math.min(row.maxClose ?? 0, row.netDeposits ?? 0))))
const domainMax = 1.25 * Math.max(...data.map((row) => Math.max(row.maxClose ?? 0, row.netDeposits ?? 0)))
const formatUsd = (value: number | string): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format(Number(value)).toUpperCase()

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const activeIndex = Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => hover.example === '${id}' ? hover.index : null })
  const hovering = activeIndex !== null
  return LineChart({ data, responsive: true, height: 300, margin: { left: 6, right: 6 }, children: [
    XAxis({ dataKey: 'date', tick: false }), YAxis({ domain: [domainMin, domainMax], ticks: [domainMin, 350000, domainMax], tickFormatter: formatUsd, orientation: 'right', mirror: true }),
    Tooltip(), ReferenceLine({ x: hovering ? data[activeIndex]?.date : undefined, stroke: '#000aff' }),
    Line({ dataKey: 'netDeposits', name: 'Net deposits', dot: false, stroke: '#8c9699', strokeOpacity: hovering ? 1 : 0 }),
    Line({ dataKey: 'reinvestClose', name: 'Compare value', dot: false, stroke: '#b87965', strokeDasharray: '0.1 4', strokeOpacity: hovering ? 1 : 0 }),
    Line({ dataKey: 'close', name: 'Portfolio value', dot: false, stroke: '#8884d8' }),
  ], activeIndex, onActiveIndexChange: (index) => ChartMessage.ChartHovered({ example: '${id}', index }), title: 'Compare Two Lines' }, h)
}
`
    return { code, dataAligned: true }
  }
  if (
    (family === 'LineChart' && upstream === 'AnimatedTimeSeriesExample') ||
    (family === 'BarChart' && upstream === 'AnimatedBarTimeSeriesExample')
  ) {
    const bar = family === 'BarChart'
    const chartName = bar ? 'BarChart' : 'LineChart'
    const seriesName = bar ? 'Bar' : 'Line'
    const code = `/** Six-row circular window from Recharts' seeded 30-row time series. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Message as ChartMessage } from '../../../message'
import { CartesianGrid, ${seriesName}, ${chartName}, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/${bar ? 'bar-chart' : 'line-chart'}'
import { generateMockData } from '../shared'

const allData = generateMockData(30, 90).map((row, i) => ({ ...row, i }))

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const start = model.chartWindowStarts['${id}'] ?? 0
  const data = Array.from({ length: 6 }, (_, index) => allData[(start + index) % 30]!)
  return h.div([h.Class('space-y-3')], [
    h.button([h.Class('rounded border px-3 py-1'), h.OnClick(ChartMessage.ChartWindowStreamToggled({ id: '${id}' }))], [model.chartStreaming.has('${id}') ? 'Stop streaming' : 'Start streaming']),
    ${chartName}({ data, responsive: true, width: 600, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [
      CartesianGrid(), XAxis(${bar ? '' : "{ dataKey: 'label' }"}), YAxis(), Tooltip(), ${seriesName}({ dataKey: 'y'${bar ? '' : ', strokeWidth: 2'} }),
    ], title: '${title}' }, h),
  ])
}
`
    return { code, dataAligned: true }
  }
  if (family === 'ScatterChart' && upstream === 'ScatterChartPerformance') {
    const code = `/** Recharts performance scatter: seeded generator, 100 series and 10 points each. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from '../../../generated/registry/ui/scatter-chart'

let seed = 42
const between = (min: number, max: number): number => {
  seed = (75 * seed + 74) % 65537
  return Math.round(seed) % (max - min) + min
}
const datasets = Array.from({ length: 100 }, (_, i) => ({
  name: \`line-\${i}\`,
  passed: between(0, 10) > 5,
  points: Array.from({ length: 10 }, () => ({
    x: between(0, 100), y: between(0, 100), z: between(0, 100),
  })),
}))

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  ScatterChart({ responsive: true, width: 700, margin: { top: 20, right: 0, bottom: 0, left: 0 }, children: [
    CartesianGrid(), XAxis({ dataKey: 'x', type: 'number', domain: [0, 99], ticks: [0, 25, 50, 75, 99], unit: 'm' }),
    YAxis({ dataKey: 'y', type: 'number', domain: [0, 100], ticks: [0, 25, 50, 75, 100], unit: 'm' }),
    ZAxis({ dataKey: 'z', range: [0, 100] }), Tooltip(),
    ...datasets.map((line) => Scatter({ dataKey: 'y', data: line.points, fill: line.passed ? '#22c55e' : '#ef4444', name: line.name })),
  ], title: 'Scatter Chart with many points' }, h)
`
    return { code, dataAligned: true }
  }
  if (family === 'TreeMap' && upstream === 'CustomContentTreemap') {
    const code = `/** Recharts custom treemap hierarchy, palette, and node content. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Treemap } from '../../../generated/registry/ui/treemap'

const data = ${JSON.stringify(source.datasets.data.value, null, 2)}
const colors = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D']

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  Treemap({ data, dataKey: 'size', width: 500, height: 375, responsive: true,
    content: ({ x, y, width, height, depth, name }) => {
      const top = depth === 0
      const index = data.findIndex((node) => node.name === name)
      const fill = top ? colors[index] ?? '#8889DD' : 'transparent'
      return h.g([], [
        h.rect([h.Attribute('x', String(x)), h.Attribute('y', String(y)), h.Attribute('width', String(width)), h.Attribute('height', String(height)), h.Attribute('fill', fill), h.Attribute('stroke', 'white'), h.Attribute('stroke-width', top ? '2' : '1')]),
        ...(top ? [
          h.text([h.Attribute('x', String(x + width / 2)), h.Attribute('y', String(y + height / 2 + 7)), h.Attribute('text-anchor', 'middle'), h.Attribute('fill', 'white'), h.Attribute('font-size', '14')], [name]),
          h.text([h.Attribute('x', String(x + 4)), h.Attribute('y', String(y + 18)), h.Attribute('fill', 'white'), h.Attribute('font-size', '16')], [String(index + 1)]),
        ] : []),
      ])
    }, title: 'Custom Content Treemap' }, h)
`
    return { code, dataAligned: true }
  }
  if (family === 'TreeMap' && upstream === 'NestedTreemap') {
    const code = `/** Recharts nested treemap hierarchy and drill-down. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Message as ChartMessage } from '../../../message'
import { Treemap } from '../../../generated/registry/ui/treemap'

const data = ${JSON.stringify(source.datasets.data.value, null, 2)}
const id = '${id}'

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const focusPath = model.chartTreemapPaths[id] ?? []
  return h.div([], [
    ...(focusPath.length > 0 ? [h.button([h.Class('mb-2 rounded border px-3 py-1'), h.OnClick(ChartMessage.ChartTreemapFocused({ id, path: focusPath.slice(0, -1) }))], ['← Back'])] : []),
    Treemap({ data, dataKey: 'size', nameKey: 'name', width: 500, height: 375, responsive: true, aspectRatio: 4 / 3, type: 'nest', focusPath,
      onNodeClick: (path) => ChartMessage.ChartTreemapFocused({ id, path: [...path] }),
      content: ({ x, y, width, height, name }) => h.g([], [
        h.rect([h.Attribute('x', String(x)), h.Attribute('y', String(y)), h.Attribute('width', String(width)), h.Attribute('height', String(height)), h.Attribute('fill', '#82ca9d'), h.Attribute('stroke', '#82ca9d')]),
        ...(width > 32 && height > 20 ? [h.text([h.Attribute('x', String(x + 4)), h.Attribute('y', String(y + 18)), h.Attribute('fill', '#222'), h.Attribute('font-size', '12')], ['›' + name])] : []),
      ]), title: 'Nested Treemap' }, h),
  ])
}
`
    return { code, dataAligned: true }
  }
  if (family === 'TreeMap' && upstream === 'TreemapWithPaddingAndGaps') {
    const code = `/** Recharts treemap palette, inset and gap geometry, and leaf labels. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Treemap } from '../../../generated/registry/ui/treemap'

const data = ${JSON.stringify(source.datasets.data.value, null, 2)}
const colors = ['#8889DD', '#3a6bd6', '#ce6d1d', '#45b622', '#E2CF45']

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  Treemap({ data, dataKey: 'size', nameKey: 'name', width: 500, height: 375, responsive: true, aspectRatio: 4 / 3, nodeInset: 6, nodeGap: 6,
    content: ({ x, y, width, height, depth, topIndex, name, payload }) => {
      const isLeaf = !payload.children || payload.children.length === 0
      return h.g([], [
        h.rect([h.Attribute('x', String(x)), h.Attribute('y', String(y)), h.Attribute('width', String(width)), h.Attribute('height', String(height)), h.Attribute('fill', depth === 0 ? colors[topIndex] ?? '#8889DD' : 'transparent'), h.Attribute('stroke', 'white'), h.Attribute('stroke-width', '1')]),
        ...(isLeaf && width > 36 && height > 18 ? [h.text([h.Attribute('x', String(x + width / 2)), h.Attribute('y', String(y + height / 2 + 4)), h.Attribute('text-anchor', 'middle'), h.Attribute('fill', 'white'), h.Attribute('font-size', '12')], [name])] : []),
      ])
    }, title: 'Treemap with Padding and Gaps' }, h)
`
    return { code, dataAligned: true }
  }
  if (family === 'LineChart' && upstream === 'SynchronizedLineChart') {
    const code = `/** Three synchronized Recharts line and area previews. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { Brush, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/line-chart'
import { Area, AreaChart } from '../../../generated/registry/ui/area-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 2213)
const margin = { top: 10, right: 30, left: 0, bottom: 0 }

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const range = model.chartZoomRanges['${id}'] ?? [0, data.length - 1] as const
  const visibleData = data.slice(range[0], range[1] + 1)
  const activeIndex = Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => hover.example === '${id}' ? hover.index : null })
  const onActiveIndexChange = (index: number | null): Message => ChartMessage.ChartHovered({ example: '${id}', index })
  const common = [CartesianGrid(), XAxis({ dataKey: 'label' }), Tooltip()]
  return h.div([], [
    LineChart({ data: visibleData, width: 700, height: 143, responsive: true, margin, children: [...common, YAxis({ domain: [0, 280], ticks: [0, 70, 140, 210, 280] }), Line({ dataKey: 'x', type: 'monotone' })], activeIndex, onActiveIndexChange, title: 'Synchronized Line Chart: x' }, h),
    LineChart({ data: visibleData, width: 700, height: 143, responsive: true, margin, children: [...common, YAxis({ domain: [0, 800], ticks: [0, 400, 800] }), Line({ dataKey: 'y', type: 'monotone' }), Brush({ stroke: '#666' })], brushRange: range, brushDataLength: data.length, onBrushStart: (edge) => ChartMessage.ChartZoomStarted({ id: '${id}', index: edge === 'start' ? range[1] : range[0] }), onBrushEnd: (index) => ChartMessage.ChartZoomEnded({ id: '${id}', index }), activeIndex, onActiveIndexChange, title: 'Synchronized Line Chart: y' }, h),
    AreaChart({ data: visibleData, width: 700, height: 143, responsive: true, margin, children: [...common, YAxis({ domain: [0, 2000], ticks: [0, 500, 1000, 1500, 2000] }), Area({ dataKey: 'z', type: 'monotone' })], activeIndex, onActiveIndexChange, title: 'Synchronized Line Chart: z' }, h),
  ])
}
`
    return { code, dataAligned: true }
  }
  if (family === 'AreaChart' && upstream === 'SynchronizedAreaChart') {
    const code = `/** Three synchronized Recharts area previews in the source grid. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/area-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 298905)
const margin = { top: 10, right: 0, left: 0, bottom: 0 }

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const activeIndex = Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => hover.example === '${id}' ? hover.index : null })
  const onActiveIndexChange = (index: number | null): Message => ChartMessage.ChartHovered({ example: '${id}', index })
  const common = [CartesianGrid(), XAxis({ dataKey: 'label' }), Tooltip()]
  return h.div([h.Style({ display: 'grid', gridTemplateColumns: '30% 70%', gridTemplateRows: '143px 143px', maxWidth: '700px' })], [
    AreaChart({ data, width: 210, height: 143, responsive: true, margin, children: [...common, YAxis({ domain: [0, 280], ticks: [0, 70, 140, 210, 280] }), Area({ dataKey: 'x', type: 'monotone' })], activeIndex, onActiveIndexChange, title: 'Synchronized Area Chart: x' }, h),
    AreaChart({ data, width: 490, height: 143, responsive: true, margin, children: [...common, YAxis({ domain: [0, 800], ticks: [0, 200, 400, 600, 800] }), Area({ dataKey: 'y', type: 'monotone' })], activeIndex, onActiveIndexChange, title: 'Synchronized Area Chart: y' }, h),
    h.div([h.Style({ gridColumn: '1 / span 2' })], [AreaChart({ data, width: 700, height: 143, responsive: true, margin, children: [...common, YAxis({ domain: [0, 1800], ticks: [0, 450, 900, 1350, 1800] }), Area({ dataKey: 'z', type: 'monotone', strokeWidth: 4, strokeDasharray: '16 16' })], activeIndex, onActiveIndexChange, title: 'Synchronized Area Chart: z' }, h)]),
  ])
}
`
    return { code, dataAligned: true }
  }
  if (family === 'LineChart' && upstream === 'LineChartConnectNulls') {
    const code = `/** Foldkit adaptation of the Recharts Line Chart Connect Nulls example.\n * The source renders the same data once with the gap and once connected. */\nimport type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport type { Message } from '../../../message'\nimport { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/line-chart'\n\nconst data = ${JSON.stringify(source.datasets.data.value, null, 2)}\n\nexport default (_model: Model, h: HtmlBuilder<Message>): Html =>\n  h.div([h.Class('space-y-6')], [\n    LineChart({ data, responsive: true, height: 216, margin: { top: 10, right: 30, left: 0, bottom: 0 }, children: [\n      CartesianGrid(), XAxis({ dataKey: 'name' }), YAxis(), Tooltip(),\n      Line({ dataKey: 'uv', type: 'monotone' }),\n    ], title: 'Line Chart Connect Nulls: gaps' }, h),\n    LineChart({ data, responsive: true, height: 216, margin: { top: 10, right: 30, left: 0, bottom: 0 }, children: [\n      CartesianGrid(), XAxis({ dataKey: 'name' }), YAxis(), Tooltip(),\n      Line({ dataKey: 'uv', type: 'monotone', connectNulls: true }),\n    ], title: 'Line Chart Connect Nulls: connected' }, h),\n  ])\n`
    return { code, dataAligned: true }
  }
  if (family === 'LineChart' && upstream === 'LineChartAxisInterval') {
    const code = `/** Foldkit adaptation of the five Recharts axis interval examples. */\nimport type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport type { Message } from '../../../message'\nimport { CartesianGrid, Line, LineChart, XAxis, YAxis } from '../../../generated/registry/ui/line-chart'\nimport { generateMockData } from '../shared'\n\nconst data = generateMockData(100, 22813)\nconst intervals = ['preserveStart', 'preserveEnd', 'preserveStartEnd', 'equidistantPreserveStart', 1] as const\n\nexport default (_model: Model, h: HtmlBuilder<Message>): Html =>\n  h.div([h.Class('space-y-2'), h.Style({ maxWidth: '500px' })], intervals.map((interval) =>\n    h.div([h.Style({ position: 'relative' })], [\n      LineChart({ data, width: 500, height: 309, responsive: true, margin: { left: 0, right: 0, top: 10 }, children: [\n        CartesianGrid(), XAxis({ dataKey: 'label', interval }), YAxis({ interval }),\n        Line({ dataKey: 'x', type: 'monotone' }), Line({ dataKey: 'y', type: 'monotone' }),\n      ], title: 'Line Chart Axis Interval: ' + interval }, h),\n      h.div([h.Style({ position: 'absolute', left: '35%', bottom: '30px', fontSize: '12px' })], ['interval: ' + interval]),\n    ]),\n  ))\n`
    return { code, dataAligned: true }
  }
  if (family === 'LineChart' && upstream === 'LineChartHasMultiSeries') {
    const code = `/** Foldkit adaptation of the Recharts Line Chart Has Multi Series example. */\nimport type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport type { Message } from '../../../message'\nimport type { Datum } from '../../../generated/registry/ui/line-chart'\nimport { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/line-chart'\n\nconst series = ${JSON.stringify(source.datasets.series.value, null, 2)}\nconst categories = [...new Set(series.flatMap((item) => item.data.map((row) => row.category)))]\nconst data: ReadonlyArray<Datum> = categories.map((category) => {\n  const row: Record<string, number | string> = { category }\n  series.forEach((item, index) => {\n    const value = item.data.find((point) => point.category === category)?.value\n    if (value !== undefined) row[\`series\${index}\`] = value\n  })\n  return row\n})\n\nexport default (_model: Model, h: HtmlBuilder<Message>): Html =>\n  LineChart({ data, responsive: true, children: [\n    CartesianGrid(), XAxis({ dataKey: 'category' }), YAxis(), Tooltip(), Legend(),\n    ...series.map((item, index) => Line({ dataKey: \`series\${index}\`, name: item.name })),\n  ], title: 'Line Chart Has Multi Series' }, h)\n`
    return { code, dataAligned: true }
  }
  if (family === 'LineChart' && upstream === 'SynchronizedDifferentData') {
    const code = `/** Foldkit adaptation of Recharts' Synchronized Charts With Different Data.\n * Each chart keeps its own series, and the weekly hover snaps to a date within two days. */\nimport type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport type { Message } from '../../../message'\nimport { Option } from 'effect'\nimport { Message as ChartMessage } from '../../../message'\nimport { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/line-chart'\n\nconst isoDate = (dayOffset: number): string => new Date(Date.UTC(2024, 0, 1 + dayOffset)).toISOString().slice(0, 10)\nconst dailyData = Array.from({ length: 30 }, (_, i) => ({\n  date: isoDate(i),\n  value: Math.round(50 + 30 * Math.sin(i / 3) + (i % 7) * 2),\n}))\nconst weeklyData = dailyData.filter((_, i) => i % 5 === 0)\nconst margin = { top: 10, right: 30, left: 0, bottom: 0 }\n\nexport default (model: Model, h: HtmlBuilder<Message>): Html =>\n  h.div([h.Class('space-y-6')], [\n    LineChart({ data: dailyData, responsive: true, height: 180, margin, children: [\n      CartesianGrid(), XAxis({ dataKey: 'date' }), YAxis(), Tooltip(),\n      Line({ dataKey: 'value', name: 'Daily reading', type: 'monotone', dot: false }),\n    ], activeIndex: Option.match(model.chartHover, { onNone: () => null, onSome: (hover) =>\n      hover.example === '${id}/daily' ? hover.index : hover.example === '${id}/weekly' && hover.index !== null ? hover.index * 5 : null }),\n    onActiveIndexChange: (index) => ChartMessage.ChartHovered({ example: '${id}/daily', index }), title: 'Daily readings' }, h),\n    LineChart({ data: weeklyData, responsive: true, height: 180, margin, children: [\n      CartesianGrid(), XAxis({ dataKey: 'date' }), YAxis(), Tooltip(),\n      Line({ dataKey: 'value', name: 'Every fifth day', type: 'monotone' }),\n    ], activeIndex: Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => {\n      if (hover.index === null) return null\n      if (hover.example === '${id}/weekly') return hover.index\n      if (hover.example !== '${id}/daily') return null\n      const nearest = Math.round(hover.index / 5)\n      return Math.abs(nearest * 5 - hover.index) <= 2 && nearest < weeklyData.length ? nearest : null\n    } }),\n    onActiveIndexChange: (index) => ChartMessage.ChartHovered({ example: '${id}/weekly', index }), title: 'Every fifth day' }, h),\n  ])\n`
    return { code, dataAligned: true }
  }
  if (family === 'BarChart' && upstream === 'Waterfall') {
    const code = `/** Foldkit adaptation of the Recharts Waterfall example.\n * Range bars follow the source computation; fills match the published chart output. */\nimport type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport type { Message } from '../../../message'\nimport { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/bar-chart'\n\nconst rawData = ${JSON.stringify(source.datasets.rawData.value, null, 2)}\nlet runningTotal = 0\nconst waterfallData = rawData.map((entry) => {\n  const value = entry.value\n  const isTotal = 'isTotal' in entry && entry.isTotal === true\n  const low = isTotal ? Math.min(0, value) : value >= 0 ? runningTotal : runningTotal + value\n  const high = isTotal ? Math.max(0, value) : value >= 0 ? runningTotal + value : runningTotal\n  if (!isTotal) runningTotal += value\n  return { name: entry.name, value, waterfallRange: [low, high] as const }\n})\nconst cells = rawData.map((entry) => ({\n  fill: 'isTotal' in entry && entry.isTotal === true ? '#1565C0' : '#4CAF50',\n}))\n\nexport default (_model: Model, h: HtmlBuilder<Message>): Html =>\n  BarChart({ data: waterfallData, responsive: true, margin: { top: 20, right: 30, bottom: 5, left: 20 }, children: [\n    CartesianGrid({ vertical: false }), XAxis({ dataKey: 'name' }), YAxis(), Tooltip(),\n    Bar({ dataKey: 'waterfallRange', cells }),\n  ], title: 'Waterfall' }, h)\n`
    return { code, dataAligned: true }
  }
  if (family === 'BarChart' && upstream === 'PopulationPyramid') {
    const code = `/** Foldkit adaptation of the Recharts Population Pyramid example.\n * Age groups, counts, and signed percentages follow the source CSV. */\nimport type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport type { Message } from '../../../message'\nimport { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/bar-chart'\n\nconst rawData = ${JSON.stringify(source.datasets.rawData.value, null, 2)}\nconst totalPopulation = rawData.reduce((sum, entry) => sum + entry.male + entry.female, 0)\nconst percentageData = rawData.map((entry) => ({\n  age: entry.age,\n  male: (entry.male / totalPopulation) * -100,\n  female: (entry.female / totalPopulation) * 100,\n}))\nconst formatPercent = (value: number | string): string => \`\${Math.abs(Number(value)).toFixed(1)}%\`\n\nexport default (_model: Model, h: HtmlBuilder<Message>): Html =>\n  BarChart({ data: percentageData, layout: 'vertical', width: 700, height: 504, responsive: true, barCategoryGap: 1, children: [\n    XAxis({ type: 'number', domain: [-10, 10], tickFormatter: formatPercent, label: { value: '% of total population', position: 'insideBottom' } }),\n    YAxis({ type: 'category', dataKey: 'age', interval: 1, label: { value: 'Age group', angle: -90, position: 'insideLeft', offset: 10 } }),\n    Bar({ dataKey: 'female', name: 'Female', stackId: 'age', fill: '#ed7485', radius: [0, 5, 5, 0], label: 'right', labelFormatter: formatPercent }),\n    Bar({ dataKey: 'male', name: 'Male', stackId: 'age', fill: '#6ea1c7', radius: [0, 5, 5, 0], label: 'right', labelFormatter: formatPercent }),\n    Tooltip(), Legend({ position: 'insideTopRight', itemSorter: (a, b) => a === 'Male' ? -1 : b === 'Male' ? 1 : 0 }),\n  ], title: 'Population Pyramid' }, h)\n`
    return { code, dataAligned: true }
  }
  if (family === 'BarChart' && upstream === 'RangedStackedBarChart') {
    const code = `/** Foldkit adaptation of the Recharts Ranged Stacked Bar Chart example. */\nimport type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport type { Message } from '../../../message'\nimport { Bar, BarChart, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/bar-chart'\n\nconst rangedStackedBarData = ${JSON.stringify(source.datasets.rangedStackedBarData.value, null, 2)}\n\nexport default (_model: Model, h: HtmlBuilder<Message>): Html =>\n  BarChart({ data: rangedStackedBarData, responsive: true, margin: { top: 20, right: 20, bottom: 20, left: 20 }, children: [\n    XAxis({ dataKey: 'name' }), YAxis({ domain: [0, 600], ticks: [0, 150, 300, 450, 600] }), Tooltip(),\n    Bar({ dataKey: 'value1', stackId: 'range', fill: '#8884d8', barSize: 50, radius: [0, 0, 25, 25] }),\n    Bar({ dataKey: 'value2', stackId: 'range', fill: '#82ca9d', barSize: 50 }),\n    Bar({ dataKey: 'value3', stackId: 'range', fill: '#ffc658', barSize: 50, radius: [25, 25, 0, 0] }),\n  ], title: 'Ranged Stacked Bar Chart' }, h)\n`
    return { code, dataAligned: true }
  }
  if (family === 'BarChart' && upstream === 'TimelineExample') {
    const code = `/** Foldkit adaptation of the Recharts Timeline example.\n * Range positions and outcome colors match the source data and shape. */\nimport type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport type { Message } from '../../../message'\nimport { Option } from 'effect'\nimport { Message as ChartMessage } from '../../../message'\nimport { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/bar-chart'\n\nconst data = ${JSON.stringify(source.datasets.data.value, null, 2)}\nconst outcomeColor = (outcome: string): string => outcome === 'success' ? 'blue' : outcome === 'error' ? 'red' : 'grey'\nconst cells = data.map((row) => ({ fill: outcomeColor(row.outcome), stroke: outcomeColor(row.outcome) }))\n\nexport default (model: Model, h: HtmlBuilder<Message>): Html =>\n  BarChart({ data, layout: 'vertical', responsive: true, margin: { top: 5, right: 5, bottom: 20, left: 18 }, children: [\n    CartesianGrid({ strokeDasharray: '2 2' }), Tooltip(),\n    XAxis({ type: 'number', height: 50, label: { value: 'Time (s)', position: 'insideBottomRight' } }), YAxis({ type: 'category', dataKey: 'name', label: { value: 'Test run', angle: -90, position: 'insideTopLeft', textAnchor: 'end' } }),\n    Bar({ dataKey: 'firstCycle', stackId: 'a', radius: 25, cells, activeBar: { stroke: 'orange', strokeWidth: 3 } }),\n    Bar({ dataKey: 'secondCycle', stackId: 'a', radius: 25, cells, activeBar: { stroke: 'orange', strokeWidth: 3 } }),\n  ], activeIndex: Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => hover.example === '${id}' ? hover.index : null }),\n  onActiveIndexChange: (index) => ChartMessage.ChartHovered({ example: '${id}', index }), title: 'Timeline' }, h)\n`
    return { code, dataAligned: true }
  }
  if (family === 'BarChart' && upstream === 'BoxPlot') {
    const code = `/** Foldkit adaptation of the Recharts Box Plot example.\n * Quartile boxes, median lines, whiskers, and outliers follow the source data. */\nimport type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport type { Message } from '../../../message'\nimport type { BarShapeProps } from '../../../generated/registry/ui/bar-chart'\nimport { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/bar-chart'\n\nconst data = ${JSON.stringify(source.datasets.data.value, null, 2)}\nconst outliers = ${JSON.stringify(source.datasets.outliers.value, null, 2)}\n\nexport default (_model: Model, h: HtmlBuilder<Message>): Html => {\n  const boxShape = ({ x, y, width, height, payload, fill }: BarShapeProps): Html => {\n    const q1 = Number(payload.q1)\n    const q3 = Number(payload.q3)\n    const median = Number(payload.median)\n    const pxPerValue = height / Math.max(1, q3 - q1)\n    const yAt = (value: number): number => y + (q3 - value) * pxPerValue\n    const center = x + width / 2\n    const matches = outliers.filter((point) => point.category === payload.category)\n    return h.g([], [\n      h.line([h.Attribute('x1', String(center)), h.Attribute('x2', String(center)), h.Attribute('y1', String(yAt(Number(payload.min)))), h.Attribute('y2', String(yAt(Number(payload.max)))), h.Attribute('stroke', '#1f2937')]),\n      h.rect([h.Attribute('x', String(x)), h.Attribute('y', String(y)), h.Attribute('width', String(width)), h.Attribute('height', String(height)), h.Attribute('fill', fill)]),\n      h.line([h.Attribute('x1', String(x)), h.Attribute('x2', String(x + width)), h.Attribute('y1', String(yAt(median))), h.Attribute('y2', String(yAt(median))), h.Attribute('stroke', '#1f2937'), h.Attribute('stroke-width', '2')]),\n      ...matches.map((point) => h.circle([h.Attribute('cx', String(center)), h.Attribute('cy', String(yAt(point.value))), h.Attribute('r', '4'), h.Attribute('fill', '#e11d48')])),\n    ])\n  }\n  return BarChart({ data, responsive: true, children: [\n    XAxis({ dataKey: 'category' }), YAxis({ domain: [0, 60] }), CartesianGrid({ vertical: false }),\n    Bar({ dataKey: (row) => [Number(row.q1), Number(row.q3)], shape: boxShape, barSize: 100 }), Tooltip(),\n  ], title: 'Box Plot' }, h)\n}\n`
    return { code, dataAligned: true }
  }
  if (family === 'BarChart' && upstream === 'CustomShapeBarChart') {
    const code = `/** Data and top-level chart composition come from Recharts; triangle path and per-bar colors follow the source. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import type { BarShapeProps } from '../../../generated/registry/ui/bar-chart'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/bar-chart'

const data = ${JSON.stringify(source.datasets.data.value, null, 2)}
const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'pink', 'black']

export default (_model: Model, h: HtmlBuilder<Message>): Html => {
  const triangle = ({ x, y, width, height, index, isActive }: BarShapeProps): Html => {
    const color = colors[index % colors.length] ?? '#0088FE'
    const d = 'M' + x + ',' + (y + height) + 'C' + (x + width / 3) + ',' + (y + height) + ' ' + (x + width / 2) + ',' + (y + height / 3) + ' ' + (x + width / 2) + ',' + y + ' C' + (x + width / 2) + ',' + (y + height / 3) + ' ' + (x + (2 * width) / 3) + ',' + (y + height) + ' ' + (x + width) + ',' + (y + height) + ' Z'
    return h.path([h.Attribute('d', d), h.Attribute('fill', color), h.Attribute('stroke', color), h.Attribute('stroke-width', isActive ? '5' : '0')])
  }
  return BarChart({ data, responsive: true, margin: { top: 20, right: 0, left: 0, bottom: 5 }, children: [
    CartesianGrid(), Tooltip(), XAxis({ dataKey: 'name' }), YAxis({ width: 'auto' }),
    Bar({ dataKey: 'uv', shape: triangle, activeBar: true }),
  ], title: 'Custom Shape Bar Chart' }, h)
}
`
    return { code, dataAligned: true }
  }
  if (family === 'BarChart' && upstream === 'BarChartWithMultiXAxis') {
    const code = `/** Data and top-level chart composition come from Recharts; the secondary quarter axis follows its tick callback. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/bar-chart'

const data = ${JSON.stringify(source.datasets.data.value, null, 2)}

export default (_model: Model, h: HtmlBuilder<Message>): Html => {
  const quarterTick = ({ x, y, value, band }: { x: number; y: number; value: string | number | ReadonlyArray<number> | null | undefined; index: number; band: number }): Html => {
    const month = new Date(String(value)).getMonth()
    const quarterNo = Math.floor(month / 3) + 1
    if (month % 3 === 1) return h.text([h.Attribute('x', String(x)), h.Attribute('y', String(y)), h.Attribute('text-anchor', 'middle'), h.Attribute('fill', '#333'), h.Attribute('font-size', '12')], ['Q' + quarterNo])
    if (month % 3 === 0 || month === 11) return h.path([h.Attribute('d', 'M' + (month === 11 ? x + band / 2 : x - band / 2) + ',' + (y - 4) + 'v-35'), h.Attribute('stroke', 'red')])
    return h.g([], [])
  }
  return BarChart({ data, responsive: true, margin: { top: 25, right: 0, left: 0, bottom: 5 }, children: [
    CartesianGrid(), XAxis({ dataKey: 'date', tickFormatter: (value) => String(new Date(String(value)).getMonth() + 1) }),
    XAxis({ dataKey: 'date', xAxisId: 'quarter', tick: quarterTick }), YAxis(), Tooltip(), Legend({ wrapperStyle: { paddingTop: '1em', backgroundColor: 'transparent' } }),
    Bar({ dataKey: 'pv' }), Bar({ dataKey: 'uv' }),
  ], title: 'Bar Chart With Multi X Axis' }, h)
}
`
    return { code, dataAligned: true }
  }
  if (
    family === 'PieChart' &&
    (upstream === 'PieChartInFlexbox' || upstream === 'PieChartInGrid')
  ) {
    const grid = upstream === 'PieChartInGrid'
    const label = grid
      ? ['2x2 cell', '1x1 cell', '1x1 cell', '3x1 cell']
      : ['Flex: 1 1 200px', "maxWidth: '300px'", "maxHeight: '20vh'"]
    const boxes = label.map((name, index) => {
      const style = grid
        ? index === 0
          ? "{ gridColumn: '1 / 3', gridRow: '1 / 3', border: '1px solid #ddd' }"
          : index === 3
            ? "{ gridColumn: '1 / 4', gridRow: '3 / 4', border: '1px solid #ddd', margin: '0 auto', aspectRatio: '1', width: '33%' }"
            : `{ gridColumn: '3 / 4', gridRow: '${index} / ${index + 1}', border: '1px solid #ddd' }`
        : index === 0
          ? "{ flex: '1 1 200px' }"
          : index === 1
            ? "{ width: '33%', maxWidth: '300px' }"
            : "{ width: '33%', maxHeight: '20vh' }"
      const size = grid && index === 0 ? 600 : 300
      const height = grid ? size : index === 2 ? 144 : size
      return `    h.div([h.Style(${style})], [PieChart({ data, width: ${size}, height: ${height}, responsive: true, children: [\n      Pie({ dataKey: 'value', nameKey: 'name', innerRadius: '60%', outerRadius: '80%' }),\n      Label({ value: ${JSON.stringify(name)}, position: 'center' }),\n    ], title: ${JSON.stringify(name)} }, h)]),`
    })
    const container = grid
      ? "{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '10px', width: '100%', minHeight: '400px', border: '1px solid #ddd', padding: '10px' }"
      : "{ display: 'flex', flexWrap: 'wrap', width: '100%', minHeight: '300px', border: '1px solid #ddd', padding: '10px', justifyContent: 'space-around', alignItems: 'stretch' }"
    const code = `/** Foldkit adaptation of the Recharts ${title} layout example. */\nimport type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport type { Message } from '../../../message'\nimport { Label, Pie, PieChart } from '../../../generated/registry/ui/pie-chart'\n\nconst data = ${JSON.stringify(source.datasets.data.value, null, 2)}\n\nexport default (_model: Model, h: HtmlBuilder<Message>): Html =>\n  h.div([h.Style(${container})], [\n${boxes.join('\n')}\n  ])\n`
    return { code, dataAligned: true }
  }
  if (family === 'PieChart' && upstream === 'PieChartWithNeedle') {
    const code = `/** Foldkit adaptation of the Recharts Pie Chart With Needle example. */\nimport type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport type { Message } from '../../../message'\nimport { Needle, Pie, PieChart } from '../../../generated/registry/ui/pie-chart'\n\nconst chartData = ${JSON.stringify(source.datasets.chartData.value, null, 2)}\n\nexport default (_model: Model, h: HtmlBuilder<Message>): Html =>\n  h.div([h.Class('flex justify-center')], [\n    PieChart({ width: 210, height: 120, data: chartData, children: [\n      Pie({ dataKey: 'value', startAngle: 180, endAngle: 0, cx: 100, cy: 100, innerRadius: 50, outerRadius: 100, stroke: 'none' }),\n      Needle({ dataKey: 'value', index: 0, color: '#d0d000', baseRadius: 5 }),\n    ], title: 'Pie Chart With Needle' }, h),\n  ])\n`
    return { code, dataAligned: true }
  }
  if (family === 'PieChart' && upstream === 'CustomActiveShapePieChart') {
    const code = `/** Recharts active-sector callout and four-row source data. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { Pie, PieChart, Tooltip } from '../../../generated/registry/ui/pie-chart'

const data = ${JSON.stringify(source.datasets.data.value, null, 2)}

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  PieChart({ data, width: 500, height: 500, responsive: true,
    margin: { top: 50, right: 120, bottom: 0, left: 120 },
    activeIndex: Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => hover.example === '${id}' ? hover.index : null }),
    onActiveIndexChange: (index) => ChartMessage.ChartHovered({ example: '${id}', index }),
    children: [Pie({ dataKey: 'value', innerRadius: '60%', outerRadius: '80%', activeShape: 'callout' }), Tooltip()],
    title: '${title}' }, h)
`
    return { code, dataAligned: true }
  }
  if (family === 'PieChart' && upstream === 'PieChartWithCustomizedLabel') {
    const code = `/** Recharts four-sector colors, percent labels, and hover fading. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { Pie, PieChart } from '../../../generated/registry/ui/pie-chart'

const data = ${JSON.stringify(source.datasets.data.value, null, 2)}

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  PieChart({ data, width: 500, height: 500, responsive: true,
    activeIndex: Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => hover.example === '${id}' ? hover.index : null }),
    onActiveIndexChange: (index) => ChartMessage.ChartHovered({ example: '${id}', index }),
    children: [Pie({ dataKey: 'value', label: 'percent', colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'], stroke: 'none', fillOpacity: 1, fadeOnHover: true })],
    title: '${title}' }, h)
`
    return { code, dataAligned: true }
  }
  if (family === 'PieChart' && upstream === 'PieWithGradient') {
    const code = `/** Recharts Pie Gradient data, four colors, and radial sector fills. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Pie, PieChart, Tooltip } from '../../../generated/registry/ui/pie-chart'
import { gradientPieData } from '../shared'

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  PieChart({ data: gradientPieData, width: 500, height: 500, responsive: true, children: [
    Pie({ dataKey: 'x', innerRadius: '20%', gradientColors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] }),
    Tooltip(),
  ], title: 'Pie Chart with Gradient' }, h)
`
    return { code, dataAligned: true }
  }
  if (family === 'RadialBarChart' && upstream === 'RadialBarChartClickToFocusLegendExample') {
    const code = `/** Data and top-level chart composition come from Recharts; ring colors and click focus follow its custom sector. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { Legend, RadialBar, RadialBarChart } from '../../../generated/registry/ui/radial-bar-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 134)
const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658']

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  RadialBarChart({ data, width: 500, height: 250, responsive: true,
    activeIndex: Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => hover.example === '${id}' ? hover.index : null }),
    onActiveIndexChange: (index) => ChartMessage.ChartHovered({ example: '${id}', index }),
    children: [RadialBar({ dataKey: 'x', name: 'foo', background: true, cornerRadius: 10, stroke: 'none', colors }), Legend({ content: 'text' })],
    title: '${title}' }, h)
`
    return { code, dataAligned: true }
  }
  if (family === 'ScatterChart' && upstream === 'ScatterChartWithCells') {
    const code = `/** Data and top-level chart composition come from Recharts; each source symbol and color is retained. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/scatter-chart'

const data = ${JSON.stringify(source.datasets.data.value, null, 2)}
const COLORS = ${JSON.stringify(source.datasets.COLORS.value)}
const SYMBOLS = ${JSON.stringify(source.datasets.SYMBOLS.value)} as const

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  ScatterChart({ responsive: true, margin: { top: 20, right: 0, bottom: 0, left: 0 }, children: [
    CartesianGrid(), XAxis({ dataKey: 'x', type: 'number', unit: 'cm' }), YAxis({ dataKey: 'y', type: 'number', unit: 'kg' }), Tooltip(),
    Scatter({ dataKey: 'y', data, name: 'A school', symbols: SYMBOLS, symbolColors: COLORS, symbolSize: 300 }),
  ], title: 'Scatter Chart With Cells' }, h)
`
    return { code, dataAligned: true }
  }
  if (family === 'ScatterChart' && upstream === 'ScatterChartWithLabels') {
    const code = `/** Data and top-level chart composition come from Recharts; bubble area and labels use its source props. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from '../../../generated/registry/ui/scatter-chart'

const data = ${JSON.stringify(source.datasets.data.value, null, 2)}

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  ScatterChart({ responsive: true, margin: { top: 20, right: 0, bottom: 0, left: 0 }, children: [
    CartesianGrid(), XAxis({ dataKey: 'x', type: 'number', unit: 'cm' }), YAxis({ dataKey: 'y', type: 'number', unit: 'kg' }), Tooltip(),
    Scatter({ dataKey: 'x', data, name: 'A school', labelDataKey: 'x', activeShape: { fill: 'green' } }),
    ZAxis({ dataKey: 'z', range: [900, 4000] }),
  ], activeIndex: Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => hover.example === '${id}' ? hover.index : null }),
  onActiveIndexChange: (index) => ChartMessage.ChartHovered({ example: '${id}', index }), title: 'Scatter Chart With Labels' }, h)
`
    return { code, dataAligned: true }
  }
  if (family === 'ScatterChart' && upstream === 'JointLineScatterChart') {
    const code = `/** Data and top-level chart composition come from Recharts; joined scatter lines and symbols follow its source. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { CartesianGrid, Legend, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from '../../../generated/registry/ui/scatter-chart'

const data01 = ${JSON.stringify(source.datasets.data01.value, null, 2)}
const data02 = ${JSON.stringify(source.datasets.data02.value, null, 2)}

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  ScatterChart({ responsive: true, margin: { top: 20, right: 0, bottom: 0, left: 0 }, children: [
    CartesianGrid(), XAxis({ dataKey: 'x', type: 'number', unit: 'cm' }), YAxis({ dataKey: 'y', type: 'number', unit: 'kg' }), ZAxis({ range: [100, 100] }), Tooltip(), Legend(),
    Scatter({ dataKey: 'x', data: data01, name: 'A school', line: true, shape: 'cross' }),
    Scatter({ dataKey: 'y', data: data02, name: 'B school', line: true, lineJointType: 'monotone', shape: 'diamond' }),
  ], title: 'Joint Line Scatter Chart' }, h)
`
    return { code, dataAligned: true }
  }
  if (family === 'ScatterChart' && upstream === 'BubbleChart') {
    const code = `/** The seven-day Bubble Chart composition and both hourly datasets from Recharts. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from '../../../generated/registry/ui/scatter-chart'

const data01 = ${JSON.stringify(source.datasets.data01.value, null, 2)}
const data02 = ${JSON.stringify(source.datasets.data02.value, null, 2)}
const sunday = data01.map((row, hourIndex) => ({ ...row, hourIndex }))
const monday = data02.map((row, hourIndex) => ({ ...row, hourIndex }))
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
const hours = data01.map((row) => row.hour)
const dayChart = (data: typeof sunday, title: string, h: HtmlBuilder<Message>): Html =>
  ScatterChart({ width: 900, height: 60, responsive: true, margin: { top: 10, right: 4, bottom: 5, left: 4 }, children: [
    XAxis({ type: 'number', dataKey: 'hourIndex', tick: false, domain: [0, 23] }),
    YAxis({ type: 'number', dataKey: 'index', hide: true, domain: [0, 2] }),
    ZAxis({ dataKey: 'value', range: [16, 225] }),
    Tooltip(), Scatter({ dataKey: 'value', data, fill: '#8884d8' }),
  ], title }, h)

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  h.div([h.Class('space-y-0')], [
    ...days.map((day, index) => h.div([h.Class('flex items-center')], [
      h.span([h.Style({ flex: '0 0 80px', fontSize: '12px', textAlign: 'right', paddingRight: '8px' })], [day]),
      h.div([h.Style({ flex: '1', minWidth: '0' })], [dayChart(index % 2 === 0 ? sunday : monday, day, h)]),
    ])),
    h.div([h.Style({ display: 'grid', gridTemplateColumns: 'repeat(24, minmax(0, 1fr))', marginLeft: '80px', fontSize: '10px' })],
      hours.map((hour) => h.span([h.Style({ textAlign: 'center' })], [hour]))),
  ])
`
    return { code, dataAligned: true }
  }
  if (
    (family === 'TreeMap' && upstream === 'BundleSizeTreemap') ||
    (family === 'SunburstChart' && upstream === 'BundleSizeSunburst')
  ) {
    const treemap = family === 'TreeMap'
    const { entry, data } = bundleDisplay(treemap ? 'treemap' : 'sunburst')
    const summary = `h.div([h.Class('grid gap-3 sm:grid-cols-3')], [\n    h.div([h.Class('rounded-lg border p-3'), h.Style({ overflowWrap: 'anywhere' })], ['Measured entry: ${entry.examplePath}']),\n    h.div([h.Class('rounded-lg border p-3')], ['Tree-shaken total: ${entry.totalSizeLabel}']),\n    h.div([h.Class('rounded-lg border p-3')], ['Minified + gzip: ${entry.stages.find((stage) => stage.stage === 'minified+gzip')?.humanReadableSize ?? 'n/a'}']),\n  ])`
    const content = treemap
      ? `const humanSize = (bytes: number): string => bytes < 1024 ? \`\${bytes} B\` : \`\${(bytes / 1024).toFixed(2)} KB\`\nconst content = ({ x, y, width, height, depth, name, value, fill }: TreemapContentProps): Html => {\n  if (width <= 1 || height <= 1) return h.g([], [])\n  const attributes = (values: Record<string, string>) => Object.entries(values).map(([key, val]) => h.Attribute(key, val))\n  return h.g([], [\n    h.rect(attributes({ x: String(x), y: String(y), width: String(width), height: String(height), fill, stroke: '#fff', 'stroke-width': depth === 0 ? '2' : '1', rx: '4' })),\n    ...(width > 72 && height > 26 ? [h.text(attributes({ x: String(x + 8), y: String(y + 18), fill: '#fff', 'font-size': depth === 0 ? '15' : '12', 'font-weight': depth === 0 ? '700' : '500' }), [name])] : []),\n    ...(width > 112 && height > 42 ? [h.text(attributes({ x: String(x + 8), y: String(y + 34), fill: '#fff', 'font-size': '11' }), [humanSize(value)])] : []),\n  ])\n}\n`
      : ''
    const chartCall = treemap
      ? "Treemap({ data, width: 720, height: 540, responsive: true, dataKey: 'value', nameKey: 'name', aspectRatio: 4 / 3, content, type: 'nest', focusPath: model.treemapPath, onNodeClick: (path) => ChartMessage.TreemapFocused({ path: [...path] }), title: 'Bundle Size Treemap' }, h)"
      : "SunburstChart({ data, width: 720, height: 420, responsive: true, dataKey: 'value', nameKey: 'name', innerRadius: 65, outerRadius: 190, textOptions: { fill: 'none' }, title: 'Bundle Size Sunburst' }, h)"
    const code = `/** Foldkit adaptation of the Recharts ${title} example.\n * Data is captured from the official generated bundle-size asset. */\nimport type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport type { Message } from '../../../message'\n${treemap ? "import { Message as ChartMessage } from '../../../message'\nimport type { TreemapContentProps } from '../../../generated/registry/ui/treemap'\nimport { Treemap } from '../../../generated/registry/ui/treemap'" : "import { SunburstChart } from '../../../generated/registry/ui/sunburst-chart'"}\n\nconst data = ${JSON.stringify(data, null, 2)}\n\nexport default (model: Model, h: HtmlBuilder<Message>): Html => {\n  ${content}  return h.div([h.Class('space-y-4')], [\n    ${summary},\n    ${treemap ? "...(model.treemapPath.length > 0 ? [h.button([h.OnClick(ChartMessage.TreemapFocused({ path: model.treemapPath.slice(0, -1) })), h.Class('rounded border px-3 py-1')], ['← Back'])] : [])," : ''}\n    ${chartCall},\n  ])\n}\n`
    return { code, dataAligned: true }
  }
  if (family === 'AreaChart' && upstream === 'AreaChartFillByValue') {
    const code = `/** Recharts' split-color area, with the source data and a zero-aligned SVG gradient. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/area-chart'

const data = ${JSON.stringify(source.datasets.data.value, null, 2)}
const zeroRatio = (396 - (2000 / 8000) * (396 - 10)) / 433

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  AreaChart({ data, responsive: true, margin: { top: 10, right: 0, left: 0, bottom: 0 }, defs: [
    h.defs([], [h.linearGradient([
      h.Attribute('id', 'splitColor'), h.Attribute('x1', '0'), h.Attribute('x2', '0'),
      h.Attribute('y1', '0'), h.Attribute('y2', '433'), h.Attribute('gradientUnits', 'userSpaceOnUse'),
    ], [
      h.stop([h.Attribute('offset', '0'), h.Attribute('stop-color', 'green'), h.Attribute('stop-opacity', '1')]),
      h.stop([h.Attribute('offset', String(zeroRatio)), h.Attribute('stop-color', 'green'), h.Attribute('stop-opacity', '0.1')]),
      h.stop([h.Attribute('offset', String(zeroRatio)), h.Attribute('stop-color', 'red'), h.Attribute('stop-opacity', '0.1')]),
      h.stop([h.Attribute('offset', '1'), h.Attribute('stop-color', 'red'), h.Attribute('stop-opacity', '1')]),
    ])]),
  ], children: [
    CartesianGrid(), XAxis({ dataKey: 'name' }), YAxis({ domain: [-2000, 6000] }), Tooltip(),
    Area({ dataKey: 'uv', type: 'monotone', stroke: '#000', fill: 'url(#splitColor)' }),
  ], activeIndex: Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => hover.example === '${id}' ? hover.index : null }),
  onActiveIndexChange: (index) => ChartMessage.ChartHovered({ example: '${id}', index }), title: 'Area Chart Fill By Value' }, h)
`
    return { code, dataAligned: true }
  }
  if (family === 'LineChart' && upstream === 'LineChartNegativeValuesWithReferenceLines') {
    const code = `/** Recharts negative-value line with axes crossing at the zero reference lines. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from '../../../generated/registry/ui/line-chart'

const data = ${JSON.stringify(source.datasets.data.value, null, 2)}

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  LineChart({ data, responsive: true, margin: { top: 5, right: 0, left: 0, bottom: 5 }, children: [
    CartesianGrid(),
    YAxis({ dataKey: 'y', type: 'number', domain: [-200, 600], tickCount: 5, strokeWidth: 0, label: { value: 'y', angle: -90, position: 'left', textAnchor: 'middle' } }),
    XAxis({ dataKey: 'x', type: 'number', domain: [-200, 600], tickCount: 5, strokeWidth: 0, label: { value: 'x', position: 'bottom' } }),
    ReferenceLine({ y: 0, stroke: '#666', strokeWidth: 1.5, strokeOpacity: 0.65 }),
    ReferenceLine({ x: 0, stroke: '#666', strokeWidth: 1.5, strokeOpacity: 0.65 }),
    Line({ dataKey: 'y', type: 'monotone', strokeWidth: 2, dot: false }),
  ], title: 'Line Chart Negative Values With Reference Lines' }, h)
`
    return { code, dataAligned: true }
  }
  if (family === 'BarChart' && upstream === 'BarChartWithCustomizedEvent') {
    const code = `/** Recharts' per-rectangle click example with independent opacity state. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Message as ChartMessage } from '../../../message'
import type { BarShapeProps } from '../../../generated/registry/ui/bar-chart'
import { Bar, BarChart } from '../../../generated/registry/ui/bar-chart'

const data = ${JSON.stringify(source.datasets.data.value, null, 2)}

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const shape = ({ x, y, width, height, index, fill }: BarShapeProps): Html =>
    h.rect([
      h.Attribute('x', String(x)), h.Attribute('y', String(y)),
      h.Attribute('width', String(width)), h.Attribute('height', String(height)),
      h.Attribute('fill', fill),
      h.Attribute('fill-opacity', model.chartActiveBars.has('${id}:' + index) ? '1' : '0.5'),
      h.Style({ cursor: 'pointer' }),
      h.OnClick(ChartMessage.ChartBarToggled({ id: '${id}', index })),
    ])
  return h.div([], [
    h.p([], ['Click each rectangle']),
    BarChart({ data, width: 700, height: 216, responsive: true, children: [Bar({ dataKey: 'uv', barSize: 80, shape })], title: 'Bar Chart With Customized Event' }, h),
  ])
}
`
    return { code, dataAligned: true }
  }
  const stateful = {
    'LineChart/LineChartCustomShapeExample': ['data1', 'data2'],
    'AreaChart/AreaChartCustomAnimation': ['dataA', 'dataB'],
    'AreaChart/RangeAreaChartCustomAnimation': ['dataA', 'dataB'],
    'ScatterChart/CustomAnimation': ['dataA', 'dataB'],
    'RadarChart/RangeRadarChartCustomAnimation': ['dataA', 'dataB'],
  }[`${family}/${upstream}`]
  if (stateful !== undefined) {
    const declarations = dataCode(source.datasets, stateful)
    const common = {
      'LineChart/LineChartCustomShapeExample': [
        "import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/line-chart'",
        "LineChart({ data: chartData, responsive: true, margin: { top: 10, right: 30, left: 0, bottom: 0 }, children: [CartesianGrid(), XAxis({ dataKey: 'label' }), YAxis(), Tooltip(), Line({ dataKey: 'y', type: 'monotone', strokeWidth: 3, animationKind: 'opacity', animationDuration: 500 })], title: 'Line that animates opacity' }, h)",
      ],
      'AreaChart/AreaChartCustomAnimation': [
        "import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/area-chart'",
        "AreaChart({ data: chartData, responsive: true, margin: { top: 10, right: 0, left: 0, bottom: 0 }, defs: [h.defs([], [h.linearGradient([h.Attribute('id', 'colorUv'), h.Attribute('x1', '0'), h.Attribute('y1', '0'), h.Attribute('x2', '0'), h.Attribute('y2', '1')], [h.stop([h.Attribute('offset', '5%'), h.Attribute('stop-color', '#8884d8'), h.Attribute('stop-opacity', '0.8')]), h.stop([h.Attribute('offset', '95%'), h.Attribute('stop-color', '#8884d8'), h.Attribute('stop-opacity', '0')])])])], children: [CartesianGrid(), XAxis({ dataKey: 'name' }), YAxis(), Tooltip(), Area({ dataKey: 'uv', type: 'monotone', stroke: '#8884d8', fill: 'url(#colorUv)', fillOpacity: 1 })], title: 'Custom Animation Example' }, h)",
      ],
      'AreaChart/RangeAreaChartCustomAnimation': [
        "import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/area-chart'",
        "AreaChart({ data: chartData, responsive: true, margin: { top: 10, right: 16, left: 0, bottom: 0 }, defs: [h.defs([], ([['rangeFill', '#8884d8'], ['doubleRangeFill', '#84d888']] as const).map(([id, color]) => h.linearGradient([h.Attribute('id', id), h.Attribute('x1', '0'), h.Attribute('y1', '0'), h.Attribute('x2', '0'), h.Attribute('y2', '1')], [h.stop([h.Attribute('offset', '5%'), h.Attribute('stop-color', color), h.Attribute('stop-opacity', '0.45')]), h.stop([h.Attribute('offset', '95%'), h.Attribute('stop-color', color), h.Attribute('stop-opacity', '0.1')])])))], children: [CartesianGrid(), XAxis({ dataKey: 'name' }), YAxis({ domain: [0, 10000], ticks: [0, 2500, 5000, 7500, 10000] }), Tooltip(), Area({ dataKey: 'range', type: 'linear', stroke: '#8884d8', strokeWidth: 2, fill: 'url(#rangeFill)', fillOpacity: 1 }), Area({ dataKey: 'doubleRange', type: 'linear', stroke: '#84d888', strokeWidth: 2, fill: 'url(#doubleRangeFill)', fillOpacity: 1, baseValue: 'dataMax' })], title: 'Range Area Custom Animation' }, h)",
      ],
      'ScatterChart/CustomAnimation': [
        "import { CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from '../../../generated/registry/ui/scatter-chart'",
        "ScatterChart({ responsive: true, width: 600, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [CartesianGrid(), XAxis({ dataKey: 'x', type: 'number' }), YAxis({ dataKey: 'y', type: 'number' }), ZAxis({ dataKey: 'z', range: [1, 1000] }), Tooltip(), Scatter({ dataKey: 'x', data: chartData, name: 'Data', fillOpacity: 0.85 })], title: 'Custom Animation Scatter' }, h)",
      ],
      'RadarChart/RangeRadarChartCustomAnimation': [
        "import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Tooltip } from '../../../generated/registry/ui/radar-chart'",
        "RadarChart({ data: chartData, responsive: true, width: 560, height: 560, children: [PolarGrid(), PolarAngleAxis({ dataKey: 'subject' }), PolarRadiusAxis({ domain: [0, 150], ticks: [0, 40, 80, 120, 150] }), Tooltip(), Legend(), Radar({ dataKey: 'range', name: 'Range', fillOpacity: 0.35 })], title: 'Range Radar Custom Animation' }, h)",
      ],
    }[`${family}/${upstream}`]
    const [imports, view] = common
    const rows =
      upstream === 'RangeAreaChartCustomAnimation'
        ? `const chartData = (model.chartDatasetB.has('${id}') ? ${stateful[1]} : ${stateful[0]}).map((row) => ({ ...row, doubleRange: (row.range[1] ?? 0) * 2 }))`
        : `const chartData = model.chartDatasetB.has('${id}') ? ${stateful[1]} : ${stateful[0]}`
    const code = `/** Foldkit adaptation of ${title} from the Recharts source datasets.\n * Dataset swapping is supported; custom animation interpolation is still being ported. */\nimport type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport type { Message } from '../../../message'\nimport { Message as ChartMessage } from '../../../message'\n${imports}\n${declarations.mock ? "import { generateMockData } from '../shared'\n" : ''}\n${declarations.lines.join('\n\n')}\n\nexport default (model: Model, h: HtmlBuilder<Message>): Html => {\n  ${rows}\n  return h.div([h.Class('space-y-3')], [\n    h.button([h.Class('rounded border px-3 py-1'), h.OnClick(ChartMessage.ChartDatasetSwapped({ id: '${id}' }))], ['⇄ Swap dataset']),\n    ${view},\n  ])\n}\n`
    return { code, dataAligned: true }
  }
  const brushBarExample = family === 'BarChart' && upstream === 'BrushBarChart'
  const dataNames = new Set()
  const imports = new Map()
  const chartCodes = []
  let requiresHover = false
  const escapedTitle = title.replaceAll("'", "\\'")
  for (const chart of source.charts) {
    const chartName = chart.tag === 'TreeMap' ? 'Treemap' : chart.tag
    if (chartImports[chartName] === undefined) return undefined
    const children = chart.children.filter((child) => Object.hasOwn(childProps, child.tag))
    const renderable = children.filter((child) =>
      ['Line', 'Area', 'Bar', 'Scatter', 'Pie', 'Radar', 'RadialBar'].includes(child.tag),
    )
    if (chartName !== 'Treemap' && chartName !== 'SunburstChart' && renderable.length === 0)
      return undefined
    if (
      renderable.some(
        (child) =>
          child.tag !== 'Scatter' && valueCode(child.props.dataKey, source.datasets) === undefined,
      )
    )
      return undefined
    const rootData = reference(chart.props.data, source.datasets)
    if (rootData !== undefined) dataNames.add(rootData)
    if (chart.props.data !== undefined && rootData === undefined) return undefined
    for (const child of flatten(children)) {
      if (child.props.data === undefined) continue
      const name = reference(child.props.data, source.datasets)
      if (name === undefined) return undefined
      dataNames.add(name)
    }
    if (dataNames.size === 0) return undefined
    const chartArgs = propsCode(chart.props, chartProps, source.datasets)
    if (
      (family === 'LineChart' && upstream === 'LineChartConnectNulls') ||
      (family === 'AreaChart' && upstream === 'AreaChartConnectNulls')
    ) {
      chartArgs.push('height: 216')
    }
    if (
      (family === 'LineChart' &&
        ['VerticalLineChart', 'VerticalLineChartWithSpecifiedDomain'].includes(upstream)) ||
      (family === 'ComposedChart' && upstream === 'VerticalComposedChart')
    ) {
      if (chart.props.layout !== 'vertical') chartArgs.push("layout: 'vertical'")
      chartArgs.push('width: 300', 'height: 485')
    }
    if (family === 'SunburstChart' && upstream === 'SunburstChartExample') {
      chartArgs.push('width: 700', 'height: 450', 'responsive: true')
    }
    if (
      chartName === 'PieChart' &&
      typeof chart.props.style?.aspectRatio === 'number' &&
      chart.props.height === undefined
    ) {
      chartArgs.push(`height: ${Math.round(500 / chart.props.style.aspectRatio)}`)
    }
    if (rootData !== undefined)
      chartArgs.unshift(`data: ${brushBarExample ? 'visibleData' : rootData}`)
    else if (chartName === 'LineChart' && dataNames.size === 1)
      chartArgs.unshift(`data: ${[...dataNames][0]}`)
    else if (chartName === 'Treemap' || chartName === 'SunburstChart') return undefined
    const usedChildren = children.map((child) => {
      const args = propsCode(child.props, childProps[child.tag], source.datasets)
      if (family === 'AreaChart' && upstream === 'PercentAreaChart' && child.tag === 'YAxis')
        args.push('tickFormatter: (value) => `${Math.round(Number(value) * 100)}%`')
      if (
        family === 'ComposedChart' &&
        upstream === 'ComposedChartWithAxisLabels' &&
        child.tag === 'YAxis'
      )
        args.push('domain: [0, 1800]')
      if (
        family === 'ComposedChart' &&
        upstream === 'SameDataComposedChart' &&
        child.tag === 'YAxis'
      )
        args.push('domain: [0, 1600]', 'ticks: [0, 400, 800, 1200, 1600]')
      if (family === 'AreaChart' && upstream === 'AreaChartRangeExample' && child.tag === 'YAxis')
        args.push('domain: [-6, 18]', 'ticks: [-6, 0, 6, 12, 18]')
      if (family === 'AreaChart' && upstream === 'CardinalAreaChart' && child.tag === 'YAxis')
        args.push('domain: [0, 280]', 'ticks: [0, 70, 140, 210, 280]')
      if (
        family === 'AreaChart' &&
        upstream === 'AreaChartWithCustomEvents' &&
        child.tag === 'YAxis'
      )
        args.push('domain: [0, 300]', 'ticks: [0, 75, 150, 225, 300]')
      if (
        family === 'AreaChart' &&
        upstream === 'CardinalAreaChart' &&
        child.tag === 'Area' &&
        child.props.stroke === '#82ca9d'
      )
        args.push("type: 'cardinal'", 'curveTension: 0.8')
      if (
        family === 'BarChart' &&
        upstream === 'PositiveAndNegativeBarChart' &&
        child.tag === 'YAxis'
      )
        args.push(
          'domain: [-10000, 10000]',
          'ticks: [-10000, -5000, 0, 5000, 10000]',
          "tick: ({ x, y, value }) => h.text([h.Attribute('x', String(x)), h.Attribute('y', String(y)), h.Attribute('fill', Number(value) < 0 ? 'red' : Number(value) > 0 ? 'green' : 'black'), h.Attribute('font-weight', Number(value) === 0 ? 'bold' : 'normal'), h.Attribute('text-anchor', 'end'), h.Attribute('font-size', '12')], [String(value)])",
        )
      if (family === 'BarChart' && upstream === 'BarChartWithMinHeight' && child.tag === 'YAxis')
        args.push('domain: [0, 6000]', 'ticks: [0, 1500, 3000, 4500, 6000]')
      if (family === 'BarChart' && upstream === 'BarChartStackedBySign' && child.tag === 'YAxis')
        args.push('domain: [-12000, 12000]', 'ticks: [-12000, -6000, 0, 6000, 12000]')
      if (family === 'BarChart' && upstream === 'BarChartRangeExample' && child.tag === 'YAxis')
        args.push('domain: [-6, 18]', 'ticks: [-6, 0, 6, 12, 18]')
      if (family === 'BarChart' && upstream === 'MixBarChart' && child.tag === 'Bar') {
        const colors = { x: '#8884d8', y: '#82ca9d', z: '#ffc658' }
        args.push(`fill: '${colors[child.props.dataKey]}'`)
      }
      if (
        family === 'BarChart' &&
        upstream === 'StackedBarChartWithHorizontalLine' &&
        child.tag === 'ReferenceLine'
      )
        args.push('y: 18000')
      if (
        family === 'BarChart' &&
        upstream === 'StackedBarChartWithHorizontalLine' &&
        child.tag === 'Bar' &&
        child.props.dataKey === 'data3'
      )
        args.push(
          "shape: ({ x, y, width, height, fill, payload }) => { const label = (Number(payload.data1) + Number(payload.data2) + Number(payload.data3)).toLocaleString(); const cx = x + width / 2; const cy = y - 18; const boxWidth = label.length * 8 + 16; return h.g([], [h.rect([h.Attribute('x', String(x)), h.Attribute('y', String(y)), h.Attribute('width', String(width)), h.Attribute('height', String(height)), h.Attribute('fill', fill), h.Attribute('fill-opacity', '0.8')]), h.rect([h.Attribute('x', String(cx - boxWidth / 2)), h.Attribute('y', String(cy - 11)), h.Attribute('width', String(boxWidth)), h.Attribute('height', '22'), h.Attribute('rx', '6'), h.Attribute('fill', '#fff'), h.Attribute('stroke', '#E2F0CB'), h.Attribute('stroke-width', '1.5')]), h.text([h.Attribute('x', String(cx)), h.Attribute('y', String(cy)), h.Attribute('text-anchor', 'middle'), h.Attribute('dominant-baseline', 'middle'), h.Attribute('font-size', '12'), h.Attribute('fill', '#333')], [label])]) }",
        )
      if (
        family === 'BarChart' &&
        upstream === 'BarChartWithMinHeight' &&
        child.tag === 'Bar' &&
        child.props.dataKey === 'pv'
      )
        args.push(
          "shape: ({ x, y, width, height, fill, payload }) => h.g([], [h.rect([h.Attribute('x', String(x)), h.Attribute('y', String(y)), h.Attribute('width', String(width)), h.Attribute('height', String(height)), h.Attribute('fill', fill), h.Attribute('fill-opacity', '0.8')]), h.circle([h.Attribute('cx', String(x + width / 2)), h.Attribute('cy', String(y - 10)), h.Attribute('r', '10'), h.Attribute('fill', fill)]), h.text([h.Attribute('x', String(x + width / 2)), h.Attribute('y', String(y - 10)), h.Attribute('fill', '#fff'), h.Attribute('text-anchor', 'middle'), h.Attribute('dominant-baseline', 'middle'), h.Attribute('font-size', '12')], [String(payload.name ?? '').split(' ')[1] ?? ''])])",
        )
      if (family === 'ComposedChart' && upstream === 'BandedChart' && child.tag === 'Area')
        args.push("legendType: 'none'")
      if (family === 'ComposedChart' && upstream === 'TargetPriceChart' && child.tag === 'XAxis')
        args.push(
          'tickFormatter: (value) => { const date = new Date(Number(value)); return `${date.getUTCDate()}-${date.getUTCMonth() + 1}-${date.getUTCFullYear()}` }',
        )
      if (family === 'ComposedChart' && upstream === 'TargetPriceChart' && child.tag === 'Tooltip')
        args.push("content: 'none'")
      if (
        family === 'LineChart' &&
        upstream === 'CustomizedDotLineChart' &&
        child.tag === 'Line' &&
        child.props.dataKey === 'x'
      )
        args.push(
          "dot: ({ cx, cy }) => h.g([h.Attribute('transform', `translate(${cx} ${cy})`)], [h.circle([h.Attribute('r', '9'), h.Attribute('fill', 'red')]), h.circle([h.Attribute('cx', '-3'), h.Attribute('cy', '-2'), h.Attribute('r', '1.5'), h.Attribute('fill', 'white')]), h.circle([h.Attribute('cx', '3'), h.Attribute('cy', '-2'), h.Attribute('r', '1.5'), h.Attribute('fill', 'white')]), h.path([h.Attribute('d', 'M -5 5 Q 0 0 5 5'), h.Attribute('fill', 'none'), h.Attribute('stroke', 'white'), h.Attribute('stroke-width', '1.5')])])",
        )
      if (
        family === 'LineChart' &&
        upstream === 'CustomizedLabelLineChart' &&
        child.tag === 'XAxis'
      )
        args.push('tickAngle: -30')
      if (
        family === 'LineChart' &&
        upstream === 'HighlightAndZoomLineChart' &&
        child.tag === 'XAxis'
      )
        args.push('domain: [1, 20]', 'ticks: [1, 6, 11, 16, 20]')
      if (
        family === 'LineChart' &&
        upstream === 'HighlightAndZoomLineChart' &&
        child.tag === 'YAxis' &&
        child.props.yAxisId === '1'
      )
        args.push('domain: [-1, 10]', 'ticks: [-1, 2, 5, 8, 10]')
      if (
        family === 'LineChart' &&
        upstream === 'HighlightAndZoomLineChart' &&
        child.tag === 'YAxis' &&
        child.props.yAxisId === '2'
      )
        args.push('domain: [30, 519]', 'ticks: [30, 180, 330, 480, 519]')
      if (
        family === 'LineChart' &&
        upstream === 'CustomizedLabelLineChart' &&
        child.tag === 'Line' &&
        child.props.dataKey === 'x'
      )
        args.push('label: true')
      if (
        family === 'RadarChart' &&
        upstream === 'SpecifiedDomainRadarChart' &&
        child.tag === 'PolarRadiusAxis'
      ) {
        args.push('ticks: [0, 40, 80, 120, 150]')
      }
      if (child.tag === 'Scatter' && child.props.dataKey === undefined) args.unshift("dataKey: 'y'")
      return `      ${child.tag}(${args.length ? `{ ${args.join(', ')} }` : ''}),`
    })
    if (chartName !== 'Treemap' && chartName !== 'SunburstChart')
      chartArgs.push(`children: [\n${usedChildren.join('\n')}\n    ]`)
    imports.set(chartName, chartImports[chartName])
    if (chartName !== 'Treemap' && chartName !== 'SunburstChart') {
      for (const child of children) imports.set(child.tag, chartImports[chartName])
    }
    if (
      ['LineChart', 'AreaChart', 'BarChart', 'ComposedChart', 'ScatterChart'].includes(chartName)
    ) {
      requiresHover = true
      if (family === 'ComposedChart' && upstream === 'TargetPriceChart')
        chartArgs.push('activeLabels: true')
      chartArgs.push(
        `activeIndex: Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => hover.example === '${id}' ? hover.index : null })`,
      )
      chartArgs.push(
        `onActiveIndexChange: (index) => Message.ChartHovered({ example: '${id}', index })`,
      )
    }
    if (brushBarExample)
      chartArgs.push(
        'brushRange: range',
        'brushDataLength: data.length',
        `onBrushStart: (edge) => ChartMessage.ChartZoomStarted({ id: '${id}', index: edge === 'start' ? range[1] : range[0] })`,
        `onBrushEnd: (index) => ChartMessage.ChartZoomEnded({ id: '${id}', index })`,
      )
    chartArgs.push(`title: '${escapedTitle}'`)
    chartCodes.push(`${chartName}({\n    ${chartArgs.join(',\n    ')}\n  }, h)`)
  }
  const data = dataCode(source.datasets, [...dataNames])
  const importLines = [...new Set(imports.values())].map(
    (path) =>
      `import { ${[...imports]
        .filter(([, value]) => value === path)
        .map(([name]) => name)
        .join(', ')} } from '../../../generated/registry/ui/${path}'`,
  )
  const view =
    chartCodes.length === 1
      ? chartCodes[0]
      : `h.div([h.Class('space-y-6')], [\n    ${chartCodes.join(',\n    ')}\n  ])`
  const renderedView = brushBarExample
    ? `{ const range = model.chartZoomRanges['${id}'] ?? [0, data.length - 1] as const; const visibleData = data.slice(range[0], range[1] + 1); return ${view} }`
    : view
  const code = `/** Foldkit adaptation of ${title} from the pinned Recharts example source.\n * Data and top-level chart composition come from ${source.source ?? `${family}/${upstream}`}. */\nimport type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport type { Message } from '../../../message'\n${requiresHover ? "import { Option } from 'effect'\nimport { Message as ChartMessage } from '../../../message'\n" : ''}${importLines.join('\n')}\n${data.mock ? "import { generateMockData } from '../shared'\n" : ''}\n${data.lines.join('\n\n')}\n\nexport default (model: Model, h: HtmlBuilder<Message>): Html =>\n  ${renderedView}\n`
  return {
    code: code.replaceAll('Message.ChartHovered', 'ChartMessage.ChartHovered'),
    dataAligned: true,
  }
}
