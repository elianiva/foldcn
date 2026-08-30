import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { switch_ } from '../../generated/registry/ui/switch'
import {
  field,
  fieldContent,
  fieldDescription,
  fieldLabel,
  fieldTitle,
} from '../../generated/registry/ui/fieldset'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  ToggledSwitch: { isChecked: S.Boolean },
})

export const switchView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          field<AppMessage>(
            { orientation: 'horizontal' },
            [
              switch_<AppMessage>(
                {
                  id: 'switch-basic',
                  label: 'Airplane Mode',
                  isChecked: model.isSwitchChecked,
                  onToggle: (isChecked) => Message.ToggledSwitch({ isChecked }),
                },
                h,
              ),
            ],
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Label']),
          h.div(
            [h.Class('flex items-center gap-2')],
            [
              switch_<AppMessage>(
                {
                  id: 'switch-bluetooth',
                  label: 'Bluetooth',
                  isChecked: true,
                  onToggle: () => Message.ToggledSwitch({ isChecked: true }),
                },
                h,
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Description']),
          fieldLabel<AppMessage>(
            { for: 'switch-focus-mode' },
            [
              field<AppMessage>(
                { orientation: 'horizontal' },
                [
                  fieldContent<AppMessage>(
                    {},
                    [
                      fieldTitle<AppMessage>({}, ['Share across devices'], h),
                      fieldDescription<AppMessage>(
                        {},
                        ['Focus is shared across devices, and turns off when you leave the app.'],
                        h,
                      ),
                    ],
                    h,
                  ),
                  switch_<AppMessage>(
                    {
                      id: 'switch-focus-mode',
                      label: '',
                      isChecked: false,
                      onToggle: () => Message.ToggledSwitch({ isChecked: false }),
                    },
                    h,
                  ),
                ],
                h,
              ),
            ],
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Disabled']),
          h.div(
            [h.Class('flex flex-col gap-4')],
            [
              h.div(
                [h.Class('flex items-center gap-2')],
                [
                  switch_<AppMessage>(
                    {
                      id: 'switch-disabled-unchecked',
                      label: 'Disabled (Unchecked)',
                      isChecked: false,
                      isDisabled: true,
                      onToggle: () => Message.ToggledSwitch({ isChecked: false }),
                    },
                    h,
                  ),
                ],
              ),
              h.div(
                [h.Class('flex items-center gap-2')],
                [
                  switch_<AppMessage>(
                    {
                      id: 'switch-disabled-checked',
                      label: 'Disabled (Checked)',
                      isChecked: true,
                      isDisabled: true,
                      onToggle: () => Message.ToggledSwitch({ isChecked: true }),
                    },
                    h,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Sizes']),
          h.div(
            [h.Class('flex flex-col gap-4')],
            [
              h.div(
                [h.Class('flex items-center gap-2')],
                [
                  switch_<AppMessage>(
                    {
                      id: 'switch-size-sm',
                      label: 'Small',
                      isChecked: false,
                      size: 'sm',
                      onToggle: () => Message.ToggledSwitch({ isChecked: false }),
                    },
                    h,
                  ),
                ],
              ),
              h.div(
                [h.Class('flex items-center gap-2')],
                [
                  switch_<AppMessage>(
                    {
                      id: 'switch-size-default',
                      label: 'Default',
                      isChecked: false,
                      size: 'default',
                      onToggle: () => Message.ToggledSwitch({ isChecked: false }),
                    },
                    h,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )

const fields = { isSwitchChecked: S.Boolean }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { isSwitchChecked: false },
  messages: [Message.ToggledSwitch],
  handlers: (model: State) => ({
    ToggledSwitch: ({ isChecked }: typeof Message.ToggledSwitch.Type): UpdateReturn => ({
      model: evo(model, { isSwitchChecked: () => isChecked }),
    }),
  }),
  samples: [Message.ToggledSwitch({ isChecked: true })],
})
