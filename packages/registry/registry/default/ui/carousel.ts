/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update/subscriptions into your app:
 *  `import * as Carousel from '@/components/ui/carousel'`
 */
import { Effect, Option, Schema as S } from 'effect'
import { Command, Subscription, Update } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView } from 'foldkit/submodel'
import { evo } from 'foldkit/struct'

import { icon } from '@/lib/icons'
import { ChevronLeft, ChevronRight } from 'lucide'
import { cn } from '@/lib/utils'

import { button, type ButtonSize, type ButtonVariant } from './button'

// A scroll-snap carousel. The model owns the selected slide index; prev/next
// (buttons and ArrowLeft/ArrowRight anywhere inside the region) move it and
// an ApplyScroll command smooth-scrolls the port. Native scrolling (touch
// swipe, wheel) flows back through the contentScroll subscription, which
// measures item geometry and reports the settled slide plus the last
// reachable one (scrollBound) — with partial-width slides (basis-1/2…) the
// last index is lower than count-1, exactly where the browser can scroll.
//
// foldcn gaps vs upstream: no embla engine — no loop, align/duration opts, or
// plugins (autoplay); no imperative API (use ChangedIndex out-messages
// instead of setApi); RTL layouts are not handled.
//
// The scroll port and slide geometry are CSS-driven via the compat tokens
// `cn-carousel-content[-vertical]` / `cn-carousel-item`: snap alignment plus
// a negative scroll margin derived from `--foldcn-carousel-spacing` keeps
// slide content flush with the port edges for any spacing (default 1rem,
// matching upstream's -ml-4/pl-4 pairing).

export const Orientation = S.Literals(['horizontal', 'vertical'])
export type Orientation = typeof Orientation.Type

/** Upstream Carousel root string. */
export const carouselClass = 'relative'

/** Upstream CarouselContent viewport string. Upstream's bare
 *  "overflow-hidden" is carried inside the compat token (an overflow-hidden
 *  literal after the token would strip overflow-x-auto in cn's last-wins
 *  merge — see cn-compat.css). Sizing such as a vertical height goes through
 *  viewInputs.contentClassName. */
export const carouselContentClass = 'cn-carousel-content'

/** Vertical counterpart of carouselContentClass — self-sufficient (carries
 *  its own overflow pair in the compat token). */
export const carouselContentVerticalClass = 'cn-carousel-content-vertical'

/** Upstream CarouselContent track strings. */
export const carouselTrackClass = 'flex'
export const carouselTrackHorizontalClass = '-ml-4'
export const carouselTrackVerticalClass = '-mt-4 flex-col'

/** Upstream CarouselItem strings. */
export const carouselItemClass = 'cn-carousel-item min-w-0 shrink-0 grow-0 basis-full'
export const carouselItemHorizontalClass = 'pl-4'
export const carouselItemVerticalClass = 'pt-4'

/** Upstream CarouselPrevious strings. */
export const carouselPreviousClass = 'cn-carousel-previous absolute touch-manipulation'
export const carouselPreviousHorizontalClass = 'inset-y-0 -left-12 my-auto'
export const carouselPreviousVerticalClass = '-top-12 left-1/2 -translate-x-1/2 rotate-90'

/** Upstream CarouselNext strings. */
export const carouselNextClass = 'cn-carousel-next absolute touch-manipulation'
export const carouselNextHorizontalClass = 'inset-y-0 -right-12 my-auto'
export const carouselNextVerticalClass = '-bottom-12 left-1/2 -translate-x-1/2 rotate-90'

/** DOM id of the scroll port for a carousel id. */
export const contentElementId = (id: string): string => `${id}-content`

/** CSS variable the compat tokens read for slide spacing; keep it in sync
 *  with the -ml-N/pl-N spacing classes (upstream default is 1rem). */
const SPACING_VARIABLE = '--foldcn-carousel-spacing'
const DEFAULT_SPACING = '1rem'

// MODEL

export const Model = S.Struct({
  id: S.String,
  orientation: Orientation,
  /** Number of slides, matching the view's items array. */
  count: S.Number,
  /** Selected slide index (0-based). */
  index: S.Number,
  /** Last reachable slide index — the browser cannot scroll past
   *  scrollWidth - clientWidth, so partial-width slides stop earlier than
   *  count - 1. Corrected by the scroll subscription's measurements. */
  scrollBound: S.Number,
})
export type Model = typeof Model.Type

// MESSAGES

export const Message = defineMessageUnion({
  /** The user (or a caller) asked for the previous slide. */
  PressedPrevious: {},
  /** The user (or a caller) asked for the next slide. */
  PressedNext: {},
  /** The scroll port settled near a slide (every scroll tick reports the
   *  currently-nearest slide). */
  ScrolledContent: { index: S.Number, scrollBound: S.Number },
  /** ApplyScroll finished touching the DOM; nothing to do. */
  CompletedApplyScroll: {},
})
export type Message = typeof Message.Type

