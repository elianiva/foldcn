import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { Menu as FoldkitMenu } from '@foldkit/ui'
import { Check, CircleHelp, File, Folder, Save, Settings, Trash2 } from 'lucide'
import type { IconNode } from 'lucide'

import * as Menubar from '../../generated/registry/ui/menubar'
import * as menu from '../../generated/registry/ui/menu'
import { icon } from '../../generated/registry/lib/icons'

import { DemoMenu } from '../bundles'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

export const Message = defineMessageUnion({
  GotFileMessage: { message: menu.Message },
  GotEditMessage: { message: menu.Message },
  GotViewMessage: { message: menu.Message },
  GotProfilesMessage: { message: menu.Message },
  GotSubFileMessage: { message: menu.Message },
  GotSubEditMessage: { message: menu.Message },
  GotCheckViewMessage: { message: menu.Message },
  GotCheckFormatMessage: { message: menu.Message },
  GotRadioProfilesMessage: { message: menu.Message },
  GotRadioThemeMessage: { message: menu.Message },
  GotIconFileMessage: { message: menu.Message },
  GotIconMoreMessage: { message: menu.Message },
  GotRtlFileMessage: { message: menu.Message },
})

// Mirrors apps/v4/examples/base/menubar-*.tsx. Every bar below is a live menu:
// keyboard nav, typeahead, disabled items, groups/separators, and selection
// all work. Primitive-ceiling approximations (see the notes section at the
// bottom of the view): submenus render as labeled groups (Share/Find), check
// and radio rows toggle slice state on select (the menu closes — upstream
// keeps it open), inset uses pl-7 (no per-item data-inset hook), and the
// destructive Delete row uses text-destructive (no per-item data-variant hook).

const shortcut = (h: HtmlBuilder<AppMessage>, text: string): Html =>
  h.span([h.Class(Menubar.menubarShortcutClass)], [text])

// Row wrappers use display:contents so icons/labels/shortcuts participate in
// the menu item's own flex layout directly (upstream renders them as direct
// children — the shortcut's ml-auto only works as a flex item).
const rowClass = 'contents'

const labelRow = (h: HtmlBuilder<AppMessage>, label: string, text?: string): Html =>
  h.span([h.Class(rowClass)], text === undefined ? [label] : [label, shortcut(h, text)])

const checkRow = (
  h: HtmlBuilder<AppMessage>,
  label: string,
  checked: boolean,
  text?: string,
): Html =>
  h.span(
    [h.Class(rowClass)],
    [
      h.span([h.Class(Menubar.menubarCheckboxItemIndicatorClass)], checked ? [icon(h, Check)] : []),
      label,
      ...(text === undefined ? [] : [shortcut(h, text)]),
    ],
  )

const radioRow = (h: HtmlBuilder<AppMessage>, label: string, selected: boolean): Html =>
  h.span(
    [h.Class(rowClass)],
    [
      h.span([h.Class(Menubar.menubarRadioItemIndicatorClass)], selected ? [icon(h, Check)] : []),
      label,
    ],
  )

const iconRow = (
  h: HtmlBuilder<AppMessage>,
  iconNode: IconNode,
  label: string,
  text?: string,
): Html =>
  h.span(
    [h.Class(rowClass)],
    [icon(h, iconNode), label, ...(text === undefined ? [] : [shortcut(h, text)])],
  )

// Upstream menubar-demo.tsx items, in order. Inset rows (upstream `inset`)
// add pl-7 — the token's data-inset:pl-7 never matches because the primitive
// has no per-item attribute hook.
const INSET = 'pl-7'

// Checkbox/radio rows use the upstream checkbox/radio token classes (pl-7 room
// for the indicator) plus the foldkit data-active highlight twin.
const checkItemClass = `${Menubar.menubarCheckboxItemClass} data-active:bg-accent data-active:text-accent-foreground`
const radioItemClass = `${Menubar.menubarRadioItemClass} data-active:bg-accent data-active:text-accent-foreground`

const fileItems = [
  'New Tab',
  'New Window',
  'New Incognito Window',
  'Email link',
  'Messages',
  'Notes',
  'Print…',
] as const

const fileGroupKey = (item: string): string => {
  if (item === 'Email link' || item === 'Messages' || item === 'Notes') return 'share'
  if (item === 'Print…') return 'print'
  return 'main'
}

