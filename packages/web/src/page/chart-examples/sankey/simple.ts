/** Foldkit adaptation of Simple Sankey Diagram. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import { Message } from '../../../message'
import { Sankey } from '../../../generated/registry/ui/sankey'

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  Sankey(
    {
      data: {
        nodes: [{ name: 'Visits' }, { name: 'Signups' }, { name: 'Orders' }],
        links: [
          { source: 0, target: 1, value: 12 },
          { source: 1, target: 2, value: 6 },
        ],
      },
      responsive: true,
      title: 'Simple Sankey Diagram',
    },
    h,
  )
