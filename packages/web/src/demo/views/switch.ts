import type { Html, HtmlBuilder } from 'foldkit/html'

import { switch_ } from '@foldcn/registry/styles/default/ui/switch'

import { ToggledSwitchEmail, ToggledSwitchTfa, type Message } from '../message'
import type { Model } from '../model'

export const switchView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-sm flex-col gap-5')],
    [
      switch_<Message>(
        {
          id: 'switch-email',
          label: 'Email notifications',
          maybeDescription: 'Receive emails about your account activity.',
          isChecked: model.isSwitchEmailChecked,
          onToggle: (isChecked) => ToggledSwitchEmail({ isChecked }),
        },
        h,
      ),
      switch_<Message>(
        {
          id: 'switch-2fa',
          label: 'Two-factor authentication',
          maybeDescription: 'Add an extra layer of security to your account.',
          isChecked: model.isSwitchTfaChecked,
          onToggle: (isChecked) => ToggledSwitchTfa({ isChecked }),
        },
        h,
      ),
    ],
  )