const editItems = [
  'Undo',
  'Redo',
  'Search the web',
  'Find…',
  'Find Next',
  'Find Previous',
  'Cut',
  'Copy',
  'Paste',
] as const

const editGroupKey = (item: string): string => {
  if (
    item === 'Search the web' ||
    item === 'Find…' ||
    item === 'Find Next' ||
    item === 'Find Previous'
  )
    return 'find'
  if (item === 'Cut' || item === 'Copy' || item === 'Paste') return 'action'
  return 'main'
}

const fileContent = (h: HtmlBuilder<AppMessage>, item: string): Html => {
  switch (item) {
    case 'New Tab':
      return labelRow(h, 'New Tab', '⌘T')
    case 'New Window':
      return labelRow(h, 'New Window', '⌘N')
    case 'Print…':
      return labelRow(h, 'Print…', '⌘P')
    default:
      return labelRow(h, item)
  }
}

const editContent = (h: HtmlBuilder<AppMessage>, item: string): Html => {
  switch (item) {
    case 'Undo':
      return labelRow(h, 'Undo', '⌘Z')
    case 'Redo':
      return labelRow(h, 'Redo', '⇧⌘Z')
    default:
      return labelRow(h, item)
  }
}

const bar = (h: HtmlBuilder<AppMessage>, children: ReadonlyArray<Html>, className = 'w-72'): Html =>
  h.div(
    [h.Class('rounded-lg border p-3')],
    [Menubar.menubar([h.div([h.Class(className)], children)], h)],
  )

