/** Hover card — opens on pointer hover (200ms) and closes after 300ms grace; focus opens immediately.
 *  The styled surface matches upstream shadcn; hover-intent/grace is implemented via
 *  200/300ms delays and hover-zone handlers (trigger + panel). */
/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as HoverCard from '@/components/ui/hover-card'`
 */
import { Duration, Effect, Match as M, Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import type { AnchorConfig } from '@foldkit/ui/anchor'
import { Popover as FoldkitPopover } from '@foldkit/ui'
import { childAttributes, type ChildAttribute } from 'foldkit/html'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { evo } from 'foldkit/struct'
import { defineView } from 'foldkit/submodel'
import * as Update from 'foldkit/update'

type Child = Html | string

import { cn } from '@/lib/utils'

// A real hover card: opens on pointer hover (after `openDelay`), stays open
// while the pointer crosses the trigger-to-panel gap or moves into the panel,
// and closes after `closeDelay` once the pointer leaves both. Keyboard users
// get the same card via trigger focus. Built by embedding the @foldkit/ui
// Popover submodel — it supplies positioning (Floating UI), the enter/leave
// animation lifecycle, and Escape handling; this module adds the hover state
// machine and renders the popover headlessly (no backdrop, no click toggle).

export const Model = S.Struct({
  popover: FoldkitPopover.Model,
  isPointerOverCard: S.Boolean,
  isTriggerFocused: S.Boolean,
  pendingShowVersion: S.Number,
  pendingHideVersion: S.Number,
  openDelay: S.DurationFromMillis,
  closeDelay: S.DurationFromMillis,
})
export type Model = typeof Model.Type

const DEFAULT_OPEN_DELAY_MS = 200
const DEFAULT_CLOSE_DELAY_MS = 300

export const Message = defineMessageUnion({
  EnteredHoverZone: {},
  LeftHoverZone: {},
  FocusedTrigger: {},
  BlurredTrigger: {},
  PressedEscape: {},
  CompletedWaitBeforeShow: { version: S.Number },
  CompletedWaitBeforeHide: { version: S.Number },
  GotPopoverMessage: { message: FoldkitPopover.Message },
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  Opened: {},
  Closed: {},
})
export type OutMessage = typeof OutMessage.Type

export type InitConfig = Readonly<{
  id: string
  openDelay?: Duration.Input
  closeDelay?: Duration.Input
  isAnimated?: boolean
}>

/** Creates an initial hover-card model from a config. Defaults to closed,
 *  200ms open delay, 300ms close delay, animated. */
export const init = (config: InitConfig): Model => ({
  popover: FoldkitPopover.init({
    id: config.id,
    isAnimated: config.isAnimated ?? true,
    contentFocus: true,
  }),
  isPointerOverCard: false,
  isTriggerFocused: false,
  pendingShowVersion: 0,
  pendingHideVersion: 0,
  openDelay:
    config.openDelay === undefined
      ? Duration.millis(DEFAULT_OPEN_DELAY_MS)
      : Duration.fromInputUnsafe(config.openDelay),
  closeDelay:
    config.closeDelay === undefined
      ? Duration.millis(DEFAULT_CLOSE_DELAY_MS)
      : Duration.fromInputUnsafe(config.closeDelay),
})

export const HOVER_CARD_ANCHOR: AnchorConfig = {
  placement: 'bottom',
  gap: 4,
  padding: 8,
}

export const hoverCardTriggerClass =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 underline-offset-4 hover:underline'

export const hoverCardContentClass =
  'cn-hover-card-content cn-hover-card-content-logical z-50 origin-(--transform-origin) outline-hidden'

/** Kept for backward compatibility — animations now live in the token. */
export const hoverCardContentAnimatedClass = hoverCardContentClass

export const hoverCardWrapperClass = 'relative inline-block'

export const hoverCardHeaderClass = 'cn-popover-header'

export const hoverCardTitleClass = 'cn-popover-title'

export const hoverCardDescriptionClass = 'cn-popover-description'

type StyleConfig = Readonly<{ className?: string }>

export const header = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'hover-card-header'),
      h.Class(cn(hoverCardHeaderClass, config.className)),
    ],
    children,
  )

export const title = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'hover-card-title'),
      h.Class(cn(hoverCardTitleClass, config.className)),
    ],
    children,
  )

export const description = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.p(
    [
      h.DataAttribute('slot', 'hover-card-description'),
      h.Class(cn(hoverCardDescriptionClass, config.className)),
    ],
    children,
  )

// Kept for API parity with other registry items. The trigger is the embedded
// popover's button.
export const buttonId = FoldkitPopover.buttonId

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

/** Waits for the open delay before emitting `CompletedWaitBeforeShow`.
 *  Stale invocations are filtered by version in update. */
const WaitBeforeShow = Command.define('WaitBeforeShow', {
  args: { delay: S.DurationFromMillis, version: S.Number },
  messages: [Message.CompletedWaitBeforeShow],
  execute: ({ delay, version }) =>
    Effect.sleep(delay).pipe(Effect.as(Message.CompletedWaitBeforeShow({ version }))),
})

/** Waits for the close delay before emitting `CompletedWaitBeforeHide`.
 *  This grace period is what lets the pointer cross the trigger-to-panel
 *  gap without closing the card. */
const WaitBeforeHide = Command.define('WaitBeforeHide', {
  args: { delay: S.DurationFromMillis, version: S.Number },
  messages: [Message.CompletedWaitBeforeHide],
  execute: ({ delay, version }) =>
    Effect.sleep(delay).pipe(Effect.as(Message.CompletedWaitBeforeHide({ version }))),
})

const isOpen = (model: Model): boolean => model.popover.isOpen

const toGotPopoverMessage = (message: FoldkitPopover.Message): Message =>
  Message.GotPopoverMessage({ message })

const foldPopover = Update.foldChild({
  update: FoldkitPopover.update,
  read: (model: Model) => Option.some(model.popover),
  write: (model, nextPopover) => evo(model, { popover: () => nextPopover }),
  toParentMessage: toGotPopoverMessage,
  toParentOutMessage: (outMessage: FoldkitPopover.OutMessage): OutMessage =>
    outMessage._tag === 'Opened' ? OutMessage.Opened() : OutMessage.Closed(),
})

const scheduleShow = (model: Model): UpdateReturn => {
  const version = model.pendingShowVersion + 1
  return {
    model: evo(model, { pendingShowVersion: () => version }),
    commands: [WaitBeforeShow({ delay: model.openDelay, version })],
  }
}

const scheduleHide = (model: Model): UpdateReturn => {
  const version = model.pendingHideVersion + 1
  return {
    model: evo(model, { pendingHideVersion: () => version }),
    commands: [WaitBeforeHide({ delay: model.closeDelay, version })],
  }
}

const openNow = (model: Model): UpdateReturn => {
  const { model: nextPopover, commands: popoverCommands = [] } = FoldkitPopover.open(model.popover)
  return {
    model: evo(model, { popover: () => nextPopover }),
    commands: Command.mapMessages(popoverCommands, toGotPopoverMessage),
    outMessage: OutMessage.Opened(),
  }
}

const closeNow = (model: Model): UpdateReturn => {
  // Close through update rather than `FoldkitPopover.close`, then drop the
  // FocusButton command: a pointer- or blur-driven dismissal must not yank
  // focus back to the trigger — the returned focus would fire FocusedTrigger
  // and immediately re-open the card.
  const { model: nextPopover, commands: popoverCommands = [] } = FoldkitPopover.update(
    model.popover,
    FoldkitPopover.Message.RequestedClose(),
  )
  return {
    model: evo(model, { popover: () => nextPopover }),
    commands: Command.mapMessages(
      popoverCommands.filter((command) => command.name !== 'FocusButton'),
      toGotPopoverMessage,
    ),
    outMessage: OutMessage.Closed(),
  }
}

const withUpdateReturn = M.withReturnType<UpdateReturn>()

/** Processes a hover-card message and returns the next model, commands, and
 *  an optional OutMessage. `Opened`/`Closed` fire only on visibility
 *  transitions. */
export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    withUpdateReturn,
    M.tagsExhaustive({
      EnteredHoverZone: () => {
        // Re-entering cancels any pending close.
        const entered = evo(model, {
          isPointerOverCard: () => true,
          pendingHideVersion: () => model.pendingHideVersion + 1,
        })
        if (isOpen(entered)) {
          return { model: entered }
        }
        return scheduleShow(entered)
      },
      LeftHoverZone: () => {
        const left = evo(model, {
          isPointerOverCard: () => false,
          pendingShowVersion: () => model.pendingShowVersion + 1,
        })
        // Focus keeps the card open until blur.
        if (!isOpen(left) || left.isTriggerFocused) {
          return { model: left }
        }
        return scheduleHide(left)
      },
      FocusedTrigger: () => {
        const focused = evo(model, {
          isTriggerFocused: () => true,
          pendingShowVersion: () => model.pendingShowVersion + 1,
          pendingHideVersion: () => model.pendingHideVersion + 1,
        })
        if (isOpen(focused)) {
          return { model: focused }
        }
        // Focus opens immediately, without the hover delay.
        return openNow(focused)
      },
      BlurredTrigger: () => {
        const blurred = evo(model, {
          isTriggerFocused: () => false,
          pendingShowVersion: () => model.pendingShowVersion + 1,
        })
        // Hover keeps the card open until leave.
        if (!isOpen(blurred) || blurred.isPointerOverCard) {
          return { model: blurred }
        }
        return scheduleHide(blurred)
      },
      PressedEscape: () =>
        closeNow(
          evo(model, {
            pendingShowVersion: () => model.pendingShowVersion + 1,
            pendingHideVersion: () => model.pendingHideVersion + 1,
          }),
        ),
      CompletedWaitBeforeShow: ({ version }) => {
        if (version !== model.pendingShowVersion || !model.isPointerOverCard || isOpen(model)) {
          return { model }
        }
        return openNow(model)
      },
      CompletedWaitBeforeHide: ({ version }) => {
        if (version !== model.pendingHideVersion || model.isPointerOverCard || !isOpen(model)) {
          return { model }
        }
        return closeNow(model)
      },
      GotPopoverMessage: ({ message: popoverMessage }) => foldPopover(model, popoverMessage),
    }),
  )

/** Programmatically opens the hover card, cancelling pending timers. */
export const open = (model: Model): UpdateReturn =>
  openNow(
    evo(model, {
      pendingShowVersion: () => model.pendingShowVersion + 1,
      pendingHideVersion: () => model.pendingHideVersion + 1,
    }),
  )

/** Programmatically closes the hover card, cancelling pending timers. */
export const close = (model: Model): UpdateReturn =>
  closeNow(
    evo(model, {
      pendingShowVersion: () => model.pendingShowVersion + 1,
      pendingHideVersion: () => model.pendingHideVersion + 1,
    }),
  )

export type ViewInputs = Readonly<{
  anchor: AnchorConfig
  toView: (render: RenderInfo) => Html
  isDisabled?: boolean
  ariaLabel?: string
  ariaLabelledBy?: string
}>

/** Render-time payload published to the consumer's `toView`.
 *
 *  - `trigger`: attribute bundle for the trigger button. Carries the
 *    hover/focus handlers and ARIA linkage to the panel. Click-toggle
 *    handlers are stripped: a hover card opens on hover/focus only.
 *  - `panel`: attribute bundle for the floating interactive panel. Carries
 *    the anchor Mount (Floating UI positioning), animation lifecycle
 *    attributes, Escape handling, and the hover-zone handlers that keep the
 *    card open while the pointer is over the panel.
 *  - `isVisible`: derived from the popover's open state and leave-animation
 *    lifecycle. Render the panel only while this is true. */
export type RenderInfo = Readonly<{
  trigger: ReadonlyArray<ChildAttribute>
  panel: ReadonlyArray<ChildAttribute>
  isVisible: boolean
}>

/** The popover's button bundle toggles on press/click — right for a popover,
 *  wrong for a hover card. Strip those handlers so clicking the trigger does
 *  nothing (matching shadcn), keeping keyboard activation. */
const withoutClickToggle = (button: ReadonlyArray<ChildAttribute>): ReadonlyArray<ChildAttribute> =>
  button.filter((wrapped) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const tag = (wrapped.attribute as { readonly _tag?: string } | undefined)?._tag
    return tag !== 'OnPointerDown' && tag !== 'OnClick'
  })

/** Renders the hover card headlessly by embedding the Popover submodel. */
export const view = defineView<Model, Message, ViewInputs>((model, viewInputs, h) => {
  const { anchor, toView, isDisabled, ariaLabel, ariaLabelledBy } = viewInputs

  const hoverZoneHandlers = isDisabled
    ? []
    : [h.OnMouseEnter(Message.EnteredHoverZone()), h.OnMouseLeave(Message.LeftHoverZone())]
  const triggerFocusHandlers = isDisabled
    ? []
    : [
        h.OnFocus(Message.FocusedTrigger()),
        h.OnBlur(Message.BlurredTrigger()),
        h.OnKeyDownPreventDefault((key) =>
          key === 'Escape' && model.popover.isOpen
            ? Option.some(Message.PressedEscape())
            : Option.none(),
        ),
      ]

  return h.submodel({
    slotId: model.popover.id,
    model: model.popover,
    view: FoldkitPopover.view,
    viewInputs: {
      anchor,
      ...(isDisabled !== undefined && { isDisabled }),
      ...(ariaLabel !== undefined && { ariaLabel }),
      ...(ariaLabelledBy !== undefined && { ariaLabelledBy }),
      toView: ({ button, panel, isVisible }) =>
        toView({
          // The popover's bundles are already boundary-wrapped; only our own
          // attributes need wrapping, so the two arrays are concatenated.
          trigger: [
            ...withoutClickToggle(button),
            ...childAttributes([
              h.AriaDescribedBy(`${model.popover.id}-panel`),
              h.DataAttribute('slot', 'hover-card-trigger'),
              ...triggerFocusHandlers,
              ...hoverZoneHandlers,
            ]),
          ],
          panel: [
            ...panel,
            ...childAttributes([
              h.DataAttribute('slot', 'hover-card-content'),
              ...hoverZoneHandlers,
            ]),
          ],
          isVisible,
        }),
    },
    toParentMessage: toGotPopoverMessage,
  })
})

export type StyledViewInputs = Readonly<{
  anchor?: AnchorConfig
  /** Trigger button face. */
  trigger: Child
  /** Panel content. */
  content: ReadonlyArray<Child>
  isDisabled?: boolean
  ariaLabel?: string
  ariaLabelledBy?: string
  className?: string
  triggerClass?: string
  contentClass?: string
  wrapperClass?: string
  isAnimated?: boolean
}>

/** Build styled `ViewInputs` for the hover card. Pass your view's `h` so the
 *  trigger and content can dispatch your app's own messages. */
export const styledViewInputs = <AppMessage>(
  viewInputs: StyledViewInputs,
  h: HtmlBuilder<AppMessage>,
): ViewInputs => ({
  anchor: viewInputs.anchor ?? HOVER_CARD_ANCHOR,
  isDisabled: viewInputs.isDisabled,
  ariaLabel: viewInputs.ariaLabel,
  ariaLabelledBy: viewInputs.ariaLabelledBy,
  toView: ({ trigger, panel, isVisible }) =>
    h.div(
      [
        h.Class(cn(hoverCardWrapperClass, viewInputs.wrapperClass)),
        h.DataAttribute('slot', 'hover-card'),
      ],
      [
        h.button(
          [...trigger, h.Class(cn(hoverCardTriggerClass, viewInputs.triggerClass))],
          [viewInputs.trigger],
        ),
        ...(isVisible
          ? [
              h.div(
                [
                  ...panel,
                  h.Class(
                    cn(
                      viewInputs.isAnimated !== false
                        ? hoverCardContentAnimatedClass
                        : hoverCardContentClass,
                      viewInputs.contentClass,
                    ),
                  ),
                ],
                viewInputs.content,
              ),
            ]
          : []),
      ],
    ),
})
