import type { Html, HtmlBuilder } from 'foldkit/html'

import { textarea } from '@foldcn/registry/styles/default/ui/textarea'

import { UpdatedTextareaValue, type Message } from '../message'
import type { Model } from '../model'

export const textareaView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('w-full max-w-sm')],
    [
      textarea<Message>(
        {
          id: 'textarea-bio',
          label: 'Bio',
          value: model.textareaValue,
          onInput: (value) => UpdatedTextareaValue({ value }),
          rows: 4,
          placeholder: 'Tell us about yourself...',
          maybeDescription: 'Appears on your public profile.',
        },
        h,
      ),
    ],
  )
