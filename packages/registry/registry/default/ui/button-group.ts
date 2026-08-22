import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'
import { button, type ButtonConfig, type ButtonSize, type ButtonVariant } from './button'
import { separatorClass } from './separator'

type Child = Html | string

// ButtonGroup connects a run of controls into a single segmented control.
// Children keep their own outlines; the group's corner-cutting rules join
// them (upstream model).
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/button-group.tsx. Class strings are
// identical to upstream; visual styling lives in the central foldcn style definition.

export const buttonGroupClass =
  'cn-button-group flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 [&>[data-slot=select-trigger]:not([class*=\'w-\'])]:w-fit [&>input]:flex-1'

export const buttonGroupOrientationClasses = {
  horizontal:
    'cn-button-group-orientation-horizontal *:data-slot:rounded-r-none [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]]:border-l-0',
  vertical:
    'cn-button-group-orientation-vertical flex-col *:data-slot:rounded-b-none [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0',
} as const

export type ButtonGroupOrientation = keyof typeof buttonGroupOrientationClasses

/** Upstream ButtonGroupText string. */
export const buttonGroupTextClass =
  'cn-button-group-text flex items-center [&_svg]:pointer-events-none'

/** Upstream ButtonGroupSeparator string. */
export const buttonGroupSeparatorClass =
  'cn-button-group-separator relative self-stretch data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto'

type StyleConfig = Readonly<{ className?: string; orientation?: ButtonGroupOrientation }>

/** Segmented container — pass buttons/selects/inputs as children. */
export const buttonGroup = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => {
  const orientation = config.orientation ?? 'horizontal'
  return h.div(
    [
      h.Role('group'),
      h.Class(
        cn(buttonGroupClass, buttonGroupOrientationClasses[orientation], config.className),
      ),
      h.DataAttribute('slot', 'button-group'),
      h.DataAttribute('orientation', orientation),
      h.DataAttribute(orientation, ''),
    ],
    children,
  )
}

/** Non-interactive text label inside a group. */
export const buttonGroupText = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'button-group-text'), h.Class(cn(buttonGroupTextClass, config.className))],
    children,
  )

// Upstream renders the shared <Separator> part; foldcn composes the same
// attribute set and class merge (separator base wins conflicts first) by hand.

/** Divider between grouped controls — a vertical `Separator` by default,
 *  matching upstream `ButtonGroupSeparator`. */
export const buttonGroupSeparator = <M>(config: StyleConfig, h: HtmlBuilder<M>): Html => {
  const orientation = config.orientation ?? 'vertical'
  return h.div(
    [
      h.Role('separator'),
      h.AriaOrientation(orientation),
      h.DataAttribute('slot', 'button-group-separator'),
      h.DataAttribute('orientation', orientation),
      h.DataAttribute(orientation, ''),
      h.Class(cn(separatorClass, buttonGroupSeparatorClass, config.className)),
    ],
    [],
  )
}

/** A `button` styled to sit inside a `buttonGroup`. */
export const buttonGroupItem = <M>(
  config: ButtonConfig<M>,
  label: Html | string,
  h: HtmlBuilder<M>,
): Html =>
  button<M>(
    {
      ...config,
      size: config.size ?? ('default' as ButtonSize),
      variant: config.variant ?? ('outline' as ButtonVariant),
      className: cn(config.className),
    },
    label,
    h,
  )
