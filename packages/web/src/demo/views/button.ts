import type { Html, HtmlBuilder } from 'foldkit/html'

import { button, buttonSizeKeys, buttonVariantKeys } from '@foldcn/registry/styles/default/ui/button'

import { ClickedButtonDemo, type Message } from '../message'
import type { Model } from '../model'

export const buttonView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col items-start gap-6')],
    [
      h.div(
        [h.Class('flex flex-wrap items-center gap-3')],
        buttonVariantKeys.map((variant) =>
          button<Message>(
            { variant, onClick: ClickedButtonDemo(), className: 'capitalize' },
            variant,
            h,
          ),
        ),
      ),
      h.div(
        [h.Class('flex flex-wrap items-center gap-3')],
        buttonSizeKeys.map((size) => button<Message>({ size, onClick: ClickedButtonDemo() }, size, h)),
      ),
      h.p(
        [h.Class('text-sm text-muted-foreground')],
        [`Clicked ${model.buttonClickCount} time${model.buttonClickCount === 1 ? '' : 's'}.`],
      ),
    ],
  )
