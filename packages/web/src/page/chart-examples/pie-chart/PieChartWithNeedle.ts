/** Foldkit adaptation of the Recharts Pie Chart With Needle example. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Needle, Pie, PieChart } from '../../../generated/registry/ui/pie-chart'

const chartData = [
  {
    name: 'A',
    value: 80,
    fill: '#ff0000',
  },
  {
    name: 'B',
    value: 45,
    fill: '#00ff00',
  },
  {
    name: 'C',
    value: 25,
    fill: '#0000ff',
  },
]

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex justify-center')],
    [
      PieChart(
        {
          width: 210,
          height: 120,
          data: chartData,
          children: [
            Pie({
              dataKey: 'value',
              startAngle: 180,
              endAngle: 0,
              cx: 100,
              cy: 100,
              innerRadius: 50,
              outerRadius: 100,
              stroke: 'none',
            }),
            Needle({ dataKey: 'value', index: 0, color: '#d0d000', baseRadius: 5 }),
          ],
          title: 'Pie Chart With Needle',
        },
        h,
      ),
    ],
  )
