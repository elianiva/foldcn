/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update/subscriptions into your app:
 *  `import * as Carousel from '@/components/ui/carousel'`
 */
import { Effect, Option, Queue, Schema as S, Stream } from 'effect'
import { Command, Subscription, Update } from 'foldkit'
import EmblaCarousel, {
  type EmblaCarouselType,
  type EmblaOptionsType,
  type EmblaPluginType,
} from 'embla-carousel'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView } from 'foldkit/submodel'
import { evo } from 'foldkit/struct'

import { icon } from '@/lib/icons'
import { ChevronLeft, ChevronRight } from 'lucide'
import { cn } from '@/lib/utils'

import { button, type ButtonSize, type ButtonVariant } from './button'

// A carousel backed by the embla-carousel engine (the same dependency upstream
// shadcn ships), owned by this Submodel: the scroll subscription mounts the
// engine on the viewport when it appears in the DOM and tears it down when it
// leaves, `select` events flow back as SelectedSlide, and Prev/Next (buttons
// and ArrowLeft/ArrowRight anywhere inside the region) dispatch scroll
// commands against the mounted engine. The model mirrors the upstream
// useCarousel context values (index, canScrollPrev, canScrollNext).
//
// foldcn deltas vs upstream: embla options are a serializable schema subset
// carried on the model (plugins are instances and cannot live in a schema —
// register them with `configure`); there is no setApi hand-off — listen for
// ChangedIndex out-messages instead.

export const Orientation = S.Literals(['horizontal', 'vertical'])
export type Orientation = typeof Orientation.Type

/** Serializable subset of embla's options, carried on the model so option
 *  changes re-mount the engine with the new configuration. */
export const Options = S.Struct({
  align: S.optional(S.Literals(['start', 'center', 'end'])),
  loop: S.optional(S.Boolean),
  duration: S.optional(S.Number),
  startIndex: S.optional(S.Number),
  direction: S.optional(S.Literals(['ltr', 'rtl'])),
  containScroll: S.optional(S.Literals(['trimSnaps', 'keepSnaps', false])),
  slidesToScroll: S.optional(S.Number),
})
export type Options = typeof Options.Type

/** Upstream Carousel root string. */
export const carouselClass = 'relative'

/** Upstream CarouselContent viewport string (embla root). */
export const carouselContentClass = 'overflow-hidden'

/** Upstream CarouselContent track strings. */
export const carouselTrackClass = 'flex'
export const carouselTrackHorizontalClass = '-ml-4'
export const carouselTrackVerticalClass = '-mt-4 flex-col'

/** Upstream CarouselItem strings. */
export const carouselItemClass = 'min-w-0 shrink-0 grow-0 basis-full'
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

/** DOM id of the embla viewport for a carousel id. */
export const contentElementId = (id: string): string => `${id}-content`

// PLUGIN / ENGINE REGISTRIES
//
// Embla plugin instances (autoplay, …) are stateful objects — they cannot be
// serialized into the model, so callers register them per id before mount:
// `Carousel.configure('my-carousel', { plugins: [Autoplay(…)] })`.
// The mounted engine is keyed by id here: the scroll subscription writes it
// on attach and removes it on detach, and the scroll commands read it.

const pluginsById = new Map<string, EmblaPluginType[]>()

export type CarouselConfiguration = Readonly<{
  plugins?: EmblaPluginType[]
}>

/** Registers non-serializable engine configuration (plugins) for a carousel
 *  id. Call at module scope, before the carousel mounts. */
export const configure = (id: string, config: CarouselConfiguration): void => {
  pluginsById.set(id, config.plugins ?? [])
}

const engineById = new Map<string, EmblaCarouselType>()

// MODEL

export const Model = S.Struct({
  id: S.String,
  orientation: Orientation,
  /** Number of slides, matching the view's items array. */
  count: S.Number,
  /** Selected slide index (0-based), from embla's selectedScrollSnap. */
  index: S.Number,
  /** Mirrors embla's canScrollPrev/canScrollNext (always true when loop). */
  canScrollPrev: S.Boolean,
  canScrollNext: S.Boolean,
  options: Options,
})
export type Model = typeof Model.Type

