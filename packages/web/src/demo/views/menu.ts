import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { modifyFields } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { CreditCard, LogOut, Settings, User } from 'lucide'

import { Menu as FoldkitMenu } from '@foldkit/ui'

import * as menu from '../../generated/registry/ui/menu'
import { icon } from '../../generated/registry/lib/icons'

import { DemoMenu } from '../bundles'
import { keepOpenOnSelect, subMenu } from '../menu-family'
import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'
import { cn } from '../../generated/registry/lib/utils'

export const Message = defineMessageUnion({
  GotBasicMenuMessage: { message: menu.Message },
  GotShortcutsMenuMessage: { message: menu.Message },
  GotIconsMenuMessage: { message: menu.Message },
  GotChecksMenuMessage: { message: menu.Message },
  GotRadioMenuMessage: { message: menu.Message },
  GotComplexMenuMessage: { message: menu.Message },
  GotComplexSubMenuMessage: { message: menu.Message },
  OpenedComplexSubMenu: {},
  ClosedComplexSubMenu: {},
})

// Sections mirror apps/v4/examples/base/dropdown-menu-*.tsx. The foldkit
// primitive's item config is `{ className, content }` over one flat level, so
// the item kinds are built here from foldcn helpers:
//   - destructive / inset rows: `menuItemDestructiveClass` / `menuItemInsetClass`.
//   - checkbox / radio rows: `menuItemIndicator` plus `menu.reopen` in the fold,
//     which keeps the panel open after the primitive's close-on-select.
//   - submenu: a nested `menu.subViewInputs` bundle rendered as the content of
//     the parent row; the slice below opens/closes it and wires the keys.
// The status line below reports the last selection.

const BASIC_ITEMS = ['Profile', 'Billing', 'Settings', 'GitHub', 'Support', 'API'] as const

const basicGroupKey = (item: string): string =>
  item === 'Profile' || item === 'Billing' || item === 'Settings' ? 'account' : 'links'

const SHORTCUT_ITEMS = ['Profile', 'Billing', 'Settings', 'Log out'] as const
const SHORTCUTS = new Map<string, string>([
  ['Profile', '⇧⌘P'],
  ['Billing', '⌘B'],
  ['Settings', '⌘S'],
  ['Log out', '⇧⌘Q'],
])

const ICON_ITEMS = ['Profile', 'Billing', 'Settings', 'Documentation', 'Log out'] as const

const ICONS = new Map<string, typeof User>([
  ['Profile', User],
  ['Billing', CreditCard],
  ['Settings', Settings],
  ['Log out', LogOut],
])

const CHECK_ITEMS = ['Status Bar', 'Activity Bar', 'Panel'] as const

const RADIO_ITEMS = ['Top', 'Bottom', 'Right'] as const

const COMPLEX_ITEMS = [
  'Profile',
  'Billing',
  'Settings',
  'Invite users',
  'New Team',
  'GitHub',
  'Support',
  'API',
  'Log out',
] as const

const COMPLEX_SUB_INDEX = COMPLEX_ITEMS.indexOf('Invite users')
const SUB_ITEMS = ['Email', 'Message', 'More...'] as const

const COMPLEX_SHORTCUTS = new Map<string, string>([
  ['Profile', '⇧⌘P'],
  ['Billing', '⌘B'],
  ['Settings', '⌘S'],
  ['New Team', '⌘+T'],
  ['Log out', '⇧⌘Q'],
])

const complexGroupKey = (item: string): string => {
  if (item === 'Profile' || item === 'Billing' || item === 'Settings') return 'account'
  if (item === 'Invite users' || item === 'New Team') return 'team'
  if (item === 'GitHub' || item === 'Support' || item === 'API') return 'links'
  return 'logout'
}

const withShortcut = (
  h: HtmlBuilder<AppMessage>,
  label: string,
  shortcut: string | undefined,
): Html =>
  shortcut === undefined
    ? h.span([], [label])
    : h.span(
        [h.Class('flex w-full items-center gap-2')],
        [h.span([], [label]), h.span([h.Class(menu.menuShortcutClass)], [shortcut])],
      )

