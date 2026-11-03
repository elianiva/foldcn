import { Update } from 'foldkit'
import { Option } from 'effect'
import { Schema as S } from 'effect'
import { modifyFields } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { ChildAttribute, Html, HtmlBuilder } from 'foldkit/html'

import { Menu as FoldkitMenu } from '@foldkit/ui'
import { CircleHelp, File, Folder, Save, Settings, Trash2 } from 'lucide'
import type { IconNode } from 'lucide'

import * as Menubar from '../../generated/registry/ui/menubar'
import { icon } from '../../generated/registry/lib/icons'

import { DemoMenu } from '../bundles'
import { keepOpenOnSelect, subMenu } from '../menu-family'
import { cn } from '../../generated/registry/lib/utils'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

// Menus that share one bar. Traversal is coordinated here because each
// trigger is an independent Menu model (the primitive has no menubar model).
const bars = {
  demo: ['fileMenu', 'editMenu', 'viewMenu', 'profilesMenu'],
  submenu: ['subFileMenu', 'subEditMenu'],
  checkbox: ['checkViewMenu', 'checkFormatMenu'],
  radio: ['radioProfilesMenu', 'radioThemeMenu'],
  icons: ['iconFileMenu', 'iconMoreMenu'],
} as const
const BarName = S.Literals(['demo', 'submenu', 'checkbox', 'radio', 'icons'])
type BarName = typeof BarName.Type

export const Message = defineMessageUnion({
  GotFileMessage: { message: Menubar.Message },
  GotEditMessage: { message: Menubar.Message },
  GotViewMessage: { message: Menubar.Message },
  GotProfilesMessage: { message: Menubar.Message },
  GotSubFileMessage: { message: Menubar.Message },
  GotSubEditMessage: { message: Menubar.Message },
  GotCheckViewMessage: { message: Menubar.Message },
  GotCheckFormatMessage: { message: Menubar.Message },
  GotRadioProfilesMessage: { message: Menubar.Message },
  GotRadioThemeMessage: { message: Menubar.Message },
  GotIconFileMessage: { message: Menubar.Message },
  GotIconMoreMessage: { message: Menubar.Message },
  GotRtlFileMessage: { message: Menubar.Message },
  GotSubFileShareMessage: { message: Menubar.Message },
  OpenedSubFileShare: {},
  ClosedSubFileShare: {},
  GotSubEditFindMessage: { message: Menubar.Message },
  OpenedSubEditFind: {},
  ClosedSubEditFind: {},
  HoveredMenubarTrigger: { bar: BarName, index: S.Number },
  SteppedMenubar: { bar: BarName, index: S.Number, direction: S.Literals(['Previous', 'Next']) },
})

// Mirrors apps/v4/examples/base/menubar-*.tsx. Every bar below is a live menu:
// keyboard nav, typeahead, disabled items, groups/separators, and selection
// all work. Item kinds are foldcn-built over the primitive's flat
// `{ className, content }` rows: check and radio rows keep their menu open
// (`keepOpenOnSelect`), the "With Submenu" bars nest a second menu (`subMenu`), and
// inset/destructive rows use the foldcn row classes. See menu-family.ts. The
// File/Edit bars in the first section still render Share/Find as labelled
// groups.

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
      Menubar.menubarCheckboxIndicator(h, checked),
      label,
      ...(text === undefined ? [] : [shortcut(h, text)]),
    ],
  )

const radioRow = (h: HtmlBuilder<AppMessage>, label: string, selected: boolean): Html =>
  h.span([h.Class(rowClass)], [Menubar.menubarRadioIndicator(h, selected), label])

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

// Upstream menubar-demo.tsx items, in order. Inset rows (upstream `inset`) use
// the foldcn inset row class; check/radio rows use the checkbox/radio item
// classes (indicator room on the left, highlight via data-active).
const INSET = Menubar.menubarItemInsetClass
const checkItemClass = Menubar.menubarCheckboxItemClass
const radioItemClass = Menubar.menubarRadioItemClass

