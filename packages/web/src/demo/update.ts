import { Array, Match as M, Option, pipe } from 'effect'
import { Command, Update } from 'foldkit'
import { evo } from 'foldkit/struct'
import {
  Animation as FoldkitAnimation,
  Combobox as FoldkitCombobox,
  Listbox as FoldkitListbox,
  Menu as FoldkitMenu,
  RadioGroup as FoldkitRadioGroup,
  Tabs as FoldkitTabs,
  VirtualList as FoldkitVirtualList,
} from '@foldkit/ui'

import * as Animation from '@foldcn/registry/styles/default/ui/animation'
import * as Calendar from '@foldcn/registry/styles/default/ui/calendar'
import * as DatePicker from '@foldcn/registry/styles/default/ui/date-picker'
import * as Dialog from '@foldcn/registry/styles/default/ui/dialog'
import * as DragAndDrop from '@foldcn/registry/styles/default/ui/drag-and-drop'
import * as FileDrop from '@foldcn/registry/styles/default/ui/file-drop'
import * as Popover from '@foldcn/registry/styles/default/ui/popover'
import * as Slider from '@foldcn/registry/styles/default/ui/slider'
import * as Tooltip from '@foldcn/registry/styles/default/ui/tooltip'
import * as VirtualList from '@foldcn/registry/styles/default/ui/virtual-list'

import { CityCombobox, DemoMenu, DemoTabs, ItemListbox, LanguageSelect, PlanRadioGroup } from './bundles'
import { INITIAL_ROWS } from './init'
import {
  GotAnimationMessage,
  GotCalendarMessage,
  GotComboboxMessage,
  GotDatePickerMessage,
  GotDialogMessage,
  GotDragAndDropMessage,
  GotFileDropMessage,
  GotListboxMessage,
  GotMenuMessage,
  GotPopoverMessage,
  GotRadioGroupMessage,
  GotSliderRatingMessage,
  GotSliderVolumeMessage,
  GotSelectMessage,
  GotTabsMessage,
  GotToastMessage,
  GotTooltipMessage,
  GotVirtualListMessage,
  ToggledAccordion,
  ToggledCollapsible,
  ToggledToggle,
  SelectedToggleGroup,
  UpdatedOtp,
  UpdatedCommandSearch,
  ResizedSplit,
  Message,
} from './message'
import type { City, DemoColumn, DemoTab, ListboxItem, Model, Plan } from './model'
import { Toast } from './toast'
import { VIRTUAL_LIST_ROW_COUNT } from './views/virtual-list'

const reorderColumns = (
  columns: ReadonlyArray<DemoColumn>,
  itemId: string,
  fromContainerId: string,
  toContainerId: string,
  toIndex: number,
): ReadonlyArray<DemoColumn> => {
  const maybeCard = pipe(
    columns,
    Array.findFirst(({ id }) => id === fromContainerId),
    Option.flatMap((column) => Array.findFirst(column.cards, ({ id }) => id === itemId)),
  )
  return Option.match(maybeCard, {
    onNone: () => columns,
    onSome: (card) =>
      Array.map(columns, (column) => {
        const withRemoved =
          column.id === fromContainerId
            ? Array.filter(column.cards, ({ id }) => id !== itemId)
            : column.cards
        if (column.id !== toContainerId) {
          return evo(column, { cards: () => withRemoved })
        }
        const inserted = [
          ...Array.take(withRemoved, toIndex),
          card,
          ...Array.drop(withRemoved, toIndex),
        ]
        return evo(column, { cards: () => inserted })
      }),
  })
}

export type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]
const withUpdateReturn = M.withReturnType<UpdateReturn>()

const foldNoOp =
  <Out>(): ((out: Out) => Update.Step<Model, Message>) =>
  () =>
  (model) => [model, []]

const foldDialogOutMessage = M.type<Dialog.OutMessage>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    Opened: foldNoOp<Dialog.OutMessage>(),
    Closed: foldNoOp<Dialog.OutMessage>(),
  }),
)

const foldPopoverOutMessage = M.type<Popover.OutMessage>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    Opened: foldNoOp<Popover.OutMessage>(),
    Closed: foldNoOp<Popover.OutMessage>(),
  }),
)

const foldTooltipOutMessage = M.type<Tooltip.OutMessage>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    Shown: foldNoOp<Tooltip.OutMessage>(),
    Hidden: foldNoOp<Tooltip.OutMessage>(),
  }),
)

