import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Menubar from '@foldcn/registry/styles/default/ui/menubar'
import { DemoMenu } from '../bundles'

import { GotMenuMessage, type Message } from '../message'
import type { Model } from '../model'

export const menubarView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col items-start gap-4')],
    [
      Menubar.menubar(
        [
          // Interactive "File" menu — a real Menu submodel instance.
          h.submodel({
            slotId: model.menu.id,
            model: model.menu,
            view: DemoMenu.view,
            viewInputs: Menubar.viewInputs<string>({
              items: ['New File', 'New Window', 'Open', 'Save'],
              buttonContent: h.span([], ['File']),
              itemToConfig: (item, { isActive }) => ({
                className: isActive ? 'font-medium' : '',
                content: h.span([], [item]),
              }),
            }),
            toParentMessage: (message) => GotMenuMessage({ message }),
          }),
          // Static visual triggers that complete the bar.
          h.button([h.Class(Menubar.menubarTriggerClass)], ['Edit']),
          h.button([h.Class(Menubar.menubarTriggerClass)], ['View']),
        ],
        h,
      ),
    ],
  )
