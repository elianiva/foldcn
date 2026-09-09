/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update/subscriptions into your app:
 *  `import * as MessageScroller from '@/components/ui/message-scroller'`
 */
import { Cause, Effect, Queue, Schema as S, Stream } from 'effect'
import * as Command from 'foldkit/command'
import type { Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView } from 'foldkit/submodel'
import { evo } from 'foldkit/struct'
import * as Subscription from 'foldkit/subscription'
import * as Update from 'foldkit/update'

import { buttonSizes, buttonVariants } from '@/ui/button'
import { icon } from '@/lib/icons'
import { ArrowDown } from 'lucide'
import { cn } from '@/lib/utils'

// MessageScroller is a chat transcript scroller. It owns the scroll viewport:
// where a transcript opens (defaultScrollPosition), whether to follow the live
// end while streaming (autoScroll), when a newly appended anchored turn should
// settle near the top with the previous turn peeking above it, and the
// scroll-to-end/start button that appears when overflow exists toward its
// direction. Items are plain rows; anchor them with `itemIsAnchor` and give
// them stable ids with `itemToId` for scrollToMessage.
//
// foldcn gaps vs upstream: @foldkit/ui has no message-scroller primitive, so
// this is a foldkit submodel. No IntersectionObserver visibility tracking
// (currentAnchorId / visibleMessageIds), no prepend preservation, and no
// anchored-turn tail spacer — a reply streaming below an anchored turn is not
// held in place while it grows (the anchor scrolls once; follow resumes when
// the reply reaches the live edge).

/** Upstream class strings, character-identical to bases/base/ui. The
 *  cn-message-scroller* tokens other than -content are upstream no-op hooks
 *  (defined by no style); the resolver strips them. */
export const messageScrollerClass =
  'cn-message-scroller group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden'

export const messageScrollerViewportClass =
  'cn-message-scroller-viewport size-full min-h-0 min-w-0 scroll-fade-b scrollbar-thin scrollbar-gutter-stable overflow-y-auto overscroll-contain contain-content data-autoscrolling:scrollbar-thumb-transparent data-autoscrolling:scrollbar-track-transparent'

export const messageScrollerContentClass =
  'cn-message-scroller-content flex h-max min-h-full flex-col'

export const messageScrollerItemClass =
  'cn-message-scroller-item min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]'

export const messageScrollerButtonClass =
  'cn-message-scroller-button absolute inset-s-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180'

/** Distance from an edge that still counts as at-top/at-bottom. Upstream
 *  default: a sub-pixel tolerance so edge detection does not flicker across
 *  engines that round scrollTop differently. */
export const DEFAULT_SCROLL_EDGE_THRESHOLD = 8

/** Pixels of the previous turn kept visible above a newly anchored turn.
 *  Upstream default scrollPreviousItemPeek. */
export const SCROLL_PREVIOUS_ITEM_PEEK = 64

// MODEL

export const DefaultScrollPosition = S.Literals(['start', 'end', 'last-anchor'])
export type DefaultScrollPosition = typeof DefaultScrollPosition.Type

export const ScrollDirection = S.Literals(['start', 'end'])
export type ScrollDirection = typeof ScrollDirection.Type

export const ScrollMode = S.Literals(['auto', 'smooth'])
export type ScrollMode = typeof ScrollMode.Type

export const Model = S.Struct({
  id: S.String,
  autoScroll: S.Boolean,
  defaultScrollPosition: DefaultScrollPosition,
  scrollEdgeThreshold: S.Number,
  /** Live viewport snapshot from the last scroll/resize event. */
  scrollTop: S.Number,
  viewportHeight: S.Number,
  contentHeight: S.Number,
  /** False until the first viewport measurement arrives; the view renders the
   *  button inactive until then. */
  measured: S.Boolean,
  /** defaultScrollPosition is applied once, on the first non-empty render. */
  initialPositionApplied: S.Boolean,
  /** While true the viewport emits data-autoscrolling (transparent scrollbar
   *  chrome) — set when a programmatic scroll starts, cleared on completion. */
  autoscrolling: S.Boolean,
  /** Version-based cancellation, same scheme as VirtualList: each scroll
   *  command increments this; only the matching completion clears
   *  autoscrolling. */
  pendingScrollVersion: S.Number,
})
export type Model = typeof Model.Type

