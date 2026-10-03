/** Foldkit adaptation of the five Recharts axis interval examples. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/line-chart'
import { generateMockData } from '../shared'

const data = generateMockData(100, 22813)
const intervals = [
  'preserveStart',
  'preserveEnd',
  'preserveStartEnd',
  'equidistantPreserveStart',
  1,
] as const

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('space-y-2'), h.Style({ maxWidth: '500px' })],
    intervals.map((interval) =>
      h.div(
        [h.Style({ position: 'relative' })],
        [
          LineChart(
            {
              data,
              width: 500,
              height: 309,
              responsive: true,
              margin: { left: 0, right: 0, top: 10 },
              children: [
                CartesianGrid(),
                XAxis({ dataKey: 'label', interval }),
                YAxis({ interval, width: 'auto' }),
                Line({ dataKey: 'x', type: 'monotone' }),
                Line({ dataKey: 'y', type: 'monotone' }),
              ],
              title: 'Line Chart Axis Interval: ' + interval,
            },
            h,
          ),
          h.div(
            [h.Style({ position: 'absolute', left: '35%', bottom: '30px', fontSize: '12px' })],
            ['interval: ' + interval],
          ),
        ],
      ),
    ),
  )
