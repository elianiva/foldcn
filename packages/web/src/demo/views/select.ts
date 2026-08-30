import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { Listbox as FoldkitListbox } from '@foldkit/ui'
import { Update } from 'foldkit'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as select from '../../generated/registry/ui/select'
import { LanguageSelect } from '../bundles'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotSelectMessage: { message: select.Message },
})

type FruitItem = { value: string; label: string }

const FRUITS: ReadonlyArray<FruitItem> = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'grapes', label: 'Grapes' },
  { value: 'pineapple', label: 'Pineapple' },
]

export const selectView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('w-full max-w-48')],
    [
      h.submodel({
        slotId: model.select.id,
        model: model.select,
        view: LanguageSelect.view,
        viewInputs: select.styledViewInputs<AppMessage, FruitItem, string>(
          {
            options: FRUITS,
            maybeSelectedValue: model.maybeSelectValue,
            itemToValue: (item) => item.value,
            itemToLabel: (item) => item.label,
            label: 'Fruits',
            placeholder: 'Select a fruit',
            triggerClass: 'w-full max-w-48',
          },
          h,
        ),
        toParentMessage: (message) => Message.GotSelectMessage({ message }),
      }),
    ],
  )

const foldSelectOutMessage = M.type<FoldkitListbox.OutMessage<string>>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => ({ model: evo(model, { maybeSelectValue: () => Option.some(value) }) }),
  }),
)

const foldSelect = Update.foldChild({
  update: LanguageSelect.update,
  read: (model: State) => Option.some(model.select),
  write: (model, next) => evo(model, { select: () => next }),
  toParentMessage: (message) => Message.GotSelectMessage({ message }),
  foldOutMessage: foldSelectOutMessage,
})

const fields = {
  select: select.Model,
  maybeSelectValue: S.Option(S.String),
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    select: select.init({ id: 'select-demo' }),
    maybeSelectValue: Option.none(),
  },
  messages: [Message.GotSelectMessage],
  handlers: (model: State) => ({
    GotSelectMessage: (payload: typeof Message.GotSelectMessage.Type): UpdateReturn =>
      foldSelect(model, payload.message),
  }),
  samples: [
    Message.GotSelectMessage({
      message: FoldkitListbox.Message.Opened({ maybeActiveItemIndex: Option.none() }),
    }),
  ],
})
