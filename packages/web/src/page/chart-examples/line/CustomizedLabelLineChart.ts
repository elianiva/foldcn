/** Foldkit adaptation of Customized Label Line Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/LineChart/CustomizedLabelLineChart.tsx. */
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

const data = generateMockData(6, 2213)

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  LineChart(
    {
      data: data,
      responsive: true,
      margin: { top: 20, right: 20, left: 20, bottom: 10 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'label', height: 60, tickAngle: -30 }),
        YAxis({ width: 'auto' }),
        Tooltip(),
        Legend(),
        Line({ dataKey: 'x', type: 'monotone', label: true }),
        Line({ dataKey: 'y', type: 'monotone' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) => (hover.example === 'line/CustomizedLabelLineChart' ? hover.index : null),
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'line/CustomizedLabelLineChart', index }),
      title: 'Customized Label Line Chart',
    },
    h,
  )