const fields = {
  basicMenu: menu.Model,
  shortcutsMenu: menu.Model,
  iconsMenu: menu.Model,
  checksMenu: menu.Model,
  radioMenu: menu.Model,
  complexMenu: menu.Model,
  complexSubMenu: menu.Model,
  showStatusBar: S.Boolean,
  showPanel: S.Boolean,
  panelPosition: S.String,
  lastMenuAction: S.String,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

const checkOn = (model: State, item: string): boolean => {
  if (item === 'Status Bar') return model.showStatusBar
  if (item === 'Panel') return model.showPanel
  return false
}

const statusLine = (model: State): string => {
  const checks = CHECK_ITEMS.map((item) => `${item} ${checkOn(model, item) ? 'on' : 'off'}`).join(
    ' · ',
  )
  return `Last action: ${model.lastMenuAction} · Appearance: ${checks} · Panel: ${model.panelPosition}`
}

export const menuView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.p([h.Class('px-1 text-xs text-muted-foreground')], [statusLine(model)]),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.submodel({
            slotId: model.basicMenu.id,
            model: model.basicMenu,
            view: DemoMenu.view,
            viewInputs: menu.viewInputs<string>({
              items: BASIC_ITEMS,
              buttonContent: h.span([], ['Open']),
              itemGroupKey: (item) => basicGroupKey(item),
              groupToHeading: (groupKey) =>
                groupKey === 'account' ? { content: h.span([], ['My Account']) } : undefined,
              isItemDisabled: (item) => item === 'API',
              itemToConfig: (item, { isActive }) => ({
                className: isActive ? 'font-medium' : '',
                content: h.span([], [item]),
              }),
            }),
            toParentMessage: (message) => Message.GotBasicMenuMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Shortcuts']),
          h.submodel({
            slotId: model.shortcutsMenu.id,
            model: model.shortcutsMenu,
            view: DemoMenu.view,
            viewInputs: menu.viewInputs<string>({
              items: SHORTCUT_ITEMS,
              buttonContent: h.span([], ['Open']),
              itemsClass: 'w-44',
              itemToConfig: (item) => ({
                content: withShortcut(h, item, SHORTCUTS.get(item)),
              }),
            }),
            toParentMessage: (message) => Message.GotShortcutsMenuMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div(
            [h.Class('px-1 text-xs font-medium text-muted-foreground')],
            ['With Icons & Destructive'],
          ),
          h.submodel({
            slotId: model.iconsMenu.id,
            model: model.iconsMenu,
            view: DemoMenu.view,
            viewInputs: menu.viewInputs<string>({
              items: ICON_ITEMS,
              buttonContent: h.span([], ['Open']),
              itemsClass: 'w-44',
              isItemDisabled: (item) => item === 'Billing',
              itemToConfig: (item) => ({
                className:
                  item === 'Log out'
                    ? menu.menuItemDestructiveClass
                    : item === 'Documentation'
                      ? menu.menuItemInsetClass
                      : '',
                content:
                  item === 'Documentation'
                    ? h.span([], [item])
                    : h.span(
                        [h.Class('flex w-full items-center gap-2')],
                        [icon(h, ICONS.get(item) ?? User), h.span([], [item])],
                      ),
              }),
            }),
            toParentMessage: (message) => Message.GotIconsMenuMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Checkboxes']),
          h.submodel({
            slotId: model.checksMenu.id,
            model: model.checksMenu,
            view: DemoMenu.view,
            viewInputs: menu.viewInputs<string>({
              items: CHECK_ITEMS,
              buttonContent: h.span([], ['Open']),
              itemsClass: 'w-40',
              itemGroupKey: () => 'appearance',
              groupToHeading: () => ({ content: h.span([], ['Appearance']) }),
              isItemDisabled: (item) => item === 'Activity Bar',
              itemToConfig: (item) => ({
                className: menu.menuCheckboxItemClass,
                content: h.span(
                  [h.Class('contents')],
                  [item, menu.menuItemIndicator(h, checkOn(model, item))],
                ),
              }),
            }),
            toParentMessage: (message) => Message.GotChecksMenuMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Radio Group']),
          h.submodel({
            slotId: model.radioMenu.id,
            model: model.radioMenu,
            view: DemoMenu.view,
            viewInputs: menu.viewInputs<string>({
              items: RADIO_ITEMS,
              buttonContent: h.span([], ['Open']),
              itemsClass: 'w-32',
              itemGroupKey: () => 'position',
              groupToHeading: () => ({ content: h.span([], ['Panel Position']) }),
              itemToConfig: (item) => ({
                className: menu.menuRadioItemClass,
                content: h.span(
                  [h.Class('contents')],
                  [item, menu.menuItemIndicator(h, model.panelPosition === item)],
                ),
              }),
            }),
            toParentMessage: (message) => Message.GotRadioMenuMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Complex']),
          h.submodel({
            slotId: model.complexMenu.id,
            model: model.complexMenu,
            view: DemoMenu.view,
            viewInputs: menu.viewInputs<string>({
              items: COMPLEX_ITEMS,
              buttonContent: h.span([], ['Open']),
              itemsClass: 'w-44',
              itemGroupKey: (item) => complexGroupKey(item),
              groupToHeading: (groupKey) =>
                groupKey === 'account' ? { content: h.span([], ['My Account']) } : undefined,
              isItemDisabled: (item) => item === 'API',
              contentAttributes: complexSub.parentKeys(h, model, Message.OpenedComplexSubMenu()),
              itemToConfig: (item) =>
                item === 'Invite users'
                  ? {
                      className: cn(
                        menu.menuSubTriggerClass,
                        model.complexSubMenu.isOpen && menu.menuSubTriggerOpenClass,
                      ),
                      content: h.submodel({
                        slotId: model.complexSubMenu.id,
                        model: model.complexSubMenu,
                        view: DemoMenu.view,
                        viewInputs: menu.subViewInputs<string>({
                          items: SUB_ITEMS,
                          buttonContent: h.span(
                            [h.Class('flex w-full items-center')],
                            [h.span([], [item]), menu.menuSubTriggerChevron(h)],
                          ),
                          itemsClass: 'w-36',
                          itemToConfig: (subItem) => ({ content: h.span([], [subItem]) }),
                          contentAttributes: complexSub.subKeys(h, Message.ClosedComplexSubMenu()),
                        }),
                        toParentMessage: (message) => Message.GotComplexSubMenuMessage({ message }),
                      }),
                    }
                  : { content: withShortcut(h, item, COMPLEX_SHORTCUTS.get(item)) },
            }),
            toParentMessage: (message) => Message.GotComplexMenuMessage({ message }),
          }),
        ],
      ),
    ],
  )

const recordSelection = (menuName: string, value: string) => (model: State) => ({
  model: modifyFields(model, { lastMenuAction: () => `${menuName}: ${value}` }),
})

const foldOutMessage = (menuName: string) =>
  M.type<FoldkitMenu.OutMessage>().pipe(
    M.withReturnType<Update.Step<State, unknown>>(),
    M.tagsExhaustive({ Selected: ({ value }) => recordSelection(menuName, value) }),
  )

// Checkbox/radio rows keep the panel open: the slice applies the toggle for
// `SelectedItem` and never forwards it to the primitive (`keepOpenOnSelect`).
const toggleCheck =
  (item: string): Update.Step<State, AppMessage> =>
  (model) => ({
    model: modifyFields(model, {
      showStatusBar: () => (item === 'Status Bar' ? !model.showStatusBar : model.showStatusBar),
      showPanel: () => (item === 'Panel' ? !model.showPanel : model.showPanel),
      lastMenuAction: () => `Appearance: ${item}`,
    }),
  })

const selectRadio =
  (item: string): Update.Step<State, AppMessage> =>
  (model) => ({
    model: modifyFields(model, {
      panelPosition: () => item,
      lastMenuAction: () => `Panel position: ${item}`,
    }),
  })

const foldBasic = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.basicMenu),
  write: (model, next) => modifyFields(model, { basicMenu: () => next }),
  toParentMessage: (message) => Message.GotBasicMenuMessage({ message }),
  foldOutMessage: foldOutMessage('Basic'),
})

const foldShortcuts = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.shortcutsMenu),
  write: (model, next) => modifyFields(model, { shortcutsMenu: () => next }),
  toParentMessage: (message) => Message.GotShortcutsMenuMessage({ message }),
  foldOutMessage: foldOutMessage('Shortcuts'),
})

const foldIcons = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.iconsMenu),
  write: (model, next) => modifyFields(model, { iconsMenu: () => next }),
  toParentMessage: (message) => Message.GotIconsMenuMessage({ message }),
  foldOutMessage: foldOutMessage('Icons'),
})

