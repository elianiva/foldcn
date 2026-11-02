/** Data and top-level chart composition come from Recharts; the secondary quarter axis follows its tick callback. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/bar-chart'

const data = [
  {
    date: '2000-01',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    date: '2000-02',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    date: '2000-03',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    date: '2000-04',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    date: '2000-05',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    date: '2000-06',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    date: '2000-07',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
  {
    date: '2000-08',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    date: '2000-09',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    date: '2000-10',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    date: '2000-11',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    date: '2000-12',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
]

export default (_model: Model, h: HtmlBuilder<Message>): Html => {
  const quarterTick = ({
    x,
    y,
    value,
    band,
  }: {
    x: number
    y: number
    value: string | number | ReadonlyArray<number> | null | undefined
    index: number
    band: number
  }): Html => {
    const month = new Date(String(value)).getMonth()
    const quarterNo = Math.floor(month / 3) + 1
    if (month % 3 === 1)
      return h.text(
        [
          h.Attribute('x', String(x)),
          h.Attribute('y', String(y)),
          h.Attribute('text-anchor', 'middle'),
          h.Attribute('fill', '#333'),
          h.Attribute('font-size', '12'),
        ],
        ['Q' + quarterNo],
      )
    if (month % 3 === 0 || month === 11)
      return h.path([
        h.Attribute(
          'd',
          'M' + (month === 11 ? x + band / 2 : x - band / 2) + ',' + (y - 4) + 'v-35',
        ),
        h.Attribute('stroke', 'red'),
      ])
    return h.g([], [])
  }
  return BarChart(
    {
      data,
      responsive: true,
      margin: { top: 25, right: 0, left: 0, bottom: 5 },
      children: [
        CartesianGrid(),
        XAxis({
          dataKey: 'date',
          tickFormatter: (value) => String(new Date(String(value)).getMonth() + 1),
        }),
        XAxis({ dataKey: 'date', xAxisId: 'quarter', tick: quarterTick }),
        YAxis(),
        Tooltip(),
        Legend({ wrapperStyle: { paddingTop: '1em', backgroundColor: 'transparent' } }),
        Bar({ dataKey: 'pv' }),
        Bar({ dataKey: 'uv' }),
      ],
      title: 'Bar Chart With Multi X Axis',
    },
    h,
  )
}
