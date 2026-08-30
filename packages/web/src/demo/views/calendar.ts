import { Update } from 'foldkit'
import { Calendar as FoldkitCalendar } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as calendar from '../../generated/registry/ui/calendar'

import { DEMO_TODAY } from '../bundles'
import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotCalendarMessage: { message: calendar.Message },
})

// Single-date calendar mirroring apps/v4/examples/base/calendar-demo.tsx
export const calendarView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.submodel({
    slotId: model.calendar.id,
    model: model.calendar,
    view: calendar.view,
    viewInputs: calendar.styledViewInputs(
      { maybeSelectedDate: model.maybeSelectedDate, containerClass: 'rounded-lg border' },
      h,
    ),
    toParentMessage: (message) => Message.GotCalendarMessage({ message }),
  })

const foldCalendarOutMessage = M.type<calendar.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    SelectedDate:
      ({ date }) =>
      (model) => ({ model: evo(model, { maybeSelectedDate: () => Option.some(date) }) }),
    ChangedViewMonth: () => (model) => ({ model }),
  }),
)

const foldCalendar = Update.foldChild({
  update: calendar.update,
  read: (model: State) => Option.some(model.calendar),
  write: (model, next) => evo(model, { calendar: () => next }),
  toParentMessage: (message) => Message.GotCalendarMessage({ message }),
  foldOutMessage: foldCalendarOutMessage,
})

const fields = {
  calendar: calendar.Model,
  maybeSelectedDate: S.Option(FoldkitCalendar.CalendarDate),
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    calendar: calendar.init({
      id: 'calendar-demo',
      today: DEMO_TODAY,
      minDate: FoldkitCalendar.subtractYears(DEMO_TODAY, 1),
      maxDate: FoldkitCalendar.addYears(DEMO_TODAY, 1),
    }),
    maybeSelectedDate: Option.some(DEMO_TODAY),
  },
  messages: [Message.GotCalendarMessage],
  handlers: (model: State) => ({
    GotCalendarMessage: (payload: typeof Message.GotCalendarMessage.Type): UpdateReturn =>
      foldCalendar(model, payload.message),
  }),
  samples: [],
  // Date selection flows through the submodel's out-messages; the public
  // @foldkit/ui namespace exports no child-message constructors, so there
  // are no top-level samples to feed update().
})