const foldChecks = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.checksMenu),
  write: (model, next) => modifyFields(model, { checksMenu: () => next }),
  toParentMessage: (message) => Message.GotChecksMenuMessage({ message }),
  foldOutMessage: foldOutMessage('Appearance'),
})

const foldRadio = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.radioMenu),
  write: (model, next) => modifyFields(model, { radioMenu: () => next }),
  toParentMessage: (message) => Message.GotRadioMenuMessage({ message }),
  foldOutMessage: foldOutMessage('Panel position'),
})

// The Complex menu's "Invite users" row opens a nested menu; `subMenu` owns the
// coordination (see menu-family.ts).
const complexSub = subMenu<State, AppMessage>({
  readParent: (model) => model.complexMenu,
  writeParent: (model, next) => modifyFields(model, { complexMenu: () => next }),
  readSub: (model) => model.complexSubMenu,
  writeSub: (model, next) => modifyFields(model, { complexSubMenu: () => next }),
  toParentMessage: (message) => Message.GotComplexMenuMessage({ message }),
  toSubMessage: (message) => Message.GotComplexSubMenuMessage({ message }),
  subIndex: COMPLEX_SUB_INDEX,
  foldParentSelected: foldOutMessage('Complex'),
  foldSubSelected: foldOutMessage('Complex › Invite users'),
})

