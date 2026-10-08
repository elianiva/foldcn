/** Foldkit adaptation of Simple Radar Chart (Recharts SimpleRadarChart). */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import { Message } from '../../../message'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from '../../../generated/registry/ui/radar-chart'
import { simpleRadarData } from '../shared'

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  RadarChart(
    {
      data: simpleRadarData,
      responsive: true,
      title: 'Simple Radar Chart',
      children: [
        PolarGrid(),
        PolarAngleAxis({ dataKey: 'subject' }),
        PolarRadiusAxis(),
        Radar({ dataKey: 'A', name: 'Mike', fill: '#8884d8' }),
      ],
    },
    h,
  )
