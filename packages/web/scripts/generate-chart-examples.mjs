/** Rebuild the chart example catalog and source modules from the checked-in Recharts index snapshot. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sourceFromSnapshot } from './render-recharts-snapshot.mjs'

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const root = resolve(web, 'src/page/chart-examples')
const groups = JSON.parse(readFileSync(resolve(web, 'scripts/recharts-examples.json'), 'utf8'))
const slugs = {
  LineChart: 'line-chart',
  AreaChart: 'area-chart',
  BarChart: 'bar-chart',
  ComposedChart: 'composed-chart',
  ScatterChart: 'scatter-chart',
  PieChart: 'pie-chart',
  RadarChart: 'radar-chart',
  RadialBarChart: 'radial-bar-chart',
  TreeMap: 'treemap',
  SunburstChart: 'sunburst-chart',
}
const existingLine = {
  SimpleLineChart: 'simple',
  DashedLineChart: 'dashed',
  VerticalLineChart: 'vertical',
  LineChartConnectNulls: 'connect-nulls',
  LineChartWithReferenceLines: 'reference-lines',
  LineChartHasMultiSeries: 'multi-series',
}
// These first examples track the upstream data and composition by hand.
const authoredExamples = new Set([
  'line/simple',
  'area-chart/AreaChartExample',
  'area-chart/TinyAreaChart',
  'bar-chart/SimpleBarChart',
  'bar-chart/TinyBarChart',
  'bar-chart/Candlestick',
  'line/TinyLineChart',
  'composed-chart/LineBarAreaComposedChart',
  'scatter-chart/SimpleScatterChart',
  'pie-chart/TwoLevelPieChart',
  'radar-chart/SimpleRadarChart',
  'radial-bar-chart/SimpleRadialBarChart',
  'treemap/SimpleTreemap',
  'funnel-chart/simple',
  'sankey/simple',
])
// Only examples whose source data and chart composition were aligned by hand.
// Rendering a family preview alone does not establish visual parity.
const supportedTitles = new Set([
  'Simple Line Chart',
  'Simple Area Chart',
  'Simple Bar Chart',
  'Candlestick',
  'Tiny Area Chart',
  'Tiny Bar Chart',
  'Tiny Line Chart',
  'Line Bar Area Composed Chart',
  'Simple Scatter Chart',
  'Simple Radar Chart',
  'Simple Radial Bar Chart',
  'Two Level Pie Chart',
])
const familyDir = (slug) => (slug === 'line-chart' ? 'line' : slug)
const catalog = {}
const front = `import type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../../model'\nimport { Message } from '../../../message'\n`
const activeState = (id) =>
  `  activeIndex: Option.match(model.chartHover, { onNone: () => null, onSome: (hover) => hover.example === '${id}' ? hover.index : null }),\n  onActiveIndexChange: (index) => Message.ChartHovered({ example: '${id}', index }),\n`
const sourceFor = (slug, id, title, upstream) => {
  const lower = title.toLowerCase()
  const comment = `/** Foldkit adaptation of ${title}${upstream ? ` (Recharts ${upstream})` : ''}.${supportedTitles.has(title) || upstream === undefined ? '' : '\n * Its data, visuals, or interactions are still being aligned with the upstream example.'} */\n`
  if (slug === 'line-chart') {
    const vertical = lower.includes('vertical')
    const dashed = lower.includes('dashed')
    const connect = lower.includes('null')
    const multi = lower.includes('multi') || lower.includes('compare') || lower.includes('biaxial')
    const line1 = `Line({ dataKey: '${lower.includes('negative') ? 'mobile' : 'desktop'}', name: '${lower.includes('negative') ? 'Mobile' : 'Desktop'}', type: 'monotone', stroke: '#2563eb'${dashed ? ", strokeDasharray: '5 4'" : ''}${connect ? ', connectNulls: true' : ''} })`
    const line2 = `Line({ dataKey: 'mobile', name: 'Mobile', type: 'monotone', stroke: '#16a34a' })`
    return `${comment}${front}import { CartesianGrid, Legend, Line, Tooltip, XAxis, YAxis${lower.includes('negative') ? ', ReferenceLine' : ''} } from '../../../generated/registry/ui/line-chart'\nimport { renderExample${lower.includes('negative') ? ', sampleNegativeData' : ''} } from '../shared'\n\nexport default (model: Model, h: HtmlBuilder<Message>): Html =>\n  renderExample('${id}', model, h, {\n    ${lower.includes('negative') ? 'data: sampleNegativeData,\n    ' : ''}${lower.includes('tiny') ? 'width: 300, height: 160, responsive: false,\n    ' : ''}${vertical ? "layout: 'vertical',\n    " : ''}children: [\n      CartesianGrid({ strokeDasharray: '3 3' }),\n      XAxis({ ${vertical ? (lower.includes('domain') ? 'domain: [0, 700]' : '') : lower.includes('padding') ? "dataKey: 'name', padding: { left: 32, right: 32 }" : "dataKey: 'name'"} }),\n      YAxis(${vertical ? "{ dataKey: 'name' }" : ''}),\n      Tooltip(),\n      Legend(),\n      ${lower.includes('negative') ? 'ReferenceLine({ y: 0 }),\n      ' : ''}${line1},\n      ${multi ? `${line2},\n      ` : ''}\n    ],\n  })\n`
  }
  if (['area-chart', 'bar-chart', 'composed-chart', 'scatter-chart'].includes(slug)) {
    const chart = {
      'area-chart': 'AreaChart',
      'bar-chart': 'BarChart',
      'composed-chart': 'ComposedChart',
      'scatter-chart': 'ScatterChart',
    }[slug]
    const vertical =
      lower.includes('vertical') || lower.includes('pyramid') || lower.includes('timeline')
    const stack = lower.includes('stack') ? ", stackId: 'a'" : ''
    const area = `Area({ dataKey: 'desktop', name: 'Desktop', type: '${lower.includes('cardinal') ? 'cardinal' : 'monotone'}', stroke: '#2563eb', fill: '#2563eb', fillOpacity: 0.3${stack}${lower.includes('connect nulls') ? ', connectNulls: true' : ''} })`
    const bar = `Bar({ dataKey: 'desktop', name: 'Desktop', fill: '#2563eb'${stack}${lower.includes('min height') ? ', minPointSize: 20' : ''} })`
    const scatter = `Scatter({ dataKey: 'desktop', name: 'Desktop', fill: '#2563eb' })`
    const series =
      slug === 'area-chart'
        ? [area]
        : slug === 'bar-chart'
          ? [bar]
          : slug === 'scatter-chart'
            ? [scatter]
            : [area, bar, `Line({ dataKey: 'mobile', name: 'Mobile', stroke: '#e11d48' })`]
    if (
      lower.includes('multi') ||
      lower.includes('stack') ||
      lower.includes('mix') ||
      lower.includes('three dim') ||
      lower.includes('positive and negative') ||
      lower.includes('pyramid')
    )
      series.push(
        `${slug === 'area-chart' ? 'Area' : slug === 'scatter-chart' ? 'Scatter' : 'Bar'}({ dataKey: 'mobile', name: 'Mobile', fill: '#16a34a', stroke: '#16a34a'${stack} })`,
      )
    const dataName = lower.includes('connect nulls')
      ? 'sampleDataWithNulls'
      : lower.includes('negative') || lower.includes('pyramid') || lower.includes('by sign')
        ? 'sampleNegativeData'
        : lower.includes('min height')
          ? 'sampleSmallData'
          : 'sampleData'
    const imports = [
      chart,
      ...new Set(
        series.flatMap((entry) =>
          ['Area', 'Bar', 'Scatter', 'Line'].filter((name) => entry.startsWith(`${name}(`)),
        ),
      ),
      'CartesianGrid',
      'XAxis',
      'YAxis',
      'Tooltip',
      'Legend',
      ...(lower.includes('horizontal line') ? ['ReferenceLine'] : []),
    ]
    return `${comment}${front}import { Option } from 'effect'\nimport { ${dataName} } from '../shared'\nimport { ${imports.join(', ')} } from '../../../generated/registry/ui/${slug}'\n\nexport default (model: Model, h: HtmlBuilder<Message>): Html =>\n  ${chart}({\n    data: ${dataName},\n    responsive: ${lower.includes('tiny') ? 'false' : 'true'},\n    title: '${title.replaceAll("'", "\\'")}',\n    ${lower.includes('tiny') ? 'width: 300, height: 160,\n    ' : ''}${vertical ? "layout: 'vertical',\n    " : ''}children: [\n      CartesianGrid({ strokeDasharray: '3 3' }),\n      XAxis(${vertical ? '' : "{ dataKey: 'name' }"}),\n      YAxis(${vertical ? "{ dataKey: 'name' }" : ''}),\n      Tooltip(),\n      Legend(),\n      ${lower.includes('horizontal line') ? 'ReferenceLine({ y: 300, stroke: "#e11d48" }),\n      ' : ''}${series.join(',\n      ')},\n    ],\n${activeState(id)}  }, h)\n`
  }
  if (['pie-chart', 'radar-chart', 'radial-bar-chart'].includes(slug)) {
    const chart = {
      'pie-chart': 'PieChart',
      'radar-chart': 'RadarChart',
      'radial-bar-chart': 'RadialBarChart',
    }[slug]
    const descriptor = {
      'pie-chart': 'Pie',
      'radar-chart': 'Radar',
      'radial-bar-chart': 'RadialBar',
    }[slug]
    const extras =
      slug === 'radar-chart'
        ? `      PolarGrid(),\n      PolarAngleAxis({ dataKey: 'name' }),\n${lower.includes('specified domain') ? '      PolarRadiusAxis({ domain: [0, 100] }),\n' : ''}`
        : ''
    const pieOptions = [
      lower.includes('straight angle') ? 'startAngle: 180, endAngle: 0' : '',
      lower.includes('customized label') ? "nameKey: 'name', label: true" : '',
      lower.includes('gap') ? 'paddingAngle: 3, cornerRadius: 6, innerRadius: 45' : '',
    ]
      .filter(Boolean)
      .join(', ')
    const descriptors =
      lower.includes('two level') && slug === 'pie-chart'
        ? "Pie({ dataKey: 'value', outerRadius: 55 }),\n      Pie({ dataKey: 'value', innerRadius: 65, outerRadius: 110 })"
        : `${descriptor}({ dataKey: 'value'${slug === 'pie-chart' ? '' : ", fill: '#2563eb'"}${pieOptions ? `, ${pieOptions}` : ''} })`
    return `${comment}${front}import { ${chart}, ${descriptor}${slug === 'radar-chart' ? `, PolarGrid, PolarAngleAxis${lower.includes('specified domain') ? ', PolarRadiusAxis' : ''}` : ''} } from '../../../generated/registry/ui/${slug}'\nimport { samplePolarData } from '../shared'\n\nexport default (_model: Model, h: HtmlBuilder<Message>): Html =>\n  ${chart}({\n    data: samplePolarData,\n    responsive: true,\n    title: '${title.replaceAll("'", "\\'")}',\n    children: [\n${extras}      ${descriptors},\n    ],\n  }, h)\n`
  }
  const chart =
    slug === 'treemap'
      ? 'Treemap'
      : slug === 'sunburst-chart'
        ? 'SunburstChart'
        : slug === 'funnel-chart'
          ? 'FunnelChart'
          : 'Sankey'
  if (slug === 'funnel-chart')
    return `${comment}${front}import { FunnelChart, Funnel } from '../../../generated/registry/ui/funnel-chart'\nimport { samplePolarData } from '../shared'\n\nexport default (_model: Model, h: HtmlBuilder<Message>): Html =>\n  FunnelChart({ responsive: true, title: '${title}', children: [Funnel({ data: samplePolarData, dataKey: 'value', nameKey: 'name' })] }, h)\n`
  if (slug === 'sankey')
    return `${comment}${front}import { Sankey } from '../../../generated/registry/ui/sankey'\n\nexport default (_model: Model, h: HtmlBuilder<Message>): Html =>\n  Sankey({ data: { nodes: [{ name: 'Visits' }, { name: 'Signups' }, { name: 'Orders' }], links: [{ source: 0, target: 1, value: 12 }, { source: 1, target: 2, value: 6 }] }, responsive: true, title: '${title}' }, h)\n`
  return `${comment}${front}import { ${chart} } from '../../../generated/registry/ui/${slug}'\nimport { sampleHierarchy } from '../shared'\n\nexport default (_model: Model, h: HtmlBuilder<Message>): Html =>\n  ${chart}({ data: sampleHierarchy, responsive: true, title: '${title.replaceAll("'", "\\'")}' }, h)\n`
}
for (const group of groups) {
  const slug = slugs[group.name]
  if (slug === undefined) continue
  const examples = group.items.map(({ title, upstream }) => {
    const file =
      slug === 'line-chart' && existingLine[upstream] !== undefined
        ? `line/${existingLine[upstream]}`
        : `${familyDir(slug)}/${upstream}`
    const id = file
    const snapshotSource = sourceFromSnapshot({ family: group.name, upstream, title, id })
    if (
      !authoredExamples.has(file) &&
      (snapshotSource !== undefined ||
        !(slug === 'line-chart' && existingLine[upstream] !== undefined))
    ) {
      const path = resolve(root, `${file}.ts`)
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, snapshotSource?.code ?? sourceFor(slug, id, title, upstream))
    }
    const entry = { id, file, title, upstream }
    if (!supportedTitles.has(title))
      entry.adaptation = snapshotSource?.dataAligned
        ? 'Source data is ported. Visual details or interactions may still differ from Recharts.'
        : 'This chart-family preview is still being aligned with the Recharts example in data, visuals, or interactions.'
    return entry
  })
  catalog[slug] = examples
}
for (const [slug, title] of [
  ['funnel-chart', 'Simple Funnel Chart'],
  ['sankey', 'Simple Sankey Diagram'],
]) {
  const file = `${slug}/simple`
  const path = resolve(root, `${file}.ts`)
  mkdirSync(dirname(path), { recursive: true })
  if (!authoredExamples.has(file)) writeFileSync(path, sourceFor(slug, file, title))
  catalog[slug] = [{ id: file, file, title }]
}
writeFileSync(
  resolve(root, 'catalog.ts'),
  `/** Example index captured from https://recharts.github.io/en-US/examples/ .\n * Source modules are Foldkit adaptations, with unsupported upstream behavior labeled. */\nexport type ChartExample = Readonly<{ id: string; file: string; title: string; upstream?: string; adaptation?: string }>\nconst catalog = ${JSON.stringify(catalog, null, 2)} as const satisfies Readonly<Record<string, ReadonlyArray<ChartExample>>>\nexport const EXAMPLES_BY_CHART: ReadonlyMap<string, ReadonlyArray<ChartExample>> = new Map(Object.entries(catalog))\nexport const examplesFor = (chart: string): ReadonlyArray<ChartExample> => EXAMPLES_BY_CHART.get(chart) ?? []\nexport const firstExampleIds: ReadonlySet<string> = new Set(Object.values(catalog).map((examples) => examples[0].id))\n`,
)
const firstFiles = Object.values(catalog)
  .map((examples) => examples[0]?.file)
  .filter(Boolean)
const firstImports = firstFiles
  .flatMap((file, index) => [
    `import firstView${index} from './${file}'`,
    `import firstCode${index} from './${file}.ts?raw'`,
  ])
  .join('\n')
const firstMap = firstFiles
  .map((file, index) => `  ['${file}', { view: firstView${index}, code: firstCode${index} }],`)
  .join('\n')
writeFileSync(
  resolve(root, 'loader.ts'),
  `import type { Html, HtmlBuilder } from 'foldkit/html'\nimport type { Model } from '../../model'\nimport type { Message } from '../../message'\n${firstImports}\n\nexport type ExampleView = (model: Model, h: HtmlBuilder<Message>) => Html\ntype ExampleModule = Readonly<{ default: ExampleView }>\nconst views = import.meta.glob<ExampleModule>('./**/*.ts')\nconst sources = import.meta.glob<string>('./**/*.ts', { query: '?raw', import: 'default' })\nconst loaded = new Map<string, Readonly<{ view: ExampleView; code: string }>>([\n${firstMap}\n])\n\nexport const loadedExample = (id: string) => loaded.get(id)\nexport const loadExample = async (id: string): Promise<void> => {\n  if (loaded.has(id)) return\n  const path = \`./\${id}.ts\`\n  const viewLoader = views[path]\n  const sourceLoader = sources[path]\n  if (viewLoader === undefined || sourceLoader === undefined) throw new Error(\`Unknown chart example: \${id}\`)\n  const [module, code] = await Promise.all([viewLoader(), sourceLoader()])\n  loaded.set(id, { view: module.default, code })\n}\n`,
)
console.log(
  `Generated ${Object.values(catalog).reduce((n, examples) => n + examples.length, 0)} example entries`,
)
