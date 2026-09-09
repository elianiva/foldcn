import type { DemoItemName } from './view'

import alertViewSource from './views/alert.ts?raw'
import animationViewSource from './views/animation.ts?raw'
import aspectRatioViewSource from './views/aspect-ratio.ts?raw'
import attachmentViewSource from './views/attachment.ts?raw'
import avatarViewSource from './views/avatar.ts?raw'
import badgeViewSource from './views/badge.ts?raw'
import buttonViewSource from './views/button.ts?raw'
import calendarViewSource from './views/calendar.ts?raw'
import cardViewSource from './views/card.ts?raw'
import checkboxViewSource from './views/checkbox.ts?raw'
import comboboxViewSource from './views/combobox.ts?raw'
import dataTableViewSource from './views/data-table.ts?raw'
import datePickerViewSource from './views/date-picker.ts?raw'
import dialogViewSource from './views/dialog.ts?raw'
import directionViewSource from './views/direction.ts?raw'
import dragAndDropViewSource from './views/drag-and-drop.ts?raw'
import emptyViewSource from './views/empty.ts?raw'
import fieldsetViewSource from './views/fieldset.ts?raw'
import fileDropViewSource from './views/file-drop.ts?raw'
import iconsViewSource from './views/icons.ts?raw'
import inputViewSource from './views/input.ts?raw'
import itemViewSource from './views/item.ts?raw'
import kbdViewSource from './views/kbd.ts?raw'
import labelViewSource from './views/label.ts?raw'
import listboxViewSource from './views/listbox.ts?raw'
import loginFormViewSource from './views/login-form.ts?raw'
import markerViewSource from './views/marker.ts?raw'
import menuViewSource from './views/menu.ts?raw'
import nativeSelectViewSource from './views/native-select.ts?raw'
import navViewSource from './views/nav.ts?raw'
import popoverViewSource from './views/popover.ts?raw'
import progressViewSource from './views/progress.ts?raw'
import questionnaireViewSource from './views/questionnaire.ts?raw'
import radioGroupViewSource from './views/radio-group.ts?raw'
import selectViewSource from './views/select.ts?raw'
import separatorViewSource from './views/separator.ts?raw'
import settingsPageViewSource from './views/settings-page.ts?raw'
import skeletonViewSource from './views/skeleton.ts?raw'
import sliderViewSource from './views/slider.ts?raw'
import spinnerViewSource from './views/spinner.ts?raw'
import alertDialogViewSource from './views/alert-dialog.ts?raw'
import sheetViewSource from './views/sheet.ts?raw'
import drawerViewSource from './views/drawer.ts?raw'
import hoverCardViewSource from './views/hover-card.ts?raw'
import accordionViewSource from './views/accordion.ts?raw'
import collapsibleViewSource from './views/collapsible.ts?raw'
import contextMenuViewSource from './views/context-menu.ts?raw'
import menubarViewSource from './views/menubar.ts?raw'
import buttonGroupViewSource from './views/button-group.ts?raw'
import inputGroupViewSource from './views/input-group.ts?raw'
import toggleViewSource from './views/toggle.ts?raw'
import toggleGroupViewSource from './views/toggle-group.ts?raw'
import inputOtpViewSource from './views/input-otp.ts?raw'
import breadcrumbViewSource from './views/breadcrumb.ts?raw'
import navigationMenuViewSource from './views/navigation-menu.ts?raw'
import sidebarViewSource from './views/sidebar.ts?raw'
import tableViewSource from './views/table.ts?raw'
import commandViewSource from './views/command.ts?raw'
import resizableViewSource from './views/resizable.ts?raw'
import switchViewSource from './views/switch.ts?raw'
import tabsViewSource from './views/tabs.ts?raw'
import textareaViewSource from './views/textarea.ts?raw'
import toastViewSource from './views/toast.ts?raw'
import tooltipViewSource from './views/tooltip.ts?raw'
import virtualListViewSource from './views/virtual-list.ts?raw'

