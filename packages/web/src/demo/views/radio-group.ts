import { Update } from 'foldkit'
import { Option, Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as radioGroup from '../../generated/registry/ui/radio-group'
import { fieldDescription, fieldLegend, fieldSet } from '../../generated/registry/ui/fieldset'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotRadioGroupMessage: { message: radioGroup.Message },
  GotRadioDescriptionMessage: { message: radioGroup.Message },
  GotRadioChoiceCardMessage: { message: radioGroup.Message },
  GotRadioFieldsetMessage: { message: radioGroup.Message },
  GotRadioDisabledMessage: { message: radioGroup.Message },
  GotRadioInvalidMessage: { message: radioGroup.Message },
  GotRadioRtlMessage: { message: radioGroup.Message },
})

const DensityValue = S.Literals(['default', 'comfortable', 'compact'])
type DensityValue = typeof DensityValue.Type
const DensityGroup = radioGroup.create<DensityValue>()
const densityLabels = {
  default: 'Default',
  comfortable: 'Comfortable',
  compact: 'Compact',
} as const
const densityDescriptions = {
  default: 'Standard spacing for most use cases.',
  comfortable: 'More space between elements.',
  compact: 'Minimal spacing for dense layouts.',
} as const

const PlanValue = S.Literals(['plus', 'pro', 'enterprise'])
type PlanValue = typeof PlanValue.Type
const PlanGroup = radioGroup.create<PlanValue>()
const plans = {
  plus: { label: 'Plus', description: 'For individuals and small teams.' },
  pro: { label: 'Pro', description: 'For growing businesses.' },
  enterprise: { label: 'Enterprise', description: 'For large teams and enterprises.' },
} as const

const SubscriptionValue = S.Literals(['monthly', 'yearly', 'lifetime'])
type SubscriptionValue = typeof SubscriptionValue.Type
const SubscriptionGroup = radioGroup.create<SubscriptionValue>()
const subscriptionLabels = {
  monthly: 'Monthly ($9.99/month)',
  yearly: 'Yearly ($99.99/year)',
  lifetime: 'Lifetime ($299.99)',
} as const

const DisabledValue = S.Literals(['option1', 'option2', 'option3'])
type DisabledValue = typeof DisabledValue.Type
const DisabledGroup = radioGroup.create<DisabledValue>()
const disabledLabels = {
  option1: 'Disabled',
  option2: 'Option 2',
  option3: 'Option 3',
} as const

const NotificationValue = S.Literals(['email', 'sms', 'both'])
type NotificationValue = typeof NotificationValue.Type
const NotificationGroup = radioGroup.create<NotificationValue>()
const notificationLabels = {
  email: 'Email only',
  sms: 'SMS only',
  both: 'Both Email & SMS',
} as const

