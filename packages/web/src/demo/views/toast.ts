import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { Command, Update } from 'foldkit'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as ToastModule from '../../generated/registry/ui/toast'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'
import { Toast } from '../toast'

export const Message = defineMessageUnion({
  GotToastMessage: { message: Toast.Message },
  ClickedShowInfoToast: {},
  ClickedShowSuccessToast: {},
  ClickedShowWarningToast: {},
  ClickedShowErrorToast: {},
  ClickedDismissAllToasts: {},
})

export const toastView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.div(
            [h.Class('flex flex-col items-start gap-6')],
            [
              h.div(
                [h.Class('flex flex-wrap gap-2')],
                [hButton(h, 'Show toast', Message.ClickedShowInfoToast())],
              ),
              h.div(
                [h.Class('flex flex-wrap gap-2')],
                [
                  h.button(
                    [
                      h.Class(
                        'rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
                      ),
                      h.OnClick(Message.ClickedDismissAllToasts()),
                    ],
                    ['Dismiss all'],
                  ),
                ],
              ),
              h.submodel({
                slotId: model.toast.id,
                model: model.toast,
                view: Toast.view,
                viewInputs: Toast.styledViewInputs(
                  model.toast,
                  {
                    position: 'BottomRight',
                    toContent: (entry, h) => [
                      h.p([h.Class(ToastModule.toastTitleClass)], [entry.payload.title]),
                      ...Option.match(entry.payload.description, {
                        onNone: () => [],
                        onSome: (description) => [
                          h.p([h.Class(ToastModule.toastDescriptionClass)], [description]),
                        ],
                      }),
                    ],
                  },
                  h,
                ),
                toParentMessage: (message) => Message.GotToastMessage({ message }),
              }),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Variants']),
          h.div(
            [h.Class('flex flex-wrap gap-2')],
            [
              hVariantButton(h, 'Info', Message.ClickedShowInfoToast()),
              hVariantButton(h, 'Success', Message.ClickedShowSuccessToast()),
              hVariantButton(h, 'Warning', Message.ClickedShowWarningToast()),
              hVariantButton(h, 'Error', Message.ClickedShowErrorToast()),
            ],
          ),
        ],
      ),
    ],
  )

const hButton = (h: HtmlBuilder<AppMessage>, label: string, message: AppMessage): Html =>
  h.button(
    [
      h.Class('rounded-md border border-input bg-background px-4 py-2 text-sm font-medium'),
      h.OnClick(message),
    ],
    [label],
  )

/** Live variant button: renders the registry's own per-variant icon
 *  (`ToastModule.toastIcon`, the same renderer the toast stack uses) and
 *  fires a real toast of that variant on click — mirroring upstream's
 *  `toast-types` demo. Previously this section was inert tinted spans. */
const hVariantButton = (
  h: HtmlBuilder<AppMessage>,
  variant: 'Info' | 'Success' | 'Warning' | 'Error',
  message: AppMessage,
): Html =>
  h.button(
    [
      h.Class(
        'inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
      ),
      h.OnClick(message),
    ],
    [ToastModule.toastIcon(h, variant), variant],
  )

const foldNoOp =
  (): ((out: typeof Toast.OutMessage.Type) => Update.Step<State, unknown>) => () => (model) => ({
    model,
  })

const foldToastOutMessage = M.type<typeof Toast.OutMessage.Type>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    DismissedToast: foldNoOp(),
  }),
)

const foldToast = Update.foldChild({
  update: Toast.update,
  read: (model: State) => Option.some(model.toast),
  write: (model, next) => evo(model, { toast: () => next }),
  toParentMessage: (message) => Message.GotToastMessage({ message }),
  foldOutMessage: foldToastOutMessage,
})

const showToast = (
  model: State,
  variant: 'Info' | 'Success' | 'Warning' | 'Error',
  title: string,
  description: Option.Option<string>,
): UpdateReturn => {
  const { model: next, commands = [] } = Toast.show(model.toast, {
    variant,
    payload: { title, description },
  })
  return {
    model: evo(model, { toast: () => next }),
    commands: Command.mapMessages(commands, (message) => Message.GotToastMessage({ message })),
  }
}

const fields = { toast: Toast.Model }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { toast: Toast.init({ id: 'toast-demo' }) },
  messages: [
    Message.GotToastMessage,
    Message.ClickedShowInfoToast,
    Message.ClickedShowSuccessToast,
    Message.ClickedShowWarningToast,
    Message.ClickedShowErrorToast,
    Message.ClickedDismissAllToasts,
  ],
  handlers: (model: State) => ({
    GotToastMessage: (payload: typeof Message.GotToastMessage.Type): UpdateReturn =>
      foldToast(model, payload.message),
    ClickedShowInfoToast: (): UpdateReturn =>
      showToast(model, 'Info', 'Changes saved', Option.some('Your preferences have been updated.')),
    ClickedShowSuccessToast: (): UpdateReturn =>
      showToast(
        model,
        'Success',
        'Uploaded successfully',
        Option.some('kit-manual.pdf is now available.'),
      ),
    ClickedShowWarningToast: (): UpdateReturn =>
      showToast(
        model,
        'Warning',
        'Network slow',
        Option.some('Some assets are loading over a weak connection.'),
      ),
    ClickedShowErrorToast: (): UpdateReturn =>
      showToast(
        model,
        'Error',
        'Failed to save',
        Option.some('Check your connection and try again.'),
      ),
    ClickedDismissAllToasts: (): UpdateReturn => {
      const { model: next, commands = [] } = Toast.dismissAll(model.toast)
      return {
        model: evo(model, { toast: () => next }),
        commands: Command.mapMessages(commands, (message) => Message.GotToastMessage({ message })),
      }
    },
  }),
  samples: [Message.ClickedShowInfoToast()],
})
