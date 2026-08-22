import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

export type SeparatorOrientation = 'horizontal' | 'vertical'

/**
 * Derived from the shadcn v4 BASE registry: apps/v4/registry/bases/base/ui/separator.tsx.
 * Upstream styles `data-horizontal:`/`data-vertical:` (Base UI primitive
 * attributes); foldcn emits both those attributes and `data-orientation` so
 * the upstream class string works verbatim.
 */

export const separatorClass =
  'shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch'

type SeparatorConfig = Readonly<{
  orientation?: SeparatorOrientation
  className?: string
}>

/** Styled separator — a `role="separator"` divider. Derived from the shadcn
 *  v4 BASE registry `separator.tsx`. */
export const separator = <M>(config: SeparatorConfig, h: HtmlBuilder<M>): Html => {
  const orientation = config.orientation ?? 'horizontal'
  return h.div(
    [
      h.Class(cn(separatorClass, config.className)),
      h.Role('separator'),
      h.AriaOrientation(orientation),
      h.DataAttribute('slot', 'separator'),
      h.DataAttribute('orientation', orientation),
      h.DataAttribute(orientation, ''),
    ],
    [],
  )
}
