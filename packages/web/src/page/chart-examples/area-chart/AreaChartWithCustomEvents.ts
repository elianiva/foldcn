/** Foldkit adaptation of Area Chart With Custom Events from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/AreaChart/AreaChartWithCustomEvents.tsx. */
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

const data = generateMockData(20, 456)

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  AreaChart(
    {
      data: data,
      responsive: true,
      margin: { top: 20, right: 0, left: 0, bottom: 0 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'label' }),
        YAxis({ width: 'auto', domain: [0, 300], ticks: [0, 75, 150, 225, 300] }),
        Tooltip(),
        Area({ dataKey: 'x', type: 'step' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'area-chart/AreaChartWithCustomEvents' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'area-chart/AreaChartWithCustomEvents', index }),
      title: 'Area Chart With Custom Events',
    },
    h,
  )
