// Regression guard for the wrapper contract behind opt-in swipe-to-dismiss:
// foldkit drives the gesture on the entry wrapper, so the wrapper — not the
// card — must own the corner anchor, the swipe `translate` transitions, and
// the inline placement the card used to hold. Covered here: opt-in gating,
// where the geometry lives, and both swipe outcomes (dismiss, snap back).

import { Option, Schema as S } from 'effect'
import { describe, expect, it } from 'vitest'
import * as Animation from '@foldkit/ui/animation'
import { SwipeState, WaitForSwipeSettled, make as makeFoldkitToast } from '@foldkit/ui/toast'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { modifyFields } from 'foldkit/struct'
import { Scene } from 'foldkit/test'

import * as ToastModule from '../../registry/registry/default/ui/toast'

const Payload = S.Struct({ title: S.String, description: S.Option(S.String) })

const Toast = ToastModule.make(Payload)
const Foldkit = makeFoldkitToast(Payload)

type Model = typeof Toast.Model.Type
type Message = typeof Toast.Message.Type
type OutMessage = typeof Toast.OutMessage.Type
type Entry = typeof Toast.Entry.Type

const ENTRY_ID = 'test-entry-0'
const POINTER_ID = 1
/** `settleSnapBack` increments the press's `swipeVersion` 1 to 2. */
const SETTLING_SWIPE_VERSION = 2

const entryZero = Scene.selector('div[key="test-entry-0"]')
const card = Scene.selector('[data-slot="toast"]')

const makeEntry = (overrides: Partial<Entry> = {}): Entry => ({
  id: ENTRY_ID,
  variant: 'Info',
  animation: Animation.init({ id: ENTRY_ID, isShowing: true }),
  maybeDuration: Option.none(),
  pendingDismissVersion: 0,
  isHovered: false,
  swipeState: SwipeState.Idle(),
  swipeVersion: 0,
  payload: { title: 'Sticky toast', description: Option.some('Drag me sideways to dismiss.') },
  ...overrides,
})

/** Builds the model directly so no `MeasureToastHeights` Command is pending. */
const modelWithEntry = (config: ToastModule.InitConfig, entry: Entry = makeEntry()): Model => {
  const model = Toast.init(config)
  return modifyFields(model, {
    toast: () => modifyFields(model.toast, { entries: () => [entry], nextEntryKey: () => 1 }),
    heights: () => ({ [ENTRY_ID]: 72 }),
  })
}

const gotToast = (message: typeof Foldkit.Message.Type): Message =>
  Toast.Message.GotToastMessage({ message })

const sceneView = (model: Model, h: HtmlBuilder<Message>): Html =>
  Toast.view(
    model,
    Toast.styledViewInputs(
      model,
      {
        position: 'BottomRight',
        toContent: (entry, h) => [h.p([], [entry.payload.title])],
      },
      h,
    ),
    h,
  )

const scene = (...steps: ReadonlyArray<Scene.SceneStep<Model, Message, OutMessage>>) =>
  Scene.scene({ update: Toast.update, view: sceneView }, ...steps)

