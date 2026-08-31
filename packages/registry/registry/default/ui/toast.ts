/** Toast notifications — transient message stack with auto-dismiss, backed by
 *  the @foldkit/ui Toast submodel.
 *
 *  Usage: `import * as ToastModule from '@/components/ui/toast'`
 *
 *  1. Bind your payload schema once (module scope):
 *       export const Toast = ToastModule.make(S.Struct({ title: S.String }))
 *  2. Embed `Toast.Model` in your app Model (`toast: Toast.Model`), init it
 *     (`Toast.init({ id: 'toast' })`), route `Toast.Message` through your
 *     update, and show/dismiss via `Toast.show` / `Toast.dismiss` /
 *     `Toast.dismissAll`.
 *  3. Render the stack with `h.submodel({ slotId: model.toast.id,
 *     model: model.toast, view: Toast.view, viewInputs:
 *     Toast.styledViewInputs(model.toast, { position: 'BottomRight',
 *     toContent: (entry, h) => [...] }, h) })`.
 *
 *  Presentation mirrors upstream shadcn `toast.tsx` (Base UI toast): entries
 *  dock bottom-right in a collapsed stack — every card takes the frontmost
 *  toast's height, older layers scale down and peek `0.75rem` above the one
 *  in front — and expand into a spread list (exact per-entry offsets computed
 *  from measured heights) while any entry is hovered. Entering toasts slide
 *  up from below the viewport; dismissed ones slide back down while the
 *  survivors glide into their new slots; at most 3 entries are visible
 *  (older overflow renders with `data-limited`, matching Base UI's default
 *  limit). All motion rides compositor-only CSS transitions on
 *  `transform` and `opacity` (`height` is applied instantly without a
 *  transition to avoid layout thrashing — see `toastEntryClass`).
 *
 *  Like Base UI, entry heights are measured in the DOM: after each `show`,
 *  a background command reads the new card's natural height after paint and
 *  stores it in the model. Heights are measured once per entry — they don't
 *  re-measure on window resize. Before a measurement lands, cards render at
 *  natural height with an approximate %-based stack, then settle exactly.
 *
 *  ⚠ BEHAVIOR GAP vs upstream: no swipe-to-dismiss — foldkit has no
 *  pointer-move gesture primitive yet. Auto-dismiss, hover-pause,
 *  hover-to-expand, the stacked/expanded choreography, and manual close all
 *  work as expected.
 */

import { Effect, Option, Schema as S, pipe } from 'effect'
import * as Command from 'foldkit/command'
import { Toast as FoldkitToast } from '@foldkit/ui'
import type { Attribute, ChildAttribute, Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Render from 'foldkit/render'
import { evo } from 'foldkit/struct'
import { defineView } from 'foldkit/submodel'
import * as Update from 'foldkit/update'

type Child = Html | string

import { icon } from '@/lib/icons'
import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert, X } from 'lucide'
import { cn } from '@/lib/utils'

export const Variant = FoldkitToast.Variant
export type Variant = typeof Variant.Type
export const Position = FoldkitToast.Position
export type Position = typeof Position.Type
export type EntryHandlers = FoldkitToast.EntryHandlers
export type InitConfig = FoldkitToast.InitConfig
export type ShowInput<A> = FoldkitToast.ShowInput<A>

const DEFAULT_POSITION: Position = 'BottomRight'

/** Vertical gap between layers — collapsed peek offset and expanded
 *  spacing. Mirrors Base UI's `--gap: 0.75rem`. */
const GAP_PX = 12
/** Scale step per layer behind the frontmost one. Mirrors Base UI's
 *  `--scale: max(0, 1 - index * 0.1)`. */
const SCALE_STEP = 0.1
/** Maximum simultaneously visible entries (Base UI ToastProvider default). */
const LIMIT = 3

const isLeavingState = (
  state: 'Idle' | 'EnterStart' | 'EnterAnimating' | 'LeaveStart' | 'LeaveAnimating',
): boolean => state === 'LeaveStart' || state === 'LeaveAnimating'

