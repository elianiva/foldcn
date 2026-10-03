/** Foldkit adaptation of the Recharts Line Chart Connect Nulls example.
 * The source renders the same data once with the gap and once connected. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import {
  CartesianGrid,
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
  },
  {
    name: 'Page B',
    uv: 3000,
  },
  {
    name: 'Page C',
    uv: 2000,
  },
  {
    name: 'Page D',
  },
  {
    name: 'Page E',
    uv: 1890,
  },
  {
    name: 'Page F',
    uv: 2390,
  },
  {
    name: 'Page G',
    uv: 3490,
  },
]

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('space-y-6')],
    [
      LineChart(
        {
          data,
          responsive: true,
          height: 216,
          margin: { top: 10, right: 30, left: 0, bottom: 0 },
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'name' }),
            YAxis(),
            Tooltip(),
            Line({ dataKey: 'uv', type: 'monotone' }),
          ],
          title: 'Line Chart Connect Nulls: gaps',
        },
        h,
      ),
      LineChart(
        {
          data,
          responsive: true,
          height: 216,
          margin: { top: 10, right: 30, left: 0, bottom: 0 },
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'name' }),
            YAxis(),
            Tooltip(),
            Line({ dataKey: 'uv', type: 'monotone', connectNulls: true }),
          ],
          title: 'Line Chart Connect Nulls: connected',
        },
        h,
      ),
    ],
  )
