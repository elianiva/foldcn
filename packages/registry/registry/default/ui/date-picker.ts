import type { ViewLabels } from '@foldkit/ui/calendar'
/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as DatePicker from '@/components/ui/date-picker'`
 */
import { Option } from 'effect'
import { DatePicker as FoldkitDatePicker } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/anchor'
import { formatLong, type LocaleConfig, type CalendarDate } from 'foldkit/calendar'
import type { HtmlBuilder } from 'foldkit/html'

import { icon } from '@/lib/icons'
import { ChevronDown } from 'lucide'
import { cn } from '@/lib/utils'
import { childAttributes } from 'foldkit/html'
import { calendarToView } from '@/ui/calendar'

// Re-export the @foldkit/ui DatePicker submodel surface.

export const init = (config: InitConfig): Model =>
  FoldkitDatePicker.init({ isAnimated: true, ...config })
export const update = FoldkitDatePicker.update
export const view = FoldkitDatePicker.view
export const Model = FoldkitDatePicker.Model
export type Model = typeof Model.Type
export const Message = FoldkitDatePicker.Message
export type Message = typeof Message.Type
export const OutMessage = FoldkitDatePicker.OutMessage
export type OutMessage = typeof OutMessage.Type
export const triggerId = FoldkitDatePicker.triggerId

export type InitConfig = FoldkitDatePicker.InitConfig
export type ViewInputs = FoldkitDatePicker.ViewInputs

export const datePickerTriggerClass =
  "flex h-10 min-w-48 items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm outline-none transition-[color,box-shadow] hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

export const datePickerPanelClass =
  'z-50 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2'

export const datePickerPanelAnimatedClass =
  'z-50 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 data-[enter]:animate-in data-[enter]:fade-in-0 data-[enter]:zoom-in-95 data-[leave]:animate-out data-[leave]:fade-out-0 data-[leave]:zoom-out-95'

export const datePickerBackdropClass = 'fixed inset-0 z-0'

export const datePickerWrapperClass = 'relative inline-block'

export const datePickerPlaceholderClass = 'text-muted-foreground'

export const DATE_PICKER_ANCHOR: AnchorConfig = {
  placement: 'bottom-start',
  gap: 4,
  padding: 8,
}

const formatTriggerLabel = (date: Readonly<{ year: number; month: number; day: number }>): string =>
  `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`

export type StyledViewInputs = Readonly<{
  /** Pass model.calendar.locale to keep the trigger and calendar in the same locale. */
  locale?: LocaleConfig
  placeholder?: string
  maybeSelectedDate: Option.Option<CalendarDate>
  anchor?: AnchorConfig
  isDisabled?: boolean
  isAnimated?: boolean
  name?: string
  className?: string
  triggerClass?: string
  panelClass?: string
  backdropClass?: string
  wrapperClass?: string
}> &
  ViewLabels

/** Build styled `DatePicker.ViewInputs`. Pass your view's `h`. The trigger
 *  face shows the ISO date or a placeholder; the popover panel renders the
 *  styled calendar grid from the calendar item. */
export const styledViewInputs = <M>(
  viewInputs: StyledViewInputs,
  h: HtmlBuilder<M>,
): ViewInputs => ({
  anchor: viewInputs.anchor ?? DATE_PICKER_ANCHOR,
  maybeSelectedDate: viewInputs.maybeSelectedDate,
  previousMonthLabel: viewInputs.previousMonthLabel,
  nextMonthLabel: viewInputs.nextMonthLabel,
  previousYearsPageLabel: viewInputs.previousYearsPageLabel,
  nextYearsPageLabel: viewInputs.nextYearsPageLabel,
  daysHeadingButtonLabel: viewInputs.daysHeadingButtonLabel,
  monthsHeadingButtonLabel: viewInputs.monthsHeadingButtonLabel,
  toDaysGridLabel: viewInputs.toDaysGridLabel,
  toWeekLabel: viewInputs.toWeekLabel,
  toMonthsGridLabel: viewInputs.toMonthsGridLabel,
  toYearsGridLabel: viewInputs.toYearsGridLabel,

  isDisabled: viewInputs.isDisabled,
  name: viewInputs.name,
  className: cn(datePickerWrapperClass, viewInputs.wrapperClass),
  attributes: childAttributes([h.DataAttribute('slot', 'date-picker')]),
  triggerClassName: cn(datePickerTriggerClass, viewInputs.triggerClass),
  triggerAttributes: childAttributes([h.DataAttribute('slot', 'date-picker-trigger')]),
  panelClassName: cn(
    viewInputs.isAnimated !== false ? datePickerPanelAnimatedClass : datePickerPanelClass,
    viewInputs.panelClass,
  ),
  panelAttributes: childAttributes([h.DataAttribute('slot', 'date-picker-content')]),
  backdropClassName: cn(datePickerBackdropClass, viewInputs.backdropClass),
  triggerContent: (maybeDate) =>
    h.div(
      [h.Class('flex w-full items-center justify-between gap-4')],
      [
        Option.match(maybeDate, {
          onNone: () =>
            h.span(
              [h.Class(datePickerPlaceholderClass)],
              [viewInputs.placeholder ?? 'Pick a date'],
            ),
          onSome: (date) =>
            h.span(
              [],
              [viewInputs.locale ? formatLong(date, viewInputs.locale) : formatTriggerLabel(date)],
            ),
        }),
        icon(h, ChevronDown),
      ],
    ),
  toCalendarView: calendarToView(h),
})
