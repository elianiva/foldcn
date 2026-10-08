/** Foldkit adaptation of Cardinal Area Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/AreaChart/CardinalAreaChart.tsx. */
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

const data = generateMockData(6, 9823)

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  AreaChart(
    {
      data: data,
      responsive: true,
      margin: { top: 20, right: 0, left: 0, bottom: 0 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'label' }),
        YAxis({ width: 'auto', domain: [0, 280], ticks: [0, 70, 140, 210, 280] }),
        Tooltip(),
        Area({
          dataKey: 'x',
          type: 'monotone',
          stroke: '#8884d8',
          fill: '#8884d8',
          fillOpacity: 0.3,
        }),
        Area({
          dataKey: 'x',
          stroke: '#82ca9d',
          fill: '#82ca9d',
          fillOpacity: 0.3,
          type: 'cardinal',
          curveTension: 0.8,
        }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) => (hover.example === 'area-chart/CardinalAreaChart' ? hover.index : null),
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'area-chart/CardinalAreaChart', index }),
      title: 'Cardinal Area Chart',
    },
    h,
  )
