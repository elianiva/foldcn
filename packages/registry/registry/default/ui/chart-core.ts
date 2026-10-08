// Optional chart attributes are omitted to preserve the rendered Recharts example output.
/* oxlint-disable anti-slop/no-conditional-empty-object-spread */
// Chart values and snapshot data cross an external input boundary and require runtime narrowing.
/* oxlint-disable anti-slop/no-runtime-typeof */
// Recharts shape and activeShape names are part of the compatible API and example source.
/* oxlint-disable anti-slop/no-shape-in-symbol-names */
import {
  arc,
  area,
  curveBasis,
  curveCardinal,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
  line,
  pie,
  symbol,
  symbolCircle,
  symbolCross,
  symbolDiamond,
  symbolSquare,
  symbolStar,
  symbolTriangle,
  symbolWye,
} from 'd3-shape'
import type { CurveFactory } from 'd3-shape'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'
import { Option } from 'effect'
import { cn } from '@/lib/utils'
import { isNumberRange, niceTickValues } from '@/components/ui/line-chart'
import type {
  AxisProps,
  ChartChild as LineChild,
  ChartValue,
  DataKey,
  Datum,
  DomainEnd,
  Margin,
} from '@/components/ui/line-chart'

export {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from '@/components/ui/line-chart'

export type SeriesProps = Readonly<{
  dataKey: DataKey
  yAxisId?: string
  data?: ReadonlyArray<Datum>
  zDataKey?: DataKey
  name?: string
  stroke?: string
  fill?: string
  cells?: ReadonlyArray<Readonly<{ fill?: string; stroke?: string }>>
  activeBar?: boolean | Readonly<{ stroke?: string; strokeWidth?: number; fillOpacity?: number }>
  shape?: ((props: BarShapeProps) => Html) | ScatterSymbol
  symbols?: ReadonlyArray<ScatterSymbol>
  symbolColors?: ReadonlyArray<string>
  symbolSize?: number
  line?: boolean
  lineJointType?: 'linear' | 'monotone'
  labelDataKey?: DataKey
  activeShape?: Readonly<{ fill?: string }>
  strokeWidth?: number
  strokeDasharray?: string
  type?: 'linear' | 'monotone' | 'step' | 'basis' | 'cardinal' | 'natural'
  curveTension?: number
  connectNulls?: boolean
  stackId?: string
  baseValue?: number | 'dataMax' | 'dataMin'
  hide?: boolean
  legendType?: 'none'
  dot?: boolean
  fillOpacity?: number
  barSize?: number
  background?: boolean | Readonly<{ fill?: string; stroke?: string }>
  minPointSize?: number
  radius?: number | readonly [number, number, number, number]
  scrollAnimate?: boolean
  animationKind?:
    | 'grow-from-bottom'
    | 'reveal-top'
    | 'reveal-left'
    | 'scatter-crossfade'
    | 'scatter-staggered'
    | 'scatter-pop'
  animationDuration?: number
  animationKey?: string
  animationMatchBy?: 'index' | 'dataKey'
  animationVariant?: 'default' | 'custom'
  animationExitDatum?: Datum
  label?: 'top' | 'right'
  labelFormatter?: (value: number) => string
  labelColors?: ReadonlyArray<string>
}>
export type ScatterSymbol = 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye'
export type BarShapeProps = Readonly<{
  x: number
  y: number
  width: number
  height: number
  payload: Datum
  index: number
  fill: string
  isActive?: boolean
}>
export type CartesianSeries =
  | Readonly<{ kind: 'area'; props: SeriesProps }>
  | Readonly<{ kind: 'bar'; props: SeriesProps }>
  | Readonly<{ kind: 'scatter'; props: SeriesProps }>
export type ZAxisProps = Readonly<{ dataKey?: DataKey; range?: readonly [number, number] }>
export type CartesianChild =
  | LineChild
  | CartesianSeries
  | Readonly<{ kind: 'zAxis'; props: ZAxisProps }>
export const Area = (props: SeriesProps): CartesianSeries => ({ kind: 'area', props })
export const Bar = (props: SeriesProps): CartesianSeries => ({ kind: 'bar', props })
export const Scatter = (props: SeriesProps): CartesianSeries => ({ kind: 'scatter', props })
export const ZAxis = (props: ZAxisProps = {}): Extract<CartesianChild, { kind: 'zAxis' }> => ({
  kind: 'zAxis',
  props,
})

export type CartesianChartProps<M> = Readonly<{
  data?: ReadonlyArray<Datum>
  children: ReadonlyArray<CartesianChild>
  defs?: ReadonlyArray<Html>
  width?: number
  height?: number
  responsive?: boolean
  layout?: 'horizontal' | 'vertical'
  margin?: Margin
  barGap?: number
  barCategoryGap?: number
  stackOffset?: 'sign' | 'expand'
  className?: string
  title?: string
  accessibilityLayer?: boolean
  activeIndex?: number | null
  activeLabels?: boolean
  onActiveIndexChange?: (index: number | null) => M
  onLegendHover?: (key: string | null) => M
  onLegendClick?: (key: string) => M
  brushRange?: readonly [number, number]
  brushDataLength?: number
  onBrushStart?: (edge: 'start' | 'end') => M
  onBrushEnd?: (index: number) => M
}>

type Series = Extract<CartesianChild, { kind: 'line' | 'area' | 'bar' | 'scatter' }>
const attrs = <M>(
  h: HtmlBuilder<M>,
  values: Readonly<Record<string, string>>,
): ReadonlyArray<Attribute<M>> =>
  Object.entries(values).map(([name, value]) => h.Attribute(name, value))
const renderAxisLabel = <M>(
  h: HtmlBuilder<M>,
  label: AxisProps['label'],
  axis: 'x' | 'y',
  bounds: Readonly<{ left: number; right: number; top: number; bottom: number }>,
): Html | undefined => {
  if (label === undefined) return undefined
  // oxlint-disable-next-line anti-slop/no-runtime-typeof
  const config = typeof label === 'string' ? { value: label } : label
  const x =
    axis === 'x'
      ? config.position === 'insideBottomRight'
        ? bounds.right
        : (bounds.left + bounds.right) / 2
      : bounds.left -
        (config.position === 'insideLeft'
          ? 70
          : config.position === 'insideTopLeft'
            ? 65
            : config.position === 'left'
              ? 49
              : 42) +
        (config.offset ?? 0)
  const y =
    axis === 'x'
      ? bounds.bottom +
        (config.position === 'bottom' ? 36 : config.position === 'insideBottom' ? 26 : 12) +
        (config.offset ?? 0)
      : config.position === 'insideTopLeft'
        ? bounds.top
        : (bounds.top + bounds.bottom) / 2 - 9
  const anchor =
    config.textAnchor ??
    config.style?.textAnchor ??
    (axis === 'x'
      ? config.position === 'insideBottomRight'
        ? 'end'
        : 'middle'
      : config.position === 'insideTopLeft'
        ? 'end'
        : 'start')
  const angle = config.angle ?? (axis === 'y' ? -90 : 0)
  return h.text(
    attrs(h, {
      x: String(x),
      y: String(y),
      'text-anchor': anchor,
      fill: '#18181b',
      'font-size': '12',
      ...(angle === 0 ? {} : { transform: `rotate(${angle}, ${x}, ${y})` }),
    }),
    [config.value],
  )
}
const numeric = (value: ChartValue): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined
  const result = Number(isNumberRange(value) ? value.at(-1) : value)
  return Number.isFinite(result) ? result : undefined
}
const rangeStart = (value: ChartValue): number | undefined =>
  isNumberRange(value) && value.length >= 2 ? numeric(value[0]) : undefined
const stringColor = (value: ChartValue | ReadonlyArray<HierarchyNode>): string | undefined => {
  // Data rows cross into the renderer here; only CSS color strings are accepted.
  // oxlint-disable-next-line anti-slop/no-runtime-typeof
  return typeof value === 'string' ? value : undefined
}
const at = (row: Datum, key: DataKey): ChartValue =>
  // oxlint-disable-next-line anti-slop/no-runtime-typeof
  typeof key === 'function' ? key(row) : row[key]
const keyName = (key: DataKey): string =>
  // oxlint-disable-next-line anti-slop/no-runtime-typeof
  typeof key === 'string' ? key : 'Value'
const scale = (value: number, min: number, max: number, start: number, end: number): number =>
  max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start)
const curve = (type: SeriesProps['type'], tension?: number): CurveFactory => {
  switch (type) {
    case 'basis':
      return curveBasis
    case 'cardinal':
      return curveCardinal.tension(tension ?? 0)
    case 'monotone':
      return curveMonotoneX
    case 'natural':
      return curveNatural
    case 'step':
      return curveStep
    default:
      return curveLinear
  }
}
const symbolTypes = {
  circle: symbolCircle,
  cross: symbolCross,
  diamond: symbolDiamond,
  square: symbolSquare,
  star: symbolStar,
  triangle: symbolTriangle,
  wye: symbolWye,
} as const
const chart = <M>(
  slot: string,
  title: string,
  width: number,
  height: number,
  responsive: boolean | undefined,
  className: string | undefined,
  content: ReadonlyArray<Html>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class(cn('cn-chart-root', className)), h.DataAttribute('slot', slot)],
    [
      h.svg(
        [
          h.ViewBox(`0 0 ${width} ${height}`),
          h.Attribute('width', responsive ? '100%' : String(width)),
          h.Attribute('height', String(height)),
          h.Attribute('font-family', 'Arial, sans-serif'),
          ...(responsive
            ? [h.Style({ height: 'auto', maxWidth: `${width}px`, overflow: 'visible' })]
            : []),
          h.Role('img'),
          h.AriaLabel(title),
        ],
        content,
      ),
    ],
  )

