import { Option } from 'effect'
import { Calendar as FoldkitCalendar, Command } from 'foldkit'

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

import type { Message } from './message'
import type { Model } from './model'
import { Toast } from './toast'

// A fixed "today" so the SSG-prerendered calendar matches the hydrated page.
// Using the wall clock here would let the server and client disagree.
const DEMO_TODAY = FoldkitCalendar.make(2025, 1, 15)

export const INITIAL_ROWS: ReadonlyArray<{
  id: string
  name: string
  email: string
  plan: string
  status: string
}> = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', plan: 'Business', status: 'Active' },
  { id: '2', name: 'Grace Hopper', email: 'grace@example.com', plan: 'Startup', status: 'Active' },
  { id: '3', name: 'Alan Turing', email: 'alan@example.com', plan: 'Business', status: 'Invited' },
  { id: '4', name: 'Linus Pauling', email: 'linus@example.com', plan: 'Startup', status: 'Active' },
  {
    id: '5',
    name: 'Barbara Liskov',
    email: 'barbara@example.com',
    plan: 'Enterprise',
    status: 'Inactive',
  },
]

export const init = (): [Model, ReadonlyArray<Command.Command<Message>>] => [
  {
    buttonClickCount: 0,
    inputValue: '',
    textareaValue: '',
    selectValue: 'en',
    isCheckboxChecked: true,
    isSwitchEmailChecked: true,
    isSwitchTfaChecked: false,
    isDisclosureBasicOpen: false,
    isDisclosureAnimatedOpen: false,

    dialog: Dialog.init({ id: 'dialog-demo' }),
    popover: Popover.init({ id: 'popover-demo' }),
    tooltip: Tooltip.init({ id: 'tooltip-demo' }),
    menu: Menu.init({ id: 'menu-demo' }),
    listbox: Listbox.init({ id: 'listbox-demo' }),
    maybeListboxValue: Option.none(),
    select: Select.init({ id: 'select-language' }),
    maybeSelectValue: Option.some('en'),
    combobox: Combobox.init({ id: 'combobox-demo' }),
    maybeComboboxValue: Option.none(),
    tabs: Tabs.init({ id: 'tabs-demo' }),
    activeTab: 'Overview',
    activeNav: 'Components',
    radioGroup: RadioGroup.init({ id: 'radio-group-demo' }),
    maybePlan: Option.none(),
    sliderRating: Slider.init({ id: 'slider-rating-demo', min: 0, max: 10, step: 1 }),
    sliderRatingValue: 3,
    sliderVolume: Slider.init({ id: 'slider-volume-demo', min: 0, max: 1, step: 0.05 }),
    sliderVolumeValue: 0.5,
    calendar: Calendar.init({
      id: 'calendar-demo',
      today: DEMO_TODAY,
      minDate: FoldkitCalendar.subtractYears(DEMO_TODAY, 1),
      maxDate: FoldkitCalendar.addYears(DEMO_TODAY, 1),
    }),
    maybeSelectedDate: Option.none(),
    datePicker: DatePicker.init({
      id: 'date-picker-demo',
      today: DEMO_TODAY,
      minDate: FoldkitCalendar.subtractYears(DEMO_TODAY, 1),
      maxDate: FoldkitCalendar.addYears(DEMO_TODAY, 1),
    }),
    maybePickedDate: Option.none(),
    toast: Toast.init({ id: 'toast-demo' }),
    animation: Animation.init({ id: 'animation-demo' }),
    isAnimationShowing: false,
    fileDrop: FileDrop.init({ id: 'file-drop-demo' }),
    fileDropFiles: [],
    virtualList: VirtualList.init({ id: 'virtual-list-demo', rowHeightPx: 56 }),
    dragAndDrop: DragAndDrop.init({ id: 'drag-and-drop-demo' }),
    dragColumns: [
      {
        id: 'backlog',
        label: 'Backlog',
        cards: [
          { id: 'card-1', label: 'Design API' },
          { id: 'card-2', label: 'Write tests' },
          { id: 'card-3', label: 'Build docs' },
        ],
      },
      {
        id: 'done',
        label: 'Done',
        cards: [
          { id: 'card-4', label: 'Set up repo' },
          { id: 'card-5', label: 'Add CI' },
        ],
      },
    ],

    loginEmail: '',
    loginPassword: '',
    loginSubmitted: false,
    settingsName: '',
    settingsEmail: '',
    settingsBio: '',
    settingsLanguage: 'en',
    settingsEmailNotifs: true,
    settingsTfa: false,
    settingsSaved: false,
    tableSearch: '',
  },
  [],
]
