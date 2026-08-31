import { Subscription, Update } from 'foldkit'
import { Command } from 'foldkit'
import { Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { VirtualList as FoldkitVirtualList } from '@foldkit/ui'

import * as virtualList from '../../generated/registry/ui/virtual-list'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotVirtualListMessage: { message: virtualList.Message },
  ClickedScrollToMiddle: {},
})

export const VIRTUAL_LIST_ROW_COUNT = 100_000

export const virtualListView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col items-start gap-3')],
    [
      h.button(
        [
          h.Class('rounded-md border border-input bg-background px-4 py-2 text-sm font-medium'),
          h.OnClick(Message.ClickedScrollToMiddle()),
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
            toParentMessage: (message) => Message.GotVirtualListMessage({ message }),
          }),
        ],
      ),
    ],
  )

const foldVirtualList = Update.foldChild({
  update: virtualList.update,
  read: (model: State) => Option.some(model.virtualList),
  write: (model, next) => evo(model, { virtualList: () => next }),
  toParentMessage: (message) => Message.GotVirtualListMessage({ message }),
})

const fields = {
  virtualList: virtualList.Model,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const subscriptions = Subscription.lift({
  virtualListContainerEvents: FoldkitVirtualList.subscriptions.containerEvents,
})<State, typeof Message.GotVirtualListMessage.Type>({
  toChildModel: (model) => model.virtualList,
  toParentMessage: (message) => Message.GotVirtualListMessage({ message }),
})

export const slice = defineSlice({
  fields,
  init: {
    virtualList: virtualList.init({ id: 'virtual-list-demo', rowHeightPx: 56 }),
  },
  messages: [Message.GotVirtualListMessage, Message.ClickedScrollToMiddle],
  handlers: (model: State) => ({
    GotVirtualListMessage: (payload: typeof Message.GotVirtualListMessage.Type): UpdateReturn =>
      foldVirtualList(model, payload.message),
    ClickedScrollToMiddle: (): UpdateReturn => {
      const { model: next, commands = [] } = FoldkitVirtualList.scrollToIndex(
        model.virtualList,
        Math.floor(VIRTUAL_LIST_ROW_COUNT / 2),
      )
      return {
        model: evo(model, { virtualList: () => next }),
        commands: Command.mapMessages(commands, (message) =>
          Message.GotVirtualListMessage({ message }),
        ),
      }
    },
  }),
  samples: [],
  // Virtual-list events arrive through the child's own update; there are no
  // parent-side samples to feed update().
  subscriptions,
})
