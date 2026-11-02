/** Opacity entrance and update interpolation using the two Recharts source datasets. */
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

const data1 = generateMockData(7, 100)

const data2 = generateMockData(7, 200)

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const id = 'line/LineChartCustomShapeExample'
  const chartData = model.chartDatasetB.has(id) ? data2 : data1
  const duration = model.chartAnimationDurations[id] ?? 500
  return h.div(
    [h.Class('space-y-3')],
    [
      h.div(
        [h.Class('flex flex-wrap items-center gap-2')],
        [
          h.label(
            [h.Class('text-sm')],
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
          h.button(
            [
              h.Class('rounded border px-3 py-1'),
              h.OnClick(ChartMessage.ChartAnimationReplayed({ id })),
            ],
            ['Force remount (Triggers entrance animation)'],
          ),
          h.button(
            [
              h.Class('rounded border px-3 py-1'),
              h.OnClick(ChartMessage.ChartDatasetSwapped({ id })),
            ],
            ['⇄ Swap dataset (Triggers update animation)'],
          ),
        ],
      ),
      LineChart(
        {
          data: chartData,
          responsive: true,
          margin: { top: 10, right: 30, left: 0, bottom: 0 },
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'label' }),
            YAxis({ width: 'auto' }),
            Tooltip(),
            Line({
              dataKey: 'y',
              type: 'monotone',
              strokeWidth: 3,
              animationKind: 'opacity',
              animationDuration: duration,
              animationKey: `${id}-${model.chartReplayCounts[id] ?? 0}`,
            }),
          ],
          title: 'Line that animates opacity',
        },
        h,
      ),
    ],
  )
}
