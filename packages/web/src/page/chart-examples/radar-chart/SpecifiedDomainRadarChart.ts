/** Foldkit adaptation of Specified Domain Radar Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/RadarChart/SpecifiedDomainRadarChart.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from '../../../generated/registry/ui/radar-chart'

const data = [
  {
    subject: 'Math',
    A: 120,
    B: 110,
  },
  {
    subject: 'Chinese',
    A: 98,
    B: 130,
  },
  {
    subject: 'English',
    A: 86,
    B: 130,
  },
  {
    subject: 'Geography',
    A: 99,
    B: 100,
  },
  {
    subject: 'Physics',
    A: 85,
    B: 90,
  },
  {
    subject: 'History',
    A: 65,
    B: 85,
  },
]

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  RadarChart(
    {
      data: data,
      responsive: true,
      outerRadius: '80%',
      children: [
        PolarGrid(),
        PolarAngleAxis({ dataKey: 'subject' }),
        PolarRadiusAxis({ domain: [0, 150], angle: 30, ticks: [0, 40, 80, 120, 150] }),
        Radar({ dataKey: 'A', name: 'Mike', fillOpacity: 0.6 }),
        Radar({ dataKey: 'B', name: 'Lily', fillOpacity: 0.6 }),
        Legend(),
      ],
      title: 'Specified Domain Radar Chart',
    },
    h,
  )
