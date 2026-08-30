import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { checkbox } from '../../generated/registry/ui/checkbox'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  ToggledLabelCheckbox: { isChecked: S.Boolean },
})

export const labelView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex gap-2')],
    [
      checkbox<AppMessage>(
        {
          id: 'terms',
          label: 'Accept terms and conditions',
          isChecked: model.isLabelChecked,
          onToggle: (isChecked) => Message.ToggledLabelCheckbox({ isChecked }),
        },
        h,
      ),
    ],
  )

const fields = { isLabelChecked: S.Boolean }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { isLabelChecked: false },
  messages: [Message.ToggledLabelCheckbox],
  handlers: (model: State) => ({
    ToggledLabelCheckbox: ({
      isChecked,
    }: typeof Message.ToggledLabelCheckbox.Type): UpdateReturn => ({
      model: evo(model, { isLabelChecked: () => isChecked }),
    }),
  }),
  samples: [Message.ToggledLabelCheckbox({ isChecked: true })],
})
