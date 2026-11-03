import { Update } from 'foldkit'
import { Option } from 'effect'
import { Schema as S } from 'effect'
import { modifyFields } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Clipboard, Copy, Scissors, Trash2 } from 'lucide'

import { Menu as FoldkitMenu } from '@foldkit/ui'

import * as ContextMenu from '../../generated/registry/ui/context-menu'
import { icon } from '../../generated/registry/lib/icons'
import { DemoMenu } from '../bundles'
import { keepOpenOnSelect, subMenu } from '../menu-family'
import { cn } from '../../generated/registry/lib/utils'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

export const Message = defineMessageUnion({
  GotCtxBasicMenuMessage: { message: ContextMenu.Message },
  GotCtxIconsMenuMessage: { message: ContextMenu.Message },
  GotCtxTopMenuMessage: { message: ContextMenu.Message },
  RecordedCtxPoint: { maybePoint: S.Option(ContextMenu.Point) },
  GotCtxBasicSubMenuMessage: { message: ContextMenu.Message },
  OpenedCtxBasicSubMenu: {},
  ClosedCtxBasicSubMenu: {},
})

// Sections mirror apps/v4/examples/base/context-menu-demo.tsx. Right-click on
// a region opens its menu: foldkit's `h.OnContextMenu` suppresses the native
// menu and the handler injects the primitive's `Opened` message. The panel
// anchors to the pointer: pointerdown (right button, or touch/pen) records the
// client point in `ctxPoint`, which moves the zero-size trigger there before
// the menu opens. Keyboard open (Tab to the trigger, Enter/ArrowDown) has no
// point and anchors to the region. Item kinds are foldcn-built over the
// primitive's flat `{ className, content }` rows: the checkbox/radio rows keep
// the panel open (`keepOpenOnSelect`), "More Tools" is a nested menu
// (`subMenu`), and Delete uses the destructive row class. See menu-family.ts.

const BASIC_ITEMS = [
  'Back',
  'Forward',
  'Reload',
  'More Tools',
  'Show Bookmarks',
  'Show Full URLs',
  'Pedro Duarte',
  'Colm Tuite',
] as const

const BASIC_SUB_INDEX = BASIC_ITEMS.indexOf('More Tools')
const BASIC_SUB_ITEMS = [
  'Save Page...',
  'Create Shortcut...',
  'Name Window...',
  'Developer Tools',
  'Delete',
] as const

const BASIC_SHORTCUTS = new Map<string, string>([
  ['Back', '⌘['],
  ['Forward', '⌘]'],
  ['Reload', '⌘R'],
])

const basicGroupKey = (item: string): string => {
  if (item === 'Back' || item === 'Forward' || item === 'Reload') return 'nav'
  if (item === 'More Tools') return 'tools'
  if (item === 'Show Bookmarks' || item === 'Show Full URLs') return 'appearance'
  return 'people'
}

const ICON_ITEMS = ['Copy', 'Cut', 'Paste', 'Delete'] as const

const ICONS = new Map<string, typeof Copy>([
  ['Copy', Copy],
  ['Cut', Scissors],
  ['Paste', Clipboard],
  ['Delete', Trash2],
])

const ICON_SHORTCUTS = new Map<string, string>([
  ['Copy', '⌘C'],
  ['Cut', '⌘X'],
  ['Paste', '⌘V'],
  ['Delete', '⌫'],
])

const TOP_ITEMS = ['Back', 'Forward', 'Reload'] as const

