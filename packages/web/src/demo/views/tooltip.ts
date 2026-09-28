import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { modifyFields } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as tooltip from '../../generated/registry/ui/tooltip'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotTooltipMessage: { message: tooltip.Message },
  GotTopTooltipMessage: { message: tooltip.Message },
  GotRightTooltipMessage: { message: tooltip.Message },
  GotBottomTooltipMessage: { message: tooltip.Message },
  GotLeftTooltipMessage: { message: tooltip.Message },
})

export const tooltipView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col items-center gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col items-center gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.submodel({
            slotId: model.tooltip.id,
            model: model.tooltip,
            view: tooltip.view,
            viewInputs: tooltip.styledViewInputs(
              {
                anchor: { placement: 'top', gap: 4, padding: 8 },
                trigger: 'Hover',
                content: 'Add to library',
              },
              h,
            ),
            toParentMessage: (message) => Message.GotTooltipMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col items-center gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Sides']),
          h.div(
            [h.Class('flex flex-wrap gap-2 justify-center')],
            [
              h.submodel({
                slotId: model.topTooltip.id,
                model: model.topTooltip,
                view: tooltip.view,
                viewInputs: tooltip.styledViewInputs(
                  { anchor: { placement: 'top', gap: 4 }, trigger: 'Top', content: 'Top tooltip' },
                  h,
                ),
                toParentMessage: (message) => Message.GotTopTooltipMessage({ message }),
              }),
              h.submodel({
                slotId: model.rightTooltip.id,
                model: model.rightTooltip,
                view: tooltip.view,
                viewInputs: tooltip.styledViewInputs(
                  {
                    anchor: { placement: 'right', gap: 4 },
                    trigger: 'Right',
                    content: 'Right tooltip',
                  },
                  h,
                ),
                toParentMessage: (message) => Message.GotRightTooltipMessage({ message }),
              }),
              h.submodel({
                slotId: model.bottomTooltip.id,
                model: model.bottomTooltip,
                view: tooltip.view,
                viewInputs: tooltip.styledViewInputs(
                  {
                    anchor: { placement: 'bottom', gap: 4 },
                    trigger: 'Bottom',
                    content: 'Bottom tooltip',
                  },
                  h,
                ),
                toParentMessage: (message) => Message.GotBottomTooltipMessage({ message }),
              }),
              h.submodel({
                slotId: model.leftTooltip.id,
                model: model.leftTooltip,
                view: tooltip.view,
                viewInputs: tooltip.styledViewInputs(
                  {
                    anchor: { placement: 'left', gap: 4 },
                    trigger: 'Left',
                    content: 'Left tooltip',
                  },
                  h,
                ),
                toParentMessage: (message) => Message.GotLeftTooltipMessage({ message }),
              }),
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

const foldTooltipOutMessage = M.type<tooltip.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Shown: foldNoOp(),
    Hidden: foldNoOp(),
  }),
)

const foldTooltip = Update.foldChild({
  update: tooltip.update,
  read: (model: State) => Option.some(model.tooltip),
  write: (model, next) => modifyFields(model, { tooltip: () => next }),
  toParentMessage: (message) => Message.GotTooltipMessage({ message }),
  foldOutMessage: foldTooltipOutMessage,
})

const foldTopTooltip = Update.foldChild({
  update: tooltip.update,
  read: (model: State) => Option.some(model.topTooltip),
  write: (model, next) => modifyFields(model, { topTooltip: () => next }),
  toParentMessage: (message) => Message.GotTopTooltipMessage({ message }),
  foldOutMessage: foldTooltipOutMessage,
})

const foldRightTooltip = Update.foldChild({
  update: tooltip.update,
  read: (model: State) => Option.some(model.rightTooltip),
  write: (model, next) => modifyFields(model, { rightTooltip: () => next }),
  toParentMessage: (message) => Message.GotRightTooltipMessage({ message }),
  foldOutMessage: foldTooltipOutMessage,
})

const foldBottomTooltip = Update.foldChild({
  update: tooltip.update,
  read: (model: State) => Option.some(model.bottomTooltip),
  write: (model, next) => modifyFields(model, { bottomTooltip: () => next }),
  toParentMessage: (message) => Message.GotBottomTooltipMessage({ message }),
  foldOutMessage: foldTooltipOutMessage,
})

const foldLeftTooltip = Update.foldChild({
  update: tooltip.update,
  read: (model: State) => Option.some(model.leftTooltip),
  write: (model, next) => modifyFields(model, { leftTooltip: () => next }),
  toParentMessage: (message) => Message.GotLeftTooltipMessage({ message }),
  foldOutMessage: foldTooltipOutMessage,
})

const fields = {
  tooltip: tooltip.Model,
  topTooltip: tooltip.Model,
  rightTooltip: tooltip.Model,
  bottomTooltip: tooltip.Model,
  leftTooltip: tooltip.Model,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    tooltip: tooltip.init({ id: 'tooltip-demo' }),
    topTooltip: tooltip.init({ id: 'tooltip-top-demo' }),
    rightTooltip: tooltip.init({ id: 'tooltip-right-demo' }),
    bottomTooltip: tooltip.init({ id: 'tooltip-bottom-demo' }),
    leftTooltip: tooltip.init({ id: 'tooltip-left-demo' }),
  },
  messages: [
    Message.GotTooltipMessage,
    Message.GotTopTooltipMessage,
    Message.GotRightTooltipMessage,
    Message.GotBottomTooltipMessage,
    Message.GotLeftTooltipMessage,
  ],
  handlers: (model: State) => ({
    GotTooltipMessage: (payload: typeof Message.GotTooltipMessage.Type): UpdateReturn =>
      foldTooltip(model, payload.message),
    GotTopTooltipMessage: (payload: typeof Message.GotTopTooltipMessage.Type): UpdateReturn =>
      foldTopTooltip(model, payload.message),
    GotRightTooltipMessage: (payload: typeof Message.GotRightTooltipMessage.Type): UpdateReturn =>
      foldRightTooltip(model, payload.message),
    GotBottomTooltipMessage: (payload: typeof Message.GotBottomTooltipMessage.Type): UpdateReturn =>
      foldBottomTooltip(model, payload.message),
    GotLeftTooltipMessage: (payload: typeof Message.GotLeftTooltipMessage.Type): UpdateReturn =>
      foldLeftTooltip(model, payload.message),
  }),
  samples: [],
  // Tooltip show/hide flows entirely through the submodel; the public
  // @foldkit/ui namespace exports no child-message constructors, so there
  // are no top-level samples to feed update().
})
