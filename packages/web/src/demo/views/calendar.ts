import { germanLocale, germanLabels } from '../calendar-locale'
import { Update } from 'foldkit'
import { Calendar as FoldkitCalendar } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { modifyFields } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as calendar from '../../generated/registry/ui/calendar'

import { DEMO_TODAY } from '../bundles'
import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotLocalizedCalendarMessage: { message: calendar.Message },
  GotCalendarMessage: { message: calendar.Message },
})

// Single-date calendar mirroring apps/v4/examples/base/calendar-demo.tsx
export const calendarView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex flex-col gap-8')],
    [
      h.section(
        [],
        [
          h.h3([h.Class('mb-3 font-medium')], ['Default']),
          h.submodel({
            slotId: model.calendar.id,
            model: model.calendar,
            view: calendar.view,
            viewInputs: calendar.styledViewInputs(
              { maybeSelectedDate: model.maybeSelectedDate, containerClass: 'rounded-lg border' },
              h,
            ),
            toParentMessage: (message) => Message.GotCalendarMessage({ message }),
          }),
        ],
      ),
      h.section(
        [h.DataAttribute('localized-example', '')],
        [
          h.h3([h.Class('mb-3 font-medium')], ['Deutsch']),
          h.submodel({
            slotId: model.localizedCalendar.id,
            model: model.localizedCalendar,
            view: calendar.view,
            viewInputs: calendar.styledViewInputs(
              {
                ...germanLabels,
                maybeSelectedDate: model.localizedCalendarDate,
                containerClass: 'rounded-lg border',
              },
              h,
            ),
            toParentMessage: (message) => Message.GotLocalizedCalendarMessage({ message }),
          }),
        ],
      ),
    ],
  )

const foldCalendarOutMessage = M.type<calendar.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    SelectedDate:
      ({ date }) =>
      (model) => ({ model: modifyFields(model, { maybeSelectedDate: () => Option.some(date) }) }),
    ChangedViewMonth: () => (model) => ({ model }),
  }),
)

const foldCalendar = Update.foldChild({
  update: calendar.update,
  read: (model: State) => Option.some(model.calendar),
  write: (model, next) => modifyFields(model, { calendar: () => next }),
  toParentMessage: (message) => Message.GotCalendarMessage({ message }),
  foldOutMessage: foldCalendarOutMessage,
})

const foldLocalizedOutMessage = M.type<calendar.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    SelectedDate:
      ({ date }) =>
      (model) => ({
        model: modifyFields(model, { localizedCalendarDate: () => Option.some(date) }),
      }),
    ChangedViewMonth: () => (model) => ({ model }),
  }),
)

const foldLocalized = Update.foldChild({
  update: calendar.update,
  read: (model: State) => Option.some(model.localizedCalendar),
  write: (model, next) => modifyFields(model, { localizedCalendar: () => next }),
  toParentMessage: (message) => Message.GotLocalizedCalendarMessage({ message }),
  foldOutMessage: foldLocalizedOutMessage,
})

const fields = {
  localizedCalendar: calendar.Model,
  localizedCalendarDate: S.Option(FoldkitCalendar.CalendarDate),
  calendar: calendar.Model,
  maybeSelectedDate: S.Option(FoldkitCalendar.CalendarDate),
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    localizedCalendar: calendar.init({
      id: 'calendar-german',
      today: DEMO_TODAY,
      locale: germanLocale,
    }),
    localizedCalendarDate: Option.some(DEMO_TODAY),
    calendar: calendar.init({
      id: 'calendar-demo',
      today: DEMO_TODAY,
      minDate: FoldkitCalendar.subtractYears(DEMO_TODAY, 1),
      maxDate: FoldkitCalendar.addYears(DEMO_TODAY, 1),
    }),
    maybeSelectedDate: Option.some(DEMO_TODAY),
  },
  messages: [Message.GotLocalizedCalendarMessage, Message.GotCalendarMessage],
  handlers: (model: State) => ({
    GotLocalizedCalendarMessage: (
      payload: typeof Message.GotLocalizedCalendarMessage.Type,
    ): UpdateReturn => foldLocalized(model, payload.message),
    GotCalendarMessage: (payload: typeof Message.GotCalendarMessage.Type): UpdateReturn =>
      foldCalendar(model, payload.message),
  }),
  samples: [],
  // Date selection flows through the submodel's out-messages; the public
  // @foldkit/ui namespace exports no child-message constructors, so there
  // are no top-level samples to feed update().
})
