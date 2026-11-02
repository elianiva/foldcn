/** Recharts four-sector colors, percent labels, and hover fading. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { Pie, PieChart } from '../../../generated/registry/ui/pie-chart'

const data = [
  {
    name: 'Group A',
    value: 400,
  },
  {
    name: 'Group B',
    value: 300,
  },
  {
    name: 'Group C',
    value: 300,
  },
  {
    name: 'Group D',
    value: 200,
  },
]

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  PieChart(
    {
      data,
      width: 500,
      height: 500,
      responsive: true,
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'pie-chart/PieChartWithCustomizedLabel' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'pie-chart/PieChartWithCustomizedLabel', index }),
      children: [
        Pie({
          dataKey: 'value',
          label: 'percent',
          colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
          stroke: 'none',
          fillOpacity: 1,
          fadeOnHover: true,
        }),
      ],
      title: 'Pie Chart With Customized Label',
    },
    h,
  )