const fields = {
  ctxPoint: S.Option(ContextMenu.Point),
  ctxBasicMenu: ContextMenu.Model,
  ctxIconsMenu: ContextMenu.Model,
  ctxTopMenu: ContextMenu.Model,
  ctxBasicSubMenu: ContextMenu.Model,
  showBookmarks: S.Boolean,
  showFullUrls: S.Boolean,
  person: S.String,
  lastContextAction: S.String,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

const basicCheckOn = (model: State, item: string): boolean => {
  if (item === 'Show Bookmarks') return model.showBookmarks
  if (item === 'Show Full URLs') return model.showFullUrls
  return false
}

const isBasicRadio = (item: string): boolean => item === 'Pedro Duarte' || item === 'Colm Tuite'

const basicItemConfig = (
  model: State,
  h: HtmlBuilder<AppMessage>,
  item: string,
): ContextMenu.ItemConfig => {
  const shortcut = BASIC_SHORTCUTS.get(item)
  if (item === 'Show Bookmarks' || item === 'Show Full URLs') {
    return {
      className: ContextMenu.contextMenuCheckboxItemClass,
      content: h.span(
        [h.Class('contents')],
        [item, ContextMenu.contextMenuItemIndicator(h, basicCheckOn(model, item))],
      ),
    }
  }
  if (isBasicRadio(item)) {
    return {
      className: ContextMenu.contextMenuRadioItemClass,
      content: h.span(
        [h.Class('contents')],
        [item, ContextMenu.contextMenuItemIndicator(h, model.person === item)],
      ),
    }
  }
  return {
    content:
      shortcut === undefined
        ? h.span([], [item])
        : h.span(
            [h.Class('flex w-full items-center gap-2')],
            [
              h.span([], [item]),
              h.span([h.Class(ContextMenu.contextMenuShortcutClass)], [shortcut]),
            ],
          ),
  }
}

// Region wiring shared by the three demos: keydown clears the stale point so
// a keyboard open anchors to the region, pointerdown records the new one.
const regionAttributes = (h: HtmlBuilder<AppMessage>, opened: AppMessage) => [
  h.OnPointerDown((pointerType, button, _sx, _sy, _t, clientX, clientY) =>
    Option.some(
      Message.RecordedCtxPoint({
        maybePoint: ContextMenu.pointFromPointerDown(pointerType, button, clientX, clientY),
      }),
    ),
  ),
  h.OnKeyDown(() => Message.RecordedCtxPoint({ maybePoint: Option.none() })),
  h.OnContextMenu(opened),
]

const pointWhileOpen = (
  menu: ContextMenu.Model,
  point: Option.Option<ContextMenu.Point>,
): Option.Option<ContextMenu.Point> => (menu.isOpen ? point : Option.none())

export const contextMenuView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.p(
        [h.Class('px-1 text-xs text-muted-foreground')],
        [
          `Last action: ${model.lastContextAction} · Bookmarks ${model.showBookmarks ? 'on' : 'off'} · Full URLs ${model.showFullUrls ? 'on' : 'off'} · Person: ${model.person}`,
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.div(
            [
              h.Class(
                'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border border-dashed text-sm',
              ),
              ...regionAttributes(
                h,
                Message.GotCtxBasicMenuMessage({
                  message: ContextMenu.Message.Opened({ maybeActiveItemIndex: Option.none() }),
                }),
              ),
            ],
            [
              h.submodel({
                slotId: model.ctxBasicMenu.id,
                model: model.ctxBasicMenu,
                view: DemoMenu.view,
                viewInputs: ContextMenu.viewInputs<string>({
                  maybePoint: pointWhileOpen(model.ctxBasicMenu, model.ctxPoint),
                  items: BASIC_ITEMS,
                  buttonContent: h.span([], ['Right click here']),
                  itemsClass: 'w-48',
                  itemGroupKey: (item) => basicGroupKey(item),
                  groupToHeading: (groupKey) =>
                    groupKey === 'people' ? { content: h.span([], ['People']) } : undefined,
                  isItemDisabled: (item) => item === 'Forward',
                  contentAttributes: basicSub.parentKeys(h, model, Message.OpenedCtxBasicSubMenu()),
                  itemToConfig: (item) =>
                    item === 'More Tools'
                      ? {
                          className: cn(
                            ContextMenu.contextMenuSubTriggerClass,
                            model.ctxBasicSubMenu.isOpen &&
                              ContextMenu.contextMenuSubTriggerOpenClass,
                          ),
                          content: h.submodel({
                            slotId: model.ctxBasicSubMenu.id,
                            model: model.ctxBasicSubMenu,
                            view: DemoMenu.view,
                            viewInputs: ContextMenu.subViewInputs<string>({
                              items: BASIC_SUB_ITEMS,
                              buttonContent: h.span(
                                [h.Class('flex w-full items-center')],
                                [h.span([], [item]), ContextMenu.contextMenuSubTriggerChevron(h)],
                              ),
                              itemsClass: 'w-44',
                              contentAttributes: basicSub.subKeys(
                                h,
                                Message.ClosedCtxBasicSubMenu(),
                              ),
                              itemToConfig: (subItem) =>
                                subItem === 'Delete'
                                  ? {
                                      className: ContextMenu.contextMenuItemDestructiveClass,
                                      content: h.span([], [subItem]),
                                    }
                                  : { content: h.span([], [subItem]) },
                            }),
                            toParentMessage: (message) =>
                              Message.GotCtxBasicSubMenuMessage({ message }),
                          }),
                        }
                      : basicItemConfig(model, h, item),
                }),
                toParentMessage: (message) => Message.GotCtxBasicMenuMessage({ message }),
              }),
            ],
          ),
          h.p(
            [h.Class('px-1 text-xs text-muted-foreground')],
            [
              'Right-click (or touch long-press) opens the menu at the pointer. Tab to the region and press Enter to open it from the keyboard.',
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Icons']),
          h.div(
            [
              h.Class(
                'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border border-dashed text-sm',
              ),
              ...regionAttributes(
                h,
                Message.GotCtxIconsMenuMessage({
                  message: ContextMenu.Message.Opened({ maybeActiveItemIndex: Option.none() }),
                }),
              ),
            ],
            [
              h.submodel({
                slotId: model.ctxIconsMenu.id,
                model: model.ctxIconsMenu,
                view: DemoMenu.view,
                viewInputs: ContextMenu.viewInputs<string>({
                  maybePoint: pointWhileOpen(model.ctxIconsMenu, model.ctxPoint),
                  items: ICON_ITEMS,
                  buttonContent: h.span([], ['Right click — Copy / Cut / Paste']),
                  itemsClass: 'w-44',
                  itemToConfig: (item) => ({
                    className: item === 'Delete' ? ContextMenu.contextMenuItemDestructiveClass : '',
                    content: h.span(
                      [h.Class('flex w-full items-center gap-2')],
                      [
                        icon(h, ICONS.get(item) ?? Copy),
                        h.span([], [item]),
                        h.span(
                          [h.Class(ContextMenu.contextMenuShortcutClass)],
                          [ICON_SHORTCUTS.get(item) ?? ''],
                        ),
                      ],
                    ),
                  }),
                }),
                toParentMessage: (message) => Message.GotCtxIconsMenuMessage({ message }),
              }),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Anchored Above']),
          h.div(
            [
              h.Class(
                'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border border-dashed text-sm',
              ),
              ...regionAttributes(
                h,
                Message.GotCtxTopMenuMessage({
                  message: ContextMenu.Message.Opened({ maybeActiveItemIndex: Option.none() }),
                }),
              ),
            ],
            [
              h.submodel({
                slotId: model.ctxTopMenu.id,
                model: model.ctxTopMenu,
                view: DemoMenu.view,
                viewInputs: ContextMenu.viewInputs<string>({
                  maybePoint: pointWhileOpen(model.ctxTopMenu, model.ctxPoint),
                  items: TOP_ITEMS,
                  buttonContent: h.span([], ['Right click — opens above']),
                  anchor: { placement: 'top-start', gap: 4, padding: 8 },
                  itemsClass: 'w-36',
                  isItemDisabled: (item) => item === 'Forward',
                  itemToConfig: (item) => ({ content: h.span([], [item]) }),
                }),
                toParentMessage: (message) => Message.GotCtxTopMenuMessage({ message }),
              }),
            ],
          ),
        ],
      ),
    ],
  )

const recordAction = (action: string) => (model: State) => ({
  model: modifyFields(model, { lastContextAction: () => action }),
})

const foldActionOutMessage =
  (prefix: string) =>
  ({ value }: FoldkitMenu.OutMessage): Update.Step<State, AppMessage> =>
    recordAction(`${prefix}: ${value}`)

// Checkbox/radio rows keep the panel open: the slice applies the toggle for
// `SelectedItem` and never forwards it to the primitive (`keepOpenOnSelect`).
const isKeptOpen = (value: string): boolean =>
  value === 'Show Bookmarks' || value === 'Show Full URLs' || isBasicRadio(value)

const toggleBasic =
  (value: string): Update.Step<State, AppMessage> =>
  (model) => ({
    model: modifyFields(model, {
      showBookmarks: () =>
        value === 'Show Bookmarks' ? !model.showBookmarks : model.showBookmarks,
      showFullUrls: () => (value === 'Show Full URLs' ? !model.showFullUrls : model.showFullUrls),
      person: () => (isBasicRadio(value) ? value : model.person),
      lastContextAction: () => value,
    }),
  })

// "More Tools" is the nested menu (menu-family.ts).
const basicSub = subMenu<State, AppMessage>({
  readParent: (model) => model.ctxBasicMenu,
  writeParent: (model, next) => modifyFields(model, { ctxBasicMenu: () => next }),
  readSub: (model) => model.ctxBasicSubMenu,
  writeSub: (model, next) => modifyFields(model, { ctxBasicSubMenu: () => next }),
  toParentMessage: (message) => Message.GotCtxBasicMenuMessage({ message }),
  toSubMessage: (message) => Message.GotCtxBasicSubMenuMessage({ message }),
  subIndex: BASIC_SUB_INDEX,
  foldParentSelected: foldActionOutMessage('Basic'),
  foldSubSelected: foldActionOutMessage('More Tools'),
})

const foldCtxIcons = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.ctxIconsMenu),
  write: (model, next) => modifyFields(model, { ctxIconsMenu: () => next }),
  toParentMessage: (message) => Message.GotCtxIconsMenuMessage({ message }),
  foldOutMessage: foldActionOutMessage('Icons'),
})