// MESSAGES

export const Message = defineMessageUnion({
  /** A scroll or resize settled the viewport; carries a fresh snapshot read
   *  from the element. Emitted by the subscription's scroll listener and both
   *  ResizeObservers. */
  SyncedViewport: {
    scrollTop: S.Number,
    viewportHeight: S.Number,
    contentHeight: S.Number,
  },
  /** A scroll-anchored turn appended below the reading position; the update
   *  settles it near the top with the previous turn peeking above. */
  AppendedScrollAnchor: { messageId: S.String },
  /** A scroll command (ApplyScroll / ApplyScrollToMessage) finished. */
  CompletedApplyScroll: { version: S.Number },
  /** The built-in scroll button was pressed. */
  RequestedScroll: { direction: ScrollDirection, behavior: ScrollMode },
})
export type Message = typeof Message.Type

// INIT / UPDATE

export type InitConfig = Readonly<{
  id: string
  /** Follow new content at the bottom while the viewport is already at the
   *  end. Upstream default false. */
  autoScroll?: boolean
  /** Opening position on the first non-empty render, applied once. Upstream
   *  default 'end'. */
  defaultScrollPosition?: DefaultScrollPosition
  /** Distance from an edge that still counts as at-top/at-bottom. Upstream
   *  default 8. */
  scrollEdgeThreshold?: number
}>

/** Creates an initial message-scroller model. The viewport starts unmeasured;
 *  the first ResizeObserver tick applies defaultScrollPosition. */
export const init = (config: InitConfig): Model => ({
  id: config.id,
  autoScroll: config.autoScroll ?? false,
  defaultScrollPosition: config.defaultScrollPosition ?? 'end',
  scrollEdgeThreshold: config.scrollEdgeThreshold ?? DEFAULT_SCROLL_EDGE_THRESHOLD,
  scrollTop: 0,
  viewportHeight: 0,
  contentHeight: 0,
  measured: false,
  initialPositionApplied: false,
  autoscrolling: false,
  pendingScrollVersion: 0,
})

// COMMANDS

/** Scrolls the viewport element. `behavior: 'smooth'` animates via
 *  scrollTo(); 'auto' jumps by setting scrollTop directly. Emits
 *  CompletedApplyScroll with the version it was issued under. */
const ApplyScroll = Command.define('ApplyScroll', {
  args: { id: S.String, scrollTop: S.Number, version: S.Number, behavior: ScrollMode },
  messages: [Message.CompletedApplyScroll],
  execute: ({ id, scrollTop, version, behavior }) =>
    Effect.sync(() => {
      const viewport = document.getElementById(id)
      if (viewport !== null) {
        if (behavior === 'smooth') {
          viewport.scrollTo({ top: scrollTop, behavior: 'smooth' })
        } else {
          viewport.scrollTop = scrollTop
        }
      }
      return Message.CompletedApplyScroll({ version })
    }),
})

/** Scrolls a transcript row into view. Aligns per `align` with `margin`
 *  pixels of content kept visible on the aligned edge ('start' + margin 64
 *  leaves the previous turn peeking above, upstream's keepPreviousPeek).
 *  Emits CompletedApplyScroll even when the row is missing so a pending
 *  autoscrolling flag still clears. */
