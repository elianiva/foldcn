import type { Html, HtmlBuilder } from 'foldkit/html'

import { input } from '@foldcn/registry/styles/default/ui/input'

import { UpdatedInputValue, type Message } from '../message'
import type { Model } from '../model'

export const inputView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-sm flex-col gap-4')],
    [
      input<Message>(
        {
          id: 'input-email',
          label: 'Email',
          type: 'email',
          value: model.inputValue,
          onInput: (value) => UpdatedInputValue({ value }),
          placeholder: 'you@example.com',
          maybeDescription: 'We never share your email.',
        },
        h,
      ),
      input<Message>(
        {
          id: 'input-disabled',
          label: 'Disabled',
          value: 'Read only',
          isDisabled: true,
        },
        h,
      ),
    ],
  )