/** Emitted when the selected slide index changes. */
export const OutMessage = defineMessageUnion({
  ChangedIndex: { index: S.Number },
})
export type OutMessage = typeof OutMessage.Type

// INIT / UPDATE

export type InitConfig = Readonly<{
  id: string
  count: number
  orientation?: Orientation
}>

/** Creates an initial carousel model. */
export const init = (config: InitConfig): Model => ({
  id: config.id,
  orientation: config.orientation ?? 'horizontal',
  count: config.count,
  index: 0,
  scrollBound: Math.max(0, config.count - 1),
})

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const clampIndex = (value: number, bound: number): number => Math.min(Math.max(value, 0), bound)

/** Moves the selection one slide toward `delta` and commands the scroll.
 *  A no-op at either end (foldkit buttons stay focusable under
 *  aria-disabled, so keyboard activation still arrives here). */
const step = (model: Model, delta: -1 | 1): UpdateReturn => {
  const index = clampIndex(model.index + delta, model.scrollBound)
  if (index === model.index) return { model }
  return {
    model: evo(model, { index: () => index }),
    commands: [ApplyScroll({ id: model.id, index, orientation: model.orientation })],
    outMessage: OutMessage.ChangedIndex({ index }),
  }
}

/** Processes a carousel message and returns the next model, commands, and an
 *  optional out-message for the parent. */
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'PressedPrevious':
      return step(model, -1)
    case 'PressedNext':
      return step(model, 1)
    case 'ScrolledContent': {
      const index = clampIndex(message.index, model.count - 1)
      const scrollBound = clampIndex(message.scrollBound, model.count - 1)
      if (index === model.index && scrollBound === model.scrollBound) return { model }
      const next = evo(model, { index: () => index, scrollBound: () => scrollBound })
      if (index === model.index) return { model: next }
      return {
        model: next,
        outMessage: OutMessage.ChangedIndex({ index }),
      }
    }
    case 'CompletedApplyScroll':
      return { model }
  }
}

// COMMANDS

/** Scrolls the port so slide `index` is flush with its start edge. Stride is
 *  measured from the slide elements, so any slide basis works. */
export const ApplyScroll = Command.define('ApplyScroll', {
  args: { id: S.String, index: S.Number, orientation: Orientation },
  messages: [Message.CompletedApplyScroll],
  execute: ({ id, index, orientation }) =>
    Effect.sync(() => {
      const element = document.getElementById(contentElementId(id))
      if (element === null) return Message.CompletedApplyScroll()
      const stride = strideOf(element, orientation === 'horizontal')
      if (stride <= 0) return Message.CompletedApplyScroll()
      if (orientation === 'horizontal') {
        element.scrollTo({ left: index * stride, behavior: 'smooth' })
      } else {
        element.scrollTo({ top: index * stride, behavior: 'smooth' })
      }
      return Message.CompletedApplyScroll()
    }),
})

/** Distance between consecutive slide snap points: one slide's extent (the
 *  -ml-4/pl-4 pairing keeps contents exactly one offset apart). */
const strideOf = (element: HTMLElement, isHorizontal: boolean): number => {
  const items = element.querySelectorAll<HTMLElement>('[data-slot="carousel-item"]')
  const first = items.item(0)
  const second = items.item(1)
  if (first === null) return 0
  const extentOf = (item: HTMLElement): number => (isHorizontal ? item.offsetLeft : item.offsetTop)
  return second === null ? extentOf(first) : extentOf(second) - extentOf(first)
}

/** Nearest slide and last reachable slide for the port's current scroll
 *  position. */
const geometry = (element: HTMLElement, isHorizontal: boolean) => {
  const stride = strideOf(element, isHorizontal)
  if (stride <= 0) return { index: 0, scrollBound: 0 } as const
  const offset = isHorizontal ? element.scrollLeft : element.scrollTop
  const maxOffset = isHorizontal
    ? element.scrollWidth - element.clientWidth
    : element.scrollHeight - element.clientHeight
  return {
    index: Math.round(offset / stride),
    scrollBound: Math.max(0, Math.floor(maxOffset / stride + 0.001)),
  } as const
}

// SUBSCRIPTIONS

/** Tracks the scroll port: a capture-phase document scroll listener (scroll
 *  events do not bubble) filtered to this carousel's port element. The port
 *  is looked up per event, so remounts across style switches or routes need
 *  no re-attachment. */
export const subscriptions = Subscription.make<Model, Message>()((entry) => ({
  contentScroll: entry(
    { id: S.String, orientation: Orientation },
    {
      modelToDependencies: (model) => ({ id: model.id, orientation: model.orientation }),
      dependenciesToStream: ({ id, orientation }) =>
        Subscription.fromEventFilterMap<Event, Message>({
          target: document,
          type: 'scroll',
          options: { capture: true, passive: true },
          toMessage: (event) => {
            const target = event.target
            if (!(target instanceof HTMLElement)) return Option.none()
            if (target.id !== contentElementId(id)) return Option.none()
            return Option.some(
              Message.ScrolledContent(geometry(target, orientation === 'horizontal')),
            )
          },
        }),
    },
  ),
}))

