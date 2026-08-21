import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'
import { button, type ButtonConfig, type ButtonSize, type ButtonVariant } from './button'

type Child = Html | string

// ButtonGroup connects a run of buttons into a single segmented control. The
// container draws the outer frame and resets each child's rounding/cut so the
// group reads as one unit (mirrors shadcn's `button-group` base).

export const buttonGroupClass =
  'group/button-group inline-flex w-fit rounded-md shadow-xs *:not-first:-ml-px *:not-first:rounded-l-none *:not-first:border-l-0 *:not-last:rounded-r-none *:shadow-none'

export const buttonGroupItemClass =
  'relative rounded-md focus-visible:z-10 active:z-10 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-ring'

type StyleConfig = Readonly<{ className?: string }>

/** Segmented container — pass `buttonGroupItem(...)` children. */
export const buttonGroup = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class(cn(buttonGroupClass, config.className)), h.DataAttribute('slot', 'button-group')],
    children,
  )

/** A `button` styled to sit inside a `buttonGroup` (connected corners). */
export const buttonGroupItem = <M>(
  config: ButtonConfig<M>,
  label: Html | string,
  h: HtmlBuilder<M>,
): Html =>
  button<M>(
    {
      ...config,
      size: (config.size ?? 'default') satisfies ButtonSize,
      variant: (config.variant ?? 'outline') satisfies ButtonVariant,
      className: cn(buttonGroupItemClass, config.className),
    },
    label,
    h,
  )
