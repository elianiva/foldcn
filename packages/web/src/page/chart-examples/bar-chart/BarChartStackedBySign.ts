/** Foldkit adaptation of Bar Chart Stacked By Sign from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/BarChart/BarChartStackedBySign.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Bar,
} from '../../../generated/registry/ui/bar-chart'

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: -3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: -2000,
    pv: -9800,
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
    uv: -1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: -3800,
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
  BarChart(
    {
      data: data,
      responsive: true,
      margin: { top: 25, right: 0, left: 0, bottom: 5 },
      stackOffset: 'sign',
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'name' }),
        YAxis({ width: 'auto', domain: [-12000, 12000], ticks: [-12000, -6000, 0, 6000, 12000] }),
        Tooltip(),
        Legend(),
        ReferenceLine({ y: 0 }),
        Bar({ dataKey: 'pv', stackId: 'stack' }),
        Bar({ dataKey: 'uv', stackId: 'stack' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'bar-chart/BarChartStackedBySign' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'bar-chart/BarChartStackedBySign', index }),
      title: 'Bar Chart Stacked By Sign',
    },
    h,
  )
