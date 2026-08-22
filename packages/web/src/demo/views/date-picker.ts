import type { Html, HtmlBuilder } from 'foldkit/html'

import * as datePicker from '@foldcn/registry/styles/default/ui/date-picker'

import { GotDatePickerMessage, type Message } from '../message'
import type { Model } from '../model'

export const datePickerView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.submodel({
    slotId: model.datePicker.id,
    model: model.datePicker,
    view: datePicker.view,
    viewInputs: datePicker.styledViewInputs({ maybeSelectedDate: model.maybePickedDate }, h),
    toParentMessage: (message) => GotDatePickerMessage({ message }),
  })
