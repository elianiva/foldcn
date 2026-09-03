import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Check } from 'lucide'

import { Menu as FoldkitMenu } from '@foldkit/ui'

import * as Menubar from '../../generated/registry/ui/menubar'
import { icon } from '../../generated/registry/lib/icons'
import { DemoMenu } from '../bundles'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

export const Message = defineMessageUnion({
  GotFileMenuMessage: { message: Menubar.Message },
  GotEditMenuMessage: { message: Menubar.Message },
  GotViewMenuMessage: { message: Menubar.Message },
  GotProfilesMenuMessage: { message: Menubar.Message },
})

// Mirrors apps/v4/examples/base/menubar-demo.tsx: one bar with four working
// triggers. Each trigger owns a Menu model — cross-menu arrow traversal and
// open-on-hover-of-next-trigger need a menubar behavior primitive (see
// gapsByItem.menubar). Submenu rows ("Share", "Find") render as labelled
// groups; checkbox/radio rows render indicators from demo-owned state.

const FILE_ITEMS = [
  'New Tab',
  'New Window',
  'New Incognito Window',
  'Email link',
  'Messages',
  'Notes',
  'Print...',
] as const

const FILE_SHORTCUTS = new Map<string, string>([
  ['New Tab', '⌘T'],
  ['New Window', '⌘N'],
  ['Print...', '⌘P'],
])

const fileGroupKey = (item: string): string => {
  if (item === 'New Tab' || item === 'New Window' || item === 'New Incognito Window') return 'new'
  if (item === 'Print...') return 'print'
  // Upstream nests these under a "Share" submenu; without a submenu
  // primitive they render as a labelled group.
  return 'share'
}

const EDIT_ITEMS = [
  'Undo',
  'Redo',
  'Search the web',
  'Find...',
  'Find Next',
  'Find Previous',
  'Cut',
  'Copy',
  'Paste',
] as const

const EDIT_SHORTCUTS = new Map<string, string>([
  ['Undo', '⌘Z'],
  ['Redo', '⇧⌘Z'],
])

const editGroupKey = (item: string): string => {
  if (item === 'Undo' || item === 'Redo') return 'history'
  if (item === 'Cut' || item === 'Copy' || item === 'Paste') return 'clipboard'
  // Upstream nests these under a "Find" submenu; flattened here (see above).
  return 'find'
}

const VIEW_ITEMS = [
  'Bookmarks Bar',
  'Full URLs',
  'Reload',
  'Force Reload',
  'Toggle Fullscreen',
  'Hide Sidebar',
] as const

const viewGroupKey = (item: string): string => {
  if (item === 'Bookmarks Bar' || item === 'Full URLs') return 'bars'
  if (item === 'Reload' || item === 'Force Reload') return 'reload'
  if (item === 'Toggle Fullscreen') return 'fullscreen'
  return 'sidebar'
}

const PROFILE_ITEMS = ['Andy', 'Benoit', 'Luis', 'Edit...', 'Add Profile...'] as const

const profileGroupKey = (item: string): string => {
  if (item === 'Edit...') return 'edit'
  if (item === 'Add Profile...') return 'add'
  return 'people'
}

