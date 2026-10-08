/** Foldkit adaptation of Simple Radial Bar Chart (Recharts SimpleRadialBarChart). */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import { Message } from '../../../message'
import {
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
} from '../../../generated/registry/ui/radial-bar-chart'
import { simpleRadialBarData } from '../shared'

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  RadialBarChart(
    {
      data: simpleRadialBarData,
      cx: '30%',
      barSize: 14,
      responsive: true,
      title: 'Simple Radial Bar Chart',
      children: [
        RadialBar({ dataKey: 'uv', label: { position: 'insideStart' }, background: true }),
        Legend(),
        Tooltip(),
      ],
    },
    h,
  )
