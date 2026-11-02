/** Foldkit adaptation of Vertical Line Chart With Specified Domain from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/LineChart/VerticalLineChartWithSpecifiedDomain.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
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

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  LineChart(
    {
      data: data,
      responsive: true,
      layout: 'vertical',
      margin: { top: 20, right: 0, left: 0, bottom: 5 },
      width: 300,
      height: 485,
      children: [
        CartesianGrid(),
        XAxis({ type: 'number', domain: [0, 'dataMax + 1000'] }),
        YAxis({ dataKey: 'name', type: 'category', width: 'auto' }),
        Tooltip(),
        Legend(),
        Line({ dataKey: 'pv' }),
        Line({ dataKey: 'uv' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'line/VerticalLineChartWithSpecifiedDomain' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'line/VerticalLineChartWithSpecifiedDomain', index }),
      title: 'Vertical Line Chart With Specified Domain',
    },
    h,
  )
