import { Command, Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '../../generated/registry/ui/button'
import * as Dialog from '../../generated/registry/ui/dialog'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const DialogSize = S.Literals(['sm', 'default', 'lg'])
type DialogSize = typeof DialogSize.Type

const DialogSizePanelClass: Record<DialogSize, string> = {
  sm: 'sm:max-w-sm',
  default: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
}

const DialogSizeLabel: Record<DialogSize, string> = {
  sm: 'Small',
  default: 'Default',
  lg: 'Large',
}

const Message = defineMessageUnion({
  GotDialogMessage: { message: Dialog.Message },
  ClickedOpenDialog: {},
  ClickedOpenSizedDialog: { size: DialogSize },
})

export const dialogView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
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
                'Open Dialog',
                h,
              ),
              h.submodel({
                slotId: model.dialog.id,
                model: model.dialog,
                view: Dialog.view,
                viewInputs: Dialog.styledViewInputs(
                  {
                    panelClass: DialogSizePanelClass[model.dialogSize],
                    content: ({ closeButton, title, description }, h) => [
                      Dialog.header(
                        {},
                        [
                          Dialog.title(
                            { attributes: title },
                            ['Edit profile (', DialogSizeLabel[model.dialogSize], ')'],
                            h,
                          ),
                          Dialog.description(
                            { attributes: description },
                            ['Make changes to your profile here. Click save when you are done.'],
                            h,
                          ),
                        ],
                        h,
                      ),
                      h.div(
                        [h.Class('grid gap-4 py-4')],
                        [
                          h.div(
                            [h.Class('grid gap-3')],
                            [
                              h.label(
                                [
                                  h.Class(
                                    'flex items-center gap-2 text-sm leading-none font-medium',
                                  ),
                                  h.For('dialog-name-1'),
                                ],
                                ['Name'],
                              ),
                              h.input([
                                h.Class(
                                  'flex h-8 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
                                ),
                                h.Id('dialog-name-1'),
                                h.Attribute('name', 'name'),
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
                                  h.For('dialog-username-1'),
                                ],
                                ['Username'],
                              ),
                              h.input([
                                h.Class(
                                  'flex h-8 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
                                ),
                                h.Id('dialog-username-1'),
                                h.Attribute('name', 'username'),
                                h.Attribute('defaultValue', '@peduarte'),
                              ]),
                            ],
                          ),
                        ],
                      ),
                      Dialog.footer(
                        {},
                        [
                          h.button(
                            [
                              ...closeButton,
                              h.Class(
                                'inline-flex h-8 items-center justify-center rounded-lg border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                              ),
                            ],
                            ['Cancel'],
                          ),
                          h.button(
                            [
                              h.Class(
                                'inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90',
                              ),
                            ],
                            ['Save changes'],
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Scroll']),
          h.div(
            [h.Class('mx-auto w-full max-w-sm rounded-lg border p-4 text-sm')],
            [h.p([], ['Dialog with scrollable content — long content scrolls inside the dialog.'])],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Sizes']),
          h.div(
            [h.Class('flex flex-wrap gap-2')],
            [
              button<AppMessage>(
                { variant: 'outline', onClick: Message.ClickedOpenSizedDialog({ size: 'sm' }) },
                'Small',
                h,
              ),
              button<AppMessage>(
                {
                  variant: 'outline',
                  onClick: Message.ClickedOpenSizedDialog({ size: 'default' }),
                },
                'Default',
                h,
              ),
              button<AppMessage>(
                { variant: 'outline', onClick: Message.ClickedOpenSizedDialog({ size: 'lg' }) },
                'Large',
                h,
              ),
            ],
          ),
        ],
      ),
    ],
  )

const foldNoOp =
  (): ((out: Dialog.OutMessage) => Update.Step<State, unknown>) => () => (model) => ({ model })

const foldDialogOutMessage = M.type<Dialog.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Opened: foldNoOp(),
    Closed: foldNoOp(),
  }),
)

const foldDialog = Update.foldChild({
  update: Dialog.update,
  read: (model: State) => Option.some(model.dialog),
  write: (model, next) => evo(model, { dialog: () => next }),
  toParentMessage: (message) => Message.GotDialogMessage({ message }),
  foldOutMessage: foldDialogOutMessage,
})

const fields = { dialog: Dialog.Model, dialogSize: DialogSize }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { dialog: Dialog.init({ id: 'dialog-demo' }), dialogSize: 'default' },
  messages: [Message.GotDialogMessage, Message.ClickedOpenDialog, Message.ClickedOpenSizedDialog],
  handlers: (model: State) => ({
    GotDialogMessage: (payload: typeof Message.GotDialogMessage.Type): UpdateReturn =>
      foldDialog(model, payload.message),
    ClickedOpenDialog: (): UpdateReturn => {
      const { model: next, commands = [] } = Dialog.open(model.dialog)
      return {
        model: evo(model, { dialog: () => next }),
        commands: Command.mapMessages(commands, (message) => Message.GotDialogMessage({ message })),
      }
    },
    ClickedOpenSizedDialog: ({
      size,
    }: typeof Message.ClickedOpenSizedDialog.Type): UpdateReturn => {
      const sized = evo(model, { dialogSize: () => size })
      const { model: next, commands = [] } = Dialog.open(sized.dialog)
      return {
        model: evo(sized, { dialog: () => next }),
        commands: Command.mapMessages(commands, (message) => Message.GotDialogMessage({ message })),
      }
    },
  }),
  samples: [Message.ClickedOpenDialog(), Message.ClickedOpenSizedDialog({ size: 'lg' })],
})
