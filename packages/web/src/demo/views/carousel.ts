import { Update } from 'foldkit'
import Autoplay from 'embla-carousel-autoplay'
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
  GotCarouselPluginMessage: { message: carousel.Message },
  GotCarouselApiMessage: { message: carousel.Message },
})
type CarouselMessage =
  | typeof Message.GotCarouselMessage.Type
  | typeof Message.GotCarouselOrientationMessage.Type
  | typeof Message.GotCarouselSizeMessage.Type
  | typeof Message.GotCarouselSpacingMessage.Type
  | typeof Message.GotCarouselPluginMessage.Type
  | typeof Message.GotCarouselApiMessage.Type

const SLIDE_COUNT = 5

// Plugin instances are stateful objects that cannot live in the model — the
// upstream demo passes them as the `plugins` prop; foldcn registers them per
// carousel id before mount.
carousel.configure('carousel-plugin', {
  plugins: [Autoplay({ delay: 2000, stopOnInteraction: true })],
})

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
// and each item's pl-N pair so slide content stays flush — embla handles the
// spacing natively, exactly like upstream.

const embed = (
  id:
    | 'carousel'
    | 'carouselOrientation'
    | 'carouselSize'
    | 'carouselSpacing'
    | 'carouselPlugin'
    | 'carouselApi',
  model: Model,
  viewInputs: carousel.ViewInputs,
  toParentMessage: (message: carousel.Message) => CarouselMessage,
  h: HtmlBuilder<AppMessage>,
): Html =>
  h.submodel({
    slotId: model[id].id,
    model: model[id],
    view: carousel.view,
    viewInputs,
    toParentMessage,
  })

export const carouselView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      section(
        'Demo',
        h.div(
          [h.Class('w-full max-w-xs')],
          [
            embed(
              'carousel',
              model,
              { items: slides(SLIDE_COUNT, {}, h) },
              (message) => Message.GotCarouselMessage({ message }),
              h,
            ),
          ],
        ),
        h,
      ),
      section(
        'Orientation',
        h.div(
          [h.Class('w-full max-w-xs')],
          [
            embed(
              'carouselOrientation',
              model,
              {
                items: slides(SLIDE_COUNT, { itemClass: 'pt-1 md:basis-1/2' }, h),
                contentClassName: '-mt-1 h-[200px]',
              },
              (message) => Message.GotCarouselOrientationMessage({ message }),
              h,
            ),
          ],
        ),
        h,
      ),
      section(
        'Size',
        h.div(
          [h.Class('w-full max-w-sm')],
          [
            embed(
              'carouselSize',
              model,
              {
                items: slides(SLIDE_COUNT, { itemClass: 'md:basis-1/2 lg:basis-1/3' }, h),
              },
              (message) => Message.GotCarouselSizeMessage({ message }),
              h,
            ),
          ],
        ),
        h,
      ),
      section(
        'Spacing',
        h.div(
          [h.Class('w-full max-w-sm')],
          [
            embed(
              'carouselSpacing',
              model,
              {
                items: slides(
                  SLIDE_COUNT,
                  {
                    wrapperClass: '',
                    numberClass: 'text-2xl font-semibold',
                    itemClass: 'pl-1 md:basis-1/2 lg:basis-1/3',
                  },
                  h,
                ),
                contentClassName: '-ml-1',
              },
              (message) => Message.GotCarouselSpacingMessage({ message }),
              h,
            ),
          ],
        ),
        h,
      ),
      section(
        'Plugin',
        h.div(
          [h.Class('w-full max-w-xs')],
          [
            embed(
              'carouselPlugin',
              model,
              { items: slides(SLIDE_COUNT, {}, h) },
              (message) => Message.GotCarouselPluginMessage({ message }),
              h,
            ),
          ],
        ),
        h,
      ),
      section(
        'API',
        h.div(
          [h.Class('mx-auto w-full max-w-xs')],
          [
            embed(
              'carouselApi',
              model,
              { items: slides(SLIDE_COUNT, {}, h) },
              (message) => Message.GotCarouselApiMessage({ message }),
              h,
            ),
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
  carouselPlugin: carousel.Model,
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
    engineEvents: carousel.subscriptions.engineEvents,
  })<State, CarouselMessage>({
    toChildModel: read,
    toParentMessage,
  })
  return { [`${name}EngineEvents`]: lifted.engineEvents }
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
    'carouselPlugin',
    (model) => model.carouselPlugin,
    (message) => Message.GotCarouselPluginMessage({ message }),
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
      options: { align: 'start' },
    }),
    carouselSize: carousel.init({
      id: 'carousel-size',
      count: SLIDE_COUNT,
      options: { align: 'start' },
    }),
    carouselSpacing: carousel.init({
      id: 'carousel-spacing',
      count: SLIDE_COUNT,
      options: { align: 'start' },
    }),
    carouselPlugin: carousel.init({ id: 'carousel-plugin', count: SLIDE_COUNT }),
    carouselApi: carousel.init({ id: 'carousel-api', count: SLIDE_COUNT }),
    carouselApiIndex: 0,
  },
  messages: [
    Message.GotCarouselMessage,
    Message.GotCarouselOrientationMessage,
    Message.GotCarouselSizeMessage,
    Message.GotCarouselSpacingMessage,
    Message.GotCarouselPluginMessage,
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
    GotCarouselPluginMessage: (
      payload: typeof Message.GotCarouselPluginMessage.Type,
    ): UpdateReturn =>
      foldCarousel(
        (model) => model.carouselPlugin,
        (model, next) => evo(model, { carouselPlugin: () => next }),
        (message) => Message.GotCarouselPluginMessage({ message }),
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
      message: carousel.Message.SelectedSlide({
        index: 1,
        canScrollPrev: true,
        canScrollNext: true,
      }),
    }),
  ],
  subscriptions,
})