const ApplyScrollToMessage = Command.define('ApplyScrollToMessage', {
  args: {
    id: S.String,
    messageId: S.String,
    align: S.Literals(['start', 'center', 'end', 'nearest']),
    margin: S.Number,
    version: S.Number,
    behavior: ScrollMode,
  },
  messages: [Message.CompletedApplyScroll],
  execute: ({ id, messageId, align, margin, version, behavior }) =>
    Effect.sync(() => {
      const viewport = document.getElementById(id)
      const element =
        viewport !== null && typeof CSS !== 'undefined'
          ? viewport.querySelector(`[data-message-id="${CSS.escape(messageId)}"]`)
          : null
      if (viewport !== null && element !== null) {
        const viewportTop = viewport.getBoundingClientRect().top
        const rect = element.getBoundingClientRect()
        const itemTop = rect.top - viewportTop + viewport.scrollTop
        const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight)
        const towardStart = Math.max(0, itemTop - margin)
        const towardEnd = Math.max(0, itemTop + rect.height - viewport.clientHeight + margin)
        const towardCenter = Math.max(
          0,
          itemTop - (viewport.clientHeight - rect.height) / 2 + margin / 2,
        )
        const scrollTop =
          align === 'start'
            ? towardStart
            : align === 'end'
              ? towardEnd
              : align === 'center'
                ? towardCenter
                : Math.abs(towardStart - viewport.scrollTop) <=
                    Math.abs(towardEnd - viewport.scrollTop)
                  ? towardStart
                  : towardEnd
        const clamped = Math.min(maxScroll, scrollTop)
        if (behavior === 'smooth') {
          viewport.scrollTo({ top: clamped, behavior: 'smooth' })
        } else {
          viewport.scrollTop = clamped
        }
      }
      return Message.CompletedApplyScroll({ version })
    }),
})

/** Locates the last scroll-anchored turn and opens on it: a short last turn
 *  already fits below the anchor, so the viewport scrolls to the end;
 *  otherwise the anchor settles near the top with the previous turn peeking
 *  above. Emits CompletedApplyScroll so autoscrolling clears either way. */
const ApplyLastAnchor = Command.define('ApplyLastAnchor', {
  args: { id: S.String, version: S.Number },
  messages: [Message.CompletedApplyScroll],
  execute: ({ id, version }) =>
    Effect.sync(() => {
      const viewport = document.getElementById(id)
      const content = document.getElementById(`${id}-content`)
      const anchors =
        content !== null ? Array.from(content.querySelectorAll('[data-scroll-anchor="true"]')) : []
      const anchor = anchors[anchors.length - 1] ?? null
      if (viewport === null || anchor === null) {
        if (viewport !== null) {
          viewport.scrollTop = viewport.scrollHeight
        }
        return Message.CompletedApplyScroll({ version })
      }
      const viewportTop = viewport.getBoundingClientRect().top
      const anchorTop = anchor.getBoundingClientRect().top - viewportTop + viewport.scrollTop
      const contentBottom = Math.max(0, viewport.scrollHeight - viewport.clientHeight)
      const lastTurnFits = contentBottom - anchorTop <= viewport.clientHeight
      const scrollTop = lastTurnFits
        ? contentBottom
        : Math.max(0, anchorTop - SCROLL_PREVIOUS_ITEM_PEEK)
      viewport.scrollTop = scrollTop
      return Message.CompletedApplyScroll({ version })
    }),
})

// UPDATE

type UpdateReturn = Update.Return<Model, Message>

const issueScroll = (model: Model, scrollTop: number, behavior: ScrollMode): UpdateReturn => {
  const version = model.pendingScrollVersion + 1
  return {
    model: evo(model, {
      autoscrolling: () => true,
      pendingScrollVersion: () => version,
    }),
    commands: [ApplyScroll({ id: model.id, scrollTop, version, behavior })],
  }
}

const issueScrollToMessage = (
  model: Model,
  messageId: string,
  align: 'start' | 'center' | 'end' | 'nearest',
  margin: number,
  behavior: ScrollMode,
): UpdateReturn => {
  const version = model.pendingScrollVersion + 1
  return {
    model: evo(model, {
      autoscrolling: () => true,
      pendingScrollVersion: () => version,
    }),
    commands: [ApplyScrollToMessage({ id: model.id, messageId, align, margin, version, behavior })],
  }
}

