import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as accordion from '../../generated/registry/ui/accordion'
import { Card } from '../../generated/registry/ui/card'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotAccordionBasicMessage: { message: accordion.Message },
  GotAccordionMultipleMessage: { message: accordion.Message },
  GotAccordionBordersMessage: { message: accordion.Message },
  GotAccordionInCardMessage: { message: accordion.Message },
  GotAccordionDisabledMessage: { message: accordion.Message },
})

const BASIC_ITEMS = [
  {
    id: 'acc-basic-1',
    title: 'Is it accessible?',
    content: 'Yes. It adheres to the WAI-ARIA design pattern.',
  },
  {
    id: 'acc-basic-2',
    title: 'Is it styled?',
    content: "Yes. It comes with default styles that matches the other components' aesthetic.",
  },
  {
    id: 'acc-basic-3',
    title: 'Is it animated?',
    content: "Yes. It's animated by default, but you can disable it if you prefer.",
  },
] as const

const MULTIPLE_ITEMS = [
  {
    id: 'acc-multi-1',
    title:
      'What are the key considerations when implementing a comprehensive enterprise-level authentication system?',
    content:
      'Implementing a robust enterprise authentication system requires careful consideration of multiple factors. This includes secure password hashing and storage, multi-factor authentication (MFA) implementation, session management, OAuth2 and SSO integration, regular security audits, rate limiting to prevent brute force attacks, and maintaining detailed audit logs.',
  },
  {
    id: 'acc-multi-2',
    title:
      'How does modern distributed system architecture handle eventual consistency and data synchronization across multiple regions?',
    content:
      'Modern distributed systems employ various strategies to maintain data consistency across regions. This often involves using techniques like CRDT (Conflict-Free Replicated Data Types), vector clocks, and gossip protocols.',
  },
] as const

const BORDERS_ITEMS = [
  {
    id: 'acc-borders-billing',
    title: 'How does billing work?',
    content:
      'We offer monthly and annual subscription plans. Billing is charged at the beginning of each cycle, and you can cancel anytime.',
  },
  {
    id: 'acc-borders-security',
    title: 'Is my data secure?',
    content:
      'Yes. We use end-to-end encryption, SOC 2 Type II compliance, and regular third-party security audits.',
  },
  {
    id: 'acc-borders-integration',
    title: 'What integrations do you support?',
    content:
      'We integrate with 500+ popular tools including Slack, Zapier, Salesforce, HubSpot, and more.',
  },
] as const

const IN_CARD_ITEMS = [
  {
    id: 'acc-card-plans',
    title: 'What subscription plans do you offer?',
    content:
      'We offer three subscription tiers: Starter ($9/month), Professional ($29/month), and Enterprise ($99/month).',
  },
  {
    id: 'acc-card-billing',
    title: 'How does billing work?',
    content:
      'Billing occurs automatically at the start of each billing cycle. We accept all major credit cards, PayPal, and ACH transfers.',
  },
  {
    id: 'acc-card-upgrade',
    title: 'Can I upgrade or downgrade my plan?',
    content:
      'Yes, you can change your plan at any time. When upgrading, you will be charged a prorated amount.',
  },
] as const

const DISABLED_ITEMS = [
  {
    id: 'acc-dis-1',
    title: 'Can I access my account history?',
    content: 'Yes, you can view your complete account history including all transactions.',
    isDisabled: false,
  },
  {
    id: 'acc-dis-2',
    title: 'Premium feature information',
    content:
      'This section contains information about premium features. Upgrade your plan to access this content.',
    isDisabled: true,
  },
  {
    id: 'acc-dis-3',
    title: 'How do I update my email address?',
    content:
      "You can update your email address in your account settings. You'll receive a verification email.",
    isDisabled: false,
  },
] as const

