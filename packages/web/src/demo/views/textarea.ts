import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { textarea, textareaClass } from '../../generated/registry/ui/textarea'
import { field, fieldDescription, fieldLabel } from '../../generated/registry/ui/fieldset'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  UpdatedTextareaValue: { value: S.String },
})

export const textareaView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.div(
            [h.Class('w-full max-w-sm')],
            [h.textarea([h.Placeholder('Type your message here.'), h.Class(textareaClass)])],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Invalid']),
          h.div(
            [h.Class('w-full max-w-sm')],
            [
              h.textarea([
                h.Placeholder('Type your message here.'),
                h.AriaInvalid(true),
                h.Class(textareaClass),
              ]),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Label']),
          h.div(
            [h.Class('w-full max-w-sm')],
            [
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'textarea-demo-message' }, ['Message'], h),
                  h.textarea([
                    h.Id('textarea-demo-message'),
                    h.Placeholder('Type your message here.'),
                    h.Rows(6),
                    h.Class(textareaClass),
                  ]),
                ],
                h,
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Description']),
          h.div(
            [h.Class('w-full max-w-sm')],
            [
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'textarea-demo-message-2' }, ['Message'], h),
                  h.textarea([
                    h.Id('textarea-demo-message-2'),
                    h.Placeholder('Type your message here.'),
                    h.Rows(6),
                    h.Class(textareaClass),
                  ]),
                  fieldDescription<AppMessage>(
                    {},
                    ['Type your message and press enter to send.'],
                    h,
                  ),
                ],
                h,
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Disabled']),
          h.div(
            [h.Class('w-full max-w-sm')],
            [
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'textarea-demo-disabled' }, ['Message'], h),
                  h.textarea([
                    h.Id('textarea-demo-disabled'),
                    h.Placeholder('Type your message here.'),
                    h.Disabled(true),
                    h.Class(textareaClass),
                  ]),
                ],
                h,
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Controlled']),
          h.div(
            [h.Class('w-full max-w-sm')],
            [
              textarea<AppMessage>(
                {
                  id: 'textarea-demo',
                  label: 'Message',
                  value: model.textareaValue,
                  onInput: (value) => Message.UpdatedTextareaValue({ value }),
                  placeholder: 'Type your message here.',
                },
                h,
              ),
            ],
          ),
        ],
      ),
    ],
  )

const fields = { textareaValue: S.String }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { textareaValue: '' },
  messages: [Message.UpdatedTextareaValue],
  handlers: (model: State) => ({
    UpdatedTextareaValue: ({ value }: typeof Message.UpdatedTextareaValue.Type): UpdateReturn => ({
      model: evo(model, { textareaValue: () => value }),
    }),
  }),
  samples: [Message.UpdatedTextareaValue({ value: 'Hello, world!' })],
})