const scatterCartesian = <M>(props: CartesianChartProps<M>, h: HtmlBuilder<M>): Html => {
  const width = props.width ?? 700
  const height = props.height ?? 433
  const top = props.margin?.top ?? 20
  const xAxis = props.children.find((child) => child.kind === 'xAxis')
  const yAxes = props.children.filter(
    (child): child is Extract<CartesianChild, { kind: 'yAxis' }> => child.kind === 'yAxis',
  )
  const leftAxis = yAxes.find((axis) => axis.props.orientation !== 'right')
  const rightAxis = yAxes.find((axis) => axis.props.orientation === 'right')
  const yAxis = leftAxis ?? rightAxis
  const dualAxes = leftAxis !== undefined && rightAxis !== undefined
  const left =
    (props.margin?.left ?? 5) +
    (leftAxis === undefined || leftAxis.props.hide
      ? 0
      : leftAxis.props.width === 'auto'
        ? 43
        : (leftAxis.props.width ?? 43))
  const right =
    width -
    ((props.margin?.right ?? 5) +
      (rightAxis === undefined || rightAxis.props.hide
        ? 0
        : rightAxis.props.width === 'auto'
          ? 43
          : (rightAxis.props.width ?? 55)))
  const bottom =
    height -
    ((props.margin?.bottom ?? 5) +
      (xAxis === undefined || xAxis.props.hide ? 0 : (xAxis.props.height ?? 30)))
  const zAxis = props.children.find((child) => child.kind === 'zAxis')
  const series = props.children.filter(
    (child): child is Extract<CartesianSeries, { kind: 'scatter' }> =>
      child.kind === 'scatter' && child.props.hide !== true,
  )
  const categoryX = xAxis?.kind === 'xAxis' && xAxis.props.type === 'category'
  const categoryRows = series[0]?.props.data ?? props.data ?? []
  const points = series.flatMap((item, seriesIndex) =>
    (item.props.data ?? props.data ?? []).flatMap((row, pointIndex) => {
      const x = categoryX
        ? pointIndex
        : numeric(at(row, xAxis?.kind === 'xAxis' ? (xAxis.props.dataKey ?? 'x') : 'x'))
      const y = numeric(at(row, yAxis?.kind === 'yAxis' ? (yAxis.props.dataKey ?? 'y') : 'y'))
      const zKey = zAxis?.kind === 'zAxis' ? zAxis.props.dataKey : item.props.zDataKey
      const z = zKey === undefined ? undefined : numeric(at(row, zKey))
      return x === undefined || y === undefined
        ? []
        : [{ x, y, z, item, seriesIndex, pointIndex, row }]
    }),
  )
  const domain = (
    values: ReadonlyArray<number>,
    specified: readonly [DomainEnd, DomainEnd] | undefined,
  ): readonly [number, number] => {
    const low = Math.min(0, ...values)
    const high = Math.max(1, ...values)
    const resolveEnd = (end: DomainEnd | undefined, fallback: number): number =>
      // Axis domain entries are a public union of numeric values and named bounds.
      // oxlint-disable-next-line anti-slop/no-runtime-typeof
      typeof end === 'number'
        ? end
        : end === 'dataMin'
          ? Math.min(...values)
          : end === 'dataMax'
            ? Math.max(...values)
            : end === undefined || end === 'auto'
              ? fallback
              : end.startsWith('dataMax + ')
                ? Math.max(...values) + Number(end.slice('dataMax + '.length))
                : Math.min(...values) - Number(end.slice('dataMin - '.length))
    const start = resolveEnd(specified?.[0], low)
    const end = resolveEnd(specified?.[1], high)
    const rawStep = Math.max(1, end - start) / 4
    const power = 10 ** Math.floor(Math.log10(rawStep))
    const ratio = rawStep / power
    const step =
      ([1, 1.5, 2, 2.5, 3, 4, 4.5, 5, 6, 7.5, 8, 10].find((candidate) => candidate >= ratio) ??
        10) * power
    return [
      specified?.[0] === undefined || specified[0] === 'auto'
        ? Math.floor(start / step) * step
        : start,
      specified?.[1] === undefined || specified[1] === 'auto' ? Math.ceil(end / step) * step : end,
    ]
  }
  const xDomain = categoryX
    ? ([0, Math.max(0, categoryRows.length - 1)] as const)
    : domain(
        points.map((point) => point.x),
        xAxis?.kind === 'xAxis' ? xAxis.props.domain : undefined,
      )
  const yDomain = domain(
    points
      .filter((point) => !dualAxes || point.item.props.yAxisId !== rightAxis.props.yAxisId)
      .map((point) => point.y),
    yAxis?.kind === 'yAxis' ? yAxis.props.domain : undefined,
  )
  const rightYDomain = dualAxes
    ? domain(
        points
          .filter((point) => point.item.props.yAxisId === rightAxis.props.yAxisId)
          .map((point) => point.y),
        rightAxis.props.domain,
      )
    : yDomain
  const zValues = points.flatMap((point) => (point.z === undefined ? [] : [point.z]))
  const zMin = Math.min(0, ...zValues)
  const zMax = Math.max(1, ...zValues)
  const zRange: readonly [number, number] =
    zAxis?.kind === 'zAxis' ? (zAxis.props.range ?? [64, 144]) : [64, 144]
  const x = (value: number): number =>
    categoryX
      ? left + ((right - left) * (value + 0.5)) / Math.max(1, categoryRows.length)
      : scale(value, xDomain[0], xDomain[1], left, right)
  const y = (value: number): number => scale(value, yDomain[0], yDomain[1], bottom, top)
  const pointY = (item: Extract<CartesianSeries, { kind: 'scatter' }>, value: number): number =>
    dualAxes && item.props.yAxisId === rightAxis.props.yAxisId
      ? scale(value, rightYDomain[0], rightYDomain[1], bottom, top)
      : y(value)
  const xTicks = categoryX
    ? categoryRows.map((_, index) => index)
    : xAxis?.kind === 'xAxis' && xAxis.props.ticks !== undefined
      ? xAxis.props.ticks
      : Array.from({ length: 5 }, (_, i) => xDomain[0] + ((xDomain[1] - xDomain[0]) * i) / 4)
  const yTicks =
    yAxis?.kind === 'yAxis' && yAxis.props.ticks !== undefined
      ? yAxis.props.ticks
      : Array.from({ length: 5 }, (_, i) => yDomain[0] + ((yDomain[1] - yDomain[0]) * i) / 4)
  const elements: Html[] = [...(props.defs ?? [])]
  const grid = props.children.find((child) => child.kind === 'grid')
  if (grid?.kind === 'grid') {
    const stroke = grid.props.stroke ?? '#d6d3d1'
    const dash = grid.props.strokeDasharray ?? '3 3'
    if (grid.props.horizontal !== false)
      elements.push(
        ...(dualAxes ? [yDomain[0], yDomain[1]] : yTicks).map((value) =>
          h.line(
            attrs(h, {
              x1: String(left),
              x2: String(right),
              y1: String(y(value)),
              y2: String(y(value)),
              stroke,
              'stroke-dasharray': dash,
            }),
          ),
        ),
      )
    if (grid.props.vertical !== false)
      elements.push(
        ...xTicks.map((value) =>
          h.line(
            attrs(h, {
              x1: String(x(value)),
              x2: String(x(value)),
              y1: String(top),
              y2: String(bottom),
              stroke,
              'stroke-dasharray': dash,
            }),
          ),
        ),
      )
  }
  if (xAxis?.kind === 'xAxis' && !xAxis.props.hide) {
    if (xAxis.props.axisLine !== false)
      elements.push(
        h.line(
          attrs(h, {
            x1: String(left),
            x2: String(right),
            y1: String(bottom),
            y2: String(bottom),
            stroke: xAxis.props.stroke ?? '#666',
          }),
        ),
      )
    if (xAxis.props.tick !== false)
      elements.push(
        ...xTicks.map((value) =>
          h.text(
            attrs(h, {
              x: String(x(value)),
              y: String(bottom + 8),
              'text-anchor': 'middle',
              fill: '#666',
              'font-size': '14',
            }),
            [
              categoryX
                ? String(at(categoryRows[value] ?? {}, xAxis.props.dataKey ?? 'x') ?? value)
                : (xAxis.props.tickFormatter?.(value) ??
                  `${Number(value.toFixed(1))}${xAxis.props.unit ?? ''}`),
            ],
          ),
        ),
      )
  }
  if (yAxis?.kind === 'yAxis' && !yAxis.props.hide) {
    if (yAxis.props.axisLine !== false)
      elements.push(
        h.line(
          attrs(h, {
            x1: String(left),
            x2: String(left),
            y1: String(top),
            y2: String(bottom),
            stroke: yAxis.props.stroke ?? '#666',
          }),
        ),
      )
    if (yAxis.props.tick !== false)
      elements.push(
        ...yTicks.map((value) =>
          h.text(
            attrs(h, {
              x: String(left - 10),
              y: String(y(value) + 4),
              'text-anchor': 'end',
              fill: '#666',
              'font-size': '14',
            }),
            [
              yAxis.props.tickFormatter?.(value) ??
                `${Number(value.toFixed(1))}${yAxis.props.unit ?? ''}`,
            ],
          ),
        ),
      )
  }
  if (dualAxes && !rightAxis.props.hide) {
    const rightTicks = Array.from(
      { length: 5 },
      (_, i) => rightYDomain[0] + ((rightYDomain[1] - rightYDomain[0]) * i) / 4,
    )
    elements.push(
      h.line(
        attrs(h, {
          x1: String(right),
          x2: String(right),
          y1: String(top),
          y2: String(bottom),
          stroke: rightAxis.props.stroke ?? '#666',
        }),
      ),
    )
    if (rightAxis.props.tick !== false)
      elements.push(
        ...rightTicks.map((value) =>
          h.text(
            attrs(h, {
              x: String(right + 10),
              y: String(scale(value, rightYDomain[0], rightYDomain[1], bottom, top) + 4),
              'text-anchor': 'start',
              fill: rightAxis.props.stroke ?? '#666',
              'font-size': '14',
            }),
            [
              rightAxis.props.tickFormatter?.(value) ??
                `${Number(value.toFixed(1))}${rightAxis.props.unit ?? ''}`,
            ],
          ),
        ),
      )
  }
  for (const item of series) {
    if (item.props.line !== true) continue
    const source = points.filter((point) => point.item === item)
    const d = line<(typeof points)[number]>()
      .x((point) => x(point.x))
      .y((point) => pointY(point.item, point.y))
      .curve(item.props.lineJointType === 'monotone' ? curveMonotoneX : curveLinear)(source)
    if (d !== null)
      elements.push(
        h.path(
          attrs(h, {
            d,
            fill: 'none',
            stroke:
              item.props.stroke ??
              item.props.fill ??
              palette[series.indexOf(item) % palette.length] ??
              '#8884d8',
            'stroke-width': '1',
          }),
        ),
      )
  }
  elements.push(
    ...points.flatMap((point) => {
      const px = x(point.x)
      const py = pointY(point.item, point.y)
      const size =
        point.item.props.symbolSize ??
        (point.z === undefined ? 100 : scale(point.z, zMin, zMax, zRange[0], zRange[1]))
      const radius = Math.sqrt(size / Math.PI)
      const shape =
        point.item.props.symbols?.[point.pointIndex % point.item.props.symbols.length] ??
        (typeof point.item.props.shape === 'string' ? point.item.props.shape : 'circle')
      const color =
        props.activeIndex === point.pointIndex
          ? (point.item.props.activeShape?.fill ??
            point.item.props.symbolColors?.[
              point.pointIndex % point.item.props.symbolColors.length
            ] ??
            point.item.props.fill ??
            palette[point.seriesIndex % palette.length] ??
            '#8884d8')
          : (point.item.props.symbolColors?.[
              point.pointIndex % point.item.props.symbolColors.length
            ] ??
            point.item.props.fill ??
            palette[point.seriesIndex % palette.length] ??
            '#8884d8')
      const hover =
        props.onActiveIndexChange === undefined
          ? []
          : [h.OnMouseEnter(props.onActiveIndexChange(point.pointIndex))]
      const scatterAnimated = point.item.props.animationKind?.startsWith('scatter-') === true
      const duration = point.item.props.animationDuration ?? 1500
      const count = point.item.props.data?.length ?? props.data?.length ?? 1
      const staggerIndex =
        point.item.props.fillOpacity === 0 ? count - 1 - point.pointIndex : point.pointIndex
      const delay =
        point.item.props.animationKind === 'scatter-staggered'
          ? (staggerIndex / count) * duration
          : 0
      const scatterStyle = scatterAnimated
        ? [
            h.Style({
              transformBox: 'fill-box',
              transformOrigin: 'center',
              transform:
                point.item.props.animationKind === 'scatter-pop' &&
                point.item.props.fillOpacity === 0
                  ? 'scale(0)'
                  : 'scale(1)',
              transition: `fill-opacity ${Math.max(1, duration - delay)}ms linear ${delay}ms, transform ${Math.max(1, duration - delay)}ms linear ${delay}ms`,
              animation: `foldcn-scatter-enter ${duration}ms linear both`,
              pointerEvents: point.item.props.fillOpacity === 0 ? 'none' : 'auto',
            }),
          ]
        : []
      const scatterKey =
        point.item.props.animationKey === undefined
          ? []
          : [h.Key(`${point.item.props.animationKey}-${point.seriesIndex}-${point.pointIndex}`)]
      const symbolNode =
        shape === 'circle'
          ? h.circle([
              ...attrs(h, {
                cx: String(px),
                cy: String(py),
                r: String(radius),
                fill: color,
                'fill-opacity': String(point.item.props.fillOpacity ?? 1),
              }),
              ...scatterStyle,
              ...scatterKey,
              ...hover,
            ])
          : h.path([
              ...attrs(h, {
                d: symbol().type(symbolTypes[shape]).size(size)() ?? '',
                transform: `translate(${px},${py})`,
                fill: color,
                'fill-opacity': String(point.item.props.fillOpacity ?? 1),
              }),
              ...scatterStyle,
              ...scatterKey,
              ...hover,
            ])
      const label =
        point.item.props.labelDataKey === undefined
          ? []
          : [
              h.text(
                attrs(h, {
                  x: String(px),
                  y: String(py + 4),
                  'text-anchor': 'middle',
                  fill: '#333',
                  'font-size': '12',
                  'pointer-events': 'none',
                }),
                [String(at(point.row, point.item.props.labelDataKey) ?? '')],
              ),
            ]
      return [symbolNode, ...label]
    }),
  )
  const legend = props.children.find((child) => child.kind === 'legend')
  const tooltip = props.children.find((child) => child.kind === 'tooltip')
  const tooltipPoint = points.find(
    (point) =>
      point.pointIndex ===
        (props.activeIndex ??
          (tooltip?.kind === 'tooltip' ? tooltip.props.defaultIndex : undefined)) &&
      (point.item.props.fillOpacity ?? 1) > 0,
  )
  return h.div(
    [
      h.Style({ position: 'relative' }),
      ...(props.onActiveIndexChange === undefined
        ? []
        : [h.OnMouseLeave(props.onActiveIndexChange(null))]),
    ],
    [
      ...(series.some((item) => item.props.animationKind?.startsWith('scatter-') === true)
        ? [
            h.style(
              [],
              ['@keyframes foldcn-scatter-enter { from { opacity: 0; } to { opacity: 1; } }'],
            ),
          ]
        : []),
      chart(
        'scatter-chart',
        props.title ?? 'Scatter chart',
        width,
        height,
        props.responsive,
        props.className,
        elements,
        h,
      ),
      ...(tooltip?.kind === 'tooltip' &&
      tooltip.props.content !== 'none' &&
      tooltipPoint !== undefined
        ? [
            h.div(
              [
                h.Class('cn-chart-tooltip cn-chart-tooltip-position'),
                h.Style({
                  left: `${Math.min(70, Math.max(5, (x(tooltipPoint.x) / width) * 100))}%`,
                  top: '0px',
                }),
                h.Role('status'),
              ],
              [
                h.div(
                  [h.Class('cn-chart-tooltip-label')],
                  [
                    tooltip.props.labelFormatter?.(
                      String(
                        at(
                          tooltipPoint.row,
                          xAxis?.kind === 'xAxis' ? (xAxis.props.dataKey ?? 'x') : 'x',
                        ) ?? '',
                      ),
                    ) ??
                      String(
                        at(
                          tooltipPoint.row,
                          xAxis?.kind === 'xAxis' ? (xAxis.props.dataKey ?? 'x') : 'x',
                        ) ?? '',
                      ),
                  ],
                ),
                h.div(
                  [h.Class('cn-chart-tooltip-row')],
                  [
                    `${tooltipPoint.item.props.name ?? keyName(tooltipPoint.item.props.dataKey)}: ${tooltip.props.formatter?.(numeric(at(tooltipPoint.row, tooltipPoint.item.props.dataKey)) ?? 0, tooltipPoint.item.props.name ?? keyName(tooltipPoint.item.props.dataKey)) ?? String(at(tooltipPoint.row, tooltipPoint.item.props.dataKey) ?? '')}`,
                  ],
                ),
              ],
            ),
          ]
        : []),
      ...(legend?.kind === 'legend'
        ? [
            h.div(
              [h.Class('cn-chart-legend cn-chart-legend-center')],
              series.map((item, index) =>
                h.span(
                  [
                    h.Class('cn-chart-legend-item'),
                    ...(props.onLegendHover === undefined
                      ? []
                      : [
                          h.OnMouseEnter(props.onLegendHover(keyName(item.props.dataKey))),
                          h.OnMouseLeave(props.onLegendHover(null)),
                        ]),
                    ...(props.onLegendClick === undefined
                      ? []
                      : [h.OnClick(props.onLegendClick(keyName(item.props.dataKey)))]),
                  ],
                  [
                    h.span(
                      [
                        h.Class('cn-chart-legend-circle'),
                        h.Style({
                          backgroundColor:
                            item.props.fill ?? palette[index % palette.length] ?? '#8884d8',
                        }),
                      ],
                      [],
                    ),
                    item.props.name ?? keyName(item.props.dataKey),
                  ],
                ),
              ),
            ),
          ]
        : []),
    ],
  )
}