export const accordionView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.submodel({
            slotId: model.accordionBasic.id,
            model: model.accordionBasic,
            view: accordion.view,
            viewInputs: { className: 'mx-auto max-w-lg', items: [...BASIC_ITEMS] },
            toParentMessage: (message) => Message.GotAccordionBasicMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Multiple']),
          h.submodel({
            slotId: model.accordionMultiple.id,
            model: model.accordionMultiple,
            view: accordion.view,
            viewInputs: { className: 'mx-auto max-w-lg', items: [...MULTIPLE_ITEMS] },
            toParentMessage: (message) => Message.GotAccordionMultipleMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Borders']),
          h.submodel({
            slotId: model.accordionBorders.id,
            model: model.accordionBorders,
            view: accordion.view,
            viewInputs: {
              className: 'mx-auto max-w-lg',
              items: BORDERS_ITEMS.map((it) => ({
                id: it.id,
                title: it.title,
                content: it.content,
              })),
            },
            toParentMessage: (message) => Message.GotAccordionBordersMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['In Card']),
          Card<AppMessage>(
            { className: 'mx-auto w-full max-w-lg gap-4' },
            [
              Card.header<AppMessage>(
                {},
                [
                  Card.title<AppMessage>({}, ['Subscription & Billing'], h),
                  Card.description<AppMessage>(
                    {},
                    ['Common questions about your account, plans, and payments'],
                    h,
                  ),
                ],
                h,
              ),
              Card.content<AppMessage>(
                {},
                [
                  h.submodel({
                    slotId: model.accordionInCard.id,
                    model: model.accordionInCard,
                    view: accordion.view,
                    viewInputs: { items: [...IN_CARD_ITEMS] },
                    toParentMessage: (message) => Message.GotAccordionInCardMessage({ message }),
                  }),
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Disabled']),
          h.submodel({
            slotId: model.accordionDisabled.id,
            model: model.accordionDisabled,
            view: accordion.view,
            viewInputs: {
              className: 'mx-auto max-w-lg overflow-hidden border',
              items: DISABLED_ITEMS.map((it) => ({
                id: it.id,
                title: it.title,
                content: it.content,
                isDisabled: it.isDisabled,
              })),
            },
            toParentMessage: (message) => Message.GotAccordionDisabledMessage({ message }),
          }),
        ],
      ),
    ],
  )

const foldNoOp =
  <Out>(): ((out: Out) => Update.Step<State, unknown>) =>
  () =>
  (model) => ({ model })

const foldOut = M.type<accordion.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({ ChangedValue: foldNoOp() }),
)

const makeFold = (
  read: (m: State) => Option.Option<accordion.Model>,
  write: (m: State, n: accordion.Model) => State,
  toParent: (m: accordion.Message) => AppMessage,
) =>
  Update.foldChild({
    update: accordion.update,
    read: (model: State): Option.Option<accordion.Model> => read(model),
    write,
    toParentMessage: toParent,
    foldOutMessage: foldOut,
  })

const folds = {
  basic: makeFold(
    (m) => Option.some(m.accordionBasic),
    (m, n) => evo(m, { accordionBasic: () => n }),
    (msg) => Message.GotAccordionBasicMessage({ message: msg }),
  ),
  multiple: makeFold(
    (m) => Option.some(m.accordionMultiple),
    (m, n) => evo(m, { accordionMultiple: () => n }),
    (msg) => Message.GotAccordionMultipleMessage({ message: msg }),
  ),
  borders: makeFold(
    (m) => Option.some(m.accordionBorders),
    (m, n) => evo(m, { accordionBorders: () => n }),
    (msg) => Message.GotAccordionBordersMessage({ message: msg }),
  ),
  inCard: makeFold(
    (m) => Option.some(m.accordionInCard),
    (m, n) => evo(m, { accordionInCard: () => n }),
    (msg) => Message.GotAccordionInCardMessage({ message: msg }),
  ),
  disabled: makeFold(
    (m) => Option.some(m.accordionDisabled),
    (m, n) => evo(m, { accordionDisabled: () => n }),
    (msg) => Message.GotAccordionDisabledMessage({ message: msg }),
  ),
}

const fields = {
  accordionBasic: accordion.Model,
  accordionMultiple: accordion.Model,
  accordionBorders: accordion.Model,
  accordionInCard: accordion.Model,
  accordionDisabled: accordion.Model,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    accordionBasic: accordion.init({
      id: 'accordion-basic',
      type: 'single',
      value: [false, false, false],
    }),
    accordionMultiple: accordion.init({
      id: 'accordion-multiple',
      type: 'multiple',
      value: [false, false],
    }),
    accordionBorders: accordion.init({
      id: 'accordion-borders',
      type: 'single',
      value: [true, false, false],
    }),
    accordionInCard: accordion.init({
      id: 'accordion-incard',
      type: 'multiple',
      value: [true, false, false],
    }),
    accordionDisabled: accordion.init({
      id: 'accordion-disabled',
      type: 'single',
      value: [false, false, false],
    }),
  },
  messages: [
    Message.GotAccordionBasicMessage,
    Message.GotAccordionMultipleMessage,
    Message.GotAccordionBordersMessage,
    Message.GotAccordionInCardMessage,
    Message.GotAccordionDisabledMessage,
  ],
  handlers: (model: State) => ({
    GotAccordionBasicMessage: (p: typeof Message.GotAccordionBasicMessage.Type): UpdateReturn =>
      folds.basic(model, p.message),
    GotAccordionMultipleMessage: (
      p: typeof Message.GotAccordionMultipleMessage.Type,
    ): UpdateReturn => folds.multiple(model, p.message),
    GotAccordionBordersMessage: (p: typeof Message.GotAccordionBordersMessage.Type): UpdateReturn =>
      folds.borders(model, p.message),
    GotAccordionInCardMessage: (p: typeof Message.GotAccordionInCardMessage.Type): UpdateReturn =>
      folds.inCard(model, p.message),
    GotAccordionDisabledMessage: (
      p: typeof Message.GotAccordionDisabledMessage.Type,
    ): UpdateReturn => folds.disabled(model, p.message),
  }),
  samples: [],
})