// VIEW

export type CarouselButtonConfig = Readonly<{
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}>

export type CarouselItemInput = Readonly<{
  content: Html | string
  className?: string
}>

export type ViewInputs = Readonly<{
  items: ReadonlyArray<CarouselItemInput>
  className?: string
  /** Class for the scroll port (upstream CarouselContent's viewport div) —
   *  sizing such as a vertical height belongs here. */
  contentClassName?: string
  /** Class for the flex track (upstream CarouselContent's inner div, where
   *  upstream puts its className) — spacing overrides like -ml-1 belong
   *  here, kept in sync with viewInputs.spacing. */
  trackClassName?: string
  /** Slide spacing as a CSS length; must match the -ml-N/pl-N classes.
   *  Drives the compat snap margin so native scrolling stays flush. */
  spacing?: string
  /** Upstream renders CarouselPrevious/CarouselNext as separate parts; here
   *  they are built-in, disable with false. */
  showNavigation?: boolean
  previous?: CarouselButtonConfig
  next?: CarouselButtonConfig
}>

/** Renders the carousel region: scroll port, track, and navigation buttons.
 *  Embedded via `h.submodel`. */
export const view = defineView<Model, Message, ViewInputs>((model, viewInputs, h) => {
  const isHorizontal = model.orientation === 'horizontal'
  return h.div(
    [
      h.Class(cn(carouselClass, viewInputs.className)),
      h.Role('region'),
      h.AriaRoleDescription('carousel'),
      h.DataAttribute('slot', 'carousel'),
      h.OnKeyDownPreventDefault((key) => {
        if (key === 'ArrowLeft') return Option.some(Message.PressedPrevious())
        if (key === 'ArrowRight') return Option.some(Message.PressedNext())
        return Option.none()
      }),
    ],
    [
      h.div(
        [
          h.Id(contentElementId(model.id)),
          h.Class(
            cn(
              isHorizontal ? carouselContentClass : carouselContentVerticalClass,
              viewInputs.contentClassName,
            ),
          ),
          h.DataAttribute('slot', 'carousel-content'),
          h.Style({ [SPACING_VARIABLE]: viewInputs.spacing ?? DEFAULT_SPACING }),
        ],
        [
          h.div(
            [
              h.Class(
                cn(
                  carouselTrackClass,
                  isHorizontal ? carouselTrackHorizontalClass : carouselTrackVerticalClass,
                  viewInputs.trackClassName,
                ),
              ),
            ],
            viewInputs.items.map((item) =>
              h.div(
                [
                  h.Class(
                    cn(
                      carouselItemClass,
                      isHorizontal ? carouselItemHorizontalClass : carouselItemVerticalClass,
                      item.className,
                    ),
                  ),
                  h.Role('group'),
                  h.AriaRoleDescription('slide'),
                  h.DataAttribute('slot', 'carousel-item'),
                ],
                [item.content],
              ),
            ),
          ),
        ],
      ),
      ...(viewInputs.showNavigation === false
        ? []
        : [
            navigationButton(model, viewInputs, 'previous', isHorizontal, h),
            navigationButton(model, viewInputs, 'next', isHorizontal, h),
          ]),
    ],
  )
})

type NavigationDirection = 'previous' | 'next'

const navigationButton = (
  model: Model,
  viewInputs: ViewInputs,
  direction: NavigationDirection,
  isHorizontal: boolean,
  h: HtmlBuilder<Message>,
): Html => {
  const isPrevious = direction === 'previous'
  const config = isPrevious ? viewInputs.previous : viewInputs.next
  return button(
    {
      variant: config?.variant ?? 'outline',
      size: config?.size ?? 'icon-sm',
      isDisabled: isPrevious ? model.index <= 0 : model.index >= model.scrollBound,
      onClick: isPrevious ? Message.PressedPrevious() : Message.PressedNext(),
      className: cn(
        isPrevious ? carouselPreviousClass : carouselNextClass,
        isHorizontal
          ? isPrevious
            ? carouselPreviousHorizontalClass
            : carouselNextHorizontalClass
          : isPrevious
            ? carouselPreviousVerticalClass
            : carouselNextVerticalClass,
        config?.className,
      ),
      attributes: [h.DataAttribute('slot', `carousel-${direction}`)],
    },
    [
      icon(h, isPrevious ? ChevronLeft : ChevronRight, 'cn-rtl-flip'),
      h.span([h.Class('sr-only')], [isPrevious ? 'Previous slide' : 'Next slide']),
    ],
    h,
  )
}
