import type { Html, HtmlBuilder } from 'foldkit/html'

import { badge, badgeVariantKeys } from '@foldcn/registry/styles/default/ui/badge'

import type { Message } from '../message'
import type { Model } from '../model'

export const badgeView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-wrap items-center gap-3')],
    badgeVariantKeys.map((variant) => badge<Message>({ variant }, [variant], h)),
  )
