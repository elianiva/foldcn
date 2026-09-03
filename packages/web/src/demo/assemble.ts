// The demo assembly: builds the shared demo Model, Message union, init and
// update dispatcher from every demo file's `slice` export (see ./slice.ts).
// Adding a demo means adding its file — the compiler enforces handler
// coverage via tagsExhaustive, so a message without a handler is a compile
// error and the union and dispatch table can never drift apart.
// Subscriptions are aggregated separately in ./subscriptions.ts.
import { Match as M } from 'effect'
import { Schema as S } from 'effect'

import { slice as accordionSlice } from './views/accordion'
import { slice as alertDialogSlice } from './views/alert-dialog'
import { slice as alertSlice } from './views/alert'
import { slice as animationSlice } from './views/animation'
import { slice as aspectRatioSlice } from './views/aspect-ratio'
import { slice as attachmentSlice } from './views/attachment'
import { slice as avatarSlice } from './views/avatar'
import { slice as badgeSlice } from './views/badge'
import { slice as breadcrumbSlice } from './views/breadcrumb'
import { slice as buttonGroupSlice } from './views/button-group'
import { slice as buttonSlice } from './views/button'
import { slice as calendarSlice } from './views/calendar'
import { slice as cardSlice } from './views/card'
import { slice as checkboxSlice } from './views/checkbox'
import { slice as comboboxSlice } from './views/combobox'
import { slice as collapsibleSlice } from './views/collapsible'
import { slice as commandSlice } from './views/command'
import { slice as contextMenuSlice } from './views/context-menu'
import { slice as dataTableSlice } from './views/data-table'
import { slice as datePickerSlice } from './views/date-picker'
import { slice as dialogSlice } from './views/dialog'
import { slice as directionSlice } from './views/direction'
import { slice as dragAndDropSlice } from './views/drag-and-drop'
import { slice as drawerSlice } from './views/drawer'
import { slice as emptySlice } from './views/empty'
import { slice as fieldsetSlice } from './views/fieldset'
import { slice as fileDropSlice } from './views/file-drop'
import { slice as hoverCardSlice } from './views/hover-card'
import { slice as iconsSlice } from './views/icons'
import { slice as inputGroupSlice } from './views/input-group'
import { slice as inputOtpSlice } from './views/input-otp'
import { slice as inputSlice } from './views/input'
import { slice as itemSlice } from './views/item'
import { slice as kbdSlice } from './views/kbd'
import { slice as labelSlice } from './views/label'
import { slice as listboxSlice } from './views/listbox'
import { slice as loginFormSlice } from './views/login-form'
import { slice as markerSlice } from './views/marker'
import { slice as menuSlice } from './views/menu'
import { slice as menubarSlice } from './views/menubar'
import { slice as navSlice } from './views/nav'
import { slice as nativeSelectSlice } from './views/native-select'
import { slice as navigationMenuSlice } from './views/navigation-menu'
import { slice as popoverSlice } from './views/popover'
import { slice as progressSlice } from './views/progress'
import { slice as radioGroupSlice } from './views/radio-group'
import { slice as resizableSlice } from './views/resizable'
import { slice as selectSlice } from './views/select'
import { slice as separatorSlice } from './views/separator'
import { slice as settingsPageSlice } from './views/settings-page'
import { slice as sheetSlice } from './views/sheet'
import { slice as sidebarSlice } from './views/sidebar'
import { slice as skeletonSlice } from './views/skeleton'
import { slice as sliderSlice } from './views/slider'
import { slice as spinnerSlice } from './views/spinner'
import { slice as switchSlice } from './views/switch'
import { slice as tableSlice } from './views/table'
import { slice as tabsSlice } from './views/tabs'
import { slice as textareaSlice } from './views/textarea'
import { slice as toastSlice } from './views/toast'
import { slice as toggleGroupSlice } from './views/toggle-group'
import { slice as toggleSlice } from './views/toggle'
import { slice as tooltipSlice } from './views/tooltip'
import { slice as virtualListSlice } from './views/virtual-list'

import type { UpdateReturn } from './slice'
import type * as Update from 'foldkit/update'