// MESSAGES

export const Message = defineMessageUnion({
  /** The user (or a caller) asked for the previous slide. */
  PressedPrevious: {},
  /** The user (or a caller) asked for the next slide. */
  PressedNext: {},
  /** The engine reported a selection change (embla select/reInit). */
  SelectedSlide: {
    index: S.Number,
    canScrollPrev: S.Boolean,
    canScrollNext: S.Boolean,
  },
  /** A scroll command finished touching the engine; nothing to do. */
  CompletedScrollCommand: {},
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
  /** Serializable embla options (see `Options`). Plugins go through
   *  `configure` instead. */
  options?: Options
}>

/** Creates an initial carousel model. canScroll flags start from the
 *  configured startIndex/loop and are corrected by the engine's first
 *  SelectedSlide. */
export const init = (config: InitConfig): Model => {
  const options = config.options ?? {}
  const index = Math.min(Math.max(options.startIndex ?? 0, 0), Math.max(0, config.count - 1))
  const loop = options.loop === true
  return {
    id: config.id,
    orientation: config.orientation ?? 'horizontal',
    count: config.count,
    index,
    canScrollPrev: loop || index > 0,
    canScrollNext: loop || index < config.count - 1,
    options,
  }
}

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const selected = (
  model: Model,
  index: number,
  canPrev: boolean,
  canNext: boolean,
): UpdateReturn => {
  if (index === model.index && canPrev === model.canScrollPrev && canNext === model.canScrollNext) {
    return { model }
  }
  const next = evo(model, {
    index: () => index,
    canScrollPrev: () => canPrev,
    canScrollNext: () => canNext,
  })
  if (index === model.index) return { model: next }
  return {
    model: next,
    outMessage: OutMessage.ChangedIndex({ index }),
  }
}

/** Processes a carousel message and returns the next model, commands, and an
 *  optional out-message for the parent. */
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'PressedPrevious':
      return { model, commands: [ScrollPrevious({ id: model.id })] }
    case 'PressedNext':
      return { model, commands: [ScrollNext({ id: model.id })] }
    case 'SelectedSlide':
      return selected(model, message.index, message.canScrollPrev, message.canScrollNext)
    case 'CompletedScrollCommand':
      return { model }
  }
}

// COMMANDS

const engineEffect = (id: string, run: (engine: EmblaCarouselType) => void) =>
  Effect.sync(() => {
    const engine = engineById.get(id)
    if (engine !== undefined) run(engine)
    return Message.CompletedScrollCommand()
  })

/** Scrolls the mounted engine one slide back/forward (no-op while the engine
 *  is not mounted, e.g. between mount and subscription start). */
export const ScrollPrevious = Command.define('ScrollPrevious', {
  args: { id: S.String },
  messages: [Message.CompletedScrollCommand],
  execute: ({ id }) => engineEffect(id, (engine) => engine.scrollPrev()),
})

export const ScrollNext = Command.define('ScrollNext', {
  args: { id: S.String },
  messages: [Message.CompletedScrollCommand],
  execute: ({ id }) => engineEffect(id, (engine) => engine.scrollNext()),
})

/** Scrolls the mounted engine to a slide; `jump` skips the animation. */
export const ScrollTo = Command.define('ScrollTo', {
  args: { id: S.String, index: S.Number, jump: S.optional(S.Boolean) },
  messages: [Message.CompletedScrollCommand],
  execute: ({ id, index, jump }) =>
    engineEffect(id, (engine) => engine.scrollTo(index, jump === true)),
})

// SUBSCRIPTIONS

