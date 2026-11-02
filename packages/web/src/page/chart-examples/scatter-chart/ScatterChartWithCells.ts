/** Data and top-level chart composition come from Recharts; each source symbol and color is retained. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/scatter-chart'

const data = [
  {
    x: 100,
    y: 200,
    z: 200,
  },
  {
    x: 120,
    y: 100,
    z: 260,
  },
  {
    x: 170,
    y: 300,
    z: 400,
  },
  {
    x: 140,
    y: 250,
    z: 280,
  },
  {
    x: 150,
    y: 400,
    z: 500,
  },
  {
    x: 110,
    y: 280,
    z: 200,
  },
]
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'pink']
const SYMBOLS = ['circle', 'cross', 'diamond', 'square', 'star', 'triangle', 'wye'] as const

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  ScatterChart(
    {
      responsive: true,
      margin: { top: 20, right: 0, bottom: 0, left: 0 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'x', type: 'number', unit: 'cm' }),
        YAxis({ dataKey: 'y', type: 'number', unit: 'kg' }),
        Tooltip(),
        Scatter({
          dataKey: 'y',
          data,
          name: 'A school',
          symbols: SYMBOLS,
          symbolColors: COLORS,
          symbolSize: 300,
        }),
      ],
      title: 'Scatter Chart With Cells',
    },
    h,
  )