const cartesian = <M>(kind: string, props: CartesianChartProps<M>, h: HtmlBuilder<M>): Html => {
  if (kind === 'scatter-chart') return scatterCartesian(props, h)
  const data = props.data ?? []
  const width = props.width ?? 700
  const height = props.height ?? 433
  const vertical = props.layout === 'vertical'
  const xAxis = props.children.find((child) => child.kind === 'xAxis')
  const yAxes = props.children.filter(
    (child): child is Extract<CartesianChild, { kind: 'yAxis' }> => child.kind === 'yAxis',
  )
  const leftAxis = yAxes.find((axis) => axis.props.orientation !== 'right')
  const rightAxis = yAxes.find((axis) => axis.props.orientation === 'right')
  const yAxis = leftAxis ?? rightAxis
  const dualAxes = !vertical && leftAxis !== undefined && rightAxis !== undefined
  const grid = props.children.find((child) => child.kind === 'grid')
  const brush = props.children.find((child) => child.kind === 'brush')
  const legend = props.children.find((child) => child.kind === 'legend')
  const series = props.children.filter(
    (child): child is Series =>
      (child.kind === 'line' ||
        child.kind === 'area' ||
        child.kind === 'bar' ||
        child.kind === 'scatter') &&
      child.props.hide !== true,
  )
  const axisWidth = (axis: typeof leftAxis): number => {
    if (axis === undefined || axis.props.hide || axis.props.mirror) return 0
    if (axis.props.width !== 'auto') return axis.props.width ?? 47
    const values = series.flatMap((item) =>
      (item.kind === 'line' ? data : (item.props.data ?? data)).flatMap((row) => {
        const value = numeric(at(row, item.props.dataKey))
        return value === undefined ? [] : [value]
      }),
    )
    const extremes = [0, Math.min(...values), Math.max(...values)]
    const labels = extremes.map(
      (value) => axis.props.tickFormatter?.(value) ?? String(Math.round(value)),
    )
    return Math.ceil(Math.max(...labels.map((label) => label.length)) * 7 + 8)
  }
  const margin = {
    top:
      (props.margin?.top ?? 5) +
      (legend?.kind === 'legend' && legend.props.position === 'top' ? 45 : 0),
    right:
      (props.margin?.right ?? (xAxis === undefined && yAxis === undefined ? 5 : 20)) +
      (rightAxis?.props.width === 'auto'
        ? axisWidth(rightAxis)
        : rightAxis === undefined || rightAxis.props.hide || rightAxis.props.mirror
          ? 0
          : (rightAxis.props.width ?? (dualAxes ? 41 : 47))),
    bottom:
      (props.margin?.bottom ?? 5) +
      (xAxis === undefined || xAxis.props.hide ? 0 : (xAxis.props.height ?? 30)) +
      (brush?.kind === 'brush' ? (brush.props.height ?? 30) + 10 : 0) +
      (legend?.kind === 'legend' &&
      legend.props.position !== 'top' &&
      legend.props.position !== 'insideTopRight'
        ? 25
        : 0),
    left: (props.margin?.left ?? 5) + axisWidth(leftAxis),
  }
  const left = margin.left
  const right = width - margin.right
  const top = margin.top
  const bottom = height - margin.bottom
  const catAxis = vertical ? yAxis : xAxis
  const numAxis = vertical ? xAxis : yAxis
  const categories = data.map((row, i) =>
    catAxis?.props.dataKey === undefined ? i : (at(row, catAxis.props.dataKey) ?? i),
  )
  const stackTotal = (item: Series, row: Datum): number => {
    const stackId = item.kind === 'line' ? undefined : item.props.stackId
    if (props.stackOffset !== 'expand' || stackId === undefined) return 1
    return series.reduce(
      (sum, other) =>
        other.kind !== 'line' && other.kind === item.kind && other.props.stackId === stackId
          ? sum + Math.max(0, numeric(at(row, other.props.dataKey)) ?? 0)
          : sum,
      0,
    )
  }
  const displayValue = (item: Series, row: Datum, value: number): number =>
    props.stackOffset === 'expand' ? value / Math.max(1, stackTotal(item, row)) : value
  const stackBase = (item: Series, row: Datum, value: number): number => {
    const start = rangeStart(at(row, item.props.dataKey))
    if (start !== undefined) return start
    if (item.kind === 'area' && item.props.baseValue !== undefined) {
      if (typeof item.props.baseValue === 'number') return item.props.baseValue
      const chartValues = data.flatMap((entry) => {
        const result = numeric(at(entry, item.props.dataKey))
        return result === undefined ? [] : [result]
      })
      return item.props.baseValue === 'dataMax'
        ? Math.max(...chartValues)
        : Math.min(...chartValues)
    }
    if (item.kind === 'line' || item.props.stackId === undefined) return 0
    const before = series.slice(0, series.indexOf(item))
    return before.reduce((sum, prior) => {
      if (
        prior.kind === 'line' ||
        prior.kind !== item.kind ||
        prior.props.stackId !== item.props.stackId ||
        prior.props.yAxisId !== item.props.yAxisId
      )
        return sum
      const priorValue = numeric(at(row, prior.props.dataKey)) ?? 0
      return Math.sign(priorValue) === Math.sign(value)
        ? sum + displayValue(item, row, priorValue)
        : sum
    }, 0)
  }
  const seriesValues = (items: ReadonlyArray<Series>): number[] =>
    items.flatMap((item) =>
      data.flatMap((row) => {
        const value = numeric(at(row, item.props.dataKey))
        const scaledValue = value === undefined ? undefined : displayValue(item, row, value)
        return scaledValue === undefined
          ? []
          : [
              scaledValue,
              stackBase(item, row, value ?? 0),
              scaledValue +
                (rangeStart(at(row, item.props.dataKey)) === undefined &&
                !(item.kind === 'area' && item.props.baseValue !== undefined)
                  ? stackBase(item, row, value ?? 0)
                  : 0),
            ]
      }),
    )
  const values = seriesValues(
    dualAxes ? series.filter((item) => item.props.yAxisId !== rightAxis.props.yAxisId) : series,
  )
  const rightValues = dualAxes
    ? seriesValues(series.filter((item) => item.props.yAxisId === rightAxis.props.yAxisId))
    : []
  const minValue = Math.min(0, ...values)
  const maxValue = Math.max(0, ...values)
  const domain = numAxis?.props.domain
  const resolve = (value: DomainEnd | undefined, fallback: number): number =>
    value === 'dataMin'
      ? values.length === 0
        ? 0
        : Math.min(...values)
      : value === 'dataMax'
        ? values.length === 0
          ? 1
          : Math.max(...values)
        : value === undefined || value === 'auto'
          ? fallback
          : typeof value === 'number'
            ? value
            : value.startsWith('dataMax + ')
              ? Math.max(...values) + Number(value.slice('dataMax + '.length))
              : Math.min(...values) - Number(value.slice('dataMin - '.length))
  const rawMin = resolve(domain?.[0], minValue)
  const rawMax = resolve(domain?.[1], maxValue || 1)
  const nice = numAxis?.props.ticks ?? niceTickValues(rawMin, rawMax, numAxis?.props.tickCount ?? 5)
  const snappedTicks = (() => {
    if (numAxis?.props.niceTicks !== 'snap125') return nice
    const target = Math.max(2, numAxis.props.tickCount ?? 5)
    const rawStep = (rawMax - rawMin) / (target - 1)
    const power = 10 ** Math.floor(Math.log10(Math.max(rawStep, 1)))
    const step = ([1, 2, 5, 10].find((value) => value * power >= rawStep) ?? 10) * power
    const start = Math.floor(rawMin / step) * step
    return Array.from({ length: target }, (_, index) => start + index * step)
  })()
  const min =
    domain?.[0] === undefined || domain[0] === 'auto' ? (snappedTicks[0] ?? rawMin) : rawMin
  const max =
    domain?.[1] === undefined || domain[1] === 'auto'
      ? (snappedTicks[snappedTicks.length - 1] ?? rawMax)
      : rawMax
  const rightDomain = rightAxis?.props.domain
  const rightRawMin =
    rightDomain?.[0] === undefined || rightDomain[0] === 'auto'
      ? Math.min(0, ...rightValues)
      : typeof rightDomain[0] === 'number'
        ? rightDomain[0]
        : Math.min(...rightValues)
  const rightRawMax =
    rightDomain?.[1] === undefined || rightDomain[1] === 'auto'
      ? Math.max(1, ...rightValues)
      : typeof rightDomain[1] === 'number'
        ? rightDomain[1]
        : Math.max(...rightValues)
  const rightNice = niceTickValues(rightRawMin, rightRawMax, rightAxis?.props.tickCount ?? 5)
  const rightMin =
    rightDomain?.[0] === undefined || rightDomain[0] === 'auto'
      ? (rightNice[0] ?? rightRawMin)
      : rightRawMin
  const rightMax =
    rightDomain?.[1] === undefined || rightDomain[1] === 'auto'
      ? (rightNice[rightNice.length - 1] ?? rightRawMax)
      : rightRawMax
  const count = Math.max(1, data.length)
  const band = (vertical ? bottom - top : right - left) / count
  const pointScale = !series.some((item) => item.kind === 'bar' || item.kind === 'scatter')
  const numericCategory = !vertical && catAxis?.props.type === 'number'
  const categoryValues = categories.flatMap((value) => {
    const result = numeric(value)
    return result === undefined ? [] : [result]
  })
  const categoryDomain = catAxis?.props.domain
  const categoryRawMin =
    typeof categoryDomain?.[0] === 'number'
      ? categoryDomain[0]
      : categoryDomain?.[0] === 'dataMin'
        ? Math.min(...categoryValues)
        : Math.min(0, ...categoryValues)
  const categoryRawMax =
    typeof categoryDomain?.[1] === 'number'
      ? categoryDomain[1]
      : categoryDomain?.[1] === 'dataMax'
        ? Math.max(...categoryValues)
        : Math.max(1, ...categoryValues)
  const categoryNice = niceTickValues(categoryRawMin, categoryRawMax, catAxis?.props.tickCount ?? 5)
  const categoryMin =
    categoryDomain?.[0] === undefined || categoryDomain[0] === 'auto'
      ? (categoryNice[0] ?? categoryRawMin)
      : categoryRawMin
  const categoryMax =
    categoryDomain?.[1] === undefined || categoryDomain[1] === 'auto'
      ? (categoryNice[categoryNice.length - 1] ?? categoryRawMax)
      : categoryRawMax
  const category = (i: number): number => {
    if (numericCategory)
      return scale(numeric(categories[i]) ?? 0, categoryMin, categoryMax, left, right)
    const start = vertical
      ? top + (catAxis?.props.padding?.top ?? 0)
      : left + (catAxis?.props.padding?.left ?? 0)
    const end = vertical
      ? bottom - (catAxis?.props.padding?.bottom ?? 0)
      : right - (catAxis?.props.padding?.right ?? 0)
    return pointScale && count > 1
      ? start + ((end - start) * i) / (count - 1)
      : start + ((end - start) * (i + 0.5)) / count
  }
  const categoryTicks = numericCategory
    ? (catAxis?.props.scale === 'time'
        ? Array.from(
            { length: catAxis.props.tickCount ?? 11 },
            (_, i) =>
              categoryMin +
              ((categoryMax - categoryMin) * i) / Math.max(1, (catAxis.props.tickCount ?? 11) - 1),
          )
        : categoryNice
      ).map((value) => ({
        value,
        position: scale(value, categoryMin, categoryMax, left, right),
        index: -1,
      }))
    : categories.map((value, index) => ({ value, position: category(index), index }))
  const longestCategoryLabel = categories
    .map((value) => String(value).length)
    .reduce((longest, length) => Math.max(longest, length), 0)
  const categoryTickCapacity = Math.max(
    2,
    Math.floor((vertical ? bottom - top : right - left) / Math.max(37, longestCategoryLabel * 7)),
  )
  const categoryStride =
    typeof catAxis?.props.interval === 'number'
      ? Math.max(1, catAxis.props.interval + 1)
      : Math.max(1, Math.ceil(categories.length / categoryTickCapacity))
  const visibleCategoryTicks = categoryTicks.filter(
    (tick) => tick.index < 0 || (categories.length - 1 - tick.index) % categoryStride === 0,
  )
  const position = (value: number): number =>
    vertical ? scale(value, min, max, left, right) : scale(value, min, max, bottom, top)
  const seriesPosition = (item: Series, value: number): number =>
    dualAxes && item.props.yAxisId === rightAxis.props.yAxisId
      ? scale(value, rightMin, rightMax, bottom, top)
      : position(value)
  const elements: Html[] = [...(props.defs ?? [])]
  const tickCount = Math.max(2, numAxis?.props.tickCount ?? 5)
  const ticks =
    numAxis?.props.ticks ??
    (domain === undefined
      ? dualAxes
        ? Array.from({ length: tickCount }, (_, i) => min + ((max - min) * i) / (tickCount - 1))
        : snappedTicks
      : Array.from({ length: tickCount }, (_, i) => min + ((max - min) * i) / (tickCount - 1)))
  if (grid?.kind === 'grid') {
    const stroke = grid.props.stroke ?? '#d6d3d1'
    const dash = grid.props.strokeDasharray ?? '3 3'
    if (grid.props.horizontal !== false)
      elements.push(
        ...(dualAxes && !vertical ? [min, max] : ticks).map((value) =>
          h.line(
            attrs(
              h,
              vertical
                ? {
                    x1: String(position(value)),
                    x2: String(position(value)),
                    y1: String(top),
                    y2: String(bottom),
                    stroke,
                    'stroke-dasharray': dash,
                  }
                : {
                    x1: String(left),
                    x2: String(right),
                    y1: String(position(value)),
                    y2: String(position(value)),
                    stroke,
                    'stroke-dasharray': dash,
                  },
            ),
          ),
        ),
      )
    if (grid.props.vertical !== false)
      elements.push(
        ...visibleCategoryTicks.map((tick) =>
          h.line(
            attrs(
              h,
              vertical
                ? {
                    x1: String(left),
                    x2: String(right),
                    y1: String(tick.position),
                    y2: String(tick.position),
                    stroke,
                    'stroke-dasharray': dash,
                  }
                : {
                    x1: String(tick.position),
                    x2: String(tick.position),
                    y1: String(top),
                    y2: String(bottom),
                    stroke,
                    'stroke-dasharray': dash,
                  },
            ),
          ),
        ),
      )
  }
  if (catAxis !== undefined && !catAxis.props.hide && !catAxis.props.mirror)
    elements.push(
      h.line(
        attrs(
          h,
          vertical
            ? {
                x1: String(left),
                x2: String(left),
                y1: String(top),
                y2: String(bottom),
                stroke: catAxis.props.stroke ?? '#666',
              }
            : {
                x1: String(left),
                x2: String(right),
                y1: String(bottom),
                y2: String(bottom),
                stroke: catAxis.props.stroke ?? '#666',
              },
        ),
      ),
    )
  if (numAxis !== undefined && !numAxis.props.hide && !numAxis.props.mirror)
    elements.push(
      h.line(
        attrs(
          h,
          vertical
            ? {
                x1: String(left),
                x2: String(right),
                y1: String(bottom),
                y2: String(bottom),
                stroke: numAxis.props.stroke ?? '#666',
              }
            : {
                x1: String(left),
                x2: String(left),
                y1: String(top),
                y2: String(bottom),
                stroke: numAxis.props.stroke ?? '#666',
              },
        ),
      ),
    )
  if (catAxis !== undefined && !catAxis.props.hide && catAxis.props.tick !== false)
    elements.push(
      ...visibleCategoryTicks.map(({ value, position: tickPosition, index }) =>
        // Callbacks preserve the upstream XAxis tick escape hatch.
        // oxlint-disable-next-line anti-slop/no-runtime-typeof
        typeof catAxis.props.tick === 'function'
          ? catAxis.props.tick({ x: tickPosition, y: bottom + 22, value, index, band })
          : h.text(
              attrs(
                h,
                vertical
                  ? {
                      x: String(left - 10),
                      y: String(tickPosition + 4),
                      'text-anchor': 'end',
                      fill: catAxis.props.stroke ?? '#666',
                      'font-size': '14',
                    }
                  : {
                      x: String(tickPosition),
                      y: String(bottom + 8),
                      'text-anchor': 'middle',
                      fill: catAxis.props.stroke ?? '#666',
                      'font-size': '14',
                    },
              ),
              [
                catAxis.props.tickFormatter?.(isNumberRange(value) ? value.join(', ') : value) ??
                  String(value),
              ],
            ),
      ),
    )
  if (!vertical)
    for (const secondary of props.children.filter((child) => child.kind === 'xAxis').slice(1)) {
      if (secondary.kind !== 'xAxis' || secondary.props.hide || secondary.props.tick === false)
        continue
      // Upstream uses a second XAxis to render quarter labels and boundary ticks.
      const tick = secondary.props.tick
      // oxlint-disable-next-line anti-slop/no-runtime-typeof
      if (typeof tick === 'function')
        elements.push(
          ...categories.map((value, i) =>
            tick({ x: category(i), y: bottom + 39, value, index: i, band }),
          ),
        )
    }
  if (numAxis !== undefined && !numAxis.props.hide && numAxis.props.tick !== false)
    elements.push(
      ...ticks.map((value, index) =>
        // Numeric axes accept the same custom tick callback as category axes.
        // oxlint-disable-next-line anti-slop/no-runtime-typeof
        typeof numAxis.props.tick === 'function'
          ? numAxis.props.tick({
              x: numAxis.props.orientation === 'right' ? right + 10 : left - 10,
              y: position(value) + 4,
              value,
              index,
              band,
            })
          : h.text(
              attrs(
                h,
                vertical
                  ? {
                      x: String(position(value)),
                      y: String(bottom + 8),
                      'text-anchor': 'middle',
                      fill: numAxis.props.stroke ?? '#666',
                      'font-size': '14',
                    }
                  : {
                      x: String(numAxis.props.orientation === 'right' ? right + 10 : left - 10),
                      y: String(position(value) + 4),
                      'text-anchor': numAxis.props.orientation === 'right' ? 'start' : 'end',
                      fill: numAxis.props.stroke ?? '#666',
                      'font-size': '14',
                    },
              ),
              [
                numAxis.props.tickFormatter?.(value) ??
                  `${Number(value.toFixed(1))}${numAxis.props.unit ?? ''}`,
              ],
            ),
      ),
    )
  if (dualAxes && !rightAxis.props.hide) {
    elements.push(
      h.line(
        attrs(h, {
          x1: String(right),
          x2: String(right),
          y1: String(top),
          y2: String(bottom),
          stroke: rightAxis.props.stroke ?? '#666',
        }),
      ),
    )
    if (rightAxis.props.tick !== false)
      elements.push(
        ...rightNice.map((value) =>
          h.text(
            attrs(h, {
              x: String(right + 10),
              y: String(scale(value, rightMin, rightMax, bottom, top) + 4),
              'text-anchor': 'start',
              fill: rightAxis.props.stroke ?? '#666',
              'font-size': '14',
            }),
            [
              rightAxis.props.tickFormatter?.(value) ??
                `${Number(value.toFixed(1))}${rightAxis.props.unit ?? ''}`,
            ],
          ),
        ),
      )
  }
  const xLabel = renderAxisLabel(h, xAxis?.props.label, 'x', { left, right, top, bottom })
  const yLabel = renderAxisLabel(h, yAxis?.props.label, 'y', { left, right, top, bottom })
  if (xLabel !== undefined) elements.push(xLabel)
  if (yLabel !== undefined) elements.push(yLabel)
  for (const reference of props.children) {
    if (reference.kind !== 'referenceLine') continue
    const categoryIndex = categories.findIndex((value) => value === reference.props.x)
    const at =
      reference.props.y === undefined
        ? categoryIndex < 0
          ? undefined
          : category(categoryIndex)
        : position(reference.props.y)
    if (at === undefined) continue
    const horizontal =
      (reference.props.y !== undefined && !vertical) ||
      (reference.props.y === undefined && vertical)
    elements.push(
      h.line(
        attrs(
          h,
          horizontal
            ? {
                x1: String(left),
                x2: String(right),
                y1: String(at),
                y2: String(at),
                stroke: reference.props.stroke ?? '#64748b',
                'stroke-width': String(reference.props.strokeWidth ?? 1),
                'stroke-opacity': String(reference.props.strokeOpacity ?? 1),
                ...(reference.props.strokeDasharray === undefined
                  ? {}
                  : { 'stroke-dasharray': reference.props.strokeDasharray }),
              }
            : {
                x1: String(at),
                x2: String(at),
                y1: String(top),
                y2: String(bottom),
                stroke: reference.props.stroke ?? '#64748b',
                'stroke-width': String(reference.props.strokeWidth ?? 1),
                'stroke-opacity': String(reference.props.strokeOpacity ?? 1),
                ...(reference.props.strokeDasharray === undefined
                  ? {}
                  : { 'stroke-dasharray': reference.props.strokeDasharray }),
              },
        ),
      ),
    )
    if (reference.props.label !== undefined) {
      const label =
        typeof reference.props.label === 'string'
          ? {
              value: reference.props.label,
              position: undefined,
              dx: undefined,
              dy: undefined,
              angle: undefined,
              fill: undefined,
            }
          : reference.props.label
      const x = horizontal
        ? label.position === 'left'
          ? left - 65
          : left + (label.dx ?? 0) + 5
        : at + (label.dx ?? 0)
      const y = horizontal ? at + (label.dy ?? 0) + 4 : bottom - 7 + (label.dy ?? 0)
      elements.push(
        h.text(
          attrs(h, {
            x: String(x),
            y: String(y),
            fill: label.fill ?? reference.props.stroke ?? '#64748b',
            'font-size': '12',
            ...(label.angle === undefined
              ? {}
              : { transform: `rotate(${label.angle}, ${x}, ${y})` }),
          }),
          [label.value],
        ),
      )
    }
  }
  const bars = series.filter((item) => item.kind === 'bar')
  const barGroups = [
    ...new Set(
      bars.map((item, index) =>
        item.kind === 'bar' && item.props.stackId !== undefined
          ? `stack:${item.props.stackId}`
          : `bar:${index}`,
      ),
    ),
  ]
  const categoryWidth = Math.max(1, band - (props.barCategoryGap ?? band * 0.1))
  const groupedBarWidth = categoryWidth / Math.max(1, barGroups.length)
  for (const item of bars) {
    if (
      item.kind !== 'bar' ||
      item.props.background === undefined ||
      item.props.background === false
    )
      continue
    const barGroup =
      item.props.stackId === undefined ? `bar:${bars.indexOf(item)}` : `stack:${item.props.stackId}`
    const barIndex = barGroups.indexOf(barGroup)
    const barWidth =
      item.props.barSize ?? Math.min(barGroups.length === 1 ? 70 : 44, groupedBarWidth)
    const background = item.props.background === true ? {} : item.props.background
    elements.push(
      ...data.map((_row, i) => {
        const thickness = Math.max(1, barWidth - (props.barGap ?? 1))
        const bounds = vertical
          ? {
              x: left,
              y: category(i) - (barGroups.length * barWidth) / 2 + barIndex * barWidth,
              width: right - left,
              height: thickness,
            }
          : {
              x: category(i) - (barGroups.length * barWidth) / 2 + barIndex * barWidth,
              y: top,
              width: thickness,
              height: bottom - top,
            }
        return h.rect(
          attrs(h, {
            x: String(bounds.x),
            y: String(bounds.y),
            width: String(bounds.width),
            height: String(bounds.height),
            fill: background.fill ?? '#eee',
            stroke: background.stroke ?? 'none',
          }),
        )
      }),
    )
  }
  for (const [seriesIndex, item] of series.entries()) {
    const color =
      (item.kind === 'line'
        ? item.props.stroke
        : item.kind === 'area'
          ? (item.props.stroke ?? item.props.fill)
          : (item.props.fill ?? item.props.stroke)) ??
      palette[seriesIndex % palette.length] ??
      '#8884d8'
    const points = data.map((row, i) => {
      const rawValue = numeric(at(row, item.props.dataKey))
      const value = rawValue === undefined ? undefined : displayValue(item, row, rawValue)
      const base = rawValue === undefined ? 0 : stackBase(item, row, rawValue)
      const high =
        rangeStart(at(row, item.props.dataKey)) === undefined &&
        !(item.kind === 'area' && item.props.baseValue !== undefined)
          ? (value ?? 0) + base
          : (value ?? 0)
      return {
        x: vertical ? seriesPosition(item, high) : category(i),
        y: vertical ? category(i) : seriesPosition(item, high),
        base: seriesPosition(item, base),
        value,
      }
    })
    if (item.kind === 'bar') {
      const barGroup =
        item.props.stackId === undefined
          ? `bar:${bars.indexOf(item)}`
          : `stack:${item.props.stackId}`
      const barIndex = barGroups.indexOf(barGroup)
      const barWidth =
        item.props.barSize ?? Math.min(barGroups.length === 1 ? 70 : 44, groupedBarWidth)
      elements.push(
        ...points.flatMap((point, i) => {
          if (point.value === undefined) return []
          const length = Math.max(
            Math.abs((vertical ? point.x : point.y) - point.base),
            item.props.minPointSize ?? 0,
          )
          const bounds = vertical
            ? {
                x: point.x < point.base ? point.base - length : point.base,
                y: category(i) - (barGroups.length * barWidth) / 2 + barIndex * barWidth,
                width: length,
                height: Math.max(1, barWidth - (props.barGap ?? 1)),
              }
            : {
                x: category(i) - (barGroups.length * barWidth) / 2 + barIndex * barWidth,
                y: point.y < point.base ? point.base - length : point.base,
                width: Math.max(1, barWidth - (props.barGap ?? 1)),
                height: length,
              }
          const radius = item.props.radius
          const duration = item.props.animationDuration
          const animationKey =
            duration === undefined
              ? undefined
              : `${bars.indexOf(item)}-${item.props.animationMatchBy === 'dataKey' ? String(at(data[i] ?? {}, 'label') ?? i) : i}`
          const transition =
            duration === undefined
              ? undefined
              : `x ${duration}ms linear, y ${duration}ms linear, width ${duration}ms linear, height ${duration}ms linear, d ${duration}ms linear`
          const animation =
            item.props.animationVariant === 'custom' && duration !== undefined
              ? `foldcn-bar-swipe-${vertical ? 'up' : 'left'} ${duration}ms linear both`
              : duration === undefined
                ? undefined
                : `foldcn-bar-grow-${vertical ? 'horizontal' : 'vertical'} ${duration}ms linear both`
          const animationStyle =
            duration === undefined
              ? []
              : [
                  h.Style({
                    transition: transition ?? '',
                    animation: animation ?? '',
                    ...(vertical
                      ? { '--foldcn-bar-distance': `${bounds.height * 2}px` }
                      : { '--foldcn-bar-distance': `${bounds.width * 2}px` }),
                    transformBox: 'fill-box',
                    transformOrigin: vertical ? 'left center' : 'center bottom',
                  }),
                ]
          const key = animationKey === undefined ? [] : [h.Key(animationKey)]
          const active =
            props.activeIndex === i &&
            item.props.activeBar !== undefined &&
            item.props.activeBar !== false
          // The public activeBar prop accepts a boolean or an attribute object.
          // oxlint-disable-next-line anti-slop/no-runtime-typeof
          const activeStyle =
            active && typeof item.props.activeBar === 'object' ? item.props.activeBar : undefined
          const cellFill = item.props.cells?.[i]?.fill ?? item.props.fill ?? color
          const cellStroke = active
            ? (activeStyle?.stroke ?? 'orange')
            : item.props.cells?.[i]?.stroke
          const cellStrokeWidth = active
            ? (activeStyle?.strokeWidth ?? 3)
            : cellStroke === undefined
              ? 0
              : 1
          const barLabel =
            item.props.label === undefined
              ? []
              : [
                  h.text(
                    attrs(h, {
                      x: String(
                        item.props.label === 'right' && vertical
                          ? point.value < 0
                            ? bounds.x - 5
                            : bounds.x + bounds.width + 5
                          : bounds.x + bounds.width / 2,
                      ),
                      y: String(
                        item.props.label === 'right' && vertical
                          ? bounds.y + bounds.height / 2 + 4
                          : bounds.y - 8,
                      ),
                      'text-anchor':
                        item.props.label === 'right' && vertical
                          ? point.value < 0
                            ? 'end'
                            : 'start'
                          : 'middle',
                      fill:
                        item.props.label === 'right'
                          ? '#444'
                          : (item.props.labelColors?.[i % item.props.labelColors.length] ??
                            cellFill),
                      'font-size': '12',
                    }),
                    [item.props.labelFormatter?.(point.value) ?? String(point.value)],
                  ),
                ]
          // Bar custom shapes are callbacks; scatter uses the string symbol names.
          // oxlint-disable-next-line anti-slop/no-runtime-typeof
          if (typeof item.props.shape === 'function')
            return [
              item.props.shape({
                ...bounds,
                payload: data[i] ?? {},
                index: i,
                fill: cellFill,
                isActive: active,
              }),
              ...barLabel,
            ]
          // The public radius prop accepts either a scalar or four corners.
          // oxlint-disable-next-line anti-slop/no-runtime-typeof
          if (radius !== undefined && typeof radius !== 'number') {
            const corner = (value: number): number =>
              Math.min(Math.max(0, value), bounds.width / 2, bounds.height / 2)
            const [topLeft, topRight, bottomRight, bottomLeft] = [
              corner(radius[0]),
              corner(radius[1]),
              corner(radius[2]),
              corner(radius[3]),
            ] as const
            const { x, y, width: w, height: rectHeight } = bounds
            const d = `M ${x + topLeft} ${y} H ${x + w - topRight} Q ${x + w} ${y} ${x + w} ${y + topRight} V ${y + rectHeight - bottomRight} Q ${x + w} ${y + rectHeight} ${x + w - bottomRight} ${y + rectHeight} H ${x + bottomLeft} Q ${x} ${y + rectHeight} ${x} ${y + rectHeight - bottomLeft} V ${y + topLeft} Q ${x} ${y} ${x + topLeft} ${y} Z`
            return [
              h.path([
                ...attrs(h, {
                  d,
                  fill: cellFill,
                  'fill-opacity': String(activeStyle?.fillOpacity ?? item.props.fillOpacity ?? 0.8),
                  stroke: cellStroke ?? 'none',
                  'stroke-width': String(cellStrokeWidth),
                }),
                ...animationStyle,
                ...key,
                ...(item.props.scrollAnimate
                  ? [
                      h.Style({
                        transformBox: 'fill-box',
                        transformOrigin: 'center bottom',
                        animation: 'foldcn-scroll-grow 1s linear both',
                        animationTimeline: 'scroll(root block)',
                        animationRange: '0% 50%',
                      }),
                    ]
                  : []),
              ]),
              ...barLabel,
            ]
          }
          return [
            h.rect([
              ...attrs(h, {
                x: String(bounds.x),
                y: String(bounds.y),
                width: String(bounds.width),
                height: String(bounds.height),
                fill: cellFill,
                'fill-opacity': String(activeStyle?.fillOpacity ?? item.props.fillOpacity ?? 0.8),
                stroke: cellStroke ?? 'none',
                'stroke-width': String(cellStrokeWidth),
                rx: String(radius ?? 0),
              }),
              ...animationStyle,
              ...key,
              ...(item.props.scrollAnimate
                ? [
                    h.Style({
                      transformBox: 'fill-box',
                      transformOrigin: 'center bottom',
                      animation: 'foldcn-scroll-grow 1s linear both',
                      animationTimeline: 'scroll(root block)',
                      animationRange: '0% 50%',
                    }),
                  ]
                : []),
            ]),
            ...barLabel,
          ]
        }),
      )
      const exitDatum = item.props.animationExitDatum
      const exitValue =
        exitDatum === undefined ? undefined : numeric(at(exitDatum, item.props.dataKey))
      if (
        exitDatum !== undefined &&
        exitValue !== undefined &&
        item.props.animationDuration !== undefined &&
        item.props.animationVariant === 'custom'
      ) {
        const base = seriesPosition(item, 0)
        const end = seriesPosition(item, exitValue)
        const length = Math.max(Math.abs(end - base), item.props.minPointSize ?? 0)
        const thickness = Math.max(1, barWidth - (props.barGap ?? 1))
        const bounds = vertical
          ? {
              x: Math.min(base, end),
              y: category(0) - (barGroups.length * barWidth) / 2 + barIndex * barWidth,
              width: length,
              height: thickness,
            }
          : {
              x: category(0) - (barGroups.length * barWidth) / 2 + barIndex * barWidth,
              y: Math.min(base, end),
              width: thickness,
              height: length,
            }
        elements.push(
          h.rect([
            ...attrs(h, {
              x: String(bounds.x),
              y: String(bounds.y),
              width: String(bounds.width),
              height: String(bounds.height),
              fill: item.props.fill ?? color,
              'fill-opacity': String(item.props.fillOpacity ?? 0.8),
            }),
            h.Style({
              animation: `foldcn-bar-swipe-out-${vertical ? 'up' : 'left'} ${item.props.animationDuration}ms linear both`,
              '--foldcn-bar-distance': `${(vertical ? bounds.height : bounds.width) * 2}px`,
            }),
            h.Key(`${bars.indexOf(item)}-exit-${String(at(exitDatum, 'label') ?? '')}`),
          ]),
        )
      }
    } else if (item.kind === 'scatter') {
      elements.push(
        ...points.flatMap((point) =>
          point.value === undefined
            ? []
            : [
                h.circle(
                  attrs(h, {
                    cx: String(point.x),
                    cy: String(point.y),
                    r: '5',
                    fill: item.props.fill ?? color,
                  }),
                ),
              ],
        ),
      )
    } else {
      const visible =
        item.kind === 'line' || item.props.connectNulls !== true
          ? points
          : points.filter((point) => point.value !== undefined)
      const path = line<(typeof points)[number]>()
        .defined((point) => point.value !== undefined)
        .x((point) => point.x)
        .y((point) => point.y)
        .curve(curve(item.props.type, item.kind === 'line' ? undefined : item.props.curveTension))(
        visible,
      )
      if (item.kind === 'area') {
        const shape = area<(typeof points)[number]>()
          .defined((point) => point.value !== undefined)
          .curve(curve(item.props.type, item.props.curveTension))
        const areaPath = vertical
          ? shape
              .y((point) => point.y)
              .x0((point) => point.base)
              .x1((point) => point.x)(visible)
          : shape
              .x((point) => point.x)
              .y0((point) => point.base)
              .y1((point) => point.y)(visible)
        if (areaPath !== null)
          elements.push(
            h.path([
              ...attrs(h, {
                d: areaPath,
                fill: item.props.fill ?? color,
                'fill-opacity': String(item.props.fillOpacity ?? 0.8),
                stroke: 'none',
              }),
              ...(item.props.animationKind === undefined
                ? []
                : [
                    h.Style({
                      animation: `foldcn-area-${item.props.animationKind} ${item.props.animationDuration ?? 900}ms linear both`,
                      transformBox: 'fill-box',
                      transformOrigin: 'center bottom',
                      transition: `d ${item.props.animationDuration ?? 900}ms linear`,
                    }),
                  ]),
              ...(item.props.animationKey === undefined
                ? []
                : [h.Key(`${item.props.animationKey}-fill`)]),
            ]),
          )
      }
      if (path !== null)
        elements.push(
          h.path([
            ...attrs(h, {
              d: path,
              fill: 'none',
              stroke: color,
              'stroke-width': String(item.props.strokeWidth ?? 2),
            }),
            ...(item.props.strokeDasharray === undefined
              ? []
              : [h.Attribute('stroke-dasharray', item.props.strokeDasharray)]),
            ...(item.kind !== 'area' || item.props.animationKind === undefined
              ? []
              : [
                  h.Style({
                    animation: `foldcn-area-${item.props.animationKind} ${item.props.animationDuration ?? 900}ms linear both`,
                    transformBox: 'fill-box',
                    transformOrigin: 'center bottom',
                    transition: `d ${item.props.animationDuration ?? 900}ms linear`,
                  }),
                ]),
            ...(item.kind !== 'area' || item.props.animationKey === undefined
              ? []
              : [h.Key(`${item.props.animationKey}-stroke`)]),
          ]),
        )
      if (item.kind === 'line' && item.props.dot !== false)
        elements.push(
          ...points.flatMap((point) =>
            point.value === undefined
              ? []
              : [
                  h.circle(
                    attrs(h, { cx: String(point.x), cy: String(point.y), r: '3', fill: color }),
                  ),
                ],
          ),
        )
    }
  }
  const tooltip = props.children.find((child) => child.kind === 'tooltip')
  const activeIndex =
    props.activeIndex ?? (tooltip?.kind === 'tooltip' ? tooltip.props.defaultIndex : undefined)
  const onActiveIndexChange = props.onActiveIndexChange
  if (onActiveIndexChange !== undefined)
    elements.push(
      ...categories.map((_, i) =>
        h.rect([
          ...attrs(
            h,
            vertical
              ? {
                  x: String(left),
                  y: String(category(i) - band / 2),
                  width: String(right - left),
                  height: String(band),
                  fill: 'transparent',
                }
              : {
                  x: String(category(i) - band / 2),
                  y: String(top),
                  width: String(band),
                  height: String(bottom - top),
                  fill: 'transparent',
                },
          ),
          h.OnMouseEnter(onActiveIndexChange(i)),
        ]),
      ),
    )
  const activeRow =
    activeIndex === undefined || activeIndex === null ? undefined : data[activeIndex]
  const activeCategory = categories[activeIndex ?? 0]
  const activeLabel = isNumberRange(activeCategory)
    ? activeCategory.join(', ')
    : (activeCategory ?? '')
  if (
    props.activeLabels &&
    activeRow !== undefined &&
    activeIndex !== null &&
    activeIndex !== undefined
  ) {
    const x = category(activeIndex)
    elements.push(
      ...series.flatMap((item) => {
        const raw = at(activeRow, item.props.dataKey)
        const value = numeric(raw)
        if (value === undefined) return []
        const y = seriesPosition(item, value)
        const label = isNumberRange(raw) ? raw.join(', ') : String(raw)
        return [
          h.text(
            attrs(h, {
              x: String(x + 10),
              y: String(y + 5),
              fill: '#333',
              'font-size': '12',
              'pointer-events': 'none',
            }),
            [label],
          ),
        ]
      }),
    )
  }
  if (brush?.kind === 'brush') {
    const brushHeight = brush.props.height ?? 30
    const brushY = height - (props.margin?.bottom ?? 5) - brushHeight
    const stroke = brush.props.stroke ?? '#8884d8'
    const total = Math.max(1, props.brushDataLength ?? data.length)
    const onBrushEnd = props.onBrushEnd
    const [startIndex, endIndex] = props.brushRange ?? [0, total - 1]
    const handleX = (index: number): number =>
      left + ((right - left - 5) * index) / Math.max(1, total - 1)
    const startX = handleX(startIndex)
    const endX = handleX(endIndex)
    elements.push(
      h.rect(
        attrs(h, {
          x: String(left),
          y: String(brushY),
          width: String(right - left),
          height: String(brushHeight),
          fill: '#eee',
          stroke,
        }),
      ),
      h.rect(
        attrs(h, {
          x: String(startX + 5),
          y: String(brushY),
          width: String(Math.max(0, endX - startX)),
          height: String(brushHeight),
          fill: stroke,
          'fill-opacity': '0.2',
        }),
      ),
      ...(onBrushEnd === undefined
        ? []
        : Array.from({ length: total }, (_, index) =>
            h.rect([
              ...attrs(h, {
                x: String(left + ((right - left) * index) / total),
                y: String(brushY),
                width: String((right - left) / total),
                height: String(brushHeight),
                fill: 'transparent',
              }),
              h.OnMouseUp(onBrushEnd(index)),
            ]),
          )),
      h.rect([
        ...attrs(h, {
          x: String(startX),
          y: String(brushY),
          width: '5',
          height: String(brushHeight),
          fill: stroke,
          cursor: 'col-resize',
        }),
        ...(props.onBrushStart === undefined ? [] : [h.OnMouseDown(props.onBrushStart('start'))]),
        ...(props.onBrushEnd === undefined ? [] : [h.OnMouseUp(props.onBrushEnd(startIndex))]),
      ]),
      h.rect([
        ...attrs(h, {
          x: String(endX),
          y: String(brushY),
          width: '5',
          height: String(brushHeight),
          fill: stroke,
          cursor: 'col-resize',
        }),
        ...(props.onBrushStart === undefined ? [] : [h.OnMouseDown(props.onBrushStart('end'))]),
        ...(props.onBrushEnd === undefined ? [] : [h.OnMouseUp(props.onBrushEnd(endIndex))]),
      ]),
    )
  }
  if (legend?.kind === 'legend' && legend.props.position === 'top') {
    const items = series
      .filter((item) => item.props.legendType !== 'none')
      .sort(
        (a, b) =>
          legend.props.itemSorter?.(
            a.props.name ?? keyName(a.props.dataKey),
            b.props.name ?? keyName(b.props.dataKey),
          ) ?? 0,
      )
    const totalWidth = items.reduce(
      (sum, item) => sum + 24 + (item.props.name ?? keyName(item.props.dataKey)).length * 7,
      0,
    )
    let cursor = (width - totalWidth) / 2
    items.forEach((item, index) => {
      const color =
        (item.kind === 'line' ? item.props.stroke : (item.props.fill ?? item.props.stroke)) ??
        palette[index % palette.length] ??
        '#8884d8'
      elements.push(
        h.rect(attrs(h, { x: String(cursor), y: '25', width: '14', height: '14', fill: color })),
        h.text(attrs(h, { x: String(cursor + 18), y: '37', fill: '#888', 'font-size': '12' }), [
          item.props.name ?? keyName(item.props.dataKey),
        ]),
      )
      cursor += 24 + (item.props.name ?? keyName(item.props.dataKey)).length * 7
    })
  }
  if (legend?.kind === 'legend' && legend.props.position === 'insideTopRight') {
    const items = series
      .filter((item) => item.props.legendType !== 'none')
      .sort(
        (a, b) =>
          legend.props.itemSorter?.(
            a.props.name ?? keyName(a.props.dataKey),
            b.props.name ?? keyName(b.props.dataKey),
          ) ?? 0,
      )
    const totalWidth = items.reduce(
      (sum, item) => sum + 24 + (item.props.name ?? keyName(item.props.dataKey)).length * 7,
      0,
    )
    let cursor = right - totalWidth
    items.forEach((item) => {
      const color =
        (item.kind === 'line' ? undefined : item.props.fill) ??
        item.props.stroke ??
        palette[series.indexOf(item) % palette.length] ??
        '#8884d8'
      elements.push(
        h.rect(
          attrs(h, {
            x: String(cursor),
            y: String(top + 8),
            width: '14',
            height: '14',
            fill: color,
          }),
        ),
        h.text(
          attrs(h, {
            x: String(cursor + 18),
            y: String(top + 20),
            fill: '#888',
            'font-size': '12',
          }),
          [item.props.name ?? keyName(item.props.dataKey)],
        ),
      )
      cursor += 24 + (item.props.name ?? keyName(item.props.dataKey)).length * 7
    })
  }
  return h.div(
    [h.Class(cn('cn-chart-root', props.className)), h.DataAttribute('slot', kind)],
    [
      ...(series.some((item) => item.kind === 'bar' && item.props.scrollAnimate)
        ? [
            h.style(
              [],
              [
                '@keyframes foldcn-scroll-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }',
              ],
            ),
          ]
        : []),
      ...(series.some((item) => item.kind === 'bar' && item.props.animationDuration !== undefined)
        ? [
            h.style(
              [],
              [
                '@keyframes foldcn-bar-grow-vertical { from { transform: scaleY(0); } to { transform: scaleY(1); } } @keyframes foldcn-bar-grow-horizontal { from { transform: scaleX(0); } to { transform: scaleX(1); } } @keyframes foldcn-bar-swipe-left { from { transform: translateX(var(--foldcn-bar-distance)); } to { transform: translateX(0); } } @keyframes foldcn-bar-swipe-up { from { transform: translateY(var(--foldcn-bar-distance)); } to { transform: translateY(0); } } @keyframes foldcn-bar-swipe-out-left { from { transform: translateX(0); } to { transform: translateX(calc(-1 * var(--foldcn-bar-distance))); } } @keyframes foldcn-bar-swipe-out-up { from { transform: translateY(0); } to { transform: translateY(calc(-1 * var(--foldcn-bar-distance))); } }',
              ],
            ),
          ]
        : []),
      ...(series.some((item) => item.kind === 'area' && item.props.animationKind !== undefined)
        ? [
            h.style(
              [],
              [
                '@keyframes foldcn-area-grow-from-bottom { from { transform: scaleY(0); } to { transform: scaleY(1); } } @keyframes foldcn-area-reveal-top { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0); } } @keyframes foldcn-area-reveal-left { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0); } }',
              ],
            ),
          ]
        : []),
      h.svg(
        [
          h.ViewBox(`0 0 ${width} ${height}`),
          h.Attribute('width', props.responsive ? '100%' : String(width)),
          h.Attribute('height', String(height)),
          h.Attribute('font-family', 'Arial, sans-serif'),
          ...(props.responsive ? [h.Style({ height: 'auto', maxWidth: `${width}px` })] : []),
          h.Role('img'),
          h.AriaLabel(props.title ?? kind),
          ...(props.accessibilityLayer !== false && onActiveIndexChange !== undefined
            ? [
                h.Tabindex(0),
                h.OnKeyDownPreventDefault((key) => {
                  if (key === 'Escape') return Option.some(onActiveIndexChange(null))
                  if (data.length === 0) return Option.none()
                  if (key === 'Home') return Option.some(onActiveIndexChange(0))
                  if (key === 'End') return Option.some(onActiveIndexChange(data.length - 1))
                  const forward = vertical ? key === 'ArrowDown' : key === 'ArrowRight'
                  const backward = vertical ? key === 'ArrowUp' : key === 'ArrowLeft'
                  if (!forward && !backward) return Option.none()
                  const next =
                    activeIndex === null || activeIndex === undefined
                      ? forward
                        ? 0
                        : data.length - 1
                      : Math.min(data.length - 1, Math.max(0, activeIndex + (forward ? 1 : -1)))
                  return Option.some(onActiveIndexChange(next))
                }),
              ]
            : []),
          ...(onActiveIndexChange === undefined ? [] : [h.OnMouseLeave(onActiveIndexChange(null))]),
        ],
        elements,
      ),
      ...(tooltip?.kind === 'tooltip' && tooltip.props.content !== 'none' && activeRow !== undefined
        ? [
            h.div(
              [
                h.Class('cn-chart-tooltip cn-chart-tooltip-position'),
                h.Style({
                  left: `${Math.min(70, Math.max(5, (category(activeIndex ?? 0) / width) * 100))}%`,
                  top: '8px',
                }),
                h.Role('status'),
              ],
              [
                h.div(
                  [h.Class('cn-chart-tooltip-label')],
                  [tooltip.props.labelFormatter?.(activeLabel) ?? String(activeLabel)],
                ),
                ...series.flatMap((item) => {
                  const value = numeric(at(activeRow, item.props.dataKey))
                  const name = item.props.name ?? keyName(item.props.dataKey)
                  return value === undefined
                    ? []
                    : [
                        h.div(
                          [h.Class('cn-chart-tooltip-row')],
                          [`${name}: ${tooltip.props.formatter?.(value, name) ?? value}`],
                        ),
                      ]
                }),
              ],
            ),
          ]
        : []),
      ...(legend?.kind === 'legend' &&
      legend.props.position !== 'top' &&
      legend.props.position !== 'insideTopRight'
        ? [
            h.div(
              [
                h.Class('cn-chart-legend cn-chart-legend-center'),
                h.Style({
                  position: 'absolute',
                  bottom: `${props.margin?.bottom ?? 5}px`,
                  left: '0',
                  right: '0',
                  padding: '3px',
                  paddingTop: legend.props.wrapperStyle?.paddingTop ?? '3px',
                  lineHeight: legend.props.wrapperStyle?.lineHeight ?? '18px',
                  backgroundColor: legend.props.wrapperStyle?.backgroundColor ?? '#fff',
                  borderRadius: '4px',
                }),
              ],
              series
                .filter((item) => item.props.legendType !== 'none')
                .map((item, index) =>
                  h.span(
                    [
                      h.Class('cn-chart-legend-item'),
                      ...(props.onLegendHover === undefined
                        ? []
                        : [
                            h.OnMouseEnter(props.onLegendHover(keyName(item.props.dataKey))),
                            h.OnMouseLeave(props.onLegendHover(null)),
                          ]),
                      ...(props.onLegendClick === undefined
                        ? []
                        : [h.OnClick(props.onLegendClick(keyName(item.props.dataKey)))]),
                    ],
                    [
                      h.span(
                        [
                          h.Class(
                            item.kind === 'line'
                              ? 'cn-chart-legend-swatch'
                              : 'cn-chart-legend-square',
                          ),
                          h.Style({
                            backgroundColor:
                              (item.kind === 'line'
                                ? item.props.stroke
                                : (item.props.fill ?? item.props.stroke)) ??
                              palette[index % palette.length] ??
                              '#8884d8',
                          }),
                        ],
                        [],
                      ),
                      item.props.name ?? keyName(item.props.dataKey),
                    ],
                  ),
                ),
            ),
          ]
        : []),
    ],
  )
}
export const AreaChart = <M>(props: CartesianChartProps<M>, h: HtmlBuilder<M>): Html =>
  cartesian('area-chart', props, h)
