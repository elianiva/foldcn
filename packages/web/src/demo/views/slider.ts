import type { Html, HtmlBuilder } from 'foldkit/html'

import * as slider from '@foldcn/registry/styles/default/ui/slider'

import { GotSliderRatingMessage, GotSliderVolumeMessage, type Message } from '../message'
import type { Model } from '../model'

export const sliderView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-sm flex-col gap-8')],
    [
      h.submodel({
        slotId: model.sliderRating.id,
        model: model.sliderRating,
        view: slider.view,
        viewInputs: slider.styledViewInputs(
          { value: model.sliderRatingValue, label: 'Rating', formatValue: (value) => `${value} / 10` },
          h,
        ),
        toParentMessage: (message) => GotSliderRatingMessage({ message }),
      }),
      h.submodel({
        slotId: model.sliderVolume.id,
        model: model.sliderVolume,
        view: slider.view,
        viewInputs: slider.styledViewInputs(
          {
            value: model.sliderVolumeValue,
            label: 'Volume',
            formatValue: (value) => `${Math.round(value * 100)}%`,
          },
          h,
        ),
        toParentMessage: (message) => GotSliderVolumeMessage({ message }),
      }),
    ],
  )
