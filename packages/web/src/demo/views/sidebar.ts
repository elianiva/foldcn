import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { Subscription, Update } from 'foldkit'
import { modifyFields } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  BookOpen,
  Bot,
  ChevronRight,
  ChevronsUpDown,
  Frame,
  GalleryVerticalEnd,
  Map,
  MoreHorizontal,
  PieChart,
  Settings2,
  Sparkles,
  SquareTerminal,
} from 'lucide'

import { icon } from '../../generated/registry/lib/icons'
import * as Menu from '../../generated/registry/ui/menu'
import * as Sidebar from '../../generated/registry/ui/sidebar'
import * as Tooltip from '../../generated/registry/ui/tooltip'

import { defineSlice, type UpdateReturn } from '../slice'
import { DemoMenu } from '../bundles'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotSidebarMessage: { message: Sidebar.Message },
  GotHeaderMenuMessage: { message: Menu.Message },
  GotFooterMenuMessage: { message: Menu.Message },
  GotPlaygroundTooltipMessage: { message: Tooltip.Message },
  GotModelsTooltipMessage: { message: Tooltip.Message },
  GotDocumentationTooltipMessage: { message: Tooltip.Message },
  GotSettingsTooltipMessage: { message: Tooltip.Message },
  ToggledPlayground: {},
})

// Mimics apps/v4/examples/base/sidebar-demo.tsx (the flagship Team
// Switcher + collapsible Platform + Projects w/ actions + User footer
// shell). The navigation sub-menus use native details disclosure so they
// remain interactive inside the provider content callback. The demo also
// exercises sidebar collapse/expand, rail, keyboard shortcut and mobile sheet.
// See also sidebar-group.tsx / sidebar-menu*.tsx for the smaller
// sub-part variants this demo composites.

