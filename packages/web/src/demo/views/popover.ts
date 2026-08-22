import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Popover from '@foldcn/registry/styles/default/ui/popover'

import { GotPopoverMessage, type Message } from '../message'
import type { Model } from '../model'

export const popoverView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.submodel({
    slotId: model.popover.id,
    model: model.popover,
    view: Popover.view,
    viewInputs: Popover.styledViewInputs(
      {
        anchor: { placement: 'bottom-start', gap: 4, padding: 8 },
        trigger: 'Open popover',
        content: [
          h.p([h.Class('text-sm font-medium')], ['Dimensions']),
          h.p(
            [h.Class('mt-1 text-sm text-muted-foreground')],
            [
              'Set the dimensions for the layer. Positioned with an anchor, dismissed on outside press.',
            ],
          ),
        ],
      },
      h,
    ),
    toParentMessage: (message) => GotPopoverMessage({ message }),
  })
