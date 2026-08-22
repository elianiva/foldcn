import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

// InputOtp renders one transparent <input> overlaid across a row of visual
// slots. Every keystroke lands in that single input, so the browser handles
// the hard parts natively — auto-advancing as digits are typed, stepping back
// on Backspace, arrow-key navigation, and pasting a full code into the slots —
// the way shadcn's `input-otp` base surface does through the `input-otp`
// library. The slots are purely presentational: each shows one character of
// `value`, and the active (next-to-fill) slot shows a blinking caret.
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/input-otp.tsx (joined-pill slots). Class
// strings are identical to upstream; visual styling lives in the central foldcn style definition. (cn-input-otp-input / cn-input-otp-caret are intentional no-op
// hooks upstream — the real input/caret styling is foldcn-specific below).

export const inputOtpClass = 'cn-input-otp relative flex items-center has-disabled:opacity-50'

/** Wrapper grouping the joined slots; keys the group's invalid ring off the
 *  input's aria-invalid. */
export const inputOtpGroupClass = 'cn-input-otp-group flex items-center'

export const inputOtpInputClass =
  'cn-input-otp-input absolute inset-0 z-10 h-full w-full bg-transparent text-transparent caret-transparent outline-none disabled:cursor-not-allowed'

export const inputOtpSlotClass =
  'cn-input-otp-slot relative flex size-8 items-center justify-center text-sm tabular-nums transition-all outline-none data-[active=true]:z-10'

export const inputOtpCaretClass =
  'pointer-events-none absolute inset-0 flex items-center justify-center'

export const inputOtpCaretLineClass = 'h-4 w-px animate-caret-blink duration-1000 bg-foreground'

export type InputOtpConfig<M> = Readonly<{
  length: number
  value: string
  onInput?: (value: string) => M
  onComplete?: (value: string) => M
  isDisabled?: boolean
  autoFocus?: boolean
  className?: string
}>

/** A row of single-character OTP slots backed by one combined string `value`. */
export const inputOtp = <M>(config: InputOtpConfig<M>, h: HtmlBuilder<M>): Html => {
  const digits = config.value.replace(/\D/g, '').slice(0, config.length).split('')
  const isComplete = digits.length >= config.length
  const activeIndex = isComplete ? -1 : digits.length

  const slot = (index: number): Html =>
    h.div(
      [
        h.Class(inputOtpSlotClass),
        h.DataAttribute('slot', 'input-otp-slot'),
        ...(index === activeIndex ? [h.DataAttribute('active', 'true')] : []),
      ],
      [
        digits[index] ?? '',
        index === activeIndex
          ? h.div([h.Class(inputOtpCaretClass)], [h.div([h.Class(inputOtpCaretLineClass)], [])])
          : null,
      ],
    )

  return h.div(
    [h.Class(cn(inputOtpClass, config.className)), h.DataAttribute('slot', 'input-otp')],
    [
      h.input([
        h.Type('text'),
        h.InputMode('numeric'),
        h.Attribute('autocomplete', 'one-time-code'),
        h.Maxlength(config.length),
        h.Spellcheck(false),
        ...(config.isDisabled === true ? [h.Disabled(true)] : []),
        ...(config.autoFocus === true ? [h.Autofocus(true)] : []),
        h.Value(digits.join('')),
        h.Class(inputOtpInputClass),
        h.DataAttribute('slot', 'input-otp-input'),
        ...(config.onInput === undefined && config.onComplete === undefined
          ? []
          : [
              h.OnInput((raw) => {
                const next = raw.replace(/\D/g, '').slice(0, config.length)
                if (config.onComplete !== undefined && next.length === config.length) {
                  return config.onComplete(next)
                }
                if (config.onInput !== undefined) {
                  return config.onInput(next)
                }
                // Only onComplete was provided: it doubles as the update
                // channel for this controlled input, so it fires on every
                // change (check `length` before treating it as completion).
                return config.onComplete!(next)
              }),
            ]),
      ]),
      h.div(
        [h.Class(cn(inputOtpGroupClass)), h.DataAttribute('slot', 'input-otp-group')],
        Array.from({ length: config.length }, (_, index) => slot(index)),
      ),
    ],
  )
}
