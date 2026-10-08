/** The seven-day Bubble Chart composition and both hourly datasets from Recharts. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from '../../../generated/registry/ui/scatter-chart'
import { ObserveChartSize } from '../observe-size'

const data01 = [
  {
    hour: '12a',
    index: 1,
    value: 170,
  },
  {
    hour: '1a',
    index: 1,
    value: 180,
  },
  {
    hour: '2a',
    index: 1,
    value: 150,
  },
  {
    hour: '3a',
    index: 1,
    value: 120,
  },
  {
    hour: '4a',
    index: 1,
    value: 200,
  },
  {
    hour: '5a',
    index: 1,
    value: 300,
  },
  {
    hour: '6a',
    index: 1,
    value: 400,
  },
  {
    hour: '7a',
    index: 1,
    value: 200,
  },
  {
    hour: '8a',
    index: 1,
    value: 100,
  },
  {
    hour: '9a',
    index: 1,
    value: 150,
  },
  {
    hour: '10a',
    index: 1,
    value: 160,
  },
  {
    hour: '11a',
    index: 1,
    value: 170,
  },
  {
    hour: '12a',
    index: 1,
    value: 180,
  },
  {
    hour: '1p',
    index: 1,
    value: 144,
  },
  {
    hour: '2p',
    index: 1,
    value: 166,
  },
  {
    hour: '3p',
    index: 1,
    value: 145,
  },
  {
    hour: '4p',
    index: 1,
    value: 150,
  },
  {
    hour: '5p',
    index: 1,
    value: 170,
  },
  {
    hour: '6p',
    index: 1,
    value: 180,
  },
  {
    hour: '7p',
    index: 1,
    value: 165,
  },
  {
    hour: '8p',
    index: 1,
    value: 130,
  },
  {
    hour: '9p',
    index: 1,
    value: 140,
  },
  {
    hour: '10p',
    index: 1,
    value: 170,
  },
  {
    hour: '11p',
    index: 1,
    value: 180,
  },
]
const data02 = [
  {
    hour: '12a',
    index: 1,
    value: 160,
  },
  {
    hour: '1a',
    index: 1,
    value: 180,
  },
  {
    hour: '2a',
    index: 1,
    value: 150,
  },
  {
    hour: '3a',
    index: 1,
    value: 120,
  },
  {
    hour: '4a',
    index: 1,
    value: 200,
  },
  {
    hour: '5a',
    index: 1,
    value: 300,
  },
  {
    hour: '6a',
    index: 1,
    value: 100,
  },
  {
    hour: '7a',
    index: 1,
    value: 200,
  },
  {
    hour: '8a',
    index: 1,
    value: 100,
  },
  {
    hour: '9a',
    index: 1,
    value: 150,
  },
  {
    hour: '10a',
    index: 1,
    value: 160,
  },
  {
    hour: '11a',
    index: 1,
    value: 160,
  },
  {
    hour: '12a',
    index: 1,
    value: 180,
  },
  {
    hour: '1p',
    index: 1,
    value: 144,
  },
  {
    hour: '2p',
    index: 1,
    value: 166,
  },
  {
    hour: '3p',
    index: 1,
    value: 145,
  },
  {
    hour: '4p',
    index: 1,
    value: 150,
  },
  {
    hour: '5p',
    index: 1,
    value: 160,
  },
  {
    hour: '6p',
    index: 1,
    value: 180,
  },
  {
    hour: '7p',
    index: 1,
    value: 165,
  },
  {
    hour: '8p',
    index: 1,
    value: 130,
  },
  {
    hour: '9p',
    index: 1,
    value: 140,
  },
  {
    hour: '10p',
    index: 1,
    value: 160,
  },
  {
    hour: '11p',
    index: 1,
    value: 180,
  },
]
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
export default (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Style({ width: '100%', maxWidth: '900px', overflowX: 'auto' })],
    days.map((day, index) => {
      const id = `bubble-${index}`
      const size = model.chartSizes[id]
      const activeIndex = Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) => (hover.example === id ? hover.index : null),
      })
      return h.div(
        [
          h.Style({ width: '100%', minWidth: '700px', maxWidth: '900px', height: '60px' }),
          h.OnMount(ObserveChartSize({ id })),
        ],
        [
          ScatterChart(
            {
              width: size?.width ?? 900,
              height: 60,
              responsive: size === undefined,
              margin: { top: 10, right: 0, bottom: 0, left: 0 },
              activeIndex,
              onActiveIndexChange: (pointIndex) =>
                ChartMessage.ChartHovered({ example: id, index: pointIndex }),
              defs: [
                h.text(
                  [
                    h.Attribute('x', '75'),
                    h.Attribute('y', '20'),
                    h.Attribute('text-anchor', 'end'),
                    h.Attribute('fill', '#666'),
                    h.Attribute('font-size', '14'),
                  ],
                  [day],
                ),
              ],
              children: [
                XAxis({ type: 'category', dataKey: 'hour', interval: 0, tick: index === 6 }),
                YAxis({
                  type: 'number',
                  dataKey: 'index',
                  width: 80,
                  tick: false,
                  axisLine: false,
                  domain: [0, 2],
                }),
                ZAxis({ dataKey: 'value', range: [16, 225] }),
                Tooltip({
                  labelFormatter: (hour) => String(hour),
                  formatter: (value) => String(value),
                }),
                Scatter({
                  dataKey: 'value',
                  data: index % 2 === 0 ? data01 : data02,
                  name: 'value',
                  fill: '#8884d8',
                }),
              ],
              title: day,
            },
            h,
          ),
        ],
      )
    }),
  )
