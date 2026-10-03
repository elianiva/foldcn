/** Crossfade, staggered, and pop transitions between the source scatter datasets. */
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
import { generateMockData } from '../shared'
import { animationControls } from '../animation-controls'

const dataA = generateMockData(10, 42)

const dataB = generateMockData(10, 99)

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const id = 'scatter-chart/CustomAnimation'
  const datasetB = model.chartDatasetB.has(id)
  const mode = model.chartAnimationModes[id] ?? 'crossfade'
  const animationKind =
    mode === 'staggered'
      ? 'scatter-staggered'
      : mode === 'pop'
        ? 'scatter-pop'
        : 'scatter-crossfade'
  const animationKey = `${id}-${model.chartReplayCounts[id] ?? 0}`
  return h.div(
    [h.Class('space-y-3')],
    [
      animationControls(model, h, {
        id,
        duration: 1500,
        defaultMode: 'crossfade',
        modes: [
          { value: 'crossfade', label: 'Crossfade' },
          { value: 'staggered', label: 'Staggered crossfade' },
          { value: 'pop', label: 'Pop crossfade (scale + fade)' },
        ],
      }),
      ScatterChart(
        {
          responsive: true,
          width: 600,
          margin: { top: 20, right: 30, left: 20, bottom: 5 },
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'x', type: 'number' }),
            YAxis({ dataKey: 'y', type: 'number' }),
            ZAxis({ dataKey: 'z', range: [1, 1000] }),
            Tooltip(),
            Scatter({
              dataKey: 'x',
              data: dataA,
              name: 'Data',
              fillOpacity: datasetB ? 0 : 0.85,
              animationKind,
              animationDuration: model.chartAnimationDurations[id] ?? 1500,
              animationKey,
            }),
            Scatter({
              dataKey: 'x',
              data: dataB,
              name: 'Data',
              fillOpacity: datasetB ? 0.85 : 0,
              animationKind,
              animationDuration: model.chartAnimationDurations[id] ?? 1500,
              animationKey,
            }),
          ],
          title: 'Custom Animation Scatter',
        },
        h,
      ),
    ],
  )
}
