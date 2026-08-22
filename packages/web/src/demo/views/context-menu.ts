import type { Html, HtmlBuilder } from 'foldkit/html'

import * as ContextMenu from '@foldcn/registry/styles/default/ui/context-menu'
import { DemoMenu } from '../bundles'

import { GotMenuMessage, type Message } from '../message'
import type { Model } from '../model'

export const contextMenuView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.submodel({
    slotId: model.menu.id,
    model: model.menu,
    view: DemoMenu.view,
    viewInputs: ContextMenu.viewInputs<string>({
      items: ['Profile', 'Billing', 'Team', 'Subscription'],
      buttonContent: h.span([], ['Open context menu']),
      itemToConfig: (item, { isActive }) => ({
        className: isActive ? 'font-medium' : '',
        content: h.span([], [item]),
      }),
    }),
    toParentMessage: (message) => GotMenuMessage({ message }),
  })