export const BarChart = <M>(props: CartesianChartProps<M>, h: HtmlBuilder<M>): Html =>
  cartesian('bar-chart', props, h)
export const ComposedChart = <M>(props: CartesianChartProps<M>, h: HtmlBuilder<M>): Html =>
  cartesian('composed-chart', props, h)
export const ScatterChart = <M>(props: CartesianChartProps<M>, h: HtmlBuilder<M>): Html =>
  cartesian('scatter-chart', props, h)

export type PolarSeriesProps = Readonly<{
  dataKey: DataKey
  nameKey?: DataKey
  name?: string
  cx?: number | `${number}%`
  cy?: number | `${number}%`
  innerRadius?: number | `${number}%`
  outerRadius?: number | `${number}%`
  startAngle?: number
  endAngle?: number
  paddingAngle?: number
  cornerRadius?: number | `${number}%`
  fill?: string
  stroke?: string
  fillOpacity?: number
  colors?: ReadonlyArray<string>
  gradientColors?: ReadonlyArray<string>
  label?: boolean | 'percent' | Readonly<{ position?: 'insideStart' | 'insideEnd' | 'outside' }>
  activeShape?: 'callout'
  fadeOnHover?: boolean
  background?: boolean
  data?: ReadonlyArray<Datum>
  animationKind?: 'center-out' | 'point-to-point'
  animationDuration?: number
  animationKey?: string
}>
export type PolarChild =
  | Readonly<{ kind: 'pie'; props: PolarSeriesProps }>
  | Readonly<{ kind: 'radar'; props: PolarSeriesProps }>
  | Readonly<{ kind: 'radialBar'; props: PolarSeriesProps }>
  | Readonly<{ kind: 'polarGrid' }>
  | Readonly<{ kind: 'polarAngleAxis'; props: Readonly<{ dataKey?: DataKey }> }>
  | Readonly<{
      kind: 'polarRadiusAxis'
      props: Readonly<{
        domain?: readonly [number | 'auto' | 'dataMin', number | 'auto' | 'dataMax']
        angle?: number
        ticks?: ReadonlyArray<number>
      }>
    }>
  | Readonly<{ kind: 'label'; props: Readonly<{ value: string; position?: 'center' }> }>
  | Readonly<{
      kind: 'needle'
      props: Readonly<{ dataKey: DataKey; index?: number; color?: string; baseRadius?: number }>
    }>
  | Extract<LineChild, { kind: 'tooltip' | 'legend' }>