/** Accent for the per-variant icon. Only `Error` needs an explicit tint
 *  (`text-destructive`); the other variants inherit `currentColor` on the
 *  neutral popover surface, matching the reference `toast.tsx` where only
 *  the error icon is colored. */
export const toastVariantClass = (variant: Variant): string =>
  variant === 'Error' ? 'text-destructive' : ''

/** Entry card. Geometry (transform/height) is applied inline per render;
 *  the `after:` bridge extends the hover zone `--gap` + 1px below the card
 *  so the pointer can cross between stacked layers without a dead zone,
 *  exactly like the reference root class. Entries beyond `LIMIT` render with
 *  `data-limited` and are fully hidden until a slot frees up. */
export const toastEntryClass =
  'cn-toast pointer-events-auto absolute right-0 bottom-0 w-80 origin-bottom rounded-lg border bg-popover text-popover-foreground shadow-lg [transform:translateZ(0)] [contain:layout] [backface-visibility:hidden] outline-none select-none after:absolute after:top-full after:left-0 after:h-[calc(0.75rem+1px)] after:w-full after:content-[""] [transition:transform_350ms_cubic-bezier(0.22,1,0.36,1),opacity_350ms] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[limited]:pointer-events-none data-[limited]:opacity-0'

/** Content row — the reference `ToastContent`: full card height, clipped,
 *  fading out while hidden behind the frontmost layer (`data-behind`) and
 *  back in when the stack expands (`data-expanded`). */
export const toastContentClass =
  'flex h-full w-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-[behind]:opacity-0 data-[expanded]:opacity-100'

export const toastTitleClass = 'text-sm font-medium'

export const toastDescriptionClass = 'text-sm text-muted-foreground'

export const toastDismissButtonClass =
  "shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:text-foreground hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 after:absolute after:-inset-2 after:content-['']"

export const toastActionClass = 'shrink-0'

/** Action button for a toast (e.g. Undo). Mirrors upstream `ToastAction`
 *  which renders a `Button` with `variant="outline" size="sm"`.
 *  Render it inside `toContent` and wire `handlers.dismiss` or your own
 *  action via `attributes`. */
export const toastAction = <M>(
  attributes: ReadonlyArray<Attribute<M> | ChildAttribute>,
  config: Readonly<{ className?: string }>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.button(
    [
      ...attributes,
      h.DataAttribute('slot', 'toast-action'),
      h.Class(
        cn(
          'cn-button cn-button-variant-outline cn-button-size-sm',
          toastActionClass,
          config.className,
        ),
      ),
      h.Type('button'),
    ],
    children,
  )

const variantIconNode = (variant: Variant) => {
  switch (variant) {
    case 'Success':
      return CircleCheck
    case 'Info':
      return Info
    case 'Warning':
      return TriangleAlert
    case 'Error':
      return OctagonX
    default:
      return Info
  }
}

/** Render the per-variant icon, mirroring the reference `ToastIcon`.
 *  `loading` is not a `Variant` in the Foldkit schema, so it is not handled
 *  here — render a spinner from your payload via `toContent` if you need a
 *  loading state. */
export const toastIcon = <M>(h: HtmlBuilder<M>, variant: Variant): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'toast-icon'),
      h.Class("shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"),
    ],
    [icon(h, variantIconNode(variant), cn('size-4 shrink-0', toastVariantClass(variant)))],
  )

/** Spinner icon for ad-hoc loading toasts. Not driven by `Variant` — use
 *  from `toContent` when your payload represents a loading state. */
export const toastLoadingIcon = <M>(h: HtmlBuilder<M>): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'toast-icon'),
      h.Class("shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"),
    ],
    [icon(h, LoaderCircle, 'size-4 shrink-0 animate-spin')],
  )

