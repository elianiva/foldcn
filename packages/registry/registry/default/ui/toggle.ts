import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

// Toggle is a two-state button (pressed / not) marked with `aria-pressed` and
// `data-state`. It is a pure presentational control — wire `onToggle` to your
// own model.
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/toggle.tsx. Class strings are identical to
// upstream; visual styling lives in the central foldcn style definition.

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

export type ToggleConfig<M> = Readonly<{
  variant?: ToggleVariant
  size?: ToggleSize
  isPressed?: boolean
  isDisabled?: boolean
  ariaLabel?: string
  onToggle?: (isPressed: boolean) => M
  className?: string
}>

/** A two-state toggle button. */
export const toggle = <M>(config: ToggleConfig<M>, label: Html | string, h: HtmlBuilder<M>): Html =>
  h.button(
    [
      h.Type('button'),
      ...(config.ariaLabel === undefined ? [] : [h.AriaLabel(config.ariaLabel)]),
      ...(config.isDisabled === true ? [h.Disabled(true)] : []),
      ...(config.onToggle === undefined ? [] : [h.OnClick(config.onToggle(!Boolean(config.isPressed)))]),
      h.DataAttribute('slot', 'toggle'),
      h.DataAttribute('state', config.isPressed === true ? 'on' : 'off'),
      ...(config.isPressed === true ? [h.AriaPressed('true')] : [h.AriaPressed('false')]),
      h.Class(
        cn(
          toggleBase,
          toggleVariants[config.variant ?? 'default'],
          toggleSizes[config.size ?? 'default'],
          config.className,
        ),
      ),
    ],
    [label],
  )
