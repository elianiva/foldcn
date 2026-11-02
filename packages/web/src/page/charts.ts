import type { Html, HtmlBuilder } from 'foldkit/html'
import { activeRegistryStyle } from '../active-style'
import { itemByName } from '../catalog'
import * as Accordion from '../generated/registry/ui/accordion'
import * as Collapsible from '../generated/registry/ui/collapsible'
import { Message } from '../message'
import type { Model } from '../model'
import { examplesFor, firstExampleIds } from './chart-examples/catalog'
import type { ChartExample } from './chart-examples/catalog'
import { loadedExample } from './chart-examples/loader'
import { codeBlock, installLine, sidebarView } from './chrome'

type Row = readonly [name: string, type: string, description: string]

const chartProps: ReadonlyArray<Row> = [
  ['data', 'ReadonlyArray<Datum>', 'Rows of data. Lines and axes select values with dataKey.'],
  [
    'children',
    'ChartChild[]',
    'Descriptors returned by Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, and ReferenceLine.',
  ],
  ['width / height', 'number', 'SVG dimensions. Defaults to 700 × 433.'],
  [
    'responsive',
    'boolean',
    'Makes the SVG fit the available width while preserving its aspect ratio.',
  ],
  ['layout', 'horizontal | vertical', 'Sets category direction. Defaults to horizontal.'],
  ['margin', '{ top?, right?, bottom?, left? }', 'Space around the plot in pixels.'],
  ['activeIndex', 'number | null', 'Controlled index shown by Tooltip.'],
  [
    'onActiveIndexChange',
    '(index: number | null) => Message',
    'Dispatches hover changes into the Foldkit update loop.',
  ],
  [
    'onLegendHover',
    '(key: string | null) => Message',
    'Dispatches legend hover changes for interactive line styling.',
  ],
  ['selection', '{ fromIndex, toIndex }', 'Draws a drag selection over the plot.'],
  [
    'onSelectionStart / onSelectionEnd',
    '(index: number) => Message',
    'Dispatches drag endpoints so the caller can set a zoomed domain.',
  ],
  [
    'brushRange / brushDataLength',
    '[start, end] / number',
    'Shows a controlled Brush window against the full data length.',
  ],
  [
    'onBrushStart / onBrushEnd',
    'callbacks',
    'Dispatches Brush handle dragging so the caller can update its visible data window.',
  ],
  [
    'accessibilityLayer',
    'boolean',
    'Enables a focusable SVG with arrow, Home, End, and Escape navigation.',
  ],
  ['title / className', 'string', 'Accessible chart label and wrapper class.'],
]

const childProps: ReadonlyArray<Row> = [
  [
    'Line',
    'dataKey, yAxisId, name, type, stroke, strokeWidth, strokeDasharray, strokeOpacity, zIndex, dot, label, connectNulls, hide, animationDuration, animationKind, animationKey',
    'Draws a data series. type supports linear, monotone, step, basis, cardinal, and natural curves. dot accepts a callback for custom SVG markers. animationKind supports opacity and swipe-left.',
  ],
  [
    'XAxis / YAxis',
    'dataKey, yAxisId, orientation, type, scale, domain, padding, width, height, interval, tick, tickCount, tickAngle, stroke, tickFormatter, label',
    'Category labels and numeric ticks. domain accepts numbers, auto, dataMin, and dataMax.',
  ],
  ['CartesianGrid', 'horizontal, vertical, stroke, strokeDasharray', 'Draws plot grid lines.'],
  [
    'Tooltip',
    'formatter, labelFormatter, defaultIndex',
    'Shows values for the controlled or initial active index.',
  ],
  [
    'Legend',
    'align, position, itemSorter, wrapperStyle',
    'Lists visible series with their stroke colors.',
  ],
  ['Brush', 'dataKey, height, stroke', 'Draws a range track below the plot.'],
  ['ReferenceLine', 'x, y, stroke, strokeDasharray', 'Marks a category or numeric value.'],
]

