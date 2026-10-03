/**
 * Compare the checked-in examples with the exact upstream revision used by
 * the Recharts example site. Run with:
 *   node packages/web/scripts/audit-recharts-examples.mjs
 *
 * This is a conservative audit: an example is not called visually verified
 * just because it renders or an upstream screenshot exists.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { bundleDisplay } from './recharts-bundle-display.mjs'

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const root = resolve(web, '../..')
const revision = 'a5c9b0c8ccb84c1ea08d1c46617d12fbee9adf6e'
const groups = JSON.parse(readFileSync(resolve(web, 'scripts/recharts-examples.json'), 'utf8'))
const sourceSnapshot = JSON.parse(
  readFileSync(resolve(web, 'scripts/recharts-source-snapshot.json'), 'utf8'),
)
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
const sourceOverrides = {
  'ScatterChart/SimpleScatterChart': 'ScatterChart/ScatterChartExample.tsx',
  'AreaChart/PreventRightClickExample': 'AreaChart/SimpleAreaChart.tsx',
}
const seededData = {
  'LineChart/SimpleLineChart': ['simpleLineData', 6, 26213],
  'LineChart/TinyLineChart': ['tinyLineData', 6, 22123],
  'AreaChart/AreaChartExample': ['simpleAreaData', 6, 598905],
  'AreaChart/TinyAreaChart': ['tinyAreaData', 6, 905],
  'AreaChart/PreventRightClickExample': ['preventRightClickData', 6, 4390435],
  'PieChart/PieWithGradient': ['gradientPieData', 4, 1000],
  'BarChart/SimpleBarChart': ['simpleBarData', 6, 823],
}
const staticData = {
  'LineChart/CompareTwoLines': [['data', 'line/CompareTwoLines.ts', 'data']],
  'LineChart/DynamicZIndexLineChart': [['data', 'line/DynamicZIndexLineChart.ts', 'data']],
  'LineChart/LineChartConnectNulls': [['data', 'line/connect-nulls.ts', 'data']],
  'LineChart/LineChartHasMultiSeries': [['series', 'line/multi-series.ts', 'series']],
  'BarChart/Waterfall': [['rawData', 'bar-chart/Waterfall.ts', 'rawData']],
  'BarChart/RangedStackedBarChart': [
    ['rangedStackedBarData', 'bar-chart/RangedStackedBarChart.ts', 'rangedStackedBarData'],
  ],
  'BarChart/TimelineExample': [['data', 'bar-chart/TimelineExample.ts', 'data']],
  'BarChart/BoxPlot': [
    ['data', 'bar-chart/BoxPlot.ts', 'data'],
    ['outliers', 'bar-chart/BoxPlot.ts', 'outliers'],
  ],
  'PieChart/PieChartInFlexbox': [['data', 'pie-chart/PieChartInFlexbox.ts', 'data']],
  'PieChart/PieChartInGrid': [['data', 'pie-chart/PieChartInGrid.ts', 'data']],
  'PieChart/PieChartWithNeedle': [['chartData', 'pie-chart/PieChartWithNeedle.ts', 'chartData']],
  'PieChart/CustomActiveShapePieChart': [
    ['data', 'pie-chart/CustomActiveShapePieChart.ts', 'data'],
  ],
  'PieChart/PieChartWithCustomizedLabel': [
    ['data', 'pie-chart/PieChartWithCustomizedLabel.ts', 'data'],
  ],
  'ScatterChart/BubbleChart': [
    ['data01', 'scatter-chart/BubbleChart.ts', 'data01'],
    ['data02', 'scatter-chart/BubbleChart.ts', 'data02'],
  ],
  'BarChart/TinyBarChart': [['data', 'shared.ts', 'tinyBarData']],
  'ComposedChart/LineBarAreaComposedChart': [['data', 'shared.ts', 'simpleComposedData']],
  'ScatterChart/SimpleScatterChart': [
    ['data01', 'shared.ts', 'scatterDataA'],
    ['data02', 'shared.ts', 'scatterDataB'],
  ],
  'PieChart/TwoLevelPieChart': [
    ['data01', 'shared.ts', 'pieInnerData'],
    ['data02', 'shared.ts', 'pieOuterData'],
  ],
  'RadarChart/SimpleRadarChart': [['data', 'shared.ts', 'simpleRadarData']],
  'RadialBarChart/SimpleRadialBarChart': [['data', 'shared.ts', 'simpleRadialBarData']],
  'TreeMap/SimpleTreemap': [['data', 'treemap/data.ts', 'simpleTreemapData']],
}
const knownMismatches = new Set()
// Compared in the local preview against upstream PNGs, or the live SimpleTreemap page.
// Close means recognizable composition, not pixel parity.
const visualReviews = {
  'LineChart/SimpleLineChart':
    'reviewed: source plot bounds, grid positions, and category ticks match',
  'LineChart/TinyLineChart': 'reviewed: close',
  'LineChart/DynamicZIndexLineChart':
    'reviewed: auto-width Y axis, alphabetic legend and tooltip order, and legend-hover z-index match',
  'LineChart/CompareTwoLines':
    'reviewed: initial plot, three currency ticks, faded comparison gradients, active dots, timestamp, and tracking-error segment match',
  'LineChart/AnimatedTimeSeriesExample':
    'reviewed: initial line, Start/Stop streaming, duration and match-mode controls, and dataKey swipe / index path interpolation work; removed points exit immediately',
  'LineChart/LineChartNegativeValuesWithReferenceLines':
    'reviewed: close; numeric domains, ticks, zero reference lines, and line coordinates match',
  'LineChart/CustomizedDotLineChart':
    'reviewed: close; red face markers and both source curves match',
  'LineChart/CustomizedLabelLineChart':
    'reviewed: close; point value labels and rotated X ticks match',
  'BarChart/AnimatedBarTimeSeriesExample':
    'reviewed: initial bars, Start/Stop streaming, horizontal/vertical layout, match mode, default/custom variant, duration controls, and custom removed-bar swipe work; default transition timing remains approximate',
  'ScatterChart/ScatterChartPerformance':
    'reviewed: seeded 100-series scatter cloud, 60px Y axis, mark centers and radii, and both meter scales match the reference',
  'LineChart/SynchronizedDifferentData':
    'reviewed: two compact panels, date ticks, and nearest-date hover mapping match',
  'BarChart/Waterfall':
    'reviewed: close; source ranges and published green/blue fills match (the published loss fills differ from its getBarColor helper)',
  'BarChart/PopulationPyramid':
    'reviewed: close; 504px layout, signed bars, percent labels, age ticks, axis titles, and legend order match',
  'BarChart/RangedStackedBarChart':
    'reviewed: close; source ranges, 50px width, full-stack rounded ends, gaps, and 0–600 ticks match',
  'BarChart/TimelineExample':
    'reviewed: close; source ranges, rounded bars, outcome colors, axes, and labels match',
  'BarChart/BoxPlot':
    'reviewed: close; quartiles, whiskers, outliers, 0–60 domain, and box widths match',
  'TreeMap/BundleSizeTreemap':
    'reviewed: source bundle data, summary cards, nested drill-down, and pointer-following name/value tooltip with node color match',
  'LineChart/LineChartCustomShapeExample':
    'reviewed: opacity entrance, SVG path update interpolation, dataset swap, remount replay, and duration control verified in browser',
  'AreaChart/AreaChartCustomAnimation':
    'reviewed: source area geometry, replay/swap/duration/shape controls, grow-from-bottom and reveal entrance modes verified; CSS interpolation may differ frame by frame',
  'AreaChart/RangeAreaChartCustomAnimation':
    'reviewed: source ranges and gradient bands, replay/swap/duration/mode controls, and directional reveals verified; CSS clip reveal approximates per-point interpolation',
  'ScatterChart/CustomAnimation':
    'reviewed: source point positions, crossfade, staggered delay, pop scaling, and replay/swap/duration controls verified; intermediate point matching remains approximate',
  'RadarChart/RangeRadarChartCustomAnimation':
    'reviewed: source band and ticks, replay/swap/duration controls, center-out scaling and point-to-point path transition verified; exit interpolation remains approximate',
  'SunburstChart/BundleSizeSunburst':
    'reviewed: close after async source data load; rings, palette, spacing, and hidden labels match',
  'SunburstChart/SunburstChartExample':
    'reviewed: close; source angular mapping, nested ring radii, inherited colors, and numeric labels match',
  'LineChart/DashedLineChart':
    'reviewed: close; source data, curves, dashed strokes, dots, axes, and legend match',
  'LineChart/VerticalLineChart':
    'reviewed: close; typed vertical layout, 300px width, category ticks, and line geometry match',
  'LineChart/VerticalLineChartWithSpecifiedDomain':
    'reviewed: close; 300px vertical layout, explicit numeric domain, and series geometry match',
  'LineChart/BiaxialLineChart':
    'reviewed: close; independent left/right domains, curves, grid, and legend match',
  'ComposedChart/VerticalComposedChart':
    'reviewed: close; 300px vertical layout and left-baseline area geometry match',
  'BarChart/AnimatedBarWidthExample':
    'reviewed: close; narrow black bars, every-other X tick, mirrored rotated Y ticks, and hover expansion match',
  'AreaChart/StackedAreaChart':
    'reviewed: close after source animation settles; stacked fills, curves, ticks, and colors match',
  'AreaChart/AreaChartRangeExample':
    'reviewed: close; source range polygon and -6 to 18 ticks match',
  'LineChart/LineChartConnectNulls':
    'reviewed: close; two 216px charts preserve gap and connected curve',
  'AreaChart/AreaChartConnectNulls':
    'reviewed: close; six 216px charts preserve gap and connected area modes',
  'BarChart/PositiveAndNegativeBarChart':
    'reviewed: close; symmetric signed domain, red/green numeric ticks, bar colors, and baseline match',
  'BarChart/BarChartWithMinHeight':
    'reviewed: close; 0–6000 ticks, minimum bar lengths, and circular letter labels match',
  'PieChart/PieChartInFlexbox':
    'reviewed: three source flex rules and labels; measured SVG viewboxes follow each cell including the height-capped pie',
  'PieChart/PieChartInGrid':
    'reviewed: source grid spans and labels; measured square SVG viewboxes follow each grid cell',
  'PieChart/PieChartWithNeedle': 'reviewed: close; sector order, needle angle, and centering match',
  'PieChart/PieWithGradient':
    'reviewed: sector radii, radial fills, clip masks, and gradient hover stroke match',
  'ScatterChart/BubbleChart':
    'reviewed: seven 60px rows, source category positions, in-SVG day labels, last-row hour ticks, and value tooltip match',
  'AreaChart/AreaChartExample':
    'reviewed: source plot bounds, grid positions, and category ticks match',
  'AreaChart/PercentAreaChart':
    'reviewed: close; normalized stack boundaries, percent ticks, and source colors match',
  'AreaChart/AreaChartFillByValue':
    'reviewed: close; zero-split gradient, curve, ticks, and source rows match',
  'AreaChart/TinyAreaChart': 'reviewed: close',
  'AreaChart/PreventRightClickExample':
    'reviewed: source data and area geometry match; right-click suppression is wired',
  'BarChart/SimpleBarChart':
    'reviewed: source plot bounds, grid positions, and category ticks match',
  'BarChart/StackedBarChart':
    'reviewed: close; source data, stacked heights, gray background tracks, and bar colors match',
  'BarChart/BiaxialBarChart':
    'reviewed: independent scales, ticks, grouped bars, and dual-axis grid bounds match',
  'BarChart/CustomShapeBarChart':
    'reviewed: curved shapes, seven colors, bar widths, and grid positions match',
  'BarChart/BarChartWithMultiXAxis':
    'reviewed: month and quarter ticks, red boundaries, bars, and legend overlay match',
  'BarChart/BarChartHasBackground':
    'reviewed: close; gray background tracks, grouped bars, ticks, and source data match',
  'BarChart/BarChartWithCustomizedEvent':
    'reviewed: close; bar size, opacity, and independent click toggles match',
  'BarChart/BrushBarChart':
    'reviewed: initial chart and brush track match; dragging a handle filters the bar data',
  'BarChart/Candlestick': 'reviewed: close; candle geometry matches',
  'BarChart/TinyBarChart': 'reviewed: close',
  'ComposedChart/LineBarAreaComposedChart':
    'reviewed: source plot bounds, grid positions, and category ticks match',
  'ComposedChart/ComposedChartWithAxisLabels':
    'reviewed: axis titles, 0–1800 ticks, and bottom overlay legend placement match',
  'ComposedChart/ScatterAndLineOfBestFit':
    'reviewed: close; numeric X positions, point colors, fit lines, units, and legend entries match',
  'ComposedChart/BandedChart':
    'reviewed: close; range area and natural line match; range series removed from legend',
  'ComposedChart/TargetPriceChart':
    'reviewed: close; time domain, date ticks, area and line geometry, and hover labels match',
  'ScatterChart/SimpleScatterChart':
    'reviewed: close; source axis ticks, units, and point series match',
  'ScatterChart/MultipleYAxesScatterChart':
    'reviewed: independent Y scales, axis units, point positions, and dual-axis grid bounds match',
  'ScatterChart/ScatterChartWithCells':
    'reviewed: close; source colors, symbol types, axes, and point positions match',
  'ScatterChart/ScatterChartWithLabels':
    'reviewed: close; bubble sizes, centered labels, axes, and green active hover match',
  'ScatterChart/JointLineScatterChart':
    'reviewed: close; cross and diamond markers and straight and monotone lines match',
  'ScatterChart/ThreeDimScatterChart':
    'reviewed: close; star and triangle symbols, positions, axis units, and colors match',
  'PieChart/TwoLevelPieChart':
    'reviewed: sector radii and outer label coordinates match the settled source chart',
  'PieChart/StraightAnglePieChart':
    'reviewed: close; 500 by 250 geometry, sector colors, and values match',
  'PieChart/CustomActiveShapePieChart':
    'reviewed: close; 104px radius and active callout match the source composition',
  'PieChart/PieChartWithCustomizedLabel':
    'reviewed: close; sector colors, sizes, and percentage labels match',
  'PieChart/PieChartWithPaddingAngle':
    'reviewed: close; radius, gaps, rounded corners, and palette match',
  'RadarChart/SimpleRadarChart':
    'reviewed: polygon, 196px grid radius, and rotated 0–120 radial labels match the settled source chart',
  'RadarChart/SpecifiedDomainRadarChart':
    'reviewed: two polygons and 30-degree radial ticks with source label rotation match',
  'RadialBarChart/SimpleRadialBarChart':
    'reviewed: centered seven-row legend and 18px source spacing match',
  'RadialBarChart/RadialBarChartClickToFocusLegendExample':
    'reviewed: seeded rings, colors, click focus, and 18px legend spacing match',
  'TreeMap/SimpleTreemap':
    'reviewed: 4:3 squarify layout and all 24 visible label coordinates match',
  'TreeMap/CustomContentTreemap':
    'reviewed: close; six colored groups, hierarchy cells, numbering, and 500 by 375 canvas match',
  'TreeMap/NestedTreemap':
    'reviewed: 500 by 345 canvas, all five initial label coordinates, drill-down, and leaf tooltip content match',
  'TreeMap/TreemapWithPaddingAndGaps':
    'reviewed: close; group palette, inset, gaps, labels, and 500 by 375 canvas match',
  'LineChart/LineChartWithXAxisPadding': 'reviewed: close; explicit left and right padding match',
  'LineChart/LineChartWithReferenceLines':
    'reviewed: close; reference positions and red labels match',
  'BarChart/MixBarChart':
    'reviewed: source fills and stacked composition match; legend hover, click-to-lock, and unlock verified in browser',
  'BarChart/BarChartStackedBySign': 'reviewed: close; signed stack and symmetric axis match',
  'BarChart/BarChartRangeExample': 'reviewed: close; range bars and -6 to 18 ticks match',
  'BarChart/StackedBarChartWithHorizontalLine':
    'reviewed: close; 18,000 threshold and boxed total labels match',
  'ComposedChart/SameDataComposedChart':
    'reviewed: close; same-data bar and line with 0–1600 axis match',
  'LineChart/LineChartHasMultiSeries':
    'reviewed: close; sparse series and quarter-step Y ticks match',
  'LineChart/LineChartAxisInterval':
    'reviewed: all five source tick sequences and first label/grid coordinates match',
  'AreaChart/CardinalAreaChart': 'reviewed: close; 0.8 cardinal tension and 0–280 axis match',
  'LineChart/SynchronizedLineChart':
    'reviewed: initial three-panel layout and axis domains match; dragging the brush filters all three panels',
  'AreaChart/SynchronizedAreaChart':
    'reviewed: two-row grid, responsive width, axis domains, and auto-sized Y tick labels match source layout',
  'LineChart/HighlightAndZoomLineChart':
    'reviewed: source initial curves and axes match; drag selection and Zoom Out verified in browser',
  'AreaChart/AreaChartWithCustomEvents':
    'reviewed: source stepped area, alternating X ticks, and 0–300 Y ticks match; console callbacks differ',
  'BarChart/ScrollAnimateBarChart':
    'reviewed: source seeded bars, 50vh entrance layout, and scroll-controlled growth verified at page start, midpoint, and end',
}
const response = await fetch(
  `https://api.github.com/repos/recharts/recharts/git/trees/${revision}?recursive=1`,
)
if (!response.ok) throw new Error(`Could not read Recharts source tree: ${response.status}`)
const tree = (await response.json()).tree.map((entry) => entry.path)
const rawUrl = (path) => `https://raw.githubusercontent.com/recharts/recharts/${revision}/${path}`
const sourcePath = (family, upstream) => {
  const base = `www/src/docs/exampleComponents/${family}/`
  const override = sourceOverrides[`${family}/${upstream}`]
  if (override !== undefined) return `www/src/docs/exampleComponents/${override}`
  const candidates = [
    `${base}${upstream}.tsx`,
    `${base}${upstream}Example.tsx`,
    `${base}${upstream}/index.tsx`,
    `${base}${upstream}Example/index.tsx`,
  ]
  return candidates.find((path) => tree.includes(path))
}
const localPath = (family, upstream) => {
  const slug = slugs[family]
  const name =
    family === 'LineChart' && existingLine[upstream] !== undefined
      ? `line/${existingLine[upstream]}`
      : `${family === 'LineChart' ? 'line' : slug}/${upstream}`
  return `packages/web/src/page/chart-examples/${name}.ts`
}
const snapshotPath = (family, upstream) => {
  const prefix = `test-vr/__snapshots__/tests/www/${family}ApiExamples.spec-vr.tsx-snapshots/`
  const stems = [upstream, `${upstream}Example`]
  if (family === 'ScatterChart' && upstream === 'SimpleScatterChart')
    stems.push('ScatterChartExample')
  return tree.find(
    (path) =>
      path.startsWith(prefix) &&
      path.endsWith('-1-chromium-linux.png') &&
      stems.some((stem) => path.slice(prefix.length).startsWith(`${stem}-`)),
  )
}
const entries = groups.flatMap((group) =>
  slugs[group.name] === undefined
    ? []
    : group.items.map((item) => ({ family: group.name, ...item })),
)
const sourceByPath = new Map()
const paths = [
  ...new Set(entries.map(({ family, upstream }) => sourcePath(family, upstream))),
].filter((path) => path !== undefined)
let next = 0
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (next < paths.length) {
      const path = paths[next++]
      const result = await fetch(rawUrl(path))
      if (!result.ok) throw new Error(`Could not read ${path}: ${result.status}`)
      sourceByPath.set(path, await result.text())
    }
  }),
)
const literalArray = (code, name) => {
  const declaration = new RegExp(`\\b(?:export\\s+)?const\\s+${name}\\s*(?::[^=]+)?=\\s*\\[`).exec(
    code,
  )
  if (declaration === null) return undefined
  const start = declaration.index + declaration[0].length - 1
  let depth = 0
  let quote = ''
  let escaped = false
  for (let i = start; i < code.length; i++) {
    const character = code[i]
    if (quote !== '') {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === quote) quote = ''
    } else if (character === "'" || character === '"') quote = character
    else if (character === '[') depth++
    else if (character === ']') {
      depth--
      if (depth === 0) {
        const literal = code
          .slice(start, i + 1)
          .replace(/\b([A-Za-z_$][\w$]*)\s*:/g, '\"$1\":')
          .replace(/'((?:\\.|[^'\\])*)'/g, (_match, value) => JSON.stringify(value))
          .replace(/,\s*([}\]])/g, '$1')
        try {
          return JSON.parse(literal)
        } catch {
          return undefined
        }
      }
    }
  }
  return undefined
}
const sharedCode = readFileSync(resolve(web, 'src/page/chart-examples/shared.ts'), 'utf8')
const rows = entries.map(({ family, title, upstream }) => {
  const path = sourcePath(family, upstream)
  const local = localPath(family, upstream)
  const code = readFileSync(resolve(root, local), 'utf8')
  const upstreamCode = path === undefined ? undefined : sourceByPath.get(path)
  const generic =
    (code.includes('Its data, visuals, or interactions are still being aligned') &&
      /\bsample(?:Data|PolarData|Hierarchy|NegativeData|SmallData)/.test(code)) ||
    (code.includes('renderExample(') && !/\bdata\s*:/.test(code))
  const candlestick =
    family === 'BarChart' &&
    upstream === 'Candlestick' &&
    code.includes('generateMockMarketData(100, 1337, 100, 1768145757834)') &&
    upstreamCode?.includes('generateMockMarketData(100, 1337, 100, 1768145757834)')
  const key = `${family}/${upstream}`
  const seeded = seededData[key]
  const seededMatch =
    seeded !== undefined &&
    upstreamCode?.includes(`generateMockData(${seeded[1]}, ${seeded[2]})`) &&
    sharedCode.includes(
      `${seeded[0]}: ReadonlyArray<Datum> = generateMockData(${seeded[1]}, ${seeded[2]})`,
    ) &&
    code.includes(seeded[0])
  const staticChecks = staticData[key]
  const staticMatch =
    staticChecks !== undefined &&
    upstreamCode !== undefined &&
    staticChecks.every(([upstreamName, localFile, localName]) => {
      const localDataCode = readFileSync(resolve(web, 'src/page/chart-examples', localFile), 'utf8')
      const upstreamData = literalArray(upstreamCode, upstreamName)
      const localData = literalArray(localDataCode, localName)
      return (
        code.includes(localName) &&
        upstreamData !== undefined &&
        localData !== undefined &&
        JSON.stringify(upstreamData) === JSON.stringify(localData)
      )
    })
  const captured = sourceSnapshot.examples[key]
  const populationMatch =
    key === 'BarChart/PopulationPyramid' &&
    captured?.datasets.rawData?.kind === 'literal' &&
    code.includes(`const rawData = ${JSON.stringify(captured.datasets.rawData.value, null, 2)}`) &&
    code.includes('(entry.male / totalPopulation) * -100') &&
    code.includes('(entry.female / totalPopulation) * 100') &&
    upstreamCode?.includes('const percentageData = rawData.map')
  const differentDataMatch =
    key === 'LineChart/SynchronizedDifferentData' &&
    code.includes('Math.round(50 + 30 * Math.sin(i / 3) + (i % 7) * 2)') &&
    code.includes('dailyData.filter((_, i) => i % 5 === 0)') &&
    upstreamCode?.includes('Math.round(50 + 30 * Math.sin(i / 3) + (i % 7) * 2)') &&
    upstreamCode.includes('dailyData.filter((_, i) => i % 5 === 0)')
  const bundleKind =
    key === 'TreeMap/BundleSizeTreemap'
      ? 'treemap'
      : key === 'SunburstChart/BundleSizeSunburst'
        ? 'sunburst'
        : undefined
  const bundleMatch =
    bundleKind !== undefined &&
    code.includes(`const data = ${JSON.stringify(bundleDisplay(bundleKind).data, null, 2)}`) &&
    upstreamCode?.includes('generated/bundleSizeData.generated.json')
  const statefulNames = {
    'LineChart/LineChartCustomShapeExample': ['data1', 'data2'],
    'AreaChart/AreaChartCustomAnimation': ['dataA', 'dataB'],
    'AreaChart/RangeAreaChartCustomAnimation': ['dataA', 'dataB'],
    'ScatterChart/CustomAnimation': ['dataA', 'dataB'],
    'RadarChart/RangeRadarChartCustomAnimation': ['dataA', 'dataB'],
  }[key]
  const statefulMatch =
    statefulNames !== undefined &&
    statefulNames.every((name) => {
      const dataset = captured?.datasets[name]
      return dataset?.kind === 'mock'
        ? code.includes(`const ${name} = generateMockData(${dataset.length}, ${dataset.seed})`) &&
            upstreamCode?.includes(`generateMockData(${dataset.length}, ${dataset.seed})`)
        : dataset?.kind === 'literal' &&
            code.includes(`const ${name} = ${JSON.stringify(dataset.value, null, 2)}`)
    })
  const windowMatch =
    (key === 'LineChart/AnimatedTimeSeriesExample' ||
      key === 'BarChart/AnimatedBarTimeSeriesExample') &&
    upstreamCode?.includes('generateMockData(DATA_LENGTH, 90)') &&
    upstreamCode.includes('const WINDOW = 6;') &&
    upstreamCode.includes('const DATA_LENGTH = 30;') &&
    code.includes('generateMockData(30, 90)') &&
    code.includes('Array.from({ length: 6 }') &&
    code.includes('(start + index) % 30')
  const scatterPerformanceMatch =
    key === 'ScatterChart/ScatterChartPerformance' &&
    upstreamCode?.includes('const gen = random(42)') &&
    upstreamCode.includes('const countOfScatterElements = 100') &&
    upstreamCode.includes('const pointsPerScatter = 10') &&
    code.includes('let seed = 42') &&
    code.includes('(75 * seed + 74) % 65537') &&
    code.includes('length: 100') &&
    code.includes('length: 10')
  const capturedNames =
    captured?.charts
      .flatMap((chart) => [
        chart.props.data?.expression,
        ...chart.children.flatMap((child) => child.props.data?.expression),
      ])
      .filter((name) => name !== undefined && captured.datasets[name] !== undefined) ?? []
  const snapshotMatch =
    capturedNames.length > 0 &&
    capturedNames.every((name) => {
      const dataset = captured.datasets[name]
      return dataset.kind === 'mock'
        ? code.includes(`const ${name} = generateMockData(${dataset.length}, ${dataset.seed})`) &&
            upstreamCode?.includes(`generateMockData(${dataset.length}, ${dataset.seed})`)
        : code.includes(`const ${name} = ${JSON.stringify(dataset.value, null, 2)}`)
    })
  return {
    family,
    title,
    upstream,
    path,
    local,
    snapshot: snapshotPath(family, upstream),
    data:
      candlestick ||
      seededMatch ||
      staticMatch ||
      snapshotMatch ||
      populationMatch ||
      differentDataMatch ||
      bundleMatch ||
      statefulMatch ||
      windowMatch ||
      scatterPerformanceMatch
        ? 'verified against source'
        : path === undefined
          ? 'upstream source unresolved'
          : generic || knownMismatches.has(key)
            ? 'mismatch: source dataset'
            : 'manual comparison required',
    visual:
      visualReviews[key] ??
      (snapshotMatch
        ? 'source data aligned; visual review pending'
        : path === undefined
          ? 'upstream source unresolved'
          : generic || knownMismatches.has(key)
            ? 'cannot match: source dataset/series'
            : 'manual comparison required'),
  }
})
const count = (status) => rows.filter((row) => row.data === status).length
const visuallyReviewed = rows.filter((row) => row.visual.startsWith('reviewed:')).length
const markdown = [
  '# Recharts example parity audit',
  '',
  `Upstream revision: [${revision}](https://github.com/recharts/recharts/tree/${revision}). Re-run with \`node packages/web/scripts/audit-recharts-examples.mjs\`.`,
  '',
  `Catalog: ${rows.length} examples. Source datasets verified: ${count('verified against source')}. Dataset mismatches: ${count('mismatch: source dataset')}. Upstream source unresolved: ${count('upstream source unresolved')}. Remaining datasets need manual comparison: ${count('manual comparison required')}.`,
  `Visuals reviewed against upstream: ${visuallyReviewed}. Visual review pending: ${rows.length - visuallyReviewed}. These counts do not imply interaction or pixel parity.`,
  '',
  'A source or screenshot link provides a review target, not proof of parity. The visual column records only comparisons actually performed.',
  '',
  '| Example | Upstream source | Upstream PNG | Local source | Dataset | Visual |',
  '| --- | --- | --- | --- | --- | --- |',
  ...rows.map((row) => {
    const source = row.path === undefined ? 'unresolved' : `[source](${rawUrl(row.path)})`
    const snapshot = row.snapshot === undefined ? 'unavailable' : `[PNG](${rawUrl(row.snapshot)})`
    return `| ${row.family} / ${row.title.replaceAll('|', '\\|')} | ${source} | ${snapshot} | [local](../${row.local}) | ${row.data} | ${row.visual} |`
  }),
  '',
]
writeFileSync(resolve(root, 'docs/recharts-example-parity-audit.md'), markdown.join('\n'))
console.log(
  JSON.stringify(
    {
      total: rows.length,
      matched: count('verified against source'),
      mismatches: count('mismatch: source dataset'),
      unresolved: count('upstream source unresolved'),
      review: count('manual comparison required'),
      snapshots: rows.filter((row) => row.snapshot !== undefined).length,
    },
    null,
    2,
  ),
)