const endScrollTop = (viewportHeight: number, contentHeight: number): number =>
  Math.max(0, contentHeight - viewportHeight)

/** Applies the opening position once, on the first non-empty render. */
const initialPosition = (model: Model, snapshot: Model): UpdateReturn => {
  const version = model.pendingScrollVersion + 1
  const opened = evo(model, {
    initialPositionApplied: () => true,
    autoscrolling: () => true,
    pendingScrollVersion: () => version,
  })
  switch (model.defaultScrollPosition) {
    case 'last-anchor':
      return { model: opened, commands: [ApplyLastAnchor({ id: model.id, version })] }
    case 'start':
      return {
        model: evo(opened, { scrollTop: () => 0 }),
        commands: [ApplyScroll({ id: model.id, scrollTop: 0, version, behavior: 'auto' })],
      }
    case 'end':
      return {
        model: evo(opened, {
          scrollTop: () => endScrollTop(snapshot.viewportHeight, snapshot.contentHeight),
        }),
        commands: [
          ApplyScroll({
            id: model.id,
            scrollTop: endScrollTop(snapshot.viewportHeight, snapshot.contentHeight),
            version,
            behavior: 'auto',
          }),
        ],
      }
  }
}

/** Processes a message-scroller message and returns the next model and any
 *  scroll commands. */
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'SyncedViewport': {
      const snapshot = evo(model, {
        scrollTop: () => message.scrollTop,
        viewportHeight: () => message.viewportHeight,
        contentHeight: () => message.contentHeight,
        measured: () => true,
      })
      if (!model.initialPositionApplied && message.contentHeight > 0) {
        return initialPosition(model, snapshot)
      }
      // Follow the live end only while the reader already is there: the
      // previous snapshot decides, so scrolling away is a deliberate opt-out.
      const wasAtEnd =
        model.measured &&
        endScrollTop(model.viewportHeight, model.contentHeight) - model.scrollTop <=
          model.scrollEdgeThreshold
      const grew = model.measured && message.contentHeight > model.contentHeight + 0.5
      if (model.autoScroll && wasAtEnd && grew) {
        return issueScroll(
          snapshot,
          endScrollTop(message.viewportHeight, message.contentHeight),
          'auto',
        )
      }
      return { model: snapshot }
    }
    case 'AppendedScrollAnchor':
      return issueScrollToMessage(
        model,
        message.messageId,
        'start',
        SCROLL_PREVIOUS_ITEM_PEEK,
        'auto',
      )
    case 'CompletedApplyScroll':
      return {
        model:
          message.version === model.pendingScrollVersion
            ? evo(model, { autoscrolling: () => false })
            : model,
      }
    case 'RequestedScroll':
      if (!model.measured) return { model }
      return message.direction === 'end'
        ? issueScroll(
            model,
            endScrollTop(model.viewportHeight, model.contentHeight),
            message.behavior,
          )
        : issueScroll(model, 0, message.behavior)
  }
}

// PUBLIC SCROLL COMMANDS

/** Scrolls the viewport to its end. Default behavior: smooth. */
export const scrollToEnd = (model: Model, options?: { behavior?: ScrollMode }): UpdateReturn =>
  issueScroll(
    model,
    endScrollTop(model.viewportHeight, model.contentHeight),
    options?.behavior ?? 'smooth',
  )

/** Scrolls the viewport to its start. Default behavior: smooth. */
export const scrollToStart = (model: Model, options?: { behavior?: ScrollMode }): UpdateReturn =>
  issueScroll(model, 0, options?.behavior ?? 'smooth')

/** Scrolls a transcript row into view. `options.align` picks the viewport
 *  edge (or center) to align the row with; `options.scrollMargin` keeps that
 *  many pixels of content visible on the aligned edge ('start' + 64 leaves
 *  the previous turn peeking above). Default: smooth, start, no margin. */
