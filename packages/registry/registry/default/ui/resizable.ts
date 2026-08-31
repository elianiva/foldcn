/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Resizable from '@/components/ui/resizable'`
 */
import { Function, Schema as S } from 'effect'
import type { Html } from 'foldkit/html'
import * as Update from 'foldkit/update'
import { defineMessageUnion } from 'foldkit/message'
import type { Reflect } from 'foldkit/submodel'
import { defineView } from 'foldkit/submodel'
import { evo } from 'foldkit/struct'

import { cn } from '@/lib/utils'

// Resizable is a two-pane split with a draggable handle. It owns the split
// position as a Submodel: embed it with `h.submodel` and listen for
// `ChangedValue` to lift the first pane's size (as a percentage) into your
// own model. Conform an externally-driven split with `reflect`.
//
// The handle carries a visually hidden range input so the split stays
// accessible and keyboard operable.
//
// foldcn gaps vs upstream: fixed two panes (no N panels), no min/max/collapse
// constraints, no autoSaveId persistence; the handle is a range input rather
// than a pointer-drag separator.

export const resizableContainerClass =
  'cn-resizable-panel-group flex h-full w-full aria-[orientation=vertical]:flex-col'

export const resizableContainerVerticalClass =
  'cn-resizable-panel-group flex h-full w-full aria-[orientation=vertical]:flex-col'

export const resizablePanelClass = ''

/** Upstream Separator string (aria-[orientation] variants key on the emitted
 *  aria-orientation attr). */
export const resizableHandleClass =
  'cn-resizable-handle relative flex w-px items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90'

export const resizableHandleHorizontalClass = ''

export const resizableHandleVerticalClass = ''

export type ResizablePane = Readonly<{ content: Html | string; className?: string }>

// MODEL

export const Model = S.Struct({
  id: S.String,
  /** First pane's size as a percentage (0–100). */
  value: S.Number,
})
export type Model = typeof Model.Type

// MESSAGES

/** The user moved the handle. Clamps into 0–100 and stores the new split. */
export const Message = defineMessageUnion({
  Resized: { value: S.Number },
})
export type Message = typeof Message.Type

/** Emitted when the split changes. */
export const OutMessage = defineMessageUnion({
  ChangedValue: { value: S.Number },
})
export type OutMessage = typeof OutMessage.Type

// INIT / UPDATE

export type InitConfig = Readonly<{
  id: string
  initialValue?: number
}>

/** Creates an initial resizable model. The value is clamped into 0–100. */
export const init = (config: InitConfig): Model => ({
  id: config.id,
  value: clamp(config.initialValue ?? 50),
})

const clamp = (value: number): number => Math.min(100, Math.max(0, value))

/** Conforms an externally-driven split onto the model without emitting an
 *  OutMessage (the world is the source of truth). Clamps into 0–100. */
export const reflect: Reflect<Model, number> = Function.dual(
  2,
  (model: Model, value: number): Model => evo(model, { value: () => clamp(value) }),
)

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

/** Processes a resizable message and returns the next model, commands, and an
 *  optional out-message for the parent. */
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'Resized': {
      const value = clamp(message.value)
      return {
        model: evo(model, { value: () => value }),
        outMessage: OutMessage.ChangedValue({ value }),
      }
    }
  }
}

// VIEW

export type ViewInputs = Readonly<{
  direction?: 'horizontal' | 'vertical'
  firstPane: ResizablePane
  secondPane: ResizablePane
  className?: string
}>

/** Renders the two-pane layout with the draggable split handle. Embedded via
 *  `h.submodel`. */
export const view = defineView<Model, Message, ViewInputs>((model, viewInputs, h) => {
  const isHorizontal = (viewInputs.direction ?? 'horizontal') === 'horizontal'
  const firstStyle: Record<string, string> = isHorizontal
    ? { width: `${model.value}%` }
    : { height: `${model.value}%` }
  const secondStyle: Record<string, string> = isHorizontal
    ? { width: `${100 - model.value}%` }
    : { height: `${100 - model.value}%` }
  const handle = h.div(
    [
      h.Class(
        cn(
          resizableHandleClass,
          isHorizontal ? resizableHandleHorizontalClass : resizableHandleVerticalClass,
        ),
      ),
      h.AriaOrientation(isHorizontal ? 'vertical' : 'horizontal'),
      h.DataAttribute('slot', 'resizable-handle'),
    ],
    [
      h.input([
        h.Type('range'),
        h.Min('0'),
        h.Max('100'),
        h.Step('1'),
        h.Value(String(model.value)),
        h.OnInput((raw) => Message.Resized({ value: Number(raw) })),
        h.AriaLabel('Resize panels'),
        h.Class(
          cn(
            'absolute inset-0 opacity-0',
            isHorizontal ? 'h-full w-full cursor-col-resize' : 'h-full w-full cursor-row-resize',
          ),
        ),
      ]),
    ],
  )
  return h.div(
    [
      h.Class(cn(resizableContainerClass, viewInputs.className)),
      h.DataAttribute('slot', 'resizable-panel-group'),
      h.AriaOrientation(isHorizontal ? 'horizontal' : 'vertical'),
    ],
    [
      h.div(
        [
          h.Style(firstStyle),
          h.Class(cn(resizablePanelClass, viewInputs.firstPane.className)),
          h.DataAttribute('slot', 'resizable-panel'),
        ],
        [viewInputs.firstPane.content],
      ),
      handle,
      h.div(
        [
          h.Style(secondStyle),
          h.Class(cn(resizablePanelClass, viewInputs.secondPane.className)),
          h.DataAttribute('slot', 'resizable-panel'),
        ],
        [viewInputs.secondPane.content],
      ),
    ],
  )
})
