/** Foldkit adaptation of Vertical Line Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/LineChart/VerticalLineChart.tsx. */
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

const data = generateMockData(6, 294213)

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  LineChart(
    {
      data: data,
      responsive: true,
      margin: { top: 20, right: 0, left: 0, bottom: 5 },
      layout: 'vertical',
      width: 300,
      height: 485,
      children: [
        CartesianGrid(),
        XAxis({ type: 'number' }),
        YAxis({ dataKey: 'label', type: 'category', width: 'auto' }),
        Tooltip(),
        Legend(),
        Line({ dataKey: 'x' }),
        Line({ dataKey: 'y' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) => (hover.example === 'line/vertical' ? hover.index : null),
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'line/vertical', index }),
      title: 'Vertical Line Chart',
    },
    h,
  )
