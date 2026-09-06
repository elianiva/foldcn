import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as popover from '../../generated/registry/ui/popover'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotPopoverMessage: { message: popover.Message },
  GotTopPopoverMessage: { message: popover.Message },
  GotRightPopoverMessage: { message: popover.Message },
  GotBottomPopoverMessage: { message: popover.Message },
  GotLeftPopoverMessage: { message: popover.Message },
})

export const popoverView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.submodel({
            slotId: model.popover.id,
            model: model.popover,
            view: popover.view,
            viewInputs: popover.styledViewInputs(
              {
                anchor: { placement: 'bottom', gap: 4, padding: 8 },
                trigger: 'Open popover',
                content: [
                  h.div(
                    [h.Class('grid gap-4')],
                    [
                      h.div(
                        [h.Class('space-y-2')],
                        [
                          h.h4([h.Class('leading-none font-medium')], ['Dimensions']),
                          h.p(
                            [h.Class('text-sm text-muted-foreground')],
                            ['Set the dimensions for the layer.'],
                          ),
                        ],
                      ),
                      h.div(
                        [h.Class('grid gap-2')],
                        [
                          h.div(
                            [h.Class('grid grid-cols-3 items-center gap-4')],
                            [
                              h.label(
                                [h.Class('text-sm font-medium'), h.For('popover-width')],
                                ['Width'],
                              ),
                              h.input([
                                h.Class(
                                  'col-span-2 flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm',
                                ),
                                h.Id('popover-width'),
                                h.Attribute('defaultValue', '100%'),
                              ]),
                            ],
                          ),
                          h.div(
                            [h.Class('grid grid-cols-3 items-center gap-4')],
                            [
                              h.label(
                                [h.Class('text-sm font-medium'), h.For('popover-maxWidth')],
                                ['Max. width'],
                              ),
                              h.input([
                                h.Class(
                                  'col-span-2 flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm',
                                ),
                                h.Id('popover-maxWidth'),
                                h.Attribute('defaultValue', '300px'),
                              ]),
                            ],
                          ),
                          h.div(
                            [h.Class('grid grid-cols-3 items-center gap-4')],
                            [
                              h.label(
                                [h.Class('text-sm font-medium'), h.For('popover-height')],
                                ['Height'],
                              ),
                              h.input([
                                h.Class(
                                  'col-span-2 flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm',
                                ),
                                h.Id('popover-height'),
                                h.Attribute('defaultValue', '25px'),
                              ]),
                            ],
                          ),
                          h.div(
                            [h.Class('grid grid-cols-3 items-center gap-4')],
                            [
                              h.label(
                                [h.Class('text-sm font-medium'), h.For('popover-maxHeight')],
                                ['Max. height'],
                              ),
                              h.input([
                                h.Class(
                                  'col-span-2 flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm',
                                ),
                                h.Id('popover-maxHeight'),
                                h.Attribute('defaultValue', 'none'),
                              ]),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
                contentClass: 'w-80',
              },
              h,
            ),
            toParentMessage: (message) => Message.GotPopoverMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Sides']),
          h.div(
            [h.Class('flex flex-wrap gap-2 justify-center')],
            [
              h.submodel({
                slotId: model.topPopover.id,
                model: model.topPopover,
                view: popover.view,
                viewInputs: popover.styledViewInputs(
                  {
                    anchor: { placement: 'top', gap: 4 },
                    trigger: 'Top',
                    content: ['Top popover'],
                    triggerClass: 'rounded-lg border px-3 py-1 text-sm',
                    contentClass: 'w-40',
                  },
                  h,
                ),
                toParentMessage: (message) => Message.GotTopPopoverMessage({ message }),
              }),
              h.submodel({
                slotId: model.rightPopover.id,
                model: model.rightPopover,
                view: popover.view,
                viewInputs: popover.styledViewInputs(
                  {
                    anchor: { placement: 'right', gap: 4 },
                    trigger: 'Right',
                    content: ['Right popover'],
                    triggerClass: 'rounded-lg border px-3 py-1 text-sm',
                    contentClass: 'w-40',
                  },
                  h,
                ),
                toParentMessage: (message) => Message.GotRightPopoverMessage({ message }),
              }),
              h.submodel({
                slotId: model.bottomPopover.id,
                model: model.bottomPopover,
                view: popover.view,
                viewInputs: popover.styledViewInputs(
                  {
                    anchor: { placement: 'bottom', gap: 4 },
                    trigger: 'Bottom',
                    content: ['Bottom popover'],
                    triggerClass: 'rounded-lg border px-3 py-1 text-sm',
                    contentClass: 'w-40',
                  },
                  h,
                ),
                toParentMessage: (message) => Message.GotBottomPopoverMessage({ message }),
              }),
              h.submodel({
                slotId: model.leftPopover.id,
                model: model.leftPopover,
                view: popover.view,
                viewInputs: popover.styledViewInputs(
                  {
                    anchor: { placement: 'left', gap: 4 },
                    trigger: 'Left',
                    content: ['Left popover'],
                    triggerClass: 'rounded-lg border px-3 py-1 text-sm',
                    contentClass: 'w-40',
                  },
                  h,
                ),
                toParentMessage: (message) => Message.GotLeftPopoverMessage({ message }),
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

const foldPopoverOutMessage = M.type<popover.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Opened: foldNoOp(),
    Closed: foldNoOp(),
  }),
)

const foldPopover = Update.foldChild({
  update: popover.update,
  read: (model: State) => Option.some(model.popover),
  write: (model, next) => evo(model, { popover: () => next }),
  toParentMessage: (message) => Message.GotPopoverMessage({ message }),
  foldOutMessage: foldPopoverOutMessage,
})

const foldTopPopover = Update.foldChild({
  update: popover.update,
  read: (model: State) => Option.some(model.topPopover),
  write: (model, next) => evo(model, { topPopover: () => next }),
  toParentMessage: (message) => Message.GotTopPopoverMessage({ message }),
  foldOutMessage: foldPopoverOutMessage,
})

const foldRightPopover = Update.foldChild({
  update: popover.update,
  read: (model: State) => Option.some(model.rightPopover),
  write: (model, next) => evo(model, { rightPopover: () => next }),
  toParentMessage: (message) => Message.GotRightPopoverMessage({ message }),
  foldOutMessage: foldPopoverOutMessage,
})

const foldBottomPopover = Update.foldChild({
  update: popover.update,
  read: (model: State) => Option.some(model.bottomPopover),
  write: (model, next) => evo(model, { bottomPopover: () => next }),
  toParentMessage: (message) => Message.GotBottomPopoverMessage({ message }),
  foldOutMessage: foldPopoverOutMessage,
})

const foldLeftPopover = Update.foldChild({
  update: popover.update,
  read: (model: State) => Option.some(model.leftPopover),
  write: (model, next) => evo(model, { leftPopover: () => next }),
  toParentMessage: (message) => Message.GotLeftPopoverMessage({ message }),
  foldOutMessage: foldPopoverOutMessage,
})

const fields = {
  popover: popover.Model,
  topPopover: popover.Model,
  rightPopover: popover.Model,
  bottomPopover: popover.Model,
  leftPopover: popover.Model,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    popover: popover.init({ id: 'popover-demo' }),
    topPopover: popover.init({ id: 'popover-top-demo' }),
    rightPopover: popover.init({ id: 'popover-right-demo' }),
    bottomPopover: popover.init({ id: 'popover-bottom-demo' }),
    leftPopover: popover.init({ id: 'popover-left-demo' }),
  },
  messages: [
    Message.GotPopoverMessage,
    Message.GotTopPopoverMessage,
    Message.GotRightPopoverMessage,
    Message.GotBottomPopoverMessage,
    Message.GotLeftPopoverMessage,
  ],
  handlers: (model: State) => ({
    GotPopoverMessage: (payload: typeof Message.GotPopoverMessage.Type): UpdateReturn =>
      foldPopover(model, payload.message),
    GotTopPopoverMessage: (payload: typeof Message.GotTopPopoverMessage.Type): UpdateReturn =>
      foldTopPopover(model, payload.message),
    GotRightPopoverMessage: (payload: typeof Message.GotRightPopoverMessage.Type): UpdateReturn =>
      foldRightPopover(model, payload.message),
    GotBottomPopoverMessage: (payload: typeof Message.GotBottomPopoverMessage.Type): UpdateReturn =>
      foldBottomPopover(model, payload.message),
    GotLeftPopoverMessage: (payload: typeof Message.GotLeftPopoverMessage.Type): UpdateReturn =>
      foldLeftPopover(model, payload.message),
  }),
  samples: [],
  // Popover open/close flows entirely through the submodel; the public
  // @foldkit/ui namespace exports no child-message constructors, so there
  // are no top-level samples to feed update().
})
