// Recharts shape and activeShape names are part of the compatible API and example source.
/* oxlint-disable anti-slop/no-shape-in-symbol-names */
/** Recharts active-sector callout and four-row source data. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { Pie, PieChart, Tooltip } from '../../../generated/registry/ui/pie-chart'

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
    value: 100,
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
      margin: { top: 50, right: 120, bottom: 0, left: 120 },
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'pie-chart/CustomActiveShapePieChart' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'pie-chart/CustomActiveShapePieChart', index }),
      children: [
        Pie({ dataKey: 'value', innerRadius: '60%', outerRadius: '80%', activeShape: 'callout' }),
        Tooltip(),
      ],
      title: 'Custom Active Shape Pie Chart',
    },
    h,
  )
