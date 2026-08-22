// Statically imported raw sources of every registry item. Vite inlines each
// `?raw` import, so the item pages can render the exact code users copy.

import animationSource from '@foldcn/registry/styles/default/ui/animation.ts?raw'
import buttonSource from '@foldcn/registry/styles/default/ui/button.ts?raw'
import calendarSource from '@foldcn/registry/styles/default/ui/calendar.ts?raw'
import cardSource from '@foldcn/registry/styles/default/ui/card.ts?raw'
import checkboxSource from '@foldcn/registry/styles/default/ui/checkbox.ts?raw'
import comboboxSource from '@foldcn/registry/styles/default/ui/combobox.ts?raw'
import datePickerSource from '@foldcn/registry/styles/default/ui/date-picker.ts?raw'
import dialogSource from '@foldcn/registry/styles/default/ui/dialog.ts?raw'
import disclosureSource from '@foldcn/registry/styles/default/ui/disclosure.ts?raw'
import dragAndDropSource from '@foldcn/registry/styles/default/ui/drag-and-drop.ts?raw'
import fieldsetSource from '@foldcn/registry/styles/default/ui/fieldset.ts?raw'
import fileDropSource from '@foldcn/registry/styles/default/ui/file-drop.ts?raw'
import iconsSource from '@foldcn/registry/styles/default/lib/icons.ts?raw'
import inputSource from '@foldcn/registry/styles/default/ui/input.ts?raw'
import listboxSource from '@foldcn/registry/styles/default/ui/listbox.ts?raw'
import menuSource from '@foldcn/registry/styles/default/ui/menu.ts?raw'
import navSource from '@foldcn/registry/styles/default/ui/nav.ts?raw'
import popoverSource from '@foldcn/registry/styles/default/ui/popover.ts?raw'
import radioGroupSource from '@foldcn/registry/styles/default/ui/radio-group.ts?raw'
import selectSource from '@foldcn/registry/styles/default/ui/select.ts?raw'
import sliderSource from '@foldcn/registry/styles/default/ui/slider.ts?raw'
import switchSource from '@foldcn/registry/styles/default/ui/switch.ts?raw'
import tabsSource from '@foldcn/registry/styles/default/ui/tabs.ts?raw'
import textareaSource from '@foldcn/registry/styles/default/ui/textarea.ts?raw'
import toastSource from '@foldcn/registry/styles/default/ui/toast.ts?raw'
import tooltipSource from '@foldcn/registry/styles/default/ui/tooltip.ts?raw'
import utilsSource from '@foldcn/registry/styles/default/lib/utils.ts?raw'
import virtualListSource from '@foldcn/registry/styles/default/ui/virtual-list.ts?raw'
import alertSource from '@foldcn/registry/styles/default/ui/alert.ts?raw'
import aspectRatioSource from '@foldcn/registry/styles/default/ui/aspect-ratio.ts?raw'
import avatarSource from '@foldcn/registry/styles/default/ui/avatar.ts?raw'
import badgeSource from '@foldcn/registry/styles/default/ui/badge.ts?raw'
import directionSource from '@foldcn/registry/styles/default/ui/direction.ts?raw'
import emptySource from '@foldcn/registry/styles/default/ui/empty.ts?raw'
import itemSource from '@foldcn/registry/styles/default/ui/item.ts?raw'
import kbdSource from '@foldcn/registry/styles/default/ui/kbd.ts?raw'
import labelSource from '@foldcn/registry/styles/default/ui/label.ts?raw'
import markerSource from '@foldcn/registry/styles/default/ui/marker.ts?raw'
import progressSource from '@foldcn/registry/styles/default/ui/progress.ts?raw'
import separatorSource from '@foldcn/registry/styles/default/ui/separator.ts?raw'
import skeletonSource from '@foldcn/registry/styles/default/ui/skeleton.ts?raw'
import spinnerSource from '@foldcn/registry/styles/default/ui/spinner.ts?raw'
import alertDialogSource from '@foldcn/registry/styles/default/ui/alert-dialog.ts?raw'
import sheetSource from '@foldcn/registry/styles/default/ui/sheet.ts?raw'
import drawerSource from '@foldcn/registry/styles/default/ui/drawer.ts?raw'
import hoverCardSource from '@foldcn/registry/styles/default/ui/hover-card.ts?raw'
import accordionSource from '@foldcn/registry/styles/default/ui/accordion.ts?raw'
import collapsibleSource from '@foldcn/registry/styles/default/ui/collapsible.ts?raw'
import contextMenuSource from '@foldcn/registry/styles/default/ui/context-menu.ts?raw'
import menubarSource from '@foldcn/registry/styles/default/ui/menubar.ts?raw'
import sonnerSource from '@foldcn/registry/styles/default/ui/sonner.ts?raw'
import buttonGroupSource from '@foldcn/registry/styles/default/ui/button-group.ts?raw'
import inputGroupSource from '@foldcn/registry/styles/default/ui/input-group.ts?raw'
import toggleSource from '@foldcn/registry/styles/default/ui/toggle.ts?raw'
import toggleGroupSource from '@foldcn/registry/styles/default/ui/toggle-group.ts?raw'
import inputOtpSource from '@foldcn/registry/styles/default/ui/input-otp.ts?raw'
import breadcrumbSource from '@foldcn/registry/styles/default/ui/breadcrumb.ts?raw'
import navigationMenuSource from '@foldcn/registry/styles/default/ui/navigation-menu.ts?raw'
import sidebarSource from '@foldcn/registry/styles/default/ui/sidebar.ts?raw'
import tableSource from '@foldcn/registry/styles/default/ui/table.ts?raw'
import commandSource from '@foldcn/registry/styles/default/ui/command.ts?raw'
import resizableSource from '@foldcn/registry/styles/default/ui/resizable.ts?raw'

