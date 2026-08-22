import type { Html, HtmlBuilder } from 'foldkit/html'

import { nav } from '@foldcn/registry/styles/default/ui/nav'

import { SelectedNav, type Message } from '../message'
import type { Model } from '../model'

const NAV_ITEMS = ['Overview', 'Components', 'Settings', 'Docs'] as const

export const navView = (model: Model, h: HtmlBuilder<Message>): Html =>
  nav<Message, (typeof NAV_ITEMS)[number]>(
    {
      items: NAV_ITEMS,
      ariaLabel: 'Primary',
      toHref: () => '#',
      isItemCurrent: (value) => value === model.activeNav,
      onItemClick: (value) => SelectedNav({ value }),
      toLabel: (value) => value,
    },
    h,
  )
