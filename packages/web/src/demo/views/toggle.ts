import type { Html, HtmlBuilder } from 'foldkit/html'

import { toggle } from '@foldcn/registry/styles/default/ui/toggle'
import { icon } from '@foldcn/registry/styles/default/lib/icons'
import { Bold } from 'lucide'

import { ToggledToggle, type Message } from '../message'
import type { Model } from '../model'

export const toggleView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-sm flex-col gap-4')],
    [
      toggle<Message>(
        {
          isPressed: model.isToggleOn,
          onToggle: (isPressed) => ToggledToggle({ isPressed }),
          ariaLabel: 'Toggle bold',
        },
        h.span([], [icon(h, Bold), 'Bold']),
        h,
      ),
      toggle<Message>({ isPressed: false, ariaLabel: 'Toggle italic' }, 'Italic', h),
      toggle<Message>({ variant: 'outline', isPressed: true, ariaLabel: 'Toggle underline' }, 'On', h),
    ],
  )
