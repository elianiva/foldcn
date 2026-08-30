import { Subscription, Update } from 'foldkit'
import { Match as M, Option, Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Slider from '../../generated/registry/ui/slider'
import { field, fieldDescription, fieldLabel } from '../../generated/registry/ui/fieldset'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const sliderRange = { min: 0, max: 100, step: 1 } as const

const Message = defineMessageUnion({
  GotSliderBasicMessage: { message: Slider.Message },
  GotSliderRangeMessage: { message: Slider.Message },
  GotSliderVerticalAMessage: { message: Slider.Message },
  GotSliderVerticalBMessage: { message: Slider.Message },
  GotSliderControlledMessage: { message: Slider.Message },
})

type SliderStyledInputs = Parameters<typeof Slider.styledViewInputs>[0]

const sliderSubmodel = (
  model: Slider.Model,
  styledInputs: SliderStyledInputs,
  toParentMessage: (message: Slider.Message) => AppMessage,
  h: HtmlBuilder<AppMessage>,
): Html =>
  h.submodel({
    slotId: model.id,
    model,
    view: Slider.view,
    viewInputs: Slider.styledViewInputs({ ...sliderRange, ...styledInputs }, h),
    toParentMessage,
  })

export const sliderView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.div(
            [h.Class('flex w-full max-w-xs flex-col gap-2')],
            [
              sliderSubmodel(
                model.sliderBasic,
                { value: model.basicValue, ariaLabel: 'Value' },
                (message) => Message.GotSliderBasicMessage({ message }),
                h,
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Range']),
          h.div(
            [h.Class('flex w-full max-w-xs')],
            [
              sliderSubmodel(
                model.sliderRange,
                { value: model.rangeValue, ariaLabel: 'Range' },
                (message) => Message.GotSliderRangeMessage({ message }),
                h,
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Vertical']),
          h.div(
            [h.Class('flex items-center gap-6')],
            [
              sliderSubmodel(
                model.sliderVerticalA,
                {
                  value: model.verticalAValue,
                  orientation: 'vertical',
                  rootClass: 'h-40',
                  ariaLabel: 'Vertical slider A',
                },
                (message) => Message.GotSliderVerticalAMessage({ message }),
                h,
              ),
              sliderSubmodel(
                model.sliderVerticalB,
                {
                  value: model.verticalBValue,
                  orientation: 'vertical',
                  rootClass: 'h-40',
                  ariaLabel: 'Vertical slider B',
                },
                (message) => Message.GotSliderVerticalBMessage({ message }),
                h,
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Controlled']),
          h.div(
            [h.Class('grid w-full max-w-xs gap-3')],
            [
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'slider-demo-temperature' }, ['Temperature'], h),
                  h.div(
                    [h.Class('flex items-center justify-between gap-2')],
                    [
                      h.span(
                        [h.Class('text-sm text-muted-foreground')],
                        [`${String(model.controlledValue)}%`],
                      ),
                    ],
                  ),
                  sliderSubmodel(
                    model.sliderControlled,
                    {
                      value: model.controlledValue,
                      ariaLabelledBy: 'slider-demo-temperature',
                    },
                    (message) => Message.GotSliderControlledMessage({ message }),
                    h,
                  ),
                  fieldDescription<AppMessage>({}, ['Adjust the slider to change the value.'], h),
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Disabled']),
          h.div(
            [h.Class('flex w-full max-w-xs')],
            [
              sliderSubmodel(
                model.sliderDisabled,
                {
                  value: model.disabledValue,
                  isDisabled: true,
                  ariaLabel: 'Disabled slider',
                },
                (message) => Message.GotSliderBasicMessage({ message }),
                h,
              ),
            ],
          ),
        ],
      ),
    ],
  )

const foldOutBasic = M.type<Slider.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    ChangedValue:
      ({ value }) =>
      (model) => [evo(model, { basicValue: () => value }), []],
  }),
)

const foldOutRange = M.type<Slider.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    ChangedValue:
      ({ value }) =>
      (model) => [evo(model, { rangeValue: () => value }), []],
  }),
)

const foldOutVerticalA = M.type<Slider.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    ChangedValue:
      ({ value }) =>
      (model) => [evo(model, { verticalAValue: () => value }), []],
  }),
)

const foldOutVerticalB = M.type<Slider.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    ChangedValue:
      ({ value }) =>
      (model) => [evo(model, { verticalBValue: () => value }), []],
  }),
)

const foldOutControlled = M.type<Slider.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    ChangedValue:
      ({ value }) =>
      (model) => [evo(model, { controlledValue: () => value }), []],
  }),
)

const makeFold = (
  read: (model: State) => Option.Option<Slider.Model>,
  write: (model: State, next: Slider.Model) => State,
  toParentMessage: (message: Slider.Message) => AppMessage,
  foldOutMessage: (out: Slider.OutMessage) => Update.Step<State, unknown>,
) =>
  Update.foldChild({
    update: Slider.update,
    read,
    write,
    toParentMessage,
    foldOutMessage,
  })

