import type { Html, HtmlBuilder } from 'foldkit/html'

import { disclosure } from '@foldcn/registry/styles/default/ui/disclosure'

import { ToggledDisclosureAnimated, ToggledDisclosureBasic, type Message } from '../message'
import type { Model } from '../model'

export const disclosureView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-4')],
    [
      disclosure<Message>(
        {
          id: 'disclosure-basic',
          isOpen: model.isDisclosureBasicOpen,
          onToggle: (isOpen) => ToggledDisclosureBasic({ isOpen }),
          title: 'What is foldcn?',
          content:
            'A shadcn-style registry of copy-paste styled components built on @foldkit/ui, themed with Tailwind CSS variables.',
        },
        h,
      ),
      disclosure<Message>(
        {
          id: 'disclosure-animated',
          isOpen: model.isDisclosureAnimatedOpen,
          onToggle: (isOpen) => ToggledDisclosureAnimated({ isOpen }),
          title: 'Does it animate?',
          content:
            'Yes — pass isAnimated to smooth the panel open/close with a CSS transition instead of an instant toggle.',
          isAnimated: true,
        },
        h,
      ),
    ],
  )
