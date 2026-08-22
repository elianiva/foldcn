import type { Html, HtmlBuilder } from 'foldkit/html'

import { direction } from '@foldcn/registry/styles/default/ui/direction'

import type { Message } from '../message'
import type { Model } from '../model'

export const directionView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col gap-4')],
    [
      direction<Message>(
        { dir: 'ltr' },
        [h.p([h.Class('text-sm')], ['Left-to-right text.'])],
        h,
      ),
      direction<Message>(
        { dir: 'rtl' },
        [h.p([h.Class('text-sm')], ['Right-to-left text.'])],
        h,
      ),
    ],
  )
