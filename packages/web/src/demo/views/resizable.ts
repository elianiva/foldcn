import { Update } from 'foldkit'
import { Match as M, Option, Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Subscription } from 'foldkit'

import * as resizable from '../../generated/registry/ui/resizable'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotResizableHorizontalMessage: { message: resizable.Message },
  GotResizableVerticalMessage: { message: resizable.Message },
  GotResizableWithHandleMessage: { message: resizable.Message },
  GotResizableNestedOuterMessage: { message: resizable.Message },
  GotResizableNestedInnerMessage: { message: resizable.Message },
  GotResizableControlledMessage: { message: resizable.Message },
})

const panelLabel = (text: string, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex h-full items-center justify-center p-6')],
    [h.span([h.Class('font-semibold')], [text])],
  )

const percentagePanel = (value: number, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex h-full flex-col items-center justify-center gap-2 p-6')],
    [h.span([h.Class('font-semibold')], [`${String(Math.round(value))}%`])],
  )

const group = (
  model: resizable.Model,
  viewInputs: resizable.ViewInputs,
  toParentMessage: (message: resizable.Message) => AppMessage,
  h: HtmlBuilder<AppMessage>,
): Html =>
  h.submodel({
    slotId: model.id,
    model,
    view: resizable.view,
    viewInputs,
    toParentMessage,
  })

export const resizableView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Horizontal']),
          group(
            model.resizableHorizontal,
            {
              className: 'min-h-[200px] rounded-lg border',
              panels: [{}, {}],
              handles: [{}],
              handleLabel: 'Resize sidebar and content',
              toPanelContent: (index) =>
                index === 0 ? panelLabel('Sidebar', h) : panelLabel('Content', h),
            },
            (message) => Message.GotResizableHorizontalMessage({ message }),
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Vertical']),
          group(
            model.resizableVertical,
            {
              className: 'h-[240px] rounded-lg border',
              panels: [{}, {}],
              handles: [{}],
              handleLabel: 'Resize header and content',
              toPanelContent: (index) =>
                index === 0 ? panelLabel('Header', h) : panelLabel('Content', h),
            },
            (message) => Message.GotResizableVerticalMessage({ message }),
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Handle']),
          group(
            model.resizableWithHandle,
            {
              className: 'min-h-[200px] rounded-lg border',
              panels: [{}, {}],
              handles: [{ withHandle: true }],
              handleLabel: 'Resize sidebar and content',
              toPanelContent: (index) =>
                index === 0 ? panelLabel('Sidebar', h) : panelLabel('Content', h),
            },
            (message) => Message.GotResizableWithHandleMessage({ message }),
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Nested']),
          group(
            model.resizableNestedOuter,
            {
              className: 'min-h-[240px] rounded-lg border',
              panels: [{}, {}],
              handles: [{}],
              handleLabel: 'Resize One and the nested group',
              toPanelContent: (index) =>
                index === 0
                  ? panelLabel('One', h)
                  : group(
                      model.resizableNestedInner,
                      {
                        panels: [{}, {}],
                        handles: [{}],
                        handleLabel: 'Resize Two and Three',
                        toPanelContent: (innerIndex) =>
                          innerIndex === 0 ? panelLabel('Two', h) : panelLabel('Three', h),
                      },
                      (message) => Message.GotResizableNestedInnerMessage({ message }),
                      h,
                    ),
            },
            (message) => Message.GotResizableNestedOuterMessage({ message }),
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Controlled']),
          group(
            model.resizableControlled,
            {
              className: 'min-h-[200px] rounded-lg border',
              panels: [{}, {}],
              handles: [{}],
              handleLabel: 'Resize the controlled panels',
              toPanelContent: (index) =>
                index === 0
                  ? percentagePanel(model.resizableControlledLayout.left ?? 30, h)
                  : percentagePanel(model.resizableControlledLayout.right ?? 70, h),
            },
            (message) => Message.GotResizableControlledMessage({ message }),
            h,
          ),
          h.div(
            [h.Class('px-1 text-xs text-muted-foreground')],
            ['Sizes come from the LayoutChanged out-message the parent owns.'],
          ),
        ],
      ),
    ],
  )