export const scrollToMessage = (
  model: Model,
  messageId: string,
  options?: {
    align?: 'start' | 'center' | 'end' | 'nearest'
    behavior?: ScrollMode
    scrollMargin?: number
  },
): UpdateReturn =>
  issueScrollToMessage(
    model,
    messageId,
    options?.align ?? 'start',
    options?.scrollMargin ?? 0,
    options?.behavior ?? 'smooth',
  )

/** True while content is hidden above the viewport. */
export const atStart = (model: Model): boolean =>
  !model.measured || model.scrollTop <= model.scrollEdgeThreshold

/** True while content is hidden below the viewport. */
export const atEnd = (model: Model): boolean =>
  !model.measured ||
  endScrollTop(model.viewportHeight, model.contentHeight) - model.scrollTop <=
    model.scrollEdgeThreshold

// VIEW

export type ViewInputs<Item> = Readonly<{
  items: ReadonlyArray<Item>
  itemToKey: (item: Item, index: number) => string
  itemToView: (item: Item, index: number) => Html
  /** Stable row id for scrollToMessage, anchored turns, and future
   *  visibility — emitted as data-message-id. */
  itemToId?: (item: Item, index: number) => string | undefined
  /** Marks turn boundaries that newly appended turns anchor from and that
   *  defaultScrollPosition 'last-anchor' restores — emitted as
   *  data-scroll-anchor. */
  itemIsAnchor?: (item: Item, index: number) => boolean
  className?: string
  /** The built-in scroll button's direction; 'none' omits it. Default
   *  'end'. */
  buttonDirection?: ScrollDirection | 'none'
}>

/** Renders the transcript scroller. Embedded via `h.submodel` inside a sized
 *  container: the root is `size-full`, so give it a definite height (pass
 *  `className: 'flex-1 min-h-0'` inside a flex column, for example). */
export const view = <Item>() =>
  defineView<Model, Message, ViewInputs<Item>>((model, viewInputs, h) => {
    const maxScroll = Math.max(0, model.contentHeight - model.viewportHeight)
    const overflowTowardEnd =
      model.measured && maxScroll - model.scrollTop > model.scrollEdgeThreshold
    const overflowTowardStart = model.measured && model.scrollTop > model.scrollEdgeThreshold
    const buttonDirection = viewInputs.buttonDirection ?? 'end'

    const scrollButton = (direction: ScrollDirection) =>
      h.button(
        [
          h.Type('button'),
          h.DataAttribute('slot', 'message-scroller-button'),
          h.DataAttribute('direction', direction),
          h.DataAttribute('variant', 'secondary'),
          h.DataAttribute('size', 'icon-sm'),
          h.DataAttribute(
            'active',
            (direction === 'start' ? overflowTowardStart : overflowTowardEnd) ? 'true' : 'false',
          ),
          h.Inert(!(direction === 'start' ? overflowTowardStart : overflowTowardEnd)),
          ...(direction === 'start'
            ? overflowTowardStart
              ? []
              : [h.Tabindex(-1)]
            : overflowTowardEnd
              ? []
              : [h.Tabindex(-1)]),
          h.Class(
            cn(
              'cn-button',
              buttonVariants.secondary,
              buttonSizes['icon-sm'],
              messageScrollerButtonClass,
            ),
          ),
          h.OnClick(Message.RequestedScroll({ direction, behavior: 'smooth' })),
        ],
        [
          icon(h, ArrowDown),
          h.span([h.Class('sr-only')], [direction === 'end' ? 'Scroll to end' : 'Scroll to start']),
        ],
      )

    return h.div(
      [
        h.Class(cn(messageScrollerClass, viewInputs.className)),
        h.DataAttribute('slot', 'message-scroller'),
      ],
      [
        h.div(
          [
            h.Id(model.id),
            h.Role('region'),
            h.AriaLabel('Messages'),
            h.Tabindex(0),
            h.Class(messageScrollerViewportClass),
            h.DataAttribute('slot', 'message-scroller-viewport'),
            ...(model.autoscrolling ? [h.DataAttribute('autoscrolling', '')] : []),
          ],
          [
            h.div(
              [
                h.Id(`${model.id}-content`),
                h.Role('log'),
                h.AriaRelevant('additions'),
                h.Class(messageScrollerContentClass),
                h.DataAttribute('slot', 'message-scroller-content'),
              ],
              viewInputs.items.map((item, index) => {
                const itemId = viewInputs.itemToId?.(item, index)
                return h.keyed('div')(
                  viewInputs.itemToKey(item, index),
                  [
                    h.Class(messageScrollerItemClass),
                    h.DataAttribute('slot', 'message-scroller-item'),
                    ...(itemId === undefined ? [] : [h.DataAttribute('message-id', itemId)]),
                    h.DataAttribute(
                      'scroll-anchor',
                      viewInputs.itemIsAnchor?.(item, index) ? 'true' : 'false',
                    ),
                  ],
                  [viewInputs.itemToView(item, index)],
                )
              }),
            ),
          ],
        ),
        ...(buttonDirection === 'none' ? [] : [scrollButton(buttonDirection)]),
      ],
    )
  })