export const menubarView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Demo']),
          bar(h, [
            h.submodel({
              slotId: model.fileMenu.id,
              model: model.fileMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                items: [...fileItems],
                buttonContent: h.span([], ['File']),
                itemToConfig: (item) => ({ content: fileContent(h, item) }),
                isItemDisabled: (item) => item === 'New Incognito Window',
                itemGroupKey: (item) => fileGroupKey(item),
                groupToHeading: (groupKey) =>
                  groupKey === 'share' ? { content: h.span([], ['Share']) } : undefined,
              }),
              toParentMessage: (message) => Message.GotFileMessage({ message }),
            }),
            h.submodel({
              slotId: model.editMenu.id,
              model: model.editMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                items: [...editItems],
                buttonContent: h.span([], ['Edit']),
                itemToConfig: (item) => ({ content: editContent(h, item) }),
                itemGroupKey: (item) => editGroupKey(item),
                groupToHeading: (groupKey) =>
                  groupKey === 'find' ? { content: h.span([], ['Find']) } : undefined,
              }),
              toParentMessage: (message) => Message.GotEditMessage({ message }),
            }),
            h.submodel({
              slotId: model.viewMenu.id,
              model: model.viewMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                items: [
                  'Bookmarks Bar',
                  'Full URLs',
                  'Reload',
                  'Force Reload',
                  'Toggle Fullscreen',
                  'Hide Sidebar',
                ],
                buttonContent: h.span([], ['View']),
                itemsClass: 'w-44',
                itemToConfig: (item) => {
                  switch (item) {
                    case 'Bookmarks Bar':
                      return {
                        className: checkItemClass,
                        content: checkRow(h, 'Bookmarks Bar', model.showBookmarks),
                      }
                    case 'Full URLs':
                      return {
                        className: checkItemClass,
                        content: checkRow(h, 'Full URLs', model.showFullUrls),
                      }
                    case 'Reload':
                      return {
                        className: INSET,
                        content: labelRow(h, 'Reload', '⌘R'),
                      }
                    case 'Force Reload':
                      return {
                        className: INSET,
                        content: labelRow(h, 'Force Reload', '⇧⌘R'),
                      }
                    default:
                      return { className: INSET, content: labelRow(h, item) }
                  }
                },
                isItemDisabled: (item) => item === 'Force Reload',
                itemGroupKey: (item) =>
                  item === 'Bookmarks Bar' || item === 'Full URLs'
                    ? 'checks'
                    : item === 'Reload' || item === 'Force Reload'
                      ? 'reload'
                      : item === 'Toggle Fullscreen'
                        ? 'fullscreen'
                        : 'sidebar',
              }),
              toParentMessage: (message) => Message.GotViewMessage({ message }),
            }),
            h.submodel({
              slotId: model.profilesMenu.id,
              model: model.profilesMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                items: ['Andy', 'Benoit', 'Luis', 'Edit…', 'Add Profile…'],
                buttonContent: h.span([], ['Profiles']),
                itemToConfig: (item) => {
                  if (item === 'Edit…' || item === 'Add Profile…')
                    return { className: INSET, content: labelRow(h, item) }
                  return {
                    className: radioItemClass,
                    content: radioRow(h, item, model.profile === item),
                  }
                },
                itemGroupKey: (item) =>
                  item === 'Edit…' ? 'edit' : item === 'Add Profile…' ? 'add' : 'profiles',
              }),
              toParentMessage: (message) => Message.GotProfilesMessage({ message }),
            }),
          ]),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Submenu']),
          h.p(
            [h.Class('px-1 text-xs text-muted-foreground')],
            ['Share and Find have no submenu primitive — they render as labeled groups.'],
          ),
          bar(h, [
            h.submodel({
              slotId: model.subFileMenu.id,
              model: model.subFileMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                items: ['Email link', 'Messages', 'Notes', 'Print…'],
                buttonContent: h.span([], ['File']),
                itemToConfig: (item) => ({ content: fileContent(h, item) }),
                itemGroupKey: (item) => (item === 'Print…' ? 'print' : 'share'),
                groupToHeading: (groupKey) =>
                  groupKey === 'share' ? { content: h.span([], ['Share']) } : undefined,
              }),
              toParentMessage: (message) => Message.GotSubFileMessage({ message }),
            }),
            h.submodel({
              slotId: model.subEditMenu.id,
              model: model.subEditMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                items: [
                  'Undo',
                  'Redo',
                  'Find…',
                  'Find Next',
                  'Find Previous',
                  'Cut',
                  'Copy',
                  'Paste',
                ],
                buttonContent: h.span([], ['Edit']),
                itemToConfig: (item) => ({ content: editContent(h, item) }),
                itemGroupKey: (item) => editGroupKey(item),
                groupToHeading: (groupKey) =>
                  groupKey === 'find' ? { content: h.span([], ['Find']) } : undefined,
              }),
              toParentMessage: (message) => Message.GotSubEditMessage({ message }),
            }),
          ]),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Checkboxes']),
          bar(h, [
            h.submodel({
              slotId: model.checkViewMenu.id,
              model: model.checkViewMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                items: [
                  'Always Show Bookmarks Bar',
                  'Always Show Full URLs',
                  'Reload',
                  'Force Reload',
                ],
                buttonContent: h.span([], ['View']),
                itemsClass: 'w-64',
                itemToConfig: (item) => {
                  switch (item) {
                    case 'Always Show Bookmarks Bar':
                      return {
                        className: checkItemClass,
                        content: checkRow(h, 'Always Show Bookmarks Bar', model.showBookmarks),
                      }
                    case 'Always Show Full URLs':
                      return {
                        className: checkItemClass,
                        content: checkRow(h, 'Always Show Full URLs', model.showFullUrls),
                      }
                    case 'Reload':
                      return {
                        className: INSET,
                        content: labelRow(h, 'Reload', '⌘R'),
                      }
                    default:
                      return {
                        className: INSET,
                        content: labelRow(h, 'Force Reload', '⇧⌘R'),
                      }
                  }
                },
                isItemDisabled: (item) => item === 'Force Reload',
                itemGroupKey: (item) =>
                  item === 'Reload' || item === 'Force Reload' ? 'reload' : 'checks',
              }),
              toParentMessage: (message) => Message.GotCheckViewMessage({ message }),
            }),
            h.submodel({
              slotId: model.checkFormatMenu.id,
              model: model.checkFormatMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                items: ['Strikethrough', 'Code', 'Superscript'],
                buttonContent: h.span([], ['Format']),
                itemToConfig: (item) => ({
                  className: checkItemClass,
                  content: checkRow(h, item, model.checkedFormats.includes(item)),
                }),
              }),
              toParentMessage: (message) => Message.GotCheckFormatMessage({ message }),
            }),
          ]),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Radio']),
          bar(h, [
            h.submodel({
              slotId: model.radioProfilesMenu.id,
              model: model.radioProfilesMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                items: ['Andy', 'Benoit', 'Luis', 'Edit…', 'Add Profile…'],
                buttonContent: h.span([], ['Profiles']),
                itemToConfig: (item) => {
                  if (item === 'Edit…' || item === 'Add Profile…')
                    return { className: INSET, content: labelRow(h, item) }
                  return {
                    className: radioItemClass,
                    content: radioRow(h, item, model.profile === item),
                  }
                },
                itemGroupKey: (item) =>
                  item === 'Edit…' ? 'edit' : item === 'Add Profile…' ? 'add' : 'profiles',
              }),
              toParentMessage: (message) => Message.GotRadioProfilesMessage({ message }),
            }),
            h.submodel({
              slotId: model.radioThemeMenu.id,
              model: model.radioThemeMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                items: ['Light', 'Dark', 'System'],
                buttonContent: h.span([], ['Theme']),
                itemToConfig: (item) => ({
                  className: radioItemClass,
                  content: radioRow(h, item, model.theme === item),
                }),
              }),
              toParentMessage: (message) => Message.GotRadioThemeMessage({ message }),
            }),
          ]),
          h.p(
            [h.Class('px-1 text-xs text-muted-foreground')],
            [`Selected profile: ${model.profile} · theme: ${model.theme}`],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div(
            [h.Class('px-1 text-xs font-medium text-muted-foreground')],
            ['With Icons & Shortcuts'],
          ),
          bar(h, [
            h.submodel({
              slotId: model.iconFileMenu.id,
              model: model.iconFileMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                items: ['New File', 'Open Folder', 'Save'],
                buttonContent: h.span([], ['File']),
                itemToConfig: (item) => {
                  switch (item) {
                    case 'New File':
                      return { content: iconRow(h, File, 'New File', '⌘N') }
                    case 'Open Folder':
                      return { content: iconRow(h, Folder, 'Open Folder') }
                    default:
                      return { content: iconRow(h, Save, 'Save', '⌘S') }
                  }
                },
                itemGroupKey: (item) => (item === 'Save' ? 'save' : 'new'),
              }),
              toParentMessage: (message) => Message.GotIconFileMessage({ message }),
            }),
            h.submodel({
              slotId: model.iconMoreMenu.id,
              model: model.iconMoreMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                items: ['Settings', 'Help', 'Delete'],
                buttonContent: h.span([], ['More']),
                itemToConfig: (item) => {
                  switch (item) {
                    case 'Settings':
                      return { content: iconRow(h, Settings, 'Settings') }
                    case 'Help':
                      return { content: iconRow(h, CircleHelp, 'Help') }
                    default:
                      return {
                        className: 'text-destructive',
                        content: iconRow(h, Trash2, 'Delete'),
                      }
                  }
                },
                itemGroupKey: (item) => (item === 'Delete' ? 'danger' : 'main'),
              }),
              toParentMessage: (message) => Message.GotIconMoreMessage({ message }),
            }),
          ]),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['RTL']),
          h.div(
            [h.Class('rounded-lg border p-3'), h.Attribute('dir', 'rtl')],
            [
              Menubar.menubar(
                [
                  h.submodel({
                    slotId: model.rtlFileMenu.id,
                    model: model.rtlFileMenu,
                    view: DemoMenu.view,
                    viewInputs: Menubar.viewInputs<string>({
                      items: [...fileItems],
                      buttonContent: h.span([], ['File']),
                      itemToConfig: (item) => ({ content: fileContent(h, item) }),
                      isItemDisabled: (item) => item === 'New Incognito Window',
                      itemGroupKey: (item) => fileGroupKey(item),
                      groupToHeading: (groupKey) =>
                        groupKey === 'share' ? { content: h.span([], ['Share']) } : undefined,
                    }),
                    toParentMessage: (message) => Message.GotRtlFileMessage({ message }),
                  }),
                ],
                h,
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Behavior notes']),
          h.ul(
            [h.Class('flex list-disc flex-col gap-1 px-5 text-xs text-muted-foreground')],
            [
              h.li(
                [],
                [
                  'Each trigger is an independent menu — no ArrowLeft/Right traversal between menus and no open-on-hover-of-next-trigger (needs a menubar behavior primitive).',
                ],
              ),
              h.li(
                [],
                [
                  'Submenus (Share, Find) render as labeled groups; checkbox and radio rows toggle state on select and the menu closes (upstream keeps it open).',
                ],
              ),
              h.li(
                [],
                [
                  'Inset rows use pl-7 and Delete uses text-destructive — the primitive has no per-item data-inset/data-variant hook.',
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )

const foldNoOp =
  <Out>(): ((out: Out) => Update.Step<State, unknown>) =>
  () =>
  (model) => ({ model })

const foldIgnoredOutMessage = M.type<FoldkitMenu.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({ Selected: foldNoOp() }),
)

// Bookmarks/Full URLs checkboxes (demo-bar View + checkbox-section View share
// state — labels differ, values map to the same flags).
const foldCheckOutMessage = M.type<FoldkitMenu.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) =>
        value === 'Bookmarks Bar' || value === 'Always Show Bookmarks Bar'
          ? { model: evo(model, { showBookmarks: () => !model.showBookmarks }) }
          : value === 'Full URLs' || value === 'Always Show Full URLs'
            ? { model: evo(model, { showFullUrls: () => !model.showFullUrls }) }
            : { model },
  }),
)

const foldFormatOutMessage = M.type<FoldkitMenu.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => ({
        model: evo(model, {
          checkedFormats: () =>
            model.checkedFormats.includes(value)
              ? model.checkedFormats.filter((entry) => entry !== value)
              : [...model.checkedFormats, value],
        }),
      }),
  }),
)

