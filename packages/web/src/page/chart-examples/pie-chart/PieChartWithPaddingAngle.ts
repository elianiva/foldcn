/** Foldkit adaptation of Pie Chart with gap and rounded corners from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/PieChart/PieChartWithPaddingAngle.tsx. */
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
]

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  PieChart(
    {
      responsive: true,
      height: 500,
      children: [
        Pie({
          dataKey: 'value',
          data: data,
          innerRadius: '80%',
          outerRadius: '100%',
          paddingAngle: 5,
          cornerRadius: '50%',
        }),
      ],
      title: 'Pie Chart with gap and rounded corners',
    },
    h,
  )
