/** Foldkit adaptation of Biaxial Line Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/LineChart/BiaxialLineChart.tsx. */
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

const data = generateMockData(6, 231)

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  LineChart(
    {
      data: data,
      responsive: true,
      margin: { top: 15, right: 0, left: 0, bottom: 5 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'label' }),
        YAxis({ width: 'auto', yAxisId: 'left' }),
        YAxis({ width: 'auto', yAxisId: 'right', orientation: 'right' }),
        Tooltip(),
        Legend(),
        Line({ dataKey: 'x', type: 'monotone', yAxisId: 'left' }),
        Line({ dataKey: 'y', type: 'monotone', yAxisId: 'right' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) => (hover.example === 'line/BiaxialLineChart' ? hover.index : null),
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'line/BiaxialLineChart', index }),
      title: 'Biaxial Line Chart',
    },
    h,
  )
