import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Subscription } from 'foldkit'

import * as carousel from '../../generated/registry/ui/carousel'
import { Card } from '../../generated/registry/ui/card'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotCarouselMessage: { message: carousel.Message },
  GotCarouselOrientationMessage: { message: carousel.Message },
  GotCarouselSizeMessage: { message: carousel.Message },
  GotCarouselSpacingMessage: { message: carousel.Message },
  GotCarouselApiMessage: { message: carousel.Message },
})
type CarouselMessage =
  | typeof Message.GotCarouselMessage.Type
  | typeof Message.GotCarouselOrientationMessage.Type
  | typeof Message.GotCarouselSizeMessage.Type
  | typeof Message.GotCarouselSpacingMessage.Type
  | typeof Message.GotCarouselApiMessage.Type

const SLIDE_COUNT = 5

// Upstream demos wrap each card in a p-1 div and size the number per example;
// the spacing example drops the wrapper (its pl-1 IS the spacing) and uses
// text-2xl.
const slide = (
  n: number,
  config: Readonly<{ wrapperClass?: string; numberClass?: string }>,
  h: HtmlBuilder<AppMessage>,
): Html => {
  const card = Card<AppMessage>(
    {},
    [
      Card.content<AppMessage>(
        { className: 'flex aspect-square items-center justify-center p-6' },
        [h.span([h.Class(config.numberClass ?? 'text-4xl font-semibold')], [String(n)])],
        h,
      ),
    ],
    h,
  )
  if (config.wrapperClass === undefined) return h.div([h.Class('p-1')], [card])
  if (config.wrapperClass === '') return card
  return h.div([h.Class(config.wrapperClass)], [card])
}

const slides = (
  count: number,
  config: Readonly<{ wrapperClass?: string; numberClass?: string; itemClass?: string }>,
  h: HtmlBuilder<AppMessage>,
): carousel.CarouselItemInput[] =>
  Array.from({ length: count }, (_, index) => {
    const item: carousel.CarouselItemInput = { content: slide(index + 1, config, h) }
    if (config.itemClass !== undefined) return { ...item, className: config.itemClass }
    return item
  })

const section = (label: string, content: Html, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-2')],
    [h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], [label]), content],
  )

// Spacing notes per example (mirrors the upstream demos): the track's -ml-N
// and each item's pl-N pair with the carousel's `spacing` value so snap
// positions stay on slide content — 1rem with the default -ml-4/pl-4,
// 0.25rem with the -ml-1/pl-1 examples. The vertical example's height lives
// on the scroll port (contentClassName), not the track.

export const carouselView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      section(
        'Demo',
        h.div(
          [h.Class('w-full max-w-xs')],
          [
            h.submodel({
              slotId: model.carousel.id,
              model: model.carousel,
              view: carousel.view,
              viewInputs: { items: slides(SLIDE_COUNT, {}, h) },
              toParentMessage: (message) => Message.GotCarouselMessage({ message }),
            }),
          ],
        ),
        h,
      ),
      section(
        'Orientation',
        h.div(
          [h.Class('w-full max-w-xs')],
          [
            h.submodel({
              slotId: model.carouselOrientation.id,
              model: model.carouselOrientation,
              view: carousel.view,
              viewInputs: {
                items: slides(SLIDE_COUNT, { itemClass: 'pt-1 md:basis-1/2' }, h),
                contentClassName: 'h-[200px]',
                trackClassName: '-mt-1',
                spacing: '0.25rem',
              },
              toParentMessage: (message) => Message.GotCarouselOrientationMessage({ message }),
            }),
          ],
        ),
        h,
      ),
      section(
        'Size',
        h.div(
          [h.Class('w-full max-w-sm')],
          [
            h.submodel({
              slotId: model.carouselSize.id,
              model: model.carouselSize,
              view: carousel.view,
              viewInputs: {
                items: slides(SLIDE_COUNT, { itemClass: 'md:basis-1/2 lg:basis-1/3' }, h),
              },
              toParentMessage: (message) => Message.GotCarouselSizeMessage({ message }),
            }),
          ],
        ),
        h,
      ),
      section(
        'Spacing',
        h.div(
          [h.Class('w-full max-w-sm')],
          [
            h.submodel({
              slotId: model.carouselSpacing.id,
              model: model.carouselSpacing,
              view: carousel.view,
              viewInputs: {
                items: slides(
                  SLIDE_COUNT,
                  {
                    wrapperClass: '',
                    numberClass: 'text-2xl font-semibold',
                    itemClass: 'pl-1 md:basis-1/2 lg:basis-1/3',
                  },
                  h,
                ),
                trackClassName: '-ml-1',
                spacing: '0.25rem',
              },
              toParentMessage: (message) => Message.GotCarouselSpacingMessage({ message }),
            }),
          ],
        ),
        h,
      ),
      section(
        'API',
        h.div(
          [h.Class('mx-auto w-full max-w-xs')],
          [
            h.submodel({
              slotId: model.carouselApi.id,
              model: model.carouselApi,
              view: carousel.view,
              viewInputs: { items: slides(SLIDE_COUNT, {}, h) },
              toParentMessage: (message) => Message.GotCarouselApiMessage({ message }),
            }),
            h.div(
              [h.Class('py-2 text-center text-sm text-muted-foreground')],
              [`Slide ${model.carouselApiIndex + 1} of ${model.carouselApi.count}`],
            ),
          ],
        ),
        h,
      ),
    ],
  )

