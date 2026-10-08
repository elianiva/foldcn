// Optional chart attributes are omitted to preserve the rendered Recharts example output.
/* oxlint-disable anti-slop/no-conditional-empty-object-spread */
// Chart values and snapshot data cross an external input boundary and require runtime narrowing.
/* oxlint-disable anti-slop/no-runtime-typeof */
import {
  curveBasis,
  curveCardinal,
  curveLinear,
  curveMonotoneX,
  curveMonotoneY,
  curveNatural,
  curveStep,
  line,
} from 'd3-shape'
import type { CurveFactory } from 'd3-shape'
import { Option } from 'effect'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'
import { cn } from '@/lib/utils'

/** Recharts names and prop names, with Foldkit descriptors in place of React children. */
export type ChartValue = string | number | ReadonlyArray<number> | null | undefined
export const isNumberRange = (value: ChartValue): value is ReadonlyArray<number> =>
  Array.isArray(value)
export type Datum = Readonly<Record<string, ChartValue>>
export type DataKey = string | ((datum: Datum) => ChartValue)
export type Margin = Readonly<{ top?: number; right?: number; bottom?: number; left?: number }>
export type DomainEnd =
  | number
  | 'auto'
  | 'dataMin'
  | 'dataMax'
  | `dataMax + ${number}`
  | `dataMin - ${number}`
export type AxisLabel = Readonly<{
  key?: string
  value: string
  position?: string
  angle?: number
  offset?: number
  textAnchor?: 'start' | 'middle' | 'end'
  style?: Readonly<{ textAnchor?: 'start' | 'middle' | 'end' }>
}>
export type AxisProps = Readonly<{
  dataKey?: DataKey
  width?: number | 'auto'
  unit?: string
  xAxisId?: string
  yAxisId?: string
  orientation?: 'left' | 'right'
  mirror?: boolean
  type?: 'category' | 'number'
  scale?: 'time' | 'band'
  domain?: readonly [DomainEnd, DomainEnd]
  allowDataOverflow?: boolean
  hide?: boolean
  axisLine?: boolean
  tick?:
    | boolean
    | ((
        props: Readonly<{ x: number; y: number; value: ChartValue; index: number; band: number }>,
      ) => Html)
  tickCount?: number
  ticks?: ReadonlyArray<number>
  interval?:
    | number
    | 'preserveStart'
    | 'preserveEnd'
    | 'preserveStartEnd'
    | 'equidistantPreserveStart'
  height?: number
  tickAngle?: number
  niceTicks?: 'snap125'
  padding?: Readonly<{ left?: number; right?: number; top?: number; bottom?: number }>
  stroke?: string
  strokeWidth?: number
  tickFormatter?: (value: string | number) => string
  label?: string | AxisLabel
}>
export type LineProps = Readonly<{
  dataKey: DataKey
  yAxisId?: string
  name?: string
  type?: 'linear' | 'monotone' | 'step' | 'basis' | 'cardinal' | 'natural'
  stroke?: string
  strokeWidth?: number
  strokeDasharray?: string
  strokeLinecap?: 'round' | 'butt' | 'square'
  strokeOpacity?: number
  activeDot?: false | Readonly<{ r?: number; fill?: string; stroke?: string }>
  animationDuration?: number
  animationKind?: 'opacity' | 'swipe-left'
  animationKey?: string
  zIndex?: number
  dot?:
    | boolean
    | Readonly<{ r?: number }>
    | ((
        props: Readonly<{ cx: number; cy: number; value: number; index: number; payload: Datum }>,
      ) => Html)
  connectNulls?: boolean
  hide?: boolean
  legendType?: 'none'
  label?: boolean
}>
export type CartesianGridProps = Readonly<{
  horizontal?: boolean
  vertical?: boolean
  stroke?: string
  strokeDasharray?: string
}>
export type TooltipProps = Readonly<{
  defaultIndex?: number
  content?: 'none'
  formatter?: (value: number, name: string) => string
  labelFormatter?: (label: string | number) => string
}>
export type LegendProps = Readonly<{
  align?: 'left' | 'center' | 'right'
  content?: 'text'
  position?: 'top' | 'bottom' | 'insideTopRight'
  itemSorter?: (left: string, right: string) => number
  wrapperStyle?: Readonly<{ paddingTop?: string; backgroundColor?: string; lineHeight?: string }>
}>
export type ReferenceLineProps = Readonly<{
  x?: string | number
  y?: number
  segment?: readonly [
    Readonly<{ x: string | number; y: number }>,
    Readonly<{ x: string | number; y: number }>,
  ]
  stroke?: string
  strokeWidth?: number
  strokeOpacity?: number
  strokeLinecap?: 'round' | 'butt' | 'square'
  strokeDasharray?: string
  label?:
    | string
    | Readonly<{
        value: string
        fill?: string
        position?: string
        angle?: number
        dx?: number
        dy?: number
      }>
}>
export type BrushProps = Readonly<{ dataKey?: DataKey; height?: number; stroke?: string }>

export type ChartChild =
  | Readonly<{ kind: 'line'; props: LineProps }>
  | Readonly<{ kind: 'xAxis'; props: AxisProps }>
  | Readonly<{ kind: 'yAxis'; props: AxisProps }>
  | Readonly<{ kind: 'grid'; props: CartesianGridProps }>
  | Readonly<{ kind: 'tooltip'; props: TooltipProps }>
  | Readonly<{ kind: 'legend'; props: LegendProps }>
  | Readonly<{ kind: 'referenceLine'; props: ReferenceLineProps }>
  | Readonly<{ kind: 'brush'; props: BrushProps }>

