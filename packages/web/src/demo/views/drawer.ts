import { Match as M, Option } from 'effect'
import { Command, Update } from 'foldkit'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '../../generated/registry/ui/button'
import * as Drawer from '../../generated/registry/ui/drawer'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

type State = { dialog: typeof Drawer.Model.Type }

const Message = defineMessageUnion({
  GotDialogMessage: { message: Drawer.Message },
  ClickedOpenDialog: {},
})

export const drawerView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.div(
            [h.Class('flex flex-col items-start gap-4')],
            [
              button<AppMessage>(
                { variant: 'outline', onClick: Message.ClickedOpenDialog() },
                'Open Drawer',
                h,
              ),
              h.submodel({
                slotId: model.dialog.id,
                model: model.dialog,
                view: Drawer.view,
                viewInputs: Drawer.styledViewInputs(
                  {
                    isHandleVisible: true,
                    content: ({ closeButton, title, description }, h) => [
                      Drawer.header(
                        {},
                        [
                          Drawer.title({ attributes: title }, ['Pick a delivery time'], h),
                          Drawer.description(
                            { attributes: description },
                            ['We’ll prepare your order as soon as possible.'],
                            h,
                          ),
                        ],
                        h,
                      ),
                      h.div(
                        [h.Class('flex-1 overflow-y-auto p-4')],
                        [
                          h.div(
                            [h.Class('grid gap-2')],
                            [
                              h.label(
                                [
                                  h.Class(
                                    'flex items-center gap-3 rounded-lg border p-3 text-sm has-[input:checked]:border-primary has-[input:checked]:bg-accent',
                                  ),
                                  h.For('drawer-delivery-asap'),
                                ],
                                [
                                  h.div(
                                    [h.Class('flex flex-1 flex-col gap-0.5')],
                                    [
                                      h.span(
                                        [h.Class('flex items-center gap-2 font-medium')],
                                        [
                                          'Standard delivery',
                                          h.span(
                                            [
                                              h.Class(
                                                'inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground',
                                              ),
                                            ],
                                            ['Fastest'],
                                          ),
                                        ],
                                      ),
                                      h.span(
                                        [h.Class('text-xs text-muted-foreground')],
                                        ['25–35 min · Driver assigned now'],
                                      ),
                                    ],
                                  ),
                                  h.input([
                                    h.Attribute('type', 'radio'),
                                    h.Attribute('name', 'delivery-time'),
                                    h.Id('drawer-delivery-asap'),
                                    h.Attribute('value', 'asap'),
                                    h.Attribute('checked', ''),
                                    h.Class('size-4'),
                                  ]),
                                ],
                              ),
                              h.label(
                                [
                                  h.Class(
                                    'flex items-center gap-3 rounded-lg border p-3 text-sm has-[input:checked]:border-primary has-[input:checked]:bg-accent',
                                  ),
                                  h.For('drawer-delivery-5-00'),
                                ],
                                [
                                  h.div(
                                    [h.Class('flex flex-1 flex-col gap-0.5')],
                                    [
                                      h.span([h.Class('font-medium')], ['5:00 PM – 5:15 PM']),
                                      h.span(
                                        [h.Class('text-xs text-muted-foreground')],
                                        ['Prep starts at 4:45 PM'],
                                      ),
                                    ],
                                  ),
                                  h.input([
                                    h.Attribute('type', 'radio'),
                                    h.Attribute('name', 'delivery-time'),
                                    h.Id('drawer-delivery-5-00'),
                                    h.Attribute('value', '5-00'),
                                    h.Class('size-4'),
                                  ]),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                      Drawer.footer(
                        {},
                        [
                          h.button(
                            [
                              h.Class(
                                'inline-flex h-[34px] w-full items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90',
                              ),
                            ],
                            ['Confirm Delivery Time'],
                          ),
                          Drawer.closeButton({ attributes: closeButton }, ['Cancel'], h),
                        ],
                        h,
                      ),
                    ],
                  },
                  h,
                ),
                toParentMessage: (message) => Message.GotDialogMessage({ message }),
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
            [h.Class('mx-auto w-full max-w-sm rounded-lg border p-4 text-sm')],
            [h.p([], ['Drawer with visible handle for dragging.'])],
          ),
        ],
      ),
    ],
  )

const foldNoOp =
  (): ((out: Drawer.OutMessage) => Update.Step<State, unknown>) => () => (model) => ({ model })

const foldDrawerOutMessage = M.type<Drawer.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Opened: foldNoOp(),
    Closed: foldNoOp(),
  }),
)

// The drawer demo shares the dialog slice's `dialog` submodel field and its
// message tags — all dialog-engine demos drive the same submodel.
const foldDrawer = Update.foldChild({
  update: Drawer.update,
  read: (model: State) => Option.some(model.dialog),
  write: (model, next) => evo(model, { dialog: () => next }),
  toParentMessage: (message) => Message.GotDialogMessage({ message }),
  foldOutMessage: foldDrawerOutMessage,
})

export const slice = defineSlice({
  fields: {},
  init: {},
  messages: [Message.GotDialogMessage, Message.ClickedOpenDialog],
  handlers: (model: State) => ({
    GotDialogMessage: (payload: typeof Message.GotDialogMessage.Type): UpdateReturn =>
      foldDrawer(model, payload.message),
    ClickedOpenDialog: (): UpdateReturn => {
      const { model: next, commands = [] } = Drawer.open(model.dialog)
      return {
        model: evo(model, { dialog: () => next }),
        commands: Command.mapMessages(commands, (message) => Message.GotDialogMessage({ message })),
      }
    },
  }),
  samples: [Message.ClickedOpenDialog()],
})
