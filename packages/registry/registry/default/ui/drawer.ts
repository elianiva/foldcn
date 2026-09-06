/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update/subscriptions into your app:
 *  `import * as Drawer from '@/components/ui/drawer'`
 */
import { Effect, Option, Schema as S, Stream } from 'effect'
import { Command, Update } from 'foldkit'
import { Dialog as FoldkitDialog } from '@foldkit/ui'
import type { Attribute, ChildAttribute, Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView } from 'foldkit/submodel'
import { evo } from 'foldkit/struct'
import * as Subscription from 'foldkit/subscription'

import { cn } from '@/lib/utils'

type Child = Html | string

// A drawer is a Dialog variant docked to a viewport edge with a drag handle,
// mirroring the shadcn base `drawer` (Base UI) surface: swipeDirection,
// showSwipeHandle, and drag-to-dismiss live here. Snap points, nested stacks,
// and non-modal drawers are still out of scope (see the gaps note below).
//
// Drag is a model-owned gesture, not a view effect. Pressing the handle
// enters Dragging; document-level pointermove/pointerup streams (the slider
// precedent) feed MovedPointer/ReleasedPointer; release past
// DISMISS_THRESHOLD_PX closes the nested dialog, anything shorter snaps back.
// While dragging the panel translates via the inline `translate` CSS property
// (kept separate from the token's `transform` string) and the overlay fades
// through the upstream `--drawer-swipe-progress` variable.

export const SwipeDirection = S.Literals(['up', 'right', 'down', 'left'])
export type SwipeDirection = typeof SwipeDirection.Type

const swipeAxis = (direction: SwipeDirection): 'x' | 'y' =>
  direction === 'up' || direction === 'down' ? 'y' : 'x'

const dismissSign = (direction: SwipeDirection): 1 | -1 =>
  direction === 'up' || direction === 'left' ? -1 : 1

export const DragState = S.Struct({
  activity: S.Literals(['Idle', 'Dragging']),
  originX: S.Number,
  originY: S.Number,
  offset: S.Number,
})
export type DragState = typeof DragState.Type

export const Model = S.Struct({
  id: S.String,
  dialog: FoldkitDialog.Model,
  swipeDirection: SwipeDirection,
  isHandleVisible: S.Boolean,
  drag: DragState,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  GotDialogMessage: { message: FoldkitDialog.Message },
  PressedHandle: { clientX: S.Number, clientY: S.Number },
  MovedPointer: { clientX: S.Number, clientY: S.Number },
  ReleasedPointer: {},
  CancelledDrag: {},
})
export type Message = typeof Message.Type

export const OutMessage = FoldkitDialog.OutMessage
export type OutMessage = typeof OutMessage.Type

export type InitConfig = Readonly<{
  id: string
  swipeDirection?: SwipeDirection
  /** When true, the view renders the grab handle that starts the drag gesture. */
  isHandleVisible?: boolean
  isOpen?: boolean
  focusSelector?: string
}>

const idleDrag = (): DragState => ({ activity: 'Idle', originX: 0, originY: 0, offset: 0 })

export const init = (config: InitConfig): Model => ({
  id: config.id,
  dialog: FoldkitDialog.init({
    id: config.id,
    isAnimated: true,
    isOpen: config.isOpen ?? false,
    // oxlint-disable-next-line anti-slop/no-conditional-empty-object-spread
    ...(config.focusSelector === undefined ? {} : { focusSelector: config.focusSelector }),
  }),
  swipeDirection: config.swipeDirection ?? 'down',
  isHandleVisible: config.isHandleVisible ?? false,
  drag: idleDrag(),
})

/** Release offset in px that dismisses the drawer. Anything shorter snaps back. */
export const DISMISS_THRESHOLD_PX = 96

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const liftDialogReturn = (
  model: Model,
  result: Update.ReturnWithOutMessage<
    typeof FoldkitDialog.Model.Type,
    typeof FoldkitDialog.Message.Type,
    OutMessage
  >,
): UpdateReturn => {
  const next = {
    model: evo(model, { dialog: () => result.model }),
    commands: Command.mapMessages(result.commands ?? [], (message) =>
      Message.GotDialogMessage({ message }),
    ),
  }
  return result.outMessage === undefined ? next : { ...next, outMessage: result.outMessage }
}

