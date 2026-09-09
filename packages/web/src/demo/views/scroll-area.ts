import { Subscription, Update } from 'foldkit'
import { Option, Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as ScrollArea from '../../generated/registry/ui/scroll-area'
import { separator } from '../../generated/registry/ui/separator'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotScrollAreaVerticalMessage: { message: ScrollArea.Message },
  GotScrollAreaHorizontalMessage: { message: ScrollArea.Message },
})

// Mirrors the upstream base example: a vertical tags list and a horizontal
// artwork strip.
const TAGS: ReadonlyArray<string> = Array.from(
  { length: 50 },
  (_, index) => `v1.2.0-beta.${50 - index}`,
)

const WORKS: ReadonlyArray<{ artist: string; src: string }> = [
  {
    artist: 'Ornella Binni',
    src: 'https://images.unsplash.com/photo-1465869185982-5a1a7522cbcb?auto=format&fit=crop&w=300&q=80',
  },
  {
    artist: 'Tom Byrom',
    src: 'https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&fit=crop&w=300&q=80',
  },
  {
    artist: 'Vladimir Malyav',
    src: 'https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80',
  },
]

const tagsContent = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('p-4')],
    [
      h.div([h.Class('mb-4 text-sm leading-none font-medium')], ['Tags']),
      ...TAGS.flatMap((tag) => [
        h.div([h.Class('text-sm')], [tag]),
        separator<AppMessage>({ className: 'my-2' }, h),
      ]),
    ],
  )

const worksContent = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex gap-4')],
    WORKS.map((work) =>
      h.figure(
        [h.Class('shrink-0')],
        [
          h.div(
            [h.Class('overflow-hidden rounded-md')],
            [
              h.img([
                h.Src(work.src),
                h.Alt(`Photo by ${work.artist}`),
                h.Class('aspect-[3/4] w-48 object-cover'),
              ]),
            ],
          ),
          h.div(
            [h.Class('pt-2 text-xs text-muted-foreground')],
            ['Photo by ', h.span([h.Class('font-semibold text-foreground')], [work.artist])],
          ),
        ],
      ),
    ),
  )

const scrollAreaSubmodel = (
  model: ScrollArea.Model,
  content: Html,
  className: string,
  toParentMessage: (message: ScrollArea.Message) => AppMessage,
  h: HtmlBuilder<AppMessage>,
): Html =>
  h.submodel({
    slotId: model.id,
    model,
    view: ScrollArea.view,
    viewInputs: { content, className },
    toParentMessage,
  })

export const scrollAreaView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Vertical']),
          scrollAreaSubmodel(
            model.scrollAreaVertical,
            tagsContent(h),
            'mx-auto h-72 w-48 rounded-md border',
            (message) => Message.GotScrollAreaVerticalMessage({ message }),
            h,
          ),
          h.div(
            [h.Class('px-1 text-xs text-muted-foreground')],
            ['Drag the thumb or click the track to jump.'],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Horizontal']),
          scrollAreaSubmodel(
            model.scrollAreaHorizontal,
            worksContent(h),
            'mx-auto w-full max-w-96 rounded-md border p-4',
            (message) => Message.GotScrollAreaHorizontalMessage({ message }),
            h,
          ),
        ],
      ),
    ],
  )

const foldScrollAreaVertical = Update.foldChild({
  update: ScrollArea.update,
  read: (model: State) => Option.some(model.scrollAreaVertical),
  write: (model, next) => evo(model, { scrollAreaVertical: () => next }),
  toParentMessage: (message) => Message.GotScrollAreaVerticalMessage({ message }),
})

const foldScrollAreaHorizontal = Update.foldChild({
  update: ScrollArea.update,
  read: (model: State) => Option.some(model.scrollAreaHorizontal),
  write: (model, next) => evo(model, { scrollAreaHorizontal: () => next }),
  toParentMessage: (message) => Message.GotScrollAreaHorizontalMessage({ message }),
})

const fields = {
  scrollAreaVertical: ScrollArea.Model,
  scrollAreaHorizontal: ScrollArea.Model,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

type ScrollAreaAppMessage =
  | typeof Message.GotScrollAreaVerticalMessage.Type
  | typeof Message.GotScrollAreaHorizontalMessage.Type

const liftScrollAreaSubscriptions = (
  name: string,
  read: (model: State) => ScrollArea.Model,
  toParentMessage: (message: ScrollArea.Message) => ScrollAreaAppMessage,
) => {
  const lifted = Subscription.lift({
    viewportEvents: ScrollArea.subscriptions.viewportEvents,
    dragPointer: ScrollArea.subscriptions.dragPointer,
  })<State, ScrollAreaAppMessage>({
    toChildModel: read,
    toParentMessage,
  })
  return {
    [`${name}ViewportEvents`]: lifted.viewportEvents,
    [`${name}DragPointer`]: lifted.dragPointer,
  }
}

export const subscriptions = Subscription.aggregate<State, ScrollAreaAppMessage>()(
  liftScrollAreaSubscriptions(
    'scrollAreaVertical',
    (model) => model.scrollAreaVertical,
    (message) => Message.GotScrollAreaVerticalMessage({ message }),
  ),
  liftScrollAreaSubscriptions(
    'scrollAreaHorizontal',
    (model) => model.scrollAreaHorizontal,
    (message) => Message.GotScrollAreaHorizontalMessage({ message }),
  ),
)

export const slice = defineSlice({
  fields,
  init: {
    scrollAreaVertical: ScrollArea.init({ id: 'scroll-area-demo-vertical' }),
    scrollAreaHorizontal: ScrollArea.init({ id: 'scroll-area-demo-horizontal' }),
  },
  messages: [Message.GotScrollAreaVerticalMessage, Message.GotScrollAreaHorizontalMessage],
  handlers: (model: State) => ({
    GotScrollAreaVerticalMessage: (
      payload: typeof Message.GotScrollAreaVerticalMessage.Type,
    ): UpdateReturn => foldScrollAreaVertical(model, payload.message),
    GotScrollAreaHorizontalMessage: (
      payload: typeof Message.GotScrollAreaHorizontalMessage.Type,
    ): UpdateReturn => foldScrollAreaHorizontal(model, payload.message),
  }),
  samples: [
    Message.GotScrollAreaVerticalMessage({
      message: ScrollArea.Message.ScrolledViewport({
        scrollTop: 10,
        scrollLeft: 0,
        scrollHeight: 600,
        scrollWidth: 192,
        clientHeight: 288,
        clientWidth: 192,
      }),
    }),
  ],
  subscriptions,
})
