import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'
import { icon } from '@/lib/icons'
import { toggle, type ToggleSize, type ToggleVariant } from './toggle'

type IconNode = Parameters<typeof icon>[1]
type Child = Html | string

// ToggleGroup is a set of toggles that share a single (or multiple) selection.
// It is a pure presentational control — wire `onValueChange` to your own model.
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/toggle-group.tsx. Class strings are
// identical to upstream; visual styling lives in the central foldcn style definition.
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

export type ToggleGroupType = 'single' | 'multiple'

export type ToggleGroupOrientation = 'horizontal' | 'vertical'

export type ToggleGroupItem = Readonly<{
  value: string
  label: string
  icon?: IconNode
  ariaLabel?: string
}>

export type ToggleGroupConfig<M> = Readonly<{
  type?: ToggleGroupType
  value: ReadonlyArray<string>
  onValueChange?: (value: ReadonlyArray<string>) => M
  isDisabled?: boolean
  variant?: ToggleVariant
  size?: ToggleSize
  /** Gap between items in spacing units. `0` joins items into a strip.
   *  Defaults to 2 like upstream. */
  spacing?: number
  orientation?: ToggleGroupOrientation
  ariaLabel?: string
  className?: string
}>

const nextValue = (
  current: ReadonlyArray<string>,
  value: string,
  type: ToggleGroupType,
): ReadonlyArray<string> => {
  const isSelected = current.includes(value)
  if (type === 'single') return isSelected ? [] : [value]
  return isSelected ? current.filter((v) => v !== value) : [...current, value]
}

/** A group of toggles with shared selection. */
export const toggleGroup = <M>(
  config: ToggleGroupConfig<M>,
  items: ReadonlyArray<ToggleGroupItem>,
  h: HtmlBuilder<M>,
): Html => {
  const type = config.type ?? 'single'
  const value = config.value
  const spacing = config.spacing ?? 2
  const orientation = config.orientation ?? 'horizontal'
  return h.div(
    [
      ...(config.ariaLabel === undefined ? [] : [h.AriaLabel(config.ariaLabel)]),
      h.Role('group'),
      h.Class(cn(toggleGroupClass, config.className)),
      h.DataAttribute('slot', 'toggle-group'),
      h.DataAttribute('orientation', orientation),
      h.DataAttribute('spacing', String(spacing)),
      h.DataAttribute('variant', config.variant ?? 'default'),
      h.DataAttribute('size', config.size ?? 'default'),
      ...(orientation === 'vertical' ? [h.DataAttribute('vertical', '')] : [h.DataAttribute('horizontal', '')]),
      h.Style({ '--gap': String(spacing) }),
    ],
    items.map((item) =>
      toggle<M>(
        {
          variant: config.variant ?? 'default',
          size: config.size ?? 'default',
          isPressed: value.includes(item.value),
          isDisabled: config.isDisabled,
          ariaLabel: item.ariaLabel ?? item.label,
          className: toggleGroupItemClass,
          onToggle: () => config.onValueChange!(nextValue(value, item.value, type)),
        },
        item.icon === undefined ? item.label : h.span([], [icon(h, item.icon), item.label]),
        h,
      ),
    ),
  )
}
