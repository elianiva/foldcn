import { Subscription, Update } from 'foldkit'
import { Match as M, Option, Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { Slider as FoldkitSlider } from '@foldkit/ui'

import * as Slider from '../../generated/registry/ui/slider'
import { field, fieldDescription, fieldLabel } from '../../generated/registry/ui/fieldset'
import {
  sliderFilledTrackClass,
  sliderRootClass,
  sliderThumbClass,
  sliderTrackClass,
} from '../../generated/registry/ui/slider'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotSliderMessage: { message: Slider.Message },
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
              h.submodel({
                slotId: model.sliderDemo.id,
                model: model.sliderDemo,
                view: Slider.view,
                viewInputs: Slider.styledViewInputs(
                  {
                    value: model.sliderValue,
                    ariaLabel: 'Value',
                  },
                  h,
                ),
                toParentMessage: (message) => Message.GotSliderMessage({ message }),
              }),
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
              h.div(
                [h.Class(sliderRootClass), h.DataAttribute('slot', 'slider')],
                [
                  h.div(
                    [h.Class(sliderTrackClass), h.DataAttribute('slot', 'slider-track')],
                    [
                      h.div([
                        h.Class(sliderFilledTrackClass),
                        h.DataAttribute('slot', 'slider-range'),
                        h.Style({ width: '50%' }),
                      ]),
                    ],
                  ),
                  h.div([
                    h.Class(sliderThumbClass),
                    h.DataAttribute('slot', 'slider-thumb'),
                    h.Style({ left: '50%' }),
                  ]),
                ],
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
              h.div(
                [
                  h.Class(`${sliderRootClass} h-40`),
                  h.DataAttribute('slot', 'slider'),
                  h.DataAttribute('orientation', 'vertical'),
                  h.DataAttribute('vertical', ''),
                ],
                [
                  h.div(
                    [
                      h.Class(sliderTrackClass),
                      h.DataAttribute('slot', 'slider-track'),
                      h.DataAttribute('orientation', 'vertical'),
                      h.DataAttribute('vertical', ''),
                    ],
                    [
                      h.div([
                        h.Class(sliderFilledTrackClass),
                        h.DataAttribute('slot', 'slider-range'),
                        h.DataAttribute('orientation', 'vertical'),
                        h.DataAttribute('vertical', ''),
                        h.Style({ height: '50%' }),
                      ]),
                    ],
                  ),
                  h.div([h.Class(sliderThumbClass), h.DataAttribute('slot', 'slider-thumb')]),
                ],
              ),
              h.div(
                [
                  h.Class(`${sliderRootClass} h-40`),
                  h.DataAttribute('slot', 'slider'),
                  h.DataAttribute('orientation', 'vertical'),
                  h.DataAttribute('vertical', ''),
                ],
                [
                  h.div(
                    [
                      h.Class(sliderTrackClass),
                      h.DataAttribute('slot', 'slider-track'),
                      h.DataAttribute('orientation', 'vertical'),
                      h.DataAttribute('vertical', ''),
                    ],
                    [
                      h.div([
                        h.Class(sliderFilledTrackClass),
                        h.DataAttribute('slot', 'slider-range'),
                        h.DataAttribute('orientation', 'vertical'),
                        h.DataAttribute('vertical', ''),
                        h.Style({ height: '25%' }),
                      ]),
                    ],
                  ),
                  h.div([h.Class(sliderThumbClass), h.DataAttribute('slot', 'slider-thumb')]),
                ],
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
                        [`${String(model.sliderValue)}%`],
                      ),
                    ],
                  ),
                  h.div(
                    [h.Class(sliderRootClass), h.DataAttribute('slot', 'slider')],
                    [
                      h.div(
                        [h.Class(sliderTrackClass), h.DataAttribute('slot', 'slider-track')],
                        [
                          h.div([
                            h.Class(sliderFilledTrackClass),
                            h.DataAttribute('slot', 'slider-range'),
                            h.Style({ width: `${String(model.sliderValue)}%` }),
                          ]),
                        ],
                      ),
                      h.div([
                        h.Class(sliderThumbClass),
                        h.DataAttribute('slot', 'slider-thumb'),
                        h.Style({ left: `${String(model.sliderValue)}%` }),
                      ]),
                    ],
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
            [h.Class('flex w-full max-w-xs opacity-60')],
            [
              h.div(
                [
                  h.Class(sliderRootClass),
                  h.DataAttribute('slot', 'slider'),
                  h.DataAttribute('disabled', ''),
                ],
                [
                  h.div(
                    [h.Class(sliderTrackClass), h.DataAttribute('slot', 'slider-track')],
                    [
                      h.div([
                        h.Class(sliderFilledTrackClass),
                        h.DataAttribute('slot', 'slider-range'),
                        h.Style({ width: '50%' }),
                      ]),
                    ],
                  ),
                  h.div([h.Class(sliderThumbClass), h.DataAttribute('slot', 'slider-thumb')]),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )

const foldOutMessage = M.type<Slider.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    ChangedValue:
      ({ value }) =>
      (model) => ({ model: evo(model, { sliderValue: () => value }) }),
  }),
)

const foldSlider = Update.foldChild({
  update: Slider.update,
  read: (model: State) => Option.some(model.sliderDemo),
  write: (model, next) => evo(model, { sliderDemo: () => next }),
  toParentMessage: (message) => Message.GotSliderMessage({ message }),
  foldOutMessage,
})

const fields = {
  sliderDemo: Slider.Model,
  sliderValue: S.Number,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const subscriptions = Subscription.lift({
  sliderPointer: FoldkitSlider.subscriptions.dragPointer,
  sliderEscape: FoldkitSlider.subscriptions.dragEscape,
})<State, typeof Message.GotSliderMessage.Type>({
  toChildModel: (model) => model.sliderDemo,
  toParentMessage: (message) => Message.GotSliderMessage({ message }),
})

export const slice = defineSlice({
  fields,
  init: {
    sliderDemo: Slider.init({ id: 'slider-demo', min: 0, max: 100, step: 1 }),
    sliderValue: 75,
  },
  messages: [Message.GotSliderMessage],
  handlers: (model: State) => ({
    GotSliderMessage: (payload: typeof Message.GotSliderMessage.Type): UpdateReturn =>
      foldSlider(model, payload.message),
  }),
  samples: [],
  subscriptions,
})
