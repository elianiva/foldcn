import type { Html, HtmlBuilder } from 'foldkit/html'

import { resizable } from '@foldcn/registry/styles/default/ui/resizable'

import { ResizedSplit, type Message } from '../message'
import type { Model } from '../model'

export const resizableView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('h-48 w-full rounded-md border')],
    [
      resizable<Message>(
        {
          value: model.resizablePercent,
          onValueChange: (percent) => ResizedSplit({ percent }),
          firstPane: {
            content: h.div(
              [h.Class('flex h-full items-center justify-center p-4 text-sm text-muted-foreground')],
              ['Sidebar'],
            ),
            className: 'bg-muted/30',
          },
          secondPane: {
            content: h.div(
              [h.Class('flex h-full items-center justify-center p-4 text-sm')],
              ['Content'],
            ),
            className: 'bg-muted/30',
          },
        },
        h,
      ),
    ],
  )
