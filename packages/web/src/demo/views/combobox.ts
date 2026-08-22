import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as combobox from '@foldcn/registry/styles/default/ui/combobox'
import { CityCombobox } from '../bundles'

import { GotComboboxMessage, type Message } from '../message'
import type { City, Model } from '../model'

const CITIES: ReadonlyArray<City> = [
  'Johannesburg',
  'Kyiv',
  'Oxford',
  'Plymouth',
  'Quito',
  'Wellington',
  'Zurich',
]

export const comboboxView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('w-full max-w-xs')],
    [
      h.submodel({
        slotId: model.combobox.id,
        model: model.combobox,
        view: CityCombobox.view,
        viewInputs: combobox.viewInputs<City>({
          items: CITIES,
          restingInputValue: Option.getOrElse(model.maybeComboboxValue, () => ''),
          maybeSelectedValue: model.maybeComboboxValue,
          itemToValue: (city) => city,
          itemToDisplayText: (city) => city,
          inputPlaceholder: 'Select a city...',
          itemToConfig: (city, { isSelected, isActive }) => ({
            className: isActive ? 'font-medium' : '',
            content: h.span(
              [h.Class('flex w-full items-center justify-between gap-2')],
              [h.span([], [city]), ...(isSelected ? [h.span([], ['✓'])] : [])],
            ),
          }),
        }),
        toParentMessage: (message) => GotComboboxMessage({ message }),
      }),
    ],
  )
