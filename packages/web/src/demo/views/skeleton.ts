import type { Html, HtmlBuilder } from 'foldkit/html'

import { skeleton } from '@foldcn/registry/styles/default/ui/skeleton'

import type { Message } from '../message'
import type { Model } from '../model'

export const skeletonView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-sm flex-col gap-3')],
    [
      skeleton<Message>({ className: 'h-4 w-[250px]' }, [], h),
      skeleton<Message>({ className: 'h-4 w-[200px]' }, [], h),
      skeleton<Message>({ className: 'h-4 w-[150px]' }, [], h),
      skeleton<Message>({ className: 'h-32 w-full rounded-xl' }, [], h),
    ],
  )
