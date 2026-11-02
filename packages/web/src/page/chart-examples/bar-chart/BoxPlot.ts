// Recharts shape and activeShape names are part of the compatible API and example source.
/* oxlint-disable anti-slop/no-shape-in-symbol-names */
/** Foldkit adaptation of the Recharts Box Plot example.
 * Quartile boxes, median lines, whiskers, and outliers follow the source data. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import type { BarShapeProps } from '../../../generated/registry/ui/bar-chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/bar-chart'

const data = [
  {
    category: 'A',
    min: 16,
    q1: 20,
    median: 24,
    q3: 29,
    max: 35,
  },
  {
    category: 'B',
    min: 12,
    q1: 15,
    median: 18,
    q3: 21,
    max: 27,
  },
  {
    category: 'C',
    min: 22,
    q1: 26,
    median: 30,
    q3: 34,
    max: 49,
  },
  {
    category: 'D',
    min: 9,
    q1: 13,
    median: 17,
    q3: 20,
    max: 26,
  },
  {
    category: 'E',
    min: 18,
    q1: 22,
    median: 25,
    q3: 28,
    max: 32,
  },
]
const outliers = [
  {
    category: 'A',
    value: 10,
  },
  {
    category: 'A',
    value: 11,
  },
  {
    category: 'A',
    value: 12,
  },
  {
    category: 'A',
    value: 5,
  },
  {
    category: 'B',
    value: 0,
  },
  {
    category: 'A',
    value: 40,
  },
  {
    category: 'D',
    value: 8,
  },
  {
    category: 'E',
    value: 33,
  },
]

export default (_model: Model, h: HtmlBuilder<Message>): Html => {
  const boxShape = ({ x, y, width, height, payload, fill }: BarShapeProps): Html => {
    const q1 = Number(payload.q1)
    const q3 = Number(payload.q3)
    const median = Number(payload.median)
    const pxPerValue = height / Math.max(1, q3 - q1)
    const yAt = (value: number): number => y + (q3 - value) * pxPerValue
    const center = x + width / 2
    const matches = outliers.filter((point) => point.category === payload.category)
    return h.g(
      [],
      [
        h.line([
          h.Attribute('x1', String(center)),
          h.Attribute('x2', String(center)),
          h.Attribute('y1', String(yAt(Number(payload.min)))),
          h.Attribute('y2', String(yAt(Number(payload.max)))),
          h.Attribute('stroke', '#1f2937'),
        ]),
        h.rect([
          h.Attribute('x', String(x)),
          h.Attribute('y', String(y)),
          h.Attribute('width', String(width)),
          h.Attribute('height', String(height)),
          h.Attribute('fill', fill),
        ]),
        h.line([
          h.Attribute('x1', String(x)),
          h.Attribute('x2', String(x + width)),
          h.Attribute('y1', String(yAt(median))),
          h.Attribute('y2', String(yAt(median))),
          h.Attribute('stroke', '#1f2937'),
          h.Attribute('stroke-width', '2'),
        ]),
        ...matches.map((point) =>
          h.circle([
            h.Attribute('cx', String(center)),
            h.Attribute('cy', String(yAt(point.value))),
            h.Attribute('r', '4'),
            h.Attribute('fill', '#e11d48'),
          ]),
        ),
      ],
    )
  }
  return BarChart(
    {
      data,
      responsive: true,
      children: [
        XAxis({ dataKey: 'category' }),
        YAxis({ domain: [0, 60] }),
        CartesianGrid({ vertical: false }),
        Bar({ dataKey: (row) => [Number(row.q1), Number(row.q3)], shape: boxShape, barSize: 100 }),
        Tooltip(),
      ],
      title: 'Box Plot',
    },
    h,
  )
}
