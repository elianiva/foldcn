/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as HoverCard from '@/components/ui/hover-card'`
 */
import { HoverIntent, Popover as FoldkitPopover } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/anchor'
import { Duration, Match as M, Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { childAttributes, type ChildAttribute, type Html, type HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { modifyFields } from 'foldkit/struct'
import { defineView } from 'foldkit/submodel'
import * as Update from 'foldkit/update'

import { cn } from '@/lib/utils'

type Child = Html | string

/** HoverIntent owns delayed pointer/focus engagement; Popover supplies the
 * floating anchor and enter/leave lifecycle. */
export const Model = S.Struct({
  hoverIntent: HoverIntent.Model,
  popover: FoldkitPopover.Model,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  GotHoverIntentMessage: { message: HoverIntent.Message },
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

export const init = (config: InitConfig): Model => ({
  hoverIntent: HoverIntent.init({
    openDelay: config.openDelay,
    closeDelay: config.closeDelay,
  }),
  popover: FoldkitPopover.init({
    id: config.id,
    isAnimated: config.isAnimated ?? true,
    contentFocus: true,
  }),
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

export const buttonId = FoldkitPopover.buttonId

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const toGotHoverIntentMessage = (message: HoverIntent.Message): Message =>
  Message.GotHoverIntentMessage({ message })

const toGotPopoverMessage = (message: FoldkitPopover.Message): Message =>
  Message.GotPopoverMessage({ message })

const mapPopoverCommands = (
  commands: NonNullable<ReturnType<typeof FoldkitPopover.open>['commands']> = [],
) =>
  Command.mapMessages(
    commands.filter((command) => command.name !== 'FocusButton'),
    toGotPopoverMessage,
  )

const syncPopover = (
  model: Model,
  operation: typeof FoldkitPopover.open | typeof FoldkitPopover.close,
  outMessage: OutMessage,
): UpdateReturn => {
  const result = operation(model.popover)
  return {
    model: modifyFields(model, { popover: () => result.model }),
    commands: mapPopoverCommands(result.commands),
    outMessage,
  }
}

const foldHoverIntentOutMessage = M.type<HoverIntent.OutMessage>().pipe(
  M.withReturnType<Update.StepWithOutMessage<Model, Message, OutMessage>>(),
  M.tagsExhaustive({
    Opened: () => (model) => syncPopover(model, FoldkitPopover.open, OutMessage.Opened()),
    Closed: () => (model) => syncPopover(model, FoldkitPopover.close, OutMessage.Closed()),
  }),
)

const foldHoverIntent = Update.foldChild({
  update: HoverIntent.update,
  read: (model: Model) => Option.some(model.hoverIntent),
  write: (model, hoverIntent) => modifyFields(model, { hoverIntent: () => hoverIntent }),
  toParentMessage: toGotHoverIntentMessage,
  foldOutMessage: foldHoverIntentOutMessage,
})

const releaseTriggerFocus = (model: Model): Model =>
  modifyFields(model, {
    hoverIntent: (hoverIntent) =>
      modifyFields(hoverIntent, {
        maybeFocusLocation: () =>
          Option.filter(hoverIntent.maybeFocusLocation, (location) => location !== 'Trigger'),
      }),
  })

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      GotHoverIntentMessage: ({ message: hoverIntentMessage }) =>
        hoverIntentMessage._tag === 'FocusedPanel' || hoverIntentMessage._tag === 'BlurredPanel'
          ? { model }
          : foldHoverIntent(
              hoverIntentMessage._tag === 'LeftTrigger' ? releaseTriggerFocus(model) : model,
              hoverIntentMessage,
            ),
      GotPopoverMessage: ({ message: popoverMessage }) => {
        const result = FoldkitPopover.update(model.popover, popoverMessage)
        const hoverIntent =
          popoverMessage._tag === 'RequestedClose'
            ? HoverIntent.close(model.hoverIntent)
            : { model: model.hoverIntent }
        const base = {
          model: modifyFields(model, {
            hoverIntent: () => hoverIntent.model,
            popover: () => result.model,
          }),
          commands: mapPopoverCommands(result.commands),
        }
        if (hoverIntent.outMessage === undefined) return base
        return { ...base, outMessage: hoverIntent.outMessage }
      },
    }),
  )

export type ViewInputs = Readonly<{
  anchor: AnchorConfig
  toView: (render: RenderInfo) => Html
  isDisabled?: boolean
  ariaLabel?: string
  ariaLabelledBy?: string
}>

export type RenderInfo = Readonly<{
  trigger: ReadonlyArray<ChildAttribute>
  panel: ReadonlyArray<ChildAttribute>
  backdrop: ReadonlyArray<ChildAttribute>
  isVisible: boolean
}>

/** Popover has click-toggle handlers; HoverIntent exclusively owns interaction. */
const withoutPopoverInteractions = (
  attributes: ReadonlyArray<ChildAttribute>,
): ReadonlyArray<ChildAttribute> =>
  attributes.filter((wrapped) => {
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: foldkit attribute._tag
    const tag = (wrapped.attribute as { readonly _tag?: string } | undefined)?._tag
    return ![
      'OnPointerDown',
      'OnClick',
      'OnKeyDownPreventDefault',
      'OnKeyUpPreventDefault',
    ].includes(tag ?? '')
  })

export const view = defineView<Model, Message, ViewInputs>((model, viewInputs, h) => {
  const { anchor, toView, isDisabled, ariaLabel, ariaLabelledBy } = viewInputs

  return h.submodel({
    slotId: `${model.popover.id}-hover-intent`,
    model: model.hoverIntent,
    view: HoverIntent.view,
    viewInputs: {
      focusTriggerSelector: `#${FoldkitPopover.buttonId(model.popover.id)}`,
      toView: ({ trigger, panel }) =>
        h.submodel({
          slotId: `${model.popover.id}-popover`,
          model: model.popover,
          view: FoldkitPopover.view,
          viewInputs: {
            anchor,
            // oxlint-disable-next-line anti-slop/no-conditional-empty-object-spread
            ...(isDisabled === undefined ? {} : { isDisabled }),
            // oxlint-disable-next-line anti-slop/no-conditional-empty-object-spread
            ...(ariaLabel === undefined ? {} : { ariaLabel }),
            // oxlint-disable-next-line anti-slop/no-conditional-empty-object-spread
            ...(ariaLabelledBy === undefined ? {} : { ariaLabelledBy }),
            toView: ({ button, panel: popoverPanel, backdrop, isVisible }) =>
              toView({
                trigger: [
                  ...withoutPopoverInteractions(button),
                  ...(isDisabled ? [] : trigger),
                  ...childAttributes([
                    h.AriaDescribedBy(`${model.popover.id}-panel`),
                    h.DataAttribute('slot', 'hover-card-trigger'),
                  ]),
                ],
                panel: [
                  ...withoutPopoverInteractions(popoverPanel),
                  ...(isDisabled ? [] : panel),
                  ...childAttributes([h.DataAttribute('slot', 'hover-card-content')]),
                ],
                backdrop: [
                  ...withoutPopoverInteractions(backdrop),
                  ...childAttributes([
                    h.OnClick(
                      Message.GotPopoverMessage({
                        message: FoldkitPopover.Message.RequestedClose(),
                      }),
                    ),
                    h.DataAttribute('slot', 'hover-card-backdrop'),
                  ]),
                ],
                isVisible,
              }),
          },
          toParentMessage: toGotPopoverMessage,
        }),
    },
    toParentMessage: toGotHoverIntentMessage,
  })
})

export type StyledViewInputs = Readonly<{
  anchor?: AnchorConfig
  trigger: Child
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

export const styledViewInputs = <AppMessage>(
  viewInputs: StyledViewInputs,
  h: HtmlBuilder<AppMessage>,
): ViewInputs => ({
  anchor: viewInputs.anchor ?? HOVER_CARD_ANCHOR,
  isDisabled: viewInputs.isDisabled,
  ariaLabel: viewInputs.ariaLabel,
  ariaLabelledBy: viewInputs.ariaLabelledBy,
  toView: ({ trigger, panel, backdrop, isVisible }) =>
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
              h.div([...backdrop, h.Class('fixed inset-0 z-0')]),
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