const fields = {
  fileMenu: Menubar.Model,
  editMenu: Menubar.Model,
  viewMenu: Menubar.Model,
  profilesMenu: Menubar.Model,
  viewBookmarksBar: S.Boolean,
  viewFullUrls: S.Boolean,
  profile: S.String,
  lastMenubarAction: S.String,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

const withMenubarShortcut = (
  h: HtmlBuilder<AppMessage>,
  label: string,
  shortcut: string | undefined,
): Html =>
  shortcut === undefined
    ? h.span([], [label])
    : h.span(
        [h.Class('flex w-full items-center gap-2')],
        [h.span([], [label]), h.span([h.Class(Menubar.menubarShortcutClass)], [shortcut])],
      )

const viewCheckOn = (model: State, item: string): boolean => {
  if (item === 'Bookmarks Bar') return model.viewBookmarksBar
  if (item === 'Full URLs') return model.viewFullUrls
  return false
}

export const menubarView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.p(
        [h.Class('px-1 text-xs text-muted-foreground')],
        [
          `Last action: ${model.lastMenubarAction} · Bookmarks ${model.viewBookmarksBar ? 'on' : 'off'} · Full URLs ${model.viewFullUrls ? 'on' : 'off'} · Profile: ${model.profile}`,
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          Menubar.menubar(
            [
              h.submodel({
                slotId: model.fileMenu.id,
                model: model.fileMenu,
                view: DemoMenu.view,
                viewInputs: Menubar.viewInputs<string>({
                  items: FILE_ITEMS,
                  buttonContent: h.span([], ['File']),
                  itemGroupKey: (item) => fileGroupKey(item),
                  groupToHeading: (groupKey) =>
                    groupKey === 'share' ? { content: h.span([], ['Share']) } : undefined,
                  isItemDisabled: (item) => item === 'New Incognito Window',
                  itemToConfig: (item) => ({
                    content: withMenubarShortcut(h, item, FILE_SHORTCUTS.get(item)),
                  }),
                }),
                toParentMessage: (message) => Message.GotFileMenuMessage({ message }),
              }),
              h.submodel({
                slotId: model.editMenu.id,
                model: model.editMenu,
                view: DemoMenu.view,
                viewInputs: Menubar.viewInputs<string>({
                  items: EDIT_ITEMS,
                  buttonContent: h.span([], ['Edit']),
                  itemGroupKey: (item) => editGroupKey(item),
                  groupToHeading: (groupKey) =>
                    groupKey === 'find' ? { content: h.span([], ['Find']) } : undefined,
                  itemToConfig: (item) => ({
                    content: withMenubarShortcut(h, item, EDIT_SHORTCUTS.get(item)),
                  }),
                }),
                toParentMessage: (message) => Message.GotEditMenuMessage({ message }),
              }),
              h.submodel({
                slotId: model.viewMenu.id,
                model: model.viewMenu,
                view: DemoMenu.view,
                viewInputs: Menubar.viewInputs<string>({
                  items: VIEW_ITEMS,
                  buttonContent: h.span([], ['View']),
                  itemsClass: 'w-44',
                  itemGroupKey: (item) => viewGroupKey(item),
                  isItemDisabled: (item) => item === 'Force Reload',
                  itemToConfig: (item) => ({
                    className: item === 'Bookmarks Bar' || item === 'Full URLs' ? '' : 'pl-7',
                    content:
                      item === 'Bookmarks Bar' || item === 'Full URLs'
                        ? h.span(
                            [h.Class('flex w-full items-center gap-2')],
                            [
                              h.span(
                                [h.Class('flex w-4 shrink-0 items-center justify-center')],
                                [...(viewCheckOn(model, item) ? [icon(h, Check, 'size-4')] : [])],
                              ),
                              h.span([], [item]),
                            ],
                          )
                        : withMenubarShortcut(
                            h,
                            item,
                            item === 'Reload' ? '⌘R' : item === 'Force Reload' ? '⇧⌘R' : undefined,
                          ),
                  }),
                }),
                toParentMessage: (message) => Message.GotViewMenuMessage({ message }),
              }),
              h.submodel({
                slotId: model.profilesMenu.id,
                model: model.profilesMenu,
                view: DemoMenu.view,
                viewInputs: Menubar.viewInputs<string>({
                  items: PROFILE_ITEMS,
                  buttonContent: h.span([], ['Profiles']),
                  itemGroupKey: (item) => profileGroupKey(item),
                  itemToConfig: (item) => ({
                    className:
                      item === 'Andy' || item === 'Benoit' || item === 'Luis' ? '' : 'pl-7',
                    content:
                      item === 'Andy' || item === 'Benoit' || item === 'Luis'
                        ? h.span(
                            [h.Class('flex w-full items-center gap-2')],
                            [
                              h.span(
                                [h.Class('flex w-4 shrink-0 items-center justify-center')],
                                [...(model.profile === item ? [icon(h, Check, 'size-4')] : [])],
                              ),
                              h.span([], [item]),
                            ],
                          )
                        : h.span([], [item]),
                  }),
                }),
                toParentMessage: (message) => Message.GotProfilesMenuMessage({ message }),
              }),
            ],
            h,
          ),
          h.p(
            [h.Class('px-1 text-xs text-muted-foreground')],
            [
              'Each trigger opens its own menu. Arrow keys move within an open menu; moving across triggers needs a menubar primitive.',
            ],
          ),
        ],
      ),
    ],
  )

