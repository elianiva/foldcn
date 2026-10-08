/** Source ranges with the custom top-to-bottom and default left-to-right reveals. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/area-chart'
import { animationControls } from '../animation-controls'

const dataA = [
  {
    name: 'Jan',
    range: [800, 2600],
  },
  {
    name: 'Feb',
    range: [1100, 3300],
  },
  {
    name: 'Mar',
    range: [900, 2800],
  },
  {
    name: 'Apr',
    range: [1400, 3900],
  },
  {
    name: 'May',
    range: [1200, 3500],
  },
  {
    name: 'Jun',
    range: [1600, 5000],
  },
]

const dataB = [
  {
    name: 'Jan',
    range: [400, 1800],
  },
  {
    name: 'Feb',
    range: [1500, 4200],
  },
  {
    name: 'Mar',
    range: [700, 2100],
  },
  {
    name: 'Apr',
    range: [1800, 4700],
  },
  {
    name: 'May',
    range: [1000, 2400],
  },
  {
    name: 'Jun',
    range: [2200, 5000],
  },
]

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const id = 'area-chart/RangeAreaChartCustomAnimation'
  const datasetB = model.chartDatasetB.has(id)
  const chartData = (datasetB ? dataB : dataA).map((row) => ({
    ...row,
    doubleRange: (row.range[1] ?? 0) * 2,
  }))
  const mode = model.chartAnimationModes[id] ?? 'topToBottom'
  const animationKind = mode === 'topToBottom' ? 'reveal-top' : 'reveal-left'
  const animationKey = `${id}-${model.chartReplayCounts[id] ?? 0}-${datasetB}-${mode}`
  return h.div(
    [h.Class('space-y-3')],
    [
      animationControls(model, h, {
        id,
        duration: 1600,
        defaultMode: 'topToBottom',
        modes: [
          { value: 'leftToRight', label: 'Left to right (default)' },
          { value: 'topToBottom', label: 'Top to bottom (custom)' },
        ],
      }),
      AreaChart(
        {
          data: chartData,
          responsive: true,
          margin: { top: 10, right: 16, left: 0, bottom: 0 },
          defs: [
            h.defs(
              [],
              (
                [
                  ['rangeFill', '#8884d8'],
                  ['doubleRangeFill', '#84d888'],
                ] as const
              ).map(([gradientId, color]) =>
                h.linearGradient(
                  [
                    h.Attribute('id', gradientId),
                    h.Attribute('x1', '0'),
                    h.Attribute('y1', '0'),
                    h.Attribute('x2', '0'),
                    h.Attribute('y2', '1'),
                  ],
                  [
                    h.stop([
                      h.Attribute('offset', '5%'),
                      h.Attribute('stop-color', color),
                      h.Attribute('stop-opacity', '0.45'),
                    ]),
                    h.stop([
                      h.Attribute('offset', '95%'),
                      h.Attribute('stop-color', color),
                      h.Attribute('stop-opacity', '0.1'),
                    ]),
                  ],
                ),
              ),
            ),
          ],
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'name' }),
            YAxis({ width: 'auto', domain: [0, 10000], ticks: [0, 2500, 5000, 7500, 10000] }),
            Tooltip(),
            Area({
              dataKey: 'range',
              type: 'linear',
              stroke: '#8884d8',
              strokeWidth: 2,
              fill: 'url(#rangeFill)',
              fillOpacity: 1,
              animationKind,
              animationDuration: model.chartAnimationDurations[id] ?? 1600,
              animationKey: `${animationKey}-range`,
            }),
            Area({
              dataKey: 'doubleRange',
              type: 'linear',
              stroke: '#84d888',
              strokeWidth: 2,
              fill: 'url(#doubleRangeFill)',
              fillOpacity: 1,
              baseValue: 'dataMax',
              animationKind,
              animationDuration: model.chartAnimationDurations[id] ?? 1600,
              animationKey: `${animationKey}-double`,
            }),
          ],
          title: 'Range Area Custom Animation',
        },
        h,
      ),
    ],
  )
}
