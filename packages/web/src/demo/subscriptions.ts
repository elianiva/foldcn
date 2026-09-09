import { Subscription } from 'foldkit'

import { subscriptions as commandSubscriptions } from './views/command'

import type { Model, Message } from './assemble'
import { subscriptions as dragAndDropSubscriptions } from './views/drag-and-drop'
import { subscriptions as drawerSubscriptions } from './views/drawer'
import { subscriptions as scrollAreaSubscriptions } from './views/scroll-area'
import { subscriptions as sidebarSubscriptions } from './views/sidebar'
import { subscriptions as sliderSubscriptions } from './views/slider'
import { subscriptions as virtualListSubscriptions } from './views/virtual-list'

export const subscriptions = Subscription.aggregate<Model, Message>()(
  commandSubscriptions,
  dragAndDropSubscriptions,
  drawerSubscriptions,
  scrollAreaSubscriptions,
  sidebarSubscriptions,
  sliderSubscriptions,
  virtualListSubscriptions,
)
