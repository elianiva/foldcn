import type { Html, HtmlBuilder } from 'foldkit/html'

import * as HoverCard from '@foldcn/registry/styles/default/ui/hover-card'

import { GotPopoverMessage, type Message } from '../message'
import type { Model } from '../model'

export const hoverCardView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.submodel({
    slotId: model.popover.id,
    model: model.popover,
    view: HoverCard.view,
    viewInputs: HoverCard.styledViewInputs(
      {
        trigger: '@foldcn on GitHub',
        content: [
          HoverCard.header(
            {},
            [
              HoverCard.title({}, ['@foldcn'], h),
              HoverCard.description({}, ['A shadcn-style registry built on @foldkit/ui.'], h),
            ],
            h,
          ),
          h.p([h.Class('text-sm text-muted-foreground')], [
            'Components are copy-paste HTML-builder factories, themed with Tailwind CSS variables.',
          ]),
        ],
      },
      h,
    ),
    toParentMessage: (message) => GotPopoverMessage({ message }),
  })
