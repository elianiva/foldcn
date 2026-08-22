import type { Html, HtmlBuilder } from 'foldkit/html'

import * as virtualList from '@foldcn/registry/styles/default/ui/virtual-list'

import { ClickedScrollToMiddle, GotVirtualListMessage, type Message } from '../message'
import type { Model } from '../model'

export const VIRTUAL_LIST_ROW_COUNT = 100_000

export const virtualListView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full flex-col items-start gap-3')],
    [
      h.button(
        [
          h.Class('rounded-md border border-input bg-background px-4 py-2 text-sm font-medium'),
          h.OnClick(ClickedScrollToMiddle()),
        ],
        ['Scroll to middle'],
      ),
      h.div(
        [h.Class('w-full')],
        [
          h.submodel({
            slotId: model.virtualList.id,
            model: model.virtualList,
            view: virtualList.view<number>(),
            viewInputs: virtualList.styledViewInputs<number>({
              items: Array.from({ length: VIRTUAL_LIST_ROW_COUNT }, (_, index) => index),
              itemToKey: (index) => String(index),
              itemToView: (index) =>
                h.div(
                  [h.Class('flex items-center gap-3')],
                  [
                    h.span([h.Class('w-8 shrink-0 text-muted-foreground')], [String(index)]),
                    h.span([h.Class('truncate')], [`Virtual row ${index}`]),
                    h.span([h.Class('ml-auto text-muted-foreground')], ['56px']),
                  ],
                ),
              itemToRowHeightPx: () => 56,
            }),
            toParentMessage: (message) => GotVirtualListMessage({ message }),
          }),
        ],
      ),
    ],
  )
