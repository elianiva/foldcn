/** Foldkit adaptation of Straight Angle Pie Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/PieChart/StraightAnglePieChart.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { PieChart, Pie } from '../../../generated/registry/ui/pie-chart'

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
  {
    name: 'Group E',
    value: 278,
  },
  {
    name: 'Group F',
    value: 189,
  },
]

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  PieChart(
    {
      responsive: true,
      height: 250,
      children: [
        Pie({
          dataKey: 'value',
          data: data,
          cx: '50%',
          cy: '100%',
          outerRadius: '120%',
          startAngle: 180,
          endAngle: 0,
          label: true,
        }),
      ],
      title: 'Straight Angle Pie Chart',
    },
    h,
  )
