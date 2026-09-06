/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as DragAndDrop from '@/components/ui/drag-and-drop'`
 */
import { DragAndDrop as FoldkitDragAndDrop } from '@foldkit/ui'

// Re-export the @foldkit/ui DragAndDrop surface. Drag and drop is heavily
// consumer-driven: you own the item/container data model, and this module
// provides the styled hooks (`draggable`, `sortable`, `droppable`) plus the
// helpers for reading drag state. Wire `data-dragging` / `data-drop-target`
// in your view via `isDragging` / `maybeDropTarget` — the submodel does not
// emit those attributes itself (it emits `data-draggable-id`,
// `data-sortable-id`, `data-droppable-id`, `role`, `aria-roledescription`,
// and `tabindex`). See the showcase view for the full pattern.

export const init = FoldkitDragAndDrop.init
export const update = FoldkitDragAndDrop.update
export const draggable = FoldkitDragAndDrop.draggable
export const droppable = FoldkitDragAndDrop.droppable
export const sortable = FoldkitDragAndDrop.sortable
export const ghostStyle = FoldkitDragAndDrop.ghostStyle
export const isDragging = FoldkitDragAndDrop.isDragging
export const maybeDraggedItemId = FoldkitDragAndDrop.maybeDraggedItemId
export const maybeDropTarget = FoldkitDragAndDrop.maybeDropTarget
export const subscriptions = FoldkitDragAndDrop.subscriptions
export const Model = FoldkitDragAndDrop.Model
export type Model = typeof Model.Type
export const Message = FoldkitDragAndDrop.Message
export type Message = typeof Message.Type
export const OutMessage = FoldkitDragAndDrop.OutMessage
export type OutMessage = typeof OutMessage.Type

export type InitConfig = FoldkitDragAndDrop.InitConfig
export type DraggableConfig<M> = FoldkitDragAndDrop.DraggableConfig<M>
export type DraggableMessage = FoldkitDragAndDrop.DraggableMessage

export const dragCardClass =
  'cn-item cn-item-variant-outline cn-item-size-default cursor-grab select-none bg-card text-card-foreground shadow-xs data-[dragging]:opacity-50 active:cursor-grabbing'

export const dragDropPlaceholderClass =
  'cn-item h-9 border-2 border-dashed border-primary/50 bg-primary/5'

export const dragContainerClass =
  'cn-card flex min-h-[120px] flex-col gap-1.5 border-2 border-transparent bg-muted/50 p-2 outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[drop-target]:border-dashed data-[drop-target]:border-primary/50 data-[drop-target]:bg-accent/50'

export const dragGhostClass =
  'cn-item cn-item-variant-outline cn-item-size-default bg-card text-card-foreground shadow-lg ring-1 ring-foreground/10 select-none'
