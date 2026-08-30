import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as resizable from '../../generated/registry/ui/resizable'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotResizableMessage: { message: resizable.Message },
  GotResizableVerticalMessage: { message: resizable.Message },
})

export const resizableView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Horizontal']),
          h.div(
            [h.Class('rounded-lg border')],
            [
              h.submodel({
                slotId: model.resizable.id,
                model: model.resizable,
                view: resizable.view,
                viewInputs: {
                  firstPane: {
                    content: h.div(
                      [h.Class('flex h-[200px] items-center justify-center p-6')],
                      [h.span([h.Class('font-semibold')], ['Sidebar'])],
                    ),
                  },
                  secondPane: {
                    content: h.div(
                      [h.Class('flex h-[200px] items-center justify-center p-6')],
                      [h.span([h.Class('font-semibold')], ['Content'])],
                    ),
                  },
                },
                toParentMessage: (message) => Message.GotResizableMessage({ message }),
              }),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Vertical']),
          h.div(
            [h.Class('rounded-lg border')],
            [
              h.submodel({
                slotId: model.resizableVertical.id,
                model: model.resizableVertical,
                view: resizable.view,
                viewInputs: {
                  direction: 'vertical',
                  firstPane: {
                    content: h.div(
                      [h.Class('flex h-[100px] items-center justify-center p-6')],
                      [h.span([h.Class('font-semibold')], ['Header'])],
                    ),
                  },
                  secondPane: {
                    content: h.div(
                      [h.Class('flex h-[100px] items-center justify-center p-6')],
                      [h.span([h.Class('font-semibold')], ['Content'])],
                    ),
                  },
                },
                toParentMessage: (message) => Message.GotResizableVerticalMessage({ message }),
              }),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Handle']),
          h.div(
            [h.Class('rounded-lg border p-6 text-center text-sm text-muted-foreground')],
            [
              'With Handle variant uses same split with a visible drag handle (controlled via range input).',
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Nested']),
          h.div(
            [h.Class('rounded-lg border p-6 text-center text-sm text-muted-foreground')],
            [
              'Nested: outer horizontal (One | Two+Three) with inner vertical (Two | Three). Foldcn supports fixed two panes.',
            ],
          ),
        ],
      ),
    ],
  )

const foldNoOp =
  <Out>(): ((out: Out) => Update.Step<State, unknown>) =>
  () =>
  (model) => ({ model })

const foldResizableOutMessage = M.type<resizable.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    ChangedValue: foldNoOp(),
  }),
)

const foldResizable = Update.foldChild({
  update: resizable.update,
  read: (model: State) => Option.some(model.resizable),
  write: (model, next) => evo(model, { resizable: () => next }),
  toParentMessage: (message) => Message.GotResizableMessage({ message }),
  foldOutMessage: foldResizableOutMessage,
})

const foldResizableVertical = Update.foldChild({
  update: resizable.update,
  read: (model: State) => Option.some(model.resizableVertical),
  write: (model, next) => evo(model, { resizableVertical: () => next }),
  toParentMessage: (message) => Message.GotResizableVerticalMessage({ message }),
  foldOutMessage: foldResizableOutMessage,
})

const fields = { resizable: resizable.Model, resizableVertical: resizable.Model }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    resizable: resizable.init({ id: 'resizable-demo', initialValue: 50 }),
    resizableVertical: resizable.init({ id: 'resizable-vertical', initialValue: 25 }),
  },
  messages: [Message.GotResizableMessage, Message.GotResizableVerticalMessage],
  handlers: (model: State) => ({
    GotResizableMessage: (payload: typeof Message.GotResizableMessage.Type): UpdateReturn =>
      foldResizable(model, payload.message),
    GotResizableVerticalMessage: (
      payload: typeof Message.GotResizableVerticalMessage.Type,
    ): UpdateReturn => foldResizableVertical(model, payload.message),
  }),
  samples: [Message.GotResizableMessage({ message: resizable.Message.Resized({ value: 70 }) })],
})