const foldMenuOutMessage = M.type<FoldkitMenu.OutMessage>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    Selected: foldNoOp<FoldkitMenu.OutMessage>(),
  }),
)

const foldListboxOutMessage = M.type<FoldkitListbox.OutMessage<ListboxItem>>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => [evo(model, { maybeListboxValue: () => Option.some(value) }), []],
  }),
)

const foldSelectOutMessage = M.type<FoldkitListbox.OutMessage<string>>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => [evo(model, { maybeSelectValue: () => Option.some(value) }), []],
  }),
)

const foldComboboxOutMessage = M.type<FoldkitCombobox.OutMessage<City>>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => [evo(model, { maybeComboboxValue: () => Option.some(value) }), []],
    ClearedSelection: () => (model) => [model, []],
  }),
)

const foldTabsOutMessage = M.type<FoldkitTabs.OutMessage<DemoTab>>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => [evo(model, { activeTab: () => value }), []],
  }),
)

const foldRadioGroupOutMessage = M.type<FoldkitRadioGroup.OutMessage<Plan>>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => [evo(model, { maybePlan: () => Option.some(value) }), []],
  }),
)

const foldSliderRatingOutMessage = M.type<Slider.OutMessage>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    ChangedValue:
      ({ value }) =>
      (model) => [evo(model, { sliderRatingValue: () => value }), []],
  }),
)

const foldSliderVolumeOutMessage = M.type<Slider.OutMessage>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    ChangedValue:
      ({ value }) =>
      (model) => [evo(model, { sliderVolumeValue: () => value }), []],
  }),
)

const foldCalendarOutMessage = M.type<Calendar.OutMessage>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    SelectedDate:
      ({ date }) =>
      (model) => [evo(model, { maybeSelectedDate: () => Option.some(date) }), []],
    ChangedViewMonth: () => (model) => [model, []],
  }),
)

const foldDatePickerOutMessage = M.type<DatePicker.OutMessage>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    SelectedDate:
      ({ date }) =>
      (model) => [evo(model, { maybePickedDate: () => Option.some(date) }), []],
    ClearedDate: () => (model) => [evo(model, { maybePickedDate: () => Option.none() }), []],
    ChangedViewMonth: () => (model) => [model, []],
  }),
)

const foldToastOutMessage = M.type<typeof Toast.OutMessage.Type>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    DismissedToast: foldNoOp<typeof Toast.OutMessage.Type>(),
  }),
)

const foldAnimationOutMessage: (
  outMessage: Animation.OutMessage,
  context: Update.FoldContext<Animation.Message, Message>,
) => Update.Step<Model, Message> = (outMessage, { liftCommand }) =>
  M.value(outMessage).pipe(
    M.withReturnType<Update.Step<Model, Message>>(),
    M.tagsExhaustive({
      StartedLeaveAnimating: () => (model) => [
        model,
        [liftCommand(FoldkitAnimation.defaultLeaveCommand(model.animation))],
      ],
      TransitionedOut: () => (model) => [model, []],
    }),
  )

const foldFileDropOutMessage = M.type<FileDrop.OutMessage>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    ReceivedFiles:
      ({ files }) =>
      (model) => [evo(model, { fileDropFiles: () => [...model.fileDropFiles, ...files] }), []],
    RejectedNonFiles: foldNoOp<FileDrop.OutMessage>(),
  }),
)

const foldDragAndDropOutMessage = M.type<DragAndDrop.OutMessage>().pipe(
  M.withReturnType<Update.Step<Model, Message>>(),
  M.tagsExhaustive({
    Reordered:
      ({ itemId, fromContainerId, toContainerId, toIndex }) =>
      (model) => [
        evo(model, {
          dragColumns: () =>
            reorderColumns(model.dragColumns, itemId, fromContainerId, toContainerId, toIndex),
        }),
        [],
      ],
    Cancelled: () => (model) => [model, []],
  }),
)

const foldDialog = Update.foldChild({
  update: Dialog.update,
  read: (model: Model) => Option.some(model.dialog),
  write: (model, next) => evo(model, { dialog: () => next }),
  toParentMessage: (message) => GotDialogMessage({ message }),
  foldOutMessage: foldDialogOutMessage,
})

