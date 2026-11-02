/** Foldkit adaptation of Tiny Line Chart (Recharts TinyLineChart). */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import { Message } from '../../../message'
import { LineChart, Line } from '../../../generated/registry/ui/line-chart'
import { tinyLineData } from '../shared'

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  LineChart(
    {
      data: tinyLineData,
      width: 100,
      height: 50,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      title: 'Tiny Line Chart',
      children: [Line({ dataKey: 'x', stroke: '#8884d8', dot: false })],
    },
    h,
  )
