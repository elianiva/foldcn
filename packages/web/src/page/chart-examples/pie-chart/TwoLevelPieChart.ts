/** Foldkit adaptation of Two Level Pie Chart (Recharts TwoLevelPieChart). */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import { Message } from '../../../message'
import { PieChart, Pie } from '../../../generated/registry/ui/pie-chart'
import { pieInnerData, pieOuterData } from '../shared'

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  PieChart(
    {
      responsive: true,
      title: 'Two Level Pie Chart',
      children: [
        Pie({ data: pieInnerData, dataKey: 'value', outerRadius: '50%', fill: '#8884d8' }),
        Pie({
          data: pieOuterData,
          dataKey: 'value',
          innerRadius: '60%',
          outerRadius: '80%',
          fill: '#82ca9d',
          label: true,
        }),
      ],
    },
    h,
  )
