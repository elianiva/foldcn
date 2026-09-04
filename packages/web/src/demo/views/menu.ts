import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Check, CreditCard, LogOut, Settings, User } from 'lucide'

import { Menu as FoldkitMenu } from '@foldkit/ui'

import * as menu from '../../generated/registry/ui/menu'
import { icon } from '../../generated/registry/lib/icons'

import { DemoMenu } from '../bundles'
import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

export const Message = defineMessageUnion({
  GotBasicMenuMessage: { message: menu.Message },
  GotShortcutsMenuMessage: { message: menu.Message },
  GotIconsMenuMessage: { message: menu.Message },
  GotChecksMenuMessage: { message: menu.Message },
  GotRadioMenuMessage: { message: menu.Message },
  GotComplexMenuMessage: { message: menu.Message },
})

// Sections mirror apps/v4/examples/base/dropdown-menu-*.tsx. The foldkit
// primitive has flat items only (no submenu/checkbox/radio kinds), so the
// submenu rows from upstream render as labelled groups, and the
// checkbox/radio rows render check indicators from demo-owned state (see
// gapsByItem.menu). Every row is selectable; the status line below reports
// the last selection. Checkbox/radio selections toggle demo state and close
// the panel — upstream keeps the panel open, which needs primitive support.

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

const ICON_ITEMS = ['Profile', 'Billing', 'Settings', 'Log out'] as const

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
  'Team',
  'Email',
  'Message',
  'More...',
  'New Team',
  'GitHub',
  'Support',
  'API',
  'Log out',
] as const

const COMPLEX_SHORTCUTS = new Map<string, string>([
  ['Profile', '⇧⌘P'],
  ['Billing', '⌘B'],
  ['Settings', '⌘S'],
  ['New Team', '⌘+T'],
  ['Log out', '⇧⌘Q'],
])

const complexGroupKey = (item: string): string => {
  if (item === 'Profile' || item === 'Billing' || item === 'Settings') return 'account'
  if (item === 'Team' || item === 'Email' || item === 'Message' || item === 'More...') return 'team'
  if (item === 'New Team') return 'new-team'
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
              isItemDisabled: (item) => item === 'Billing',
              itemToConfig: (item) => ({
                className:
                  item === 'Log out'
                    ? 'text-destructive data-active:bg-destructive/10 data-active:text-destructive dark:data-active:bg-destructive/20 [&_svg]:text-destructive'
                    : '',
                content: h.span(
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
                content: h.span(
                  [h.Class('flex w-full items-center gap-2')],
                  [
                    h.span(
                      [h.Class('flex w-4 shrink-0 items-center justify-center')],
                      [...(checkOn(model, item) ? [icon(h, Check, 'size-4')] : [])],
                    ),
                    h.span([], [item]),
                  ],
                ),
              }),
            }),
            toParentMessage: (message) => Message.GotChecksMenuMessage({ message }),
          }),
          h.p(
            [h.Class('px-1 text-xs text-muted-foreground')],
            ['Toggling a row closes the panel — upstream keeps it open (primitive gap).'],
          ),
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
                content: h.span(
                  [h.Class('flex w-full items-center gap-2')],
                  [
                    h.span(
                      [h.Class('flex w-4 shrink-0 items-center justify-center')],
                      [...(model.panelPosition === item ? [icon(h, Check, 'size-4')] : [])],
                    ),
                    h.span([], [item]),
                  ],
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
              groupToHeading: (groupKey) => {
                if (groupKey === 'account') return { content: h.span([], ['My Account']) }
                // Upstream nests these under an "Invite users" submenu;
                // without a submenu primitive they render as a labelled group.
                if (groupKey === 'team') return { content: h.span([], ['Invite users']) }
                return undefined
              },
              isItemDisabled: (item) => item === 'API',
              itemToConfig: (item) => ({
                content: withShortcut(h, item, COMPLEX_SHORTCUTS.get(item)),
              }),
            }),
            toParentMessage: (message) => Message.GotComplexMenuMessage({ message }),
          }),
        ],
      ),
    ],
  )

const recordSelection = (menuName: string, value: string) => (model: State) => ({
  model: evo(model, { lastMenuAction: () => `${menuName}: ${value}` }),
})

const foldOutMessage = (menuName: string) =>
  M.type<FoldkitMenu.OutMessage>().pipe(
    M.withReturnType<Update.Step<State, unknown>>(),
    M.tagsExhaustive({ Selected: ({ value }) => recordSelection(menuName, value) }),
  )

const foldChecksOutMessage = M.type<FoldkitMenu.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => ({
        model: evo(model, {
          showStatusBar: () =>
            value === 'Status Bar' ? !model.showStatusBar : model.showStatusBar,
          showPanel: () => (value === 'Panel' ? !model.showPanel : model.showPanel),
          lastMenuAction: () => `Appearance: ${value}`,
        }),
      }),
  }),
)

const foldRadioOutMessage = M.type<FoldkitMenu.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => ({
        model: evo(model, {
          panelPosition: () => value,
          lastMenuAction: () => `Panel position: ${value}`,
        }),
      }),
  }),
)

const foldBasic = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.basicMenu),
  write: (model, next) => evo(model, { basicMenu: () => next }),
  toParentMessage: (message) => Message.GotBasicMenuMessage({ message }),
  foldOutMessage: foldOutMessage('Basic'),
})

const foldShortcuts = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.shortcutsMenu),
  write: (model, next) => evo(model, { shortcutsMenu: () => next }),
  toParentMessage: (message) => Message.GotShortcutsMenuMessage({ message }),
  foldOutMessage: foldOutMessage('Shortcuts'),
})

const foldIcons = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.iconsMenu),
  write: (model, next) => evo(model, { iconsMenu: () => next }),
  toParentMessage: (message) => Message.GotIconsMenuMessage({ message }),
  foldOutMessage: foldOutMessage('Icons'),
})

const foldChecks = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.checksMenu),
  write: (model, next) => evo(model, { checksMenu: () => next }),
  toParentMessage: (message) => Message.GotChecksMenuMessage({ message }),
  foldOutMessage: foldChecksOutMessage,
})

const foldRadio = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.radioMenu),
  write: (model, next) => evo(model, { radioMenu: () => next }),
  toParentMessage: (message) => Message.GotRadioMenuMessage({ message }),
  foldOutMessage: foldRadioOutMessage,
})

const foldComplex = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.complexMenu),
  write: (model, next) => evo(model, { complexMenu: () => next }),
  toParentMessage: (message) => Message.GotComplexMenuMessage({ message }),
  foldOutMessage: foldOutMessage('Complex'),
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
  ],
  handlers: (model: State) => ({
    GotBasicMenuMessage: (payload: typeof Message.GotBasicMenuMessage.Type): UpdateReturn =>
      foldBasic(model, payload.message),
    GotShortcutsMenuMessage: (payload: typeof Message.GotShortcutsMenuMessage.Type): UpdateReturn =>
      foldShortcuts(model, payload.message),
    GotIconsMenuMessage: (payload: typeof Message.GotIconsMenuMessage.Type): UpdateReturn =>
      foldIcons(model, payload.message),
    GotChecksMenuMessage: (payload: typeof Message.GotChecksMenuMessage.Type): UpdateReturn =>
      foldChecks(model, payload.message),
    GotRadioMenuMessage: (payload: typeof Message.GotRadioMenuMessage.Type): UpdateReturn =>
      foldRadio(model, payload.message),
    GotComplexMenuMessage: (payload: typeof Message.GotComplexMenuMessage.Type): UpdateReturn =>
      foldComplex(model, payload.message),
  }),
  samples: [],
})
