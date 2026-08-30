import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { RadioGroup as FoldkitRadioGroup } from '@foldkit/ui'

import * as radioGroup from '../../generated/registry/ui/radio-group'
import {
  field,
  fieldDescription,
  fieldLabel,
  fieldLegend,
  fieldSet,
} from '../../generated/registry/ui/fieldset'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotRadioGroupMessage: { message: radioGroup.Message },
})

const RadioValue = S.Literals(['default', 'comfortable', 'compact'])
type RadioValue = typeof RadioValue.Type

const RadioDemoGroup = radioGroup.create<RadioValue>()

export const radioGroupView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.submodel({
            slotId: model.radioGroup.id,
            model: model.radioGroup,
            view: RadioDemoGroup.view,
            viewInputs: radioGroup.styledViewInputs<AppMessage, RadioValue>(
              {
                options: ['default', 'comfortable', 'compact'],
                selectedValue: model.maybeRadioValue,
                ariaLabel: 'Density',
                optionLabel: (value) => value.charAt(0).toUpperCase() + value.slice(1),
                groupClass: 'w-fit',
              },
              h,
            ),
            toParentMessage: (message) => Message.GotRadioGroupMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Descriptions']),
          h.div(
            [h.Class('flex flex-col gap-1')],
            [
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>(
                    { for: 'plus-plan' },
                    ['Plus — For individuals and small teams'],
                    h,
                  ),
                  fieldLabel<AppMessage>({ for: 'pro-plan' }, ['Pro — For growing businesses'], h),
                  fieldLabel<AppMessage>(
                    { for: 'enterprise-plan' },
                    ['Enterprise — For large teams'],
                    h,
                  ),
                ],
                h,
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With FieldSet']),
          fieldSet<AppMessage>(
            {},
            [
              fieldLegend<AppMessage>({}, ['Battery Level'], h),
              fieldDescription<AppMessage>({}, ['Choose your preferred battery level.'], h),
              h.div(
                [h.Class('flex flex-col gap-2 text-sm')],
                [
                  h.div(
                    [h.Class('flex items-center gap-2')],
                    [
                      h.input([
                        h.Type('radio'),
                        h.Attribute('name', 'battery-demo'),
                        h.Class('size-4'),
                      ]),
                      h.span([], ['Default']),
                    ],
                  ),
                  h.div(
                    [h.Class('flex items-center gap-2')],
                    [
                      h.input([
                        h.Type('radio'),
                        h.Attribute('name', 'battery-demo'),
                        h.Class('size-4'),
                        h.Attribute('checked', ''),
                      ]),
                      h.span([], ['Comfortable']),
                    ],
                  ),
                  h.div(
                    [h.Class('flex items-center gap-2')],
                    [
                      h.input([
                        h.Type('radio'),
                        h.Attribute('name', 'battery-demo'),
                        h.Class('size-4'),
                      ]),
                      h.span([], ['Compact']),
                    ],
                  ),
                ],
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
            [h.Class('opacity-60')],
            [
              field<AppMessage>(
                { orientation: 'horizontal' },
                [fieldLabel<AppMessage>({ for: 'disabled-1' }, ['Option 1'], h)],
                h,
              ),
              field<AppMessage>(
                { orientation: 'horizontal' },
                [fieldLabel<AppMessage>({ for: 'disabled-2' }, ['Option 2'], h)],
                h,
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Invalid']),
          fieldSet<AppMessage>(
            {},
            [
              fieldLegend<AppMessage>({}, ['Notification Preferences'], h),
              fieldDescription<AppMessage>(
                {},
                ['Choose how you want to receive notifications.'],
                h,
              ),
              field<AppMessage>(
                { orientation: 'horizontal', isInvalid: true },
                [fieldLabel<AppMessage>({ for: 'invalid-email' }, ['Email only'], h)],
                h,
              ),
              field<AppMessage>(
                { orientation: 'horizontal', isInvalid: true },
                [fieldLabel<AppMessage>({ for: 'invalid-sms' }, ['SMS only'], h)],
                h,
              ),
            ],
            h,
          ),
        ],
      ),
    ],
  )

const foldRadioGroupOutMessage = M.type<FoldkitRadioGroup.OutMessage<RadioValue>>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => ({ model: evo(model, { maybeRadioValue: () => Option.some(value) }) }),
  }),
)

const foldRadioGroup = Update.foldChild({
  update: RadioDemoGroup.update,
  read: (model: State) => Option.some(model.radioGroup),
  write: (model, next) => evo(model, { radioGroup: () => next }),
  toParentMessage: (message) => Message.GotRadioGroupMessage({ message }),
  foldOutMessage: foldRadioGroupOutMessage,
})

const fields = { radioGroup: radioGroup.Model, maybeRadioValue: S.Option(RadioValue) }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    radioGroup: radioGroup.init({ id: 'radio-group-demo' }),
    maybeRadioValue: Option.some('comfortable' satisfies RadioValue),
  },
  messages: [Message.GotRadioGroupMessage],
  handlers: (model: State) => ({
    GotRadioGroupMessage: (payload: typeof Message.GotRadioGroupMessage.Type): UpdateReturn =>
      foldRadioGroup(model, payload.message),
  }),
  samples: [],
})
