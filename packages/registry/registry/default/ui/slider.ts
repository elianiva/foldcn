/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Slider from '@/components/ui/slider'`
 */
import { Effect, Match as M, Option, Schema as S, Stream } from 'effect'
import { Slider as FoldkitSlider } from '@foldkit/ui'
import { childAttributes, type ChildAttribute, type Html, type HtmlBuilder } from 'foldkit/html'
import * as Subscription from 'foldkit/subscription'

import { cn } from '@/lib/utils'

/**
 * foldcn gap vs upstream: single value / single thumb only (upstream is
 * multi-thumb; foldcn renders one thumb). Vertical orientation is wired
 * through `orientation` on `styledViewInputs`.
 */

export const init = FoldkitSlider.init
export const update = FoldkitSlider.update
export const view = FoldkitSlider.view
export const Model = FoldkitSlider.Model
export type Model = typeof Model.Type
export const Message = FoldkitSlider.Message
export type Message = typeof Message.Type
export const OutMessage = FoldkitSlider.OutMessage
export type OutMessage = typeof OutMessage.Type

export const snapAndClamp = FoldkitSlider.snapAndClamp
export const fractionOfValue = FoldkitSlider.fractionOfValue
export const reflectRange = FoldkitSlider.reflectRange

export type InitConfig = FoldkitSlider.InitConfig
export type ViewInputs = FoldkitSlider.ViewInputs
export type SliderAttributes = FoldkitSlider.SliderAttributes

/** Upstream SliderPrimitive.Control string. */
export const sliderRootClass =
  'cn-slider relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col'

/** Upstream SliderPrimitive.Track string. */
export const sliderTrackClass = 'cn-slider-track relative grow overflow-hidden select-none'

/** Upstream SliderPrimitive.Indicator string. */
export const sliderFilledTrackClass =
  'cn-slider-range select-none data-horizontal:h-full data-vertical:w-full'

/** Upstream SliderPrimitive.Thumb string. The disabled: variants are inert
 *  under foldkit (aria-/data- twins are inlined at style resolution). */
export const sliderThumbClass =
  'cn-slider-thumb block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50'

export const sliderLabelClass = 'text-sm font-medium'

export const sliderValueClass = 'text-sm tabular-nums text-muted-foreground'

export const sliderRowClass = 'flex flex-col gap-2 w-full'

export const sliderHeaderClass = 'flex items-center justify-between'

const LEFT_MOUSE_BUTTON = 0

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

const percentString = (fraction: number): string =>
  `${String(Math.round(fraction * 10000) / 100)}%`

const isVerticalTrack = (element: Element): boolean =>
  element.hasAttribute('data-vertical') || element.closest('[data-vertical]') !== null

const trackElement = (id: string, root: Document | ShadowRoot): Option.Option<Element> =>
  Option.fromNullishOr(root.querySelector(`[data-slider-track-id="${CSS.escape(id)}"]`))

export const valueFromPointer = (
  clientX: number,
  clientY: number,
  track: Element,
  min: number,
  max: number,
): number => {
  const rect = track.getBoundingClientRect()
  if (isVerticalTrack(track)) {
    if (rect.height === 0) return min
    const fraction = clamp(1 - (clientY - rect.top) / rect.height, 0, 1)
    return min + fraction * (max - min)
  }
  if (rect.width === 0) return min
  const fraction = clamp((clientX - rect.left) / rect.width, 0, 1)
  return min + fraction * (max - min)
}

const DragActivity = S.Literals(['Idle', 'Active'])

const dragActivityFromModel = (model: Model): 'Idle' | 'Active' =>
  M.value(model.dragState).pipe(
    M.withReturnType<'Idle' | 'Active'>(),
    M.tag('Dragging', () => 'Active' as const),
    M.orElse(() => 'Idle' as const),
  )

/** Drag subscriptions that map pointer position along the track axis, including
 *  vertical sliders marked with `data-vertical`. */
export const subscriptionsForRoot = (getTrackRoot: () => Document | ShadowRoot) =>
  Subscription.make<Model, Message>()(entry => ({
    dragPointer: entry(
      {
        dragActivity: DragActivity,
        id: S.String,
        min: S.Number,
        max: S.Number,
      },
      {
        modelToDependencies: model => ({
          dragActivity: dragActivityFromModel(model),
          id: model.id,
          min: model.min,
          max: model.max,
        }),
        dependenciesToStream: ({ dragActivity, id, min, max }): Stream.Stream<Message> => {
          const pointerEvents = Stream.merge(
            Stream.fromEventListener(document, 'pointermove').pipe(
              Stream.mapEffect((event: Event) =>
                Effect.sync(() => {
                  const pointerEvent = event as PointerEvent
                  return Option.flatMap(trackElement(id, getTrackRoot()), element =>
                    Option.some(
                      Message.MovedDragPointer({
                        value: valueFromPointer(
                          pointerEvent.clientX,
                          pointerEvent.clientY,
                          element,
                          min,
                          max,
                        ),
                      }),
                    ),
                  )
                }),
              ),
              Stream.filter(Option.isSome),
              Stream.map(option => option.value),
            ),
            Stream.fromEventListener(document, 'pointerup').pipe(
              Stream.map(() => Message.ReleasedDragPointer()),
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
              cursorStyle =>
                Effect.sync(() => {
                  document.documentElement.style.removeProperty('user-select')
                  document.documentElement.style.removeProperty('-webkit-user-select')
                  cursorStyle.remove()
                }),
            ).pipe(Effect.flatMap(() => Effect.never)),
          )

          return Stream.when(
            Stream.merge(pointerEvents, documentDragStyles),
            Effect.sync(() => dragActivity === 'Active'),
          ) as Stream.Stream<Message>
        },
      },
    ),
    dragEscape: entry(
      { dragActivity: DragActivity },
      {
        modelToDependencies: model => ({
          dragActivity: dragActivityFromModel(model),
        }),
        dependenciesToStream: ({ dragActivity }): Stream.Stream<Message> =>
          Stream.when(
            Stream.fromEventListener(document, 'keydown').pipe(
              Stream.filter((event: Event) => (event as KeyboardEvent).key === 'Escape'),
              Stream.map(() => Message.CancelledDrag()),
            ),
            Effect.sync(() => dragActivity === 'Active'),
          ) as Stream.Stream<Message>,
      },
    ),
  }))

export const subscriptions = subscriptionsForRoot(() => document)

type AttributeTag = string

const childAttributeTag = (child: ChildAttribute): AttributeTag =>
  (child.attribute as { readonly _tag: AttributeTag })._tag

const withoutAttributeTags = (
  attributes: ReadonlyArray<ChildAttribute>,
  tags: ReadonlySet<AttributeTag>,
): ReadonlyArray<ChildAttribute> =>
  attributes.filter(child => !tags.has(childAttributeTag(child)))

const patchVerticalTrackPointer = (
  track: ReadonlyArray<ChildAttribute>,
  id: string,
  min: number,
  max: number,
  currentValue: number,
  getTrackRoot: () => Document | ShadowRoot,
): ReadonlyArray<ChildAttribute> =>
  track.map(child => {
    if (childAttributeTag(child) !== 'OnPointerDown') return child
    return {
      ...child,
      attribute: {
        _tag: 'OnPointerDown' as const,
        toMaybeMessage: (
          _pointerType: string,
          button: number,
          _screenX: number,
          _screenY: number,
          _timeStamp: number,
          clientX: number,
          clientY: number,
        ) => {
          if (button !== LEFT_MOUSE_BUTTON) return Option.none()
          return Option.flatMap(trackElement(id, getTrackRoot()), element =>
            Option.some(
              Message.PressedPointer({
                value: valueFromPointer(clientX, clientY, element, min, max),
                originValue: currentValue,
              }),
            ),
          )
        },
      },
    }
  })

const orientAttributes = (
  attributes: SliderAttributes,
  orientation: 'horizontal' | 'vertical',
  fraction: number,
  model: { id: string; min: number; max: number },
  currentValue: number,
  getTrackRoot: () => Document | ShadowRoot,
  h: HtmlBuilder<unknown>,
): SliderAttributes => {
  if (orientation === 'horizontal') return attributes

  return {
    ...attributes,
    track: patchVerticalTrackPointer(
      attributes.track,
      model.id,
      model.min,
      model.max,
      currentValue,
      getTrackRoot,
    ),
    filledTrack: [
      ...withoutAttributeTags(attributes.filledTrack, new Set(['Style'])),
      ...childAttributes([
        h.Style({
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: percentString(fraction),
          width: '100%',
          'pointer-events': 'none',
        }),
      ]),
    ],
    thumb: [
      ...withoutAttributeTags(attributes.thumb, new Set(['Style', 'AriaOrientation'])),
      ...childAttributes([
        h.Style({
          position: 'absolute',
          bottom: percentString(fraction),
          left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          'touch-action': 'none',
        }),
        h.AriaOrientation('vertical'),
      ]),
    ],
  }
}

export type StyledViewInputs = Readonly<{
  value: number
  min?: number
  max?: number
  orientation?: 'horizontal' | 'vertical'
  label?: string
  formatValue?: (value: number) => string
  ariaLabel?: string
  ariaLabelledBy?: string
  isDisabled?: boolean
  isReadOnly?: boolean
  name?: string
  getTrackRoot?: () => Document | ShadowRoot
  rootClass?: string
  trackClass?: string
  filledTrackClass?: string
  thumbClass?: string
  rowClass?: string
  labelClass?: string
  valueClass?: string
  headerClass?: string
}>

/** Build styled `Slider.ViewInputs`. Pass your view's `h`. */
export const styledViewInputs = <M>(
  viewInputs: StyledViewInputs,
  h: HtmlBuilder<M>,
): ViewInputs => ({
  value: viewInputs.value,
  ariaLabel: viewInputs.ariaLabel,
  ariaLabelledBy: viewInputs.ariaLabelledBy,
  formatValue: viewInputs.formatValue,
  isDisabled: viewInputs.isDisabled,
  isReadOnly: viewInputs.isReadOnly,
  name: viewInputs.name,
  getTrackRoot: viewInputs.getTrackRoot,
  toView: (attributes): Html => {
    const orientation = viewInputs.orientation ?? 'horizontal'
    const min = viewInputs.min ?? 0
    const max = viewInputs.max ?? 100
    const fraction = fractionOfValue(viewInputs.value, min, max)
    const getTrackRoot = viewInputs.getTrackRoot ?? (() => document)
    const sliderId = attributes.root
      .map(child => {
        if (childAttributeTag(child) !== 'DataAttribute') return undefined
        const attr = child.attribute as { readonly key?: string; readonly value?: string }
        return attr.key === 'slider-id' ? attr.value : undefined
      })
      .find((id): id is string => id !== undefined)

    const orientedAttributes =
      sliderId === undefined
        ? attributes
        : orientAttributes(
            attributes,
            orientation,
            fraction,
            { id: sliderId, min, max },
            viewInputs.value,
            getTrackRoot,
            h as HtmlBuilder<unknown>,
          )

    const maybeHeader: Html =
      viewInputs.label === undefined
        ? h.empty
        : h.div(
            [h.Class(cn(sliderHeaderClass, viewInputs.headerClass))],
            [
              h.label(
                [...orientedAttributes.label, h.Class(cn(sliderLabelClass, viewInputs.labelClass))],
                [viewInputs.label],
              ),
              h.span(
                [h.Class(cn(sliderValueClass, viewInputs.valueClass))],
                [
                  viewInputs.formatValue === undefined
                    ? String(viewInputs.value)
                    : viewInputs.formatValue(viewInputs.value),
                ],
              ),
            ],
          )

    const maybeHiddenInput: Html =
      orientedAttributes.hiddenInput.length > 0
        ? h.input([...orientedAttributes.hiddenInput])
        : h.empty

    return h.div(
      [h.Class(cn(sliderRowClass, viewInputs.rowClass))],
      [
        maybeHeader,
        h.div(
          [
            ...orientedAttributes.root,
            h.DataAttribute('slot', 'slider'),
            h.DataAttribute('orientation', orientation),
            h.DataAttribute(orientation, ''),
            h.Class(cn(sliderRootClass, viewInputs.rootClass)),
          ],
          [
            h.div(
              [
                ...orientedAttributes.track,
                h.DataAttribute('slot', 'slider-track'),
                h.DataAttribute('orientation', orientation),
                h.DataAttribute(orientation, ''),
                h.Class(cn(sliderTrackClass, viewInputs.trackClass)),
              ],
              [
                h.div([
                  ...orientedAttributes.filledTrack,
                  h.DataAttribute('slot', 'slider-range'),
                  h.DataAttribute('orientation', orientation),
                  h.DataAttribute(orientation, ''),
                  h.Class(cn(sliderFilledTrackClass, viewInputs.filledTrackClass)),
                ]),
              ],
            ),
            h.div([
              ...orientedAttributes.thumb,
              h.DataAttribute('slot', 'slider-thumb'),
              h.Class(cn(sliderThumbClass, viewInputs.thumbClass)),
            ]),
          ],
        ),
        maybeHiddenInput,
      ],
    )
  },
})
