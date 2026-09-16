/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as ScrollArea from '@/components/ui/scroll-area'`
 */
import { Effect, Option, Queue, Schema as S, Stream } from 'effect'
import * as Command from 'foldkit/command'
import type { Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineTaggedUnion } from 'foldkit/schema'
import { defineView } from 'foldkit/submodel'
import * as Subscription from 'foldkit/subscription'
import * as Update from 'foldkit/update'
import { evo } from 'foldkit/struct'

import { cn } from '@/lib/utils'

// Scroll-area has no @foldkit/ui primitive, so the scroll engine lives here:
// the viewport scrolls natively on both axes with its native scrollbars hidden
// (cn-compat.css), and the custom scrollbar/thumb are overlay elements driven
// by a metrics submodel. A viewport-level subscription streams scroll +
// ResizeObserver measurements into the model; the view derives thumb size and
// offset with the same geometry Base UI uses (MIN_THUMB_SIZE floor, p-px
// padding budget). Thumb drags map pointer deltas onto scrollTop/scrollLeft
// through the ApplyScroll command; track clicks jump to the pointer through
// ScrollToPointer.
//
// foldcn gaps vs upstream: wheel events over the scrollbar don't scroll the
// viewport (foldkit's OnWheel carries no delta payload), the horizontal
// scrollbar has no RTL mirroring (LTR geometry only), and a track press jumps
// without continuing into a drag (dragging starts on the thumb only).

/** Upstream ScrollArea root string. `cn-scroll-area` is a no-op hook upstream
 *  too — the root only needs its position context, which `relative` carries. */
export const scrollAreaClass = 'cn-scroll-area relative'

/** Upstream Viewport string. `cn-scroll-area-viewport` is a no-op hook
 *  upstream (the primitive hides native scrollbars itself); foldkit has no
 *  primitive, so the viewport behavior (hidden native scrollbars + two-axis
 *  native scrolling) is carried by the token's cn-compat.css definition. */
export const scrollAreaViewportClass =
  'cn-scroll-area-viewport size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1'

/** Upstream Scrollbar string. */
export const scrollAreaScrollbarClass =
  'cn-scroll-area-scrollbar flex touch-none p-px transition-colors select-none'

/** Upstream Thumb string. */
export const scrollAreaThumbClass = 'cn-scroll-area-thumb relative flex-1 bg-border'

const SCROLLBAR_PAD_PX = 1
const MIN_THUMB_SIZE_PX = 16
const CORNER_SIZE_PX = 10

export type ScrollAxis = 'vertical' | 'horizontal'

export type ScrollMetrics = Readonly<{
  scrollTop: number
  scrollLeft: number
  scrollHeight: number
  scrollWidth: number
  clientHeight: number
  clientWidth: number
}>

export type ScrollGeometry = Readonly<{
  hasOverflow: boolean
  thumbSizePx: number
  thumbOffsetPx: number
  maxScroll: number
  maxThumbOffsetPx: number
}>

const zeroMetrics: ScrollMetrics = {
  scrollTop: 0,
  scrollLeft: 0,
  scrollHeight: 0,
  scrollWidth: 0,
  clientHeight: 0,
  clientWidth: 0,
}

/** Thumb size/position for one axis, mirroring Base UI's `computeThumbPosition`:
 *  track length is the viewport client size (the `data-vertical:h-full` token
 *  makes the scrollbar track full height), the p-px padding is reserved at both
 *  ends, and the thumb is floored at MIN_THUMB_SIZE. */
export const scrollGeometry = (metrics: ScrollMetrics, axis: ScrollAxis): ScrollGeometry => {
  const vertical = axis === 'vertical'
  const clientSize = vertical ? metrics.clientHeight : metrics.clientWidth
  const scrollSize = vertical ? metrics.scrollHeight : metrics.scrollWidth
  const scrollPos = vertical ? metrics.scrollTop : metrics.scrollLeft
  if (scrollSize <= 0 || scrollSize <= clientSize) {
    return {
      hasOverflow: false,
      thumbSizePx: 0,
      thumbOffsetPx: 0,
      maxScroll: 0,
      maxThumbOffsetPx: 0,
    }
  }
  const maxScroll = Math.max(0, scrollSize - clientSize)
  const ratio = clientSize / scrollSize
  const thumbSizePx = Math.max(MIN_THUMB_SIZE_PX, (clientSize - 2 * SCROLLBAR_PAD_PX) * ratio)
  const maxThumbOffsetPx = Math.max(0, clientSize - thumbSizePx - 2 * SCROLLBAR_PAD_PX)
  const thumbOffsetPx = maxScroll > 0 ? (scrollPos / maxScroll) * maxThumbOffsetPx : 0
  return { hasOverflow: true, thumbSizePx, thumbOffsetPx, maxScroll, maxThumbOffsetPx }
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

const readMetrics = (element: HTMLElement | null): ScrollMetrics =>
  element === null
    ? zeroMetrics
    : {
        scrollTop: element.scrollTop,
        scrollLeft: element.scrollLeft,
        scrollHeight: element.scrollHeight,
        scrollWidth: element.scrollWidth,
        clientHeight: element.clientHeight,
        clientWidth: element.clientWidth,
      }

const viewportId = (id: string): string => `${id}-viewport`

export const scrollbarId = (id: string, axis: ScrollAxis): string => `${id}-scrollbar-${axis}`

// MODEL

const DragState = defineTaggedUnion({
  Idle: {},
  Dragging: {
    axis: S.Literals(['vertical', 'horizontal']),
    pointer: S.Number,
    scroll: S.Number,
  },
})
export type DragState = typeof DragState.Type

export const Model = S.Struct({
  id: S.String,
  scrollTop: S.Number,
  scrollLeft: S.Number,
  scrollHeight: S.Number,
  scrollWidth: S.Number,
  clientHeight: S.Number,
  clientWidth: S.Number,
  dragState: DragState,
})
export type Model = typeof Model.Type

// MESSAGES

export const Message = defineMessageUnion({
  ScrolledViewport: {
    scrollTop: S.Number,
    scrollLeft: S.Number,
    scrollHeight: S.Number,
    scrollWidth: S.Number,
    clientHeight: S.Number,
    clientWidth: S.Number,
  },
  MeasuredViewport: {
    scrollTop: S.Number,
    scrollLeft: S.Number,
    scrollHeight: S.Number,
    scrollWidth: S.Number,
    clientHeight: S.Number,
    clientWidth: S.Number,
  },
  PressedThumb: {
    axis: S.Literals(['vertical', 'horizontal']),
    clientX: S.Number,
    clientY: S.Number,
  },
  PressedTrack: {
    axis: S.Literals(['vertical', 'horizontal']),
    clientX: S.Number,
    clientY: S.Number,
  },
  MovedDragPointer: { clientX: S.Number, clientY: S.Number },
  ReleasedDragPointer: {},
})
export type Message = typeof Message.Type

// COMMANDS

/** Assigns the viewport's scroll position. The natural scroll event flows back
 *  through `ScrolledViewport`, so the thumb follows the pointer. Mirrors the
 *  silent no-op when the element is gone (virtual-list precedent). */
export const ApplyScroll = Command.define('ApplyScroll', {
  args: { id: S.String, scrollTop: S.Number, scrollLeft: S.Number },
  messages: [Message.ScrolledViewport],
  execute: ({ id, scrollTop, scrollLeft }) =>
    Effect.sync(() => {
      const element = document.getElementById(viewportId(id))
      if (element !== null) {
        element.scrollTop = scrollTop
        element.scrollLeft = scrollLeft
      }
      return Message.ScrolledViewport(readMetrics(element))
    }),
})

/** Track click: jump the viewport so the pointer lands at the thumb's center,
 *  then let the scroll event flow back. Mirrors Base UI's scrollbar
 *  `onPointerDown` math. */
export const ScrollToPointer = Command.define('ScrollToPointer', {
  args: {
    id: S.String,
    axis: S.Literals(['vertical', 'horizontal']),
    clientX: S.Number,
    clientY: S.Number,
  },
  messages: [Message.ScrolledViewport],
  execute: ({ id, axis, clientX, clientY }) =>
    Effect.sync(() => {
      const viewport = document.getElementById(viewportId(id))
      const scrollbar = document.getElementById(scrollbarId(id, axis))
      if (viewport !== null && scrollbar !== null) {
        const geometry = scrollGeometry(readMetrics(viewport), axis)
        if (geometry.hasOverflow && geometry.maxThumbOffsetPx > 0) {
          const rect = scrollbar.getBoundingClientRect()
          const pointerInTrack = axis === 'vertical' ? clientY - rect.top : clientX - rect.left
          const clickPosition = pointerInTrack - geometry.thumbSizePx / 2 - SCROLLBAR_PAD_PX
          const ratio = clamp(clickPosition / geometry.maxThumbOffsetPx, 0, 1)
          const target = ratio * geometry.maxScroll
          if (axis === 'vertical') {
            viewport.scrollTop = target
          } else {
            viewport.scrollLeft = target
          }
        }
      }
      return Message.ScrolledViewport(readMetrics(viewport))
    }),
})

// INIT / UPDATE

export type InitConfig = Readonly<{
  id: string
}>

/** Creates an initial scroll-area model. Metrics start at zero (unmeasured);
 *  the first ResizeObserver tick fills them in. */
export const init = (config: InitConfig): Model => ({
  id: config.id,
  ...zeroMetrics,
  dragState: DragState.Idle(),
})

const storeMetrics = (model: Model, metrics: ScrollMetrics): Update.Return<Model, Message> => ({
  model: evo(model, {
    scrollTop: () => metrics.scrollTop,
    scrollLeft: () => metrics.scrollLeft,
    scrollHeight: () => metrics.scrollHeight,
    scrollWidth: () => metrics.scrollWidth,
    clientHeight: () => metrics.clientHeight,
    clientWidth: () => metrics.clientWidth,
  }),
})

/** Processes a scroll-area message and returns the next model and commands. */
export const update = (model: Model, message: Message): Update.Return<Model, Message> =>
  Message.match(message, {
    ScrolledViewport: (metrics) => storeMetrics(model, metrics),
    MeasuredViewport: (metrics) => storeMetrics(model, metrics),
    PressedThumb: ({ axis, clientX, clientY }) => ({
      model: evo(model, {
        dragState: () =>
          DragState.Dragging({
            axis,
            pointer: axis === 'vertical' ? clientY : clientX,
            scroll: axis === 'vertical' ? model.scrollTop : model.scrollLeft,
          }),
      }),
    }),
    PressedTrack: ({ axis, clientX, clientY }) =>
      // A thumb press bubbles to the track's pointerdown (thumb → scrollbar);
      // the press that started the drag must not also jump the viewport.
      model.dragState._tag === 'Dragging'
        ? { model }
        : {
            model,
            commands: [ScrollToPointer({ id: model.id, axis, clientX, clientY })],
          },
    MovedDragPointer: ({ clientX, clientY }) => {
      if (model.dragState._tag !== 'Dragging') return { model }
      const { axis, pointer, scroll } = model.dragState
      const geometry = scrollGeometry(model, axis)
      if (!geometry.hasOverflow || geometry.maxThumbOffsetPx <= 0) return { model }
      const pointerNow = axis === 'vertical' ? clientY : clientX
      const nextScroll = clamp(
        scroll + ((pointerNow - pointer) / geometry.maxThumbOffsetPx) * geometry.maxScroll,
        0,
        geometry.maxScroll,
      )
      return {
        model,
        commands: [
          ApplyScroll({
            id: model.id,
            scrollTop: axis === 'vertical' ? nextScroll : model.scrollTop,
            scrollLeft: axis === 'horizontal' ? nextScroll : model.scrollLeft,
          }),
        ],
      }
    },
    ReleasedDragPointer: () => ({ model: evo(model, { dragState: () => DragState.Idle() }) }),
  })

// SUBSCRIPTIONS

type AttachState = {
  scrollListener: (() => void) | null
  resizeObserver: ResizeObserver | null
  observedElement: HTMLElement | null
  pendingFrame: number | null
}

const viewportEventsStream = (id: string): Stream.Stream<Message> =>
  Stream.callback((queue) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const state: AttachState = {
          scrollListener: null,
          resizeObserver: null,
          observedElement: null,
          pendingFrame: null,
        }
        const detach = () => {
          if (state.resizeObserver !== null) {
            state.resizeObserver.disconnect()
            state.resizeObserver = null
          }
          if (state.observedElement !== null && state.scrollListener !== null) {
            state.observedElement.removeEventListener('scroll', state.scrollListener)
          }
          state.observedElement = null
          state.scrollListener = null
        }
        const attach = (element: HTMLElement) => {
          const listener = () =>
            Queue.offerUnsafe(queue, Message.ScrolledViewport(readMetrics(element)))
          element.addEventListener('scroll', listener, { passive: true })
          state.scrollListener = listener
          state.observedElement = element
          state.resizeObserver = new ResizeObserver(() => {
            Queue.offerUnsafe(queue, Message.MeasuredViewport(readMetrics(element)))
          })
          state.resizeObserver.observe(element)
        }
        const reconcile = () => {
          const element = document.getElementById(viewportId(id))
          if (element === null) {
            if (state.observedElement !== null) detach()
            return
          }
          if (state.observedElement === element) return
          detach()
          attach(element)
        }
        reconcile()
        // Observes the whole document subtree so the listeners reattach when
        // the viewport is (re)inserted by route changes or conditional
        // renders; reconcile is rAF-gated and short-circuits while the cached
        // element is still live (virtual-list precedent).
        const mutationObserver = new MutationObserver(() => {
          if (state.pendingFrame !== null) return
          state.pendingFrame = requestAnimationFrame(() => {
            state.pendingFrame = null
            reconcile()
          })
        })
        mutationObserver.observe(document.body, { childList: true, subtree: true })
        return { state, detach, mutationObserver }
      }),
      ({ state, detach, mutationObserver }) =>
        Effect.sync(() => {
          mutationObserver.disconnect()
          if (state.pendingFrame !== null) cancelAnimationFrame(state.pendingFrame)
          detach()
        }),
    ).pipe(Effect.flatMap(() => Effect.never)),
  )

const DragActivity = S.Literals(['Idle', 'Active'])

const dragActivityFromModel = (model: Model): 'Idle' | 'Active' =>
  model.dragState._tag === 'Dragging' ? 'Active' : 'Idle'

/** Document pointer stream that drives the thumb drag, with the grabbing
 *  cursor / selection lock from the slider precedent. */
const dragPointerStream = (dragActivity: 'Idle' | 'Active'): Stream.Stream<Message> => {
  const pointerEvents = Stream.merge(
    Stream.fromEventListener(document, 'pointermove').pipe(
      Stream.mapEffect((event) =>
        Effect.sync(() =>
          event instanceof PointerEvent
            ? Option.some(
                Message.MovedDragPointer({ clientX: event.clientX, clientY: event.clientY }),
              )
            : Option.none(),
        ),
      ),
      Stream.filter(Option.isSome),
      Stream.map((option) => option.value),
    ),
    Stream.fromEventListener(document, 'pointerup').pipe(
      Stream.map(() => Message.ReleasedDragPointer()),
    ),
  )
  const dragStyles = Stream.callback(() =>
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
    Stream.merge(pointerEvents, dragStyles),
    Effect.sync(() => dragActivity === 'Active'),
  ) as Stream.Stream<Message>
}

/** Viewport scroll/resize events plus thumb-drag pointer tracking. Lift these
 *  into the app's subscriptions for every scroll-area instance. */
export const subscriptions = Subscription.make<Model, Message>()((entry) => ({
  viewportEvents: entry(
    { id: S.String },
    {
      modelToDependencies: (model) => ({ id: model.id }),
      dependenciesToStream: ({ id }) => viewportEventsStream(id),
    },
  ),
  dragPointer: entry(
    { dragActivity: DragActivity },
    {
      modelToDependencies: (model) => ({
        dragActivity: dragActivityFromModel(model),
      }),
      dependenciesToStream: ({ dragActivity }) => dragPointerStream(dragActivity),
    },
  ),
}))

// VIEW

export type ViewInputs = Readonly<{
  /** Scrollable content rendered inside the viewport. */
  content: Html
  className?: string
}>

const px = (value: number): string => `${String(value)}px`

const scrollbarStyle = (axis: ScrollAxis, cornerPx: number): Readonly<Record<string, string>> => {
  // Positioning normally comes from the primitive; foldcn emits it inline
  // (slider precedent for primitive-owned inline styles). LTR geometry only.
  if (axis === 'vertical') {
    // oxlint-disable-next-line anti-slop/no-known-value-widening -- SAFETY: style bag must be Record<string,string> for h.Style; literal evidence is intentionally widened to the style contract
    return {
      position: 'absolute',
      'touch-action': 'none',
      'user-select': 'none',
      '-webkit-user-select': 'none',
      top: '0',
      bottom: px(cornerPx),
      right: '0',
    }
  }
  // oxlint-disable-next-line anti-slop/no-known-value-widening -- SAFETY: style bag must be Record<string,string> for h.Style; literal evidence is intentionally widened to the style contract
  return {
    position: 'absolute',
    'touch-action': 'none',
    'user-select': 'none',
    '-webkit-user-select': 'none',
    left: '0',
    right: px(cornerPx),
    bottom: '0',
  }
}

const thumbStyle = (
  axis: ScrollAxis,
  geometry: ScrollGeometry,
): Readonly<Record<string, string>> => {
  if (axis === 'vertical') {
    // oxlint-disable-next-line anti-slop/no-known-value-widening -- SAFETY: style bag must be Record<string,string> for h.Style; literal evidence is intentionally widened to the style contract
    return {
      height: px(geometry.thumbSizePx),
      transform: `translate3d(0,${px(geometry.thumbOffsetPx)},0)`,
    }
  }
  // oxlint-disable-next-line anti-slop/no-known-value-widening -- SAFETY: style bag must be Record<string,string> for h.Style; literal evidence is intentionally widened to the style contract
  return {
    width: px(geometry.thumbSizePx),
    transform: `translate3d(${px(geometry.thumbOffsetPx)},0,0)`,
  }
}

const pointerToMessage =
  (message: (clientX: number, clientY: number) => Message) =>
  (
    _pointerType: string,
    button: number,
    _x: number,
    _y: number,
    _t: number,
    clientX: number,
    clientY: number,
  ) =>
    button === 0 ? Option.some(message(clientX, clientY)) : Option.none()

/** Renders the scroll area with overlay scrollbars for whichever axes
 *  overflow. Embedded via `h.submodel`. */
export const view = defineView<Model, Message, ViewInputs>((model, viewInputs, h) => {
  const verticalGeometry = scrollGeometry(model, 'vertical')
  const horizontalGeometry = scrollGeometry(model, 'horizontal')
  const bothOverflow = verticalGeometry.hasOverflow && horizontalGeometry.hasOverflow
  const cornerPx = bothOverflow ? CORNER_SIZE_PX : 0
  const viewportHidden = !verticalGeometry.hasOverflow && !horizontalGeometry.hasOverflow

  const scrollbar = (axis: ScrollAxis, geometry: ScrollGeometry): Html =>
    h.div(
      [
        h.Id(scrollbarId(model.id, axis)),
        h.Class(cn(scrollAreaScrollbarClass)),
        h.DataAttribute('slot', 'scroll-area-scrollbar'),
        h.DataAttribute('orientation', axis),
        h.DataAttribute(axis, ''),
        h.Style(scrollbarStyle(axis, cornerPx)),
        h.OnPointerDown(
          pointerToMessage((clientX, clientY) => Message.PressedTrack({ axis, clientX, clientY })),
        ),
      ],
      [
        h.div(
          [
            h.Class(cn(scrollAreaThumbClass)),
            h.DataAttribute('slot', 'scroll-area-thumb'),
            h.DataAttribute('orientation', axis),
            h.DataAttribute(axis, ''),
            h.Style(thumbStyle(axis, geometry)),
            h.OnPointerDown(
              pointerToMessage((clientX, clientY) =>
                Message.PressedThumb({ axis, clientX, clientY }),
              ),
            ),
          ],
          [],
        ),
      ],
    )

  return h.div(
    [
      h.Class(cn(scrollAreaClass, viewInputs.className)),
      h.DataAttribute('slot', 'scroll-area'),
      h.Role('presentation'),
    ],
    [
      h.div(
        [
          h.Id(viewportId(model.id)),
          h.Class(cn(scrollAreaViewportClass)),
          h.DataAttribute('slot', 'scroll-area-viewport'),
          h.Role('presentation'),
          // Keep non-scrollable viewports out of tab order (upstream parity).
          h.Tabindex(viewportHidden ? -1 : 0),
        ],
        [viewInputs.content],
      ),
      ...(verticalGeometry.hasOverflow ? [scrollbar('vertical', verticalGeometry)] : []),
      ...(horizontalGeometry.hasOverflow ? [scrollbar('horizontal', horizontalGeometry)] : []),
      ...(bothOverflow
        ? [
            h.div(
              [
                h.Style({
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: px(CORNER_SIZE_PX),
                  height: px(CORNER_SIZE_PX),
                }),
              ],
              [],
            ),
          ]
        : []),
    ],
  )
})