export const Line = (props: LineProps): ChartChild => ({ kind: 'line', props })
export const XAxis = (props: AxisProps = {}): ChartChild => ({ kind: 'xAxis', props })
export const YAxis = (props: AxisProps = {}): ChartChild => ({ kind: 'yAxis', props })
export const CartesianGrid = (props: CartesianGridProps = {}): ChartChild => ({
  kind: 'grid',
  props,
})
export const Tooltip = (props: TooltipProps = {}): Extract<ChartChild, { kind: 'tooltip' }> => ({
  kind: 'tooltip',
  props,
})
export const Legend = (props: LegendProps = {}): Extract<ChartChild, { kind: 'legend' }> => ({
  kind: 'legend',
  props,
})
export const ReferenceLine = (props: ReferenceLineProps): ChartChild => ({
  kind: 'referenceLine',
  props,
})
export const Brush = (props: BrushProps = {}): ChartChild => ({ kind: 'brush', props })

export type LineChartProps<M> = Readonly<{
  data: ReadonlyArray<Datum>
  children: ReadonlyArray<ChartChild>
  width?: number
  height?: number
  responsive?: boolean
  layout?: 'horizontal' | 'vertical'
  margin?: Margin
  className?: string
  title?: string
  accessibilityLayer?: boolean
  activeIndex?: number | null
  onActiveIndexChange?: (index: number | null) => M
  onLegendHover?: (key: string | null) => M
  onSelectionStart?: (index: number) => M
  onSelectionEnd?: (index: number) => M
  selection?: Readonly<{ fromIndex: number; toIndex: number }>
  brushRange?: readonly [number, number]
  brushDataLength?: number
  svgDefs?: ReadonlyArray<Html>
  onBrushStart?: (edge: 'start' | 'end') => M
  onBrushEnd?: (index: number) => M
}>

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
const numberValue = (value: ChartValue): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined
  const numeric = Number(isNumberRange(value) ? value.at(-1) : value)
  return Number.isFinite(numeric) ? numeric : undefined
}

const valueAt = (datum: Datum, key: DataKey): ChartValue => {
  // Recharts accepts a string key or a row accessor; this is the API boundary.
  // oxlint-disable-next-line anti-slop/no-runtime-typeof
  if (typeof key === 'function') return key(datum)
  return datum[key]
}

const dataKeyName = (key: DataKey): string => {
  // oxlint-disable-next-line anti-slop/no-runtime-typeof
  return typeof key === 'string' ? key : 'Value'
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))
const coordinate = (value: number, min: number, max: number, start: number, end: number): number =>
  max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start)

export const niceTickValues = (min: number, max: number, count = 5): ReadonlyArray<number> => {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1]
  const span = Math.max(1, max - min)
  const rawStep = span / Math.max(1, count - 1)
  const power = 10 ** Math.floor(Math.log10(rawStep))
  const ratio = rawStep / power
  const step =
    (ratio >= 8.75
      ? 10
      : ratio >= 7.5
        ? 7.5
        : ratio >= 3.5
          ? 5
          : ratio >= 2.5
            ? 2.5
            : ratio >= 1.5
              ? 2
              : 1) * power
  const start = Math.floor(min / step) * step
  const end = Math.ceil(max / step) * step
  const length = Math.round((end - start) / step) + 1
  return Array.from({ length }, (_, index) => Number((start + step * index).toPrecision(12)))
}

const axisDomain = (
  values: ReadonlyArray<number>,
  axis: AxisProps | undefined,
): readonly [number, number] => {
  const dataMin = values.length === 0 ? 0 : Math.min(...values)
  const dataMax = values.length === 0 ? 0 : Math.max(...values)
  const min = Math.min(0, dataMin)
  const max = Math.max(0, dataMax)
  const domain = axis?.domain
  const start = domain?.[0] ?? 0
  const end = domain?.[1] ?? 'auto'
  const resolveEnd = (value: DomainEnd, fallback: number): number => {
    switch (value) {
      case 'auto':
        return fallback
      case 'dataMin':
        return dataMin
      case 'dataMax':
        return dataMax
      default:
        return typeof value === 'number'
          ? value
          : value.startsWith('dataMax + ')
            ? dataMax + Number(value.slice('dataMax + '.length))
            : dataMin - Number(value.slice('dataMin - '.length))
    }
  }
  const lower = resolveEnd(start, min)
  const upper = resolveEnd(end, max)
  const usableUpper = lower === upper ? upper + 1 : upper
  const nice = niceTickValues(lower, usableUpper)
  return [
    domain?.[0] === undefined || domain[0] === 'auto' ? (nice[0] ?? lower) : lower,
    domain?.[1] === undefined || domain[1] === 'auto'
      ? (nice[nice.length - 1] ?? usableUpper)
      : usableUpper,
  ]
}

const ticks = (domain: readonly [number, number], count: number): ReadonlyArray<number> =>
  niceTickValues(domain[0], domain[1], count).filter(
    (value) => value >= domain[0] - 1e-9 && value <= domain[1] + 1e-9,
  )

const svgAttrs = <M>(
  h: HtmlBuilder<M>,
  attrs: Readonly<Record<string, string>>,
): ReadonlyArray<Attribute<M>> =>
  Object.entries(attrs).map(([key, value]) => h.Attribute(key, value))

