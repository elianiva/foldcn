import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '@foldcn/registry/styles/default/ui/button'
import * as Drawer from '@foldcn/registry/styles/default/ui/drawer'

import { ClickedOpenDialog, GotDialogMessage, type Message } from '../message'
import type { Model } from '../model'

export const drawerView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col items-start gap-4')],
    [
      button<Message>({ onClick: ClickedOpenDialog() }, 'Open drawer', h),
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
                  Drawer.title(title, {}, ['Move to folder'], h),
                  Drawer.description(
                    description,
                    {},
                    ['Choose a destination for the selected items.'],
                    h,
                  ),
                ],
                h,
              ),
              Drawer.footer(
                {},
                [
                  Drawer.closeButton(closeButton, {}, ['Cancel'], h),
                  h.button(
                    [...closeButton, h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground')],
                    ['Move'],
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
