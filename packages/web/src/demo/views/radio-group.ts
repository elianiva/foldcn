import type { Html, HtmlBuilder } from 'foldkit/html'

import * as radioGroup from '@foldcn/registry/styles/default/ui/radio-group'
import { PlanRadioGroup } from '../bundles'

import { GotRadioGroupMessage, type Message } from '../message'
import type { Model, Plan } from '../model'

const PLAN_DESCRIPTIONS: Record<Plan, string> = {
  Startup: '12GB / 6 CPUs. Perfect for small projects',
  Business: '16GB / 8 CPUs. For growing teams',
  Enterprise: '32GB / 12 CPUs. Dedicated infrastructure',
}

export const radioGroupView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('w-full')],
    [
      h.submodel({
        slotId: model.radioGroup.id,
        model: model.radioGroup,
        view: PlanRadioGroup.view,
        viewInputs: radioGroup.styledViewInputs<Message, Plan>(
          {
            options: ['Startup', 'Business', 'Enterprise'],
            selectedValue: model.maybePlan,
            ariaLabel: 'Server plan',
            optionLabel: (value) => value,
            optionDescription: (value) => PLAN_DESCRIPTIONS[value],
          },
          h,
        ),
        toParentMessage: (message) => GotRadioGroupMessage({ message }),
      }),
    ],
  )
