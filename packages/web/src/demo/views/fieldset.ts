import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { Listbox as FoldkitListbox } from '@foldkit/ui'
import { Update } from 'foldkit'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { fieldset } from '../../generated/registry/ui/fieldset'
import { input } from '../../generated/registry/ui/input'
import * as select from '../../generated/registry/ui/select'
import { LanguageSelect } from '../bundles'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  UpdatedInputValue: { value: S.String },
  GotSelectMessage: { message: select.Message },
})

const LANGUAGE_OPTIONS = [
  ['en', 'English'],
  ['id', 'Bahasa Indonesia'],
  ['ja', '日本語'],
] as const

export const fieldsetView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          fieldset<AppMessage>(
            {
              id: 'fieldset-contact',
              legend: 'Contact details',
              description: 'Used for shipping and billing.',
              children: [
                input<AppMessage>(
                  {
                    id: 'fieldset-name',
                    label: 'Name',
                    value: model.inputValue,
                    onInput: (value) => Message.UpdatedInputValue({ value }),
                    placeholder: 'Ada Lovelace',
                  },
                  h,
                ),
                h.div(
                  [h.Class(select.selectWrapperClass)],
                  [
                    select.selectLabel('Country', h),
                    h.submodel({
                      slotId: model.select.id,
                      model: model.select,
                      view: LanguageSelect.view,
                      viewInputs: select.styledViewInputs<
                        AppMessage,
                        { value: string; label: string },
                        string
                      >(
                        {
                          options: LANGUAGE_OPTIONS.map(([value, label]) => ({ value, label })),
                          maybeSelectedValue: model.maybeSelectValue,
                          itemToValue: (item) => item.value,
                          itemToLabel: (item) => item.label,
                          label: 'Country',
                        },
                        h,
                      ),
                      toParentMessage: (message) => Message.GotSelectMessage({ message }),
                    }),
                  ],
                ),
              ],
            },
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div(
            [h.Class('px-1 text-xs font-medium text-muted-foreground')],
            ['With Multiple Fields'],
          ),
          fieldset<AppMessage>(
            {
              id: 'fieldset-profile',
              legend: 'Profile',
              description: 'Update your profile information.',
              children: [
                input<AppMessage>(
                  {
                    id: 'fieldset-email',
                    label: 'Email',
                    value: '',
                    onInput: (value) => Message.UpdatedInputValue({ value }),
                    placeholder: 'name@example.com',
                  },
                  h,
                ),
                input<AppMessage>(
                  {
                    id: 'fieldset-username',
                    label: 'Username',
                    value: '',
                    onInput: (value) => Message.UpdatedInputValue({ value }),
                    placeholder: 'johndoe',
                  },
                  h,
                ),
              ],
            },
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Disabled']),
          fieldset<AppMessage>(
            {
              id: 'fieldset-disabled',
              legend: 'Disabled Fieldset',
              description: 'All fields inside are disabled.',
              isDisabled: true,
              children: [
                input<AppMessage>(
                  {
                    id: 'fieldset-disabled-name',
                    label: 'Name',
                    value: '',
                    placeholder: 'Disabled',
                    isDisabled: true,
                  },
                  h,
                ),
              ],
            },
            h,
          ),
        ],
      ),
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
  inputValue: S.String,
  select: select.Model,
  maybeSelectValue: S.Option(S.String),
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    inputValue: '',
    select: select.init({ id: 'select-language' }),
    maybeSelectValue: Option.some('en'),
  },
  messages: [Message.GotSelectMessage, Message.UpdatedInputValue],
  handlers: (model: State) => ({
    UpdatedInputValue: ({ value }: typeof Message.UpdatedInputValue.Type): UpdateReturn => ({
      model: evo(model, { inputValue: () => value }),
    }),
    GotSelectMessage: (payload: typeof Message.GotSelectMessage.Type): UpdateReturn =>
      foldSelect(model, payload.message),
  }),
  samples: [Message.UpdatedInputValue({ value: 'Ada Lovelace' })],
})
