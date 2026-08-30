import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { checkbox } from '../../generated/registry/ui/checkbox'
import {
  field,
  fieldContent,
  fieldDescription,
  fieldGroup,
  fieldLabel,
  fieldTitle,
} from '../../generated/registry/ui/fieldset'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  ToggledCheckbox: { isChecked: S.Boolean },
  ToggledCheckboxWithDescription: { isChecked: S.Boolean },
  ToggledCheckboxNotifications: { isChecked: S.Boolean },
})

export const checkboxView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
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
              checkbox<AppMessage>(
                {
                  id: 'terms',
                  label: 'Accept terms and conditions',
                  isChecked: model.isCheckboxChecked,
                  onToggle: (isChecked) => Message.ToggledCheckbox({ isChecked }),
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Description']),
          field<AppMessage>(
            { orientation: 'horizontal' },
            [
              checkbox<AppMessage>(
                {
                  id: 'terms-2',
                  label: 'Accept terms and conditions',
                  description: 'By clicking this checkbox, you agree to the terms and conditions.',
                  isChecked: model.isCheckboxWithDescriptionChecked,
                  onToggle: (isChecked) => Message.ToggledCheckboxWithDescription({ isChecked }),
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Invalid']),
          field<AppMessage>(
            { orientation: 'horizontal', isInvalid: true },
            [
              checkbox<AppMessage>(
                {
                  id: 'terms-3',
                  label: 'Accept terms and conditions',
                  isChecked: false,
                  onToggle: () => Message.ToggledCheckbox({ isChecked: false }),
                  className: 'aria-invalid:border-destructive',
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Disabled']),
          field<AppMessage>(
            { orientation: 'horizontal' },
            [
              checkbox<AppMessage>(
                {
                  id: 'toggle-disabled',
                  label: 'Enable notifications',
                  isChecked: false,
                  isDisabled: true,
                  onToggle: () => Message.ToggledCheckbox({ isChecked: false }),
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Title']),
          fieldGroup<AppMessage>(
            {},
            [
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>(
                    { for: 'toggle-2' },
                    [
                      field<AppMessage>(
                        { orientation: 'horizontal' },
                        [
                          checkbox<AppMessage>(
                            {
                              id: 'toggle-2',
                              label: '',
                              isChecked: model.isCheckboxNotificationsChecked,
                              onToggle: (isChecked) =>
                                Message.ToggledCheckboxNotifications({ isChecked }),
                            },
                            h,
                          ),
                          fieldContent<AppMessage>(
                            {},
                            [
                              fieldTitle<AppMessage>({}, ['Enable notifications'], h),
                              fieldDescription<AppMessage>(
                                {},
                                ['You can enable or disable notifications at any time.'],
                                h,
                              ),
                            ],
                            h,
                          ),
                        ],
                        h,
                      ),
                    ],
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Group']),
          field<AppMessage>(
            {},
            [
              fieldLabel<AppMessage>({}, ['Show these items on the desktop:'], h),
              field<AppMessage>(
                { orientation: 'horizontal' },
                [
                  checkbox<AppMessage>(
                    {
                      id: 'finder-pref-hard',
                      label: 'Hard disks',
                      isChecked: false,
                      onToggle: () => Message.ToggledCheckbox({ isChecked: false }),
                    },
                    h,
                  ),
                ],
                h,
              ),
              field<AppMessage>(
                { orientation: 'horizontal' },
                [
                  checkbox<AppMessage>(
                    {
                      id: 'finder-pref-external',
                      label: 'External disks',
                      isChecked: false,
                      onToggle: () => Message.ToggledCheckbox({ isChecked: false }),
                    },
                    h,
                  ),
                ],
                h,
              ),
              field<AppMessage>(
                { orientation: 'horizontal' },
                [
                  checkbox<AppMessage>(
                    {
                      id: 'finder-pref-cds',
                      label: 'CDs, DVDs, and iPods',
                      isChecked: false,
                      onToggle: () => Message.ToggledCheckbox({ isChecked: false }),
                    },
                    h,
                  ),
                ],
                h,
              ),
              field<AppMessage>(
                { orientation: 'horizontal' },
                [
                  checkbox<AppMessage>(
                    {
                      id: 'finder-pref-servers',
                      label: 'Connected servers',
                      isChecked: false,
                      onToggle: () => Message.ToggledCheckbox({ isChecked: false }),
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
    ],
  )

const fields = {
  isCheckboxChecked: S.Boolean,
  isCheckboxWithDescriptionChecked: S.Boolean,
  isCheckboxNotificationsChecked: S.Boolean,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    isCheckboxChecked: false,
    isCheckboxWithDescriptionChecked: true,
    isCheckboxNotificationsChecked: false,
  },
  messages: [
    Message.ToggledCheckbox,
    Message.ToggledCheckboxWithDescription,
    Message.ToggledCheckboxNotifications,
  ],
  handlers: (model: State) => ({
    ToggledCheckbox: ({ isChecked }: typeof Message.ToggledCheckbox.Type): UpdateReturn => ({
      model: evo(model, { isCheckboxChecked: () => isChecked }),
    }),
    ToggledCheckboxWithDescription: ({
      isChecked,
    }: typeof Message.ToggledCheckboxWithDescription.Type): UpdateReturn => ({
      model: evo(model, { isCheckboxWithDescriptionChecked: () => isChecked }),
    }),
    ToggledCheckboxNotifications: ({
      isChecked,
    }: typeof Message.ToggledCheckboxNotifications.Type): UpdateReturn => ({
      model: evo(model, { isCheckboxNotificationsChecked: () => isChecked }),
    }),
  }),
  samples: [Message.ToggledCheckbox({ isChecked: true })],
})
