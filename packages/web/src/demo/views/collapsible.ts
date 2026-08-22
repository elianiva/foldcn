import type { Html, HtmlBuilder } from 'foldkit/html'

import { disclosure } from '@foldcn/registry/styles/default/ui/collapsible'

import { ToggledCollapsible, type Message } from '../message'
import type { Model } from '../model'

export const collapsibleView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-4')],
    [
      disclosure<Message>(
        {
          id: 'collapsible-demo',
          isOpen: model.isCollapsibleOpen,
          onToggle: (isOpen) => ToggledCollapsible({ isOpen }),
          title: 'Can I collapse this?',
          content:
            'A single collapsible section — in foldcn this is exactly the Disclosure primitive, shared with the `disclosure` component.',
        },
        h,
      ),
    ],
  )
