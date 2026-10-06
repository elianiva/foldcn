/** Foldkit adaptation of Simple Sankey Diagram. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import { Message } from '../../../message'
import { Sankey } from '../../../generated/registry/ui/sankey'

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  Sankey(
    {
      data: {
        nodes: [
          { name: 'Visits' },
          { name: 'Signups' },
          { name: 'Bounced' },
          { name: 'Orders' },
          { name: 'Abandoned' },
        ],
        links: [
          { source: 0, target: 1, value: 7 },
          { source: 0, target: 2, value: 5 },
          { source: 1, target: 3, value: 4 },
          { source: 1, target: 4, value: 3 },
        ],
      },
      responsive: true,
      title: 'Simple Sankey Diagram',
    },
    h,
  )