const VIEW_ITEMS = [
  'Bookmarks Bar',
  'Full URLs',
  'Reload',
  'Force Reload',
  'Toggle Fullscreen',
  'Hide Sidebar',
] as const
const CHECK_VIEW_ITEMS = [
  'Always Show Bookmarks Bar',
  'Always Show Full URLs',
  'Reload',
  'Force Reload',
] as const
const PROFILE_ITEMS = ['Andy', 'Benoit', 'Luis', 'Edit...', 'Add Profile...'] as const
const FORMAT_ITEMS = ['Strikethrough', 'Code', 'Superscript'] as const
const THEME_ITEMS = ['Light', 'Dark', 'System'] as const

const fileItems = [
  'New Tab',
  'New Window',
  'New Incognito Window',
  'Email link',
  'Messages',
  'Notes',
  'Print...',
] as const

const fileGroupKey = (item: string): string => {
  if (item === 'Email link' || item === 'Messages' || item === 'Notes') return 'share'
  if (item === 'Print...') return 'print'
  return 'main'
}

const editItems = [
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

const editGroupKey = (item: string): string => {
  if (
    item === 'Search the web' ||
    item === 'Find...' ||
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
    case 'Print...':
      return labelRow(h, 'Print...', '⌘P')
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

const nav = (h: HtmlBuilder<AppMessage>, bar: BarName, index: number) =>
  Menubar.navigationAttributes({
    h,
    onHoverTrigger: Message.HoveredMenubarTrigger({ bar, index }),
    onStep: (direction) => Message.SteppedMenubar({ bar, index, direction }),
  })

// A submenu row's trigger menu also gets ArrowRight-opens-submenu on its panel;
// merge that with the bar's own panel keys.
const navWith = (
  h: HtmlBuilder<AppMessage>,
  bar: BarName,
  index: number,
  extraContent: ReadonlyArray<ChildAttribute>,
) => {
  const { triggerAttributes, contentAttributes } = nav(h, bar, index)
  return { triggerAttributes, contentAttributes: [...contentAttributes, ...extraContent] }
}

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
                ...nav(h, 'demo', 0),
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
                ...nav(h, 'demo', 1),
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
                ...nav(h, 'demo', 2),
                items: [...VIEW_ITEMS],
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
                ...nav(h, 'demo', 3),
                items: [...PROFILE_ITEMS],
                buttonContent: h.span([], ['Profiles']),
                itemToConfig: (item) => {
                  if (item === 'Edit...' || item === 'Add Profile...')
                    return { className: INSET, content: labelRow(h, item) }
                  return {
                    className: radioItemClass,
                    content: radioRow(h, item, model.profile === item),
                  }
                },
                itemGroupKey: (item) =>
                  item === 'Edit...' ? 'edit' : item === 'Add Profile...' ? 'add' : 'profiles',
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
          bar(h, [
            h.submodel({
              slotId: model.subFileMenu.id,
              model: model.subFileMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                ...navWith(
                  h,
                  'submenu',
                  0,
                  fileSub.parentKeys(h, model, Message.OpenedSubFileShare()),
                ),
                items: ['Share', 'Print...'],
                buttonContent: h.span([], ['File']),
                itemsClass: 'w-44',
                itemGroupKey: (item) => (item === 'Print...' ? 'print' : 'share'),
                itemToConfig: (item) =>
                  item === 'Share'
                    ? {
                        className: cn(
                          Menubar.menubarSubTriggerClass,
                          model.subFileShareMenu.isOpen && Menubar.menubarSubTriggerOpenClass,
                        ),
                        content: h.submodel({
                          slotId: model.subFileShareMenu.id,
                          model: model.subFileShareMenu,
                          view: DemoMenu.view,
                          viewInputs: Menubar.subViewInputs<string>({
                            items: ['Email link', 'Messages', 'Notes'],
                            buttonContent: h.span(
                              [h.Class('flex w-full items-center')],
                              [h.span([], [item]), Menubar.menubarSubTriggerChevron(h)],
                            ),
                            itemsClass: 'w-40',
                            contentAttributes: fileSub.subKeys(h, Message.ClosedSubFileShare()),
                            itemToConfig: (subItem) => ({ content: labelRow(h, subItem) }),
                          }),
                          toParentMessage: (message) => Message.GotSubFileShareMessage({ message }),
                        }),
                      }
                    : { content: fileContent(h, item) },
              }),
              toParentMessage: (message) => Message.GotSubFileMessage({ message }),
            }),
            h.submodel({
              slotId: model.subEditMenu.id,
              model: model.subEditMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                ...navWith(
                  h,
                  'submenu',
                  1,
                  editSub.parentKeys(h, model, Message.OpenedSubEditFind()),
                ),
                items: ['Undo', 'Redo', 'Find', 'Cut', 'Copy', 'Paste'],
                buttonContent: h.span([], ['Edit']),
                itemsClass: 'w-44',
                itemGroupKey: (item) =>
                  item === 'Find' ? 'find' : item === 'Undo' || item === 'Redo' ? 'main' : 'action',
                itemToConfig: (item) =>
                  item === 'Find'
                    ? {
                        className: cn(
                          Menubar.menubarSubTriggerClass,
                          model.subEditFindMenu.isOpen && Menubar.menubarSubTriggerOpenClass,
                        ),
                        content: h.submodel({
                          slotId: model.subEditFindMenu.id,
                          model: model.subEditFindMenu,
                          view: DemoMenu.view,
                          viewInputs: Menubar.subViewInputs<string>({
                            items: ['Search the web', 'Find...', 'Find Next', 'Find Previous'],
                            buttonContent: h.span(
                              [h.Class('flex w-full items-center')],
                              [h.span([], [item]), Menubar.menubarSubTriggerChevron(h)],
                            ),
                            itemsClass: 'w-44',
                            contentAttributes: editSub.subKeys(h, Message.ClosedSubEditFind()),
                            itemToConfig: (subItem) => ({ content: labelRow(h, subItem) }),
                          }),
                          toParentMessage: (message) => Message.GotSubEditFindMessage({ message }),
                        }),
                      }
                    : { content: editContent(h, item) },
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
                ...nav(h, 'checkbox', 0),
                items: [...CHECK_VIEW_ITEMS],
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
                ...nav(h, 'checkbox', 1),
                items: [...FORMAT_ITEMS],
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
                ...nav(h, 'radio', 0),
                items: [...PROFILE_ITEMS],
                buttonContent: h.span([], ['Profiles']),
                itemToConfig: (item) => {
                  if (item === 'Edit...' || item === 'Add Profile...')
                    return { className: INSET, content: labelRow(h, item) }
                  return {
                    className: radioItemClass,
                    content: radioRow(h, item, model.profile === item),
                  }
                },
                itemGroupKey: (item) =>
                  item === 'Edit...' ? 'edit' : item === 'Add Profile...' ? 'add' : 'profiles',
              }),
              toParentMessage: (message) => Message.GotRadioProfilesMessage({ message }),
            }),
            h.submodel({
              slotId: model.radioThemeMenu.id,
              model: model.radioThemeMenu,
              view: DemoMenu.view,
              viewInputs: Menubar.viewInputs<string>({
                ...nav(h, 'radio', 1),
                items: [...THEME_ITEMS],
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
                ...nav(h, 'icons', 0),
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
                ...nav(h, 'icons', 1),
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
                        className: Menubar.menubarItemDestructiveClass,
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
                  'Each trigger is an independent menu; the bar’s update coordinates them — hovering another trigger while a menu is open, or pressing ArrowLeft/Right, switches the open menu (the primitive has no menubar model).',
                ],
              ),
              h.li(
                [],
                [
                  'Submenus open on click, Enter/Space, or ArrowRight (not on hover); checkbox and radio rows keep the menu open.',
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )

const foldIgnored = (): Update.Step<State, AppMessage> => (model) => ({ model })

// Bookmarks/Full URLs checkboxes (demo-bar View + checkbox-section View share
// state — labels differ, values map to the same flags).
const isCheckRow = (value: string): boolean =>
  value.includes('Bookmarks') || value.includes('Full URLs')

const isProfileRow = (value: string): boolean => value !== 'Edit...' && value !== 'Add Profile...'

const applyCheck = (model: State, value: string): State =>
  value === 'Bookmarks Bar' || value === 'Always Show Bookmarks Bar'
    ? modifyFields(model, { showBookmarks: () => !model.showBookmarks })
    : value === 'Full URLs' || value === 'Always Show Full URLs'
      ? modifyFields(model, { showFullUrls: () => !model.showFullUrls })
      : model

const applyFormat = (model: State, value: string): State =>
  modifyFields(model, {
    checkedFormats: () =>
      model.checkedFormats.includes(value)
        ? model.checkedFormats.filter((entry) => entry !== value)
        : [...model.checkedFormats, value],
  })

const applyProfile = (model: State, value: string): State =>
  modifyFields(model, { profile: () => value })

const applyTheme = (model: State, value: string): State =>
  modifyFields(model, { theme: () => value })

// "With Submenu" bars: File › Share and Edit › Find (see menu-family.ts).
const fileSub = subMenu<State, AppMessage>({
  readParent: (model) => model.subFileMenu,
  writeParent: (model, next) => modifyFields(model, { subFileMenu: () => next }),
  readSub: (model) => model.subFileShareMenu,
  writeSub: (model, next) => modifyFields(model, { subFileShareMenu: () => next }),
  toParentMessage: (message) => Message.GotSubFileMessage({ message }),
  toSubMessage: (message) => Message.GotSubFileShareMessage({ message }),
  subIndex: 0,
  foldParentSelected: foldIgnored,
  foldSubSelected: foldIgnored,
})

const editSub = subMenu<State, AppMessage>({
  readParent: (model) => model.subEditMenu,
  writeParent: (model, next) => modifyFields(model, { subEditMenu: () => next }),
  readSub: (model) => model.subEditFindMenu,
  writeSub: (model, next) => modifyFields(model, { subEditFindMenu: () => next }),
  toParentMessage: (message) => Message.GotSubEditMessage({ message }),
  toSubMessage: (message) => Message.GotSubEditFindMessage({ message }),
  subIndex: 2,
  foldParentSelected: foldIgnored,
  foldSubSelected: foldIgnored,
})

const fields = {
  fileMenu: Menubar.Model,
  editMenu: Menubar.Model,
  viewMenu: Menubar.Model,
  profilesMenu: Menubar.Model,
  subFileMenu: Menubar.Model,
  subEditMenu: Menubar.Model,
  subFileShareMenu: Menubar.Model,
  subEditFindMenu: Menubar.Model,
  checkViewMenu: Menubar.Model,
  checkFormatMenu: Menubar.Model,
  radioProfilesMenu: Menubar.Model,
  radioThemeMenu: Menubar.Model,
  iconFileMenu: Menubar.Model,
  iconMoreMenu: Menubar.Model,
  rtlFileMenu: Menubar.Model,
  showBookmarks: S.Boolean,
  showFullUrls: S.Boolean,
  checkedFormats: S.Array(S.String),
  profile: S.String,
  theme: S.String,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

const menuMessages = {
  fileMenu: Message.GotFileMessage,
  editMenu: Message.GotEditMessage,
  viewMenu: Message.GotViewMessage,
  profilesMenu: Message.GotProfilesMessage,
  subFileMenu: Message.GotSubFileMessage,
  subEditMenu: Message.GotSubEditMessage,
  checkViewMenu: Message.GotCheckViewMessage,
  checkFormatMenu: Message.GotCheckFormatMessage,
  radioProfilesMenu: Message.GotRadioProfilesMessage,
  radioThemeMenu: Message.GotRadioThemeMessage,
  iconFileMenu: Message.GotIconFileMessage,
  iconMoreMenu: Message.GotIconMoreMessage,
} as const
type MenuField = keyof typeof menuMessages

// Runs `update` on one menu of the bar, lifting its commands to the slice.
const menuStep = (
  field: MenuField,
  update: (menu: Menubar.Model) => ReturnType<typeof DemoMenu.close>,
) =>
  Update.foldChildStep({
    update,
    read: (state: State) => Option.some(state[field]),
    write: (state, next) => ({ ...state, [field]: next }),
    toParentMessage: (message) => menuMessages[field]({ message }),
    foldOutMessage: foldIgnored,
  })

const openMenu = (field: MenuField, maybeActiveItemIndex: Option.Option<number>) =>
  menuStep(field, (menu) =>
    DemoMenu.update(menu, FoldkitMenu.Message.Opened({ maybeActiveItemIndex })),
  )

const focusTrigger = (field: MenuField) =>
  menuStep(field, (menu) => ({
    model: menu,
    commands: [FoldkitMenu.FocusButton({ id: menu.id })],
  }))

// A bar menu with a submenu row: the row's position and the nested menu.
const SUB_ROWS: Partial<
  Record<MenuField, { index: number; sub: 'subFileShareMenu' | 'subEditFindMenu' }>
> = {
  subFileMenu: { index: 0, sub: 'subFileShareMenu' },
  subEditMenu: { index: 2, sub: 'subEditFindMenu' },
}

// Closes a bar menu together with its submenu. The submenu closes quietly (no
// focus command) so focus is left to the menu that opens next.
const closeBarMenu =
  (field: MenuField): Update.Step<State, AppMessage> =>
  (model) => {
    const subRow = SUB_ROWS[field]
    const quiet: State =
      subRow === undefined
        ? model
        : modifyFields(model, {
            [subRow.sub]: () => ({
              ...model[subRow.sub],
              isOpen: false,
              maybeActiveItemIndex: Option.none(),
            }),
          } as Partial<Record<typeof subRow.sub, () => Menubar.Model>>)
    return menuStep(field, DemoMenu.close)(quiet)
  }

// Hovering another trigger while a menu is open moves the open menu over.
const hoverTrigger = (model: State, bar: BarName, index: number): UpdateReturn => {
  const fieldsInBar: ReadonlyArray<MenuField> = bars[bar]
  const target = fieldsInBar[index]
  if (target === undefined) return { model }
  const hasOtherOpen = fieldsInBar.some((field) => field !== target && model[field].isOpen)
  if (!hasOtherOpen || model[target].isOpen) return { model }
  return Update.combine(model, [
    ...fieldsInBar.filter((field) => field !== target).map(closeBarMenu),
    openMenu(target, Option.none()),
  ])
}

// ArrowLeft/Right wraps around the bar: an open menu hands over to the
// neighbour (first item active), a closed bar just moves trigger focus.
const stepBar = (
  model: State,
  bar: BarName,
  index: number,
  direction: 'Previous' | 'Next',
): UpdateReturn => {
  const fieldsInBar: ReadonlyArray<MenuField> = bars[bar]
  const count = fieldsInBar.length
  const target = fieldsInBar[(index + (direction === 'Next' ? 1 : count - 1)) % count]
  if (target === undefined || target === fieldsInBar[index]) return { model }
  // ArrowRight on a submenu row opens the submenu (see parentKeys); it must
  // not also hand over to the next menu.
  const current = fieldsInBar[index]
  const subRow = current === undefined ? undefined : SUB_ROWS[current]
  if (
    direction === 'Next' &&
    current !== undefined &&
    subRow !== undefined &&
    (model[subRow.sub].isOpen ||
      Option.exists(model[current].maybeActiveItemIndex, (active) => active === subRow.index))
  )
    return { model }
  if (!fieldsInBar.some((field) => model[field].isOpen))
    return Update.combine(model, [focusTrigger(target)])
  return Update.combine(model, [
    ...fieldsInBar.filter((field) => field !== target).map(closeBarMenu),
    openMenu(target, Option.some(0)),
  ])
}

export const slice = defineSlice({
  fields,
  init: {
    fileMenu: Menubar.init({ id: 'menubar-file' }),
    editMenu: Menubar.init({ id: 'menubar-edit' }),
    viewMenu: Menubar.init({ id: 'menubar-view' }),
    profilesMenu: Menubar.init({ id: 'menubar-profiles' }),
    subFileMenu: Menubar.init({ id: 'menubar-sub-file' }),
    subEditMenu: Menubar.init({ id: 'menubar-sub-edit' }),
    subFileShareMenu: Menubar.init({ id: 'menubar-sub-file-share', isAnimated: false }),
    subEditFindMenu: Menubar.init({ id: 'menubar-sub-edit-find', isAnimated: false }),
    checkViewMenu: Menubar.init({ id: 'menubar-check-view' }),
    checkFormatMenu: Menubar.init({ id: 'menubar-check-format' }),
    radioProfilesMenu: Menubar.init({ id: 'menubar-radio-profiles' }),
    radioThemeMenu: Menubar.init({ id: 'menubar-radio-theme' }),
    iconFileMenu: Menubar.init({ id: 'menubar-icon-file' }),
    iconMoreMenu: Menubar.init({ id: 'menubar-icon-more' }),
    rtlFileMenu: Menubar.init({ id: 'menubar-rtl-file' }),
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
    Message.GotSubFileShareMessage,
    Message.OpenedSubFileShare,
    Message.ClosedSubFileShare,
    Message.GotSubEditFindMessage,
    Message.OpenedSubEditFind,
    Message.ClosedSubEditFind,
    Message.HoveredMenubarTrigger,
    Message.SteppedMenubar,
  ],
  handlers: (model: State) => ({
    HoveredMenubarTrigger: ({
      bar,
      index,
    }: typeof Message.HoveredMenubarTrigger.Type): UpdateReturn => hoverTrigger(model, bar, index),
    SteppedMenubar: ({ bar, index, direction }: typeof Message.SteppedMenubar.Type): UpdateReturn =>
      stepBar(model, bar, index, direction),
    GotFileMessage: (payload: typeof Message.GotFileMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.fileMenu),
        write: (state, next) => modifyFields(state, { fileMenu: () => next }),
        toParentMessage: (message) => Message.GotFileMessage({ message }),
        foldOutMessage: foldIgnored,
      })(model, payload.message),
    GotEditMessage: (payload: typeof Message.GotEditMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.editMenu),
        write: (state, next) => modifyFields(state, { editMenu: () => next }),
        toParentMessage: (message) => Message.GotEditMessage({ message }),
        foldOutMessage: foldIgnored,
      })(model, payload.message),
    GotViewMessage: (payload: typeof Message.GotViewMessage.Type): UpdateReturn =>
      keepOpenOnSelect<State, AppMessage>({
        items: VIEW_ITEMS,
        readMenu: (state) => state.viewMenu,
        isKept: isCheckRow,
        onSelected: (value) => (state) => ({ model: applyCheck(state, value) }),
        forward: (state, message) =>
          Update.foldChild({
            update: DemoMenu.update,
            read: (current: State) => Option.some(current.viewMenu),
            write: (current, next) => modifyFields(current, { viewMenu: () => next }),
            toParentMessage: (inner) => Message.GotViewMessage({ message: inner }),
            foldOutMessage: foldIgnored,
          })(state, message),
      })(model, payload.message),
    GotProfilesMessage: (payload: typeof Message.GotProfilesMessage.Type): UpdateReturn =>
      keepOpenOnSelect<State, AppMessage>({
        items: PROFILE_ITEMS,
        readMenu: (state) => state.profilesMenu,
        isKept: isProfileRow,
        onSelected: (value) => (state) => ({ model: applyProfile(state, value) }),
        forward: (state, message) =>
          Update.foldChild({
            update: DemoMenu.update,
            read: (current: State) => Option.some(current.profilesMenu),
            write: (current, next) => modifyFields(current, { profilesMenu: () => next }),
            toParentMessage: (inner) => Message.GotProfilesMessage({ message: inner }),
            foldOutMessage: foldIgnored,
          })(state, message),
      })(model, payload.message),
    GotSubFileMessage: (payload: typeof Message.GotSubFileMessage.Type): UpdateReturn =>
      fileSub.handleParent(model, payload.message),
    GotSubEditMessage: (payload: typeof Message.GotSubEditMessage.Type): UpdateReturn =>
      editSub.handleParent(model, payload.message),
    GotCheckViewMessage: (payload: typeof Message.GotCheckViewMessage.Type): UpdateReturn =>
      keepOpenOnSelect<State, AppMessage>({
        items: CHECK_VIEW_ITEMS,
        readMenu: (state) => state.checkViewMenu,
        isKept: isCheckRow,
        onSelected: (value) => (state) => ({ model: applyCheck(state, value) }),
        forward: (state, message) =>
          Update.foldChild({
            update: DemoMenu.update,
            read: (current: State) => Option.some(current.checkViewMenu),
            write: (current, next) => modifyFields(current, { checkViewMenu: () => next }),
            toParentMessage: (inner) => Message.GotCheckViewMessage({ message: inner }),
            foldOutMessage: foldIgnored,
          })(state, message),
      })(model, payload.message),
    GotCheckFormatMessage: (payload: typeof Message.GotCheckFormatMessage.Type): UpdateReturn =>
      keepOpenOnSelect<State, AppMessage>({
        items: FORMAT_ITEMS,
        readMenu: (state) => state.checkFormatMenu,
        isKept: () => true,
        onSelected: (value) => (state) => ({ model: applyFormat(state, value) }),
        forward: (state, message) =>
          Update.foldChild({
            update: DemoMenu.update,
            read: (current: State) => Option.some(current.checkFormatMenu),
            write: (current, next) => modifyFields(current, { checkFormatMenu: () => next }),
            toParentMessage: (inner) => Message.GotCheckFormatMessage({ message: inner }),
            foldOutMessage: foldIgnored,
          })(state, message),
      })(model, payload.message),
    GotRadioProfilesMessage: (payload: typeof Message.GotRadioProfilesMessage.Type): UpdateReturn =>
      keepOpenOnSelect<State, AppMessage>({
        items: PROFILE_ITEMS,
        readMenu: (state) => state.radioProfilesMenu,
        isKept: isProfileRow,
        onSelected: (value) => (state) => ({ model: applyProfile(state, value) }),
        forward: (state, message) =>
          Update.foldChild({
            update: DemoMenu.update,
            read: (current: State) => Option.some(current.radioProfilesMenu),
            write: (current, next) => modifyFields(current, { radioProfilesMenu: () => next }),
            toParentMessage: (inner) => Message.GotRadioProfilesMessage({ message: inner }),
            foldOutMessage: foldIgnored,
          })(state, message),
      })(model, payload.message),
    GotRadioThemeMessage: (payload: typeof Message.GotRadioThemeMessage.Type): UpdateReturn =>
      keepOpenOnSelect<State, AppMessage>({
        items: THEME_ITEMS,
        readMenu: (state) => state.radioThemeMenu,
        isKept: () => true,
        onSelected: (value) => (state) => ({ model: applyTheme(state, value) }),
        forward: (state, message) =>
          Update.foldChild({
            update: DemoMenu.update,
            read: (current: State) => Option.some(current.radioThemeMenu),
            write: (current, next) => modifyFields(current, { radioThemeMenu: () => next }),
            toParentMessage: (inner) => Message.GotRadioThemeMessage({ message: inner }),
            foldOutMessage: foldIgnored,
          })(state, message),
      })(model, payload.message),
    GotIconFileMessage: (payload: typeof Message.GotIconFileMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.iconFileMenu),
        write: (state, next) => modifyFields(state, { iconFileMenu: () => next }),
        toParentMessage: (message) => Message.GotIconFileMessage({ message }),
        foldOutMessage: foldIgnored,
      })(model, payload.message),
    GotIconMoreMessage: (payload: typeof Message.GotIconMoreMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.iconMoreMenu),
        write: (state, next) => modifyFields(state, { iconMoreMenu: () => next }),
        toParentMessage: (message) => Message.GotIconMoreMessage({ message }),
        foldOutMessage: foldIgnored,
      })(model, payload.message),
    GotRtlFileMessage: (payload: typeof Message.GotRtlFileMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: DemoMenu.update,
        read: (state: State) => Option.some(state.rtlFileMenu),
        write: (state, next) => modifyFields(state, { rtlFileMenu: () => next }),
        toParentMessage: (message) => Message.GotRtlFileMessage({ message }),
        foldOutMessage: foldIgnored,
      })(model, payload.message),
    GotSubFileShareMessage: (payload: typeof Message.GotSubFileShareMessage.Type): UpdateReturn =>
      fileSub.handleSub(model, payload.message),
    OpenedSubFileShare: (): UpdateReturn => fileSub.openSub(model),
    ClosedSubFileShare: (): UpdateReturn => fileSub.closeSub(model),
    GotSubEditFindMessage: (payload: typeof Message.GotSubEditFindMessage.Type): UpdateReturn =>
      editSub.handleSub(model, payload.message),
    OpenedSubEditFind: (): UpdateReturn => editSub.openSub(model),
    ClosedSubEditFind: (): UpdateReturn => editSub.closeSub(model),
  }),
  samples: [],
})
