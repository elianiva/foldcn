import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  inputOtp,
  inputOtpGroupClass,
  inputOtpSlotClass,
  inputOtpSeparator,
  inputOtpClass,
} from '../../generated/registry/ui/input-otp'
import {
  field,
  fieldDescription,
  fieldError,
  fieldLabel,
} from '../../generated/registry/ui/fieldset'
import { button } from '../../generated/registry/ui/button'
import { icon } from '../../generated/registry/lib/icons'
import { RefreshCw } from 'lucide'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  UpdatedOtp: { value: S.String },
})

const otpSlots = (
  h: HtmlBuilder<AppMessage>,
  length: number,
  value: string,
  highlightInvalid = false,
): Html => {
  const digits = value.replace(/\D/g, '').slice(0, length).split('')
  return h.div(
    [h.Class(inputOtpGroupClass), h.DataAttribute('slot', 'input-otp-group')],
    Array.from({ length }, (_, i) =>
      h.div(
        [
          h.Class(inputOtpSlotClass),
          h.DataAttribute('slot', 'input-otp-slot'),
          ...(highlightInvalid ? [h.AriaInvalid(true)] : []),
        ],
        [digits[i] ?? ''],
      ),
    ),
  )
}

export const inputOtpView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Simple']),
          field<AppMessage>(
            {},
            [
              fieldLabel<AppMessage>({ for: 'simple' }, ['Simple'], h),
              h.div(
                [h.Class(inputOtpClass), h.DataAttribute('slot', 'input-otp')],
                [
                  h.div(
                    [h.Class('flex items-center gap-2')],
                    [otpSlots(h, 3, ''), inputOtpSeparator({}, h), otpSlots(h, 3, '')],
                  ),
                ],
              ),
            ],
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Separator']),
          field<AppMessage>(
            {},
            [
              fieldLabel<AppMessage>({ for: 'with-separator' }, ['With Separator'], h),
              inputOtp<AppMessage>(
                { length: 6, value: model.otp, onInput: (value) => Message.UpdatedOtp({ value }) },
                h,
              ),
            ],
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['4 Digits']),
          field<AppMessage>(
            {},
            [
              fieldLabel<AppMessage>({ for: 'four-digits' }, ['4 Digits'], h),
              fieldDescription<AppMessage>({}, ['Common pattern for PIN codes.'], h),
              h.div(
                [h.Class(inputOtpClass), h.DataAttribute('slot', 'input-otp')],
                [otpSlots(h, 4, '1234')],
              ),
            ],
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Disabled']),
          field<AppMessage>(
            {},
            [
              fieldLabel<AppMessage>({ for: 'disabled' }, ['Disabled'], h),
              h.div(
                [h.Class(`${inputOtpClass} opacity-50`), h.DataAttribute('slot', 'input-otp')],
                [
                  h.div(
                    [h.Class('flex items-center gap-2')],
                    [otpSlots(h, 3, '123'), inputOtpSeparator({}, h), otpSlots(h, 3, '456')],
                  ),
                ],
              ),
            ],
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Invalid']),
          field<AppMessage>(
            {},
            [
              fieldLabel<AppMessage>({ for: 'invalid' }, ['Invalid State'], h),
              fieldDescription<AppMessage>({}, ['Example showing the invalid error state.'], h),
              h.div(
                [h.Class(inputOtpClass), h.DataAttribute('slot', 'input-otp')],
                [
                  h.div(
                    [h.Class('flex items-center gap-2')],
                    [
                      otpSlots(h, 2, '00', true),
                      inputOtpSeparator({}, h),
                      otpSlots(h, 2, '00', true),
                      inputOtpSeparator({}, h),
                      otpSlots(h, 2, '00', true),
                    ],
                  ),
                ],
              ),
              fieldError<AppMessage>(
                { errors: [{ message: 'Invalid code. Please try again.' }] },
                h,
              ),
            ],
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Controlled']),
          inputOtp<AppMessage>(
            { length: 6, value: model.otp, onInput: (value) => Message.UpdatedOtp({ value }) },
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Form']),
          h.div(
            [h.Class('mx-auto max-w-md rounded-xl border bg-card p-6')],
            [
              h.div(
                [h.Class('mb-4 flex flex-col gap-1')],
                [
                  h.div([h.Class('font-semibold')], ['Verify your login']),
                  h.div(
                    [h.Class('text-sm text-muted-foreground')],
                    ['Enter the verification code we sent to m@example.com.'],
                  ),
                ],
              ),
              field<AppMessage>(
                {},
                [
                  h.div(
                    [h.Class('flex items-center justify-between')],
                    [
                      fieldLabel<AppMessage>({ for: 'otp-verification' }, ['Verification code'], h),
                      button<AppMessage>(
                        { variant: 'outline', size: 'xs' },
                        h.span([], [icon(h, RefreshCw, 'size-3'), ' Resend Code']),
                        h,
                      ),
                    ],
                  ),
                  inputOtp<AppMessage>(
                    {
                      length: 6,
                      value: model.otp,
                      onInput: (value) => Message.UpdatedOtp({ value }),
                    },
                    h,
                  ),
                  fieldDescription<AppMessage>(
                    {},
                    ['I no longer have access to this email address.'],
                    h,
                  ),
                ],
                h,
              ),
              h.div(
                [h.Class('mt-4 flex flex-col gap-2')],
                [
                  button<AppMessage>({ type: 'submit' }, 'Verify', h),
                  h.div(
                    [h.Class('text-sm text-muted-foreground text-center')],
                    ['Having trouble signing in? Contact support'],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )

const fields = { otp: S.String }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { otp: '123456' },
  messages: [Message.UpdatedOtp],
  handlers: (model: State) => ({
    UpdatedOtp: ({ value }: typeof Message.UpdatedOtp.Type): UpdateReturn => ({
      model: evo(model, { otp: () => value }),
    }),
  }),
  samples: [Message.UpdatedOtp({ value: '1234' })],
})