describe('toast swipe-to-dismiss', () => {
  it('enables swipe only when init opts in', () => {
    expect(Toast.init({ id: 'test', swipeToDismiss: {} }).toast.maybeSwipeConfig).toEqual(
      Option.some({ threshold: 40, direction: 'Right' }),
    )
    expect(Option.isNone(Toast.init({ id: 'test' }).toast.maybeSwipeConfig)).toBe(true)

    scene(
      Scene.given(modelWithEntry({ id: 'test' })),
      Scene.expect(entryZero).toExist(),
      Scene.expect(entryZero).not.toHaveAttr('data-swipe'),
      Scene.expect(entryZero).not.toHaveHandler('pointerdown'),
      Scene.expect(entryZero).not.toHaveStyle('touchAction'),
    )

    scene(
      Scene.given(modelWithEntry({ id: 'test', swipeToDismiss: {} })),
      Scene.expect(entryZero).toHaveHandler('pointerdown'),
      Scene.expect(entryZero).toHaveStyle('touchAction', 'pan-y'),
      Scene.expect(entryZero).not.toHaveAttr('data-swipe'),
    )
  })

  it('anchors the entry wrapper at the viewport corner and docks the card inside it', () => {
    scene(
      Scene.given(modelWithEntry({ id: 'test', swipeToDismiss: {} })),
      Scene.expect(entryZero).toHaveClass('absolute'),
      Scene.expect(entryZero).toHaveClass('right-4'),
      Scene.expect(entryZero).toHaveClass('bottom-4'),
      Scene.expect(entryZero).toHaveClass('data-[swipe=settling]:transition-[translate]'),
      Scene.expect(entryZero).toHaveClass('data-[swipe=end]:transition-[translate]'),
      Scene.expect(entryZero).not.toHaveClass('data-[swipe=move]:transition-[translate]'),
      Scene.expect(entryZero).not.toHaveStyle('right'),
      Scene.expect(entryZero).not.toHaveStyle('bottom'),
      Scene.expect(card).toExist(),
      Scene.expect(card).toHaveClass('absolute'),
      Scene.expect(card).toHaveClass('right-0'),
      Scene.expect(card).toHaveClass('bottom-0'),
      Scene.expect(card).not.toHaveStyle('right'),
      Scene.expect(card).not.toHaveStyle('bottom'),
      Scene.expect(card).toHaveStyle('height', '72px'),
    )
  })

  it('holds the release offset on the wrapper while a rightward swipe dismisses', () => {
    scene(
      Scene.given(modelWithEntry({ id: 'test', swipeToDismiss: {} })),
      Scene.pointerDown(entryZero, { clientX: 100, pointerId: POINTER_ID }),
      Scene.expect(entryZero).toHaveAttr('data-swipe', 'move'),
      Scene.Subscription.emit(
        gotToast(Foldkit.Message.MovedSwipePointer({ pointerId: POINTER_ID, clientX: 200 })),
      ),
      Scene.expect(entryZero).toHaveAttr('data-swipe', 'move'),
      Scene.expect(entryZero).toHaveStyle('translate', '100px'),
      Scene.Subscription.emit(
        gotToast(Foldkit.Message.ReleasedSwipePointer({ pointerId: POINTER_ID, clientX: 200 })),
      ),
      Scene.expect(entryZero).toHaveAttr('data-swipe', 'end'),
      Scene.expect(entryZero).toHaveStyle('translate', '100px'),
      Scene.expect(entryZero).toHaveAttr('data-leave', ''),
      Scene.Command.resolve(Animation.WaitForPaint, Animation.Message.CompletedWaitForPaint()),
      Scene.expect(entryZero).toHaveStyle('translate', '100vw'),
      Scene.Command.resolve(Animation.WaitForAnimationSettled, Animation.Message.EndedAnimation()),
      Scene.expect(entryZero).toBeAbsent(),
    )
  })

  it('settles a short swipe back to rest without leaving', () => {
    scene(
      Scene.given(modelWithEntry({ id: 'test', swipeToDismiss: {} })),
      Scene.pointerDown(entryZero, { clientX: 100, pointerId: POINTER_ID }),
      Scene.Subscription.emit(
        gotToast(Foldkit.Message.MovedSwipePointer({ pointerId: POINTER_ID, clientX: 130 })),
      ),
      Scene.Subscription.emit(
        gotToast(Foldkit.Message.ReleasedSwipePointer({ pointerId: POINTER_ID, clientX: 130 })),
      ),
      Scene.expect(entryZero).toHaveAttr('data-swipe', 'settling'),
      Scene.expect(entryZero).not.toHaveStyle('translate'),
      Scene.expect(entryZero).not.toHaveAttr('data-leave'),
      Scene.Command.resolve(
        WaitForSwipeSettled,
        Foldkit.Message.CompletedWaitForSwipeSettled({
          entryId: ENTRY_ID,
          version: SETTLING_SWIPE_VERSION,
        }),
      ),
      Scene.expect(entryZero).not.toHaveAttr('data-swipe'),
      Scene.expect(entryZero).toExist(),
    )
  })
})