/** Processes a Drawer Message. Dialog traffic routes to the nested dialog and
 *  any dialog close also parks an in-flight drag, so backdrop/Esc dismissal
 *  can never strand the panel mid-translate. */
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'GotDialogMessage': {
      const result = liftDialogReturn(model, FoldkitDialog.update(model.dialog, message.message))
      return result.outMessage?._tag === 'Closed'
        ? { ...result, model: evo(result.model, { drag: () => idleDrag() }) }
        : result
    }
    case 'PressedHandle': {
      if (!model.dialog.isOpen) return { model }
      return {
        model: evo(model, {
          drag: () => ({
            activity: 'Dragging' as const,
            originX: message.clientX,
            originY: message.clientY,
            offset: 0,
          }),
        }),
      }
    }
    case 'MovedPointer': {
      if (model.drag.activity !== 'Dragging') return { model }
      const delta =
        swipeAxis(model.swipeDirection) === 'y'
          ? message.clientY - model.drag.originY
          : message.clientX - model.drag.originX
      return {
        model: evo(model, {
          drag: () => ({
            ...model.drag,
            offset: Math.max(0, dismissSign(model.swipeDirection) * delta),
          }),
        }),
      }
    }
    case 'ReleasedPointer': {
      if (model.drag.activity !== 'Dragging') return { model }
      if (model.drag.offset < DISMISS_THRESHOLD_PX) {
        return { model: evo(model, { drag: () => idleDrag() }) }
      }
      const parked = evo(model, { drag: () => idleDrag() })
      return liftDialogReturn(parked, FoldkitDialog.close(parked.dialog))
    }
    case 'CancelledDrag': {
      return { model: evo(model, { drag: () => idleDrag() }) }
    }
  }
}

export const open = (model: Model): UpdateReturn =>
  liftDialogReturn(model, FoldkitDialog.open(model.dialog))

export const close = (model: Model): UpdateReturn =>
  liftDialogReturn(model, FoldkitDialog.close(model.dialog))

export const titleId = (model: Model): string => FoldkitDialog.titleId(model.dialog)

export const descriptionId = (model: Model): string => FoldkitDialog.descriptionId(model.dialog)

const DragActivity = S.Literals(['Idle', 'Dragging'])

/** Document-level drag streams, gated on an active handle drag. Pointercancel
 *  maps to CancelledDrag: an interrupted gesture snaps back instead of
 *  dismissing on an ambiguous end. */
export const subscriptions = Subscription.make<Model, Message>()((entry) => ({
  dragPointer: entry(
    { dragActivity: DragActivity },
    {
      modelToDependencies: (model) => ({ dragActivity: model.drag.activity }),
      dependenciesToStream: ({ dragActivity }): Stream.Stream<Message> => {
        const pointerEvents = Stream.merge(
          Stream.merge(
            Stream.fromEventListener(document, 'pointermove').pipe(
              Stream.mapEffect((event) =>
                Effect.sync(() => {
                  if (!(event instanceof PointerEvent)) return Option.none()
                  return Option.some(
                    Message.MovedPointer({ clientX: event.clientX, clientY: event.clientY }),
                  )
                }),
              ),
              Stream.filter(Option.isSome),
              Stream.map((option) => option.value),
            ),
            Stream.fromEventListener(document, 'pointerup').pipe(
              Stream.map(() => Message.ReleasedPointer()),
            ),
          ),
          Stream.fromEventListener(document, 'pointercancel').pipe(
            Stream.map(() => Message.CancelledDrag()),
          ),
        )

        const documentDragStyles = Stream.callback(() =>
          Effect.acquireRelease(
            Effect.sync(() => {
              document.documentElement.style.setProperty('user-select', 'none')
              document.documentElement.style.setProperty('-webkit-user-select', 'none')
              const cursorStyle = document.createElement('style')
              cursorStyle.textContent = '* { cursor: grabbing !important; }'
              document.head.appendChild(cursorStyle)
              return cursorStyle
            }),
            (cursorStyle) =>
              Effect.sync(() => {
                document.documentElement.style.removeProperty('user-select')
                document.documentElement.style.removeProperty('-webkit-user-select')
                cursorStyle.remove()
              }),
          ).pipe(Effect.flatMap(() => Effect.never)),
        )

        // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Stream.when widens the element type
        return Stream.when(
          Stream.merge(pointerEvents, documentDragStyles),
          Effect.sync(() => dragActivity === 'Dragging'),
        ) as Stream.Stream<Message>
      },
    },
  ),
  dragEscape: entry(
    { dragActivity: DragActivity },
    {
      modelToDependencies: (model) => ({ dragActivity: model.drag.activity }),
      dependenciesToStream: ({ dragActivity }): Stream.Stream<Message> =>
        // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Stream.when widens the element type
        Stream.when(
          Stream.fromEventListener(document, 'keydown').pipe(
            Stream.filter(
              (event): event is KeyboardEvent =>
                event instanceof KeyboardEvent && event.key === 'Escape',
            ),
            Stream.map(() => Message.CancelledDrag()),
          ),
          Effect.sync(() => dragActivity === 'Dragging'),
        ) as Stream.Stream<Message>,
    },
  ),
}))