import dataTableSource from '@foldcn/registry/styles/default/blocks/data-table/data-table.ts?raw'
import loginFormSource from '@foldcn/registry/styles/default/blocks/login-form/login-form.ts?raw'
import settingsPageSource from '@foldcn/registry/styles/default/blocks/settings-page/settings-page.ts?raw'

export type SourceEntry = Readonly<{ path: string; code: string }>

export const sourceByItem: Readonly<Record<string, SourceEntry>> = {
  animation: { path: 'registry/default/ui/animation.ts', code: animationSource },
  button: { path: 'registry/default/ui/button.ts', code: buttonSource },
  calendar: { path: 'registry/default/ui/calendar.ts', code: calendarSource },
  card: { path: 'registry/default/ui/card.ts', code: cardSource },
  checkbox: { path: 'registry/default/ui/checkbox.ts', code: checkboxSource },
  combobox: { path: 'registry/default/ui/combobox.ts', code: comboboxSource },
  'date-picker': {
    path: 'registry/default/ui/date-picker.ts',
    code: datePickerSource,
  },
  dialog: { path: 'registry/default/ui/dialog.ts', code: dialogSource },
  disclosure: { path: 'registry/default/ui/disclosure.ts', code: disclosureSource },
  'drag-and-drop': {
    path: 'registry/default/ui/drag-and-drop.ts',
    code: dragAndDropSource,
  },
  fieldset: { path: 'registry/default/ui/fieldset.ts', code: fieldsetSource },
  'file-drop': { path: 'registry/default/ui/file-drop.ts', code: fileDropSource },
  icons: { path: 'registry/default/lib/icons.ts', code: iconsSource },
  input: { path: 'registry/default/ui/input.ts', code: inputSource },
  listbox: { path: 'registry/default/ui/listbox.ts', code: listboxSource },
  menu: { path: 'registry/default/ui/menu.ts', code: menuSource },
  nav: { path: 'registry/default/ui/nav.ts', code: navSource },
  popover: { path: 'registry/default/ui/popover.ts', code: popoverSource },
  'radio-group': {
    path: 'registry/default/ui/radio-group.ts',
    code: radioGroupSource,
  },
  select: { path: 'registry/default/ui/select.ts', code: selectSource },
  slider: { path: 'registry/default/ui/slider.ts', code: sliderSource },
  switch: { path: 'registry/default/ui/switch.ts', code: switchSource },
  tabs: { path: 'registry/default/ui/tabs.ts', code: tabsSource },
  textarea: { path: 'registry/default/ui/textarea.ts', code: textareaSource },
  toast: { path: 'registry/default/ui/toast.ts', code: toastSource },
  tooltip: { path: 'registry/default/ui/tooltip.ts', code: tooltipSource },
  utils: { path: 'registry/default/lib/utils.ts', code: utilsSource },
  'virtual-list': {
    path: 'registry/default/ui/virtual-list.ts',
    code: virtualListSource,
  },
  alert: { path: 'registry/default/ui/alert.ts', code: alertSource },
  'aspect-ratio': { path: 'registry/default/ui/aspect-ratio.ts', code: aspectRatioSource },
  avatar: { path: 'registry/default/ui/avatar.ts', code: avatarSource },
  badge: { path: 'registry/default/ui/badge.ts', code: badgeSource },
  direction: { path: 'registry/default/ui/direction.ts', code: directionSource },
  empty: { path: 'registry/default/ui/empty.ts', code: emptySource },
  item: { path: 'registry/default/ui/item.ts', code: itemSource },
  kbd: { path: 'registry/default/ui/kbd.ts', code: kbdSource },
  label: { path: 'registry/default/ui/label.ts', code: labelSource },
  marker: { path: 'registry/default/ui/marker.ts', code: markerSource },
  progress: { path: 'registry/default/ui/progress.ts', code: progressSource },
  separator: { path: 'registry/default/ui/separator.ts', code: separatorSource },
  skeleton: { path: 'registry/default/ui/skeleton.ts', code: skeletonSource },
  spinner: { path: 'registry/default/ui/spinner.ts', code: spinnerSource },
  'alert-dialog': { path: 'registry/default/ui/alert-dialog.ts', code: alertDialogSource },
  sheet: { path: 'registry/default/ui/sheet.ts', code: sheetSource },
  drawer: { path: 'registry/default/ui/drawer.ts', code: drawerSource },
  'hover-card': { path: 'registry/default/ui/hover-card.ts', code: hoverCardSource },
  accordion: { path: 'registry/default/ui/accordion.ts', code: accordionSource },
  collapsible: { path: 'registry/default/ui/collapsible.ts', code: collapsibleSource },
  'context-menu': { path: 'registry/default/ui/context-menu.ts', code: contextMenuSource },
  menubar: { path: 'registry/default/ui/menubar.ts', code: menubarSource },
  sonner: { path: 'registry/default/ui/sonner.ts', code: sonnerSource },
  'button-group': { path: 'registry/default/ui/button-group.ts', code: buttonGroupSource },
  'input-group': { path: 'registry/default/ui/input-group.ts', code: inputGroupSource },
  toggle: { path: 'registry/default/ui/toggle.ts', code: toggleSource },
  'toggle-group': { path: 'registry/default/ui/toggle-group.ts', code: toggleGroupSource },
  'input-otp': { path: 'registry/default/ui/input-otp.ts', code: inputOtpSource },
  breadcrumb: { path: 'registry/default/ui/breadcrumb.ts', code: breadcrumbSource },
  'navigation-menu': { path: 'registry/default/ui/navigation-menu.ts', code: navigationMenuSource },
  sidebar: { path: 'registry/default/ui/sidebar.ts', code: sidebarSource },
  table: { path: 'registry/default/ui/table.ts', code: tableSource },
  command: { path: 'registry/default/ui/command.ts', code: commandSource },
  resizable: { path: 'registry/default/ui/resizable.ts', code: resizableSource },
  'data-table': {
    path: 'registry/default/blocks/data-table/data-table.ts',
    code: dataTableSource,
  },
  'login-form': {
    path: 'registry/default/blocks/login-form/login-form.ts',
    code: loginFormSource,
  },
  'settings-page': {
    path: 'registry/default/blocks/settings-page/settings-page.ts',
    code: settingsPageSource,
  },
}
