import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'
import { inputClass } from './input'

type Child = Html | string

// InputGroup draws a shared bordered box and lets you slot text/icon add-ons
// around a connected input. The inner control carries
// data-slot="input-group-control" so the group token's focus/invalid/disabled
// frame states key off it.
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/input-group.tsx. Class strings are identical
// to upstream; visual styling lives in the central foldcn style definition.

/** Upstream InputGroup root string. */
export const inputGroupClass =
  'group/input-group cn-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto'

/** Upstream InputGroupAddon base string; alignment via the align tokens. */
export const inputGroupAddonClass =
  'cn-input-group-addon flex cursor-text items-center justify-center select-none'

export const inputGroupAddonAlignClasses = {
  'inline-start': 'cn-input-group-addon-align-inline-start order-first',
  'inline-end': 'cn-input-group-addon-align-inline-end order-last',
  'block-start': 'cn-input-group-addon-align-block-start order-first w-full justify-start',
  'block-end': 'cn-input-group-addon-align-block-end order-last w-full justify-start',
} as const

export type InputGroupAddonAlign = keyof typeof inputGroupAddonAlignClasses

export const inputGroupButtonSizeKeys = ['xs', 'sm', 'icon-xs', 'icon-sm'] as const
export type InputGroupButtonSize = (typeof inputGroupButtonSizeKeys)[number]

/** Upstream InputGroupButton base string (sizes are tokens). */
export const inputGroupButtonClass =
  'cn-input-group-button flex items-center shadow-none'

export const inputGroupTextClass =
  'cn-input-group-text flex items-center [&_svg]:pointer-events-none'

export const inputGroupInputClass =
  'cn-input-group-input flex-1'

export type InputGroupInputConfig<M> = Readonly<{
  id: string
  value?: string
  onInput?: (value: string) => M
  isDisabled?: boolean
  isReadOnly?: boolean
  isInvalid?: boolean
  placeholder?: string
  name?: string
  type?: string
  className?: string
}>

/** The connected input for use inside `inputGroup`. Emits
 *  data-slot="input-group-control" so the group frame reacts to it. */
export const inputGroupInput = <M>(
  config: InputGroupInputConfig<M>,
  h: HtmlBuilder<M>,
  extraAttributes: ReadonlyArray<Attribute<M>> = [],
): Html =>
  h.input(
    [
      h.Id(config.id),
      ...(config.onInput === undefined ? [] : [h.OnInput(config.onInput)]),
      ...(config.value === undefined ? [] : [h.Value(config.value)]),
      ...(config.isDisabled === true ? [h.Disabled(true), h.DataAttribute('disabled', '')] : []),
      ...(config.isReadOnly === true ? [h.Attribute('readonly', 'true')] : []),
      ...(config.isInvalid === true ? [h.AriaInvalid(true), h.DataAttribute('invalid', '')] : []),
      ...(config.name === undefined ? [] : [h.Name(config.name)]),
      ...(config.type === undefined ? [] : [h.Type(config.type)]),
      ...(config.placeholder === undefined ? [] : [h.Placeholder(config.placeholder)]),
      h.DataAttribute('slot', 'input-group-control'),
      h.Class(cn(inputClass, inputGroupInputClass, config.className)),
      ...extraAttributes,
    ],
  )

type StyleConfig = Readonly<{ className?: string }>

type AddonConfig = StyleConfig & Readonly<{ align?: InputGroupAddonAlign }>

/** Add-on (text or icon) for either side of the group. */
export const inputGroupAddon = <M>(
  config: AddonConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => {
  const align = config.align ?? 'inline-start'
  return h.div(
    [
      h.DataAttribute('slot', 'input-group-addon'),
      h.DataAttribute('align', align),
      h.Class(cn(inputGroupAddonClass, inputGroupAddonAlignClasses[align], config.className)),
    ],
    children,
  )
}

/** Alias kept for backward compatibility — an inline-start text addon. */
export const inputGroupText = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.Class(cn(inputGroupTextClass, config.className)), h.DataAttribute('slot', 'input-group-text')], children)

/** Segmented container — pass addons / controls as children. */
export const inputGroup = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.Class(cn(inputGroupClass, config.className)), h.DataAttribute('slot', 'input-group')], children)
