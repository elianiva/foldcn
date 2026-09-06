// Regression guard: the OTP update channel must never starve.
//
// Upstream `input-otp` fires `onChange` on every change (typing, deleting,
// pasting) and `onComplete` once per transition to a full code; the two are
// independent. Foldcn maps both onto foldkit's single-message-per-event
// handlers, so the contract is: `onInput` fires on every change including
// the completing one, and `onComplete` alone doubles as the update channel
// when `onInput` is absent. Before this guard, a full code dispatched only
// `onComplete`, so a consumer wiring `onInput` to store the value and
// `onComplete` to react (submit, verify) silently lost the final digit and
// the field snapped back to one-short on re-render.
import { describe, it } from 'vitest'
import { Scene } from 'foldkit/test'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as InputOtp from '../../registry/registry/default/ui/input-otp'

type Message = Readonly<{ tag: 'input' | 'complete'; value: string }>
type Model = Readonly<{ otp: string; submitted: string | null }>

const message =
  (tag: Message['tag']) =>
  (value: string): Message => ({ tag, value })

// Dual wiring, the way a controlled consumer pairs the two callbacks: the
// update channel stores the value, the completion channel reacts to it.
const dualUpdate = (model: Model, msg: Message) =>
  msg.tag === 'input'
    ? { model: { ...model, otp: msg.value } }
    : { model: { ...model, submitted: msg.value } }

// Sole-channel wiring: with no update channel of its own, the owner stores
// from whichever callback fires.
const soleUpdate = (model: Model, msg: Message) => ({
  model: { ...model, otp: msg.value },
})

const init: Model = { otp: '', submitted: null }

const otpInput = Scene.selector('input[data-slot="input-otp-input"]')

const viewBoth = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [],
    [
      InputOtp.inputOtp(
        {
          length: 6,
          value: model.otp,
          onInput: message('input'),
          onComplete: message('complete'),
        },
        h,
      ),
      h.div([], [model.submitted === null ? 'not-submitted' : `submitted:${model.submitted}`]),
    ],
  )

const viewInputOnly = (model: Model, h: HtmlBuilder<Message>): Html =>
  InputOtp.inputOtp({ length: 6, value: model.otp, onInput: message('input') }, h)

const viewCompleteOnly = (model: Model, h: HtmlBuilder<Message>): Html =>
  InputOtp.inputOtp({ length: 6, value: model.otp, onComplete: message('complete') }, h)

describe('input-otp update channel', () => {
  it('stores the completing digit when onInput and onComplete are both wired', () => {
    Scene.scene(
      { update: dualUpdate, view: viewBoth },
      Scene.given({ ...init, otp: '12345' }),
      Scene.type(otpInput, '123456'),
      Scene.expect(Scene.text('6')).toExist(),
      Scene.expect(Scene.text('not-submitted')).toExist(),
    )
  })
  it('stores partial edits through onInput alone', () => {
    Scene.scene(
      { update: soleUpdate, view: viewInputOnly },
      Scene.given(init),
      Scene.type(otpInput, '12a34'),
      Scene.expect(Scene.text('4')).toExist(),
    )
  })
  it('stores edits through onComplete alone when onInput is absent', () => {
    Scene.scene(
      { update: soleUpdate, view: viewCompleteOnly },
      Scene.given(init),
      Scene.type(otpInput, '789'),
      Scene.expect(Scene.text('9')).toExist(),
    )
  })
})