const noopFold =
  <Out>(): ((out: Out) => Update.Step<State, unknown>) =>
  () =>
  (model) => ({ model })

const foldOtherOutMessage = M.type<resizable.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    LayoutChanged: noopFold(),
  }),
)

const foldControlledOutMessage = M.type<resizable.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    LayoutChanged:
      ({ layout }) =>
      (model) => ({ model: evo(model, { resizableControlledLayout: () => layout }) }),
  }),
)

const foldResizableHorizontal = Update.foldChild({
  update: resizable.update,
  read: (model: State) => Option.some(model.resizableHorizontal),
  write: (model, next) => evo(model, { resizableHorizontal: () => next }),
  toParentMessage: (message) => Message.GotResizableHorizontalMessage({ message }),
  foldOutMessage: foldOtherOutMessage,
})

const foldResizableVertical = Update.foldChild({
  update: resizable.update,
  read: (model: State) => Option.some(model.resizableVertical),
  write: (model, next) => evo(model, { resizableVertical: () => next }),
  toParentMessage: (message) => Message.GotResizableVerticalMessage({ message }),
  foldOutMessage: foldOtherOutMessage,
})

const foldResizableWithHandle = Update.foldChild({
  update: resizable.update,
  read: (model: State) => Option.some(model.resizableWithHandle),
  write: (model, next) => evo(model, { resizableWithHandle: () => next }),
  toParentMessage: (message) => Message.GotResizableWithHandleMessage({ message }),
  foldOutMessage: foldOtherOutMessage,
})

const foldResizableNestedOuter = Update.foldChild({
  update: resizable.update,
  read: (model: State) => Option.some(model.resizableNestedOuter),
  write: (model, next) => evo(model, { resizableNestedOuter: () => next }),
  toParentMessage: (message) => Message.GotResizableNestedOuterMessage({ message }),
  foldOutMessage: foldOtherOutMessage,
})

const foldResizableNestedInner = Update.foldChild({
  update: resizable.update,
  read: (model: State) => Option.some(model.resizableNestedInner),
  write: (model, next) => evo(model, { resizableNestedInner: () => next }),
  toParentMessage: (message) => Message.GotResizableNestedInnerMessage({ message }),
  foldOutMessage: foldOtherOutMessage,
})

const foldResizableControlled = Update.foldChild({
  update: resizable.update,
  read: (model: State) => Option.some(model.resizableControlled),
  write: (model, next) => evo(model, { resizableControlled: () => next }),
  toParentMessage: (message) => Message.GotResizableControlledMessage({ message }),
  foldOutMessage: foldControlledOutMessage,
})

