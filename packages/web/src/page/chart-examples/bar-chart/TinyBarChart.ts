/** Foldkit adaptation of Tiny Bar Chart (Recharts TinyBarChart). */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import { Message } from '../../../message'
import { BarChart, Bar } from '../../../generated/registry/ui/bar-chart'
import { tinyBarData } from '../shared'

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  BarChart(
    {
      data: tinyBarData,
      width: 300,
      height: 100,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      title: 'Tiny Bar Chart',
      children: [Bar({ dataKey: 'uv', fill: '#000' })],
    },
    h,
  )