// foldcn gaps vs upstream: Base UI's Drawer is a gesture drawer with snap
// points, nested stacks, and swipe-progress-driven overlay opacity. This port
// covers drag-to-dismiss from the handle plus all four swipe directions.
// Snap points, nested stacks, and non-modal drawers stay out of scope: their
// class lines (--stack-*, --peek, data-nested-*, data-snap-points,
// --drawer-swipe-strength, data-starting/ending-style) are dropped below, and
// the swipe-movement vars (--drawer-swipe-movement-x/y,
// --drawer-snap-point-offset) are unused because the drag offset travels on
// the inline `translate` property instead. One frame of style, no token
// string touched. The enter/exit slide reuses the dialog adaptation:
// [data-enter][data-closed] / [data-leave][data-closed] are the faithful
// one-frame equivalents of data-starting-style / data-ending-style, sliding
// the panel from (and back to) --closed-transform via its own transform
// transition.

export const drawerClass = 'bg-transparent p-0 open:block'

/** Upstream DrawerPrimitive.Backdrop string plus the swipe-progress opacity
 *  (live now that the drag owns --drawer-swipe-progress) and the
 *  data-swiping duration cut. The iOS absolute-positioning quirk line is
 *  verbatim; it needs `body { position: relative; }` per the upstream docs. */
export const drawerBackdropClass =
  'cn-drawer-overlay fixed inset-0 z-50 min-h-dvh opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] select-none data-swiping:duration-0 data-enter:data-closed:opacity-0 data-leave:data-closed:opacity-0 supports-[-webkit-touch-callout:none]:absolute'

/** Upstream DrawerPrimitive.Popup string, direction-agnostic lines only: base,
 *  full bleed, sizing (minus the snap-points height line), [--bleed:3rem],
 *  the data-swiping duration cut, and the enter/leave closed-transform slide.
 *  Direction docks in drawerPanelDirectionClass. */
export const drawerPanelBaseClass =
  'cn-drawer-popup group/drawer-popup pointer-events-auto fixed z-50 m-(--drawer-inset,0px) flex h-(--drawer-content-height) max-h-(--drawer-content-max-height,none) min-h-0 w-(--drawer-content-width,auto) transform-[translate3d(var(--translate-x,0px),var(--translate-y,0px),0)_scale(var(--stack-scale))] flex-col transition-[transform,height,opacity,filter] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform outline-none select-none [interpolate-size:allow-keywords] after:pointer-events-none after:absolute after:bg-(--drawer-bleed-background,var(--color-popover)) data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=x]:after:w-(--bleed) data-[swipe-axis=y]:after:inset-x-0 data-[swipe-axis=y]:after:h-(--bleed) data-[swipe-direction=down]:after:top-full data-[swipe-direction=left]:after:right-full data-[swipe-direction=right]:after:left-full data-[swipe-direction=up]:after:bottom-full [--drawer-content-height:var(--drawer-height,auto)] data-[swipe-axis=x]:[--drawer-content-width:75%] data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-6rem)] data-[swipe-axis=x]:sm:[--drawer-content-width:24rem] [--bleed:3rem] data-swiping:duration-0 data-enter:data-closed:transform-(--closed-transform) data-leave:data-closed:transform-(--closed-transform)'

