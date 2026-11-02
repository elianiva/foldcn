/** Recharts negative-value line with axes crossing at the zero reference lines. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/line-chart'

const data = [
  {
    x: -50,
    y: -50,
  },
  {
    x: 0,
    y: 0,
  },
  {
    x: 50,
    y: 50,
  },
  {
    x: 100,
    y: 100,
  },
  {
    x: 150,
    y: 150,
  },
  {
    x: 200,
    y: 200,
  },
  {
    x: 250,
    y: 250,
  },
  {
    x: 350,
    y: 350,
  },
  {
    x: 400,
    y: 400,
  },
  {
    x: 450,
    y: 450,
  },
  {
    x: 500,
    y: 500,
  },
]

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  LineChart(
    {
      data,
      responsive: true,
      margin: { top: 5, right: 0, left: 0, bottom: 5 },
      children: [
        CartesianGrid(),
        YAxis({
          dataKey: 'y',
          type: 'number',
          domain: [-200, 600],
          tickCount: 5,
          strokeWidth: 0,
          label: { value: 'y', angle: -90, position: 'left', textAnchor: 'middle' },
        }),
        XAxis({
          dataKey: 'x',
          type: 'number',
          domain: [-200, 600],
          tickCount: 5,
          strokeWidth: 0,
          label: { value: 'x', position: 'bottom' },
        }),
        ReferenceLine({ y: 0, stroke: '#666', strokeWidth: 1.5, strokeOpacity: 0.65 }),
        ReferenceLine({ x: 0, stroke: '#666', strokeWidth: 1.5, strokeOpacity: 0.65 }),
        Line({ dataKey: 'y', type: 'monotone', strokeWidth: 2, dot: false }),
      ],
      title: 'Line Chart Negative Values With Reference Lines',
    },
    h,
  )
