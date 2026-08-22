import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '@foldcn/registry/styles/default/ui/button'
import * as AlertDialog from '@foldcn/registry/styles/default/ui/alert-dialog'

import { ClickedOpenDialog, GotDialogMessage, type Message } from '../message'
import type { Model } from '../model'

export const alertDialogView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col items-start gap-4')],
    [
      button<Message>({ onClick: ClickedOpenDialog() }, 'Show alert dialog', h),
      h.submodel({
        slotId: model.dialog.id,
        model: model.dialog,
        view: AlertDialog.view,
        viewInputs: AlertDialog.styledViewInputs(
          {
            content: ({ closeButton, title, description }, h) => [
              AlertDialog.header(
                {},
                [
                  AlertDialog.title(title, {}, ['Delete project'], h),
                  AlertDialog.description(
                    description,
                    {},
                    [
                      'This action cannot be undone. This will permanently delete your project and remove your data from our servers.',
                    ],
                    h,
                  ),
                ],
                h,
              ),
              AlertDialog.footer(
                {},
                [
                  AlertDialog.cancelButton(closeButton, {}, ['Cancel'], h),
                  AlertDialog.actionButton(closeButton, {}, ['Delete'], h),
                ],
                h,
              ),
            ],
          },
          h,
        ),
        toParentMessage: (message) => GotDialogMessage({ message }),
      }),
    ],
  )