// SUBSCRIPTIONS

type ViewportEvent = typeof Message.Type

/** Subscriptions that drive the viewport snapshot and anchored-turn
 *  detection.
 *
 *  - **scroll**: listens for `scroll` events on the viewport element.
 *  - **resize**: ResizeObservers on the viewport and the content element
 *    emit fresh snapshots as the transcript grows or shrinks.
 *  - **anchors**: a MutationObserver on the content detects newly appended
 *    scroll-anchored turns (ids seen for the first time since attach) whose
 *    top edge sits below the viewport's, and emits AppendedScrollAnchor.
 *
 *  A document-level MutationObserver re-reconciles listeners when the
 *  elements are (re)inserted, so SPA navigation reattaches without consumer
 *  cooperation. Anchor bookkeeping resets on reattach. */
export const subscriptions = Subscription.make<Model, Message>()((entry) => ({
  viewportEvents: entry(
    { id: S.String },
    {
      modelToDependencies: (model) => ({ id: model.id }),
      dependenciesToStream: ({ id }) =>
        Stream.callback((queue: Queue.Queue<ViewportEvent, Cause.Done>) =>
          Effect.acquireRelease(
            Effect.sync(() => attachViewportEvents(id, queue)),
            (state) => Effect.sync(() => teardownViewportEvents(state)),
          ).pipe(Effect.flatMap(() => Effect.never)),
        ),
    },
  ),
}))

type AttachedViewport = {
  queue: Queue.Queue<ViewportEvent, Cause.Done>
  id: string
  viewport: HTMLElement | null
  scrollListener: (() => void) | null
  viewportResizeObserver: ResizeObserver | null
  contentResizeObserver: ResizeObserver | null
  anchorMutationObserver: MutationObserver | null
  documentObserver: MutationObserver
  handledAnchors: Set<string>
  pendingFrame: number | null
}

const snapshotMessage = (viewport: HTMLElement): ViewportEvent =>
  Message.SyncedViewport({
    scrollTop: viewport.scrollTop,
    viewportHeight: viewport.clientHeight,
    contentHeight: viewport.scrollHeight,
  })

const offerEvent = (state: AttachedViewport, message: ViewportEvent): void => {
  void Queue.offerUnsafe(state.queue, message)
}

/** Disconnects the document-level reconcile observer and the per-element
 *  listeners. Runs once, at subscription teardown. */
const teardownViewportEvents = (state: AttachedViewport): void => {
  state.documentObserver.disconnect()
  if (state.pendingFrame !== null) {
    cancelAnimationFrame(state.pendingFrame)
    state.pendingFrame = null
  }
  detachViewportEvents(state)
}

