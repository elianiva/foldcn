// Recharts shape and activeShape names are part of the compatible API and example source.
/* oxlint-disable anti-slop/no-shape-in-symbol-names */
/** Source datasets and controllable reveal modes for the custom Area example. */
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
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
]

const dataB = [
  {
    name: 'Page A',
    uv: 1800,
    pv: 2500,
    amt: 2100,
  },
  {
    name: 'Page B',
    uv: 4600,
    pv: 1900,
    amt: 2400,
  },
  {
    name: 'Page C',
    uv: 3200,
    pv: 7000,
    amt: 2600,
  },
  {
    name: 'Page D',
    uv: 1100,
    pv: 3400,
    amt: 2300,
  },
  {
    name: 'Page E',
    pv: 5200,
    amt: 2000,
  },
  {
    name: 'Page F',
    uv: 2900,
    pv: 2700,
    amt: 2400,
  },
  {
    name: 'Page G',
    uv: 4100,
    pv: 3900,
    amt: 2200,
  },
]

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const id = 'area-chart/AreaChartCustomAnimation'
  const datasetB = model.chartDatasetB.has(id)
  const chartData = datasetB ? dataB : dataA
  const interpolation = !model.chartAnimationDisabled.has(`${id}:interpolation`)
  const customShape = !model.chartAnimationDisabled.has(`${id}:shape`)
  const animationKey = `${id}-${model.chartReplayCounts[id] ?? 0}-${datasetB}-${interpolation}-${customShape}`
  return h.div(
    [h.Class('space-y-3')],
    [
      animationControls(model, h, {
        id,
        duration: 900,
        toggles: [
          { key: 'interpolation', label: 'animationInterpolateFn' },
          { key: 'shape', label: 'shape={GrowFromBottomShape}' },
        ],
      }),
      AreaChart(
        {
          data: chartData,
          responsive: true,
          margin: { top: 10, right: 0, left: 0, bottom: 0 },
          defs: [
            h.defs(
              [],
              [
                h.linearGradient(
                  [
                    h.Attribute('id', 'colorUv'),
                    h.Attribute('x1', '0'),
                    h.Attribute('y1', '0'),
                    h.Attribute('x2', '0'),
                    h.Attribute('y2', '1'),
                  ],
                  [
                    h.stop([
                      h.Attribute('offset', '5%'),
                      h.Attribute('stop-color', '#8884d8'),
                      h.Attribute('stop-opacity', '0.8'),
                    ]),
                    h.stop([
                      h.Attribute('offset', '95%'),
                      h.Attribute('stop-color', '#8884d8'),
                      h.Attribute('stop-opacity', '0'),
                    ]),
                  ],
                ),
              ],
            ),
          ],
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'name' }),
            YAxis({ width: 'auto' }),
            Tooltip(),
            Area({
              dataKey: 'uv',
              type: 'monotone',
              stroke: '#8884d8',
              fill: 'url(#colorUv)',
              fillOpacity: 1,
              animationKind: interpolation && customShape ? 'grow-from-bottom' : 'reveal-left',
              animationDuration: model.chartAnimationDurations[id] ?? 900,
              animationKey,
            }),
          ],
          title: 'Custom Animation Example',
        },
        h,
      ),
    ],
  )
}
