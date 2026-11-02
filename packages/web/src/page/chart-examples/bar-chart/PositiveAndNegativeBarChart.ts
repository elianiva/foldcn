/** Foldkit adaptation of Positive and Negative Bar Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/BarChart/PositiveAndNegativeBarChart.tsx. */
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
      margin: { top: 5, right: 0, left: 0, bottom: 5 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'name' }),
        YAxis({
          width: 'auto',
          domain: [-10000, 10000],
          ticks: [-10000, -5000, 0, 5000, 10000],
          tick: ({ x, y, value }) =>
            h.text(
              [
                h.Attribute('x', String(x)),
                h.Attribute('y', String(y)),
                h.Attribute(
                  'fill',
                  Number(value) < 0 ? 'red' : Number(value) > 0 ? 'green' : 'black',
                ),
                h.Attribute('font-weight', Number(value) === 0 ? 'bold' : 'normal'),
                h.Attribute('text-anchor', 'end'),
                h.Attribute('font-size', '12'),
              ],
              [String(value)],
            ),
        }),
        Tooltip(),
        Legend(),
        ReferenceLine({ y: 0 }),
        Bar({ dataKey: 'pv' }),
        Bar({ dataKey: 'uv' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'bar-chart/PositiveAndNegativeBarChart' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'bar-chart/PositiveAndNegativeBarChart', index }),
      title: 'Positive and Negative Bar Chart',
    },
    h,
  )