const fields = {
  resizableHorizontal: resizable.Model,
  resizableVertical: resizable.Model,
  resizableWithHandle: resizable.Model,
  resizableNestedOuter: resizable.Model,
  resizableNestedInner: resizable.Model,
  resizableControlled: resizable.Model,
  resizableControlledLayout: S.Record(S.String, S.Number),
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

type ResizableAppMessage =
  | typeof Message.GotResizableHorizontalMessage.Type
  | typeof Message.GotResizableVerticalMessage.Type
  | typeof Message.GotResizableWithHandleMessage.Type
  | typeof Message.GotResizableNestedOuterMessage.Type
  | typeof Message.GotResizableNestedInnerMessage.Type
  | typeof Message.GotResizableControlledMessage.Type

const liftDragPointer = (
  name: string,
  read: (model: State) => resizable.Model,
  toParentMessage: (message: resizable.Message) => ResizableAppMessage,
) => {
  const lifted = Subscription.lift({
    dragPointer: resizable.subscriptions.dragPointer,
  })<State, ResizableAppMessage>({
    toChildModel: read,
    toParentMessage,
  })
  return { [`${name}DragPointer`]: lifted.dragPointer }
}

export const subscriptions = Subscription.aggregate<State, ResizableAppMessage>()(
  liftDragPointer(
    'resizableHorizontal',
    (model) => model.resizableHorizontal,
    (message) => Message.GotResizableHorizontalMessage({ message }),
  ),
  liftDragPointer(
    'resizableVertical',
    (model) => model.resizableVertical,
    (message) => Message.GotResizableVerticalMessage({ message }),
  ),
  liftDragPointer(
    'resizableWithHandle',
    (model) => model.resizableWithHandle,
    (message) => Message.GotResizableWithHandleMessage({ message }),
  ),
  liftDragPointer(
    'resizableNestedOuter',
    (model) => model.resizableNestedOuter,
    (message) => Message.GotResizableNestedOuterMessage({ message }),
  ),
  liftDragPointer(
    'resizableNestedInner',
    (model) => model.resizableNestedInner,
    (message) => Message.GotResizableNestedInnerMessage({ message }),
  ),
  liftDragPointer(
    'resizableControlled',
    (model) => model.resizableControlled,
    (message) => Message.GotResizableControlledMessage({ message }),
  ),
)

export const slice = defineSlice({
  fields,
  init: {
    resizableHorizontal: resizable.init({
      id: 'resizable-demo-horizontal',
      panels: [{ id: 'sidebar', defaultSize: 25 }, { id: 'content' }],
    }),
    resizableVertical: resizable.init({
      id: 'resizable-demo-vertical',
      orientation: 'vertical',
      panels: [{ id: 'header', defaultSize: 25 }, { id: 'content' }],
    }),
    resizableWithHandle: resizable.init({
      id: 'resizable-demo-with-handle',
      panels: [{ id: 'sidebar', defaultSize: 25 }, { id: 'content' }],
    }),
    resizableNestedOuter: resizable.init({
      id: 'resizable-demo-nested-outer',
      panels: [{ id: 'one' }, { id: 'nested' }],
    }),
    resizableNestedInner: resizable.init({
      id: 'resizable-demo-nested-inner',
      orientation: 'vertical',
      panels: [{ id: 'two', defaultSize: 25 }, { id: 'three' }],
    }),
    resizableControlled: resizable.init({
      id: 'resizable-demo-controlled',
      panels: [
        { id: 'left', defaultSize: 30, minSize: 20 },
        { id: 'right', minSize: 30 },
      ],
    }),
    resizableControlledLayout: { left: 30, right: 70 },
  },
  messages: [
    Message.GotResizableHorizontalMessage,
    Message.GotResizableVerticalMessage,
    Message.GotResizableWithHandleMessage,
    Message.GotResizableNestedOuterMessage,
    Message.GotResizableNestedInnerMessage,
    Message.GotResizableControlledMessage,
  ],
  handlers: (model: State) => ({
    GotResizableHorizontalMessage: (
      payload: typeof Message.GotResizableHorizontalMessage.Type,
    ): UpdateReturn => foldResizableHorizontal(model, payload.message),
    GotResizableVerticalMessage: (
      payload: typeof Message.GotResizableVerticalMessage.Type,
    ): UpdateReturn => foldResizableVertical(model, payload.message),
    GotResizableWithHandleMessage: (
      payload: typeof Message.GotResizableWithHandleMessage.Type,
    ): UpdateReturn => foldResizableWithHandle(model, payload.message),
    GotResizableNestedOuterMessage: (
      payload: typeof Message.GotResizableNestedOuterMessage.Type,
    ): UpdateReturn => foldResizableNestedOuter(model, payload.message),
    GotResizableNestedInnerMessage: (
      payload: typeof Message.GotResizableNestedInnerMessage.Type,
    ): UpdateReturn => foldResizableNestedInner(model, payload.message),
    GotResizableControlledMessage: (
      payload: typeof Message.GotResizableControlledMessage.Type,
    ): UpdateReturn => foldResizableControlled(model, payload.message),
  }),
  samples: [
    Message.GotResizableHorizontalMessage({
      message: resizable.Message.KeyedHandle({ handleIndex: 0, key: 'ArrowRight' }),
    }),
  ],
  subscriptions,
})