const cartesianProps: ReadonlyArray<Row> = [
  [
    'data',
    'ReadonlyArray<Datum> | undefined',
    'Rows used by series and axis dataKey accessors. Scatter can supply data on each series.',
  ],
  ['children', 'CartesianChild[]', 'Descriptors for series, axes, grid, tooltip, and legend.'],
  ['defs', 'Html[]', 'SVG definitions such as gradients referenced by a series fill.'],
  ['width / height', 'number', 'SVG dimensions. Defaults to 700 × 433.'],
  ['responsive', 'boolean', 'Fits the SVG to the available width.'],
  ['layout', 'horizontal | vertical', 'Changes the category direction.'],
  ['margin', '{ top?, right?, bottom?, left? }', 'Plot margins in pixels.'],
  ['barGap / barCategoryGap', 'number', 'Bar spacing parameters; barGap applies to grouped bars.'],
  [
    'stackOffset',
    'sign | expand',
    'Separates signed stacks or normalizes stacked area values to 100%.',
  ],
  ['activeLabels', 'boolean', 'Shows the active row values beside each series point.'],
  [
    'accessibilityLayer',
    'boolean',
    'Enables keyboard focus and arrow, Home, End, and Escape navigation.',
  ],
  [
    'activeIndex / onActiveIndexChange',
    'number | null / callback',
    'Caller-owned active tooltip state.',
  ],
  [
    'onLegendHover / onLegendClick',
    'callbacks',
    'Dispatches legend focus and click actions for interactive series.',
  ],
  [
    'brushRange / brushDataLength',
    '[start, end] / number',
    'Shows a controlled Brush window against the full data length.',
  ],
  [
    'onBrushStart / onBrushEnd',
    'callbacks',
    'Dispatches Brush handle dragging so the caller can update its visible data window.',
  ],
  ['title / className', 'string', 'Accessible SVG label and wrapper class.'],
]
const cartesianChildren: ReadonlyArray<Row> = [
  [
    'Area / Bar / Scatter',
    'dataKey, data, name, stroke, fill, type, stackId, yAxisId, hide, zDataKey, radius, cells, background, activeBar, shape, symbols, symbolColors, symbolSize, line, lineJointType, labelDataKey, label, labelFormatter, animationKind, animationDuration, animationKey, animationMatchBy, animationVariant, animationExitDatum',
    'Renders a numeric series. Area supports fillOpacity and connectNulls; Bar supports ranges, per-row cells, background tracks, activeBar, barSize, radius, and minPointSize; Scatter supports row data, Z sizing, symbols, labels, and joined lines. Matching stackIds stack Area or Bar series. Animation options cover the included source examples.',
  ],
  [
    'Line',
    'dataKey, name, stroke, type, dot, hide, legendType',
    'Renders a line series in ComposedChart; legendType none omits its legend entry.',
  ],
  ['ZAxis', 'dataKey, range', 'Maps scatter Z values to bubble area.'],
  [
    'XAxis / YAxis',
    'dataKey, type, scale, domain, padding, hide, tick, tickCount, niceTicks, width, height, interval, tickAngle, tickFormatter, label, xAxisId, yAxisId, orientation, mirror, unit',
    'Category and numeric axes.',
  ],
  ['CartesianGrid', 'horizontal, vertical, stroke, strokeDasharray', 'Plot grid.'],
  [
    'Tooltip / Legend',
    'formatter, labelFormatter / align, position, wrapperStyle',
    'Displays active values and a series key.',
  ],
  ['ReferenceLine', 'x, y, stroke, strokeDasharray', 'Marks a category or numeric value.'],
  ['Brush', 'dataKey, height, stroke', 'Draws a range track below a Bar or Line chart.'],
]
const polarProps: ReadonlyArray<Row> = [
  [
    'data',
    'ReadonlyArray<Datum>',
    'Rows read by each polar series, unless the series supplies data.',
  ],
  ['children', 'PolarChild[]', 'Pie, Radar, or RadialBar plus polar grid/axis descriptors.'],
  ['width / height', 'number', 'Defaults to 500 × 500 for Pie/Radar or 700 × 433 for RadialBar.'],
  [
    'cx / cy / innerRadius / outerRadius / startAngle / endAngle / barSize',
    'number | percentage string',
    'Polar position, radial extent, angles, and radial bar thickness.',
  ],
  ['responsive', 'boolean', 'Fits the SVG to the available width.'],
  ['margin', 'Margin', 'Insets the PieChart plot and its radius.'],
  [
    'activeIndex / onActiveIndexChange',
    'number | null / callback',
    'Caller-owned active pie sector for hover shapes.',
  ],
  ['title / className', 'string', 'Accessible SVG label and wrapper class.'],
]
const polarChildren: ReadonlyArray<Row> = [
  [
    'Pie / Radar / RadialBar',
    'dataKey, nameKey, cx, cy, innerRadius, outerRadius, startAngle, endAngle, paddingAngle, cornerRadius, fill, stroke, fillOpacity, label, background, data, colors, gradientColors, activeShape',
    'Numeric series descriptor. Rendering support varies by chart; see the scope note below.',
  ],
  ['PolarGrid', 'none', 'Concentric polygons and radial spokes in RadarChart.'],
  ['PolarAngleAxis', 'dataKey', 'Category labels in RadarChart.'],
  [
    'PolarRadiusAxis',
    'domain, angle, ticks',
    'Sets the radial domain and tick positions in RadarChart.',
  ],
]
const hierarchyProps: ReadonlyArray<Row> = [
  ['data', 'HierarchyNode | HierarchyNode[]', 'Nested { name, value?, children? } nodes.'],
  ['dataKey / nameKey', 'string', 'Numeric value and label fields. Defaults to value / name.'],
  ['width / height', 'number', 'SVG dimensions.'],
  ['responsive', 'boolean', 'Fits the SVG to the available width.'],
  [
    'padding / nodeInset / nodeGap / aspectRatio',
    'number',
    'Treemap cell inset, gap, and squarify ratio.',
  ],
  [
    'type / content / focusPath / onNodeClick',
    'flat | nest / callback / number[] / callback',
    'Treemap rendering and caller-owned drill-down state.',
  ],
  [
    'onNodeHover / activeTooltip',
    'callback / { name, value, x, y, color } | null',
    'Caller-owned treemap hover state and tooltip display.',
  ],
  ['innerRadius / outerRadius / ringPadding', 'number', 'Sunburst ring limits and spacing.'],
  ['cx / cy / startAngle / endAngle', 'number', 'Sunburst center and angular span.'],
  ['textOptions', '{ fill?: string }', 'Sunburst value label color; none hides labels.'],
  ['title / className', 'string', 'Accessible SVG label and wrapper class.'],
]
const funnelProps: ReadonlyArray<Row> = [
  [
    'children',
    'FunnelChild[]',
    'Funnel({ data, dataKey, nameKey?, fill?, label? }) supplies the stages.',
  ],
  ['data', 'HierarchyNode[]', 'Optional direct stage data with name/value fields.'],
  ['width / height', 'number', 'SVG dimensions. Defaults to 700 × 433.'],
  ['responsive', 'boolean', 'Fits the SVG to the available width.'],
  ['title / className', 'string', 'Accessible SVG label and wrapper class.'],
]
type ChartDoc = Readonly<{
  title: string
  description: string
  scope: string
  props: ReadonlyArray<Row>
  children?: ReadonlyArray<Row>
}>
const chartDocs = {
  'line-chart': {
    title: 'LineChart',
    description: 'SVG line chart with Recharts-shaped descriptors and caller-owned hover state.',
    scope:
      'Supports lines, left and right numeric axes, grid, reference lines, legend, controlled tooltip, drag selection for zoom, controlled brush ranges, custom dots, and example animation modes. Some Recharts animation transitions remain approximate.',
    props: chartProps,
    children: childProps,
  },
  'area-chart': {
    title: 'AreaChart',
    description: 'Filled cartesian series with Recharts-shaped Area descriptors.',
    scope:
      'Supports filled areas, curves, null connection, numeric ranges, value stacking, percentage areas, and example entrance animations. Per-point animation interpolation remains approximate.',
    props: cartesianProps,
    children: cartesianChildren,
  },
  'bar-chart': {
    title: 'BarChart',
    description: 'Grouped vertical or horizontal SVG bars.',
    scope:
      'Supports grouped, stacked, range, and custom-shaped bars, separate left and right numeric axes, secondary X-axis tick callbacks, scroll growth, and example streaming animations. Default transition timing remains approximate.',
    props: cartesianProps,
    children: cartesianChildren,
  },
  'composed-chart': {
    title: 'ComposedChart',
    description: 'Combines Line, Area, Bar, and Scatter descriptors in one cartesian plot.',
    scope:
      'Supports shared categories, numeric series, and separate left and right numeric axes. Advanced event coordination remains open.',
    props: cartesianProps,
    children: cartesianChildren,
  },
  'scatter-chart': {
    title: 'ScatterChart',
    description: 'SVG scatter points with Recharts-shaped Scatter descriptors.',
    scope:
      'Supports independent numeric X/Y data, per-series rows, Z sizes, custom symbols and colors, joined lines, labels, separate left and right Y axes, and example crossfade/stagger/pop animation. Large-data optimization remains open.',
    props: cartesianProps,
    children: cartesianChildren,
  },
  'pie-chart': {
    title: 'PieChart',
    description: 'Pie and donut slices from a numeric dataKey.',
    scope:
      'Supports slice angles, inner/outer radii, padding, rounded corners, percent labels, and caller-owned active sectors. Arbitrary custom shapes and controlled tooltips remain open.',
    props: polarProps,
    children: polarChildren,
  },
  'radar-chart': {
    title: 'RadarChart',
    description: 'Radar polygon on a polar grid.',
    scope:
      'Supports one or more polygons, polygon grid lines, angle labels, a specified radial domain, range bands, and example animation modes. Exit interpolation remains approximate.',
    props: polarProps,
    children: polarChildren,
  },
  'radial-bar-chart': {
    title: 'RadialBarChart',
    description: 'Numeric values shown as concentric radial bars.',
    scope:
      'Supports concentric radial bars, background rings, labels, and a click-to-focus legend. Animation remains open.',
    props: polarProps,
    children: polarChildren,
  },
  treemap: {
    title: 'Treemap',
    description: 'Nested data laid out as proportional rectangles.',
    scope:
      'Uses a squarified rectangle layout with custom content, nested drill-down, and caller-owned pointer-following hover tooltips.',
    props: hierarchyProps,
  },
  'sunburst-chart': {
    title: 'SunburstChart',
    description: 'Nested data shown as concentric weighted arcs.',
    scope:
      'Supports weighted hierarchy rings, inherited colors, value labels, and source angle/radius defaults. Tooltip details and navigation remain open.',
    props: hierarchyProps,
  },
  'funnel-chart': {
    title: 'FunnelChart',
    description: 'Series of decreasing stages drawn as funnel segments.',
    scope:
      'Supports value-scaled Funnel segments, per-stage colors, and labels. Tooltip and animation remain open.',
    props: funnelProps,
  },
  sankey: {
    title: 'Sankey',
    description: 'Nodes and weighted links drawn as a flow diagram.',
    scope:
      'Supports layered nodes and weighted flow links for small acyclic graphs. Full Sankey layout, node/link customization, and interactions remain open.',
    props: [
      [
        'data',
        '{ nodes: { name }[]; links: { source, target, value }[] }',
        'Flow graph indexed by node position.',
      ],
      ['width / height', 'number', 'SVG dimensions.'],
      ['responsive', 'boolean', 'Fits the SVG to the available width.'],
      ['title / className', 'string', 'Accessible SVG label and wrapper class.'],
    ],
  },
} as const satisfies Readonly<Record<string, ChartDoc>>