const toEmblaOptions = (orientation: Orientation, options: Options): EmblaOptionsType => {
  const embla: EmblaOptionsType = { axis: orientation === 'horizontal' ? 'x' : 'y' }
  if (options.align !== undefined) embla.align = options.align
  if (options.loop !== undefined) embla.loop = options.loop
  if (options.duration !== undefined) embla.duration = options.duration
  if (options.startIndex !== undefined) embla.startIndex = options.startIndex
  if (options.direction !== undefined) embla.direction = options.direction
  if (options.containScroll !== undefined) embla.containScroll = options.containScroll
  if (options.slidesToScroll !== undefined) embla.slidesToScroll = options.slidesToScroll
  return embla
}

const report = (engine: EmblaCarouselType): Message =>
  Message.SelectedSlide({
    index: engine.selectedScrollSnap(),
    canScrollPrev: engine.canScrollPrev(),
    canScrollNext: engine.canScrollNext(),
  })

/** Owns the engine's lifecycle: a MutationObserver reconciles the viewport
 *  element (looked up by id — the element can be inserted/removed by any
 *  parent, so route changes and style switches re-attach without consumer
 *  help). On attach it mounts embla with the model's options and the
 *  registered plugins and feeds select/reInit back as SelectedSlide; on
 *  detach it destroys the engine. */
export const subscriptions = Subscription.make<Model, Message>()((entry) => ({
  engineEvents: entry(
    { id: S.String, orientation: Orientation, options: Options },
    {
      modelToDependencies: (model) => ({
        id: model.id,
        orientation: model.orientation,
        options: model.options,
      }),
      dependenciesToStream: ({ id, orientation, options }) =>
        Stream.callback((queue) =>
          Effect.acquireRelease(
            Effect.sync(() => {
              let engine: EmblaCarouselType | undefined
              let observer: MutationObserver | undefined

              const detach = () => {
                if (engine !== undefined) {
                  engineById.delete(id)
                  engine.destroy()
                  engine = undefined
                }
              }
              const attach = (element: HTMLElement) => {
                const mounted = EmblaCarousel(
                  element,
                  toEmblaOptions(orientation, options),
                  pluginsById.get(id) ?? [],
                )
                engineById.set(id, mounted)
                engine = mounted
                mounted.on('select', () => Queue.offerUnsafe(queue, report(mounted)))
                mounted.on('reInit', () => Queue.offerUnsafe(queue, report(mounted)))
                Queue.offerUnsafe(queue, report(mounted))
              }

              const reconcile = () => {
                const element = document.getElementById(contentElementId(id))
                if (element === null) {
                  detach()
                  return
                }
                if (engine !== undefined && engine.rootNode() === element) return
                // Wait for the slides to be in the DOM before mounting.
                if (element.querySelector('[data-slot="carousel-item"]') === null) return
                detach()
                attach(element)
              }

              observer = new MutationObserver(() => reconcile())
              observer.observe(document.documentElement, { childList: true, subtree: true })
              reconcile()

              return {
                dispose: () => {
                  observer?.disconnect()
                  detach()
                },
              }
            }),
            (state) => Effect.sync(() => state.dispose()),
          ).pipe(Effect.flatMap(() => Effect.never)),
        ),
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
  /** Class for the flex track (upstream CarouselContent's inner div, where
   *  upstream puts its className) — spacing overrides like -ml-1 and sizing
   *  like a vertical height belong here, exactly like upstream. */
  contentClassName?: string
  /** Upstream renders CarouselPrevious/CarouselNext as separate parts; here
   *  they are built-in, disable with false. */
  showNavigation?: boolean
  previous?: CarouselButtonConfig
  next?: CarouselButtonConfig
}>

/** Renders the carousel region: viewport, track, and navigation buttons.
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
          h.Class(carouselContentClass),
          h.DataAttribute('slot', 'carousel-content'),
        ],
        [
          h.div(
            [
              h.Class(
                cn(
                  carouselTrackClass,
                  isHorizontal ? carouselTrackHorizontalClass : carouselTrackVerticalClass,
                  viewInputs.contentClassName,
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
      isDisabled: isPrevious ? !model.canScrollPrev : !model.canScrollNext,
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
