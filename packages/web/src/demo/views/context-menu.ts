import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Check, Clipboard, Copy, Scissors, Trash2 } from 'lucide'

import { Menu as FoldkitMenu } from '@foldkit/ui'

import * as ContextMenu from '../../generated/registry/ui/context-menu'
import { icon } from '../../generated/registry/lib/icons'
import { DemoMenu } from '../bundles'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

export const Message = defineMessageUnion({
  GotCtxBasicMenuMessage: { message: ContextMenu.Message },
  GotCtxIconsMenuMessage: { message: ContextMenu.Message },
  GotCtxTopMenuMessage: { message: ContextMenu.Message },
})

// Sections mirror apps/v4/examples/base/context-menu-demo.tsx. Right-click on
// a region opens its menu: foldkit's `h.OnContextMenu` suppresses the native
// menu and the handler injects the primitive's `Opened` message. The panel
// anchors to the trigger region (not the pointer — primitive ceiling, see
// gapsByItem['context-menu']). Submenu/checkbox/radio rows render as flat
// items with demo-owned state, as in the menu demo.

const BASIC_ITEMS = [
  'Back',
  'Forward',
  'Reload',
  'Save Page...',
  'Create Shortcut...',
  'Name Window...',
  'Developer Tools',
  'Delete',
  'Show Bookmarks',
  'Show Full URLs',
  'Pedro Duarte',
  'Colm Tuite',
] as const

const BASIC_SHORTCUTS = new Map<string, string>([
  ['Back', '⌘['],
  ['Forward', '⌘]'],
  ['Reload', '⌘R'],
])

const basicGroupKey = (item: string): string => {
  if (item === 'Back' || item === 'Forward' || item === 'Reload') return 'nav'
  if (
    item === 'Save Page...' ||
    item === 'Create Shortcut...' ||
    item === 'Name Window...' ||
    item === 'Developer Tools' ||
    item === 'Delete'
  )
    return 'tools'
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
  ctxBasicMenu: ContextMenu.Model,
  ctxIconsMenu: ContextMenu.Model,
  ctxTopMenu: ContextMenu.Model,
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

const basicItemContent = (model: State, h: HtmlBuilder<AppMessage>, item: string): Html => {
  const inner: Array<Html> = []
  if (item === 'Show Bookmarks' || item === 'Show Full URLs' || isBasicRadio(item)) {
    const on =
      item === 'Show Bookmarks' || item === 'Show Full URLs'
        ? basicCheckOn(model, item)
        : model.person === item
    inner.push(
      h.span(
        [h.Class('flex w-4 shrink-0 items-center justify-center')],
        [...(on ? [icon(h, Check, 'size-4')] : [])],
      ),
    )
  }
  inner.push(h.span([], [item]))
  const shortcut = BASIC_SHORTCUTS.get(item)
  if (shortcut !== undefined) {
    inner.push(h.span([h.Class(ContextMenu.contextMenuShortcutClass)], [shortcut]))
  }
  const destructive = item === 'Delete'
  return h.span(
    [
      h.Class(
        destructive
          ? 'flex w-full items-center gap-2 text-destructive data-active:bg-destructive/10 data-active:text-destructive dark:data-active:bg-destructive/20 [&_svg]:text-destructive'
          : 'flex w-full items-center gap-2',
      ),
    ],
    inner,
  )
}

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
              h.OnContextMenu(
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
                  items: BASIC_ITEMS,
                  buttonContent: h.span([], ['Right click here']),
                  itemsClass: 'w-48',
                  itemGroupKey: (item) => basicGroupKey(item),
                  groupToHeading: (groupKey) => {
                    // Upstream nests the tools under a "More Tools" submenu;
                    // without a submenu primitive they render as a group.
                    if (groupKey === 'tools') return { content: h.span([], ['More Tools']) }
                    if (groupKey === 'people') return { content: h.span([], ['People']) }
                    return undefined
                  },
                  isItemDisabled: (item) => item === 'Forward',
                  itemToConfig: (item) => ({ content: basicItemContent(model, h, item) }),
                }),
                toParentMessage: (message) => Message.GotCtxBasicMenuMessage({ message }),
              }),
            ],
          ),
          h.p(
            [h.Class('px-1 text-xs text-muted-foreground')],
            ['Right-click opens the menu (left-click works too). Anchors to the region.'],
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
              h.OnContextMenu(
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
                  items: ICON_ITEMS,
                  buttonContent: h.span([], ['Right click — Copy / Cut / Paste']),
                  itemsClass: 'w-44',
                  itemToConfig: (item) => ({
                    className:
                      item === 'Delete'
                        ? 'text-destructive data-active:bg-destructive/10 data-active:text-destructive dark:data-active:bg-destructive/20 [&_svg]:text-destructive'
                        : '',
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
              h.OnContextMenu(
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
  model: evo(model, { lastContextAction: () => action }),
})

const foldBasicOutMessage = M.type<FoldkitMenu.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => ({
        model: evo(model, {
          showBookmarks: () =>
            value === 'Show Bookmarks' ? !model.showBookmarks : model.showBookmarks,
          showFullUrls: () =>
            value === 'Show Full URLs' ? !model.showFullUrls : model.showFullUrls,
          person: () => (value === 'Pedro Duarte' || value === 'Colm Tuite' ? value : model.person),
          lastContextAction: () => value,
        }),
      }),
  }),
)

const foldActionOutMessage = (prefix: string) =>
  M.type<FoldkitMenu.OutMessage>().pipe(
    M.withReturnType<Update.Step<State, unknown>>(),
    M.tagsExhaustive({ Selected: ({ value }) => recordAction(`${prefix}: ${value}`) }),
  )

const foldCtxBasic = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.ctxBasicMenu),
  write: (model, next) => evo(model, { ctxBasicMenu: () => next }),
  toParentMessage: (message) => Message.GotCtxBasicMenuMessage({ message }),
  foldOutMessage: foldBasicOutMessage,
})

const foldCtxIcons = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.ctxIconsMenu),
  write: (model, next) => evo(model, { ctxIconsMenu: () => next }),
  toParentMessage: (message) => Message.GotCtxIconsMenuMessage({ message }),
  foldOutMessage: foldActionOutMessage('Icons'),
})

const foldCtxTop = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.ctxTopMenu),
  write: (model, next) => evo(model, { ctxTopMenu: () => next }),
  toParentMessage: (message) => Message.GotCtxTopMenuMessage({ message }),
  foldOutMessage: foldActionOutMessage('Above'),
})

export const slice = defineSlice({
  fields,
  init: {
    ctxBasicMenu: ContextMenu.init({ id: 'context-menu-basic' }),
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
  ],
  handlers: (model: State) => ({
    GotCtxBasicMenuMessage: (payload: typeof Message.GotCtxBasicMenuMessage.Type): UpdateReturn =>
      foldCtxBasic(model, payload.message),
    GotCtxIconsMenuMessage: (payload: typeof Message.GotCtxIconsMenuMessage.Type): UpdateReturn =>
      foldCtxIcons(model, payload.message),
    GotCtxTopMenuMessage: (payload: typeof Message.GotCtxTopMenuMessage.Type): UpdateReturn =>
      foldCtxTop(model, payload.message),
  }),
  samples: [],
})