export const sidebarView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-0 bg-background')],
    [
      h.p(
        [h.Class('px-4 pb-3 pt-1 text-xs text-muted-foreground')],
        [
          'Collapsible app shell — toggle with the header button, the rail hot-spot, or ',
          h.kbd([h.Class('rounded border bg-muted px-1 font-mono text-[11px]')], ['⌘B']),
          '. Collapse it, reload the page, and the demo restores the saved state from its cookie. Resize below the md breakpoint for the mobile sheet.',
        ],
      ),
      h.div(
        [
          h.Class('relative flex h-[520px] w-full overflow-hidden rounded-lg border bg-background'),
          h.Style({ transform: 'translateZ(0)' }),
        ],
        [
          h.submodel({
            slotId: 'sidebar-demo',
            model: model.sidebar,
            view: Sidebar.SidebarProvider.view,
            viewInputs: {
              side: 'left',
              variant: 'inset',
              collapsible: 'icon',
              // Inside the 420px preview card the upstream `min-h-svh`
              // / `h-svh` (viewport units) overflow. Override to `h-full`
              // so the shell is contained by the transformed preview box.
              className:
                '!min-h-0 !h-full [&_[data-slot=sidebar]]:!h-full [&_[data-slot=sidebar-container]]:!h-full',
              content: (slots) => [
                Sidebar.header({}, [teamSwitcher(model, h, slots.state === 'collapsed')], h),
                Sidebar.content(
                  {},
                  [
                    navMain(h, model.playgroundOpen, slots.state === 'collapsed', model),
                    navProjects(h),
                    secondarySupportGroup(h),
                  ],
                  h,
                ),
                Sidebar.footer({}, [navUser(model, h, slots.state === 'collapsed')], h),
                Sidebar.rail(
                  [h.OnClick(Message.GotSidebarMessage({ message: Sidebar.Message.Toggled() }))],
                  {},
                  h,
                ),
              ],
              children: (slots) => [
                Sidebar.SidebarInset(
                  {},
                  [
                    h.header(
                      [
                        h.Class(
                          'flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
                        ),
                      ],
                      [
                        h.div(
                          [h.Class('flex items-center gap-2 px-4')],
                          [
                            Sidebar.trigger(
                              [
                                h.OnClick(
                                  Message.GotSidebarMessage({ message: Sidebar.Message.Toggled() }),
                                ),
                              ],
                              {},
                              h,
                            ),
                            Sidebar.separator({ className: '-ml-px mr-2 h-4' }, h),
                            h.span(
                              [h.Class('text-sm font-medium')],
                              [
                                slots.state === 'collapsed'
                                  ? 'Collapsed — hover the icons or press ⌘B'
                                  : 'Acme Inc — Playground / Starred',
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                    h.div(
                      [h.Class('flex flex-1 flex-col gap-4 p-4 pt-0')],
                      [
                        h.div(
                          [h.Class('grid auto-rows-min gap-4 md:grid-cols-2')],
                          [
                            h.div([h.Class('rounded-xl bg-muted/50 p-6')], []),
                            h.div([h.Class('rounded-xl bg-muted/50 p-6')], []),
                          ],
                        ),
                        h.div([h.Class('min-h-[160px] flex-1 rounded-xl bg-muted/50')], []),
                      ],
                    ),
                  ],
                  h,
                ),
              ],
            },
            toParentMessage: (message) => Message.GotSidebarMessage({ message }),
          }),
        ],
      ),
    ],
  )

const teamSwitcher = (
  model: Model,
  h: HtmlBuilder<AppMessage>,
  isSidebarCollapsed: boolean,
): Html =>
  Sidebar.menu(
    {},
    [
      Sidebar.menuItem(
        {},
        [
          h.submodel({
            slotId: model.headerMenu.id,
            model: model.headerMenu,
            view: DemoMenu.view,
            viewInputs: Menu.viewInputs<string>({
              items: ['Acme Inc', 'Acme Labs', 'Acme Enterprise'],
              buttonContent: h.span(
                [
                  h.Class(
                    `flex w-full items-center gap-2 ${isSidebarCollapsed ? 'justify-center' : ''}`,
                  ),
                ],
                [
                  h.div(
                    [
                      h.Class(
                        'flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground',
                      ),
                    ],
                    [icon(h, GalleryVerticalEnd, 'size-4')],
                  ),
                  h.div(
                    [
                      h.Class(
                        'grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden',
                      ),
                    ],
                    [
                      h.span([h.Class('truncate font-medium')], ['Acme Inc']),
                      h.span([h.Class('truncate text-xs')], ['Enterprise']),
                    ],
                  ),
                  icon(h, ChevronsUpDown, 'ml-auto group-data-[collapsible=icon]:hidden'),
                ],
              ),
              anchor: { placement: 'right-start', gap: 8 },
              wrapperClass: 'w-full',
              triggerClass: `${Sidebar.sidebarMenuButtonClass} ${Sidebar.sidebarMenuButtonVariantClass.default} ${Sidebar.sidebarMenuButtonSizeClass.lg} ${isSidebarCollapsed ? 'size-8! p-0!' : ''} data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground`,
              itemToConfig: (item) => ({ content: h.span([], [item]) }),
            }),
            toParentMessage: (message) => Message.GotHeaderMenuMessage({ message }),
          }),
        ],
        h,
      ),
    ],
    h,
  )

const navMain = (
  h: HtmlBuilder<AppMessage>,
  playgroundOpen: boolean,
  isSidebarCollapsed: boolean,
  model: Model,
): Html =>
  h.div(
    [],
    [
      Sidebar.group(
        {},
        [
          Sidebar.groupLabel({}, ['Platform'], h),
          Sidebar.menu(
            {},
            [
              collapsibleMenuRow({
                title: 'Playground',
                icon: SquareTerminal,
                subItems: ['History', 'Starred', 'Settings'],
                isOpen: playgroundOpen,
                onToggle: Message.ToggledPlayground(),
                isSidebarCollapsed,
                collapsedTooltip: isSidebarCollapsed
                  ? {
                      model: model.playgroundTooltip,
                      content: 'Playground',
                      toParentMessage: (message) =>
                        Message.GotPlaygroundTooltipMessage({ message }),
                    }
                  : undefined,
                h,
              }),
              collapsibleMenuRow({
                title: 'Models',
                icon: Bot,
                subItems: ['Genesis', 'Explorer', 'Quantum'],
                isSidebarCollapsed,
                collapsedTooltip: isSidebarCollapsed
                  ? {
                      model: model.modelsTooltip,
                      content: 'Models',
                      toParentMessage: (message) => Message.GotModelsTooltipMessage({ message }),
                    }
                  : undefined,
                h,
              }),
              collapsibleMenuRow({
                title: 'Documentation',
                icon: BookOpen,
                subItems: ['Introduction', 'Get Started', 'Tutorials', 'Changelog'],
                isSidebarCollapsed,
                collapsedTooltip: isSidebarCollapsed
                  ? {
                      model: model.documentationTooltip,
                      content: 'Documentation',
                      toParentMessage: (message) =>
                        Message.GotDocumentationTooltipMessage({ message }),
                    }
                  : undefined,
                h,
              }),
              collapsibleMenuRow({
                title: 'Settings',
                icon: Settings2,
                subItems: ['General', 'Team', 'Billing', 'Limits'],
                isSidebarCollapsed,
                collapsedTooltip: isSidebarCollapsed
                  ? {
                      model: model.settingsTooltip,
                      content: 'Settings',
                      toParentMessage: (message) => Message.GotSettingsTooltipMessage({ message }),
                    }
                  : undefined,
                h,
              }),
            ],
            h,
          ),
        ],
        h,
      ),
    ],
  )

const collapsibleMenuRow = (config: {
  title: string
  icon: Parameters<typeof icon>[1]
  subItems: ReadonlyArray<string>
  isOpen?: boolean
  isSidebarCollapsed?: boolean
  onToggle?: AppMessage
  collapsedTooltip?: Sidebar.MenuButtonTooltipConfig<AppMessage>
  h: HtmlBuilder<AppMessage>
}): Html =>
  Sidebar.menuItem(
    {},
    [
      config.h.details(
        [
          config.h.Class('group/collapsible'),
          ...(config.isOpen === true ? [config.h.Attribute('open', '')] : []),
        ],
        [
          config.h.summary(
            [
              config.h.Class(
                `${Sidebar.sidebarMenuButtonClass} ${Sidebar.sidebarMenuButtonVariantClass.default} ${Sidebar.sidebarMenuButtonSizeClass.default} ${config.isSidebarCollapsed === true ? 'size-8! p-0! justify-center!' : ''} list-none`,
              ),
              ...(config.isSidebarCollapsed === true
                ? [
                    config.h.Style({
                      width: '2rem',
                      minWidth: '2rem',
                      maxWidth: '2rem',
                      height: '2rem',
                      padding: '0',
                      justifyContent: 'center',
                    }),
                  ]
                : []),
              config.h.DataAttribute('slot', 'sidebar-menu-button'),
              config.h.DataAttribute('sidebar', 'menu-button'),
              config.h.DataAttribute('size', 'default'),
              ...(config.onToggle === undefined ? [] : [config.h.OnClick(config.onToggle)]),
            ],
            config.isSidebarCollapsed === true
              ? [
                  Sidebar.menuButton(
                    {
                      className: 'size-8! p-0! justify-center!',
                      tooltip: config.collapsedTooltip,
                    },
                    [icon(config.h, config.icon)],
                    config.h,
                  ),
                ]
              : [
                  icon(config.h, config.icon),
                  config.h.span([], [config.title]),
                  icon(
                    config.h,
                    ChevronRight,
                    'ml-auto transition-transform duration-200 group-open/collapsible:rotate-90',
                  ),
                ],
          ),
          Sidebar.menuSub(
            {},
            config.subItems.map((label) =>
              Sidebar.menuSubItem(
                {},
                [
                  Sidebar.menuSubButton(
                    [],
                    { isActive: label === 'Starred' },
                    [config.h.span([], [label])],
                    config.h,
                  ),
                ],
                config.h,
              ),
            ),
            config.h,
          ),
        ],
      ),
    ],
    config.h,
  )

const navProjects = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('group-data-[collapsible=icon]:hidden')],
    [
      Sidebar.group(
        {},
        [
          Sidebar.groupLabel({}, ['Projects'], h),
          Sidebar.menu(
            {},
            [
              projectRow(Frame, 'Design Engineering', h),
              projectRow(PieChart, 'Sales & Marketing', h),
              projectRow(Map, 'Travel', h),
              Sidebar.menuItem(
                {},
                [
                  Sidebar.menuButton(
                    { className: 'text-sidebar-foreground/70' },
                    [icon(h, MoreHorizontal, 'text-sidebar-foreground/70'), h.span([], ['More'])],
                    h,
                  ),
                ],
                h,
              ),
            ],
            h,
          ),
        ],
        h,
      ),
    ],
  )

const projectRow = (
  iconNode: Parameters<typeof icon>[1],
  label: string,
  h: HtmlBuilder<AppMessage>,
): Html =>
  Sidebar.menuItem(
    {},
    [
      Sidebar.menuButton({}, [icon(h, iconNode), h.span([], [label])], h),
      Sidebar.menuAction(
        [],
        { showOnHover: true },
        [icon(h, MoreHorizontal), h.span([h.Class('sr-only')], ['More'])],
        h,
      ),
    ],
    h,
  )

const secondarySupportGroup = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('group-data-[collapsible=icon]:hidden')],
    [
      Sidebar.group(
        {},
        [
          Sidebar.groupLabel({}, ['Support'], h),
          Sidebar.menu(
            {},
            [
              Sidebar.menuItem(
                {},
                [Sidebar.menuButton({}, [icon(h, Sparkles), h.span([], ['What\u2019s new'])], h)],
                h,
              ),
              Sidebar.menuItem(
                {},
                [Sidebar.menuButton({}, [icon(h, Settings2), h.span([], ['Settings'])], h)],
                h,
              ),
            ],
            h,
          ),
        ],
        h,
      ),
    ],
  )

const navUser = (model: Model, h: HtmlBuilder<AppMessage>, isSidebarCollapsed: boolean): Html =>
  Sidebar.menu(
    {},
    [
      Sidebar.menuItem(
        {},
        [
          h.submodel({
            slotId: model.footerMenu.id,
            model: model.footerMenu,
            view: DemoMenu.view,
            viewInputs: Menu.viewInputs<string>({
              items: ['Account', 'Billing', 'Notifications', 'Log out'],
              buttonContent: h.span(
                [
                  h.Class(
                    `flex w-full items-center gap-2 ${isSidebarCollapsed ? 'justify-center' : ''}`,
                  ),
                ],
                [
                  h.span(
                    [
                      h.Class(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold',
                      ),
                    ],
                    ['CN'],
                  ),
                  h.div(
                    [
                      h.Class(
                        'grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden',
                      ),
                    ],
                    [
                      h.span([h.Class('truncate font-medium')], ['shadcn']),
                      h.span([h.Class('truncate text-xs')], ['m@example.com']),
                    ],
                  ),
                  icon(h, ChevronsUpDown, 'ml-auto size-4 group-data-[collapsible=icon]:hidden'),
                ],
              ),
              anchor: { placement: 'right-start', gap: 8 },
              wrapperClass: 'w-full',
              triggerClass: `${Sidebar.sidebarMenuButtonClass} ${Sidebar.sidebarMenuButtonVariantClass.default} ${Sidebar.sidebarMenuButtonSizeClass.lg} ${isSidebarCollapsed ? 'size-8! p-0!' : ''} data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground`,
              itemToConfig: (item) => ({ content: h.span([], [item]) }),
            }),
            toParentMessage: (message) => Message.GotFooterMenuMessage({ message }),
          }),
        ],
        h,
      ),
    ],
    h,
  )

const fields = {
  sidebar: Sidebar.Model,
  headerMenu: Menu.Model,
  footerMenu: Menu.Model,
  playgroundOpen: S.Boolean,
  playgroundTooltip: Tooltip.Model,
  modelsTooltip: Tooltip.Model,
  documentationTooltip: Tooltip.Model,
  settingsTooltip: Tooltip.Model,
}
const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

const foldSidebar = Update.foldChild({
  update: Sidebar.update,
  read: (model: State) => Option.some(model.sidebar),
  write: (model, next) => modifyFields(model, { sidebar: () => next }),
  toParentMessage: (message) => Message.GotSidebarMessage({ message }),
})

const foldMenuOutMessage = M.type<Menu.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected: () => (model) => ({ model }),
  }),
)

