import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '@foldcn/registry/styles/default/ui/button'
import * as Sheet from '@foldcn/registry/styles/default/ui/sheet'

import { ClickedOpenDialog, GotDialogMessage, type Message } from '../message'
import type { Model } from '../model'

export const sheetView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col items-start gap-4')],
    [
      button<Message>({ onClick: ClickedOpenDialog() }, 'Open sheet (right)', h),
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
                  Sheet.title(title, {}, ['Edit profile'], h),
                  Sheet.description(
                    description,
                    {},
                    ['Make changes to your profile here. Click save when you are done.'],
                    h,
                  ),
                ],
                h,
              ),
              Sheet.footer(
                {},
                [
                  Sheet.closeButton(closeButton, {}, ['Cancel'], h),
                  h.button(
                    [...closeButton, h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground')],
                    ['Save changes'],
                  ),
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
