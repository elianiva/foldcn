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
              h.span([h.Class('rounded-lg border px-3 py-1 text-sm')], ['Top']),
              h.span([h.Class('rounded-lg border px-3 py-1 text-sm')], ['Right']),
              h.span([h.Class('rounded-lg border px-3 py-1 text-sm')], ['Bottom']),
              h.span([h.Class('rounded-lg border px-3 py-1 text-sm')], ['Left']),
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

const fields = { popover: popover.Model }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { popover: popover.init({ id: 'popover-demo' }) },
  messages: [Message.GotPopoverMessage],
  handlers: (model: State) => ({
    GotPopoverMessage: (payload: typeof Message.GotPopoverMessage.Type): UpdateReturn =>
      foldPopover(model, payload.message),
  }),
  samples: [],
  // Popover open/close flows entirely through the submodel; the public
  // @foldkit/ui namespace exports no child-message constructors, so there
  // are no top-level samples to feed update().
})
