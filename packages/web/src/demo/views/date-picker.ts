import { Update } from 'foldkit'
import { Calendar as FoldkitCalendar } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as datePicker from '../../generated/registry/ui/date-picker'

import { DEMO_TODAY } from '../bundles'
import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotDatePickerMessage: { message: datePicker.Message },
})

export const datePickerView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.submodel({
    slotId: model.datePicker.id,
    model: model.datePicker,
    view: datePicker.view,
    viewInputs: datePicker.styledViewInputs({ maybeSelectedDate: model.maybePickedDate }, h),
    toParentMessage: (message) => Message.GotDatePickerMessage({ message }),
  })

const foldDatePickerOutMessage = M.type<datePicker.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    SelectedDate:
      ({ date }) =>
      (model) => ({ model: evo(model, { maybePickedDate: () => Option.some(date) }) }),
    ClearedDate: () => (model) => ({ model: evo(model, { maybePickedDate: () => Option.none() }) }),
    ChangedViewMonth: () => (model) => ({ model }),
  }),
)

const foldDatePicker = Update.foldChild({
  update: datePicker.update,
  read: (model: State) => Option.some(model.datePicker),
  write: (model, next) => evo(model, { datePicker: () => next }),
  toParentMessage: (message) => Message.GotDatePickerMessage({ message }),
  foldOutMessage: foldDatePickerOutMessage,
})

const fields = {
  datePicker: datePicker.Model,
  maybePickedDate: S.Option(FoldkitCalendar.CalendarDate),
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    datePicker: datePicker.init({
      id: 'date-picker-demo',
      today: DEMO_TODAY,
      minDate: FoldkitCalendar.subtractYears(DEMO_TODAY, 1),
      maxDate: FoldkitCalendar.addYears(DEMO_TODAY, 1),
    }),
    maybePickedDate: Option.none(),
  },
  messages: [Message.GotDatePickerMessage],
  handlers: (model: State) => ({
    GotDatePickerMessage: (payload: typeof Message.GotDatePickerMessage.Type): UpdateReturn =>
      foldDatePicker(model, payload.message),
  }),
  samples: [],
  // Date selection flows through the submodel's out-messages; the public
  // @foldkit/ui namespace exports no child-message constructors, so there
  // are no top-level samples to feed update().
})