const ModelSchema = S.Struct({
  ...accordionSlice.fields,
  ...alertDialogSlice.fields,
  ...alertSlice.fields,
  ...animationSlice.fields,
  ...aspectRatioSlice.fields,
  ...attachmentSlice.fields,
  ...avatarSlice.fields,
  ...badgeSlice.fields,
  ...breadcrumbSlice.fields,
  ...buttonGroupSlice.fields,
  ...buttonSlice.fields,
  ...calendarSlice.fields,
  ...cardSlice.fields,
  ...checkboxSlice.fields,
  ...comboboxSlice.fields,
  ...collapsibleSlice.fields,
  ...commandSlice.fields,
  ...contextMenuSlice.fields,
  ...dataTableSlice.fields,
  ...datePickerSlice.fields,
  ...dialogSlice.fields,
  ...directionSlice.fields,
  ...dragAndDropSlice.fields,
  ...drawerSlice.fields,
  ...emptySlice.fields,
  ...fieldsetSlice.fields,
  ...fileDropSlice.fields,
  ...hoverCardSlice.fields,
  ...iconsSlice.fields,
  ...inputGroupSlice.fields,
  ...inputOtpSlice.fields,
  ...inputSlice.fields,
  ...itemSlice.fields,
  ...kbdSlice.fields,
  ...labelSlice.fields,
  ...listboxSlice.fields,
  ...loginFormSlice.fields,
  ...markerSlice.fields,
  ...menuSlice.fields,
  ...menubarSlice.fields,
  ...navSlice.fields,
  ...navigationMenuSlice.fields,
  ...nativeSelectSlice.fields,
  ...popoverSlice.fields,
  ...progressSlice.fields,
  ...radioGroupSlice.fields,
  ...resizableSlice.fields,
  ...selectSlice.fields,
  ...separatorSlice.fields,
  ...settingsPageSlice.fields,
  ...sheetSlice.fields,
  ...sidebarSlice.fields,
  ...skeletonSlice.fields,
  ...sliderSlice.fields,
  ...spinnerSlice.fields,
  ...switchSlice.fields,
  ...tableSlice.fields,
  ...tabsSlice.fields,
  ...textareaSlice.fields,
  ...toastSlice.fields,
  ...toggleGroupSlice.fields,
  ...toggleSlice.fields,
  ...tooltipSlice.fields,
  ...virtualListSlice.fields,
})
export type Model = typeof ModelSchema.Type
export const Model = ModelSchema

const MessageSchema = S.Union([
  ...accordionSlice.messages,
  ...alertDialogSlice.messages,
  ...alertSlice.messages,
  ...animationSlice.messages,
  ...aspectRatioSlice.messages,
  ...attachmentSlice.messages,
  ...avatarSlice.messages,
  ...badgeSlice.messages,
  ...breadcrumbSlice.messages,
  ...buttonGroupSlice.messages,
  ...buttonSlice.messages,
  ...calendarSlice.messages,
  ...cardSlice.messages,
  ...checkboxSlice.messages,
  ...comboboxSlice.messages,
  ...collapsibleSlice.messages,
  ...commandSlice.messages,
  ...contextMenuSlice.messages,
  ...dataTableSlice.messages,
  ...datePickerSlice.messages,
  ...dialogSlice.messages,
  ...directionSlice.messages,
  ...dragAndDropSlice.messages,
  ...drawerSlice.messages,
  ...emptySlice.messages,
  ...fieldsetSlice.messages,
  ...fileDropSlice.messages,
  ...hoverCardSlice.messages,
  ...iconsSlice.messages,
  ...inputGroupSlice.messages,
  ...inputOtpSlice.messages,
  ...inputSlice.messages,
  ...itemSlice.messages,
  ...kbdSlice.messages,
  ...labelSlice.messages,
  ...listboxSlice.messages,
  ...loginFormSlice.messages,
  ...markerSlice.messages,
  ...menuSlice.messages,
  ...menubarSlice.messages,
  ...navSlice.messages,
  ...navigationMenuSlice.messages,
  ...nativeSelectSlice.messages,
  ...popoverSlice.messages,
  ...progressSlice.messages,
  ...radioGroupSlice.messages,
  ...resizableSlice.messages,
  ...selectSlice.messages,
  ...separatorSlice.messages,
  ...settingsPageSlice.messages,
  ...sheetSlice.messages,
  ...sidebarSlice.messages,
  ...skeletonSlice.messages,
  ...sliderSlice.messages,
  ...spinnerSlice.messages,
  ...switchSlice.messages,
  ...tableSlice.messages,
  ...tabsSlice.messages,
  ...textareaSlice.messages,
  ...toastSlice.messages,
  ...toggleGroupSlice.messages,
  ...toggleSlice.messages,
  ...tooltipSlice.messages,
  ...virtualListSlice.messages,
])
export type Message = typeof MessageSchema.Type
export const Message = MessageSchema

type DemoUpdateReturn = Update.Return<Model, Message>

