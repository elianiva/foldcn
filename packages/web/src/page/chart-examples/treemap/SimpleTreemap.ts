/** Foldkit adaptation of Simple Treemap (Recharts SimpleTreemap). */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import { Message } from '../../../message'
import { Treemap } from '../../../generated/registry/ui/treemap'
import { simpleTreemapData } from './data'

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  Treemap(
    {
      data: simpleTreemapData,
      dataKey: 'size',
      width: 500,
      height: 375,
      aspectRatio: 4 / 3,
      responsive: true,
      title: 'Simple Treemap',
    },
    h,
  )
