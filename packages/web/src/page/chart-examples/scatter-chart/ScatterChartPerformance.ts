/** Recharts performance scatter: seeded generator, 100 series and 10 points each. */
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
  ZAxis,
} from '../../../generated/registry/ui/scatter-chart'

let seed = 42
const between = (min: number, max: number): number => {
  seed = (75 * seed + 74) % 65537
  return (Math.round(seed) % (max - min)) + min
}
const datasets = Array.from({ length: 100 }, (_, i) => ({
  name: `line-${i}`,
  passed: between(0, 10) > 5,
  points: Array.from({ length: 10 }, () => ({
    x: between(0, 100),
    y: between(0, 100),
    z: between(0, 100),
  })),
}))

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  ScatterChart(
    {
      responsive: true,
      width: 700,
      margin: { top: 20, right: 0, bottom: 0, left: 0 },
      children: [
        CartesianGrid(),
        XAxis({
          dataKey: 'x',
          type: 'number',
          domain: [0, 99],
          ticks: [0, 25, 50, 75, 99],
          unit: 'm',
        }),
        YAxis({
          dataKey: 'y',
          type: 'number',
          domain: [0, 100],
          ticks: [0, 25, 50, 75, 100],
          unit: 'm',
          width: 60,
        }),
        ZAxis({ dataKey: 'z', range: [0, 100] }),
        Tooltip(),
        ...datasets.map((line) =>
          Scatter({
            dataKey: 'y',
            data: line.points,
            fill: line.passed ? '#22c55e' : '#ef4444',
            name: line.name,
          }),
        ),
      ],
      title: 'Scatter Chart with many points',
    },
    h,
  )