describe('input-otp pure core', () => {
  it('strips non-digits and caps at length', () => {
    const cases: ReadonlyArray<readonly [string, number, string]> = [
      ['12a34', 6, '1234'],
      ['1234567', 6, '123456'],
      [' 1-2 3 ', 6, '123'],
      ['', 4, ''],
    ]
    for (const [raw, length, expected] of cases) {
      if (InputOtp.normalizeOtpValue(raw, length) !== expected) {
        throw new Error(`normalizeOtpValue(${JSON.stringify(raw)}, ${length}) mismatch`)
      }
    }
  })
  it('reports completion only at full length', () => {
    if (!InputOtp.isCompleteOtpValue('123456', 6)) throw new Error('full code not complete')
    if (InputOtp.isCompleteOtpValue('12345', 6)) throw new Error('partial code complete')
  })
  it('marks exactly the next-to-fill slot active', () => {
    const states = InputOtp.otpSlotStates('12', 4)
    const active = states.filter((slot) => slot.isActive)
    const first = active[0]
    if (active.length !== 1 || first === undefined || first.index !== 2) {
      throw new Error(`active slot mismatch: ${JSON.stringify(active)}`)
    }
    if (states[0]?.char !== '1' || states[2]?.char !== null) {
      throw new Error(`slot chars mismatch: ${JSON.stringify(states)}`)
    }
  })
})

describe('input-otp composition parts', () => {
  it('renders caller-composed groups, slots and separators around one input', () => {
    const composed = (_model: Model, h: HtmlBuilder<Message>): Html =>
      InputOtp.inputOtp(
        {
          length: 4,
          value: '12',
          onInput: message('input'),
          children: [
            InputOtp.inputOtpGroup(
              { className: 'first' },
              [
                InputOtp.inputOtpSlot({ index: 0, value: '12', length: 4 }, h),
                InputOtp.inputOtpSlot({ index: 1, value: '12', length: 4 }, h),
              ],
              h,
            ),
            InputOtp.inputOtpSeparator({}, h),
            InputOtp.inputOtpGroup(
              {},
              [
                InputOtp.inputOtpSlot({ index: 2, value: '12', length: 4 }, h),
                InputOtp.inputOtpSlot({ index: 3, value: '12', length: 4 }, h),
              ],
              h,
            ),
          ],
        },
        h,
      )
    Scene.scene(
      { update: soleUpdate, view: composed },
      Scene.given(init),
      Scene.expect(otpInput).toExist(),
      Scene.expect(Scene.selector('[data-slot="input-otp-separator"]')).toExist(),
      Scene.expect(Scene.text('1')).toExist(),
      Scene.expect(Scene.text('2')).toExist(),
    )
  })
  it('marks slots invalid when invalid', () => {
    const invalid = (_model: Model, h: HtmlBuilder<Message>): Html =>
      InputOtp.inputOtp({ length: 2, value: '00', isInvalid: true }, h)
    Scene.scene(
      { update: soleUpdate, view: invalid },
      Scene.given(init),
      Scene.expect(Scene.selector('[data-slot="input-otp-slot"][aria-invalid="true"]')).toExist(),
    )
  })
  it('threads invalid through caller-composed groups', () => {
    const composedInvalid = (_model: Model, h: HtmlBuilder<Message>): Html =>
      InputOtp.inputOtp(
        {
          length: 4,
          value: '00',
          isInvalid: true,
          children: [
            InputOtp.inputOtpGroup(
              {},
              [
                InputOtp.inputOtpSlot({ index: 0, value: '00', length: 4, isInvalid: true }, h),
                InputOtp.inputOtpSlot({ index: 1, value: '00', length: 4, isInvalid: true }, h),
              ],
              h,
            ),
            InputOtp.inputOtpSeparator({}, h),
            InputOtp.inputOtpGroup(
              {},
              [
                InputOtp.inputOtpSlot({ index: 2, value: '00', length: 4, isInvalid: true }, h),
                InputOtp.inputOtpSlot({ index: 3, value: '00', length: 4, isInvalid: true }, h),
              ],
              h,
            ),
          ],
        },
        h,
      )
    Scene.scene(
      { update: soleUpdate, view: composedInvalid },
      Scene.given(init),
      Scene.expect(Scene.selector('[data-slot="input-otp-separator"]')).toExist(),
      Scene.expect(Scene.selector('[data-slot="input-otp-slot"][aria-invalid="true"]')).toExist(),
    )
  })
})