/** Upstream per-direction Popup lines, verbatim: edge dock, transform origin,
 *  closed-transform, plus the axis placement. The --translate movement lines
 *  stay dropped (the drag offset travels on the inline `translate` property). */
export const drawerPanelDirectionClass: Record<SwipeDirection, string> = {
  down: 'data-[swipe-axis=y]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:origin-bottom data-[swipe-direction=down]:[--closed-transform:translate3d(0,calc(100%+var(--drawer-inset,0px)+2px),0)]',
  up: 'data-[swipe-axis=y]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:origin-top data-[swipe-direction=up]:[--closed-transform:translate3d(0,calc(-100%-var(--drawer-inset,0px)-2px),0)]',
  left: 'data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:flex-row data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:origin-left data-[swipe-direction=left]:[--closed-transform:translate3d(calc(-100%-var(--drawer-inset,0px)-2px),0,0)]',
  right:
    'data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:flex-row data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:origin-right data-[swipe-direction=right]:[--closed-transform:translate3d(calc(100%+var(--drawer-inset,0px)+2px),0,0)]',
}

/** Upstream DrawerContent string, verbatim. The group-data-swiping line goes
 *  live during a handle drag (text selection locks while swiping). */
export const drawerContentClass =
  'cn-drawer-content-base flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)] select-text group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-swiping/drawer-popup:select-none'

/** Upstream DrawerSwipeHandle string, verbatim. The order-last lines dock the
 *  handle against the content for left/up drawers. */
export const drawerHandleClass =
  'cn-drawer-swipe-handle relative z-10 flex shrink-0 cursor-grab transition-opacity duration-200 group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-[swipe-direction=left]/drawer-popup:order-last group-data-[swipe-direction=up]/drawer-popup:order-last active:cursor-grabbing'

export const drawerHeaderClass =
  'cn-drawer-header-base flex shrink-0 flex-col group-data-[swipe-axis=y]/drawer-popup:text-center'

export const drawerTitleClass = 'cn-drawer-title cn-font-heading'

export const drawerDescriptionClass = 'cn-drawer-description text-balance'

export const drawerFooterClass = 'cn-drawer-footer-base mt-auto flex shrink-0 flex-col'

/** Upstream DrawerClose is an unstyled passthrough; every base example
 *  styles it as `<Button variant="outline">`. */
export const drawerCloseButtonClass = 'cn-button cn-button-variant-outline cn-button-size-default'

const LEFT_MOUSE_BUTTON = 0

type StyleConfig<M> = Readonly<{
  className?: string
  /** Submodel-provided attributes (from the `styledViewInputs` content
   *  callback render bundle) to merge onto the element. */
  attributes?: ReadonlyArray<Attribute<M> | ChildAttribute>
}>

/** Grab handle (upstream DrawerSwipeHandle; aria-hidden). Starts the
 *  drag-to-dismiss gesture on pointer press; touch scrolling is locked to the
 *  handle so a touch drag moves the panel instead of the page. Rendered by
 *  the view when `isHandleVisible` is set. It carries a Drawer message, so
 *  it can only be built with this module's builder. */
export const handle = (config: StyleConfig<Message>, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.AriaHidden(true),
      h.DataAttribute('slot', 'drawer-swipe-handle'),
      h.Class(cn(drawerHandleClass, config.className)),
      h.Style({ 'touch-action': 'none' }),
      h.OnPointerDown((pointerType, button, _screenX, _screenY, _timeStamp, clientX, clientY) =>
        pointerType === 'mouse' && button !== LEFT_MOUSE_BUTTON
          ? Option.none()
          : Option.some(Message.PressedHandle({ clientX, clientY })),
      ),
      ...(config.attributes ?? []),
    ],
    [],
  )

export const header = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'drawer-header'), h.Class(cn(drawerHeaderClass, config.className))],
    children,
  )

export const title = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.h2(
    [
      ...(config.attributes ?? []),
      h.DataAttribute('slot', 'drawer-title'),
      h.Class(cn(drawerTitleClass, config.className)),
    ],
    children,
  )

export const description = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.p(
    [
      ...(config.attributes ?? []),
      h.DataAttribute('slot', 'drawer-description'),
      h.Class(cn(drawerDescriptionClass, config.className)),
    ],
    children,
  )

