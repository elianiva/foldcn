import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Tooltip from '@foldcn/registry/styles/default/ui/tooltip'

import { GotTooltipMessage, type Message } from '../message'
import type { Model } from '../model'

export const tooltipView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.submodel({
    slotId: model.tooltip.id,
    model: model.tooltip,
    view: Tooltip.view,
    viewInputs: Tooltip.styledViewInputs(
      {
        anchor: { placement: 'top', gap: 8, padding: 8 },
        trigger: 'Hover me',
        content: 'Tooltip content',
      },
      h,
    ),
    toParentMessage: (message) => GotTooltipMessage({ message }),
  })