const foldCtxTop = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.ctxTopMenu),
  write: (model, next) => modifyFields(model, { ctxTopMenu: () => next }),
  toParentMessage: (message) => Message.GotCtxTopMenuMessage({ message }),
  foldOutMessage: foldActionOutMessage('Above'),
})

export const slice = defineSlice({
  fields,
  init: {
    ctxPoint: Option.none(),
    ctxBasicMenu: ContextMenu.init({ id: 'context-menu-basic' }),
    ctxBasicSubMenu: ContextMenu.init({ id: 'context-menu-basic-sub', isAnimated: false }),
    ctxIconsMenu: ContextMenu.init({ id: 'context-menu-icons' }),
    ctxTopMenu: ContextMenu.init({ id: 'context-menu-top' }),
    showBookmarks: true,
    showFullUrls: false,
    person: 'Pedro Duarte',
    lastContextAction: 'none yet',
  },
  messages: [
    Message.GotCtxBasicMenuMessage,
    Message.GotCtxIconsMenuMessage,
    Message.GotCtxTopMenuMessage,
    Message.RecordedCtxPoint,
    Message.GotCtxBasicSubMenuMessage,
    Message.OpenedCtxBasicSubMenu,
    Message.ClosedCtxBasicSubMenu,
  ],
  handlers: (model: State) => ({
    GotCtxBasicMenuMessage: (payload: typeof Message.GotCtxBasicMenuMessage.Type): UpdateReturn =>
      keepOpenOnSelect<State, AppMessage>({
        items: BASIC_ITEMS,
        readMenu: (state) => state.ctxBasicMenu,
        isKept: isKeptOpen,
        onSelected: toggleBasic,
        forward: basicSub.handleParent,
      })(model, payload.message),
    GotCtxIconsMenuMessage: (payload: typeof Message.GotCtxIconsMenuMessage.Type): UpdateReturn =>
      foldCtxIcons(model, payload.message),
    GotCtxTopMenuMessage: (payload: typeof Message.GotCtxTopMenuMessage.Type): UpdateReturn =>
      foldCtxTop(model, payload.message),
    GotCtxBasicSubMenuMessage: (
      payload: typeof Message.GotCtxBasicSubMenuMessage.Type,
    ): UpdateReturn => basicSub.handleSub(model, payload.message),
    RecordedCtxPoint: (payload: typeof Message.RecordedCtxPoint.Type): UpdateReturn => ({
      model: modifyFields(model, { ctxPoint: () => payload.maybePoint }),
    }),
    OpenedCtxBasicSubMenu: (): UpdateReturn => basicSub.openSub(model),
    ClosedCtxBasicSubMenu: (): UpdateReturn => basicSub.closeSub(model),
  }),
  samples: [],
})