export const Pie = (props: PolarSeriesProps): PolarChild => ({ kind: 'pie', props })
export const Radar = (props: PolarSeriesProps): PolarChild => ({ kind: 'radar', props })
export const RadialBar = (props: PolarSeriesProps): PolarChild => ({ kind: 'radialBar', props })
export const PolarGrid = (): PolarChild => ({ kind: 'polarGrid' })
export const Label = (props: Readonly<{ value: string; position?: 'center' }>): PolarChild => ({
  kind: 'label',
  props,
})
export const Needle = (
  props: Readonly<{ dataKey: DataKey; index?: number; color?: string; baseRadius?: number }>,
): PolarChild => ({ kind: 'needle', props })
export const PolarAngleAxis = (props: Readonly<{ dataKey?: DataKey }> = {}): PolarChild => ({
  kind: 'polarAngleAxis',
  props,
})
export const PolarRadiusAxis = (
  props: Readonly<{
    domain?: readonly [number | 'auto' | 'dataMin', number | 'auto' | 'dataMax']
    angle?: number
    ticks?: ReadonlyArray<number>
  }> = {},
): PolarChild => ({ kind: 'polarRadiusAxis', props })
export type PolarChartProps<M = unknown> = Readonly<{
  data?: ReadonlyArray<Datum>
  children: ReadonlyArray<PolarChild>
  width?: number
  height?: number
  cx?: number | `${number}%`
  cy?: number | `${number}%`
  innerRadius?: number | `${number}%`
  outerRadius?: number | `${number}%`
  startAngle?: number
  endAngle?: number
  barSize?: number
  margin?: Margin
  responsive?: boolean
  className?: string
  title?: string
  activeIndex?: number | null
  onActiveIndexChange?: (index: number | null) => M
}>
const palette = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#8dd1e1', '#d0ed57']
const piePalette = ['#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#ff7300']
const polarMeasure = (
  value: number | `${number}%` | undefined,
  total: number,
  fallback: number,
): number =>
  value === undefined
    ? fallback
    : typeof value === 'number'
      ? value
      : (Number(value.slice(0, -1)) / 100) * total
