import { germanLocale, germanLabels } from '../calendar-locale'
import { Update } from 'foldkit'
import { Calendar as FoldkitCalendar } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { modifyFields } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as datePicker from '../../generated/registry/ui/date-picker'

import { DEMO_TODAY } from '../bundles'
import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotLocalizedDatePickerMessage: { message: datePicker.Message },
  GotDatePickerMessage: { message: datePicker.Message },
})

export const datePickerView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex flex-col gap-8')],
    [
      h.section(
        [],
        [
          h.h3([h.Class('mb-3 font-medium')], ['Default']),
          h.submodel({
            slotId: model.datePicker.id,
            model: model.datePicker,
            view: datePicker.view,
            viewInputs: datePicker.styledViewInputs(
              { maybeSelectedDate: model.maybePickedDate },
              h,
            ),
            toParentMessage: (message) => Message.GotDatePickerMessage({ message }),
          }),
        ],
      ),
      h.section(
        [h.DataAttribute('localized-example', '')],
        [
          h.h3([h.Class('mb-3 font-medium')], ['Deutsch']),
          h.submodel({
            slotId: model.localizedDatepicker.id,
            model: model.localizedDatepicker,
            view: datePicker.view,
            viewInputs: datePicker.styledViewInputs(
              {
                ...germanLabels,
                maybeSelectedDate: model.localizedPickerDate,
                locale: model.localizedDatepicker.calendar.locale,
                placeholder: 'Datum wählen',
              },
              h,
            ),
            toParentMessage: (message) => Message.GotLocalizedDatePickerMessage({ message }),
          }),
        ],
      ),
    ],
  )

const foldDatePickerOutMessage = M.type<datePicker.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    SelectedDate:
      ({ date }) =>
      (model) => ({ model: modifyFields(model, { maybePickedDate: () => Option.some(date) }) }),
    ClearedDate: () => (model) => ({
      model: modifyFields(model, { maybePickedDate: () => Option.none() }),
    }),
    ChangedViewMonth: () => (model) => ({ model }),
  }),
)

const foldDatePicker = Update.foldChild({
  update: datePicker.update,
  read: (model: State) => Option.some(model.datePicker),
  write: (model, next) => modifyFields(model, { datePicker: () => next }),
  toParentMessage: (message) => Message.GotDatePickerMessage({ message }),
  foldOutMessage: foldDatePickerOutMessage,
})

const foldLocalizedOutMessage = M.type<datePicker.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    SelectedDate:
      ({ date }) =>
      (model) => ({ model: modifyFields(model, { localizedPickerDate: () => Option.some(date) }) }),
    ClearedDate: () => (model) => ({
      model: modifyFields(model, { localizedPickerDate: () => Option.none() }),
    }),
    ChangedViewMonth: () => (model) => ({ model }),
  }),
)

const foldLocalized = Update.foldChild({
  update: datePicker.update,
  read: (model: State) => Option.some(model.localizedDatepicker),
  write: (model, next) => modifyFields(model, { localizedDatepicker: () => next }),
  toParentMessage: (message) => Message.GotLocalizedDatePickerMessage({ message }),
  foldOutMessage: foldLocalizedOutMessage,
})

const fields = {
  localizedDatepicker: datePicker.Model,
  localizedPickerDate: S.Option(FoldkitCalendar.CalendarDate),
  datePicker: datePicker.Model,
  maybePickedDate: S.Option(FoldkitCalendar.CalendarDate),
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    localizedDatepicker: datePicker.init({
      id: 'date-picker-german',
      today: DEMO_TODAY,
      locale: germanLocale,
    }),
    localizedPickerDate: Option.some(DEMO_TODAY),
    datePicker: datePicker.init({
      id: 'date-picker-demo',
      today: DEMO_TODAY,
      minDate: FoldkitCalendar.subtractYears(DEMO_TODAY, 1),
      maxDate: FoldkitCalendar.addYears(DEMO_TODAY, 1),
    }),
    maybePickedDate: Option.none(),
  },
  messages: [Message.GotLocalizedDatePickerMessage, Message.GotDatePickerMessage],
  handlers: (model: State) => ({
    GotLocalizedDatePickerMessage: (
      payload: typeof Message.GotLocalizedDatePickerMessage.Type,
    ): UpdateReturn => foldLocalized(model, payload.message),
    GotDatePickerMessage: (payload: typeof Message.GotDatePickerMessage.Type): UpdateReturn =>
      foldDatePicker(model, payload.message),
  }),
  samples: [],
  // Date selection flows through the submodel's out-messages; the public
  // @foldkit/ui namespace exports no child-message constructors, so there
  // are no top-level samples to feed update().
})