const foldPopover = Update.foldChild({
  update: Popover.update,
  read: (model: Model) => Option.some(model.popover),
  write: (model, next) => evo(model, { popover: () => next }),
  toParentMessage: (message) => GotPopoverMessage({ message }),
  foldOutMessage: foldPopoverOutMessage,
})

const foldTooltip = Update.foldChild({
  update: Tooltip.update,
  read: (model: Model) => Option.some(model.tooltip),
  write: (model, next) => evo(model, { tooltip: () => next }),
  toParentMessage: (message) => GotTooltipMessage({ message }),
  foldOutMessage: foldTooltipOutMessage,
})

const foldMenu = Update.foldChild({
  update: DemoMenu.update,
  read: (model: Model) => Option.some(model.menu),
  write: (model, next) => evo(model, { menu: () => next }),
  toParentMessage: (message) => GotMenuMessage({ message }),
  foldOutMessage: foldMenuOutMessage,
})

const foldListbox = Update.foldChild({
  update: ItemListbox.update,
  read: (model: Model) => Option.some(model.listbox),
  write: (model, next) => evo(model, { listbox: () => next }),
  toParentMessage: (message) => GotListboxMessage({ message }),
  foldOutMessage: foldListboxOutMessage,
})

const foldSelect = Update.foldChild({
  update: LanguageSelect.update,
  read: (model: Model) => Option.some(model.select),
  write: (model, next) => evo(model, { select: () => next }),
  toParentMessage: (message) => GotSelectMessage({ message }),
  foldOutMessage: foldSelectOutMessage,
})

const foldCombobox = Update.foldChild({
  update: CityCombobox.update,
  read: (model: Model) => Option.some(model.combobox),
  write: (model, next) => evo(model, { combobox: () => next }),
  toParentMessage: (message) => GotComboboxMessage({ message }),
  foldOutMessage: foldComboboxOutMessage,
})

const foldTabs = Update.foldChild({
  update: DemoTabs.update,
  read: (model: Model) => Option.some(model.tabs),
  write: (model, next) => evo(model, { tabs: () => next }),
  toParentMessage: (message) => GotTabsMessage({ message }),
  foldOutMessage: foldTabsOutMessage,
})

const foldRadioGroup = Update.foldChild({
  update: PlanRadioGroup.update,
  read: (model: Model) => Option.some(model.radioGroup),
  write: (model, next) => evo(model, { radioGroup: () => next }),
  toParentMessage: (message) => GotRadioGroupMessage({ message }),
  foldOutMessage: foldRadioGroupOutMessage,
})

const foldSliderRating = Update.foldChild({
  update: Slider.update,
  read: (model: Model) => Option.some(model.sliderRating),
  write: (model, next) => evo(model, { sliderRating: () => next }),
  toParentMessage: (message) => GotSliderRatingMessage({ message }),
  foldOutMessage: foldSliderRatingOutMessage,
})

const foldSliderVolume = Update.foldChild({
  update: Slider.update,
  read: (model: Model) => Option.some(model.sliderVolume),
  write: (model, next) => evo(model, { sliderVolume: () => next }),
  toParentMessage: (message) => GotSliderVolumeMessage({ message }),
  foldOutMessage: foldSliderVolumeOutMessage,
})

const foldCalendar = Update.foldChild({
  update: Calendar.update,
  read: (model: Model) => Option.some(model.calendar),
  write: (model, next) => evo(model, { calendar: () => next }),
  toParentMessage: (message) => GotCalendarMessage({ message }),
  foldOutMessage: foldCalendarOutMessage,
})

const foldDatePicker = Update.foldChild({
  update: DatePicker.update,
  read: (model: Model) => Option.some(model.datePicker),
  write: (model, next) => evo(model, { datePicker: () => next }),
  toParentMessage: (message) => GotDatePickerMessage({ message }),
  foldOutMessage: foldDatePickerOutMessage,
})

const foldToast = Update.foldChild({
  update: Toast.update,
  read: (model: Model) => Option.some(model.toast),
  write: (model, next) => evo(model, { toast: () => next }),
  toParentMessage: (message) => GotToastMessage({ message }),
  foldOutMessage: foldToastOutMessage,
})

