import type { Html, HtmlBuilder } from 'foldkit/html'

import { accordionItem } from '@foldcn/registry/styles/default/ui/accordion'

import { ToggledAccordion, type Message } from '../message'
import type { Model } from '../model'

const ITEMS = [
  {
    id: 'accordion-accessibility',
    title: 'Is it accessible?',
    content:
      'Yes. It follows WAI-ARIA design patterns and uses the @foldkit/ui Disclosure primitive under the hood.',
  },
  {
    id: 'accordion-animation',
    title: 'Is it animated?',
    content: 'Open and close are instant by default; pass isAnimated to smooth the panel transition.',
  },
  {
    id: 'accordion-controlled',
    title: 'Can I control it?',
    content:
      'Each item is controlled — the parent owns the open state per item and reacts to onToggle.',
  },
] as const

export const accordionView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full flex-col')],
    ITEMS.map((item, index) =>
      accordionItem<Message>(
        {
          id: item.id,
          isOpen: model.accordionOpen[index] ?? false,
          onToggle: (isOpen) => ToggledAccordion({ index, isOpen }),
          title: item.title,
          content: item.content,
        },
        h,
      ),
    ),
  )