export const footer = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'drawer-footer'), h.Class(cn(drawerFooterClass, config.className))],
    children,
  )

export const closeButton = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.button(
    [
      ...(config.attributes ?? []),
      h.DataAttribute('slot', 'drawer-close'),
      h.Class(cn(drawerCloseButtonClass, config.className)),
    ],
    children,
  )

export type DrawerContent<M> = Readonly<{
  closeButton: ReadonlyArray<Attribute<M> | ChildAttribute>
  title: ReadonlyArray<Attribute<M> | ChildAttribute>
  description: ReadonlyArray<Attribute<M> | ChildAttribute>
}>

export type StyledViewInputs<M> = Readonly<{
  content: (render: DrawerContent<M>, h: HtmlBuilder<M>) => ReadonlyArray<Child>
  className?: string
  backdropClass?: string
  panelClass?: string
}>

/** Render payload Drawer.view feeds its `toView`: the dialog bundles, the
 *  swipe direction, the live drag position, and the prebuilt grab handle. */
export type RenderInput = FoldkitDialog.RenderInfo &
  Readonly<{
    direction: SwipeDirection
    dragOffset: number
    isDragging: boolean
    handle: Html
  }>

export type ViewInputs = Readonly<{
  toView: (render: RenderInput) => Html
}>

/** Renders the drawer by nesting the Dialog submodel. The shell (direction
 *  dock, drag translate, overlay progress) builds in the parent's `toView`,
 *  usually via `styledViewInputs`. */
export const view = defineView<Model, Message, ViewInputs>((model, viewInputs, h) =>
  h.submodel({
    slotId: `${model.id}-dialog`,
    model: model.dialog,
    view: FoldkitDialog.view,
    viewInputs: {
      toView: (render) =>
        viewInputs.toView({
          ...render,
          direction: model.swipeDirection,
          dragOffset: model.drag.offset,
          isDragging: model.drag.activity === 'Dragging',
          handle: model.isHandleVisible ? handle({}, h) : h.empty,
        }),
    },
    toParentMessage: (message) => Message.GotDialogMessage({ message }),
  }),
)

/** Build styled `ViewInputs` for the drawer. Direction and drag position
 *  arrive from the model through `RenderInput`, so the shell always matches
 *  the gesture state with no extra wiring. */
export const styledViewInputs = <M>(
  viewInputs: StyledViewInputs<M>,
  h: HtmlBuilder<M>,
): ViewInputs => ({
  toView: ({
    dialog,
    backdrop,
    panel,
    closeButton,
    title,
    description,
    isVisible,
    direction,
    dragOffset,
    isDragging,
    handle,
  }) =>
    h.dialog(
      [
        ...dialog,
        h.DataAttribute('slot', 'drawer'),
        h.Class(cn(drawerClass, viewInputs.className)),
      ],
      isVisible
        ? [
            h.div([
              ...backdrop,
              h.DataAttribute('slot', 'drawer-overlay'),
              h.Class(cn(drawerBackdropClass, viewInputs.backdropClass)),
              ...(isDragging && dragOffset > 0
                ? [
                    h.Style({
                      '--drawer-swipe-progress': `${String(Math.min(1, dragOffset / DISMISS_THRESHOLD_PX))}`,
                    }),
                  ]
                : []),
            ]),
            h.div(
              [
                ...panel,
                h.DataAttribute('slot', 'drawer-popup'),
                h.DataAttribute('swipe-direction', direction),
                h.DataAttribute('swipe-axis', swipeAxis(direction)),
                h.Class(
                  cn(
                    drawerPanelBaseClass,
                    drawerPanelDirectionClass[direction],
                    viewInputs.panelClass,
                  ),
                ),
                ...(isDragging ? [h.DataAttribute('swiping', '')] : []),
                ...(isDragging && dragOffset > 0
                  ? [
                      h.Style({
                        translate:
                          swipeAxis(direction) === 'y'
                            ? `0 ${String(dragOffset)}px`
                            : `${String(dragOffset)}px 0`,
                      }),
                    ]
                  : []),
              ],
              [
                handle,
                h.div(
                  [h.DataAttribute('slot', 'drawer-content'), h.Class(drawerContentClass)],
                  viewInputs.content({ closeButton, title, description }, h),
                ),
              ],
            ),
          ]
        : [],
    ),
})
