import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '@foldcn/registry/styles/default/ui/button'
import * as Dialog from '@foldcn/registry/styles/default/ui/dialog'

import { ClickedOpenDialog, GotDialogMessage, type Message } from '../message'
import type { Model } from '../model'

export const dialogView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col items-start gap-4')],
    [
      button<Message>({ onClick: ClickedOpenDialog() }, 'Open dialog', h),
      h.submodel({
        slotId: model.dialog.id,
        model: model.dialog,
        view: Dialog.view,
        viewInputs: Dialog.styledViewInputs(
          {
            content: ({ closeButton, title, description }, h) => [
              h.h2([...title, h.Class('text-lg font-semibold')], ['Edit profile']),
              h.p(
                [...description, h.Class('text-sm text-muted-foreground')],
                ['Make changes to your profile here. Click save when you are done.'],
              ),
              h.div(
                [h.Class('mt-4 bg-muted p-3 text-sm text-muted-foreground')],
                ['This modal traps focus and closes on Esc or backdrop click.'],
              ),
              h.div(
                [h.Class('mt-6 flex justify-end gap-2')],
                [
                  h.button(
                    [...closeButton, h.Class('rounded-md border border-input px-4 py-2 text-sm')],
                    ['Cancel'],
                  ),
                  h.button(
                    [
                      ...closeButton,
                      h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground'),
                    ],
                    ['Save'],
                  ),
                ],
              ),
            ],
          },
          h,
        ),
        toParentMessage: (message) => GotDialogMessage({ message }),
      }),
    ],
  )
