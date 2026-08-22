import type { Html, HtmlBuilder } from 'foldkit/html'

import { progress } from '@foldcn/registry/styles/default/ui/progress'

import type { Message } from '../message'
import type { Model } from '../model'

export const progressView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-md flex-col gap-4')],
    [
      progress<Message>({ value: 30 }, h),
      progress<Message>({ value: 65 }, h),
      progress<Message>({}, h),
    ],
  )
