/** Source data, colors, and legend hover order from Recharts. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/line-chart'

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
]
const LINE_COLORS = {
  uv: '#8884d8',
  pv: '#82ca9d',
  amt: '#ffc658',
}

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const activeKey = Option.match(model.chartLegendHover, {
    onNone: () => null,
    onSome: (hover) => (hover.example === 'line/DynamicZIndexLineChart' ? hover.key : null),
  })
  return LineChart(
    {
      data,
      responsive: true,
      margin: { top: 5, right: 0, left: 0, bottom: 5 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'name' }),
        YAxis({ width: 'auto' }),
        Tooltip(),
        Legend(),
        ...Object.entries(LINE_COLORS).map(([key, color]) =>
          Line({
            dataKey: key,
            type: 'monotone',
            stroke: color,
            strokeOpacity: activeKey === key ? 0.5 : 1,
            zIndex: activeKey === key ? 10 : 0,
          }),
        ),
      ],
      onLegendHover: (key) =>
        ChartMessage.ChartLegendHovered({ example: 'line/DynamicZIndexLineChart', key }),
      title: 'Dynamic Z-Index Line Chart',
    },
    h,
  )
}