const rtlLabels = {
  default: 'افتراضي',
  comfortable: 'مريح',
  compact: 'مضغوط',
} as const
const rtlDescriptions = {
  default: 'تباعد قياسي لمعظم حالات الاستخدام.',
  comfortable: 'مساحة أكبر بين العناصر.',
  compact: 'تباعد أدنى للتخطيطات الكثيفة.',
} as const

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
            view: DensityGroup.view,
            viewInputs: radioGroup.styledViewInputs<AppMessage, DensityValue>(
              {
                options: DensityValue.literals,
                selectedValue: model.maybeRadioValue,
                ariaLabel: 'Density',
                optionLabel: (value) => densityLabels[value],
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Description']),
          h.submodel({
            slotId: model.radioDescription.id,
            model: model.radioDescription,
            view: DensityGroup.view,
            viewInputs: radioGroup.styledViewInputs<AppMessage, DensityValue>(
              {
                options: DensityValue.literals,
                selectedValue: model.maybeRadioDescription,
                ariaLabel: 'Density with descriptions',
                optionLabel: (value) => densityLabels[value],
                optionDescription: (value) => densityDescriptions[value],
                optionLayout: 'field',
                groupClass: 'w-fit',
              },
              h,
            ),
            toParentMessage: (message) => Message.GotRadioDescriptionMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Choice Card']),
          h.submodel({
            slotId: model.radioChoiceCard.id,
            model: model.radioChoiceCard,
            view: PlanGroup.view,
            viewInputs: radioGroup.styledViewInputs<AppMessage, PlanValue>(
              {
                options: PlanValue.literals,
                selectedValue: model.maybeRadioPlan,
                ariaLabel: 'Subscription plan choice card',
                optionLabel: (value) => plans[value].label,
                optionDescription: (value) => plans[value].description,
                optionLayout: 'choice-card',
                groupClass: 'max-w-sm',
              },
              h,
            ),
            toParentMessage: (message) => Message.GotRadioChoiceCardMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Fieldset']),
          fieldSet<AppMessage>(
            { className: 'w-full max-w-xs' },
            [
              fieldLegend<AppMessage>({ variant: 'label' }, ['Subscription Plan'], h),
              fieldDescription<AppMessage>(
                {},
                ['Yearly and lifetime plans offer significant savings.'],
                h,
              ),
              h.submodel({
                slotId: model.radioFieldset.id,
                model: model.radioFieldset,
                view: SubscriptionGroup.view,
                viewInputs: radioGroup.styledViewInputs<AppMessage, SubscriptionValue>(
                  {
                    options: SubscriptionValue.literals,
                    selectedValue: model.maybeRadioSubscription,
                    ariaLabel: 'Subscription Plan',
                    name: 'subscription-plan',
                    optionLabel: (value) => subscriptionLabels[value],
                    optionLayout: 'field',
                  },
                  h,
                ),
                toParentMessage: (message) => Message.GotRadioFieldsetMessage({ message }),
              }),
            ],
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Disabled']),
          h.submodel({
            slotId: model.radioDisabled.id,
            model: model.radioDisabled,
            view: DisabledGroup.view,
            viewInputs: radioGroup.styledViewInputs<AppMessage, DisabledValue>(
              {
                options: DisabledValue.literals,
                selectedValue: model.maybeRadioDisabled,
                ariaLabel: 'Disabled example',
                isOptionDisabled: (value) => value === 'option1',
                optionLabel: (value) => disabledLabels[value],
                optionLayout: 'field',
                groupClass: 'w-fit',
              },
              h,
            ),
            toParentMessage: (message) => Message.GotRadioDisabledMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Invalid']),
          fieldSet<AppMessage>(
            { className: 'w-full max-w-xs' },
            [
              fieldLegend<AppMessage>({ variant: 'label' }, ['Notification Preferences'], h),
              fieldDescription<AppMessage>(
                {},
                ['Choose how you want to receive notifications.'],
                h,
              ),
              h.submodel({
                slotId: model.radioInvalid.id,
                model: model.radioInvalid,
                view: NotificationGroup.view,
                viewInputs: radioGroup.styledViewInputs<AppMessage, NotificationValue>(
                  {
                    options: NotificationValue.literals,
                    selectedValue: model.maybeRadioNotification,
                    ariaLabel: 'Notification Preferences',
                    name: 'notification-preferences',
                    isInvalid: true,
                    optionLabel: (value) => notificationLabels[value],
                    optionLayout: 'field',
                  },
                  h,
                ),
                toParentMessage: (message) => Message.GotRadioInvalidMessage({ message }),
              }),
            ],
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['RTL']),
          h.div(
            [h.Dir('rtl')],
            [
              h.submodel({
                slotId: model.radioRtl.id,
                model: model.radioRtl,
                view: DensityGroup.view,
                viewInputs: radioGroup.styledViewInputs<AppMessage, DensityValue>(
                  {
                    options: DensityValue.literals,
                    selectedValue: model.maybeRadioRtl,
                    ariaLabel: 'الكثافة',
                    optionLabel: (value) => rtlLabels[value],
                    optionDescription: (value) => rtlDescriptions[value],
                    optionLayout: 'field',
                    groupClass: 'w-fit',
                  },
                  h,
                ),
                toParentMessage: (message) => Message.GotRadioRtlMessage({ message }),
              }),
            ],
          ),
        ],
      ),
    ],
  )

const foldRadioGroup = Update.foldChild({
  update: DensityGroup.update,
  read: (model: State) => Option.some(model.radioGroup),
  write: (model, next) => evo(model, { radioGroup: () => next }),
  toParentMessage: (message) => Message.GotRadioGroupMessage({ message }),
  foldOutMessage: (outMessage) => (model: State) => ({
    model: evo(model, { maybeRadioValue: () => Option.some(outMessage.value) }),
  }),
})

const foldRadioDescription = Update.foldChild({
  update: DensityGroup.update,
  read: (model: State) => Option.some(model.radioDescription),
  write: (model, next) => evo(model, { radioDescription: () => next }),
  toParentMessage: (message) => Message.GotRadioDescriptionMessage({ message }),
  foldOutMessage: (outMessage) => (model: State) => ({
    model: evo(model, { maybeRadioDescription: () => Option.some(outMessage.value) }),
  }),
})

const foldRadioChoiceCard = Update.foldChild({
  update: PlanGroup.update,
  read: (model: State) => Option.some(model.radioChoiceCard),
  write: (model, next) => evo(model, { radioChoiceCard: () => next }),
  toParentMessage: (message) => Message.GotRadioChoiceCardMessage({ message }),
  foldOutMessage: (outMessage) => (model: State) => ({
    model: evo(model, { maybeRadioPlan: () => Option.some(outMessage.value) }),
  }),
})

const foldRadioFieldset = Update.foldChild({
  update: SubscriptionGroup.update,
  read: (model: State) => Option.some(model.radioFieldset),
  write: (model, next) => evo(model, { radioFieldset: () => next }),
  toParentMessage: (message) => Message.GotRadioFieldsetMessage({ message }),
  foldOutMessage: (outMessage) => (model: State) => ({
    model: evo(model, { maybeRadioSubscription: () => Option.some(outMessage.value) }),
  }),
})

const foldRadioDisabled = Update.foldChild({
  update: DisabledGroup.update,
  read: (model: State) => Option.some(model.radioDisabled),
  write: (model, next) => evo(model, { radioDisabled: () => next }),
  toParentMessage: (message) => Message.GotRadioDisabledMessage({ message }),
  foldOutMessage: (outMessage) => (model: State) => ({
    model: evo(model, { maybeRadioDisabled: () => Option.some(outMessage.value) }),
  }),
})

const foldRadioInvalid = Update.foldChild({
  update: NotificationGroup.update,
  read: (model: State) => Option.some(model.radioInvalid),
  write: (model, next) => evo(model, { radioInvalid: () => next }),
  toParentMessage: (message) => Message.GotRadioInvalidMessage({ message }),
  foldOutMessage: (outMessage) => (model: State) => ({
    model: evo(model, { maybeRadioNotification: () => Option.some(outMessage.value) }),
  }),
})

const foldRadioRtl = Update.foldChild({
  update: DensityGroup.update,
  read: (model: State) => Option.some(model.radioRtl),
  write: (model, next) => evo(model, { radioRtl: () => next }),
  toParentMessage: (message) => Message.GotRadioRtlMessage({ message }),
  foldOutMessage: (outMessage) => (model: State) => ({
    model: evo(model, { maybeRadioRtl: () => Option.some(outMessage.value) }),
  }),
})

const fields = {
  radioGroup: radioGroup.Model,
  maybeRadioValue: S.Option(DensityValue),
  radioDescription: radioGroup.Model,
  maybeRadioDescription: S.Option(DensityValue),
  radioChoiceCard: radioGroup.Model,
  maybeRadioPlan: S.Option(PlanValue),
  radioFieldset: radioGroup.Model,
  maybeRadioSubscription: S.Option(SubscriptionValue),
  radioDisabled: radioGroup.Model,
  maybeRadioDisabled: S.Option(DisabledValue),
  radioInvalid: radioGroup.Model,
  maybeRadioNotification: S.Option(NotificationValue),
  radioRtl: radioGroup.Model,
  maybeRadioRtl: S.Option(DensityValue),
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    radioGroup: radioGroup.init({ id: 'radio-group-demo' }),
    maybeRadioValue: Option.some('comfortable' satisfies DensityValue),
    radioDescription: radioGroup.init({ id: 'radio-description-demo' }),
    maybeRadioDescription: Option.some('comfortable' satisfies DensityValue),
    radioChoiceCard: radioGroup.init({ id: 'radio-choice-card-demo' }),
    maybeRadioPlan: Option.some('plus' satisfies PlanValue),
    radioFieldset: radioGroup.init({ id: 'radio-fieldset-demo' }),
    maybeRadioSubscription: Option.some('monthly' satisfies SubscriptionValue),
    radioDisabled: radioGroup.init({ id: 'radio-disabled-demo' }),
    maybeRadioDisabled: Option.some('option2' satisfies DisabledValue),
    radioInvalid: radioGroup.init({ id: 'radio-invalid-demo' }),
    maybeRadioNotification: Option.some('email' satisfies NotificationValue),
    radioRtl: radioGroup.init({ id: 'radio-rtl-demo' }),
    maybeRadioRtl: Option.some('comfortable' satisfies DensityValue),
  },
  messages: [
    Message.GotRadioGroupMessage,
    Message.GotRadioDescriptionMessage,
    Message.GotRadioChoiceCardMessage,
    Message.GotRadioFieldsetMessage,
    Message.GotRadioDisabledMessage,
    Message.GotRadioInvalidMessage,
    Message.GotRadioRtlMessage,
  ],
  handlers: (model: State) => ({
    GotRadioGroupMessage: (payload: typeof Message.GotRadioGroupMessage.Type): UpdateReturn =>
      foldRadioGroup(model, payload.message),
    GotRadioDescriptionMessage: (
      payload: typeof Message.GotRadioDescriptionMessage.Type,
    ): UpdateReturn => foldRadioDescription(model, payload.message),
    GotRadioChoiceCardMessage: (
      payload: typeof Message.GotRadioChoiceCardMessage.Type,
    ): UpdateReturn => foldRadioChoiceCard(model, payload.message),
    GotRadioFieldsetMessage: (payload: typeof Message.GotRadioFieldsetMessage.Type): UpdateReturn =>
      foldRadioFieldset(model, payload.message),
    GotRadioDisabledMessage: (payload: typeof Message.GotRadioDisabledMessage.Type): UpdateReturn =>
      foldRadioDisabled(model, payload.message),
    GotRadioInvalidMessage: (payload: typeof Message.GotRadioInvalidMessage.Type): UpdateReturn =>
      foldRadioInvalid(model, payload.message),
    GotRadioRtlMessage: (payload: typeof Message.GotRadioRtlMessage.Type): UpdateReturn =>
      foldRadioRtl(model, payload.message),
  }),
  samples: [],
})
