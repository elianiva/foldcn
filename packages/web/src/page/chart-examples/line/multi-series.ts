/** Foldkit adaptation of the Recharts Line Chart Has Multi Series example. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import type { Datum } from '../../../generated/registry/ui/line-chart'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/line-chart'

const series = [
  {
    name: 'Series 1',
    data: [
      {
        category: 'A',
        value: 0.1,
      },
      {
        category: 'B',
        value: 0.2,
      },
      {
        category: 'C',
        value: 0.3,
      },
    ],
  },
  {
    name: 'Series 2',
    data: [
      {
        category: 'B',
        value: 0.4,
      },
      {
        category: 'C',
        value: 0.5,
      },
      {
        category: 'D',
        value: 0.6,
      },
    ],
  },
  {
    name: 'Series 3',
    data: [
      {
        category: 'C',
        value: 0.7,
      },
      {
        category: 'D',
        value: 0.8,
      },
      {
        category: 'E',
        value: 0.9,
      },
    ],
  },
]
const categories = [...new Set(series.flatMap((item) => item.data.map((row) => row.category)))]
const data: ReadonlyArray<Datum> = categories.map((category) => {
  const row = { category }
  series.forEach((item, index) => {
    const value = item.data.find((point) => point.category === category)?.value
    if (value !== undefined) Object.assign(row, { [`series${index}`]: value })
  })
  return row
})

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  LineChart(
    {
      data,
      responsive: true,
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'category' }),
        YAxis(),
        Tooltip(),
        Legend(),
        ...series.map((item, index) => Line({ dataKey: `series${index}`, name: item.name })),
      ],
      title: 'Line Chart Has Multi Series',
    },
    h,
  )