// Foldkit normalizes whitespace in attribute values. Commas preserve the SVG point separators.
const svgPoints = (points: ReadonlyArray<readonly [number, number]>): string =>
  points.flatMap(([x, y]) => [x, y]).join(',')
const polar = <M>(
  kind: 'pie-chart' | 'radar-chart' | 'radial-bar-chart',
  props: PolarChartProps<M>,
  h: HtmlBuilder<M>,
): Html => {
  const width = props.width ?? (kind === 'radial-bar-chart' ? 700 : 500)
  const height = props.height ?? (kind === 'radial-bar-chart' ? 433 : 500)
  const plotLeft = kind === 'pie-chart' ? (props.margin?.left ?? 5) : 0
  const plotRight = kind === 'pie-chart' ? (props.margin?.right ?? 5) : 0
  const plotTop = kind === 'pie-chart' ? (props.margin?.top ?? 5) : 0
  const plotBottom = kind === 'pie-chart' ? (props.margin?.bottom ?? 5) : 0
  const plotWidth = width - plotLeft - plotRight
  const plotHeight = height - plotTop - plotBottom
  const centerX = (value: number | `${number}%` | undefined): number =>
    value === undefined
      ? plotLeft + plotWidth / 2
      : typeof value === 'number'
        ? value
        : plotLeft + polarMeasure(value, plotWidth, plotWidth / 2)
  const centerY = (value: number | `${number}%` | undefined): number =>
    value === undefined
      ? plotTop + plotHeight / 2
      : typeof value === 'number'
        ? value
        : plotTop + polarMeasure(value, plotHeight, plotHeight / 2)
  const cx = centerX(props.cx)
  const cy = centerY(props.cy)
  const maxRadius = Math.max(
    10,
    kind === 'radial-bar-chart'
      ? Math.min(width, height) * 0.38
      : kind === 'pie-chart'
        ? Math.min(plotWidth, plotHeight) / 2
        : (Math.min(width, height) / 2 - 5) * 0.8,
  )
  const series = props.children.filter(
    (child): child is Extract<PolarChild, { kind: 'pie' | 'radar' | 'radialBar' }> =>
      child.kind === 'pie' || child.kind === 'radar' || child.kind === 'radialBar',
  )
  const elements: Html[] = []
  for (const item of series) {
    const rows = item.props.data ?? props.data ?? []
    const values = rows.map((row) => Math.max(0, numeric(at(row, item.props.dataKey)) ?? 0))
    const radius = polarMeasure(
      item.props.outerRadius ?? props.outerRadius,
      maxRadius,
      kind === 'pie-chart' ? maxRadius * 0.8 : maxRadius,
    )
    const inner = polarMeasure(item.props.innerRadius ?? props.innerRadius, maxRadius, 0)
    if (item.kind === 'pie') {
      const pieCx = centerX(item.props.cx ?? props.cx)
      const pieCy = centerY(item.props.cy ?? props.cy)
      const gradientPrefix = `chart-pie-gradient-${(props.title ?? 'pie').replace(/[^a-z0-9]/gi, '-').toLowerCase()}`
      if (item.props.gradientColors !== undefined)
        elements.push(
          h.defs(
            [],
            item.props.gradientColors.map((color, i) =>
              h.radialGradient(
                attrs(h, {
                  id: `${gradientPrefix}-${i}`,
                  cx: String(pieCx),
                  cy: String(pieCy),
                  r: String(radius),
                  gradientUnits: 'userSpaceOnUse',
                }),
                [
                  h.stop(attrs(h, { offset: '0%', 'stop-color': color, 'stop-opacity': '0' })),
                  h.stop(attrs(h, { offset: '100%', 'stop-color': color, 'stop-opacity': '0.8' })),
                ],
              ),
            ),
          ),
        )
      const slices = pie<number>()
        .sort(null)
        .padAngle(((item.props.paddingAngle ?? 0) * Math.PI) / 180)
        .startAngle(
          Math.PI / 2 - ((item.props.startAngle ?? props.startAngle ?? 0) * Math.PI) / 180,
        )
        .endAngle(Math.PI / 2 - ((item.props.endAngle ?? props.endAngle ?? 360) * Math.PI) / 180)(
        values,
      )
      const sliceArc = arc<(typeof slices)[number]>()
        .innerRadius(inner)
        .outerRadius(radius)
        .cornerRadius(polarMeasure(item.props.cornerRadius, radius - inner, 0))
      elements.push(
        ...slices.flatMap((slice, i) => {
          const path = sliceArc(slice)
          const label =
            item.props.nameKey === undefined
              ? at(rows[i] ?? {}, item.props.dataKey)
              : at(rows[i] ?? {}, item.props.nameKey)
          const fill =
            (item.props.gradientColors === undefined
              ? undefined
              : `url(#${gradientPrefix}-${i % item.props.gradientColors.length})`) ??
            stringColor(rows[i]?.fill) ??
            item.props.colors?.[i % item.props.colors.length] ??
            item.props.fill ??
            piePalette[i % piePalette.length] ??
            '#8884d8'
          const isActive = props.activeIndex === i
          const fillOpacity =
            item.props.fadeOnHover &&
            props.activeIndex !== null &&
            props.activeIndex !== undefined &&
            !isActive
              ? 0.5
              : (item.props.fillOpacity ?? 0.8)
          const labelLineStart = arc<(typeof slices)[number]>()
            .innerRadius(radius + 2)
            .outerRadius(radius + 2)
            .centroid(slice)
          const labelLineEnd = arc<(typeof slices)[number]>()
            .innerRadius(radius + 18)
            .outerRadius(radius + 18)
            .centroid(slice)
          const [labelX, labelY] = arc<(typeof slices)[number]>()
            .innerRadius(radius + 20)
            .outerRadius(radius + 20)
            .centroid(slice)
          return path === null
            ? []
            : [
                ...(item.props.gradientColors === undefined
                  ? []
                  : [
                      h.defs(
                        [],
                        [
                          h.radialGradient(
                            attrs(h, { id: `${gradientPrefix}-border-${i}`, cx: '0', cy: '0' }),
                            [
                              h.stop(
                                attrs(h, {
                                  offset: '0%',
                                  'stop-color':
                                    item.props.gradientColors[
                                      i % item.props.gradientColors.length
                                    ] ?? '#8884d8',
                                  'stop-opacity': '0',
                                }),
                              ),
                              h.stop(
                                attrs(h, {
                                  offset: '100%',
                                  'stop-color':
                                    item.props.gradientColors[
                                      i % item.props.gradientColors.length
                                    ] ?? '#8884d8',
                                  'stop-opacity': '0.8',
                                }),
                              ),
                            ],
                          ),
                          h.clipPath(
                            attrs(h, {
                              id: `${gradientPrefix}-clip-${i}`,
                              clipPathUnits: 'userSpaceOnUse',
                            }),
                            [h.path(attrs(h, { d: path }))],
                          ),
                        ],
                      ),
                    ]),
                h.path([
                  ...attrs(h, {
                    d: path,
                    transform: `translate(${pieCx},${pieCy})`,
                    fill,
                    stroke:
                      item.props.gradientColors === undefined
                        ? (item.props.stroke ?? '#fff')
                        : `url(#${gradientPrefix}-border-${i})`,
                    'stroke-width':
                      item.props.gradientColors === undefined ? '2' : isActive ? '100%' : '0',
                    ...(item.props.gradientColors === undefined
                      ? {}
                      : { 'clip-path': `url(#${gradientPrefix}-clip-${i})` }),
                    'fill-opacity': String(
                      item.props.gradientColors === undefined ? fillOpacity : 1,
                    ),
                  }),
                  ...(props.onActiveIndexChange === undefined
                    ? []
                    : [h.OnMouseEnter(props.onActiveIndexChange(i))]),
                ]),
                ...(item.props.label === 'percent'
                  ? [
                      h.text(
                        attrs(h, {
                          x: String(
                            pieCx +
                              arc<(typeof slices)[number]>()
                                .innerRadius((inner + radius) / 2)
                                .outerRadius((inner + radius) / 2)
                                .centroid(slice)[0],
                          ),
                          y: String(
                            pieCy +
                              arc<(typeof slices)[number]>()
                                .innerRadius((inner + radius) / 2)
                                .outerRadius((inner + radius) / 2)
                                .centroid(slice)[1],
                          ),
                          fill: '#fff',
                          'text-anchor': 'middle',
                          'dominant-baseline': 'central',
                          'font-size': '14',
                        }),
                        [
                          `${Math.round(
                            ((values[i] ?? 0) /
                              Math.max(
                                1,
                                values.reduce((sum, value) => sum + value, 0),
                              )) *
                              100,
                          )}%`,
                        ],
                      ),
                    ]
                  : []),
                ...(item.props.activeShape === 'callout' && isActive
                  ? (() => {
                      const angle = (slice.startAngle + slice.endAngle) / 2
                      const dx = Math.sin(angle)
                      const dy = -Math.cos(angle)
                      const sx = pieCx + (radius + 10) * dx
                      const sy = pieCy + (radius + 10) * dy
                      const mx = pieCx + (radius + 30) * dx
                      const my = pieCy + (radius + 30) * dy
                      const ex = mx + (dx >= 0 ? 22 : -22)
                      const textX = ex + (dx >= 0 ? 12 : -12)
                      const ring = arc<(typeof slices)[number]>()
                        .innerRadius(radius + 6)
                        .outerRadius(radius + 10)(slice)
                      return [
                        h.text(
                          attrs(h, {
                            x: String(pieCx),
                            y: String(pieCy + 8),
                            'text-anchor': 'middle',
                            fill,
                          }),
                          [String(rows[i]?.name ?? '')],
                        ),
                        ...(ring === null
                          ? []
                          : [
                              h.path(
                                attrs(h, {
                                  d: ring,
                                  transform: `translate(${pieCx},${pieCy})`,
                                  fill,
                                }),
                              ),
                            ]),
                        h.path(
                          attrs(h, {
                            d: `M${sx},${sy}L${mx},${my}L${ex},${my}`,
                            stroke: fill,
                            fill: 'none',
                          }),
                        ),
                        h.circle(
                          attrs(h, {
                            cx: String(ex),
                            cy: String(my),
                            r: '2',
                            fill,
                            stroke: 'none',
                          }),
                        ),
                        h.text(
                          attrs(h, {
                            x: String(textX),
                            y: String(my),
                            'text-anchor': dx >= 0 ? 'start' : 'end',
                            fill: '#333',
                            'font-size': '12',
                          }),
                          [`PV ${values[i] ?? 0}`],
                        ),
                        h.text(
                          attrs(h, {
                            x: String(textX),
                            y: String(my + 18),
                            'text-anchor': dx >= 0 ? 'start' : 'end',
                            fill: '#999',
                            'font-size': '12',
                          }),
                          [
                            `(Rate ${(
                              ((values[i] ?? 0) /
                                Math.max(
                                  1,
                                  values.reduce((sum, value) => sum + value, 0),
                                )) *
                              100
                            ).toFixed(2)}%)`,
                          ],
                        ),
                      ]
                    })()
                  : []),
                ...(item.props.label === true
                  ? [
                      h.line(
                        attrs(h, {
                          x1: String(pieCx + labelLineStart[0]),
                          y1: String(pieCy + labelLineStart[1]),
                          x2: String(pieCx + labelLineEnd[0]),
                          y2: String(pieCy + labelLineEnd[1]),
                          stroke: fill,
                          'stroke-opacity': String(item.props.fillOpacity ?? 0.8),
                        }),
                      ),
                      h.text(
                        attrs(h, {
                          x: String(pieCx + labelX),
                          y: String(pieCy + labelY),
                          'text-anchor': labelX >= 0 ? 'start' : 'end',
                          fill,
                          'fill-opacity': String(item.props.fillOpacity ?? 0.8),
                          'font-size': '12',
                        }),
                        [String(label ?? '')],
                      ),
                    ]
                  : []),
              ]
        }),
      )
    } else if (item.kind === 'radar') {
      const radiusAxis = props.children.find((child) => child.kind === 'polarRadiusAxis')
      const max =
        radiusAxis?.kind === 'polarRadiusAxis'
          ? typeof radiusAxis.props.domain?.[1] === 'number'
            ? radiusAxis.props.domain[1]
            : Math.max(1, ...values)
          : Math.max(1, ...values)
      const radialTicks =
        radiusAxis?.kind === 'polarRadiusAxis' && radiusAxis.props.ticks !== undefined
          ? radiusAxis.props.ticks
          : [0, max * 0.25, max * 0.5, max * 0.75, max]
      const radialFractions = radialTicks.filter((tick) => tick > 0).map((tick) => tick / max)
      if (props.children.some((child) => child.kind === 'polarGrid') && item === series[0]) {
        const gridPoints = (fraction: number): ReadonlyArray<readonly [number, number]> =>
          values.map((_, i) => {
            const angle = -Math.PI / 2 + (i * Math.PI * 2) / values.length
            return [
              cx + radius * fraction * Math.cos(angle),
              cy + radius * fraction * Math.sin(angle),
            ]
          })
        elements.push(
          ...radialFractions.map((fraction) =>
            h.polygon(
              attrs(h, {
                points: svgPoints(gridPoints(fraction)),
                fill: 'none',
                stroke: fraction === 1 ? '#666' : '#ddd',
                ...(fraction === 1 ? {} : { 'stroke-dasharray': '3 3' }),
              }),
            ),
          ),
          ...gridPoints(1).map(([x, y]) =>
            h.line(
              attrs(h, {
                x1: String(cx),
                y1: String(cy),
                x2: String(x),
                y2: String(y),
                stroke: '#666',
              }),
            ),
          ),
        )
      }
      const points = values.map((value, i) => {
        const angle = -Math.PI / 2 + (i * Math.PI * 2) / Math.max(1, values.length)
        return [
          cx + (value / max) * radius * Math.cos(angle),
          cy + (value / max) * radius * Math.sin(angle),
        ] as const
      })
      const rangeValues = rows.map((row) => at(row, item.props.dataKey))
      const hasRange = rangeValues.some(isNumberRange)
      const innerPoints = rangeValues.map((value, i) => {
        const angle = -Math.PI / 2 + (i * Math.PI * 2) / Math.max(1, rangeValues.length)
        const low = isNumberRange(value) ? (value[0] ?? 0) : 0
        return [
          cx + (low / max) * radius * Math.cos(angle),
          cy + (low / max) * radius * Math.sin(angle),
        ] as const
      })
      if (points.length > 0)
        elements.push(
          hasRange
            ? h.path([
                ...attrs(h, {
                  d: `M ${points.map(([x, y]) => `${x} ${y}`).join(' L ')} Z M ${innerPoints
                    .slice()
                    .reverse()
                    .map(([x, y]) => `${x} ${y}`)
                    .join(' L ')} Z`,
                  'fill-rule': 'evenodd',
                  fill:
                    item.props.fill ?? palette[series.indexOf(item) % palette.length] ?? '#8884d8',
                  'fill-opacity': String(item.props.fillOpacity ?? 0.6),
                  stroke:
                    item.props.stroke ??
                    palette[series.indexOf(item) % palette.length] ??
                    '#8884d8',
                  'stroke-width': '2',
                }),
                ...(item.props.animationKind === undefined
                  ? []
                  : [
                      h.Style({
                        animation: `foldcn-radar-center-out ${item.props.animationDuration ?? 1600}ms linear both`,
                        transformBox: 'view-box',
                        transformOrigin: `${cx}px ${cy}px`,
                        transition: `d ${item.props.animationDuration ?? 1600}ms linear`,
                      }),
                    ]),
                ...(item.props.animationKey === undefined ? [] : [h.Key(item.props.animationKey)]),
              ])
            : h.polygon(
                attrs(h, {
                  points: svgPoints(points),
                  fill:
                    item.props.fill ?? palette[series.indexOf(item) % palette.length] ?? '#8884d8',
                  'fill-opacity': String(item.props.fillOpacity ?? 0.6),
                  stroke:
                    item.props.stroke ??
                    palette[series.indexOf(item) % palette.length] ??
                    '#8884d8',
                  'stroke-width': '2',
                }),
              ),
        )
      const angleAxis = props.children.find((child) => child.kind === 'polarAngleAxis')
      if (angleAxis?.kind === 'polarAngleAxis')
        elements.push(
          ...rows.map((row, i) => {
            const angle = -Math.PI / 2 + (i * Math.PI * 2) / Math.max(1, rows.length)
            const value =
              angleAxis.props.dataKey === undefined ? i : at(row, angleAxis.props.dataKey)
            return h.text(
              attrs(h, {
                x: String(cx + (radius + 15) * Math.cos(angle)),
                y: String(cy + (radius + 15) * Math.sin(angle)),
                'text-anchor': 'middle',
                fill: '#666',
                'font-size': '11',
              }),
              [String(value ?? '')],
            )
          }),
        )
      if (radiusAxis?.kind === 'polarRadiusAxis' && item === series[0])
        elements.push(
          ...radialTicks.map((tick) => {
            const angle = radiusAxis.props.angle ?? 0
            const x = cx + radius * (tick / max) * Math.cos((angle * Math.PI) / 180)
            const y = cy - radius * (tick / max) * Math.sin((angle * Math.PI) / 180)
            return h.text(
              attrs(h, {
                x: String(x),
                y: String(y),
                transform: `rotate(${90 - angle}, ${x}, ${y})`,
                'text-anchor': 'start',
                fill: '#666',
                'font-size': '10',
              }),
              [String(Number(tick.toFixed(1)))],
            )
          }),
        )
    } else {
      const max = Math.max(1, ...values)
      const ringSize =
        props.barSize ??
        Math.min(
          18,
          (radius - inner - Math.max(0, values.length - 1) * 1.5) / Math.max(1, values.length),
        )
      const ringGap = Math.max(
        0,
        (radius - inner - ringSize * values.length) / Math.max(1, values.length - 1),
      )
      const startAngle = ((item.props.startAngle ?? props.startAngle ?? 90) * Math.PI) / 180
      const endAngle = ((item.props.endAngle ?? props.endAngle ?? -270) * Math.PI) / 180
      elements.push(
        ...values.flatMap((value, i) => {
          const ringInner = inner + i * (ringSize + ringGap)
          const ringOuter = ringInner + ringSize
          const valueAngle = startAngle + ((endAngle - startAngle) * value) / max
          const labelRadius = (ringInner + ringOuter) / 2
          const labelStart = startAngle - (5 * Math.PI) / 180
          const labelEnd = labelStart + Math.PI / 180
          const labelX = cx + labelRadius * Math.sin(labelStart)
          const labelY = cy - labelRadius * Math.cos(labelStart)
          const labelEndX = cx + labelRadius * Math.sin(labelEnd)
          const labelEndY = cy - labelRadius * Math.cos(labelEnd)
          const labelPath = `M${labelX},${labelY} A${labelRadius},${labelRadius},0,1,0,${labelEndX},${labelEndY}`
          const labelId = `cn-radial-${(props.title ?? 'chart').replace(/[^a-z0-9]/gi, '-')}-${i}`
          const path = arc().cornerRadius(polarMeasure(item.props.cornerRadius, ringSize, 0))({
            innerRadius: ringInner,
            outerRadius: ringOuter,
            startAngle,
            endAngle: valueAngle,
          })
          const color =
            item.props.colors?.[i % item.props.colors.length] ??
            item.props.fill ??
            stringColor(rows[i]?.fill) ??
            '#8884d8'
          const focused =
            props.activeIndex === null || props.activeIndex === undefined || props.activeIndex === i
          return path === null
            ? []
            : [
                ...(item.props.background === true
                  ? [
                      h.path(
                        attrs(h, {
                          d:
                            arc()({
                              innerRadius: ringInner,
                              outerRadius: ringOuter,
                              startAngle,
                              endAngle,
                            }) ?? '',
                          transform: `translate(${cx},${cy})`,
                          fill: '#eee',
                        }),
                      ),
                    ]
                  : []),
                h.path([
                  ...attrs(h, {
                    d: path,
                    transform: `translate(${cx},${cy})`,
                    fill: color,
                    stroke: item.props.stroke ?? 'none',
                    opacity: focused ? '1' : '0.2',
                  }),
                  ...(props.onActiveIndexChange === undefined
                    ? []
                    : [h.OnClick(props.onActiveIndexChange(props.activeIndex === i ? null : i))]),
                ]),
                ...(item.props.label !== undefined && item.props.label !== false
                  ? [
                      h.text(
                        attrs(h, {
                          x: '0',
                          y: '0',
                          'dominant-baseline': 'central',
                          fill: '#18181b',
                          'font-size': '12',
                        }),
                        [
                          h.defs([], [h.path(attrs(h, { id: labelId, d: labelPath }))]),
                          h.textPath([h.Attribute('href', `#${labelId}`)], [String(value)]),
                        ],
                      ),
                    ]
                  : []),
              ]
        }),
      )
    }
  }
  const legend = props.children.find((child) => child.kind === 'legend')
  const rows = series[0]?.props.data ?? props.data ?? []
  const items =
    kind === 'radial-bar-chart'
      ? rows.map((row, index) => ({
          name: String(row.label ?? row.name ?? index),
          color:
            series[0]?.props.colors?.[index % series[0].props.colors.length] ??
            series[0]?.props.fill ??
            stringColor(row.fill) ??
            '#8884d8',
          index,
        }))
      : series.map((item, index) => ({
          name: item.props.name ?? keyName(item.props.dataKey),
          color: item.props.fill ?? palette[index % palette.length] ?? '#8884d8',
          index,
        }))
  const radialLegendTop = (height - items.length * 18) / 2
  if (kind === 'radial-bar-chart' && legend?.kind === 'legend')
    elements.push(
      ...items.flatMap((item, index) => [
        ...(legend.props.content === 'text'
          ? []
          : [
              h.rect([
                ...attrs(h, {
                  x: String(width - 90),
                  y: String(radialLegendTop + 4 + index * 18),
                  width: '10',
                  height: '10',
                  fill: item.color,
                  opacity:
                    props.activeIndex === null ||
                    props.activeIndex === undefined ||
                    props.activeIndex === index
                      ? '1'
                      : '0.2',
                }),
                ...(props.onActiveIndexChange === undefined
                  ? []
                  : [
                      h.OnClick(
                        props.onActiveIndexChange(props.activeIndex === index ? null : index),
                      ),
                    ]),
              ]),
            ]),
        h.text(
          [
            ...attrs(h, {
              x: String(legend.props.content === 'text' ? width - 42 : width - 73),
              y: String(
                legend.props.content === 'text'
                  ? 85 + index * 18
                  : radialLegendTop + 13 + index * 18,
              ),
              fill: legend.props.content === 'text' ? '#18181b' : item.color,
              'font-size': legend.props.content === 'text' ? '14' : '12',
              opacity:
                props.activeIndex === null ||
                props.activeIndex === undefined ||
                props.activeIndex === index
                  ? '1'
                  : '0.2',
            }),
            ...(props.onActiveIndexChange === undefined
              ? []
              : [h.OnClick(props.onActiveIndexChange(props.activeIndex === index ? null : index))]),
          ],
          [item.name],
        ),
      ]),
    )
  for (const child of props.children) {
    if (child.kind !== 'label') continue
    elements.push(
      h.text(
        attrs(h, {
          x: String(cx),
          y: String(cy),
          'text-anchor': 'middle',
          fill: '#333',
          'font-size': '14',
        }),
        [child.props.value],
      ),
    )
  }
  if (kind === 'pie-chart') {
    const firstPie = series.find((item) => item.kind === 'pie')
    for (const child of props.children) {
      if (child.kind !== 'needle' || firstPie === undefined) continue
      const rows = firstPie.props.data ?? props.data ?? []
      const values = rows.map((row) => Math.max(0, numeric(at(row, child.props.dataKey)) ?? 0))
      const total = values.reduce((sum, value) => sum + value, 0)
      const index = child.props.index ?? 0
      const before = values.slice(0, index).reduce((sum, value) => sum + value, 0)
      const start = firstPie.props.startAngle ?? props.startAngle ?? 0
      const end = firstPie.props.endAngle ?? props.endAngle ?? 360
      const angle =
        start + ((before + (values[index] ?? 0) / 2) / Math.max(1, total)) * (end - start)
      const outer = polarMeasure(
        firstPie.props.outerRadius ?? props.outerRadius,
        maxRadius,
        maxRadius,
      )
      const inner = polarMeasure(firstPie.props.innerRadius ?? props.innerRadius, maxRadius, 0)
      const length = inner + (outer - inner) / 2
      const color = child.props.color ?? '#d0d000'
      const needleCx = centerX(firstPie.props.cx ?? props.cx)
      const needleCy = centerY(firstPie.props.cy ?? props.cy)
      elements.push(
        h.path(
          attrs(h, {
            d: `M ${needleCx} ${needleCy} L ${needleCx + length * Math.cos((angle * Math.PI) / 180)} ${needleCy - length * Math.sin((angle * Math.PI) / 180)}`,
            fill: 'none',
            stroke: color,
            'stroke-width': '2',
          }),
        ),
      )
      elements.push(
        h.circle(
          attrs(h, {
            cx: String(needleCx),
            cy: String(needleCy),
            r: String(child.props.baseRadius ?? 5),
            fill: color,
          }),
        ),
      )
    }
  }
  if (series.some((item) => item.kind === 'radar' && item.props.animationKind !== undefined))
    elements.unshift(
      h.style(
        [],
        [
          '@keyframes foldcn-radar-center-out { from { transform: scale(0); } to { transform: scale(1); } }',
        ],
      ),
    )
  const figure = chart(
    kind,
    props.title ?? kind,
    width,
    height,
    props.responsive,
    props.className,
    elements,
    h,
  )
  const interactiveFigure =
    props.onActiveIndexChange === undefined
      ? figure
      : h.div([h.OnMouseLeave(props.onActiveIndexChange(null))], [figure])
  if (legend?.kind !== 'legend' || kind === 'radial-bar-chart') return interactiveFigure
  return h.div(
    [],
    [
      interactiveFigure,
      h.div(
        [h.Class('cn-chart-legend cn-chart-legend-center')],
        items.map((item) =>
          h.span(
            [h.Class('cn-chart-legend-item')],
            [
              h.span(
                [h.Class('cn-chart-legend-square'), h.Style({ backgroundColor: item.color })],
                [],
              ),
              item.name,
            ],
          ),
        ),
      ),
    ],
  )
}
export const PieChart = <M>(props: PolarChartProps<M>, h: HtmlBuilder<M>): Html =>
  polar('pie-chart', props, h)
