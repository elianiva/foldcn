import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { Tabs as FoldkitTabs } from '@foldkit/ui'

import * as tabs from '../../generated/registry/ui/tabs'
import { tabsListClass, tabsTriggerClass, tabsContentClass } from '../../generated/registry/ui/tabs'
import { Card } from '../../generated/registry/ui/card'
import { icon } from '../../generated/registry/lib/icons'
import { AppWindow, Code, Home, Search, Settings } from 'lucide'

import { DemoTabs, DemoTab } from '../bundles'
import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotTabsMessage: { message: tabs.Message },
})

const TAB_DETAILS: Record<DemoTab, { title: string; description: string; content: string }> = {
  Overview: {
    title: 'Overview',
    description:
      'View your key metrics and recent project activity. Track progress across all your active projects.',
    content: 'You have 12 active projects and 3 pending tasks.',
  },
  Analytics: {
    title: 'Analytics',
    description:
      'Track performance and user engagement metrics. Monitor trends and identify growth opportunities.',
    content: 'Page views are up 25% compared to last month.',
  },
  Reports: {
    title: 'Reports',
    description:
      'Generate and download your detailed reports. Export data in multiple formats for analysis.',
    content: 'You have 5 reports ready and available to export.',
  },
  Settings: {
    title: 'Settings',
    description:
      'Manage your account preferences and options. Customize your experience to fit your needs.',
    content: 'Configure notifications, security, and themes.',
  },
}

const staticTabs = (
  h: HtmlBuilder<AppMessage>,
  labels: ReadonlyArray<string>,
  activeIndex: number,
  variant: 'default' | 'line' = 'default',
  disabledIndex?: number,
): Html =>
  h.div(
    [h.Class('flex flex-col gap-2')],
    [
      h.div(
        [
          h.Class(tabsListClass(variant)),
          h.DataAttribute('slot', 'tabs-list'),
          h.Attribute('data-variant', variant),
          h.DataAttribute('orientation', 'horizontal'),
          h.DataAttribute('horizontal', ''),
        ],
        labels.map((label, idx) =>
          h.button(
            [
              h.Class(tabsTriggerClass),
              h.DataAttribute('slot', 'tabs-trigger'),
              ...(idx === activeIndex
                ? [h.DataAttribute('data-selected', ''), h.Attribute('data-selected', '')]
                : []),
              ...(disabledIndex === idx ? [h.Disabled(true), h.AriaDisabled(true)] : []),
            ],
            [label],
          ),
        ),
      ),
    ],
  )

const staticTabsWithIcons = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class(tabsListClass('default')), h.DataAttribute('slot', 'tabs-list')],
    [
      h.button(
        [
          h.Class(tabsTriggerClass),
          h.DataAttribute('slot', 'tabs-trigger'),
          h.Attribute('data-selected', ''),
        ],
        [icon(h, AppWindow, 'size-4'), ' Preview'],
      ),
      h.button(
        [h.Class(tabsTriggerClass), h.DataAttribute('slot', 'tabs-trigger')],
        [icon(h, Code, 'size-4'), ' Code'],
      ),
    ],
  )

const staticIconOnly = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class(tabsListClass('default')), h.DataAttribute('slot', 'tabs-list')],
    [
      h.button(
        [h.Class(tabsTriggerClass), h.Attribute('data-selected', '')],
        [icon(h, Home, 'size-4')],
      ),
      h.button([h.Class(tabsTriggerClass)], [icon(h, Search, 'size-4')]),
      h.button([h.Class(tabsTriggerClass)], [icon(h, Settings, 'size-4')]),
    ],
  )

export const tabsView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          staticTabs(h, ['Home', 'Settings'], 0),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Line']),
          staticTabs(h, ['Overview', 'Analytics', 'Reports'], 0, 'line'),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Disabled']),
          staticTabs(h, ['Home', 'Disabled'], 0, 'default', 1),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Icons']),
          staticTabsWithIcons(h),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Icon Only']),
          staticIconOnly(h),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Content']),
          h.submodel({
            slotId: model.tabs.id,
            model: model.tabs,
            view: DemoTabs.view,
            viewInputs: tabs.styledViewInputs<AppMessage, DemoTab>(
              {
                tabs: ['Overview', 'Analytics', 'Reports', 'Settings'],
                selectedValue: model.activeTab,
                ariaLabel: 'Demo tabs',
                panel: (tab, _render, h2) => {
                  const details = TAB_DETAILS[tab]
                  return Card<AppMessage>(
                    {},
                    [
                      Card.header<AppMessage>(
                        {},
                        [
                          Card.title<AppMessage>({}, [details.title], h2),
                          Card.description<AppMessage>({}, [details.description], h2),
                        ],
                        h2,
                      ),
                      Card.content<AppMessage>(
                        {},
                        [h2.p([h2.Class('text-sm text-muted-foreground')], [details.content])],
                        h2,
                      ),
                    ],
                    h2,
                  )
                },
              },
              h,
            ),
            toParentMessage: (message) => Message.GotTabsMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Vertical']),
          h.div(
            [h.Class('flex gap-4')],
            [
              h.div(
                [
                  h.Class(`${tabsListClass('default')} flex-col h-fit`),
                  h.DataAttribute('slot', 'tabs-list'),
                ],
                [
                  h.button(
                    [h.Class(tabsTriggerClass), h.Attribute('data-selected', '')],
                    ['Account'],
                  ),
                  h.button([h.Class(tabsTriggerClass)], ['Password']),
                  h.button([h.Class(tabsTriggerClass)], ['Notifications']),
                ],
              ),
              h.div(
                [h.Class(`${tabsContentClass} border rounded-lg p-4 flex-1`)],
                ['Manage your account preferences and profile information.'],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div(
            [h.Class('px-1 text-xs font-medium text-muted-foreground')],
            ['With Input and Button'],
          ),
          h.div(
            [h.Class('flex items-center gap-2')],
            [
              staticTabs(h, ['Overview', 'Analytics'], 0),
              h.div(
                [h.Class('ml-auto flex items-center gap-2')],
                [
                  h.input([
                    h.Class(
                      'flex h-8 w-32 rounded-md border border-input bg-transparent px-2 text-sm',
                    ),
                    h.Placeholder('Search...'),
                  ]),
                  h.button(
                    [
                      h.Class(
                        'inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground',
                      ),
                    ],
                    ['Action'],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )

const foldTabsOutMessage = M.type<FoldkitTabs.OutMessage<DemoTab>>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => ({ model: evo(model, { activeTab: () => value }) }),
  }),
)

const foldTabs = Update.foldChild({
  update: DemoTabs.update,
  read: (model: State) => Option.some(model.tabs),
  write: (model, next) => evo(model, { tabs: () => next }),
  toParentMessage: (message) => Message.GotTabsMessage({ message }),
  foldOutMessage: foldTabsOutMessage,
})

const fields = { tabs: tabs.Model, activeTab: DemoTab }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { tabs: tabs.init({ id: 'tabs-demo' }), activeTab: 'Overview' },
  messages: [Message.GotTabsMessage],
  handlers: (model: State) => ({
    GotTabsMessage: (payload: typeof Message.GotTabsMessage.Type): UpdateReturn =>
      foldTabs(model, payload.message),
  }),
  samples: [],
})