/** Reads the natural height of every entry card in the stack. Cards whose
 *  height is already known render with the frontmost's height (the collapsed
 *  uniform-height rule), so only never-measured cards — which render at
 *  natural height — contribute meaningful values. Runs after paint so the
 *  just-mounted card is in the DOM. */
const measureHeights = (containerId: string): Readonly<Record<string, number>> => {
  if (typeof document === 'undefined') {
    return {}
  }
  const container = document.getElementById(containerId)
  if (container === null) {
    return {}
  }
  const heights: Record<string, number> = {}
  // Batched read: single query + single layout pass via
  // getBoundingClientRect (sub-pixel accurate, coalesced after paint).
  // offsetHeight per-card would each force a reflow. Cards whose heights
  // are already known render with the frontmost's forced height, so the
  // natural value is irrelevant — mergeHeights discards those reads.
  const items = container.querySelectorAll(':scope > li[id]')
  for (const item of Array.from(items)) {
    if (!(item instanceof HTMLElement) || item.id === '') {
      continue
    }
    const card = item.querySelector(':scope > [data-slot="toast"]')
    if (!(card instanceof HTMLElement)) {
      continue
    }
    const h = card.getBoundingClientRect().height
    if (h > 0) {
      heights[item.id] = Math.round(h)
    }
  }
  return heights
}

/** Per-entry placement for the current frame, mirroring Base UI's CSS
 *  variables (`--toast-index`, `--toast-offset-y`, `--height`, `--scale`,
 *  `--shrink`) computed from measured heights:
 *
 *  - Collapsed: every card takes the frontmost's height; layer `k` lifts by
 *    `k * gap + shrink * frontmostHeight` and scales to
 *    `max(0, 1 - k * 0.1)` around its bottom edge, so each layer's top edge
 *    peeks exactly `gap` above the layer in front regardless of mixed
 *    content heights.
 *  - Expanded (any entry hovered): layers separate to their own measured
 *    height, offset by the cumulative height of the layers in front plus
 *    one gap each.
 *  - Enter start / leaving: `translate3d(0, 150%, 0)` — below the viewport
 *    (translate3d promotes to the compositor, unlike translateY).
 */
type Placement = Readonly<{
  transform: string
  height: string
  isBehind: boolean
  isLimited: boolean
  isExpanded: boolean
}>

/** Structural subset of a bound toast entry the placement math needs. */
type PlacementEntry = Readonly<{
  id: string
  isHovered: boolean
  animation: Readonly<{
    transitionState: 'Idle' | 'EnterStart' | 'EnterAnimating' | 'LeaveStart' | 'LeaveAnimating'
  }>
}>

