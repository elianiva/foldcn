import { clsx } from 'clsx'
import { Array, Option, pipe } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@foldcn/registry/styles/default/lib/utils'
import * as DragAndDrop from '@foldcn/registry/styles/default/ui/drag-and-drop'

import { GotDragAndDropMessage, type Message } from '../message'
import type { DemoCard, DemoColumn, Model } from '../model'

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
  h: HtmlBuilder<Message>,
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
          toParentMessage: (message) => GotDragAndDropMessage({ message }),
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

const dropPlaceholder = (h: HtmlBuilder<Message>): Html =>
  h.keyed('div')('drop-placeholder', [h.Class(DragAndDrop.dragDropPlaceholderClass)])

const renderColumn = (
  column: DemoColumn,
  model: Model,
  children: ReadonlyArray<Html>,
  h: HtmlBuilder<Message>,
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
  h: HtmlBuilder<Message>,
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
  h: HtmlBuilder<Message>,
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

export const dragAndDropView = (model: Model, h: HtmlBuilder<Message>): Html =>
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