const foldHeaderMenu = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.headerMenu),
  write: (model, next) => modifyFields(model, { headerMenu: () => next }),
  toParentMessage: (message) => Message.GotHeaderMenuMessage({ message }),
  foldOutMessage: foldMenuOutMessage,
})

const foldFooterMenu = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.footerMenu),
  write: (model, next) => modifyFields(model, { footerMenu: () => next }),
  toParentMessage: (message) => Message.GotFooterMenuMessage({ message }),
  foldOutMessage: foldMenuOutMessage,
})

const foldTooltipOutMessage = M.type<Tooltip.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Shown: () => (model) => ({ model }),
    Hidden: () => (model) => ({ model }),
  }),
)

const foldPlaygroundTooltip = Update.foldChild({
  update: Tooltip.update,
  read: (model: State) => Option.some(model.playgroundTooltip),
  write: (model, next) => modifyFields(model, { playgroundTooltip: () => next }),
  toParentMessage: (message) => Message.GotPlaygroundTooltipMessage({ message }),
  foldOutMessage: foldTooltipOutMessage,
})

const foldModelsTooltip = Update.foldChild({
  update: Tooltip.update,
  read: (model: State) => Option.some(model.modelsTooltip),
  write: (model, next) => modifyFields(model, { modelsTooltip: () => next }),
  toParentMessage: (message) => Message.GotModelsTooltipMessage({ message }),
  foldOutMessage: foldTooltipOutMessage,
})