export const slice = defineSlice({
  fields,
  init: {
    basicMenu: menu.init({ id: 'menu-basic' }),
    shortcutsMenu: menu.init({ id: 'menu-shortcuts' }),
    iconsMenu: menu.init({ id: 'menu-icons' }),
    checksMenu: menu.init({ id: 'menu-checks' }),
    radioMenu: menu.init({ id: 'menu-radio' }),
    complexMenu: menu.init({ id: 'menu-complex' }),
    complexSubMenu: menu.init({ id: 'menu-complex-sub', isAnimated: false }),
    showStatusBar: true,
    showPanel: false,
    panelPosition: 'bottom',
    lastMenuAction: 'none yet',
  },
  messages: [
    Message.GotBasicMenuMessage,
    Message.GotShortcutsMenuMessage,
    Message.GotIconsMenuMessage,
    Message.GotChecksMenuMessage,
    Message.GotRadioMenuMessage,
    Message.GotComplexMenuMessage,
    Message.GotComplexSubMenuMessage,
    Message.OpenedComplexSubMenu,
    Message.ClosedComplexSubMenu,
  ],
  handlers: (model: State) => ({
    GotBasicMenuMessage: (payload: typeof Message.GotBasicMenuMessage.Type): UpdateReturn =>
      foldBasic(model, payload.message),
    GotShortcutsMenuMessage: (payload: typeof Message.GotShortcutsMenuMessage.Type): UpdateReturn =>
      foldShortcuts(model, payload.message),
    GotIconsMenuMessage: (payload: typeof Message.GotIconsMenuMessage.Type): UpdateReturn =>
      foldIcons(model, payload.message),
    GotChecksMenuMessage: (payload: typeof Message.GotChecksMenuMessage.Type): UpdateReturn =>
      keepOpenOnSelect<State, AppMessage>({
        items: CHECK_ITEMS,
        readMenu: (state) => state.checksMenu,
        isKept: () => true,
        onSelected: toggleCheck,
        forward: (state, message) => foldChecks(state, message),
      })(model, payload.message),
    GotRadioMenuMessage: (payload: typeof Message.GotRadioMenuMessage.Type): UpdateReturn =>
      keepOpenOnSelect<State, AppMessage>({
        items: RADIO_ITEMS,
        readMenu: (state) => state.radioMenu,
        isKept: () => true,
        onSelected: selectRadio,
        forward: (state, message) => foldRadio(state, message),
      })(model, payload.message),
    GotComplexMenuMessage: (payload: typeof Message.GotComplexMenuMessage.Type): UpdateReturn =>
      complexSub.handleParent(model, payload.message),
    GotComplexSubMenuMessage: (
      payload: typeof Message.GotComplexSubMenuMessage.Type,
    ): UpdateReturn => complexSub.handleSub(model, payload.message),
    OpenedComplexSubMenu: (): UpdateReturn => complexSub.openSub(model),
    ClosedComplexSubMenu: (): UpdateReturn => complexSub.closeSub(model),
  }),
  samples: [],
})
