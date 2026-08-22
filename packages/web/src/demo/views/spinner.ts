import type { Html, HtmlBuilder } from 'foldkit/html'

import { spinner } from '@foldcn/registry/styles/default/ui/spinner'

import type { Message } from '../message'
import type { Model } from '../model'

export const spinnerView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-wrap items-center gap-4')],
    [
      spinner<Message>({}, h),
      spinner<Message>({ className: 'size-6' }, h),
      h.div(
        [h.Class('flex items-center gap-2 text-sm text-muted-foreground')],
        [spinner<Message>({}, h), 'Loading...'],
      ),
    ],
  )