const foldAnimation = Update.foldChild({
  update: Animation.update,
  read: (model: Model) => Option.some(model.animation),
  write: (model, next) => evo(model, { animation: () => next }),
  toParentMessage: (message) => GotAnimationMessage({ message }),
  foldOutMessage: foldAnimationOutMessage,
})

const foldFileDrop = Update.foldChild({
  update: FileDrop.update,
  read: (model: Model) => Option.some(model.fileDrop),
  write: (model, next) => evo(model, { fileDrop: () => next }),
  toParentMessage: (message) => GotFileDropMessage({ message }),
  foldOutMessage: foldFileDropOutMessage,
})

const foldVirtualList = Update.foldChild({
  update: VirtualList.update,
  read: (model: Model) => Option.some(model.virtualList),
  write: (model, next) => evo(model, { virtualList: () => next }),
  toParentMessage: (message) => GotVirtualListMessage({ message }),
})

const foldDragAndDrop = Update.foldChild({
  update: DragAndDrop.update,
  read: (model: Model) => Option.some(model.dragAndDrop),
  write: (model, next) => evo(model, { dragAndDrop: () => next }),
  toParentMessage: (message) => GotDragAndDropMessage({ message }),
  foldOutMessage: foldDragAndDropOutMessage,
})

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    withUpdateReturn,
    M.tagsExhaustive({
      GotDialogMessage: ({ message }) => foldDialog(model, message),
      GotPopoverMessage: ({ message }) => foldPopover(model, message),
      GotTooltipMessage: ({ message }) => foldTooltip(model, message),
      GotMenuMessage: ({ message }) => foldMenu(model, message),
      GotListboxMessage: ({ message }) => foldListbox(model, message),
      GotSelectMessage: ({ message }) => foldSelect(model, message),
      GotComboboxMessage: ({ message }) => foldCombobox(model, message),
      GotTabsMessage: ({ message }) => foldTabs(model, message),
      GotRadioGroupMessage: ({ message }) => foldRadioGroup(model, message),
      GotSliderRatingMessage: ({ message }) => foldSliderRating(model, message),
      GotSliderVolumeMessage: ({ message }) => foldSliderVolume(model, message),
      GotCalendarMessage: ({ message }) => foldCalendar(model, message),
      GotDatePickerMessage: ({ message }) => foldDatePicker(model, message),
      GotToastMessage: ({ message }) => foldToast(model, message),
      GotAnimationMessage: ({ message }) => foldAnimation(model, message),
      GotFileDropMessage: ({ message }) => foldFileDrop(model, message),
      GotVirtualListMessage: ({ message }) => foldVirtualList(model, message),
      GotDragAndDropMessage: ({ message }) => foldDragAndDrop(model, message),

      ClickedButtonDemo: () => [evo(model, { buttonClickCount: (n) => n + 1 }), []],
      UpdatedInputValue: ({ value }) => [evo(model, { inputValue: () => value }), []],
      UpdatedTextareaValue: ({ value }) => [evo(model, { textareaValue: () => value }), []],
      UpdatedSelectValue: ({ value }) => [evo(model, { selectValue: () => value }), []],
      ToggledCheckbox: ({ isChecked }) => [evo(model, { isCheckboxChecked: () => isChecked }), []],
      ToggledSwitchEmail: ({ isChecked }) => [
        evo(model, { isSwitchEmailChecked: () => isChecked }),
        [],
      ],
      ToggledSwitchTfa: ({ isChecked }) => [
        evo(model, { isSwitchTfaChecked: () => isChecked }),
        [],
      ],
      ToggledDisclosureBasic: ({ isOpen }) => [
        evo(model, { isDisclosureBasicOpen: () => isOpen }),
        [],
      ],
      ToggledDisclosureAnimated: ({ isOpen }) => [
        evo(model, { isDisclosureAnimatedOpen: () => isOpen }),
        [],
      ],
      ToggledAccordion: ({ index, isOpen }) => [
        evo(model, {
          accordionOpen: (arr) => arr.map((value, i) => (i === index ? isOpen : value)),
        }),
        [],
      ],
      ToggledCollapsible: ({ isOpen }) => [
        evo(model, { isCollapsibleOpen: () => isOpen }),
        [],
      ],
      ToggledToggle: ({ isPressed }) => [evo(model, { isToggleOn: () => isPressed }), []],
      SelectedToggleGroup: ({ value }) => [evo(model, { toggleGroupValue: () => value }), []],
      UpdatedOtp: ({ value }) => [evo(model, { otp: () => value }), []],
      UpdatedCommandSearch: ({ value }) => [evo(model, { commandSearch: () => value }), []],
      ResizedSplit: ({ percent }) => [evo(model, { resizablePercent: () => percent }), []],

      ClickedOpenDialog: () => {
        const [next, commands] = Dialog.open(model.dialog)
        return [
          evo(model, { dialog: () => next }),
          Command.mapMessages(commands, (message) => GotDialogMessage({ message })),
        ]
      },

      ClickedShowInfoToast: () =>
        showToast(
          model,
          'Info',
          'Changes saved',
          Option.some('Your preferences have been updated.'),
        ),
      ClickedShowSuccessToast: () =>
        showToast(
          model,
          'Success',
          'Uploaded successfully',
          Option.some('kit-manual.pdf is now available.'),
        ),
      ClickedShowWarningToast: () =>
        showToast(
          model,
          'Warning',
          'Network slow',
          Option.some('Some assets are loading over a weak connection.'),
        ),
      ClickedShowErrorToast: () =>
        showToast(
          model,
          'Error',
          'Failed to save',
          Option.some('Check your connection and try again.'),
        ),
      ClickedDismissAllToasts: () => {
        const [next, commands] = Toast.dismissAll(model.toast)
        return [
          evo(model, { toast: () => next }),
          Command.mapMessages(commands, (message) => GotToastMessage({ message })),
        ]
      },

      SelectedNav: ({ value }) => [evo(model, { activeNav: () => value }), []],

      ToggledAnimation: () => {
        const nextShowing = !model.isAnimationShowing
        return foldAnimation(
          evo(model, { isAnimationShowing: () => nextShowing }),
          nextShowing ? FoldkitAnimation.Showed() : FoldkitAnimation.Hid(),
        )
      },

      ClickedRemoveFile: ({ fileIndex }) => [
        evo(model, {
          fileDropFiles: () => Array.remove(model.fileDropFiles, fileIndex),
        }),
        [],
      ],

      ClickedScrollToMiddle: () => {
        const [next, commands] = FoldkitVirtualList.scrollToIndex(
          model.virtualList,
          Math.floor(VIRTUAL_LIST_ROW_COUNT / 2),
        )
        return [
          evo(model, { virtualList: () => next }),
          Command.mapMessages(commands, (message) => GotVirtualListMessage({ message })),
        ]
      },

      UpdatedLoginEmail: ({ value }) => [evo(model, { loginEmail: () => value }), []],
      UpdatedLoginPassword: ({ value }) => [evo(model, { loginPassword: () => value }), []],
      SubmittedLogin: () => [evo(model, { loginSubmitted: () => true }), []],
      UpdatedSettingsName: ({ value }) => [evo(model, { settingsName: () => value }), []],
      UpdatedSettingsEmail: ({ value }) => [evo(model, { settingsEmail: () => value }), []],
      UpdatedSettingsBio: ({ value }) => [evo(model, { settingsBio: () => value }), []],
      UpdatedSettingsLanguage: ({ value }) => [evo(model, { settingsLanguage: () => value }), []],
      ToggledSettingsEmailNotifs: ({ isChecked }) => [
        evo(model, { settingsEmailNotifs: () => isChecked }),
        [],
      ],
      ToggledSettingsTfa: ({ isChecked }) => [evo(model, { settingsTfa: () => isChecked }), []],
      ClickedSaveSettings: () => [evo(model, { settingsSaved: () => true }), []],
      UpdatedTableSearch: ({ value }) => [evo(model, { tableSearch: () => value }), []],
    }),
  )

const showToast = (
  model: Model,
  variant: 'Info' | 'Success' | 'Warning' | 'Error',
  title: string,
  maybeDescription: Option.Option<string>,
): UpdateReturn => {
  const [next, commands] = Toast.show(model.toast, {
    variant,
    payload: { title, maybeDescription },
  })
  return [
    evo(model, { toast: () => next }),
    Command.mapMessages(commands, (message) => GotToastMessage({ message })),
  ]
}

/** Filtered rows for the data-table block demo, derived from the search. */
export const filteredRows = (search: string) =>
  INITIAL_ROWS.filter((row) => row.name.toLowerCase().includes(search.trim().toLowerCase()))
