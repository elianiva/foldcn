/** Foldkit adaptation of the Recharts Waterfall example.
 * Range bars follow the source computation; fills match the published chart output. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/bar-chart'

const rawData = [
  {
    name: 'Revenue',
    value: 420,
  },
  {
    name: 'Services',
    value: 210,
  },
  {
    name: 'Fixed costs',
    value: -170,
  },
  {
    name: 'Variable costs',
    value: -120,
  },
  {
    name: 'Taxes',
    value: -60,
  },
  {
    name: 'Profit',
    value: 280,
    isTotal: true,
  },
]
let runningTotal = 0
const waterfallData = rawData.map((entry) => {
  const value = entry.value
  const isTotal = 'isTotal' in entry && entry.isTotal === true
  const low = isTotal ? Math.min(0, value) : value >= 0 ? runningTotal : runningTotal + value
  const high = isTotal ? Math.max(0, value) : value >= 0 ? runningTotal + value : runningTotal
  if (!isTotal) runningTotal += value
  return { name: entry.name, value, waterfallRange: [low, high] as const }
})
const cells = rawData.map((entry) => ({
  fill: 'isTotal' in entry && entry.isTotal === true ? '#1565C0' : '#4CAF50',
}))

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  BarChart(
    {
      data: waterfallData,
      responsive: true,
      margin: { top: 20, right: 30, bottom: 5, left: 20 },
      children: [
        CartesianGrid({ vertical: false }),
        XAxis({ dataKey: 'name' }),
        YAxis(),
        Tooltip(),
        Bar({ dataKey: 'waterfallRange', cells }),
      ],
      title: 'Waterfall',
    },
    h,
  )
