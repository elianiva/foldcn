import type { Html, HtmlBuilder } from 'foldkit/html'

import * as select from '@foldcn/registry/styles/default/ui/select'
import { LanguageSelect } from '../bundles'

import { GotSelectMessage, type Message } from '../message'
import type { Model } from '../model'

const LANGUAGE_OPTIONS = [
  ['en', 'English'],
  ['id', 'Bahasa Indonesia'],
  ['ja', '日本語'],
] as const

export const selectView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class(select.selectWrapperClass)],
    [
      select.selectLabel('Language', h),
      h.submodel({
        slotId: model.select.id,
        model: model.select,
        view: LanguageSelect.view,
        viewInputs: select.styledViewInputs<Message, { value: string; label: string }, string>({
          options: LANGUAGE_OPTIONS.map(([value, label]) => ({ value, label })),
          maybeSelectedValue: model.maybeSelectValue,
          itemToValue: (item) => item.value,
          itemToLabel: (item) => item.label,
          label: 'Language',
          description: 'Choose your interface language.',
          isInvalid: false,
        }, h),
        toParentMessage: (message) => GotSelectMessage({ message }),
      }),
      select.selectDescription('Choose your interface language.', h)
    ],
  )