/** Drops the per-element listeners and observers. The document-level
 *  reconcile observer is untouched — it must survive unmounts to reattach on
 *  remount. */
const detachViewportEvents = (state: AttachedViewport): void => {
  state.viewportResizeObserver?.disconnect()
  state.contentResizeObserver?.disconnect()
  state.anchorMutationObserver?.disconnect()
  if (state.viewport !== null && state.scrollListener !== null) {
    state.viewport.removeEventListener('scroll', state.scrollListener)
  }
  state.viewport = null
  state.scrollListener = null
  state.viewportResizeObserver = null
  state.contentResizeObserver = null
  state.anchorMutationObserver = null
  state.handledAnchors = new Set()
}

/** Wires the scroll listener, both ResizeObservers, and the anchor
 *  MutationObserver onto a mounted viewport/content pair. */
const connectViewport = (state: AttachedViewport): void => {
  const viewport = document.getElementById(state.id)
  const content = document.getElementById(`${state.id}-content`)
  if (viewport === null || content === null) return
  state.viewport = viewport
  state.scrollListener = () => offerEvent(state, snapshotMessage(viewport))
  viewport.addEventListener('scroll', state.scrollListener, { passive: true })
  state.viewportResizeObserver = new ResizeObserver(() =>
    offerEvent(state, snapshotMessage(viewport)),
  )
  state.viewportResizeObserver.observe(viewport)
  state.contentResizeObserver = new ResizeObserver(() =>
    offerEvent(state, snapshotMessage(viewport)),
  )
  state.contentResizeObserver.observe(content)
  // Seed with the anchors present at connect time so restored transcripts do
  // not anchor-scroll on mount; only ids first seen afterwards emit.
  state.handledAnchors = new Set(
    Array.from(content.querySelectorAll('[data-scroll-anchor="true"]'))
      .map((anchor) => anchor.getAttribute('data-message-id'))
      .filter((value): value is string => value !== null),
  )
  state.anchorMutationObserver = new MutationObserver(() => {
    const anchors = content.querySelectorAll('[data-scroll-anchor="true"]')
    const last = anchors.length === 0 ? null : anchors.item(anchors.length - 1)
    if (last === null) return
    const messageId = last.getAttribute('data-message-id')
    if (messageId === null || state.handledAnchors.has(messageId)) return
    state.handledAnchors.add(messageId)
    // Only turns appended below the reading position anchor the scroll; a
    // turn already above (restored transcripts, prepended history) does not
    // yank the reader back.
    if (last.getBoundingClientRect().top > viewport.getBoundingClientRect().top) {
      offerEvent(state, Message.AppendedScrollAnchor({ messageId }))
    }
  })
  state.anchorMutationObserver.observe(content, { childList: true })
}

const attachViewportEvents = (
  id: string,
  queue: Queue.Queue<ViewportEvent, Cause.Done>,
): AttachedViewport => {
  const state: AttachedViewport = {
    queue,
    id,
    viewport: null,
    scrollListener: null,
    viewportResizeObserver: null,
    contentResizeObserver: null,
    anchorMutationObserver: null,
    handledAnchors: new Set(),
    pendingFrame: null,
    documentObserver: new MutationObserver(() => {}),
  }

  const reconcile = (): void => {
    const viewport = document.getElementById(state.id)
    const content = document.getElementById(`${state.id}-content`)
    if (viewport === null || content === null) {
      detachViewportEvents(state)
      return
    }
    if (state.viewport === viewport) return
    connectViewport(state)
  }

  // Reattach on remount: the container can be inserted/removed by any parent
  // (route changes, conditional renders). Reconcile is gated by rAF and
  // short-circuits while the cached element is still connected.
  state.documentObserver = new MutationObserver(() => {
    if (state.pendingFrame !== null) return
    state.pendingFrame = requestAnimationFrame(() => {
      state.pendingFrame = null
      reconcile()
    })
  })
  state.documentObserver.observe(document.body, { childList: true, subtree: true })
  reconcile()
  return state
}
