import { Schema as S } from 'effect'
import { m } from 'foldkit/message'

import * as Animation from '@foldcn/registry/src/ui/animation'
import * as Calendar from '@foldcn/registry/src/ui/calendar'
import * as Combobox from '@foldcn/registry/src/ui/combobox'
import * as DatePicker from '@foldcn/registry/src/ui/date-picker'
import * as Dialog from '@foldcn/registry/src/ui/dialog'
import * as DragAndDrop from '@foldcn/registry/src/ui/drag-and-drop'
import * as FileDrop from '@foldcn/registry/src/ui/file-drop'
import * as Listbox from '@foldcn/registry/src/ui/listbox'
import * as Menu from '@foldcn/registry/src/ui/menu'
import * as Popover from '@foldcn/registry/src/ui/popover'
import * as RadioGroup from '@foldcn/registry/src/ui/radio-group'
import * as Select from '@foldcn/registry/src/ui/select'
import * as Slider from '@foldcn/registry/src/ui/slider'
import * as Tabs from '@foldcn/registry/src/ui/tabs'
import * as Tooltip from '@foldcn/registry/src/ui/tooltip'
import * as VirtualList from '@foldcn/registry/src/ui/virtual-list'

import { Toast } from './toast'

// child submodel message wrappers
export const GotDialogMessage = m('GotDialogMessage', { message: Dialog.Message })
export const GotPopoverMessage = m('GotPopoverMessage', { message: Popover.Message })
export const GotTooltipMessage = m('GotTooltipMessage', { message: Tooltip.Message })
export const GotMenuMessage = m('GotMenuMessage', { message: Menu.Message })
export const GotListboxMessage = m('GotListboxMessage', { message: Listbox.Message })
export const GotComboboxMessage = m('GotComboboxMessage', { message: Combobox.Message })
export const GotTabsMessage = m('GotTabsMessage', { message: Tabs.Message })
export const GotRadioGroupMessage = m('GotRadioGroupMessage', { message: RadioGroup.Message })
export const GotSliderRatingMessage = m('GotSliderRatingMessage', { message: Slider.Message })
export const GotSliderVolumeMessage = m('GotSliderVolumeMessage', { message: Slider.Message })
export const GotSelectMessage = m('GotSelectMessage', { message: Select.Message })
export const GotCalendarMessage = m('GotCalendarMessage', { message: Calendar.Message })
export const GotDatePickerMessage = m('GotDatePickerMessage', { message: DatePicker.Message })
export const GotToastMessage = m('GotToastMessage', { message: Toast.Message })
export const GotAnimationMessage = m('GotAnimationMessage', { message: Animation.Message })
export const GotFileDropMessage = m('GotFileDropMessage', { message: FileDrop.Message })
export const GotVirtualListMessage = m('GotVirtualListMessage', { message: VirtualList.Message })
export const GotDragAndDropMessage = m('GotDragAndDropMessage', { message: DragAndDrop.Message })

// helper interactions
export const ClickedButtonDemo = m('ClickedButtonDemo')
export const UpdatedInputValue = m('UpdatedInputValue', { value: S.String })
export const UpdatedTextareaValue = m('UpdatedTextareaValue', { value: S.String })
export const UpdatedSelectValue = m('UpdatedSelectValue', { value: S.String })
export const ToggledCheckbox = m('ToggledCheckbox', { isChecked: S.Boolean })
export const ToggledSwitchEmail = m('ToggledSwitchEmail', { isChecked: S.Boolean })
export const ToggledSwitchTfa = m('ToggledSwitchTfa', { isChecked: S.Boolean })
export const ToggledDisclosureBasic = m('ToggledDisclosureBasic', { isOpen: S.Boolean })
export const ToggledDisclosureAnimated = m('ToggledDisclosureAnimated', { isOpen: S.Boolean })

// dialog
export const ClickedOpenDialog = m('ClickedOpenDialog')

// toast
export const ClickedShowInfoToast = m('ClickedShowInfoToast')
export const ClickedShowSuccessToast = m('ClickedShowSuccessToast')
export const ClickedShowWarningToast = m('ClickedShowWarningToast')
export const ClickedShowErrorToast = m('ClickedShowErrorToast')
export const ClickedDismissAllToasts = m('ClickedDismissAllToasts')

// animation
export const ToggledAnimation = m('ToggledAnimation')
export const SelectedNav = m('SelectedNav', {
  value: S.Literals(['Overview', 'Components', 'Settings', 'Docs']),
})

// file drop
export const ClickedRemoveFile = m('ClickedRemoveFile', { fileIndex: S.Number })

// virtual list
export const ClickedScrollToMiddle = m('ClickedScrollToMiddle')

// blocks
export const UpdatedLoginEmail = m('UpdatedLoginEmail', { value: S.String })
export const UpdatedLoginPassword = m('UpdatedLoginPassword', { value: S.String })
export const SubmittedLogin = m('SubmittedLogin')
export const UpdatedSettingsName = m('UpdatedSettingsName', { value: S.String })
export const UpdatedSettingsEmail = m('UpdatedSettingsEmail', { value: S.String })
export const UpdatedSettingsBio = m('UpdatedSettingsBio', { value: S.String })
export const UpdatedSettingsLanguage = m('UpdatedSettingsLanguage', { value: S.String })
export const ToggledSettingsEmailNotifs = m('ToggledSettingsEmailNotifs', { isChecked: S.Boolean })
export const ToggledSettingsTfa = m('ToggledSettingsTfa', { isChecked: S.Boolean })
export const ClickedSaveSettings = m('ClickedSaveSettings')
export const UpdatedTableSearch = m('UpdatedTableSearch', { value: S.String })

export const Message = S.Union([
  GotDialogMessage,
  GotPopoverMessage,
  GotTooltipMessage,
  GotMenuMessage,
  GotListboxMessage,
  GotComboboxMessage,
  GotTabsMessage,
  GotRadioGroupMessage,
  GotSliderRatingMessage,
  GotSliderVolumeMessage,
  GotSelectMessage,
  GotCalendarMessage,
  GotDatePickerMessage,
  GotToastMessage,
  GotAnimationMessage,
  GotFileDropMessage,
  GotVirtualListMessage,
  GotDragAndDropMessage,
  ClickedButtonDemo,
  UpdatedInputValue,
  UpdatedTextareaValue,
  UpdatedSelectValue,
  ToggledCheckbox,
  ToggledSwitchEmail,
  ToggledSwitchTfa,
  ToggledDisclosureBasic,
  ToggledDisclosureAnimated,
  ClickedOpenDialog,
  ClickedShowInfoToast,
  ClickedShowSuccessToast,
  ClickedShowWarningToast,
  ClickedShowErrorToast,
  ClickedDismissAllToasts,
  ToggledAnimation,
  SelectedNav,
  ClickedRemoveFile,
  ClickedScrollToMiddle,
  UpdatedLoginEmail,
  UpdatedLoginPassword,
  SubmittedLogin,
  UpdatedSettingsName,
  UpdatedSettingsEmail,
  UpdatedSettingsBio,
  UpdatedSettingsLanguage,
  ToggledSettingsEmailNotifs,
  ToggledSettingsTfa,
  ClickedSaveSettings,
  UpdatedTableSearch,
])
export type Message = typeof Message.Type
