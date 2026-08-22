import type { Html, HtmlBuilder } from 'foldkit/html'

import { Kbd } from '@foldcn/registry/styles/default/ui/kbd'

import type { Message } from '../message'
import type { Model } from '../model'

export const kbdView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-wrap items-center gap-3')],
    [
      Kbd<Message>({}, ['Ctrl'], h),
      Kbd<Message>({}, ['Shift'], h),
      Kbd.group<Message>(
        {},
        [Kbd<Message>({}, ['⌘'], h), Kbd<Message>({}, ['K'], h)],
        h,
      ),
    ],
  )
