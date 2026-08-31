/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Toggle from '@/components/ui/toggle'`
 */
import { Function, Schema as S } from 'effect'
import type { Html } from 'foldkit/html'
import * as Update from 'foldkit/update'
import { defineMessageUnion } from 'foldkit/message'
import type { Reflect } from 'foldkit/submodel'
import { defineView } from 'foldkit/submodel'
import { evo } from 'foldkit/struct'

import { cn } from '@/lib/utils'

// Toggle is a two-state button (pressed / not) marked with `aria-pressed` and
// `data-state`. It owns its pressed state as a Submodel: embed it with
// `h.submodel` and listen for `ChangedPressed` if your app needs to react.
// Conform an externally-driven pressed state (URL, storage) with `reflect`.

export const toggleVariantKeys = ['default', 'outline'] as const
export type ToggleVariant = (typeof toggleVariantKeys)[number]

export const toggleVariants: Record<ToggleVariant, string> = {
  default: 'cn-toggle-variant-default',
  outline: 'cn-toggle-variant-outline',
}

export const toggleSizeKeys = ['default', 'sm', 'lg'] as const
export type ToggleSize = (typeof toggleSizeKeys)[number]

export const toggleSizes: Record<ToggleSize, string> = {
  default: 'cn-toggle-size-default',
  sm: 'cn-toggle-size-sm',
  lg: 'cn-toggle-size-lg',
}

/** Upstream cva base string. The disabled: variants are inert under foldkit
 *  (this view emits native disabled; twins kept for parity). */
export const toggleBase =
  'cn-toggle group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

// MODEL

export const Model = S.Struct({
  id: S.String,
  isPressed: S.Boolean,
})
export type Model = typeof Model.Type

// MESSAGES

/** The user clicked the toggle. Flips the pressed state. */
export const Message = defineMessageUnion({
  Toggled: {},
})
export type Message = typeof Message.Type

/** Emitted when the pressed state changes. */
export const OutMessage = defineMessageUnion({
  ChangedPressed: { isPressed: S.Boolean },
})
export type OutMessage = typeof OutMessage.Type

// INIT / UPDATE

export type InitConfig = Readonly<{
  id: string
  isPressed?: boolean
}>

/** Creates an initial toggle model. */
export const init = (config: InitConfig): Model => ({
  id: config.id,
  isPressed: config.isPressed ?? false,
})

/** Conforms an externally-driven pressed state onto the model without
 *  emitting an OutMessage (the world is the source of truth). */
export const reflect: Reflect<Model, boolean> = Function.dual(
  2,
  (model: Model, isPressed: boolean): Model => evo(model, { isPressed: () => isPressed }),
)

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

/** Processes a toggle message and returns the next model, commands, and an
 *  optional out-message for the parent. */
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'Toggled': {
      const isPressed = !model.isPressed
      return {
        model: evo(model, { isPressed: () => isPressed }),
        outMessage: OutMessage.ChangedPressed({ isPressed }),
      }
    }
  }
}

// VIEW

export type ViewInputs = Readonly<{
  label: Html | string
  variant?: ToggleVariant
  size?: ToggleSize
  /** Marks the toggle unavailable with a native disabled attribute. */
  isDisabled?: boolean
  ariaLabel?: string
  className?: string
}>

/** Renders the two-state toggle button. Embedded via `h.submodel`. */
export const view = defineView<Model, Message, ViewInputs>((model, viewInputs, h) =>
  h.button(
    [
      h.Type('button'),
      ...(viewInputs.ariaLabel === undefined ? [] : [h.AriaLabel(viewInputs.ariaLabel)]),
      ...(viewInputs.isDisabled === true ? [h.Disabled(true)] : []),
      h.OnClick(Message.Toggled()),
      h.DataAttribute('slot', 'toggle'),
      h.DataAttribute('state', model.isPressed ? 'on' : 'off'),
      h.AriaPressed(model.isPressed ? 'true' : 'false'),
      h.Class(
        cn(
          toggleBase,
          toggleVariants[viewInputs.variant ?? 'default'],
          toggleSizes[viewInputs.size ?? 'default'],
          viewInputs.className,
        ),
      ),
    ],
    [viewInputs.label],
  ),
)
