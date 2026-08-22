import type { Html, HtmlBuilder } from 'foldkit/html'

import { label } from '@foldcn/registry/styles/default/ui/label'

import type { Message } from '../message'
import type { Model } from '../model'

export const labelView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-sm flex-col gap-2')],
    [
      label<Message>({ forId: 'label-demo' }, ['Email'], h),
      h.input([
        h.Id('label-demo'),
        h.Class(
          'h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none',
        ),
      ]),
    ],
  )
