import { clsx } from 'clsx'
import { Array, Match as M, Option, pipe } from 'effect'
import { Subscription, Update } from 'foldkit'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '../../generated/registry/lib/utils'
import * as DragAndDrop from '../../generated/registry/ui/drag-and-drop'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotDragAndDropMessage: { message: DragAndDrop.Message },
})

export const DemoCard = S.Struct({ id: S.String, label: S.String })
export type DemoCard = typeof DemoCard.Type

export const DemoColumn = S.Struct({
  id: S.String,
  label: S.String,
  cards: S.Array(DemoCard),
})
export type DemoColumn = typeof DemoColumn.Type

const reorderColumns = (
  columns: ReadonlyArray<DemoColumn>,
  itemId: string,
  fromContainerId: string,
  toContainerId: string,
  toIndex: number,
): ReadonlyArray<DemoColumn> => {
  const maybeCard = pipe(
    columns,
    Array.findFirst(({ id }) => id === fromContainerId),
    Option.flatMap((column) => Array.findFirst(column.cards, ({ id }) => id === itemId)),
  )
  return Option.match(maybeCard, {
    onNone: () => columns,
    onSome: (card) =>
      Array.map(columns, (column) => {
        const withRemoved =
          column.id === fromContainerId
            ? Array.filter(column.cards, ({ id }) => id !== itemId)
            : column.cards
        if (column.id !== toContainerId) {
          return evo(column, { cards: () => withRemoved })
        }
        const inserted = [
          ...Array.take(withRemoved, toIndex),
          card,
          ...Array.drop(withRemoved, toIndex),
        ]
        return evo(column, { cards: () => inserted })
      }),
  })
}

const findDraggedCard = (
  columns: ReadonlyArray<DemoColumn>,
  maybeItemId: Option.Option<string>,
): Option.Option<DemoCard> =>
  pipe(
    maybeItemId,
    Option.flatMap((itemId) =>
      pipe(
        columns,
        Array.flatMap(({ cards }) => cards),
        Array.findFirst(({ id }) => id === itemId),
      ),
    ),
  )

const cardView = (
  card: DemoCard,
  index: number,
  containerId: string,
  model: Model,
  h: HtmlBuilder<AppMessage>,
): Html => {
  const maybeItemId = DragAndDrop.maybeDraggedItemId(model.dragAndDrop)
  const isBeingDragged = Option.exists(maybeItemId, (id) => id === card.id)
  const isKeyboardDragged =
    isBeingDragged && model.dragAndDrop.dragState._tag === 'KeyboardDragging'
  const isPointerDragged = isBeingDragged && model.dragAndDrop.dragState._tag === 'Dragging'

  return h.keyed('div')(
    card.id,
    [
      h.Class(
        clsx(cn(DragAndDrop.dragCardClass), {
          'opacity-40': isPointerDragged,
          'data-[keyboard-dragging]': isKeyboardDragged,
        }),
      ),
      ...DragAndDrop.draggable(
        {
          model: model.dragAndDrop,
          toParentMessage: (message) => Message.GotDragAndDropMessage({ message }),
          itemId: card.id,
          containerId,
          index,
        },
        h,
      ),
      ...DragAndDrop.sortable(card.id),
    ],
    [card.label],
  )
}

const dropPlaceholder = (h: HtmlBuilder<AppMessage>): Html =>
  h.keyed('div')('drop-placeholder', [h.Class(DragAndDrop.dragDropPlaceholderClass)])

const renderColumn = (
  column: DemoColumn,
  model: Model,
  children: ReadonlyArray<Html>,
  h: HtmlBuilder<AppMessage>,
): Html => {
  const maybeTarget = DragAndDrop.maybeDropTarget(model.dragAndDrop)
  const isDropTarget =
    DragAndDrop.isDragging(model.dragAndDrop) &&
    Option.exists(maybeTarget, ({ containerId }) => containerId === column.id)

  return h.keyed('div')(
    column.id,
    [h.Class('flex flex-col gap-1')],
    [
      h.div(
        [h.Class('mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground')],
        [column.label],
      ),
      h.div(
        [
          h.Class(
            clsx(cn(DragAndDrop.dragContainerClass), {
              'border-dashed !border-primary/50': isDropTarget,
            }),
          ),
          ...DragAndDrop.droppable(column.id, column.label),
        ],
        [...children],
      ),
    ],
  )
}