const makePlacementFor = (
  entries: ReadonlyArray<PlacementEntry>,
  heights: Readonly<Record<string, number>>,
) => {
  const isExpanded = entries.some(({ isHovered }) => isHovered)
  const nonLeaving = entries.filter(
    (candidate) => !isLeavingState(candidate.animation.transitionState),
  )
  // Only the newest `LIMIT` non-leaving entries participate in the stack
  // layout; older overflow renders hidden with `data-limited` (Base UI's
  // default limit behavior) until a slot frees up.
  const alive = nonLeaving.slice(-LIMIT)
  const limitedIds = new Set(nonLeaving.slice(0, -LIMIT).map(({ id }) => id))
  const frontmost = alive.length > 0 ? alive[alive.length - 1] : undefined
  const frontHeight = frontmost === undefined ? undefined : heights[frontmost.id]

  // Expanded offset per entry: negative cumulative height of the layers in
  // front plus one gap each (frontmost stays at 0).
  const expandedOffset = new Map<string, number>()
  let cumulative = 0
  for (let index = alive.length - 1; index >= 0; index -= 1) {
    const candidate = alive[index]
    if (candidate === undefined) {
      continue
    }
    expandedOffset.set(candidate.id, -cumulative)
    cumulative += (heights[candidate.id] ?? 0) + GAP_PX
  }

  return (entry: PlacementEntry): Placement => {
    const ownHeight = heights[entry.id]
    const isLimited = limitedIds.has(entry.id)
    const aliveIndex = alive.indexOf(entry)
    const indexFromFront =
      aliveIndex === -1
        ? nonLeaving.length - 1 - nonLeaving.indexOf(entry)
        : alive.length - 1 - aliveIndex
    const state = entry.animation.transitionState

    if (isLeavingState(state)) {
      return {
        transform: 'translate3d(0, 150%, 0)',
        height:
          ownHeight === undefined
            ? 'auto'
            : `${isExpanded ? ownHeight : (frontHeight ?? ownHeight)}px`,
        isBehind: false,
        isLimited: false,
        isExpanded,
      }
    }

    if (state === 'EnterStart') {
      // Starting style: mount below the viewport at the collapsed height;
      // the next frame drops this and the transition glides the card in.
      return {
        transform: 'translate3d(0, 150%, 0)',
        height: ownHeight === undefined ? 'auto' : `${frontHeight ?? ownHeight}px`,
        isBehind: false,
        isLimited,
        isExpanded: false,
      }
    }

    if (isLimited) {
      // Overflow beyond LIMIT: hold a collapsed pose behind the visible
      // stack, fully hidden via the card's data-limited CSS, until a slot
      // frees up. Never joins the expanded spread.
      const scale = Math.max(0, 1 - indexFromFront * SCALE_STEP)
      return {
        transform: `translate3d(0, ${-(indexFromFront * GAP_PX + (1 - scale) * (frontHeight ?? ownHeight ?? 0))}px, 0) scale(${scale.toFixed(2)})`,
        height: ownHeight === undefined ? 'auto' : `${frontHeight ?? ownHeight}px`,
        isBehind: true,
        isLimited: true,
        isExpanded: false,
      }
    }

    if (isExpanded) {
      return {
        transform: `translate3d(0, ${expandedOffset.get(entry.id) ?? 0}px, 0)`,
        height: ownHeight === undefined ? 'auto' : `${ownHeight}px`,
        isBehind: false,
        isLimited,
        isExpanded: true,
      }
    }

    const scale = Math.max(0, 1 - indexFromFront * SCALE_STEP)
    if (frontHeight !== undefined && ownHeight !== undefined) {
      // Measured: exact lift — peek offset plus this layer's scale shrink
      // against the frontmost's height (the uniform collapsed card height).
      // translate3d keeps this on the compositor thread.
      return {
        transform: `translate3d(0, ${-(indexFromFront * GAP_PX + (1 - scale) * frontHeight)}px, 0) scale(${scale.toFixed(2)})`,
        height: `${frontHeight}px`,
        isBehind: indexFromFront > 0,
        isLimited,
        isExpanded: false,
      }
    }
    // Pre-measurement fallback: lift by percentages of the card's own height
    // until the measure command reports back.
    return {
      transform: `translate3d(0, calc(${indexFromFront * -GAP_PX}px - ${indexFromFront * SCALE_STEP * 100}%), 0) scale(${scale.toFixed(2)})`,
      height: 'auto',
      isBehind: indexFromFront > 0,
      isLimited,
      isExpanded: false,
    }
  }
}

/** Bind a toast stack to your payload schema. Wraps `@foldkit/ui`'s
 *  `Toast.make` with measured entry heights (a background command measures
 *  each new card after paint) and a `styledViewInputs` renderer that
 *  produces the stacked, animated presentation for `h.submodel`.
 *
 *  ```ts
 *  export const Toast = ToastModule.make(S.Struct({
 *    title: S.String,
 *    description: S.Option(S.String),
 *  }))
 *  ```
 */