export const RadarChart = <M>(props: PolarChartProps<M>, h: HtmlBuilder<M>): Html =>
  polar('radar-chart', props, h)
export const RadialBarChart = <M>(props: PolarChartProps<M>, h: HtmlBuilder<M>): Html =>
  polar('radial-bar-chart', props, h)

export type HierarchyNode = Readonly<{
  name: string
  value?: number
  children?: ReadonlyArray<HierarchyNode>
  [key: string]: string | number | ReadonlyArray<HierarchyNode> | undefined
}>
export type TreemapContentProps = Readonly<{
  x: number
  y: number
  width: number
  height: number
  depth: number
  topIndex: number
  name: string
  value: number
  fill: string
  payload: HierarchyNode
}>
export type TreemapTooltip = Readonly<{
  x: number
  y: number
  name: string
  value: number
  color: string
}>
export type HierarchyChartProps<M = never> = Readonly<{
  data: HierarchyNode | ReadonlyArray<HierarchyNode>
  width?: number
  height?: number
  responsive?: boolean
  className?: string
  title?: string
  nameKey?: string
  dataKey?: string
  padding?: number
  nodeInset?: number
  nodeGap?: number
  aspectRatio?: number
  content?: (props: TreemapContentProps) => Html
  type?: 'flat' | 'nest'
  focusPath?: ReadonlyArray<number>
  onNodeClick?: (path: ReadonlyArray<number>) => M
  onNodeHover?: (node: TreemapTooltip | null) => M
  activeTooltip?: TreemapTooltip | null
  innerRadius?: number
  outerRadius?: number
  ringPadding?: number
  cx?: number
  cy?: number
  textOptions?: Readonly<{ fill?: string }>
  startAngle?: number
  endAngle?: number
}>
const isHierarchyList = (
  data: HierarchyNode | ReadonlyArray<HierarchyNode>,
): data is ReadonlyArray<HierarchyNode> => Array.isArray(data)
const hierarchyNodes = (
  data: HierarchyNode | ReadonlyArray<HierarchyNode>,
): ReadonlyArray<HierarchyNode> => (isHierarchyList(data) ? data : (data.children ?? [data]))
const weight = (node: HierarchyNode, dataKey: string): number =>
  node.children?.length
    ? node.children.reduce((sum, child) => sum + weight(child, dataKey), 0)
    : Math.max(0, Number(node[dataKey]) || 0)
const hierarchyName = (node: HierarchyNode, nameKey: string): string => {
  const value = node[nameKey]
  // A user-selected hierarchy field is parsed at the chart boundary.
  // oxlint-disable-next-line anti-slop/no-runtime-typeof
  return typeof value === 'string' || typeof value === 'number' ? String(value) : node.name
}
const treemapPalette = ['#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57']
const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
const treemapLabelWidth = (label: string): number =>
  Array.from(graphemes.segment(label)).reduce(
    (width, { segment }) =>
      width +
      ('ilrtfj'.includes(segment)
        ? 3.5
        : 'MWmw'.includes(segment)
          ? 12
          : segment === segment.toUpperCase()
            ? 8.5
            : 7.4),
    0,
  )
