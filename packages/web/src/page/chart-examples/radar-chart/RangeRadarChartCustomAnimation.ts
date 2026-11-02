/** Foldkit adaptation of Range Radar Custom Animation from the Recharts source datasets.
 * Dataset swapping is supported; custom animation interpolation is still being ported. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
} from '../../../generated/registry/ui/radar-chart'
import { animationControls } from '../animation-controls'

const dataA = [
  {
    subject: 'Math',
    range: [30, 110],
  },
  {
    subject: 'Art',
    range: [55, 120],
  },
  {
    subject: 'Music',
    range: [40, 95],
  },
  {
    subject: 'Physics',
    range: [65, 135],
  },
  {
    subject: 'History',
    range: [50, 105],
  },
  {
    subject: 'Sports',
    range: [70, 125],
  },
]

const dataB = [
  {
    subject: 'Math',
    range: [20, 80],
  },
  {
    subject: 'Art',
    range: [70, 140],
  },
  {
    subject: 'Music',
    range: [35, 75],
  },
  {
    subject: 'Physics',
    range: [80, 145],
  },
  {
    subject: 'History',
    range: [45, 90],
  },
  {
    subject: 'Sports',
    range: [95, 150],
  },
]

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const id = 'radar-chart/RangeRadarChartCustomAnimation'
  const datasetB = model.chartDatasetB.has(id)
  const chartData = datasetB ? dataB : dataA
  const mode = model.chartAnimationModes[id] ?? 'centerOut'
  const animationKey = `${id}-${model.chartReplayCounts[id] ?? 0}${mode === 'centerOut' ? `-${datasetB}` : ''}`
  return h.div(
    [h.Class('space-y-3')],
    [
      animationControls(model, h, {
        id,
        duration: 1600,
        defaultMode: 'centerOut',
        modes: [
          { value: 'pointToPoint', label: 'Point to point (default)' },
          { value: 'centerOut', label: 'Always from center (custom)' },
        ],
      }),
      RadarChart(
        {
          data: chartData,
          responsive: true,
          width: 560,
          height: 560,
          children: [
            PolarGrid(),
            PolarAngleAxis({ dataKey: 'subject' }),
            PolarRadiusAxis({ domain: [0, 150], ticks: [0, 40, 80, 120, 150] }),
            Tooltip(),
            Legend(),
            Radar({
              dataKey: 'range',
              name: 'Range',
              fillOpacity: 0.35,
              animationKind: mode === 'centerOut' ? 'center-out' : 'point-to-point',
              animationDuration: model.chartAnimationDurations[id] ?? 1600,
              animationKey,
            }),
          ],
          title: 'Range Radar Custom Animation',
        },
        h,
      ),
    ],
  )
}