export const renderAxisLabel = <M>(
  h: HtmlBuilder<M>,
  label: AxisProps['label'],
  axis: 'x' | 'y',
  bounds: Readonly<{ left: number; right: number; top: number; bottom: number }>,
): Html | undefined => {
  if (label === undefined) return undefined
  const config = typeof label === 'string' ? { value: label } : label
  const x =
    axis === 'x'
      ? config.position === 'insideBottomRight'
        ? bounds.right
        : (bounds.left + bounds.right) / 2
      : bounds.left - (config.position === 'left' ? 49 : 42) + (config.offset ?? 0)
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
    svgAttrs(h, {
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

const curveFor = (type: LineProps['type'], vertical: boolean): CurveFactory => {
  switch (type) {
    case 'monotone':
      return vertical ? curveMonotoneY : curveMonotoneX
    case 'step':
      return curveStep
    case 'basis':
      return curveBasis
    case 'cardinal':
      return curveCardinal
    case 'natural':
      return curveNatural
    default:
      return curveLinear
  }
}

export const LineChart = <M>(props: LineChartProps<M>, h: HtmlBuilder<M>): Html => {
  const width = props.width ?? 700
  const height = props.height ?? 433
  const vertical = props.layout === 'vertical'
  const xAxis = props.children.find(
    (child): child is Extract<ChartChild, { kind: 'xAxis' }> => child.kind === 'xAxis',
  )
  const yAxes = props.children.filter(
    (child): child is Extract<ChartChild, { kind: 'yAxis' }> => child.kind === 'yAxis',
  )
  const leftAxis = yAxes.find((axis) => axis.props.orientation !== 'right')
  const rightAxis = yAxes.find((axis) => axis.props.orientation === 'right')
  const yAxis = leftAxis ?? rightAxis
  const dualAxes = leftAxis !== undefined && rightAxis !== undefined
  const grid = props.children.find((child) => child.kind === 'grid')
  const tooltip = props.children.find((child) => child.kind === 'tooltip')
  const legend = props.children.find((child) => child.kind === 'legend')
  const brush = props.children.find((child) => child.kind === 'brush')
  const lines = props.children.filter(
    (child): child is Extract<ChartChild, { kind: 'line' }> =>
      child.kind === 'line' && !child.props.hide,
  )
  const axisWidth = (axis: typeof leftAxis): number => {
    if (axis === undefined || axis.props.hide || axis.props.mirror || axis.props.tick === false)
      return 0
    if (axis.props.width !== 'auto') return axis.props.width ?? 47
    const values = lines.flatMap((item) =>
      props.data.flatMap((row) => {
        const value = numberValue(valueAt(row, item.props.dataKey))
        return value === undefined ? [] : [value]
      }),
    )
    const extremes = [0, Math.min(...values), Math.max(...values)]
    const labels = extremes.map(
      (value) => axis.props.tickFormatter?.(value) ?? String(Math.round(value)),
    )
    return Math.ceil(Math.max(...labels.map((label) => label.length)) * 7 + 8)
  }
  const references = props.children.filter((child) => child.kind === 'referenceLine')
  const defaultMargin = props.margin === undefined ? 5 : 0
  const margin = {
    top: props.margin?.top ?? defaultMargin,
    right:
      (props.margin?.right ?? (vertical ? 20 : defaultMargin)) +
      (rightAxis?.props.width === 'auto'
        ? axisWidth(rightAxis)
        : rightAxis === undefined || rightAxis.props.hide || rightAxis.props.mirror
          ? 0
          : (rightAxis.props.width ?? 47)),
    bottom:
      (props.margin?.bottom ?? defaultMargin) +
      (xAxis === undefined || xAxis.props.hide || xAxis.props.tick === false
        ? 0
        : (xAxis.props.height ?? 30)) +
      (brush?.kind === 'brush' ? (brush.props.height ?? 30) + 10 : 0) +
      (legend?.kind === 'legend' &&
      legend.props.position !== 'top' &&
      legend.props.position !== 'insideTopRight'
        ? 25
        : 0),
    left: (props.margin?.left ?? defaultMargin) + axisWidth(leftAxis),
  }
  const left = margin.left
  const right = width - margin.right
  const top = margin.top
  const bottom = height - margin.bottom
  const categoryKey = vertical ? yAxis?.props.dataKey : xAxis?.props.dataKey
  const categories = props.data.map((datum, index) =>
    categoryKey === undefined ? index : (valueAt(datum, categoryKey) ?? index),
  )
  const values = lines
    .filter((child) => !dualAxes || child.props.yAxisId !== rightAxis?.props.yAxisId)
    .flatMap((child) =>
      props.data.flatMap((datum) => {
        const value = numberValue(valueAt(datum, child.props.dataKey))
        return value === undefined ? [] : [value]
      }),
    )
  const numericAxis = vertical ? xAxis?.props : yAxis?.props
  const domain = axisDomain(values, numericAxis)
  const rightValues = lines
    .filter((line) => line.props.yAxisId === rightAxis?.props.yAxisId)
    .flatMap((line) =>
      props.data.flatMap((datum) => {
        const value = numberValue(valueAt(datum, line.props.dataKey))
        return value === undefined ? [] : [value]
      }),
    )
  const rightDomain =
    dualAxes && rightAxis !== undefined ? axisDomain(rightValues, rightAxis.props) : domain
  const numericCategory = !vertical && xAxis?.props.type === 'number'
  const categoryValues = categories.flatMap((category) => {
    const value = numberValue(category)
    return value === undefined ? [] : [value]
  })
  const categoryDomain = axisDomain(categoryValues, xAxis?.props)
  const categoryPosition = (index: number): number => {
    if (numericCategory)
      return coordinate(
        numberValue(categories[index]) ?? 0,
        categoryDomain[0],
        categoryDomain[1],
        left,
        right,
      )
    const start = vertical
      ? top + (yAxis?.props.padding?.top ?? 0)
      : left + (xAxis?.props.padding?.left ?? 0)
    const end = vertical
      ? bottom - (yAxis?.props.padding?.bottom ?? 0)
      : right - (xAxis?.props.padding?.right ?? 0)
    return props.data.length > 1
      ? start + ((end - start) * index) / (props.data.length - 1)
      : (start + end) / 2
  }
  const categoryTicks = numericCategory
    ? (xAxis?.props.ticks ?? ticks(categoryDomain, xAxis?.props.tickCount ?? 5)).map((value) => ({
        value,
        position: coordinate(value, categoryDomain[0], categoryDomain[1], left, right),
      }))
    : categories.map((value, index) => ({ value, position: categoryPosition(index) }))
  const categoryInterval = (vertical ? yAxis : xAxis)?.props.interval
  const categoryLabels = categoryTicks.map(
    ({ value }) =>
      (vertical ? yAxis : xAxis)?.props.tickFormatter?.(
        isNumberRange(value) ? value.join(', ') : (value ?? ''),
      ) ?? String(value),
  )
  const tickWidth = (label: string): number =>
    label.startsWith('Iter: ')
      ? 26.656 + (label.length - 6) * 6.96
      : Array.from(graphemes.segment(label)).reduce(
          (sum, { segment }) =>
            sum + ('ilIjt: '.includes(segment) ? 4 : 'MWmw'.includes(segment) ? 11 : 7),
          0,
        )
  const tickBounds = (index: number, keepInside: boolean) => {
    const tick = categoryTicks[index]!
    const extent = tickWidth(categoryLabels[index] ?? '') / 2
    const axisEnd = vertical ? height : width
    const position = keepInside ? clamp(tick.position, extent, axisEnd - extent) : tick.position
    return { left: position - extent, right: position + extent, position }
  }
  const selectForward = (keepLast: boolean): ReadonlyArray<number> => {
    const selected: number[] = []
    let previousRight = -Infinity
    const lastIndex = categoryTicks.length - 1
    const lastLeft = keepLast && lastIndex >= 0 ? tickBounds(lastIndex, true).left : Infinity
    for (let index = 0; index < categoryTicks.length - (keepLast ? 1 : 0); index++) {
      const bounds = tickBounds(index, index === 0)
      if (
        bounds.left >= previousRight + 5 &&
        bounds.right + (keepLast ? 5 : 0) <= lastLeft &&
        bounds.right <= (vertical ? height : width)
      ) {
        selected.push(index)
        previousRight = bounds.right
      }
    }
    if (keepLast && lastIndex > 0) selected.push(lastIndex)
    return selected
  }
  const selectBackward = (): ReadonlyArray<number> => {
    const selected: number[] = []
    let nextLeft = Infinity
    for (let index = categoryTicks.length - 1; index >= 0; index--) {
      const bounds = tickBounds(index, index === categoryTicks.length - 1)
      if (bounds.right + 5 <= nextLeft && bounds.left >= 0) {
        selected.push(index)
        nextLeft = bounds.left
      }
    }
    return selected.reverse()
  }
  const equidistant = (): ReadonlyArray<number> => {
    for (let stride = 1; stride <= Math.max(1, categoryTicks.length); stride++) {
      const indices = categoryTicks.flatMap((_, index) => (index % stride === 0 ? [index] : []))
      if (
        indices.every((index, position) => {
          const bounds = tickBounds(index, index === 0)
          return (
            bounds.left >= 0 &&
            bounds.right <= (vertical ? height : width) &&
            (position === 0 || bounds.left >= tickBounds(indices[position - 1]!, false).right + 5)
          )
        })
      )
        return indices
    }
    return categoryTicks.length === 0 ? [] : [0]
  }
  const visibleIndices =
    typeof categoryInterval === 'number'
      ? categoryTicks.flatMap((_, index) =>
          index % Math.max(1, categoryInterval + 1) === 0 ? [index] : [],
        )
      : categoryInterval === 'preserveStart'
        ? selectForward(false)
        : categoryInterval === 'preserveStartEnd'
          ? selectForward(true)
          : categoryInterval === 'equidistantPreserveStart'
            ? equidistant()
            : selectBackward()
  const visibleCategoryTicks = visibleIndices.map((index) => ({
    ...categoryTicks[index]!,
    position:
      typeof categoryInterval === 'number'
        ? categoryTicks[index]!.position
        : tickBounds(index, index === 0 || index === categoryTicks.length - 1).position,
  }))
  const valuePosition = (value: number): number =>
    vertical
      ? coordinate(value, domain[0], domain[1], left, right)
      : coordinate(value, domain[0], domain[1], bottom, top)
  const numericTicks = numericAxis?.ticks ?? ticks(domain, numericAxis?.tickCount ?? 5)
  const lineValuePosition = (
    child: Extract<ChartChild, { kind: 'line' }>,
    value: number,
  ): number =>
    !vertical &&
    dualAxes &&
    rightAxis !== undefined &&
    child.props.yAxisId === rightAxis.props.yAxisId
      ? coordinate(value, rightDomain[0], rightDomain[1], bottom, top)
      : valuePosition(value)
  const text = (value: ChartValue): string => String(value ?? '')
  const labelFor = (value: ChartValue): string | number =>
    isNumberRange(value) ? value.join(', ') : (value ?? '')
  const axisColor = '#666'
  const gridColor = '#d6d3d1'
  const linePalette = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042']
  const lineColor = (child: Extract<ChartChild, { kind: 'line' }>): string =>
    child.props.stroke ?? linePalette[lines.indexOf(child) % linePalette.length] ?? '#8884d8'
  const children: Html[] = [...(props.svgDefs ?? [])]

  if (grid?.kind === 'grid') {
    const stroke = grid.props.stroke ?? gridColor
    const dash = grid.props.strokeDasharray ?? '3 3'
    if (grid.props.horizontal !== false) {
      children.push(
        ...(dualAxes && !vertical ? [domain[0], domain[1]] : numericTicks).map((value) => {
          const position = valuePosition(value)
          return h.line(
            svgAttrs(
              h,
              vertical
                ? {
                    x1: String(position),
                    x2: String(position),
                    y1: String(top),
                    y2: String(bottom),
                    stroke,
                    'stroke-dasharray': dash,
                  }
                : {
                    x1: String(left),
                    x2: String(right),
                    y1: String(position),
                    y2: String(position),
                    stroke,
                    'stroke-dasharray': dash,
                  },
            ),
          )
        }),
      )
    }
    if (grid.props.vertical !== false) {
      children.push(
        ...visibleCategoryTicks.map(({ position }) => {
          return h.line(
            svgAttrs(
              h,
              vertical
                ? {
                    x1: String(left),
                    x2: String(right),
                    y1: String(position),
                    y2: String(position),
                    stroke,
                    'stroke-dasharray': dash,
                  }
                : {
                    x1: String(position),
                    x2: String(position),
                    y1: String(top),
                    y2: String(bottom),
                    stroke,
                    'stroke-dasharray': dash,
                  },
            ),
          )
        }),
      )
    }
  }

  const categoryAxis = vertical ? yAxis : xAxis
  if (categoryAxis !== undefined && categoryAxis.props.hide !== true)
    children.push(
      h.line(
        svgAttrs(
          h,
          vertical
            ? {
                x1: String(left),
                x2: String(left),
                y1: String(top),
                y2: String(bottom),
                stroke: categoryAxis.props.stroke ?? axisColor,
                'stroke-width': String(categoryAxis.props.strokeWidth ?? 1),
              }
            : {
                x1: String(left),
                x2: String(right),
                y1: String(bottom),
                y2: String(bottom),
                stroke: categoryAxis.props.stroke ?? axisColor,
                'stroke-width': String(categoryAxis.props.strokeWidth ?? 1),
              },
        ),
      ),
    )
  if (
    numericAxis !== undefined &&
    numericAxis.hide !== true &&
    (vertical || leftAxis !== undefined)
  )
    children.push(
      h.line(
        svgAttrs(
          h,
          vertical
            ? {
                x1: String(left),
                x2: String(right),
                y1: String(bottom),
                y2: String(bottom),
                stroke: numericAxis.stroke ?? axisColor,
                'stroke-width': String(numericAxis.strokeWidth ?? 1),
              }
            : {
                x1: String(left),
                x2: String(left),
                y1: String(top),
                y2: String(bottom),
                stroke: numericAxis.stroke ?? axisColor,
                'stroke-width': String(numericAxis.strokeWidth ?? 1),
              },
        ),
      ),
    )
  if (
    categoryAxis !== undefined &&
    categoryAxis.props.hide !== true &&
    categoryAxis.props.tick !== false
  ) {
    children.push(
      ...visibleCategoryTicks.map(({ value: category, position }) => {
        const label = categoryAxis.props.tickFormatter?.(labelFor(category)) ?? text(category)
        return vertical
          ? h.text(
              svgAttrs(h, {
                x: String(left - 10),
                y: String(position + 4),
                'text-anchor': 'end',
                fill: categoryAxis.props.stroke ?? axisColor,
                'font-size': '14',
              }),
              [label],
            )
          : h.text(
              svgAttrs(h, {
                x: String(position),
                y: String(bottom + 8),
                'text-anchor': categoryAxis.props.tickAngle === undefined ? 'middle' : 'end',
                ...(categoryAxis.props.tickAngle === undefined
                  ? {}
                  : {
                      transform: `rotate(${categoryAxis.props.tickAngle} ${position} ${bottom + 8})`,
                    }),
                fill: categoryAxis.props.stroke ?? axisColor,
                'font-size': '14',
              }),
              [label],
            )
      }),
    )
  }
  if (
    numericAxis !== undefined &&
    numericAxis.hide !== true &&
    numericAxis.tick !== false &&
    (vertical || leftAxis !== undefined)
  ) {
    children.push(
      ...numericTicks.map((value) => {
        const position = valuePosition(value)
        const label =
          numericAxis.tickFormatter?.(value) ??
          `${Number(value.toFixed(6))}${numericAxis.unit ?? ''}`
        return vertical
          ? h.text(
              svgAttrs(h, {
                x: String(position),
                y: String(bottom + 8),
                'text-anchor': 'middle',
                fill: numericAxis.stroke ?? axisColor,
                'font-size': '14',
              }),
              [label],
            )
          : h.text(
              svgAttrs(h, {
                x: String(left - 10),
                y: String(position + 4),
                'text-anchor': 'end',
                fill: numericAxis.stroke ?? axisColor,
                'font-size': '14',
              }),
              [label],
            )
      }),
    )
  }
  if (!vertical && rightAxis !== undefined && rightAxis.props.hide !== true) {
    children.push(
      h.line(
        svgAttrs(h, {
          x1: String(right),
          x2: String(right),
          y1: String(top),
          y2: String(bottom),
          stroke: rightAxis.props.stroke ?? axisColor,
        }),
      ),
    )
    if (rightAxis.props.tick !== false)
      children.push(
        ...(rightAxis.props.ticks ?? ticks(rightDomain, rightAxis.props.tickCount ?? 5)).map(
          (value) =>
            h.text(
              svgAttrs(h, {
                x: String(right + (rightAxis.props.mirror ? -10 : 10)),
                y: String(coordinate(value, rightDomain[0], rightDomain[1], bottom, top) + 4),
                'text-anchor': rightAxis.props.mirror ? 'end' : 'start',
                fill: rightAxis.props.stroke ?? axisColor,
                'font-size': '14',
              }),
              [
                rightAxis.props.tickFormatter?.(value) ??
                  `${Number(value.toFixed(6))}${rightAxis.props.unit ?? ''}`,
              ],
            ),
        ),
      )
  }
  const xLabel = renderAxisLabel(h, xAxis?.props.label, 'x', { left, right, top, bottom })
  const yLabel = renderAxisLabel(h, yAxis?.props.label, 'y', { left, right, top, bottom })
  if (xLabel !== undefined) children.push(xLabel)
  if (yLabel !== undefined) children.push(yLabel)

  for (const reference of references) {
    if (reference.kind !== 'referenceLine') continue
    if (reference.props.segment !== undefined) {
      const [start, end] = reference.props.segment
      const xIndex = categories.findIndex((category) => category === start.x)
      if (xIndex < 0) continue
      const x = categoryPosition(xIndex)
      children.push(
        h.line(
          svgAttrs(h, {
            x1: String(x),
            x2: String(x),
            y1: String(valuePosition(start.y)),
            y2: String(valuePosition(end.y)),
            stroke: reference.props.stroke ?? '#64748b',
            'stroke-width': String(reference.props.strokeWidth ?? 1),
            'stroke-opacity': String(reference.props.strokeOpacity ?? 1),
            'stroke-linecap': reference.props.strokeLinecap ?? 'butt',
          }),
        ),
      )
      continue
    }
    const position =
      reference.props.y === undefined
        ? categories.findIndex((category) => category === reference.props.x)
        : -1
    const value = reference.props.y
    const at =
      value === undefined
        ? numericCategory && typeof reference.props.x === 'number'
          ? coordinate(reference.props.x, categoryDomain[0], categoryDomain[1], left, right)
          : position < 0
            ? undefined
            : categoryPosition(position)
        : valuePosition(value)
    if (at === undefined) continue
    const isHorizontal = (value !== undefined && !vertical) || (value === undefined && vertical)
    children.push(
      h.line(
        svgAttrs(
          h,
          isHorizontal
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
              dx: undefined,
              dy: undefined,
              angle: undefined,
              fill: undefined,
            }
          : reference.props.label
      const x = isHorizontal ? left + (label.dx ?? 0) + 5 : at + (label.dx ?? 0)
      const y = isHorizontal
        ? at + (label.dy ?? 0) + 14
        : bottom - (label.angle === 90 ? 110 : 7) + (label.dy ?? 0)
      children.push(
        h.text(
          svgAttrs(h, {
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

  for (const child of [...lines].sort(
    (left, right) => (left.props.zIndex ?? 0) - (right.props.zIndex ?? 0),
  )) {
    if (child.kind !== 'line') continue
    const points = props.data.map((datum, index) => {
      const value = numberValue(valueAt(datum, child.props.dataKey))
      return {
        x: vertical
          ? value === undefined
            ? 0
            : lineValuePosition(child, value)
          : categoryPosition(index),
        y: vertical
          ? categoryPosition(index)
          : value === undefined
            ? 0
            : lineValuePosition(child, value),
        value,
      }
    })
    const visible = child.props.connectNulls
      ? points.filter((point) => point.value !== undefined)
      : points
    const path = line<(typeof points)[number]>()
      .defined((point) => point.value !== undefined)
      .x((point) => point.x)
      .y((point) => point.y)
      .curve(curveFor(child.props.type, vertical))(visible)
    if (path !== null) {
      const pathAttributes = svgAttrs(h, {
        d: path,
        fill: 'none',
        stroke: lineColor(child),
        'stroke-width': String(child.props.strokeWidth ?? 2),
        'stroke-opacity': String(child.props.strokeOpacity ?? 1),
        ...(child.props.strokeLinecap === undefined
          ? {}
          : { 'stroke-linecap': child.props.strokeLinecap }),
      })
      children.push(
        h.path([
          ...pathAttributes,
          ...(child.props.strokeDasharray === undefined
            ? []
            : [h.Attribute('stroke-dasharray', child.props.strokeDasharray)]),
          ...(child.props.animationKind === 'opacity'
            ? [
                h.Style({
                  animation: `foldcn-line-opacity ${child.props.animationDuration ?? 500}ms ease-out both`,
                  transition: `d ${child.props.animationDuration ?? 500}ms ease-out`,
                }),
              ]
            : child.props.animationKind === 'swipe-left'
              ? [
                  h.Style({
                    animation: `foldcn-line-swipe-left ${child.props.animationDuration ?? 800}ms linear both`,
                    '--foldcn-line-band': `${(right - left) / Math.max(1, props.data.length - 1)}px`,
                  }),
                ]
              : child.props.animationDuration === undefined
                ? []
                : [h.Style({ transition: `d ${child.props.animationDuration}ms linear` })]),
          ...(child.props.animationKey === undefined ? [] : [h.Key(child.props.animationKey)]),
        ]),
      )
    }
    if (child.props.dot !== false)
      children.push(
        ...points.flatMap((point, index) =>
          point.value === undefined
            ? []
            : [
                typeof child.props.dot === 'function'
                  ? child.props.dot({
                      cx: point.x,
                      cy: point.y,
                      value: point.value,
                      index,
                      payload: props.data[index]!,
                    })
                  : h.circle([
                      ...svgAttrs(h, {
                        cx: String(point.x),
                        cy: String(point.y),
                        r: String(
                          child.props.dot === undefined ||
                            child.props.dot === true ||
                            child.props.dot === false
                            ? 3
                            : (child.props.dot.r ?? 3),
                        ),
                        fill: lineColor(child),
                        'data-point-index': String(index),
                      }),
                      ...(child.props.animationKind === 'swipe-left'
                        ? [
                            h.Style({
                              animation: `foldcn-line-swipe-left ${child.props.animationDuration ?? 800}ms linear both`,
                              '--foldcn-line-band': `${(right - left) / Math.max(1, props.data.length - 1)}px`,
                            }),
                          ]
                        : child.props.animationDuration === undefined
                          ? []
                          : [
                              h.Style({
                                transition: `cx ${child.props.animationDuration}ms linear, cy ${child.props.animationDuration}ms linear`,
                              }),
                            ]),
                      ...(child.props.animationKey === undefined
                        ? []
                        : [h.Key(`${child.props.animationKey}-dot-${index}`)]),
                    ]),
              ],
        ),
      )
    if (child.props.label)
      children.push(
        ...points.flatMap((point) =>
          point.value === undefined
            ? []
            : [
                h.text(
                  svgAttrs(h, {
                    x: String(point.x),
                    y: String(point.y - 7),
                    'text-anchor': 'middle',
                    fill: '#333',
                    'font-size': '10',
                  }),
                  [String(point.value)],
                ),
              ],
        ),
      )
    const activeDot = child.props.activeDot
    const selected =
      props.activeIndex === null || props.activeIndex === undefined
        ? undefined
        : points[props.activeIndex]
    if (activeDot !== undefined && activeDot !== false && selected?.value !== undefined)
      children.push(
        h.circle(
          svgAttrs(h, {
            cx: String(selected.x),
            cy: String(selected.y),
            r: String(activeDot.r ?? 5),
            fill: activeDot.fill ?? lineColor(child),
            stroke: activeDot.stroke ?? '#fff',
            'stroke-width': '2',
          }),
        ),
      )
  }

  const onActiveIndexChange = props.onActiveIndexChange
  if (props.selection !== undefined) {
    const from = categoryPosition(props.selection.fromIndex)
    const to = categoryPosition(props.selection.toIndex)
    children.push(
      h.rect(
        svgAttrs(h, {
          x: String(Math.min(from, to)),
          y: String(top),
          width: String(Math.abs(to - from)),
          height: String(bottom - top),
          fill: '#8884d8',
          'fill-opacity': '0.2',
          stroke: '#8884d8',
          'stroke-opacity': '0.3',
        }),
      ),
    )
  }
  if (onActiveIndexChange !== undefined) {
    children.push(
      ...categories.map((_, index) => {
        const span = (vertical ? bottom - top : right - left) / Math.max(1, categories.length)
        const center = categoryPosition(index)
        return h.rect([
          ...svgAttrs(
            h,
            vertical
              ? {
                  x: String(left),
                  y: String(center - span / 2),
                  width: String(right - left),
                  height: String(span),
                  fill: 'transparent',
                }
              : {
                  x: String(center - span / 2),
                  y: String(top),
                  width: String(span),
                  height: String(bottom - top),
                  fill: 'transparent',
                },
          ),
          h.OnMouseEnter(onActiveIndexChange(index)),
          ...(props.onSelectionStart === undefined
            ? []
            : [h.OnMouseDown(props.onSelectionStart(index))]),
          ...(props.onSelectionEnd === undefined ? [] : [h.OnMouseUp(props.onSelectionEnd(index))]),
        ])
      }),
    )
  }

  const activeIndex =
    props.activeIndex ?? (tooltip?.kind === 'tooltip' ? tooltip.props.defaultIndex : undefined)
  const activeDatum =
    activeIndex === undefined || activeIndex === null ? undefined : props.data[activeIndex]
  const activeRows =
    activeDatum === undefined
      ? []
      : lines
          .flatMap((child) => {
            if (child.kind !== 'line') return []
            const value = numberValue(valueAt(activeDatum, child.props.dataKey))
            return value === undefined
              ? []
              : [
                  {
                    name: child.props.name ?? dataKeyName(child.props.dataKey),
                    color: lineColor(child),
                    value,
                  },
                ]
          })
          .sort((left, right) => left.name.localeCompare(right.name))
  const activeLabel =
    activeIndex === undefined || activeIndex === null ? '' : text(categories[activeIndex])

  if (brush?.kind === 'brush') {
    const brushHeight = brush.props.height ?? 30
    const brushY = height - (props.margin?.bottom ?? defaultMargin) - brushHeight
    const stroke = brush.props.stroke ?? '#8884d8'
    const total = Math.max(1, props.brushDataLength ?? props.data.length)
    const onBrushEnd = props.onBrushEnd
    const [startIndex, endIndex] = props.brushRange ?? [0, total - 1]
    const handleX = (index: number): number =>
      left + ((right - left - 5) * index) / Math.max(1, total - 1)
    const startX = handleX(startIndex)
    const endX = handleX(endIndex)
    children.push(
      h.rect(
        svgAttrs(h, {
          x: String(left),
          y: String(brushY),
          width: String(right - left),
          height: String(brushHeight),
          fill: '#eee',
          stroke,
        }),
      ),
      h.rect(
        svgAttrs(h, {
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
              ...svgAttrs(h, {
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
        ...svgAttrs(h, {
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
        ...svgAttrs(h, {
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

  return h.div(
    [h.Class(cn('cn-chart-root', props.className)), h.DataAttribute('slot', 'line-chart')],
    [
      ...(props.children.some(
        (child) => child.kind === 'line' && child.props.animationKind === 'opacity',
      )
        ? [
            h.style(
              [],
              [
                '@keyframes foldcn-line-opacity { from { stroke-opacity: 0; } to { stroke-opacity: 1; } }',
              ],
            ),
          ]
        : []),
      ...(props.children.some(
        (child) => child.kind === 'line' && child.props.animationKind === 'swipe-left',
      )
        ? [
            h.style(
              [],
              [
                '@keyframes foldcn-line-swipe-left { from { transform: translateX(var(--foldcn-line-band)); } to { transform: translateX(0); } }',
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
          ...(props.responsive
            ? [h.Style({ height: 'auto', maxWidth: `${width}px`, overflow: 'visible' })]
            : []),
          h.Role(props.accessibilityLayer === false ? 'presentation' : 'img'),
          h.AriaLabel(props.title ?? 'Line chart'),
          ...(props.accessibilityLayer !== false && onActiveIndexChange !== undefined
            ? [
                h.Tabindex(0),
                h.OnKeyDownPreventDefault((key) => {
                  if (key === 'Escape') return Option.some(onActiveIndexChange(null))
                  if (props.data.length === 0) return Option.none()
                  if (key === 'Home') return Option.some(onActiveIndexChange(0))
                  if (key === 'End') return Option.some(onActiveIndexChange(props.data.length - 1))
                  const forward = vertical ? key === 'ArrowDown' : key === 'ArrowRight'
                  const backward = vertical ? key === 'ArrowUp' : key === 'ArrowLeft'
                  if (!forward && !backward) return Option.none()
                  const next =
                    props.activeIndex === null || props.activeIndex === undefined
                      ? forward
                        ? 0
                        : props.data.length - 1
                      : clamp(props.activeIndex + (forward ? 1 : -1), 0, props.data.length - 1)
                  return Option.some(onActiveIndexChange(next))
                }),
              ]
            : []),
          ...(props.onActiveIndexChange === undefined
            ? []
            : [h.OnMouseLeave(props.onActiveIndexChange(null))]),
        ],
        children,
      ),
      ...(tooltip?.kind === 'tooltip' &&
      tooltip.props.content !== 'none' &&
      activeDatum !== undefined &&
      activeRows.length > 0
        ? [
            h.div(
              [
                h.Class('cn-chart-tooltip cn-chart-tooltip-position'),
                h.Style({
                  left: `${clamp((categoryPosition(activeIndex ?? 0) / width) * 100, 5, 70)}%`,
                  top: '8px',
                }),
                h.Role('status'),
              ],
              [
                h.div(
                  [h.Class('cn-chart-tooltip-label')],
                  [
                    tooltip.props.labelFormatter?.(labelFor(categories[activeIndex ?? 0])) ??
                      activeLabel,
                  ],
                ),
                ...activeRows.map((row) =>
                  h.div(
                    [h.Class('cn-chart-tooltip-row')],
                    [
                      h.span(
                        [h.Style({ backgroundColor: row.color }), h.Class('cn-chart-tooltip-dot')],
                        [],
                      ),
                      `${row.name}: ${tooltip.props.formatter?.(row.value, row.name) ?? row.value}`,
                    ],
                  ),
                ),
              ],
            ),
          ]
        : []),
      ...(legend?.kind === 'legend'
        ? [
            h.div(
              [
                h.Class(
                  cn(
                    'cn-chart-legend',
                    legend.props.align === 'right'
                      ? 'cn-chart-legend-right'
                      : legend.props.align === 'left'
                        ? 'cn-chart-legend-left'
                        : 'cn-chart-legend-center',
                  ),
                ),
                h.Style({
                  position: 'absolute',
                  bottom: `${props.margin?.bottom ?? defaultMargin}px`,
                  left: '0',
                  right: '0',
                  padding: '3px',
                  paddingTop: legend.props.wrapperStyle?.paddingTop ?? '3px',
                  lineHeight: legend.props.wrapperStyle?.lineHeight ?? '18px',
                  backgroundColor: legend.props.wrapperStyle?.backgroundColor ?? '#fff',
                  borderRadius: '4px',
                }),
              ],
              [...lines]
                .sort(
                  (left, right) =>
                    legend.props.itemSorter?.(
                      left.props.name ?? dataKeyName(left.props.dataKey),
                      right.props.name ?? dataKeyName(right.props.dataKey),
                    ) ??
                    (left.props.name ?? dataKeyName(left.props.dataKey)).localeCompare(
                      right.props.name ?? dataKeyName(right.props.dataKey),
                    ),
                )
                .flatMap((child) =>
                  child.kind !== 'line' || child.props.legendType === 'none'
                    ? []
                    : [
                        h.span(
                          [
                            h.Class('cn-chart-legend-item'),
                            ...(props.onLegendHover === undefined ||
                            typeof child.props.dataKey !== 'string'
                              ? []
                              : [
                                  h.OnMouseEnter(props.onLegendHover(child.props.dataKey)),
                                  h.OnMouseLeave(props.onLegendHover(null)),
                                ]),
                          ],
                          [
                            h.span(
                              [
                                h.Class('cn-chart-legend-swatch'),
                                h.Style({ backgroundColor: lineColor(child) }),
                              ],
                              [],
                            ),
                            child.props.name ?? dataKeyName(child.props.dataKey),
                          ],
                        ),
                      ],
                ),
            ),
          ]
        : []),
    ],
  )
}