const GITHUB_BASE = 'https://github.com/elianiva/foldcn/blob/main/packages/web'

export type DemoExample = Readonly<{ path: string; code: string; githubUrl: string }>

const gh = (path: string): string => `${GITHUB_BASE}/${path}`

/**
 * The "usage" code shown under each preview is the actual view source, imported
 * `?raw`. That keeps it a single source of truth — the demo and the snippet can
 * never drift — at the cost of showing the real submodel wiring rather than a
 * trimmed example.
 */
export const demoExampleByName: Readonly<Record<DemoItemName, DemoExample>> = {
  alert: {
    path: 'src/demo/views/alert.ts',
    code: alertViewSource,
    githubUrl: gh('src/demo/views/alert.ts'),
  },
  animation: {
    path: 'src/demo/views/animation.ts',
    code: animationViewSource,
    githubUrl: gh('src/demo/views/animation.ts'),
  },
  'aspect-ratio': {
    path: 'src/demo/views/aspect-ratio.ts',
    code: aspectRatioViewSource,
    githubUrl: gh('src/demo/views/aspect-ratio.ts'),
  },
  attachment: {
    path: 'src/demo/views/attachment.ts',
    code: attachmentViewSource,
    githubUrl: gh('src/demo/views/attachment.ts'),
  },
  avatar: {
    path: 'src/demo/views/avatar.ts',
    code: avatarViewSource,
    githubUrl: gh('src/demo/views/avatar.ts'),
  },
  badge: {
    path: 'src/demo/views/badge.ts',
    code: badgeViewSource,
    githubUrl: gh('src/demo/views/badge.ts'),
  },
  button: {
    path: 'src/demo/views/button.ts',
    code: buttonViewSource,
    githubUrl: gh('src/demo/views/button.ts'),
  },
  calendar: {
    path: 'src/demo/views/calendar.ts',
    code: calendarViewSource,
    githubUrl: gh('src/demo/views/calendar.ts'),
  },
  card: {
    path: 'src/demo/views/card.ts',
    code: cardViewSource,
    githubUrl: gh('src/demo/views/card.ts'),
  },
  checkbox: {
    path: 'src/demo/views/checkbox.ts',
    code: checkboxViewSource,
    githubUrl: gh('src/demo/views/checkbox.ts'),
  },
  combobox: {
    path: 'src/demo/views/combobox.ts',
    code: comboboxViewSource,
    githubUrl: gh('src/demo/views/combobox.ts'),
  },
  'data-table': {
    path: 'src/demo/views/data-table.ts',
    code: dataTableViewSource,
    githubUrl: gh('src/demo/views/data-table.ts'),
  },
  'date-picker': {
    path: 'src/demo/views/date-picker.ts',
    code: datePickerViewSource,
    githubUrl: gh('src/demo/views/date-picker.ts'),
  },
  dialog: {
    path: 'src/demo/views/dialog.ts',
    code: dialogViewSource,
    githubUrl: gh('src/demo/views/dialog.ts'),
  },
  direction: {
    path: 'src/demo/views/direction.ts',
    code: directionViewSource,
    githubUrl: gh('src/demo/views/direction.ts'),
  },
  'drag-and-drop': {
    path: 'src/demo/views/drag-and-drop.ts',
    code: dragAndDropViewSource,
    githubUrl: gh('src/demo/views/drag-and-drop.ts'),
  },
  empty: {
    path: 'src/demo/views/empty.ts',
    code: emptyViewSource,
    githubUrl: gh('src/demo/views/empty.ts'),
  },
  fieldset: {
    path: 'src/demo/views/fieldset.ts',
    code: fieldsetViewSource,
    githubUrl: gh('src/demo/views/fieldset.ts'),
  },
  'file-drop': {
    path: 'src/demo/views/file-drop.ts',
    code: fileDropViewSource,
    githubUrl: gh('src/demo/views/file-drop.ts'),
  },
  icons: {
    path: 'src/demo/views/icons.ts',
    code: iconsViewSource,
    githubUrl: gh('src/demo/views/icons.ts'),
  },
  input: {
    path: 'src/demo/views/input.ts',
    code: inputViewSource,
    githubUrl: gh('src/demo/views/input.ts'),
  },
  item: {
    path: 'src/demo/views/item.ts',
    code: itemViewSource,
    githubUrl: gh('src/demo/views/item.ts'),
  },
  kbd: {
    path: 'src/demo/views/kbd.ts',
    code: kbdViewSource,
    githubUrl: gh('src/demo/views/kbd.ts'),
  },
  label: {
    path: 'src/demo/views/label.ts',
    code: labelViewSource,
    githubUrl: gh('src/demo/views/label.ts'),
  },
  listbox: {
    path: 'src/demo/views/listbox.ts',
    code: listboxViewSource,
    githubUrl: gh('src/demo/views/listbox.ts'),
  },
  'login-form': {
    path: 'src/demo/views/login-form.ts',
    code: loginFormViewSource,
    githubUrl: gh('src/demo/views/login-form.ts'),
  },
  marker: {
    path: 'src/demo/views/marker.ts',
    code: markerViewSource,
    githubUrl: gh('src/demo/views/marker.ts'),
  },
  menu: {
    path: 'src/demo/views/menu.ts',
    code: menuViewSource,
    githubUrl: gh('src/demo/views/menu.ts'),
  },
  nav: {
    path: 'src/demo/views/nav.ts',
    code: navViewSource,
    githubUrl: gh('src/demo/views/nav.ts'),
  },
  popover: {
    path: 'src/demo/views/popover.ts',
    code: popoverViewSource,
    githubUrl: gh('src/demo/views/popover.ts'),
  },
  progress: {
    path: 'src/demo/views/progress.ts',
    code: progressViewSource,
    githubUrl: gh('src/demo/views/progress.ts'),
  },
  questionnaire: {
    path: 'src/demo/views/questionnaire.ts',
    code: questionnaireViewSource,
    githubUrl: gh('src/demo/views/questionnaire.ts'),
  },
  'radio-group': {
    path: 'src/demo/views/radio-group.ts',
    code: radioGroupViewSource,
    githubUrl: gh('src/demo/views/radio-group.ts'),
  },
  'native-select': {
    path: 'src/demo/views/native-select.ts',
    code: nativeSelectViewSource,
    githubUrl: gh('src/demo/views/native-select.ts'),
  },
  select: {
    path: 'src/demo/views/select.ts',
    code: selectViewSource,
    githubUrl: gh('src/demo/views/select.ts'),
  },
  separator: {
    path: 'src/demo/views/separator.ts',
    code: separatorViewSource,
    githubUrl: gh('src/demo/views/separator.ts'),
  },
  'settings-page': {
    path: 'src/demo/views/settings-page.ts',
    code: settingsPageViewSource,
    githubUrl: gh('src/demo/views/settings-page.ts'),
  },
  skeleton: {
    path: 'src/demo/views/skeleton.ts',
    code: skeletonViewSource,
    githubUrl: gh('src/demo/views/skeleton.ts'),
  },
  slider: {
    path: 'src/demo/views/slider.ts',
    code: sliderViewSource,
    githubUrl: gh('src/demo/views/slider.ts'),
  },
  spinner: {
    path: 'src/demo/views/spinner.ts',
    code: spinnerViewSource,
    githubUrl: gh('src/demo/views/spinner.ts'),
  },
  'alert-dialog': {
    path: 'src/demo/views/alert-dialog.ts',
    code: alertDialogViewSource,
    githubUrl: gh('src/demo/views/alert-dialog.ts'),
  },
  sheet: {
    path: 'src/demo/views/sheet.ts',
    code: sheetViewSource,
    githubUrl: gh('src/demo/views/sheet.ts'),
  },
  drawer: {
    path: 'src/demo/views/drawer.ts',
    code: drawerViewSource,
    githubUrl: gh('src/demo/views/drawer.ts'),
  },
  'hover-card': {
    path: 'src/demo/views/hover-card.ts',
    code: hoverCardViewSource,
    githubUrl: gh('src/demo/views/hover-card.ts'),
  },
  accordion: {
    path: 'src/demo/views/accordion.ts',
    code: accordionViewSource,
    githubUrl: gh('src/demo/views/accordion.ts'),
  },
  collapsible: {
    path: 'src/demo/views/collapsible.ts',
    code: collapsibleViewSource,
    githubUrl: gh('src/demo/views/collapsible.ts'),
  },
  'context-menu': {
    path: 'src/demo/views/context-menu.ts',
    code: contextMenuViewSource,
    githubUrl: gh('src/demo/views/context-menu.ts'),
  },
  menubar: {
    path: 'src/demo/views/menubar.ts',
    code: menubarViewSource,
    githubUrl: gh('src/demo/views/menubar.ts'),
  },
  'button-group': {
    path: 'src/demo/views/button-group.ts',
    code: buttonGroupViewSource,
    githubUrl: gh('src/demo/views/button-group.ts'),
  },
  'input-group': {
    path: 'src/demo/views/input-group.ts',
    code: inputGroupViewSource,
    githubUrl: gh('src/demo/views/input-group.ts'),
  },
  toggle: {
    path: 'src/demo/views/toggle.ts',
    code: toggleViewSource,
    githubUrl: gh('src/demo/views/toggle.ts'),
  },
  'toggle-group': {
    path: 'src/demo/views/toggle-group.ts',
    code: toggleGroupViewSource,
    githubUrl: gh('src/demo/views/toggle-group.ts'),
  },
  'input-otp': {
    path: 'src/demo/views/input-otp.ts',
    code: inputOtpViewSource,
    githubUrl: gh('src/demo/views/input-otp.ts'),
  },
  breadcrumb: {
    path: 'src/demo/views/breadcrumb.ts',
    code: breadcrumbViewSource,
    githubUrl: gh('src/demo/views/breadcrumb.ts'),
  },
  'navigation-menu': {
    path: 'src/demo/views/navigation-menu.ts',
    code: navigationMenuViewSource,
    githubUrl: gh('src/demo/views/navigation-menu.ts'),
  },
  sidebar: {
    path: 'src/demo/views/sidebar.ts',
    code: sidebarViewSource,
    githubUrl: gh('src/demo/views/sidebar.ts'),
  },
  table: {
    path: 'src/demo/views/table.ts',
    code: tableViewSource,
    githubUrl: gh('src/demo/views/table.ts'),
  },
  command: {
    path: 'src/demo/views/command.ts',
    code: commandViewSource,
    githubUrl: gh('src/demo/views/command.ts'),
  },
  resizable: {
    path: 'src/demo/views/resizable.ts',
    code: resizableViewSource,
    githubUrl: gh('src/demo/views/resizable.ts'),
  },
  switch: {
    path: 'src/demo/views/switch.ts',
    code: switchViewSource,
    githubUrl: gh('src/demo/views/switch.ts'),
  },
  tabs: {
    path: 'src/demo/views/tabs.ts',
    code: tabsViewSource,
    githubUrl: gh('src/demo/views/tabs.ts'),
  },
  textarea: {
    path: 'src/demo/views/textarea.ts',
    code: textareaViewSource,
    githubUrl: gh('src/demo/views/textarea.ts'),
  },
  toast: {
    path: 'src/demo/views/toast.ts',
    code: toastViewSource,
    githubUrl: gh('src/demo/views/toast.ts'),
  },
  tooltip: {
    path: 'src/demo/views/tooltip.ts',
    code: tooltipViewSource,
    githubUrl: gh('src/demo/views/tooltip.ts'),
  },
  'virtual-list': {
    path: 'src/demo/views/virtual-list.ts',
    code: virtualListViewSource,
    githubUrl: gh('src/demo/views/virtual-list.ts'),
  },
}
