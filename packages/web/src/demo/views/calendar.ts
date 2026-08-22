import type { Html, HtmlBuilder } from 'foldkit/html'

import * as calendar from '@foldcn/registry/styles/default/ui/calendar'

import { GotCalendarMessage, type Message } from '../message'
import type { Model } from '../model'

export const calendarView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.submodel({
    slotId: model.calendar.id,
    model: model.calendar,
    view: calendar.view,
    viewInputs: calendar.styledViewInputs({ maybeSelectedDate: model.maybeSelectedDate }, h),
    toParentMessage: (message) => GotCalendarMessage({ message }),
  })
