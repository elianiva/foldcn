/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as ToggleGroup from '@/components/ui/toggle-group'`
 */
import { Function, Option, Schema as S } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import type { Reflect } from 'foldkit/submodel'
import { defineView } from 'foldkit/submodel'
import { evo } from 'foldkit/struct'
import * as Update from 'foldkit/update'

import { cn } from '@/lib/utils'
import { icon } from '@/lib/icons'
import {
  toggleBase,
  toggleSizes,
  toggleVariants,
  type ToggleSize,
  type ToggleVariant,
} from './toggle'

type IconNode = Parameters<typeof icon>[1]

// ToggleGroup is a set of toggles that share a single (or multiple) selection.
// It owns the selection as a Submodel: embed it with `h.submodel` and listen
// for `ChangedValue` to lift selection changes into your own model. Conform an
// externally-driven selection with `reflect`.
//
// Upstream renders a loose flex row joined only when spacing is 0; foldcn
// keeps the same model via the `spacing` config (default 2, matching
// upstream). Item defaults follow upstream: variant "default", size
// "default".

export const toggleGroupClass =
  'cn-toggle-group group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch'

/** Upstream item string (joined-strip rules apply only at spacing 0). */
export const toggleGroupItemClass =
  'cn-toggle-group-item shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t'

export const Type = S.Literals(['single', 'multiple'])
export type ToggleGroupType = typeof Type.Type

export type ToggleGroupOrientation = 'horizontal' | 'vertical'

export type ToggleGroupItem = Readonly<{
  value: string
  label: string
  icon?: IconNode
  ariaLabel?: string
}>

// MODEL

export const Model = S.Struct({
  id: S.String,
  type: Type,
  value: S.Array(S.String),
})
export type Model = typeof Model.Type

// MESSAGES

/** The user clicked one of the toggles. Flips that item's membership in the
 *  selection — replacing it entirely when `type` is `single`. */
export const Message = defineMessageUnion({
  ToggledItem: { value: S.String },
})
export type Message = typeof Message.Type

/** Emitted when the selection changes. */
export const OutMessage = defineMessageUnion({
  ChangedValue: { value: S.Array(S.String) },
})
export type OutMessage = typeof OutMessage.Type

const nextValue = (
  current: ReadonlyArray<string>,
  value: string,
  type: ToggleGroupType,
): ReadonlyArray<string> => {
  const isSelected = current.includes(value)
  if (type === 'single') return isSelected ? [] : [value]
  return isSelected ? current.filter((v) => v !== value) : [...current, value]
}

// INIT / UPDATE

export type InitConfig = Readonly<{
  id: string
  type?: ToggleGroupType
  value?: ReadonlyArray<string>
}>

/** Creates an initial toggle group model. */
export const init = (config: InitConfig): Model => ({
  id: config.id,
  type: config.type ?? 'single',
  value: config.value === undefined ? [] : [...config.value],
})

/** Conforms an externally-driven selection onto the model without emitting an
 *  OutMessage (the world is the source of truth). */
export const reflect: Reflect<Model, ReadonlyArray<string>> = Function.dual(
  2,
  (model: Model, value: ReadonlyArray<string>): Model => evo(model, { value: () => [...value] }),
)

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

/** Processes a toggle group message and returns the next model, commands, and
 *  an optional out-message for the parent. */
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'ToggledItem': {
      const value = nextValue(model.value, message.value, model.type)
      return {
        model: evo(model, { value: () => [...value] }),
        outMessage: OutMessage.ChangedValue({ value }),
      }
    }
  }
}

// VIEW

export type ViewInputs = Readonly<{
  items: ReadonlyArray<ToggleGroupItem>
  variant?: ToggleVariant
  size?: ToggleSize
  isDisabled?: boolean
  /** Gap between items in spacing units. `0` joins items into a strip.
   *  Defaults to 2 like upstream. */
  spacing?: number
  orientation?: ToggleGroupOrientation
  ariaLabel?: string
  className?: string
}>

/** Renders the group of toggles sharing the submodel's selection. Embedded
 *  via `h.submodel`. */
export const view = defineView<Model, Message, ViewInputs>((model, viewInputs, h) => {
  const spacing = viewInputs.spacing ?? 2
  const orientation = viewInputs.orientation ?? 'horizontal'
  return h.div(
    [
      ...(viewInputs.ariaLabel === undefined ? [] : [h.AriaLabel(viewInputs.ariaLabel)]),
      h.Role('group'),
      h.Class(cn(toggleGroupClass, viewInputs.className)),
      h.DataAttribute('slot', 'toggle-group'),
      h.DataAttribute('orientation', orientation),
      h.DataAttribute('spacing', String(spacing)),
      h.DataAttribute('variant', viewInputs.variant ?? 'default'),
      h.DataAttribute('size', viewInputs.size ?? 'default'),
      ...(orientation === 'vertical'
        ? [h.DataAttribute('vertical', '')]
        : [h.DataAttribute('horizontal', '')]),
      h.Style({ '--gap': String(spacing) }),
    ],
    viewInputs.items.map((item) =>
      h.button(
        [
          h.Type('button'),
          ...(item.ariaLabel === undefined ? [] : [h.AriaLabel(item.ariaLabel)]),
          ...(viewInputs.isDisabled === true ? [h.Disabled(true)] : []),
          h.OnClick(Message.ToggledItem({ value: item.value })),
          h.DataAttribute('slot', 'toggle-group-item'),
          h.DataAttribute('variant', viewInputs.variant ?? 'default'),
          h.DataAttribute('size', viewInputs.size ?? 'default'),
          h.DataAttribute('spacing', String(spacing)),
          h.DataAttribute('state', model.value.includes(item.value) ? 'on' : 'off'),
          h.AriaPressed(model.value.includes(item.value) ? 'true' : 'false'),
          h.Class(
            cn(
              toggleBase,
              toggleVariants[viewInputs.variant ?? 'default'],
              toggleSizes[viewInputs.size ?? 'default'],
              toggleGroupItemClass,
            ),
          ),
        ],
        [item.icon === undefined ? item.label : h.span([], [icon(h, item.icon), item.label])],
      ),
    ),
  )
})
