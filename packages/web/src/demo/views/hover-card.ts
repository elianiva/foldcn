import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { modifyFields } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as HoverCard from '../../generated/registry/ui/hover-card'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotHoverCardMessage: { message: HoverCard.Message },
  GotDelayedHoverCardMessage: { message: HoverCard.Message },
})

export const hoverCardView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.submodel({
            slotId: model.hoverCard.popover.id,
            model: model.hoverCard,
            view: HoverCard.view,
            viewInputs: HoverCard.styledViewInputs(
              {
                trigger: 'Hover Here',
                content: [
                  h.div(
                    [h.Class('flex flex-col gap-0.5')],
                    [
                      h.div([h.Class('font-semibold')], ['@nextjs']),
                      h.div(
                        [h.Class('text-sm')],
                        ['The React Framework – created and maintained by @vercel.'],
                      ),
                      h.div(
                        [h.Class('mt-1 text-xs text-muted-foreground')],
                        ['Joined December 2021'],
                      ),
                    ],
                  ),
                ],
                contentClass: 'w-64',
              },
              h,
            ),
            toParentMessage: (message) => Message.GotHoverCardMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Delay']),
          h.submodel({
            slotId: model.delayedHoverCard.popover.id,
            model: model.delayedHoverCard,
            view: HoverCard.view,
            viewInputs: HoverCard.styledViewInputs(
              {
                trigger: 'Hover with delay',
                content: [
                  h.p(
                    [h.Class('text-sm')],
                    ['Opens after 500ms and closes 300ms after leaving the card.'],
                  ),
                ],
                contentClass: 'w-64',
              },
              h,
            ),
            toParentMessage: (message) => Message.GotDelayedHoverCardMessage({ message }),
          }),
        ],
      ),
    ],
  )

const foldNoOp =
  <Out>(): ((out: Out) => Update.Step<State, unknown>) =>
  () =>
  (model) => ({ model })

const foldHoverCardOutMessage = M.type<HoverCard.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Opened: foldNoOp(),
    Closed: foldNoOp(),
  }),
)

const foldHoverCard = Update.foldChild({
  update: HoverCard.update,
  read: (model: State) => Option.some(model.hoverCard),
  write: (model, next) => modifyFields(model, { hoverCard: () => next }),
  toParentMessage: (message) => Message.GotHoverCardMessage({ message }),
  foldOutMessage: foldHoverCardOutMessage,
})

const foldDelayedHoverCard = Update.foldChild({
  update: HoverCard.update,
  read: (model: State) => Option.some(model.delayedHoverCard),
  write: (model, next) => modifyFields(model, { delayedHoverCard: () => next }),
  toParentMessage: (message) => Message.GotDelayedHoverCardMessage({ message }),
  foldOutMessage: foldHoverCardOutMessage,
})

const fields = { hoverCard: HoverCard.Model, delayedHoverCard: HoverCard.Model }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    hoverCard: HoverCard.init({ id: 'hover-card-demo' }),
    delayedHoverCard: HoverCard.init({ id: 'hover-card-delay-demo', openDelay: 500 }),
  },
  messages: [Message.GotHoverCardMessage, Message.GotDelayedHoverCardMessage],
  handlers: (model: State) => ({
    GotHoverCardMessage: (payload: typeof Message.GotHoverCardMessage.Type): UpdateReturn =>
      foldHoverCard(model, payload.message),
    GotDelayedHoverCardMessage: (
      payload: typeof Message.GotDelayedHoverCardMessage.Type,
    ): UpdateReturn => foldDelayedHoverCard(model, payload.message),
  }),
  samples: [],
  // Open/close flows entirely through the submodel (hover, focus, Escape);
  // the card emits no parent commands, so there are no top-level samples.
})
