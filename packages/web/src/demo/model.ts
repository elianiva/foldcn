import { Schema as S } from 'effect'
import { Calendar as FoldkitCalendar, File } from 'foldkit'

import * as Animation from '@foldcn/registry/styles/default/ui/animation'
import * as Calendar from '@foldcn/registry/styles/default/ui/calendar'
import * as Combobox from '@foldcn/registry/styles/default/ui/combobox'
import * as DatePicker from '@foldcn/registry/styles/default/ui/date-picker'
import * as Dialog from '@foldcn/registry/styles/default/ui/dialog'
import * as DragAndDrop from '@foldcn/registry/styles/default/ui/drag-and-drop'
import * as FileDrop from '@foldcn/registry/styles/default/ui/file-drop'
import * as Listbox from '@foldcn/registry/styles/default/ui/listbox'
import * as Menu from '@foldcn/registry/styles/default/ui/menu'
import * as Popover from '@foldcn/registry/styles/default/ui/popover'
import * as RadioGroup from '@foldcn/registry/styles/default/ui/radio-group'
import * as Select from '@foldcn/registry/styles/default/ui/select'
import * as Slider from '@foldcn/registry/styles/default/ui/slider'
import * as Tabs from '@foldcn/registry/styles/default/ui/tabs'
import * as Tooltip from '@foldcn/registry/styles/default/ui/tooltip'
import * as VirtualList from '@foldcn/registry/styles/default/ui/virtual-list'

import { Toast } from './toast'

export const City = S.Literals([
  'Johannesburg',
  'Kyiv',
  'Oxford',
  'Plymouth',
  'Quito',
  'Wellington',
  'Zurich',
])
export type City = typeof City.Type

export const Plan = S.Literals(['Startup', 'Business', 'Enterprise'])
export type Plan = typeof Plan.Type

export const DemoTab = S.Literals(['Overview', 'Settings', 'Billing'])
export type DemoTab = typeof DemoTab.Type

export const DemoNav = S.Literals(['Overview', 'Components', 'Settings', 'Docs'])
export type DemoNav = typeof DemoNav.Type

export const ListboxItem = S.Literals([
  'Michael Bluth',
  'Lindsay Funke',
  'Gob Bluth',
  'George Michael',
  'Maeby Funke',
  'Buster Bluth',
  'Tobias Funke',
])
export type ListboxItem = typeof ListboxItem.Type

export const DemoCard = S.Struct({ id: S.String, label: S.String })
export type DemoCard = typeof DemoCard.Type

export const DemoColumn = S.Struct({
  id: S.String,
  label: S.String,
  cards: S.Array(DemoCard),
})
export type DemoColumn = typeof DemoColumn.Type

export const DataRow = S.Struct({
  id: S.String,
  name: S.String,
  email: S.String,
  plan: S.String,
  status: S.String,
})
export type DataRow = typeof DataRow.Type

export const Model = S.Struct({
  // stateless helpers carry their displayed value here
  buttonClickCount: S.Number,
  inputValue: S.String,
  textareaValue: S.String,
  selectValue: S.String,
  isCheckboxChecked: S.Boolean,
  isSwitchEmailChecked: S.Boolean,
  isSwitchTfaChecked: S.Boolean,
  isDisclosureBasicOpen: S.Boolean,
  isDisclosureAnimatedOpen: S.Boolean,
  accordionOpen: S.Array(S.Boolean),
  isCollapsibleOpen: S.Boolean,
  isToggleOn: S.Boolean,
  toggleGroupValue: S.Array(S.String),
  otp: S.String,
  commandSearch: S.String,
  resizablePercent: S.Number,

  // stateful submodels
  dialog: Dialog.Model,
  popover: Popover.Model,
  tooltip: Tooltip.Model,
  menu: Menu.Model,
  listbox: Listbox.Model,
  maybeListboxValue: S.Option(ListboxItem),
  select: Select.Model,
  maybeSelectValue: S.Option(S.String),
  combobox: Combobox.Model,
  maybeComboboxValue: S.Option(City),
  tabs: Tabs.Model,
  activeTab: DemoTab,
  activeNav: DemoNav,
  radioGroup: RadioGroup.Model,
  maybePlan: S.Option(Plan),
  sliderRating: Slider.Model,
  sliderRatingValue: S.Number,
  sliderVolume: Slider.Model,
  sliderVolumeValue: S.Number,
  calendar: Calendar.Model,
  maybeSelectedDate: S.Option(FoldkitCalendar.CalendarDate),
  datePicker: DatePicker.Model,
  maybePickedDate: S.Option(FoldkitCalendar.CalendarDate),
  toast: Toast.Model,
  animation: Animation.Model,
  isAnimationShowing: S.Boolean,
  fileDrop: FileDrop.Model,
  fileDropFiles: S.Array(File.File),
  virtualList: VirtualList.Model,
  dragAndDrop: DragAndDrop.Model,
  dragColumns: S.Array(DemoColumn),

  // blocks
  loginEmail: S.String,
  loginPassword: S.String,
  loginSubmitted: S.Boolean,
  settingsName: S.String,
  settingsEmail: S.String,
  settingsBio: S.String,
  settingsLanguage: S.String,
  settingsEmailNotifs: S.Boolean,
  settingsTfa: S.Boolean,
  settingsSaved: S.Boolean,
  tableSearch: S.String,
})
export type Model = typeof Model.Type
