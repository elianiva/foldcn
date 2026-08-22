import type { Html, HtmlBuilder } from 'foldkit/html'

import * as menu from '@foldcn/registry/styles/default/ui/menu'
import { DemoMenu } from '../bundles'

import { GotMenuMessage, type Message } from '../message'
import type { Model } from '../model'

export const menuView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.submodel({
    slotId: model.menu.id,
    model: model.menu,
    view: DemoMenu.view,
    viewInputs: menu.viewInputs<string>({
      items: ['Edit', 'Duplicate', 'Archive', 'Delete'],
      buttonContent: h.span([], ['Open menu']),
      itemToConfig: (item, { isActive }) => ({
        className: isActive ? 'font-medium' : '',
        content: h.span([], [item]),
      }),
    }),
    toParentMessage: (message) => GotMenuMessage({ message }),
  })
