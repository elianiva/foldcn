import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  inputOtp,
  inputOtpGroup,
  inputOtpSlot,
  inputOtpSeparator,
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
  UpdatedSeparatedOtp: { value: S.String },
  UpdatedFourOtp: { value: S.String },
  UpdatedControlledOtp: { value: S.String },
  UpdatedInvalidOtp: { value: S.String },
})

const separatedGroups = (
  h: HtmlBuilder<AppMessage>,
  value: string,
  isInvalid = false,
): ReadonlyArray<Html> => [
  inputOtpGroup<AppMessage>(
    {},
    [0, 1].map((index) => inputOtpSlot({ index, value, length: 6, isInvalid }, h)),
    h,
  ),
  inputOtpSeparator({}, h),
  inputOtpGroup<AppMessage>(
    {},
    [2, 3].map((index) => inputOtpSlot({ index, value, length: 6, isInvalid }, h)),
    h,
  ),
  inputOtpSeparator({}, h),
  inputOtpGroup<AppMessage>(
    {},
    [4, 5].map((index) => inputOtpSlot({ index, value, length: 6, isInvalid }, h)),
    h,
  ),
]

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
              fieldLabel<AppMessage>({ for: 'otp-simple' }, ['Simple'], h),
              inputOtp<AppMessage>(
                {
                  length: 6,
                  value: model.otp,
                  id: 'otp-simple',
                  onInput: (value) => Message.UpdatedOtp({ value }),
                },
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Separator']),
          field<AppMessage>(
            {},
            [
              fieldLabel<AppMessage>({ for: 'otp-separator' }, ['With Separator'], h),
              inputOtp<AppMessage>(
                {
                  length: 6,
                  value: model.otpSeparated,
                  id: 'otp-separator',
                  onInput: (value) => Message.UpdatedSeparatedOtp({ value }),
                  children: separatedGroups(h, model.otpSeparated),
                },
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
              fieldLabel<AppMessage>({ for: 'otp-four' }, ['4 Digits'], h),
              fieldDescription<AppMessage>({}, ['Common pattern for PIN codes.'], h),
              inputOtp<AppMessage>(
                {
                  length: 4,
                  value: model.otpFour,
                  id: 'otp-four',
                  onInput: (value) => Message.UpdatedFourOtp({ value }),
                },
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Disabled']),
          field<AppMessage>(
            {},
            [
              fieldLabel<AppMessage>({ for: 'otp-disabled' }, ['Disabled'], h),
              inputOtp<AppMessage>(
                { length: 6, value: '123456', id: 'otp-disabled', isDisabled: true },
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Invalid']),
          field<AppMessage>(
            {},
            [
              fieldLabel<AppMessage>({ for: 'otp-invalid' }, ['Invalid State'], h),
              fieldDescription<AppMessage>({}, ['Example showing the invalid error state.'], h),
              inputOtp<AppMessage>(
                {
                  length: 6,
                  value: model.otpInvalid,
                  id: 'otp-invalid',
                  isInvalid: true,
                  onInput: (value) => Message.UpdatedInvalidOtp({ value }),
                  children: separatedGroups(h, model.otpInvalid, true),
                },
                h,
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
            {
              length: 6,
              value: model.otpControlled,
              id: 'otp-controlled',
              onInput: (value) => Message.UpdatedControlledOtp({ value }),
            },
            h,
          ),
          h.div(
            [h.Class('text-center text-sm')],
            [
              model.otpControlled === ''
                ? 'Enter your one-time password.'
                : model.otpControlled.length >= 6
                  ? `You entered: ${model.otpControlled}`
                  : `${6 - model.otpControlled.length} digits remaining.`,
            ],
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
                      id: 'otp-verification',
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

const fields = {
  otp: S.String,
  otpSeparated: S.String,
  otpFour: S.String,
  otpControlled: S.String,
  otpInvalid: S.String,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { otp: '123456', otpSeparated: '', otpFour: '', otpControlled: '', otpInvalid: '000000' },
  messages: [
    Message.UpdatedOtp,
    Message.UpdatedSeparatedOtp,
    Message.UpdatedFourOtp,
    Message.UpdatedControlledOtp,
    Message.UpdatedInvalidOtp,
  ],
  handlers: (model: State) => ({
    UpdatedOtp: ({ value }: typeof Message.UpdatedOtp.Type): UpdateReturn => ({
      model: evo(model, { otp: () => value }),
    }),
    UpdatedSeparatedOtp: ({ value }: typeof Message.UpdatedSeparatedOtp.Type): UpdateReturn => ({
      model: evo(model, { otpSeparated: () => value }),
    }),
    UpdatedFourOtp: ({ value }: typeof Message.UpdatedFourOtp.Type): UpdateReturn => ({
      model: evo(model, { otpFour: () => value }),
    }),
    UpdatedControlledOtp: ({ value }: typeof Message.UpdatedControlledOtp.Type): UpdateReturn => ({
      model: evo(model, { otpControlled: () => value }),
    }),
    UpdatedInvalidOtp: ({ value }: typeof Message.UpdatedInvalidOtp.Type): UpdateReturn => ({
      model: evo(model, { otpInvalid: () => value }),
    }),
  }),
  samples: [
    Message.UpdatedOtp({ value: '1234' }),
    Message.UpdatedSeparatedOtp({ value: '12' }),
    Message.UpdatedFourOtp({ value: '34' }),
    Message.UpdatedControlledOtp({ value: '56' }),
    Message.UpdatedInvalidOtp({ value: '00' }),
  ],
})
