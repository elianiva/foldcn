import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { icon } from '@foldcn/registry/styles/default/lib/icons'
import { X } from 'lucide'
import * as Sonner from '@foldcn/registry/styles/default/ui/sonner'

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

export const sonnerView = (model: Model, h: HtmlBuilder<Message>): Html =>
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
            h.div(
              [
                h.DataAttribute('slot', 'toast'),
                h.Class(
                  `cn-toast group/toast relative flex w-full items-center gap-3 overflow-hidden ${Sonner.sonnerEntryClass}`,
                ),
              ],
              [
                Sonner.toastIcon(h, entry.variant),
                h.div(
                  [h.Class('flex min-w-0 flex-1 flex-col gap-1')],
                  [
                    h.p([h.Class(Sonner.sonnerTitleClass)], [entry.payload.title]),
                    ...Option.match(entry.payload.maybeDescription, {
                      onNone: () => [],
                      onSome: (description) => [
                        h.p([h.Class(Sonner.sonnerDescriptionClass)], [description]),
                      ],
                    }),
                  ],
                ),
                h.button(
                  [
                    ...handlers.dismiss,
                    h.Class(Sonner.sonnerDismissButtonClass),
                    h.AriaLabel('Close toast'),
                    h.DataAttribute('slot', 'toast-close'),
                  ],
                  [icon(h, X)],
                ),
              ],
            ),
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