const prose = (h: HtmlBuilder<Message>, text: string): Html =>
  h.p([h.Class('mt-4 text-sm leading-7 text-muted-foreground')], [text])

const contentShell = (
  model: Model,
  routeTag: string,
  routeName: string | undefined,
  content: ReadonlyArray<Html>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [h.Class('mx-auto flex w-full max-w-6xl flex-1')],
    [
      sidebarView(h, model.docsNavDesktop, routeTag, routeName, activeRegistryStyle()),
      h.main(
        [h.Class('min-w-0 flex-1')],
        [h.div([h.Class('mx-auto w-full max-w-3xl px-4 py-12 font-mono sm:px-6')], content)],
      ),
    ],
  )

const apiTable = (title: string, rows: ReadonlyArray<Row>, h: HtmlBuilder<Message>): Html =>
  h.section(
    [h.Class('mt-10')],
    [
      h.h2([h.Class('text-lg font-semibold')], [title]),
      h.div(
        [h.Class('mt-3 overflow-x-auto rounded-lg border border-border')],
        [
          h.table(
            [h.Class('w-full min-w-[600px] text-left text-xs')],
            [
              h.thead(
                [h.Class('border-b bg-muted/40')],
                [
                  h.tr(
                    [],
                    ['Parameter', 'Type / props', 'Behavior'].map((label) =>
                      h.th([h.Class('px-3 py-2 font-semibold')], [label]),
                    ),
                  ),
                ],
              ),
              h.tbody(
                [],
                rows.map(([name, type, description]) =>
                  h.tr(
                    [h.Class('border-b last:border-0')],
                    [
                      h.td([h.Class('px-3 py-2 align-top font-medium')], [h.code([], [name])]),
                      h.td(
                        [h.Class('px-3 py-2 align-top text-muted-foreground')],
                        [h.code([], [type])],
                      ),
                      h.td([h.Class('px-3 py-2 align-top text-muted-foreground')], [description]),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  )

const exampleContent = (
  model: Model,
  example: ChartExample,
  index: number,
  h: HtmlBuilder<Message>,
): Html => {
  const loaded =
    firstExampleIds.has(example.id) || model.loadedChartExamples.has(example.id)
      ? loadedExample(example.id)
      : undefined
  const source = model.chartExampleSources[index]
  return h.div(
    [h.Class('flex flex-col gap-4')],
    [
      ...(loaded === undefined
        ? [
            prose(
              h,
              model.failedChartExamples.has(example.id)
                ? 'The example could not be loaded.'
                : 'Loading example…',
            ),
          ]
        : [
            loaded.view(model, h),
            ...(source === undefined
              ? []
              : [
                  h.div(
                    [
                      h.Class(Collapsible.collapsibleWrapperClass),
                      h.DataAttribute('slot', 'collapsible'),
                    ],
                    [
                      h.button(
                        [
                          h.Id(`${source.id}-button`),
                          h.Type('button'),
                          h.AriaExpanded(source.isOpen),
                          ...(source.isOpen
                            ? [h.AriaControls(`${source.id}-panel`), h.DataAttribute('open', '')]
                            : []),
                          h.Class(Collapsible.collapsibleTriggerClass),
                          h.DataAttribute('slot', 'collapsible-trigger'),
                          h.OnClick(
                            Message.GotChartExampleSourceMessage({
                              index,
                              message: Collapsible.Message.Toggled(),
                            }),
                          ),
                        ],
                        [
                          'Source',
                          h.span([h.Class('text-muted-foreground')], [source.isOpen ? '−' : '+']),
                        ],
                      ),
                      ...(source.isOpen
                        ? [
                            h.div(
                              [
                                h.Id(`${source.id}-panel`),
                                h.Class(Collapsible.collapsibleContentClass),
                                h.DataAttribute('slot', 'collapsible-content'),
                              ],
                              [codeBlock(h, model, `${example.file}.ts`, loaded.code)],
                            ),
                          ]
                        : []),
                    ],
                  ),
                ]),
          ]),
      ...(example.adaptation === undefined ? [] : [prose(h, example.adaptation)]),
      ...(example.upstream === undefined
        ? []
        : [
            h.a(
              [
                h.Href(`https://recharts.github.io/en-US/examples/${example.upstream}/`),
                h.Target('_blank'),
                h.Rel('noopener noreferrer'),
                h.Class('inline-block text-xs text-primary underline'),
              ],
              ['View the Recharts example'],
            ),
          ]),
    ],
  )
}

const usage = `import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from '@/components/ui/line-chart'

LineChart({
  data,
  responsive: true,
  children: [
    CartesianGrid({ strokeDasharray: '3 3' }),
    XAxis({ dataKey: 'name' }),
    YAxis(),
    Tooltip(),
    Legend(),
    Line({ dataKey: 'value', type: 'monotone', stroke: '#2563eb' }),
  ],
  activeIndex: model.activeIndex,
  onActiveIndexChange: (index) => Message.ChartHovered({ index }),
}, h)`

export const chartGuidePage = (model: Model, h: HtmlBuilder<Message>): Html =>
  contentShell(
    model,
    'ChartGuide',
    undefined,
    [
      h.a([h.Href('/docs'), h.Class('text-xs text-muted-foreground underline')], ['Docs']),
      h.h1([h.Class('mt-5 text-3xl font-bold tracking-tight')], ['Charts guide']),
      prose(
        h,
        'Charts use Recharts component and parameter names. Child functions return descriptors that Foldkit renders as SVG.',
      ),
      prose(
        h,
        'Install the chart source into a Foldkit app, pass your data rows and child descriptors, and route hover messages through your update function. A responsive chart needs a container with a measurable width.',
      ),
      prose(
        h,
        'Cartesian and polar rows contain scalar string or number values. Treemap, SunburstChart, and FunnelChart use nested nodes; Sankey uses nodes and links. Active cartesian hover state belongs to the caller.',
      ),
      prose(
        h,
        'The API pages list the currently supported parameters. Every chart example on the Recharts index has a lazy Foldkit preview and source. Examples with upstream behavior still in progress are labeled as adaptations.',
      ),
      h.h2([h.Class('mt-10 text-lg font-semibold')], ['Start with a line chart']),
      h.pre(
        [h.Class('mt-3 overflow-x-auto rounded-lg border bg-muted/30 p-4 text-xs leading-6')],
        [h.code([], [usage])],
      ),
      h.a(
        [h.Href('/docs/line-chart'), h.Class('mt-5 inline-block text-sm text-primary underline')],
        ['LineChart API and examples →'],
      ),
    ],
    h,
  )

export const chartApiPage = (model: Model, name: string, h: HtmlBuilder<Message>): Html => {
  const docs: ChartDoc | undefined = Object.entries(chartDocs).find(([key]) => key === name)?.[1]
  if (docs === undefined) return h.empty
  const source = itemByName[name]?.maybeSource
  const examples = examplesFor(name)
  return contentShell(
    model,
    'Item',
    name,
    [
      h.a(
        [h.Href('/docs/charts'), h.Class('text-xs text-muted-foreground underline')],
        ['Charts guide'],
      ),
      h.h1([h.Class('mt-5 text-3xl font-bold tracking-tight')], [docs.title]),
      prose(h, docs.description),
      h.h2([h.Class('mt-10 text-lg font-semibold')], ['Install']),
      h.div([h.Class('mt-3')], [installLine(h, model, `npx shadcn@latest add @foldcn/${name}`)]),
      apiTable(`${docs.title} parameters`, docs.props, h),
      ...(docs.children === undefined ? [] : [apiTable('Child components', docs.children, h)]),
      prose(h, docs.scope),
      h.section(
        [h.Class('mt-12')],
        [
          h.h2([h.Class('text-lg font-semibold')], ['Examples']),
          prose(
            h,
            'The first example is open. Expand Source inside an example to view its code. Other examples load when opened.',
          ),
          h.div(
            [
              h.Class(`${Accordion.accordionWrapperClass} mt-4 gap-3`),
              h.DataAttribute('slot', 'accordion'),
            ],
            examples.map((example, index) =>
              Accordion.accordionItem(
                {
                  id: `chart-example-${example.id}`,
                  title: example.title,
                  content: model.chartExamples.value[index]
                    ? exampleContent(model, example, index, h)
                    : '',
                  isOpen: model.chartExamples.value[index] ?? false,
                  isDisabled: index === 0,
                  wrapperClass: 'overflow-hidden rounded-lg border border-border',
                  triggerClass:
                    'w-full px-4 py-3 text-sm font-medium hover:bg-muted/40 aria-disabled:opacity-100',
                  contentClass: 'border-t px-4 py-5',
                  onToggle: (isOpen) =>
                    Message.GotChartExamplesAccordionMessage({
                      message: Accordion.Message.ToggledItem({ index, isOpen }),
                    }),
                },
                h,
              ),
            ),
          ),
        ],
      ),
      ...(source === undefined
        ? []
        : [
            h.section(
              [h.Class('mt-12 overflow-hidden rounded-lg border border-border')],
              [
                h.h2(
                  [],
                  [
                    h.button(
                      [
                        h.Type('button'),
                        h.Class(
                          'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-lg font-semibold hover:bg-muted/40',
                        ),
                        h.AriaExpanded(model.expandedCodeBlocks.has('chart-source')),
                        h.OnClick(Message.ToggledCodeBlock({ id: 'chart-source' })),
                      ],
                      [
                        `${docs.title} source`,
                        h.span(
                          [h.Class('text-muted-foreground')],
                          [model.expandedCodeBlocks.has('chart-source') ? '−' : '+'],
                        ),
                      ],
                    ),
                  ],
                ),
                ...(model.expandedCodeBlocks.has('chart-source')
                  ? [
                      h.div(
                        [h.Class('border-t p-4')],
                        [codeBlock(h, model, source.path, source.code)],
                      ),
                    ]
                  : []),
              ],
            ),
          ]),
    ],
    h,
  )
}
