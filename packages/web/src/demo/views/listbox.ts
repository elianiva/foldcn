import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as listbox from '@foldcn/registry/styles/default/ui/listbox'
import { ItemListbox } from '../bundles'

import { GotListboxMessage, type Message } from '../message'
import type { ListboxItem, Model } from '../model'

const LISTBOX_ITEMS: ReadonlyArray<ListboxItem> = [
  'Michael Bluth',
  'Lindsay Funke',
  'Gob Bluth',
  'George Michael',
  'Tobias Funke',
]

export const listboxView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col gap-1.5')],
    [
      h.label([h.Class('text-sm font-medium')], ['Family member']),
      h.submodel({
        slotId: model.listbox.id,
        model: model.listbox,
        view: ItemListbox.view,
        viewInputs: listbox.viewInputs<ListboxItem, ListboxItem>({
          items: LISTBOX_ITEMS,
          maybeSelectedValue: model.maybeListboxValue,
          buttonContent: h.span(
            [],
            [Option.getOrElse(model.maybeListboxValue, () => 'Select a Bluth')],
          ),
          itemToConfig: (item, { isSelected, isActive }) => ({
            className: isActive ? 'font-medium' : '',
            content: h.span(
              [h.Class('flex w-full items-center justify-between gap-2')],
              [h.span([], [item]), ...(isSelected ? [h.span([], ['✓'])] : [])],
            ),
          }),
        }),
        toParentMessage: (message) => GotListboxMessage({ message }),
      }),
    ],
  )
