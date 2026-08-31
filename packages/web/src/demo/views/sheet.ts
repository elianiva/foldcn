import { Match as M, Option } from 'effect'
import { Command, Update } from 'foldkit'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '../../generated/registry/ui/button'
import * as Sheet from '../../generated/registry/ui/sheet'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

type State = { dialog: typeof Sheet.Model.Type }

const Message = defineMessageUnion({
  GotDialogMessage: { message: Sheet.Message },
  ClickedOpenDialog: {},
})

export const sheetView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Right']),
          h.div(
            [h.Class('flex flex-col items-start gap-4')],
            [
              button<AppMessage>(
                { variant: 'outline', onClick: Message.ClickedOpenDialog() },
                'Open',
                h,
              ),
              h.submodel({
                slotId: model.dialog.id,
                model: model.dialog,
                view: Sheet.view,
                viewInputs: Sheet.styledViewInputs(
                  {
                    side: 'right',
                    content: ({ closeButton, title, description }, h) => [
                      Sheet.header(
                        {},
                        [
                          Sheet.title({ attributes: title }, ['Edit profile'], h),
                          Sheet.description(
                            { attributes: description },
                            ['Make changes to your profile here. Click save when you are done.'],
                            h,
                          ),
                        ],
                        h,
                      ),
                      h.div(
                        [h.Class('grid flex-1 auto-rows-min gap-6 px-4')],
                        [
                          h.div(
                            [h.Class('grid gap-3')],
                            [
                              h.label(
                                [
                                  h.Class(
                                    'flex items-center gap-2 text-sm leading-none font-medium',
                                  ),
                                  h.For('sheet-demo-name'),
                                ],
                                ['Name'],
                              ),
                              h.input([
                                h.Class(
                                  'flex h-8 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
                                ),
                                h.Id('sheet-demo-name'),
                                h.Attribute('defaultValue', 'Pedro Duarte'),
                              ]),
                            ],
                          ),
                          h.div(
                            [h.Class('grid gap-3')],
                            [
                              h.label(
                                [
                                  h.Class(
                                    'flex items-center gap-2 text-sm leading-none font-medium',
                                  ),
                                  h.For('sheet-demo-username'),
                                ],
                                ['Username'],
                              ),
                              h.input([
                                h.Class(
                                  'flex h-8 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
                                ),
                                h.Id('sheet-demo-username'),
                                h.Attribute('defaultValue', '@peduarte'),
                              ]),
                            ],
                          ),
                        ],
                      ),
                      Sheet.footer(
                        {},
                        [
                          h.button(
                            [
                              h.Class(
                                'inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90',
                              ),
                            ],
                            ['Save changes'],
                          ),
                          Sheet.closeButton(
                            {
                              attributes: closeButton,
                              className: 'border border-input bg-background hover:bg-accent',
                            },
                            ['Close'],
                            h,
                          ),
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Sides']),
          h.div(
            [h.Class('flex flex-wrap gap-2')],
            [
              button<AppMessage>({ variant: 'outline' }, 'Top', h),
              button<AppMessage>({ variant: 'outline' }, 'Right', h),
              button<AppMessage>({ variant: 'outline' }, 'Bottom', h),
              button<AppMessage>({ variant: 'outline' }, 'Left', h),
            ],
          ),
        ],
      ),
    ],
  )

const foldNoOp = (): ((out: Sheet.OutMessage) => Update.Step<State, unknown>) => () => (model) => ({
  model,
})

const foldSheetOutMessage = M.type<Sheet.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Opened: foldNoOp(),
    Closed: foldNoOp(),
  }),
)

// The sheet demo shares the dialog slice's `dialog` submodel field and its
// message tags — all dialog-engine demos drive the same submodel.
const foldSheet = Update.foldChild({
  update: Sheet.update,
  read: (model: State) => Option.some(model.dialog),
  write: (model, next) => evo(model, { dialog: () => next }),
  toParentMessage: (message) => Message.GotDialogMessage({ message }),
  foldOutMessage: foldSheetOutMessage,
})

export const slice = defineSlice({
  fields: {},
  init: {},
  messages: [Message.GotDialogMessage, Message.ClickedOpenDialog],
  handlers: (model: State) => ({
    GotDialogMessage: (payload: typeof Message.GotDialogMessage.Type): UpdateReturn =>
      foldSheet(model, payload.message),
    ClickedOpenDialog: (): UpdateReturn => {
      const { model: next, commands = [] } = Sheet.open(model.dialog)
      return {
        model: evo(model, { dialog: () => next }),
        commands: Command.mapMessages(commands, (message) => Message.GotDialogMessage({ message })),
      }
    },
  }),
  samples: [Message.ClickedOpenDialog()],
})