const foldDocumentationTooltip = Update.foldChild({
  update: Tooltip.update,
  read: (model: State) => Option.some(model.documentationTooltip),
  write: (model, next) => modifyFields(model, { documentationTooltip: () => next }),
  toParentMessage: (message) => Message.GotDocumentationTooltipMessage({ message }),
  foldOutMessage: foldTooltipOutMessage,
})

const foldSettingsTooltip = Update.foldChild({
  update: Tooltip.update,
  read: (model: State) => Option.some(model.settingsTooltip),
  write: (model, next) => modifyFields(model, { settingsTooltip: () => next }),
  toParentMessage: (message) => Message.GotSettingsTooltipMessage({ message }),
  foldOutMessage: foldTooltipOutMessage,
})

const resetTooltips = (model: State): State =>
  modifyFields(model, {
    playgroundTooltip: () => Tooltip.init({ id: 'sidebar-playground-tooltip' }),
    modelsTooltip: () => Tooltip.init({ id: 'sidebar-models-tooltip' }),
    documentationTooltip: () => Tooltip.init({ id: 'sidebar-documentation-tooltip' }),
    settingsTooltip: () => Tooltip.init({ id: 'sidebar-settings-tooltip' }),
  })

export const subscriptions = Subscription.lift(Sidebar.subscriptions)<
  State,
  typeof Message.GotSidebarMessage.Type
