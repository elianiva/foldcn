import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

/** Derived from the shadcn v4 BASE registry:
 *  apps/v4/registry/bases/base/ui/skeleton.tsx. */
export const skeletonClass = 'cn-skeleton animate-pulse'

type StyleConfig = Readonly<{ className?: string }>

/** Styled skeleton placeholder — a pulsing block. Mirrors the shadcn v4
 *  `skeleton.tsx`. */
export const skeleton = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class(cn(skeletonClass, config.className)), h.DataAttribute('slot', 'skeleton')],
    children,
  )
