/** Three synchronized Recharts line and area previews. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/line-chart'
import { Area, AreaChart } from '../../../generated/registry/ui/area-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 2213)
const margin = { top: 10, right: 30, left: 0, bottom: 0 }

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const range =
    model.chartZoomRanges['line/SynchronizedLineChart'] ?? ([0, data.length - 1] as const)
  const visibleData = data.slice(range[0], range[1] + 1)
  const activeIndex = Option.match(model.chartHover, {
    onNone: () => null,
    onSome: (hover) => (hover.example === 'line/SynchronizedLineChart' ? hover.index : null),
  })
  const onActiveIndexChange = (index: number | null): Message =>
    ChartMessage.ChartHovered({ example: 'line/SynchronizedLineChart', index })
  const common = [CartesianGrid(), XAxis({ dataKey: 'label' }), Tooltip()]
  return h.div(
    [],
    [
      LineChart(
        {
          data: visibleData,
          width: 700,
          height: 143,
          responsive: true,
          margin,
          children: [
            ...common,
            YAxis({ domain: [0, 280], ticks: [0, 70, 140, 210, 280] }),
            Line({ dataKey: 'x', type: 'monotone' }),
          ],
          activeIndex,
          onActiveIndexChange,
          title: 'Synchronized Line Chart: x',
        },
        h,
      ),
      LineChart(
        {
          data: visibleData,
          width: 700,
          height: 143,
          responsive: true,
          margin,
          children: [
            ...common,
            YAxis({ domain: [0, 800], ticks: [0, 400, 800] }),
            Line({ dataKey: 'y', type: 'monotone' }),
            Brush({ stroke: '#666' }),
          ],
          brushRange: range,
          brushDataLength: data.length,
          onBrushStart: (edge) =>
            ChartMessage.ChartZoomStarted({
              id: 'line/SynchronizedLineChart',
              index: edge === 'start' ? range[1] : range[0],
            }),
          onBrushEnd: (index) =>
            ChartMessage.ChartZoomEnded({ id: 'line/SynchronizedLineChart', index }),
          activeIndex,
          onActiveIndexChange,
          title: 'Synchronized Line Chart: y',
        },
        h,
      ),
      AreaChart(
        {
          data: visibleData,
          width: 700,
          height: 143,
          responsive: true,
          margin,
          children: [
            ...common,
            YAxis({ domain: [0, 2000], ticks: [0, 500, 1000, 1500, 2000] }),
            Area({ dataKey: 'z', type: 'monotone' }),
          ],
          activeIndex,
          onActiveIndexChange,
          title: 'Synchronized Line Chart: z',
        },
        h,
      ),
    ],
  )
}
