/** Foldkit adaptation of Line Chart With X Axis Padding from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/LineChart/LineChartWithXAxisPadding.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from '../../../generated/registry/ui/line-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 248213)

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  LineChart(
    {
      data: data,
      responsive: true,
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'label', padding: { left: 30, right: 100 } }),
        YAxis({ width: 'auto' }),
        Tooltip(),
        Legend(),
        Line({ dataKey: 'x', type: 'monotone' }),
        Line({ dataKey: 'y', type: 'monotone' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'line/LineChartWithXAxisPadding' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'line/LineChartWithXAxisPadding', index }),
      title: 'Line Chart With X Axis Padding',
    },
    h,
  )