const recordAction = (menuName: string, value: string) => (model: State) => ({
  model: evo(model, { lastMenubarAction: () => `${menuName}: ${value}` }),
})

const foldActionOutMessage = (menuName: string) =>
  M.type<FoldkitMenu.OutMessage>().pipe(
    M.withReturnType<Update.Step<State, unknown>>(),
    M.tagsExhaustive({ Selected: ({ value }) => recordAction(menuName, value) }),
  )

const foldViewOutMessage = M.type<FoldkitMenu.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => ({
        model: evo(model, {
          viewBookmarksBar: () =>
            value === 'Bookmarks Bar' ? !model.viewBookmarksBar : model.viewBookmarksBar,
          viewFullUrls: () => (value === 'Full URLs' ? !model.viewFullUrls : model.viewFullUrls),
          lastMenubarAction: () => `View: ${value}`,
        }),
      }),
  }),
)

const foldProfilesOutMessage = M.type<FoldkitMenu.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => ({
        model: evo(model, {
          profile: () =>
            value === 'Andy' || value === 'Benoit' || value === 'Luis' ? value : model.profile,
          lastMenubarAction: () => `Profiles: ${value}`,
        }),
      }),
  }),
)

const foldFile = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.fileMenu),
  write: (model, next) => evo(model, { fileMenu: () => next }),
  toParentMessage: (message) => Message.GotFileMenuMessage({ message }),
  foldOutMessage: foldActionOutMessage('File'),
})

const foldEdit = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.editMenu),
  write: (model, next) => evo(model, { editMenu: () => next }),
  toParentMessage: (message) => Message.GotEditMenuMessage({ message }),
  foldOutMessage: foldActionOutMessage('Edit'),
})

const foldView = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.viewMenu),
  write: (model, next) => evo(model, { viewMenu: () => next }),
  toParentMessage: (message) => Message.GotViewMenuMessage({ message }),
  foldOutMessage: foldViewOutMessage,
})

const foldProfiles = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.profilesMenu),
  write: (model, next) => evo(model, { profilesMenu: () => next }),
  toParentMessage: (message) => Message.GotProfilesMenuMessage({ message }),
  foldOutMessage: foldProfilesOutMessage,
})

export const slice = defineSlice({
  fields,
  init: {
    fileMenu: Menubar.init({ id: 'menubar-file' }),
    editMenu: Menubar.init({ id: 'menubar-edit' }),
    viewMenu: Menubar.init({ id: 'menubar-view' }),
    profilesMenu: Menubar.init({ id: 'menubar-profiles' }),
    viewBookmarksBar: false,
    viewFullUrls: true,
    profile: 'Benoit',
    lastMenubarAction: 'none yet',
  },
  messages: [
    Message.GotFileMenuMessage,
    Message.GotEditMenuMessage,
    Message.GotViewMenuMessage,
    Message.GotProfilesMenuMessage,
  ],
  handlers: (model: State) => ({
    GotFileMenuMessage: (payload: typeof Message.GotFileMenuMessage.Type): UpdateReturn =>
      foldFile(model, payload.message),
    GotEditMenuMessage: (payload: typeof Message.GotEditMenuMessage.Type): UpdateReturn =>
      foldEdit(model, payload.message),
    GotViewMenuMessage: (payload: typeof Message.GotViewMenuMessage.Type): UpdateReturn =>
      foldView(model, payload.message),
    GotProfilesMenuMessage: (payload: typeof Message.GotProfilesMenuMessage.Type): UpdateReturn =>
      foldProfiles(model, payload.message),
  }),
  samples: [],
})