const treemapNodes = <M>(
  nodes: ReadonlyArray<HierarchyNode>,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
  nodeInset: number,
  nodeGap: number,
  aspectRatio: number,
  dataKey: string,
  nameKey: string,
  content: HierarchyChartProps<M>['content'],
  topIndex: number,
  nest: boolean,
  pathPrefix: ReadonlyArray<number>,
  onNodeClick: HierarchyChartProps<M>['onNodeClick'],
  onNodeHover: HierarchyChartProps<M>['onNodeHover'],
  h: HtmlBuilder<M>,
): ReadonlyArray<Html> => {
  type Box = {
    node: HierarchyNode
    x: number
    y: number
    width: number
    height: number
    index: number
    area: number
  }
  // Recharts' treemap lays children into rows using the squarify score.
  const inset = Math.min(Math.max(0, nodeInset), width / 2, height / 2)
  const layoutRect = {
    x: x + inset,
    y: y + inset,
    width: Math.max(0, width - 2 * inset),
    height: Math.max(0, height - 2 * inset),
  }
  const total = nodes.reduce((sum, node) => sum + weight(node, dataKey), 0)
  const areaPerValue = total > 0 ? (layoutRect.width * layoutRect.height) / total : 0
  const boxes: Box[] = nodes.map((node, index) => ({
    node,
    index,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    area: weight(node, dataKey) * areaPerValue,
  }))
  const pending = boxes.slice()
  const row: Box[] = []
  let rowArea = 0
  let rect = layoutRect
  let size = Math.min(rect.width, rect.height)
  let best = Infinity
  const worstScore = (): number => {
    const areas = row.map((box) => box.area)
    const min = Math.min(...areas)
    const max = Math.max(...areas)
    const square = rowArea * rowArea
    const parent = size * size
    return square > 0 && min > 0
      ? Math.max((parent * max * aspectRatio) / square, square / (parent * min * aspectRatio))
      : Infinity
  }
  const placeRow = (flush: boolean): void => {
    if (size === rect.width) {
      const rowHeight = flush
        ? rect.height
        : Math.min(rect.height, size ? Math.round(rowArea / size) : 0)
      let nextX = rect.x
      for (const box of row) {
        box.x = nextX
        box.y = rect.y
        box.height = rowHeight
        box.width = Math.min(
          rowHeight ? Math.round(box.area / rowHeight) : 0,
          rect.x + rect.width - nextX,
        )
        nextX += box.width
      }
      const last = row.at(-1)
      if (last !== undefined) last.width += rect.x + rect.width - nextX
      rect = {
        x: rect.x,
        y: rect.y + rowHeight,
        width: rect.width,
        height: rect.height - rowHeight,
      }
    } else {
      const rowWidth = flush
        ? rect.width
        : Math.min(rect.width, size ? Math.round(rowArea / size) : 0)
      let nextY = rect.y
      for (const box of row) {
        box.x = rect.x
        box.y = nextY
        box.width = rowWidth
        box.height = Math.min(
          rowWidth ? Math.round(box.area / rowWidth) : 0,
          rect.y + rect.height - nextY,
        )
        nextY += box.height
      }
      const last = row.at(-1)
      if (last !== undefined) last.height += rect.y + rect.height - nextY
      rect = { x: rect.x + rowWidth, y: rect.y, width: rect.width - rowWidth, height: rect.height }
    }
    size = Math.min(rect.width, rect.height)
    row.length = 0
    rowArea = 0
    best = Infinity
  }
  while (pending.length > 0) {
    const box = pending[0]
    if (box === undefined) break
    row.push(box)
    rowArea += box.area
    const score = worstScore()
    if (score <= best) {
      pending.shift()
      best = score
    } else {
      row.pop()
      rowArea -= box.area
      placeRow(false)
    }
  }
  if (row.length > 0) placeRow(true)
  return boxes.flatMap(({ node, x: bx, y: by, width: bw, height: bh, index: i }) => {
    const halfGap = Math.max(0, nodeGap) / 2
    const leftGap = bx > layoutRect.x ? halfGap : 0
    const rightGap = bx + bw < layoutRect.x + layoutRect.width ? halfGap : 0
    const topGap = by > layoutRect.y ? halfGap : 0
    const bottomGap = by + bh < layoutRect.y + layoutRect.height ? halfGap : 0
    const nx = bx + leftGap
    const ny = by + topGap
    const nw = Math.max(0, bw - leftGap - rightGap)
    const nh = Math.max(0, bh - topGap - bottomGap)
    const name = hierarchyName(node, nameKey)
    const nodeFill =
      stringColor(node.fill) ?? treemapPalette[depth % treemapPalette.length] ?? '#8884d8'
    const nodeContent: ReadonlyArray<Html> = [
      ...(content === undefined
        ? [
            h.rect(
              attrs(h, {
                x: String(nx),
                y: String(ny),
                width: String(nw),
                height: String(nh),
                fill: nodeFill,
                stroke: nodeFill,
              }),
            ),
            ...(nw > 20 && nh > 20 && treemapLabelWidth(name) < nw
              ? [
                  h.text(
                    attrs(h, {
                      x: String(nx + 8),
                      y: String(ny + nh / 2 + 7),
                      fill: '#18181b',
                      'font-size': '14',
                    }),
                    [name],
                  ),
                ]
              : []),
          ]
        : [
            content({
              x: nx,
              y: ny,
              width: nw,
              height: nh,
              depth,
              topIndex: depth === 0 ? i : topIndex,
              name,
              value: weight(node, dataKey),
              fill: nodeFill,
              payload: node,
            }),
          ]),
      ...(!nest && node.children?.length
        ? treemapNodes(
            node.children,
            nx,
            ny,
            nw,
            nh,
            depth + 1,
            nodeInset,
            nodeGap,
            aspectRatio,
            dataKey,
            nameKey,
            content,
            depth === 0 ? i : topIndex,
            nest,
            [...pathPrefix, i],
            onNodeClick,
            onNodeHover,
            h,
          )
        : []),
    ]
    const click =
      nest && node.children?.length && onNodeClick !== undefined
        ? [h.OnClick(onNodeClick([...pathPrefix, i])), h.Style({ cursor: 'pointer' })]
        : []
    const hover =
      onNodeHover === undefined
        ? []
        : [
            h.OnMouseEnter(
              onNodeHover({
                x: nx + nw / 2,
                y: ny + nh / 2,
                name,
                value: weight(node, dataKey),
                color: nodeFill,
              }),
            ),
          ]
    return click.length > 0 || hover.length > 0
      ? [h.g([...click, ...hover], nodeContent)]
      : nodeContent
  })
}
export const Treemap = <M>(props: HierarchyChartProps<M>, h: HtmlBuilder<M>): Html => {
  const width = props.width ?? 640
  const height = props.height ?? 320
  let nodes = hierarchyNodes(props.data)
  for (const index of props.focusPath ?? []) {
    const selected = nodes[index]
    if (selected?.children === undefined) break
    nodes = selected.children
  }
  const figure = chart(
    'treemap',
    props.title ?? 'Treemap',
    width,
    height,
    props.responsive,
    props.className,
    treemapNodes(
      nodes,
      0,
      0,
      width,
      height,
      0,
      props.nodeInset ?? props.padding ?? 0,
      props.nodeGap ?? 0,
      props.aspectRatio ?? (1 + Math.sqrt(5)) / 2,
      props.dataKey ?? 'value',
      props.nameKey ?? 'name',
      props.content,
      -1,
      props.type === 'nest',
      props.focusPath ?? [],
      props.onNodeClick,
      props.onNodeHover,
      h,
    ),
    h,
  )
  if (props.onNodeHover === undefined) return figure
  return h.div(
    [
      h.Style({ position: 'relative', maxWidth: `${width}px` }),
      h.OnMouseLeave(props.onNodeHover(null)),
    ],
    [
      figure,
      ...(props.activeTooltip === undefined || props.activeTooltip === null
        ? []
        : [
            h.div(
              [
                h.Class('cn-chart-tooltip'),
                h.Style({
                  position: 'absolute',
                  left: `${Math.min(85, (props.activeTooltip.x / width) * 100)}%`,
                  top: `${Math.min(85, (props.activeTooltip.y / height) * 100)}%`,
                  pointerEvents: 'none',
                  color: props.activeTooltip.color,
                }),
                h.Role('status'),
              ],
              [`${props.activeTooltip.name} : ${props.activeTooltip.value}`],
            ),
          ]),
    ],
  )
}
const sunburstNodes = <M>(
  nodes: ReadonlyArray<HierarchyNode>,
  start: number,
  anglePerValue: number,
  depth: number,
  cx: number,
  cy: number,
  thickness: number,
  innerRadius: number,
  ringPadding: number,
  dataKey: string,
  parentColor: string,
  strokeWidth: number,
  labelFill: string,
  h: HtmlBuilder<M>,
): ReadonlyArray<Html> => {
  let angle = start
  return nodes.flatMap((node) => {
    const value = Math.max(0, Number(node[dataKey]) || 0)
    const next = angle + value * anglePerValue
    const inner = innerRadius + (thickness + ringPadding) * depth
    const outer = inner + thickness
    const path = arc()({
      innerRadius: inner,
      outerRadius: outer,
      startAngle: ((90 - next) * Math.PI) / 180,
      endAngle: ((90 - angle) * Math.PI) / 180,
    })
    const color = stringColor(node.fill) ?? parentColor
    const middle = (((angle + next) / 2) * Math.PI) / 180
    const labelRadius = inner + thickness / 2
    const output =
      path === null
        ? []
        : [
            h.path(
              attrs(h, {
                d: path,
                transform: `translate(${cx},${cy})`,
                fill: color,
                stroke: '#fff',
                'stroke-width': String(strokeWidth),
              }),
            ),
            ...(labelFill === 'none'
              ? []
              : [
                  h.text(
                    attrs(h, {
                      x: String(cx + Math.cos(middle) * labelRadius),
                      y: String(cy - Math.sin(middle) * labelRadius),
                      fill: labelFill,
                      stroke: '#fff',
                      'stroke-width': '2',
                      'paint-order': 'stroke fill',
                      'font-size': '10',
                      'font-weight': 'bold',
                      'text-anchor': 'middle',
                      'dominant-baseline': 'middle',
                    }),
                    [String(value)],
                  ),
                ]),
          ]
    const children = node.children?.length
      ? sunburstNodes(
          node.children,
          angle,
          anglePerValue,
          depth + 1,
          cx,
          cy,
          thickness,
          innerRadius,
          ringPadding,
          dataKey,
          color,
          strokeWidth,
          labelFill,
          h,
        )
      : []
    angle = next
    return [...output, ...children]
  })
}
const treeDepth = (nodes: ReadonlyArray<HierarchyNode>): number =>
  1 + Math.max(0, ...nodes.map((node) => (node.children?.length ? treeDepth(node.children) : 0)))
export const SunburstChart = <M>(props: HierarchyChartProps, h: HtmlBuilder<M>): Html => {
  const width = props.width ?? 700
  const height = props.height ?? 450
  const nodes = hierarchyNodes(props.data)
  const dataKey = props.dataKey ?? 'value'
  const rootValue = isHierarchyList(props.data)
    ? props.data.reduce((sum, node) => sum + Math.max(0, Number(node[dataKey]) || 0), 0)
    : Math.max(0, Number(props.data[dataKey]) || 0)
  const innerRadius = props.innerRadius ?? 50
  const outerRadius = props.outerRadius ?? Math.min(width, height) / 2
  const depth = isHierarchyList(props.data) ? treeDepth(nodes) : treeDepth(nodes) + 1
  const thickness = (outerRadius - innerRadius) / depth
  return chart(
    'sunburst-chart',
    props.title ?? 'Sunburst chart',
    width,
    height,
    props.responsive,
    props.className,
    sunburstNodes(
      nodes,
      props.startAngle ?? 0,
      (props.endAngle ?? 360) / (rootValue || 1),
      0,
      props.cx ?? width / 2,
      props.cy ?? height / 2,
      thickness,
      innerRadius,
      props.ringPadding ?? 2,
      dataKey,
      '#333',
      props.padding ?? 2,
      props.textOptions?.fill ?? '#111',
      h,
    ),
    h,
  )
}
export type FunnelProps = Readonly<{
  data: ReadonlyArray<Datum>
  dataKey: DataKey
  nameKey?: DataKey
  fill?: string
  label?: boolean
}>
export type FunnelChild = Readonly<{ kind: 'funnel'; props: FunnelProps }>
export const Funnel = (props: FunnelProps): FunnelChild => ({ kind: 'funnel', props })
export type FunnelChartProps = Omit<HierarchyChartProps, 'data'> &
  Readonly<{
    data?: ReadonlyArray<HierarchyNode>
    children?: ReadonlyArray<FunnelChild>
  }>
export const FunnelChart = <M>(props: FunnelChartProps, h: HtmlBuilder<M>): Html => {
  const width = props.width ?? 700
  const height = props.height ?? 433
  const dataKey = props.dataKey ?? 'value'
  const funnel = props.children?.find((child) => child.kind === 'funnel')
  const data: ReadonlyArray<HierarchyNode> =
    funnel === undefined
      ? (props.data ?? [])
      : funnel.props.data.map((row, index) => ({
          name: String(funnel.props.nameKey === undefined ? index : at(row, funnel.props.nameKey)),
          value: numeric(at(row, funnel.props.dataKey)) ?? 0,
          fill: stringColor(row.fill),
        }))
  const max = Math.max(1, ...data.map((node) => weight(node, dataKey)))
  const chartWidth = width - 92
  const band = (height - 30) / Math.max(1, data.length)
  const elements = data.flatMap((node, i) => {
    const topWidth = (chartWidth * weight(node, dataKey)) / max
    const nextNode = data[i + 1]
    const nextWidth =
      (chartWidth * (nextNode === undefined ? weight(node, dataKey) : weight(nextNode, dataKey))) /
      max
    const x1 = (chartWidth - topWidth) / 2 + 10
    const x2 = (chartWidth - nextWidth) / 2 + 10
    return [
      h.polygon(
        attrs(h, {
          points: svgPoints([
            [x1, i * band + 10],
            [x1 + topWidth, i * band + 10],
            [x2 + nextWidth, (i + 1) * band + 10],
            [x2, (i + 1) * band + 10],
          ]),
          fill:
            stringColor(node.fill) ??
            funnel?.props.fill ??
            palette[i % palette.length] ??
            '#2563eb',
          stroke: '#fff',
        }),
      ),
      ...(funnel?.props.label === true
        ? [
            h.text(
              attrs(h, {
                x: String(chartWidth + 16),
                y: String((i + 0.5) * band + 14),
                fill: '#333',
                'font-size': '12',
              }),
              [node.name],
            ),
          ]
        : []),
    ]
  })
  return chart(
    'funnel-chart',
    props.title ?? 'Funnel chart',
    width,
    height,
    props.responsive,
    props.className,
    elements,
    h,
  )
}
export type SankeyProps = Readonly<{
  data: Readonly<{
    nodes: ReadonlyArray<Readonly<{ name: string }>>
    links: ReadonlyArray<Readonly<{ source: number; target: number; value: number }>>
  }>
  width?: number
  height?: number
  responsive?: boolean
  className?: string
  title?: string
}>
export const Sankey = <M>(props: SankeyProps, h: HtmlBuilder<M>): Html => {
  const width = props.width ?? 640
  const height = props.height ?? 320
  const count = props.data.nodes.length
  const validLinks = props.data.links.filter(
    (link) =>
      link.source >= 0 &&
      link.target >= 0 &&
      link.source < count &&
      link.target < count &&
      link.source !== link.target,
  )
  const depth = Array<number>(count).fill(0)
  for (let pass = 0; pass < count - 1; pass++)
    for (const link of validLinks)
      depth[link.target] = Math.max(depth[link.target] ?? 0, (depth[link.source] ?? 0) + 1)
  const maxDepth = Math.max(0, ...depth)
  const flow = props.data.nodes.map((_, index) =>
    Math.max(
      1,
      validLinks.filter((link) => link.source === index).reduce((sum, link) => sum + link.value, 0),
      validLinks.filter((link) => link.target === index).reduce((sum, link) => sum + link.value, 0),
    ),
  )
  const largestLayer = Math.max(
    1,
    ...Array.from({ length: maxDepth + 1 }, (_, layer) =>
      flow.reduce((sum, value, index) => sum + (depth[index] === layer ? value : 0), 0),
    ),
  )
  const unit = Math.min((height - 64) / largestLayer, 12)
  const positions = props.data.nodes.map((_, index) => {
    const layer = depth[index] ?? 0
    const peers = props.data.nodes.map((__, i) => i).filter((i) => depth[i] === layer)
    const totalHeight =
      peers.reduce((sum, i) => sum + Math.max(14, (flow[i] ?? 1) * unit), 0) +
      Math.max(0, peers.length - 1) * 12
    const earlier = peers.slice(0, peers.indexOf(index))
    const y =
      (height - totalHeight) / 2 +
      earlier.reduce((sum, i) => sum + Math.max(14, (flow[i] ?? 1) * unit) + 12, 0)
    return {
      x: 20 + (maxDepth === 0 ? 0 : ((width - 56) * layer) / maxDepth),
      y,
      height: Math.max(14, (flow[index] ?? 1) * unit),
    }
  })
  const outgoingOffsets = Array<number>(count).fill(0)
  const incomingOffsets = Array<number>(count).fill(0)
  const links = validLinks.flatMap((link) => {
    const source = positions[link.source]
    const target = positions[link.target]
    if (source === undefined || target === undefined) return []
    const x1 = source.x + 16
    const x2 = target.x
    const thickness = link.value * unit
    const sourceFlow = validLinks
      .filter((candidate) => candidate.source === link.source)
      .reduce((sum, candidate) => sum + candidate.value, 0)
    const targetFlow = validLinks
      .filter((candidate) => candidate.target === link.target)
      .reduce((sum, candidate) => sum + candidate.value, 0)
    const y1 =
      source.y + (source.height - sourceFlow * unit) / 2 + (outgoingOffsets[link.source] ?? 0)
    const y2 =
      target.y + (target.height - targetFlow * unit) / 2 + (incomingOffsets[link.target] ?? 0)
    outgoingOffsets[link.source] = (outgoingOffsets[link.source] ?? 0) + thickness
    incomingOffsets[link.target] = (incomingOffsets[link.target] ?? 0) + thickness
    const bend = (x1 + x2) / 2
    return [
      h.path(
        attrs(h, {
          d: `M${x1},${y1} C${bend},${y1} ${bend},${y2} ${x2},${y2} L${x2},${y2 + thickness} C${bend},${y2 + thickness} ${bend},${y1 + thickness} ${x1},${y1 + thickness} Z`,
          fill: palette[link.source % palette.length] ?? '#8884d8',
          'fill-opacity': '0.45',
        }),
      ),
    ]
  })
  const nodes = props.data.nodes.flatMap((node, i) => {
    const position = positions[i]
    if (position === undefined) return []
    return [
      h.rect(
        attrs(h, {
          x: String(position.x),
          y: String(position.y),
          width: '16',
          height: String(position.height),
          fill: palette[i % palette.length] ?? '#8884d8',
        }),
      ),
      h.text(
        attrs(h, {
          x: String((depth[i] ?? 0) === maxDepth ? position.x + 16 : position.x),
          y: String(position.y - 8),
          'text-anchor': (depth[i] ?? 0) === maxDepth ? 'end' : 'start',
          fill: '#666',
          'font-size': '11',
        }),
        [node.name],
      ),
    ]
  })
  return chart(
    'sankey',
    props.title ?? 'Sankey chart',
    width,
    height,
    props.responsive,
    props.className,
    [...links, ...nodes],
    h,
  )
}