export const init = (): DemoUpdateReturn => {
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: per-slice init literals
  const model = {
    ...accordionSlice.init,
    ...alertDialogSlice.init,
    ...alertSlice.init,
    ...animationSlice.init,
    ...aspectRatioSlice.init,
    ...attachmentSlice.init,
    ...avatarSlice.init,
    ...badgeSlice.init,
    ...breadcrumbSlice.init,
    ...buttonGroupSlice.init,
    ...buttonSlice.init,
    ...calendarSlice.init,
    ...cardSlice.init,
    ...checkboxSlice.init,
    ...comboboxSlice.init,
    ...collapsibleSlice.init,
    ...commandSlice.init,
    ...contextMenuSlice.init,
    ...dataTableSlice.init,
    ...datePickerSlice.init,
    ...dialogSlice.init,
    ...directionSlice.init,
    ...dragAndDropSlice.init,
    ...drawerSlice.init,
    ...emptySlice.init,
    ...fieldsetSlice.init,
    ...fileDropSlice.init,
    ...hoverCardSlice.init,
    ...iconsSlice.init,
    ...inputGroupSlice.init,
    ...inputOtpSlice.init,
    ...inputSlice.init,
    ...itemSlice.init,
    ...kbdSlice.init,
    ...labelSlice.init,
    ...listboxSlice.init,
    ...loginFormSlice.init,
    ...markerSlice.init,
    ...menuSlice.init,
    ...menubarSlice.init,
    ...navSlice.init,
    ...navigationMenuSlice.init,
    ...nativeSelectSlice.init,
    ...popoverSlice.init,
    ...progressSlice.init,
    ...radioGroupSlice.init,
    ...resizableSlice.init,
    ...selectSlice.init,
    ...separatorSlice.init,
    ...settingsPageSlice.init,
    ...sheetSlice.init,
    ...sidebarSlice.init,
    ...skeletonSlice.init,
    ...sliderSlice.init,
    ...spinnerSlice.init,
    ...switchSlice.init,
    ...tableSlice.init,
    ...tabsSlice.init,
    ...textareaSlice.init,
    ...toastSlice.init,
    ...toggleGroupSlice.init,
    ...toggleSlice.init,
    ...tooltipSlice.init,
    ...virtualListSlice.init,
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: per-slice init literals
  } as Model
  return { model }
}

export const update = (model: Model, message: Message): DemoUpdateReturn => {
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: slice handlers return loose UpdateReturn
  return M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      ...accordionSlice.handlers(model),
      ...alertDialogSlice.handlers(model),
      ...breadcrumbSlice.handlers(model),
      ...animationSlice.handlers(model),
      ...avatarSlice.handlers(model),
      ...buttonSlice.handlers(model),
      ...calendarSlice.handlers(model),
      ...cardSlice.handlers(model),
      ...checkboxSlice.handlers(model),
      ...comboboxSlice.handlers(model),
      ...collapsibleSlice.handlers(model),
      ...commandSlice.handlers(model),
      ...contextMenuSlice.handlers(model),
      ...dataTableSlice.handlers(model),
      ...datePickerSlice.handlers(model),
      ...dialogSlice.handlers(model),
      ...dragAndDropSlice.handlers(model),
      ...drawerSlice.handlers(model),
      ...fieldsetSlice.handlers(model),
      ...fileDropSlice.handlers(model),
      ...hoverCardSlice.handlers(model),
      ...inputOtpSlice.handlers(model),
      ...inputSlice.handlers(model),
      ...labelSlice.handlers(model),
      ...listboxSlice.handlers(model),
      ...loginFormSlice.handlers(model),
      ...menuSlice.handlers(model),
      ...menubarSlice.handlers(model),
      ...navSlice.handlers(model),
      ...navigationMenuSlice.handlers(model),
      ...nativeSelectSlice.handlers(model),
      ...popoverSlice.handlers(model),
      ...radioGroupSlice.handlers(model),
      ...resizableSlice.handlers(model),
      ...selectSlice.handlers(model),
      ...settingsPageSlice.handlers(model),
      ...sheetSlice.handlers(model),
      ...sidebarSlice.handlers(model),
      ...sliderSlice.handlers(model),
      ...switchSlice.handlers(model),
      ...tableSlice.handlers(model),
      ...tabsSlice.handlers(model),
      ...textareaSlice.handlers(model),
      ...toastSlice.handlers(model),
      ...toggleGroupSlice.handlers(model),
      ...toggleSlice.handlers(model),
      ...tooltipSlice.handlers(model),
      ...virtualListSlice.handlers(model),
    }),
  ) as DemoUpdateReturn
}
