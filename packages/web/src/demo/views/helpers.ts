import type { Html, HtmlBuilder } from 'foldkit/html'

import { button, buttonSizeKeys, buttonVariantKeys } from '@foldcn/registry/src/ui/button'
import { Card } from '@foldcn/registry/src/ui/card'
import { disclosure } from '@foldcn/registry/src/ui/disclosure'
import { nav } from '@foldcn/registry/src/ui/nav'

import {
  ClickedButtonDemo,
  ToggledDisclosureAnimated,
  ToggledDisclosureBasic,
  SelectedNav,
  type Message,
} from '../message'
import type { Model } from '../model'

export const buttonView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col items-start gap-6')],
    [
      h.div(
        [h.Class('flex flex-wrap items-center gap-3')],
        [
          ...buttonVariantKeys.map((variant) =>
            button<Message>(
              { variant, onClick: ClickedButtonDemo(), className: 'capitalize' },
              variant,
              h,
            ),
          ),
        ],
      ),
      h.div(
        [h.Class('flex flex-wrap items-center gap-3')],
        [
          ...buttonSizeKeys.map((size) =>
            button<Message>({ size, onClick: ClickedButtonDemo() }, size, h),
          ),
        ],
      ),
      h.p(
        [h.Class('text-sm text-muted-foreground')],
        [`Clicked ${model.buttonClickCount} time${model.buttonClickCount === 1 ? '' : 's'}.`],
      ),
    ],
  )

export const cardView = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card<Message>(
    {},
    [
      Card.header<Message>({}, [
        Card.title<Message>({}, ['Card title'], h),
        Card.description<Message>(
          {},
          [
            'Cards group related content. Wrap a header, body and footer — or just a body.',
          ],
          h,
        ),
      ], h),
      Card.content<Message>({}, [
        h.p(
          [h.Class('text-sm text-muted-foreground')],
          ['You can add as much content as you like here, in any layout.'],
        ),
      ], h),
      Card.footer<Message>({}, [button<Message>({ size: 'sm' }, 'Action', h)], h),
    ],
    h,
  )

const NAV_ITEMS = ['Overview', 'Components', 'Settings', 'Docs'] as const

export const navView = (model: Model, h: HtmlBuilder<Message>): Html =>
  nav<Message, (typeof NAV_ITEMS)[number]>(
    {
      items: NAV_ITEMS,
      ariaLabel: 'Primary',
      toHref: () => '#',
      isItemCurrent: (value) => value === model.activeNav,
      onItemClick: (value) => SelectedNav({ value }),
      toLabel: (value) => value,
    },
    h,
  )

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
