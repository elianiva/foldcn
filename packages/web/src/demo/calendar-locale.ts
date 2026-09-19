import { Calendar } from 'foldkit'
import type { ViewLabels } from '@foldkit/ui/calendar'

const dayFirst = [
  Calendar.DatePart.DayNumber(),
  Calendar.DatePart.LiteralText({ text: '. ' }),
  Calendar.DatePart.MonthName(),
  Calendar.DatePart.LiteralText({ text: ' ' }),
  Calendar.DatePart.YearNumber(),
] as const

export const germanLocale: Calendar.LocaleConfig = {
  ...Calendar.defaultEnglishLocale,
  firstDayOfWeek: 'Monday',
  monthNames: [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ],
  shortMonthNames: [
    'Jan',
    'Feb',
    'Mär',
    'Apr',
    'Mai',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dez',
  ],
  dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  shortDayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  longFormat: dayFirst,
  shortFormat: [
    Calendar.DatePart.PaddedDayNumber(),
    Calendar.DatePart.LiteralText({ text: '.' }),
    Calendar.DatePart.PaddedMonthNumber(),
    Calendar.DatePart.LiteralText({ text: '.' }),
    Calendar.DatePart.YearNumber(),
  ],
  ariaLabelFormat: [
    Calendar.DatePart.DayName(),
    Calendar.DatePart.LiteralText({ text: ', ' }),
    ...dayFirst,
  ],
}

export const germanLabels: ViewLabels = {
  previousMonthLabel: 'Vorheriger Monat',
  nextMonthLabel: 'Nächster Monat',
  previousYearsPageLabel: 'Vorherige Jahre',
  nextYearsPageLabel: 'Nächste Jahre',
  daysHeadingButtonLabel: 'Monat wählen',
  monthsHeadingButtonLabel: 'Jahr wählen',
  toDaysGridLabel: (monthYear) => `Kalender für ${monthYear}`,
  toWeekLabel: (date) => `Woche ab ${Calendar.formatLong(date, germanLocale)}`,
  toMonthsGridLabel: (year) => `Monate ${year}`,
  toYearsGridLabel: (start, end) => `Jahre ${start} bis ${end}`,
}