const foldNoOp =
  <Out>(): ((out: Out) => Update.Step<State, unknown>) =>
  () =>
  (model) => ({ model })

const foldCarouselOutMessage = M.type<carousel.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    ChangedIndex: foldNoOp(),
  }),
)

const foldCarouselOutMessageApi = M.type<carousel.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    ChangedIndex:
      ({ index }) =>
      (model: State) => ({
        model: evo(model, { carouselApiIndex: () => index }),
      }),
  }),
)

const foldCarousel = (
  read: (model: State) => carousel.Model,
  write: (model: State, next: carousel.Model) => State,
  toParentMessage: (message: carousel.Message) => CarouselMessage,
) =>
  Update.foldChild({
    update: carousel.update,
    read: (model: State) => Option.some(read(model)),
    write,
    toParentMessage,
    foldOutMessage: foldCarouselOutMessage,
  })

const fields = {
  carousel: carousel.Model,
  carouselOrientation: carousel.Model,
  carouselSize: carousel.Model,
  carouselSpacing: carousel.Model,
  carouselApi: carousel.Model,
  carouselApiIndex: S.Number,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

const liftCarouselSubscriptions = (
  name: string,
  read: (model: State) => carousel.Model,
  toParentMessage: (message: carousel.Message) => CarouselMessage,
) => {
  const lifted = Subscription.lift({
    contentScroll: carousel.subscriptions.contentScroll,
  })<State, CarouselMessage>({
    toChildModel: read,
    toParentMessage,
  })
  return { [`${name}ContentScroll`]: lifted.contentScroll }
}

export const subscriptions = Subscription.aggregate<State, CarouselMessage>()(
  liftCarouselSubscriptions(
    'carousel',
    (model) => model.carousel,
    (message) => Message.GotCarouselMessage({ message }),
  ),
  liftCarouselSubscriptions(
    'carouselOrientation',
    (model) => model.carouselOrientation,
    (message) => Message.GotCarouselOrientationMessage({ message }),
  ),
  liftCarouselSubscriptions(
    'carouselSize',
    (model) => model.carouselSize,
    (message) => Message.GotCarouselSizeMessage({ message }),
  ),
  liftCarouselSubscriptions(
    'carouselSpacing',
    (model) => model.carouselSpacing,
    (message) => Message.GotCarouselSpacingMessage({ message }),
  ),
  liftCarouselSubscriptions(
    'carouselApi',
    (model) => model.carouselApi,
    (message) => Message.GotCarouselApiMessage({ message }),
  ),
)

export const slice = defineSlice({
  fields,
  init: {
    carousel: carousel.init({ id: 'carousel-demo', count: SLIDE_COUNT }),
    carouselOrientation: carousel.init({
      id: 'carousel-orientation',
      count: SLIDE_COUNT,
      orientation: 'vertical',
    }),
    carouselSize: carousel.init({ id: 'carousel-size', count: SLIDE_COUNT }),
    carouselSpacing: carousel.init({ id: 'carousel-spacing', count: SLIDE_COUNT }),
    carouselApi: carousel.init({ id: 'carousel-api', count: SLIDE_COUNT }),
    carouselApiIndex: 0,
  },
  messages: [
    Message.GotCarouselMessage,
    Message.GotCarouselOrientationMessage,
    Message.GotCarouselSizeMessage,
    Message.GotCarouselSpacingMessage,
    Message.GotCarouselApiMessage,
  ],
  handlers: (model: State) => ({
    GotCarouselMessage: (payload: typeof Message.GotCarouselMessage.Type): UpdateReturn =>
      foldCarousel(
        (model) => model.carousel,
        (model, next) => evo(model, { carousel: () => next }),
        (message) => Message.GotCarouselMessage({ message }),
      )(model, payload.message),
    GotCarouselOrientationMessage: (
      payload: typeof Message.GotCarouselOrientationMessage.Type,
    ): UpdateReturn =>
      foldCarousel(
        (model) => model.carouselOrientation,
        (model, next) => evo(model, { carouselOrientation: () => next }),
        (message) => Message.GotCarouselOrientationMessage({ message }),
      )(model, payload.message),
    GotCarouselSizeMessage: (payload: typeof Message.GotCarouselSizeMessage.Type): UpdateReturn =>
      foldCarousel(
        (model) => model.carouselSize,
        (model, next) => evo(model, { carouselSize: () => next }),
        (message) => Message.GotCarouselSizeMessage({ message }),
      )(model, payload.message),
    GotCarouselSpacingMessage: (
      payload: typeof Message.GotCarouselSpacingMessage.Type,
    ): UpdateReturn =>
      foldCarousel(
        (model) => model.carouselSpacing,
        (model, next) => evo(model, { carouselSpacing: () => next }),
        (message) => Message.GotCarouselSpacingMessage({ message }),
      )(model, payload.message),
    GotCarouselApiMessage: (payload: typeof Message.GotCarouselApiMessage.Type): UpdateReturn =>
      Update.foldChild({
        update: carousel.update,
        read: (model: State) => Option.some(model.carouselApi),
        write: (model, next) => evo(model, { carouselApi: () => next }),
        toParentMessage: (message) => Message.GotCarouselApiMessage({ message }),
        foldOutMessage: foldCarouselOutMessageApi,
      })(model, payload.message),
  }),
  samples: [
    Message.GotCarouselMessage({
      message: carousel.Message.ScrolledContent({ index: 1, scrollBound: 4 }),
    }),
  ],
  subscriptions,
})
