import { Subscription } from 'foldkit'
import { Slider as FoldkitSlider, VirtualList as FoldkitVirtualList } from '@foldkit/ui'

import * as DragAndDrop from '@foldcn/registry/styles/default/ui/drag-and-drop'

import {
  GotDragAndDropMessage,
  GotSliderRatingMessage,
  GotSliderVolumeMessage,
  GotVirtualListMessage,
  type Message,
} from './message'
import type { Model } from './model'

const dragAndDropSubscriptions = Subscription.lift({
  dragPointer: DragAndDrop.subscriptions.documentPointer,
  dragEscape: DragAndDrop.subscriptions.documentEscape,
  dragKeyboard: DragAndDrop.subscriptions.documentKeyboard,
  autoScroll: DragAndDrop.subscriptions.autoScroll,
})<Model, Message>({
  toChildModel: (model) => model.dragAndDrop,
  toParentMessage: (message) => GotDragAndDropMessage({ message }),
})

const sliderRatingSubscriptions = Subscription.lift({
  sliderRatingPointer: FoldkitSlider.subscriptions.dragPointer,
  sliderRatingEscape: FoldkitSlider.subscriptions.dragEscape,
})<Model, Message>({
  toChildModel: (model) => model.sliderRating,
  toParentMessage: (message) => GotSliderRatingMessage({ message }),
})

const sliderVolumeSubscriptions = Subscription.lift({
  sliderVolumePointer: FoldkitSlider.subscriptions.dragPointer,
  sliderVolumeEscape: FoldkitSlider.subscriptions.dragEscape,
})<Model, Message>({
  toChildModel: (model) => model.sliderVolume,
  toParentMessage: (message) => GotSliderVolumeMessage({ message }),
})

const virtualListSubscriptions = Subscription.lift({
  virtualListContainerEvents: FoldkitVirtualList.subscriptions.containerEvents,
})<Model, Message>({
  toChildModel: (model) => model.virtualList,
  toParentMessage: (message) => GotVirtualListMessage({ message }),
})

export const subscriptions = Subscription.aggregate<Model, Message>()(
  dragAndDropSubscriptions,
  sliderRatingSubscriptions,
  sliderVolumeSubscriptions,
  virtualListSubscriptions,
)
