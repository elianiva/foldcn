/** Foldkit adaptation of Biaxial Bar Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/BarChart/BiaxialBarChart.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from '../../../generated/registry/ui/bar-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 823)

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  BarChart(
    {
      data: data,
      responsive: true,
      margin: { top: 20, right: 0, left: 0, bottom: 5 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'label' }),
        YAxis({ width: 'auto', yAxisId: 'left', orientation: 'left' }),
        YAxis({ width: 'auto', yAxisId: 'right', orientation: 'right' }),
        Tooltip(),
        Legend(),
        Bar({ dataKey: 'x', yAxisId: 'left' }),
        Bar({ dataKey: 'y', yAxisId: 'right' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) => (hover.example === 'bar-chart/BiaxialBarChart' ? hover.index : null),
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'bar-chart/BiaxialBarChart', index }),
      title: 'Biaxial Bar Chart',
    },
    h,
  )
