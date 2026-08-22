import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

/** Derived from the shadcn v4 BASE registry:
 *  apps/v4/registry/bases/base/ui/label.tsx. */
export const labelClass =
  'cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed'

type LabelConfig = Readonly<{ forId?: string; className?: string }>

/** Styled label. Mirrors the shadcn v4 `label.tsx` (no Radix primitive). */
export const label = <M>(
  config: LabelConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.label(
    [
      h.Class(cn(labelClass, config.className)),
      h.DataAttribute('slot', 'label'),
      ...(config.forId === undefined ? [] : [h.For(config.forId)]),
    ],
    children,
  )
