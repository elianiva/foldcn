import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as ToastModule from '@foldcn/registry/styles/default/ui/toast'

import {
  ClickedDismissAllToasts,
  ClickedShowErrorToast,
  ClickedShowInfoToast,
  ClickedShowSuccessToast,
  ClickedShowWarningToast,
  GotToastMessage,
  type Message,
} from '../message'
import type { Model } from '../model'
import { Toast } from '../toast'

export const toastView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col items-start gap-6')],
    [
      h.div(
        [h.Class('flex flex-wrap gap-2')],
        [
          hButton(h, 'Info', ClickedShowInfoToast()),
          hButton(h, 'Success', ClickedShowSuccessToast()),
          hButton(h, 'Warning', ClickedShowWarningToast()),
          hButton(h, 'Error', ClickedShowErrorToast()),
        ],
      ),
      h.div(
        [h.Class('flex flex-wrap gap-2')],
        [
          h.button(
            [
              h.Class('rounded-md border border-input bg-background px-4 py-2 text-sm font-medium'),
              h.OnClick(ClickedDismissAllToasts()),
            ],
            ['Dismiss all'],
          ),
        ],
      ),
      h.submodel({
        slotId: model.toast.id,
        model: model.toast,
        view: Toast.view,
        viewInputs: {
          position: 'BottomRight',
          entryToView: (entry, handlers) =>
            Toast.entryView({
              entry,
              handlers,
              h,
              toContent: (entry) => [
                h.p([h.Class(ToastModule.toastTitleClass)], [entry.payload.title]),
                ...Option.match(entry.payload.maybeDescription, {
                  onNone: () => [],
                  onSome: (description) => [
                    h.p([h.Class(ToastModule.toastDescriptionClass)], [description]),
                  ],
                }),
              ],
            }),
          entryClassName: ToastModule.toastEntryClass,
        },
        toParentMessage: (message) => GotToastMessage({ message }),
      }),
    ],
  )

const hButton = (h: HtmlBuilder<Message>, label: string, message: Message): Html =>
  h.button(
    [
      h.Class('rounded-md border border-input bg-background px-4 py-2 text-sm font-medium'),
      h.OnClick(message),
    ],
    [label],
  )
