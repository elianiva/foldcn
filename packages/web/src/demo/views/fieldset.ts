import type { Html, HtmlBuilder } from 'foldkit/html'

import { fieldset } from '@foldcn/registry/styles/default/ui/fieldset'
import { input } from '@foldcn/registry/styles/default/ui/input'
import * as select from '@foldcn/registry/styles/default/ui/select'
import { LanguageSelect } from '../bundles'

import { GotSelectMessage, UpdatedInputValue, type Message } from '../message'
import type { Model } from '../model'

const LANGUAGE_OPTIONS = [
  ['en', 'English'],
  ['id', 'Bahasa Indonesia'],
  ['ja', '日本語'],
] as const

export const fieldsetView = (model: Model, h: HtmlBuilder<Message>): Html =>
  fieldset<Message>(
    {
      id: 'fieldset-contact',
      legend: 'Contact details',
      maybeDescription: 'Used for shipping and billing.',
      children: [
        input<Message>(
          {
            id: 'fieldset-name',
            label: 'Name',
            value: model.inputValue,
            onInput: (value) => UpdatedInputValue({ value }),
            placeholder: 'Ada Lovelace',
          },
          h,
        ),
        h.div(
          [h.Class(select.selectWrapperClass)],
          [
            select.selectLabel('Country', h),
            h.submodel({
              slotId: model.select.id,
              model: model.select,
              view: LanguageSelect.view,
              viewInputs: select.styledViewInputs<Message, { value: string; label: string }, string>({
                options: LANGUAGE_OPTIONS.map(([value, label]) => ({ value, label })),
                maybeSelectedValue: model.maybeSelectValue,
                itemToValue: (item) => item.value,
                itemToLabel: (item) => item.label,
                label: 'Country',
              }, h),
              toParentMessage: (message) => GotSelectMessage({ message }),
            }),
          ],
        ),
      ],
    },
    h,
  )
