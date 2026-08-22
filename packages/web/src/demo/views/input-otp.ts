import type { Html, HtmlBuilder } from 'foldkit/html'

import { inputOtp } from '@foldcn/registry/styles/default/ui/input-otp'

import { UpdatedOtp, type Message } from '../message'
import type { Model } from '../model'

export const inputOtpView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-sm flex-col gap-4')],
    [
      inputOtp<Message>(
        { length: 6, value: model.otp, onInput: (value) => UpdatedOtp({ value }), autoFocus: true },
        h,
      ),
      h.p(
        [h.Class('text-sm text-muted-foreground')],
        [model.otp === '' ? 'Enter the 6-digit code.' : `Entered: ${model.otp}`],
      ),
    ],
  )
