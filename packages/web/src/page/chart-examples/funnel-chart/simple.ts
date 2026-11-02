/** Foldkit adaptation of Simple Funnel Chart. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import { Message } from '../../../message'
import { FunnelChart, Funnel } from '../../../generated/registry/ui/funnel-chart'

const data = [
  { value: 100, name: 'Impression', fill: '#8884d8' },
  { value: 80, name: 'Click', fill: '#83a6ed' },
  { value: 50, name: 'Visit', fill: '#8dd1e1' },
  { value: 40, name: 'Consult', fill: '#82ca9d' },
  { value: 26, name: 'Order', fill: '#a4de6c' },
]

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  FunnelChart(
    {
      responsive: true,
      title: 'Simple Funnel Chart',
      children: [Funnel({ data, dataKey: 'value', nameKey: 'name', label: true })],
    },
    h,
  )