const foldProfileOutMessage = M.type<FoldkitMenu.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => ({
        model: evo(model, { profile: () => value }),
      }),
  }),
)

const foldThemeOutMessage = M.type<FoldkitMenu.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => ({
        model: evo(model, { theme: () => value }),
      }),
  }),
)

// One foldChild per menu field (mirrors the menu slice shape) — the read/write
// pair below is per-field so inference stays on the proven path.

const fields = {
  fileMenu: menu.Model,
  editMenu: menu.Model,
  viewMenu: menu.Model,
  profilesMenu: menu.Model,
  subFileMenu: menu.Model,
  subEditMenu: menu.Model,
  checkViewMenu: menu.Model,
  checkFormatMenu: menu.Model,
  radioProfilesMenu: menu.Model,
  radioThemeMenu: menu.Model,
  iconFileMenu: menu.Model,
  iconMoreMenu: menu.Model,
  rtlFileMenu: menu.Model,
  showBookmarks: S.Boolean,
  showFullUrls: S.Boolean,
  checkedFormats: S.Array(S.String),
  profile: S.String,
  theme: S.String,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    fileMenu: menu.init({ id: 'menubar-file' }),
    editMenu: menu.init({ id: 'menubar-edit' }),
    viewMenu: menu.init({ id: 'menubar-view' }),
    profilesMenu: menu.init({ id: 'menubar-profiles' }),
    subFileMenu: menu.init({ id: 'menubar-sub-file' }),
    subEditMenu: menu.init({ id: 'menubar-sub-edit' }),
    checkViewMenu: menu.init({ id: 'menubar-check-view' }),
    checkFormatMenu: menu.init({ id: 'menubar-check-format' }),
    radioProfilesMenu: menu.init({ id: 'menubar-radio-profiles' }),
    radioThemeMenu: menu.init({ id: 'menubar-radio-theme' }),
    iconFileMenu: menu.init({ id: 'menubar-icon-file' }),
    iconMoreMenu: menu.init({ id: 'menubar-icon-more' }),
    rtlFileMenu: menu.init({ id: 'menubar-rtl-file' }),
    showBookmarks: false,
    showFullUrls: true,
    checkedFormats: ['Strikethrough'],
    profile: 'Benoit',
    theme: 'System',
  },
  messages: [
    Message.GotFileMessage,
    Message.GotEditMessage,
    Message.GotViewMessage,
    Message.GotProfilesMessage,
    Message.GotSubFileMessage,
    Message.GotSubEditMessage,
    Message.GotCheckViewMessage,
    Message.GotCheckFormatMessage,
    Message.GotRadioProfilesMessage,
    Message.GotRadioThemeMessage,
    Message.GotIconFileMessage,
    Message.GotIconMoreMessage,
    Message.GotRtlFileMessage,
  ],
  handlers: (model: State) => ({
    GotFileMessage: (payload: typeof Message.GotFileMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.fileMenu),
        write: (state, next) => evo(state, { fileMenu: () => next }),
        toParentMessage: (message) => Message.GotFileMessage({ message }),
        foldOutMessage: foldIgnoredOutMessage,
      })(model, payload.message),
    GotEditMessage: (payload: typeof Message.GotEditMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.editMenu),
        write: (state, next) => evo(state, { editMenu: () => next }),
        toParentMessage: (message) => Message.GotEditMessage({ message }),
        foldOutMessage: foldIgnoredOutMessage,
      })(model, payload.message),
    GotViewMessage: (payload: typeof Message.GotViewMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.viewMenu),
        write: (state, next) => evo(state, { viewMenu: () => next }),
        toParentMessage: (message) => Message.GotViewMessage({ message }),
        foldOutMessage: foldCheckOutMessage,
      })(model, payload.message),
    GotProfilesMessage: (payload: typeof Message.GotProfilesMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.profilesMenu),
        write: (state, next) => evo(state, { profilesMenu: () => next }),
        toParentMessage: (message) => Message.GotProfilesMessage({ message }),
        foldOutMessage: foldProfileOutMessage,
      })(model, payload.message),
    GotSubFileMessage: (payload: typeof Message.GotSubFileMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.subFileMenu),
        write: (state, next) => evo(state, { subFileMenu: () => next }),
        toParentMessage: (message) => Message.GotSubFileMessage({ message }),
        foldOutMessage: foldIgnoredOutMessage,
      })(model, payload.message),
    GotSubEditMessage: (payload: typeof Message.GotSubEditMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.subEditMenu),
        write: (state, next) => evo(state, { subEditMenu: () => next }),
        toParentMessage: (message) => Message.GotSubEditMessage({ message }),
        foldOutMessage: foldIgnoredOutMessage,
      })(model, payload.message),
    GotCheckViewMessage: (payload: typeof Message.GotCheckViewMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.checkViewMenu),
        write: (state, next) => evo(state, { checkViewMenu: () => next }),
        toParentMessage: (message) => Message.GotCheckViewMessage({ message }),
        foldOutMessage: foldCheckOutMessage,
      })(model, payload.message),
    GotCheckFormatMessage: (payload: typeof Message.GotCheckFormatMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.checkFormatMenu),
        write: (state, next) => evo(state, { checkFormatMenu: () => next }),
        toParentMessage: (message) => Message.GotCheckFormatMessage({ message }),
        foldOutMessage: foldFormatOutMessage,
      })(model, payload.message),
    GotRadioProfilesMessage: (payload: typeof Message.GotRadioProfilesMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.radioProfilesMenu),
        write: (state, next) => evo(state, { radioProfilesMenu: () => next }),
        toParentMessage: (message) => Message.GotRadioProfilesMessage({ message }),
        foldOutMessage: foldProfileOutMessage,
      })(model, payload.message),
    GotRadioThemeMessage: (payload: typeof Message.GotRadioThemeMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.radioThemeMenu),
        write: (state, next) => evo(state, { radioThemeMenu: () => next }),
        toParentMessage: (message) => Message.GotRadioThemeMessage({ message }),
        foldOutMessage: foldThemeOutMessage,
      })(model, payload.message),
    GotIconFileMessage: (payload: typeof Message.GotIconFileMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.iconFileMenu),
        write: (state, next) => evo(state, { iconFileMenu: () => next }),
        toParentMessage: (message) => Message.GotIconFileMessage({ message }),
        foldOutMessage: foldIgnoredOutMessage,
      })(model, payload.message),
    GotIconMoreMessage: (payload: typeof Message.GotIconMoreMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.iconMoreMenu),
        write: (state, next) => evo(state, { iconMoreMenu: () => next }),
        toParentMessage: (message) => Message.GotIconMoreMessage({ message }),
        foldOutMessage: foldIgnoredOutMessage,
      })(model, payload.message),
    GotRtlFileMessage: (payload: typeof Message.GotRtlFileMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.rtlFileMenu),
        write: (state, next) => evo(state, { rtlFileMenu: () => next }),
        toParentMessage: (message) => Message.GotRtlFileMessage({ message }),
        foldOutMessage: foldIgnoredOutMessage,
      })(model, payload.message),
  }),
  samples: [],
})