>({
  toChildModel: (model) => model.sidebar,
  toParentMessage: (message) => Message.GotSidebarMessage({ message }),
})

export const slice = defineSlice({
  fields,
  init: {
    sidebar: Sidebar.init({
      id: 'sidebar-demo',
      defaultOpen: true,
      cookieName: 'foldcn-sidebar-demo',
    }),
    headerMenu: Menu.init({ id: 'sidebar-header-menu' }),
    footerMenu: Menu.init({ id: 'sidebar-footer-menu' }),
    playgroundOpen: true,
    playgroundTooltip: Tooltip.init({ id: 'sidebar-playground-tooltip' }),
    modelsTooltip: Tooltip.init({ id: 'sidebar-models-tooltip' }),
    documentationTooltip: Tooltip.init({ id: 'sidebar-documentation-tooltip' }),
    settingsTooltip: Tooltip.init({ id: 'sidebar-settings-tooltip' }),
  },
  messages: [
    Message.GotSidebarMessage,
    Message.GotHeaderMenuMessage,
    Message.GotFooterMenuMessage,
    Message.GotPlaygroundTooltipMessage,
    Message.GotModelsTooltipMessage,
    Message.GotDocumentationTooltipMessage,
    Message.GotSettingsTooltipMessage,
    Message.ToggledPlayground,
  ],
  handlers: (model: State) => ({
    GotSidebarMessage: (payload: typeof Message.GotSidebarMessage.Type): UpdateReturn =>
      foldSidebar(
        payload.message._tag === 'Toggled' ? resetTooltips(model) : model,
        payload.message,
      ),
    GotHeaderMenuMessage: (payload: typeof Message.GotHeaderMenuMessage.Type): UpdateReturn =>
      foldHeaderMenu(model, payload.message),
    GotFooterMenuMessage: (payload: typeof Message.GotFooterMenuMessage.Type): UpdateReturn =>
      foldFooterMenu(model, payload.message),
    GotPlaygroundTooltipMessage: (
      payload: typeof Message.GotPlaygroundTooltipMessage.Type,
    ): UpdateReturn => foldPlaygroundTooltip(model, payload.message),
    GotModelsTooltipMessage: (payload: typeof Message.GotModelsTooltipMessage.Type): UpdateReturn =>
      foldModelsTooltip(model, payload.message),
    GotDocumentationTooltipMessage: (
      payload: typeof Message.GotDocumentationTooltipMessage.Type,
    ): UpdateReturn => foldDocumentationTooltip(model, payload.message),
    GotSettingsTooltipMessage: (
      payload: typeof Message.GotSettingsTooltipMessage.Type,
    ): UpdateReturn => foldSettingsTooltip(model, payload.message),
    ToggledPlayground: (): UpdateReturn => ({
      model: modifyFields(model, { playgroundOpen: () => !model.playgroundOpen }),
    }),
  }),
  samples: [Message.GotSidebarMessage({ message: Sidebar.Message.Toggled() })],
  subscriptions,
})
