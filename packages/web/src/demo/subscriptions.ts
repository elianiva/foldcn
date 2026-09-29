import { Subscription } from 'foldkit'

import type { Model, Message } from './assemble'
import { subscriptions as carouselSubscriptions } from './views/carousel'
import { subscriptions as dragAndDropSubscriptions } from './views/drag-and-drop'
import { subscriptions as drawerSubscriptions } from './views/drawer'
import { subscriptions as messageScrollerSubscriptions } from './views/message-scroller'
import { subscriptions as resizableSubscriptions } from './views/resizable'
import { subscriptions as scrollAreaSubscriptions } from './views/scroll-area'
import { subscriptions as sidebarSubscriptions } from './views/sidebar'
import { subscriptions as sliderSubscriptions } from './views/slider'
import { subscriptions as toastSubscriptions } from './views/toast'
import { subscriptions as virtualListSubscriptions } from './views/virtual-list'

export const subscriptions = Subscription.aggregate<Model, Message>()(
  carouselSubscriptions,
  dragAndDropSubscriptions,
  drawerSubscriptions,
  messageScrollerSubscriptions,
  resizableSubscriptions,
  scrollAreaSubscriptions,
  sidebarSubscriptions,
  sliderSubscriptions,
  toastSubscriptions,
  virtualListSubscriptions,
)
