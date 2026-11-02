/** Six-row circular window from Recharts' seeded 30-row time series. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Message as ChartMessage } from '../../../message'
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/line-chart'
import { generateMockData } from '../shared'

const allData = generateMockData(30, 90).map((row, i) => ({ ...row, i }))

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const id = 'line/AnimatedTimeSeriesExample'
  const start = model.chartWindowStarts[id] ?? 0
  const duration = model.chartAnimationDurations[id] ?? 800
  const match = model.chartAnimationModes[`${id}:match`] ?? 'dataKey'
  const data = Array.from({ length: 6 }, (_, index) => allData[(start + index) % 30]!)
  return h.div(
    [h.Class('space-y-3')],
    [
      h.div(
        [h.Class('flex flex-wrap items-center gap-2 text-sm')],
        [
          h.button(
            [
              h.Class('rounded border px-3 py-1'),
              h.OnClick(ChartMessage.ChartWindowStreamToggled({ id })),
            ],
            [model.chartStreaming.has(id) ? 'Stop streaming' : 'Start streaming'],
          ),
          h.label(
            [],
            [
              'animationDuration ',
              h.input([
                h.Type('number'),
                h.Min('0'),
                h.Value(String(duration)),
                h.OnInput((value) => ChartMessage.ChartAnimationDurationChanged({ id, value })),
                h.Class('w-24 rounded border px-2 py-1'),
              ]),
            ],
          ),
          h.label(
            [],
            [
              'animationMatchBy ',
              h.select(
                [
                  h.Value(match),
                  h.OnChange((value) =>
                    ChartMessage.ChartAnimationModeChanged({ id: `${id}:match`, value }),
                  ),
                  h.Class('rounded border px-2 py-1'),
                ],
                [
                  h.option([h.Value('index')], ['matchByIndex (default)']),
                  h.option([h.Value('dataKey')], ["matchByDataKey('label')"]),
                ],
              ),
            ],
          ),
        ],
      ),
      LineChart(
        {
          data,
          responsive: true,
          width: 600,
          height: 371,
          margin: { top: 20, right: 30, left: 20, bottom: 5 },
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'label', allowDataOverflow: true }),
            YAxis(),
            Tooltip(),
            Line({
              dataKey: 'y',
              strokeWidth: 2,
              animationDuration: duration,
              animationKind: match === 'dataKey' ? 'swipe-left' : undefined,
              animationKey: match === 'dataKey' ? `${id}-${start}` : id,
            }),
          ],
          title: 'Animated Time Series',
        },
        h,
      ),
    ],
  )
}
