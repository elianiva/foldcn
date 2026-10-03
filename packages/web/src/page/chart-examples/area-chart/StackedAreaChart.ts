/** Foldkit adaptation of Stacked Area Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/AreaChart/StackedAreaChart.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from '../../../generated/registry/ui/area-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 351905)

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  AreaChart(
    {
      data: data,
      responsive: true,
      margin: { top: 20, right: 0, left: 0, bottom: 0 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'label' }),
        YAxis({ niceTicks: 'snap125', width: 'auto' }),
        Tooltip(),
        Area({ dataKey: 'x', type: 'monotone', stackId: '1' }),
        Area({ dataKey: 'y', type: 'monotone', stackId: '1' }),
        Area({ dataKey: 'z', type: 'monotone', stackId: '1' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) => (hover.example === 'area-chart/StackedAreaChart' ? hover.index : null),
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'area-chart/StackedAreaChart', index }),
      title: 'Stacked Area Chart',
    },
    h,
  )
