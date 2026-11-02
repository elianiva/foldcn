/** Source bars and legend focus behavior from Recharts Mix Bar Chart. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/bar-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 823)
const id = 'bar-chart/MixBarChart'

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const focused = Option.match(model.chartLegendHover, {
    onNone: () => null,
    onSome: (hover) => (hover.example === id ? hover.key : null),
  })
  const fill = (key: string, color: string): string =>
    focused === null || focused === key ? color : '#eee'
  return BarChart(
    {
      data,
      responsive: true,
      width: 700,
      margin: { top: 20, right: 0, left: 0, bottom: 5 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'label' }),
        YAxis({ niceTicks: 'snap125' }),
        Tooltip(),
        Legend(),
        Bar({ dataKey: 'x', stackId: 'a', stroke: 'none', fill: fill('x', '#8884d8') }),
        Bar({ dataKey: 'y', stackId: 'a', stroke: 'none', fill: fill('y', '#82ca9d') }),
        Bar({ dataKey: 'z', stroke: 'none', fill: fill('z', '#ffc658') }),
      ],
      onLegendHover: (key) => ChartMessage.ChartLegendHovered({ example: id, key }),
      onLegendClick: (key) => ChartMessage.ChartLegendClicked({ example: id, key }),
      title: 'Mix Bar Chart',
    },
    h,
  )
}