const columnView = (
  columns: ReadonlyArray<DemoColumn>,
  column: DemoColumn,
  model: Model,
  h: HtmlBuilder<AppMessage>,
): Html => {
  const maybeItemId = DragAndDrop.maybeDraggedItemId(model.dragAndDrop)
  const maybeTarget = DragAndDrop.maybeDropTarget(model.dragAndDrop)
  const isDragging = DragAndDrop.isDragging(model.dragAndDrop)
  const isPointerDragging = model.dragAndDrop.dragState._tag === 'Dragging'
  const isTargetColumn =
    isDragging && Option.exists(maybeTarget, ({ containerId }) => containerId === column.id)

  const visibleCards = Option.match(maybeItemId, {
    onNone: () => column.cards,
    onSome: (draggedId) =>
      isDragging ? Array.filter(column.cards, ({ id }) => id !== draggedId) : column.cards,
  })
  const cardElements = Array.map(visibleCards, (card, index) =>
    cardView(card, index, column.id, model, h),
  )

  if (!isTargetColumn) {
    return renderColumn(column, model, cardElements, h)
  }

  const targetIndex = Option.match(maybeTarget, {
    onNone: () => visibleCards.length,
    onSome: ({ index }) => Math.min(index, visibleCards.length),
  })
  const insertElement = isPointerDragging
    ? dropPlaceholder(h)
    : Option.match(findDraggedCard(columns, maybeItemId), {
        onNone: () => dropPlaceholder(h),
        onSome: (card) => cardView(card, targetIndex, column.id, model, h),
      })
  const withInsert: ReadonlyArray<Html> = pipe(
    cardElements,
    Array.insertAt(targetIndex, insertElement),
    Option.getOrElse(() => [...cardElements, insertElement]),
  )
  return renderColumn(column, model, withInsert, h)
}

const ghostView = (
  columns: ReadonlyArray<DemoColumn>,
  model: Model,
  h: HtmlBuilder<AppMessage>,
): Html => {
  const maybeItemId = DragAndDrop.maybeDraggedItemId(model.dragAndDrop)
  return pipe(
    DragAndDrop.ghostStyle(model.dragAndDrop),
    Option.flatMap((ghostStyle) =>
      Option.map(findDraggedCard(columns, maybeItemId), (card) => ({ ghostStyle, card })),
    ),
    Option.match({
      onNone: () => h.empty,
      onSome: ({ ghostStyle, card }) =>
        h.div([h.Style(ghostStyle), h.Class(DragAndDrop.dragGhostClass)], [card.label]),
    }),
  )
}

export const dragAndDropView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('w-full')],
    [
      h.div(
        [h.Class('flex flex-wrap items-start gap-4')],
        model.dragColumns.map((column) => columnView(model.dragColumns, column, model, h)),
      ),
      ghostView(model.dragColumns, model, h),
      h.p(
        [h.Class('mt-3 text-sm text-muted-foreground')],
        ['Drag cards between columns, or use the keyboard to reorder.'],
      ),
    ],
  )

const foldDragAndDropOutMessage = M.type<DragAndDrop.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Reordered:
      ({ itemId, fromContainerId, toContainerId, toIndex }) =>
      (model) => ({
        model: evo(model, {
          dragColumns: () =>
            reorderColumns(model.dragColumns, itemId, fromContainerId, toContainerId, toIndex),
        }),
      }),
    Cancelled: () => (model) => ({ model }),
  }),
)

const foldDragAndDrop = Update.foldChild({
  update: DragAndDrop.update,
  read: (model: State) => Option.some(model.dragAndDrop),
  write: (model, next) => evo(model, { dragAndDrop: () => next }),
  toParentMessage: (message) => Message.GotDragAndDropMessage({ message }),
  foldOutMessage: foldDragAndDropOutMessage,
})

const DRAG_COLUMNS: ReadonlyArray<DemoColumn> = [
  {
    id: 'backlog',
    label: 'Backlog',
    cards: [
      { id: 'card-1', label: 'Design API' },
      { id: 'card-2', label: 'Write tests' },
      { id: 'card-3', label: 'Build docs' },
    ],
  },
  {
    id: 'done',
    label: 'Done',
    cards: [
      { id: 'card-4', label: 'Set up repo' },
      { id: 'card-5', label: 'Add CI' },
    ],
  },
]

const fields = {
  dragAndDrop: DragAndDrop.Model,
  dragColumns: S.Array(DemoColumn),
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const subscriptions = Subscription.lift({
  dragPointer: DragAndDrop.subscriptions.documentPointer,
  dragEscape: DragAndDrop.subscriptions.documentEscape,
  dragKeyboard: DragAndDrop.subscriptions.documentKeyboard,
  autoScroll: DragAndDrop.subscriptions.autoScroll,
})<State, typeof Message.GotDragAndDropMessage.Type>({
  toChildModel: (model) => model.dragAndDrop,
  toParentMessage: (message) => Message.GotDragAndDropMessage({ message }),
})

export const slice = defineSlice({
  fields,
  init: {
    dragAndDrop: DragAndDrop.init({ id: 'drag-and-drop-demo' }),
    dragColumns: DRAG_COLUMNS,
  },
  messages: [Message.GotDragAndDropMessage],
  handlers: (model: State) => ({
    GotDragAndDropMessage: (payload: typeof Message.GotDragAndDropMessage.Type): UpdateReturn =>
      foldDragAndDrop(model, payload.message),
  }),
  samples: [],
  // Card drops are resolved through the child's out-messages; there are no
  // parent-side samples to feed update().
  subscriptions,
})
