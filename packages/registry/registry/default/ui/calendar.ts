import type { ViewLabels } from '@foldkit/ui/calendar'
/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Calendar from '@/components/ui/calendar'`
 */
import { Match as M, Option } from 'effect'
import { Calendar as FoldkitCalendar } from '@foldkit/ui'
import type { CalendarDate } from 'foldkit/calendar'
import type { ChildAttribute, Html, HtmlBuilder } from 'foldkit/html'

import { icon } from '@/lib/icons'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide'
import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Calendar submodel surface.

export const init = FoldkitCalendar.init
export const update = FoldkitCalendar.update
export const view = FoldkitCalendar.view
export const Model = FoldkitCalendar.Model
export type Model = typeof Model.Type
export const Message = FoldkitCalendar.Message
export type Message = typeof Message.Type
export const OutMessage = FoldkitCalendar.OutMessage
export type OutMessage = typeof OutMessage.Type

export type InitConfig = FoldkitCalendar.InitConfig
export type ViewInputs = FoldkitCalendar.ViewInputs
export type CalendarAttributes = FoldkitCalendar.CalendarAttributes
export type DaysModeAttributes = FoldkitCalendar.DaysModeAttributes
export type MonthsModeAttributes = FoldkitCalendar.MonthsModeAttributes
export type YearsModeAttributes = FoldkitCalendar.YearsModeAttributes
export type Week = FoldkitCalendar.Week

// foldcn gaps vs upstream: Days/Months/Years drill navigation instead of
// dropdown captions, single-date selection only (no ranges/week numbers),
// and state hooks ride on the cell's group data attrs (data-today/
// data-selected/data-focused/data-outside-month/data-disabled) rather than
// react-day-picker modifiers. foldkit emits those attrs empty (`data-x=""`),
// so the hooks match on attribute presence — never `[data-x=true]` like
// upstream's focused rules — and the cell mounts a plain `group` alongside
// upstream's named `group/day` for the unscooped variants to key off.

/** Upstream root + months strings combined (foldcn renders one container). */
export const calendarContainerClass =
  'cn-calendar group/calendar relative flex w-[calc(var(--cell-size)*7+var(--spacing)*12)] flex-col gap-4 bg-background select-none in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent'

/** Upstream nav + month_caption anatomy (foldcn keeps the header in flow). */
export const calendarHeaderClass =
  'grid h-(--cell-size) w-full grid-cols-[var(--cell-size)_1fr_var(--cell-size)] items-center gap-1'

export const calendarHeadingButtonClass =
  'cn-calendar-caption-label flex min-w-0 flex-1 items-center justify-center gap-1 truncate rounded-(--cell-radius) text-sm font-medium whitespace-nowrap select-none [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground'

export const calendarHeadingTextClass = 'cn-calendar-caption text-sm font-medium select-none'

/** Upstream nav button: Button ghost icon at cell size. */
export const calendarNavButtonClass =
  'cn-button cn-button-variant-ghost cn-button-size-icon inline-flex items-center justify-center size-(--cell-size) shrink-0 p-0 select-none aria-disabled:opacity-50'

export const calendarGridClass = 'flex w-full min-w-0 flex-col outline-none'

/** Upstream week string with PR spacing fix. */
export const calendarRowClass = 'mt-2 grid w-full grid-cols-7 gap-x-2 gap-y-1'

/** Upstream weekdays string (the weekday *header* row; weeks get mt-2,
 *  weekdays don't). */
export const calendarWeekdaysClass = 'flex'

/** Upstream weekday string. */
export const calendarColumnHeaderClass =
  'flex-1 rounded-(--cell-radius) py-1 text-center text-[0.8rem] font-normal text-muted-foreground select-none'

/** Upstream day-cell string, plus a plain `group` mount: foldkit puts the
 *  state data attrs on this cell, and the day/month/year buttons read them
 *  via group-data-* variants. */
export const calendarCellClass =
  'group group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none'

/** Upstream DayButton string (ghost icon button base) plus foldcn's
 *  group-scoped state hooks. Presence-based because foldkit emits empty
 *  attr values; transition-all replaces what upstream inherits from the
 *  Button cva base, which foldcn's token layer does not carry. */
export const calendarDayButtonClass =
  'cn-button cn-button-variant-ghost cn-button-size-icon cn-calendar-day-button relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) items-center justify-center border-0 leading-none font-normal transition-all group-data-[focused]/day:relative group-data-[focused]/day:z-10 group-data-[focused]/day:border-ring group-data-[focused]/day:ring-[3px] group-data-[focused]/day:ring-ring/50 group-data-[selected]:rounded-(--cell-radius) group-data-[selected]:bg-primary group-data-[selected]:text-primary-foreground group-data-[selected]:hover:bg-primary group-data-[selected]:hover:text-primary-foreground group-data-[today]:bg-muted group-data-[today]:text-foreground group-data-[outside-month]:text-muted-foreground group-data-[disabled]:pointer-events-none group-data-[disabled]:text-muted-foreground group-data-[disabled]:opacity-50 dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70'

export const calendarMonthYearGridClass = 'grid w-full grid-cols-3 grid-rows-4 gap-2 outline-none'

export const calendarMonthYearButtonClass =
  'flex h-full w-full cursor-pointer items-center justify-center rounded-(--cell-radius) text-sm tabular-nums transition-colors hover:bg-accent hover:text-accent-foreground group-data-[today]:bg-muted group-data-[today]:text-foreground group-data-[selected]:bg-primary group-data-[selected]:text-primary-foreground group-data-[selected]:hover:bg-primary group-data-[selected]:hover:text-primary-foreground group-data-[focused]:border-ring group-data-[focused]:ring-[3px] group-data-[focused]:ring-ring/50 group-data-[disabled]:pointer-events-none group-data-[disabled]:opacity-40'

const navButton = <M>(
  attributes: ReadonlyArray<ChildAttribute>,
  icon: Html,
  h: HtmlBuilder<M>,
): Html => h.button([...attributes, h.Class(calendarNavButtonClass)], [icon])

const headingButton = <M>(
  heading: DaysModeAttributes['heading'],
  attributes: ReadonlyArray<ChildAttribute>,
  h: HtmlBuilder<M>,
): Html =>
  h.button(
    [h.Id(heading.id), ...attributes, h.Class(calendarHeadingButtonClass)],
    [heading.text, icon(h, ChevronDown, 'size-3')],
  )

const weekRow = <M>(week: Week, showOutsideDays: boolean, h: HtmlBuilder<M>): Html =>
  h.div(
    [...week.attributes, h.Class(calendarRowClass)],
    week.cells.map((cell) =>
      h.div(
        [...cell.cellAttributes, h.Class(calendarCellClass)],
        [
          h.button(
            [
              ...cell.buttonAttributes,
              h.Class(
                showOutsideDays || cell.isInViewMonth
                  ? calendarDayButtonClass
                  : cn(calendarDayButtonClass, 'invisible pointer-events-none'),
              ),
            ],
            [cell.label],
          ),
        ],
      ),
    ),
  )

const daysView = <M>(
  days: DaysModeAttributes,
  h: HtmlBuilder<M>,
  options: CalendarViewOptions | undefined,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'calendar'),
      ...days.root,
      h.Class(cn(calendarContainerClass, options?.containerClass)),
    ],
    [
      h.div(
        [h.Class(calendarHeaderClass)],
        [
          navButton(days.previousMonthButton, icon(h, ChevronLeft, 'cn-rtl-flip size-4'), h),
          headingButton(days.heading, days.headingButton, h),
          navButton(days.nextMonthButton, icon(h, ChevronRight, 'cn-rtl-flip size-4'), h),
        ],
      ),
      h.div(
        [...days.grid, h.Class(calendarGridClass)],
        [
          h.div(
            [...days.headerRow, h.Class(calendarWeekdaysClass)],
            days.columnHeaders.map((header) =>
              h.div([...header.attributes, h.Class(calendarColumnHeaderClass)], [header.name]),
            ),
          ),
          h.div(
            [h.Class('flex flex-col min-h-[calc(var(--cell-size)*6+var(--spacing)*5)]')],
            [...days.weeks.map((week) => weekRow(week, options?.showOutsideDays ?? true, h))],
          ),
        ],
      ),
    ],
  )

const monthsView = <M>(
  months: MonthsModeAttributes,
  h: HtmlBuilder<M>,
  options: CalendarViewOptions | undefined,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'calendar'),
      ...months.root,
      h.Class(cn(calendarContainerClass, options?.containerClass)),
    ],
    [
      h.div(
        [h.Class(calendarHeaderClass)],
        [
          h.button(
            [
              h.Id(months.heading.id),
              ...months.headingButton,
              h.Class(cn(calendarHeadingButtonClass, 'col-span-3')),
            ],
            [months.heading.text, icon(h, ChevronDown, 'size-3')],
          ),
        ],
      ),
      h.div(
        [...months.grid, h.Class(calendarMonthYearGridClass)],
        months.cells.map((cell) =>
          h.div(
            [...cell.cellAttributes, h.Class(calendarCellClass)],
            [
              h.button(
                [...cell.buttonAttributes, h.Class(calendarMonthYearButtonClass)],
                [cell.shortLabel],
              ),
            ],
          ),
        ),
      ),
    ],
  )

const yearsView = <M>(
  years: YearsModeAttributes,
  h: HtmlBuilder<M>,
  options: CalendarViewOptions | undefined,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'calendar'),
      ...years.root,
      h.Class(cn(calendarContainerClass, options?.containerClass)),
    ],
    [
      h.div(
        [h.Class(calendarHeaderClass)],
        [
          navButton(years.previousPageButton, icon(h, ChevronLeft, 'cn-rtl-flip size-4'), h),
          h.h2([h.Id(years.heading.id), h.Class(calendarHeadingTextClass)], [years.heading.text]),
          navButton(years.nextPageButton, icon(h, ChevronRight, 'cn-rtl-flip size-4'), h),
        ],
      ),
      h.div(
        [...years.grid, h.Class(calendarMonthYearGridClass)],
        years.cells.map((cell) =>
          h.div(
            [...cell.cellAttributes, h.Class(calendarCellClass)],
            [
              h.button(
                [...cell.buttonAttributes, h.Class(calendarMonthYearButtonClass)],
                [cell.label],
              ),
            ],
          ),
        ),
      ),
    ],
  )

export type CalendarViewOptions = Readonly<{
  containerClass?: string
  showOutsideDays?: boolean
}>

export type StyledViewInputs = Readonly<{
  maybeSelectedDate: Option.Option<CalendarDate>
  containerClass?: string
  showOutsideDays?: boolean
}> &
  ViewLabels

/** Styled calendar `toView` callback for the Days/Months/Years modes. Shared
 *  with the date picker's popover panel. */
export const calendarToView = <M>(
  h: HtmlBuilder<M>,
  options?: CalendarViewOptions,
): ((attributes: CalendarAttributes) => Html) =>
  M.type<CalendarAttributes>().pipe(
    M.tagsExhaustive({
      Days: (days) => daysView(days, h, options),
      Months: (months) => monthsView(months, h, options),
      Years: (years) => yearsView(years, h, options),
    }),
  )

/** Build styled `Calendar.ViewInputs`. Pass your view's `h`. */
export const styledViewInputs = <M>(
  viewInputs: StyledViewInputs,
  h: HtmlBuilder<M>,
): ViewInputs => ({
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

  toView: calendarToView(h, {
    containerClass: viewInputs.containerClass,
    showOutsideDays: viewInputs.showOutsideDays ?? true,
  }),
})