const folds = {
  basic: makeFold(
    (model) => Option.some(model.sliderBasic),
    (model, next) => evo(model, { sliderBasic: () => next }),
    (message) => Message.GotSliderBasicMessage({ message }),
    foldOutBasic,
  ),
  range: makeFold(
    (model) => Option.some(model.sliderRange),
    (model, next) => evo(model, { sliderRange: () => next }),
    (message) => Message.GotSliderRangeMessage({ message }),
    foldOutRange,
  ),
  verticalA: makeFold(
    (model) => Option.some(model.sliderVerticalA),
    (model, next) => evo(model, { sliderVerticalA: () => next }),
    (message) => Message.GotSliderVerticalAMessage({ message }),
    foldOutVerticalA,
  ),
  verticalB: makeFold(
    (model) => Option.some(model.sliderVerticalB),
    (model, next) => evo(model, { sliderVerticalB: () => next }),
    (message) => Message.GotSliderVerticalBMessage({ message }),
    foldOutVerticalB,
  ),
  controlled: makeFold(
    (model) => Option.some(model.sliderControlled),
    (model, next) => evo(model, { sliderControlled: () => next }),
    (message) => Message.GotSliderControlledMessage({ message }),
    foldOutControlled,
  ),
}

const fields = {
  sliderBasic: Slider.Model,
  sliderRange: Slider.Model,
  sliderVerticalA: Slider.Model,
  sliderVerticalB: Slider.Model,
  sliderControlled: Slider.Model,
  sliderDisabled: Slider.Model,
  basicValue: S.Number,
  rangeValue: S.Number,
  verticalAValue: S.Number,
  verticalBValue: S.Number,
  controlledValue: S.Number,
  disabledValue: S.Number,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

type SliderMessage =
  | typeof Message.GotSliderBasicMessage.Type
  | typeof Message.GotSliderRangeMessage.Type
  | typeof Message.GotSliderVerticalAMessage.Type
  | typeof Message.GotSliderVerticalBMessage.Type
  | typeof Message.GotSliderControlledMessage.Type

const liftSliderSubscriptions = (
  name: string,
  read: (model: State) => Slider.Model,
  toParentMessage: (message: Slider.Message) => SliderMessage,
) => {
  const lifted = Subscription.lift({
    dragPointer: Slider.subscriptions.dragPointer,
    dragEscape: Slider.subscriptions.dragEscape,
  })<State, SliderMessage>({
    toChildModel: read,
    toParentMessage,
  })
  return {
    [`${name}DragPointer`]: lifted.dragPointer,
    [`${name}DragEscape`]: lifted.dragEscape,
  }
}

const sliderSubscriptions = Subscription.aggregate<State, SliderMessage>()(
  liftSliderSubscriptions(
    'basic',
    (model) => model.sliderBasic,
    (message) => Message.GotSliderBasicMessage({ message }),
  ),
  liftSliderSubscriptions(
    'range',
    (model) => model.sliderRange,
    (message) => Message.GotSliderRangeMessage({ message }),
  ),
  liftSliderSubscriptions(
    'verticalA',
    (model) => model.sliderVerticalA,
    (message) => Message.GotSliderVerticalAMessage({ message }),
  ),
  liftSliderSubscriptions(
    'verticalB',
    (model) => model.sliderVerticalB,
    (message) => Message.GotSliderVerticalBMessage({ message }),
  ),
  liftSliderSubscriptions(
    'controlled',
    (model) => model.sliderControlled,
    (message) => Message.GotSliderControlledMessage({ message }),
  ),
)

export { sliderSubscriptions as subscriptions }

export const slice = defineSlice({
  fields,
  init: {
    sliderBasic: Slider.init({ id: 'slider-basic', ...sliderRange }),
    sliderRange: Slider.init({ id: 'slider-range', ...sliderRange }),
    sliderVerticalA: Slider.init({ id: 'slider-vertical-a', ...sliderRange }),
    sliderVerticalB: Slider.init({ id: 'slider-vertical-b', ...sliderRange }),
    sliderControlled: Slider.init({ id: 'slider-controlled', ...sliderRange }),
    sliderDisabled: Slider.init({ id: 'slider-disabled', ...sliderRange }),
    basicValue: 50,
    rangeValue: 50,
    verticalAValue: 50,
    verticalBValue: 25,
    controlledValue: 50,
    disabledValue: 50,
  },
  messages: [
    Message.GotSliderBasicMessage,
    Message.GotSliderRangeMessage,
    Message.GotSliderVerticalAMessage,
    Message.GotSliderVerticalBMessage,
    Message.GotSliderControlledMessage,
  ],
  handlers: (model: State) => ({
    GotSliderBasicMessage: (payload: typeof Message.GotSliderBasicMessage.Type): UpdateReturn =>
      folds.basic(model, payload.message),
    GotSliderRangeMessage: (payload: typeof Message.GotSliderRangeMessage.Type): UpdateReturn =>
      folds.range(model, payload.message),
    GotSliderVerticalAMessage: (
      payload: typeof Message.GotSliderVerticalAMessage.Type,
    ): UpdateReturn => folds.verticalA(model, payload.message),
    GotSliderVerticalBMessage: (
      payload: typeof Message.GotSliderVerticalBMessage.Type,
    ): UpdateReturn => folds.verticalB(model, payload.message),
    GotSliderControlledMessage: (
      payload: typeof Message.GotSliderControlledMessage.Type,
    ): UpdateReturn => folds.controlled(model, payload.message),
  }),
  samples: [
    Message.GotSliderBasicMessage({
      message: Slider.Message.PressedKeyboardNavigation({
        direction: 'StepIncrement',
        value: 50,
      }),
    }),
  ],
  subscriptions: sliderSubscriptions,
})
