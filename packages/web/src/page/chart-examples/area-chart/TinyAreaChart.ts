/** Foldkit adaptation of Tiny Area Chart (Recharts TinyAreaChart). */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import { Message } from '../../../message'
import { AreaChart, Area } from '../../../generated/registry/ui/area-chart'
import { tinyAreaData } from '../shared'

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  AreaChart(
    {
      data: tinyAreaData,
      width: 200,
      height: 50,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      title: 'Tiny Area Chart',
      children: [Area({ dataKey: 'y', type: 'monotone', stroke: '#8884d8', fill: '#8884d8' })],
    },
    h,
  )