export const make = <A, I>(payloadSchema: S.Codec<A, I>) => {
  const Bound = FoldkitToast.make(payloadSchema)
  type BoundMessage = typeof Bound.Message.Type
  type BoundOutMessage = typeof Bound.OutMessage.Type
  type Entry = typeof Bound.Entry.Type

  const Model = S.Struct({
    id: S.String,
    toast: Bound.Model,
    heights: S.Record(S.String, S.Number),
  })
  type Model = typeof Model.Type

  const Message = defineMessageUnion({
    GotHeights: { heights: S.Record(S.String, S.Number) },
    GotToastMessage: { message: Bound.Message },
  })
  type Message = typeof Message.Type

  const OutMessage = defineMessageUnion({
    DismissedToast: { payload: payloadSchema },
  })
  type OutMessage = typeof OutMessage.Type

  type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

  /** Measures the stack after paint and reports natural card heights. */
  const MeasureHeights = Command.define('MeasureToastHeights', {
    args: { containerId: S.String },
    messages: [Message.GotHeights],
    execute: ({ containerId }) =>
      pipe(
        Render.afterPaint,
        Effect.map(() => Message.GotHeights({ heights: measureHeights(containerId) })),
      ),
  })

  const toGotToastMessage = (message: BoundMessage): Message => Message.GotToastMessage({ message })

  const foldToast = Update.foldChild({
    update: Bound.update,
    read: (model: Model) => Option.some(model.toast),
    write: (model, nextToast) => evo(model, { toast: () => nextToast }),
    toParentMessage: toGotToastMessage,
    toParentOutMessage: (outMessage: BoundOutMessage): OutMessage =>
      OutMessage.DismissedToast({ payload: outMessage.payload }),
  })

  /** Merges newly measured heights. Heights of known entries are kept —
   *  measured cards render height-forced, so re-reading them would capture
   *  the forced value, not the natural one. Stale ids are pruned. */
  const mergeHeights = (model: Model, measured: Readonly<Record<string, number>>): Model => {
    const knownIds = new Set(model.toast.entries.map(({ id }) => id))
    const heights: Record<string, number> = {}
    for (const [id, height] of Object.entries(model.heights)) {
      if (knownIds.has(id)) {
        heights[id] = height
      }
    }
    for (const [id, height] of Object.entries(measured)) {
      if (!Object.hasOwn(heights, id)) {
        heights[id] = height
      }
    }
    return evo(model, { heights: () => heights })
  }

  /** Processes a toast message. Delegates to the bound toast update and
   *  schedules a height measurement whenever an entry is added. */
  const update = (model: Model, message: Message): UpdateReturn =>
    Message.match<UpdateReturn>(message, {
      GotHeights: ({ heights }) => ({ model: mergeHeights(model, heights) }),
      GotToastMessage: ({ message: toastMessage }) => {
        const { model: nextModel, commands = [], outMessage: out } = foldToast(model, toastMessage)
        const measure =
          toastMessage._tag === 'Added' ? [MeasureHeights({ containerId: nextModel.toast.id })] : []
        return Update.withOutMessage({ model: nextModel, commands: [...commands, ...measure] }, out)
      },
    })

  /** Adds a toast entry and schedules its height measurement. */
  const show = (model: Model, input: FoldkitToast.ShowInput<A>): UpdateReturn => {
    const { model: nextToast, commands = [], outMessage: out } = Bound.show(model.toast, input)
    return Update.withOutMessage(
      {
        model: evo(model, { toast: () => nextToast }),
        commands: [
          ...Command.mapMessages(commands, toGotToastMessage),
          MeasureHeights({ containerId: nextToast.id }),
        ],
      },
      out,
    )
  }

  /** Begins dismissing a specific entry. */
  const dismiss = (model: Model, entryId: string): UpdateReturn => {
    const { model: nextToast, commands = [], outMessage: out } = Bound.dismiss(model.toast, entryId)
    return Update.withOutMessage(
      {
        model: evo(model, { toast: () => nextToast }),
        commands: Command.mapMessages(commands, toGotToastMessage),
      },
      out,
    )
  }

  /** Begins dismissing every currently-visible entry. */
  const dismissAll = (model: Model): UpdateReturn => {
    const { model: nextToast, commands = [], outMessage: out } = Bound.dismissAll(model.toast)
    return Update.withOutMessage(
      {
        model: evo(model, { toast: () => nextToast }),
        commands: Command.mapMessages(commands, toGotToastMessage),
      },
      out,
    )
  }

  /** Creates an initial toast container model from a config. Starts empty
   *  with no measurements; the first `show` measures after paint. */
  const init = (config: FoldkitToast.InitConfig): Model => ({
    id: config.id,
    toast: Bound.init(config),
    heights: {},
  })

  type ViewInputs = Readonly<{
    position: Position
    ariaLabel?: string
    containerClassName?: string
    entryClassName?: string
    entryToView: (entry: Entry, handlers: EntryHandlers) => Html
  }>

  /** Renders the stack: a headless wrapper around the bound toast view that
   *  feeds each entry's measured placement into `entryToView`. */
  const view = defineView<Model, Message, ViewInputs>((model, viewInputs, h) =>
    h.submodel({
      slotId: 'stack',
      model: model.toast,
      view: Bound.view,
      viewInputs: viewInputs,
      toParentMessage: toGotToastMessage,
    }),
  )

  /** Build the `viewInputs` for `h.submodel`. `toContent` renders the
   *  payload column between the variant icon and the close button; render
   *  action buttons there when you need them. */
  const styledViewInputs = <M2>(
    model: Model,
    config: Readonly<{
      position?: Position
      ariaLabel?: string
      containerClassName?: string
      /** Extra classes merged onto each entry card (e.g. a width override
       *  over the `w-80` default). */
      className?: string
      toContent: (entry: Entry, h: HtmlBuilder<M2>) => ReadonlyArray<Child>
    }>,
    h: HtmlBuilder<M2>,
  ): ViewInputs => {
    const position = config.position ?? DEFAULT_POSITION
    const placementFor = makePlacementFor(model.toast.entries, model.heights)

    const entryToView = (entry: Entry, handlers: EntryHandlers): Html => {
      const placement = placementFor(entry)

      return h.div(
        [
          h.DataAttribute('slot', 'toast'),
          ...(placement.isExpanded ? [h.DataAttribute('expanded', '')] : []),
          ...(placement.isLimited ? [h.DataAttribute('limited', '')] : []),
          // Docked inside the fixed <ol>'s 16px padding so the stack sits
          // inset from the viewport corner like upstream's viewport.
          h.Style({
            right: '1rem',
            bottom: '1rem',
            height: placement.height,
            transform: placement.transform,
          }),
          h.Class(cn(toastEntryClass, config.className)),
        ],
        [
          h.div(
            [
              h.DataAttribute('slot', 'toast-content'),
              ...(placement.isBehind ? [h.DataAttribute('behind', '')] : []),
              ...(placement.isExpanded ? [h.DataAttribute('expanded', '')] : []),
              ...(placement.isLimited ? [h.DataAttribute('limited', '')] : []),
              h.Class(toastContentClass),
            ],
            [
              toastIcon(h, entry.variant),
              h.div([h.Class('flex min-w-0 flex-1 flex-col gap-1')], config.toContent(entry, h)),
              h.button(
                [
                  ...handlers.dismiss,
                  h.Class(toastDismissButtonClass),
                  h.AriaLabel('Close toast'),
                  h.DataAttribute('slot', 'toast-close'),
                ],
                [icon(h, X)],
              ),
            ],
          ),
        ],
      )
    }

    return {
      position,
      ...(config.ariaLabel !== undefined && { ariaLabel: config.ariaLabel }),
      ...(config.containerClassName !== undefined && {
        containerClassName: config.containerClassName,
      }),
      entryToView,
    }
  }

  return {
    ...Bound,
    Model,
    Message,
    OutMessage,
    init,
    update,
    show,
    dismiss,
    dismissAll,
    view,
    styledViewInputs,
  } as const
}
