import type { Html, HtmlBuilder } from 'foldkit/html'

import { checkbox } from '@foldcn/registry/styles/default/ui/checkbox'

import { ToggledCheckbox, type Message } from '../message'
import type { Model } from '../model'

export const checkboxView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-sm flex-col gap-5')],
    [
      checkbox<Message>(
        {
          id: 'checkbox-terms',
          label: 'Accept terms and conditions',
          maybeDescription: 'Required before you can continue.',
          isChecked: model.isCheckboxChecked,
          onToggle: (isChecked) => ToggledCheckbox({ isChecked }),
        },
        h,
      ),
      checkbox<Message>(
        {
          id: 'checkbox-indeterminate',
          label: 'Notify me of updates',
          isChecked: false,
          isIndeterminate: true,
          onToggle: () => ToggledCheckbox({ isChecked: false }),
        },
        h,
      ),
    ],
  )
