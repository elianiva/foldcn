import type { Html, HtmlBuilder } from 'foldkit/html'

import * as tabs from '@foldcn/registry/styles/default/ui/tabs'
import { DemoTabs } from '../bundles'

import { GotTabsMessage, type Message } from '../message'
import type { DemoTab, Model } from '../model'

const TAB_CONTENT: Record<DemoTab, string> = {
  Overview: 'Explore what this component does and how it is wired together.',
  Settings: 'Tweak the options exposed by the submodel.',
  Billing: 'See how it reports selection changes back to your update.',
}

export const tabsView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('w-full')],
    [
      h.submodel({
        slotId: model.tabs.id,
        model: model.tabs,
        view: DemoTabs.view,
        viewInputs: tabs.styledViewInputs<Message, DemoTab>(
          {
            tabs: ['Overview', 'Settings', 'Billing'],
            selectedValue: model.activeTab,
            ariaLabel: 'Demo tabs',
            panel: (tab, render, h) =>
              h.p([h.Class('text-sm text-muted-foreground')], [TAB_CONTENT[tab]]),
          },
          h,
        ),
        toParentMessage: (message) => GotTabsMessage({ message }),
      }),
    ],
  )
