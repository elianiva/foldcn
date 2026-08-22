import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

export const aspectRatioClass = 'relative aspect-(--ratio)'

type AspectRatioConfig = Readonly<{ ratio: number; className?: string }>

/**
 * Derived from the shadcn v4 BASE registry:
 * apps/v4/registry/bases/base/ui/aspect-ratio.tsx (ratio drives the same
 * `--ratio` custom property; upstream requires it, so it is required here).
 * Place an `<img>`/`<iframe>` as a child.
 */
export const aspectRatio = <M>(
  config: AspectRatioConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(aspectRatioClass, config.className)),
      h.DataAttribute('slot', 'aspect-ratio'),
      h.Style({ '--ratio': String(config.ratio) }),
    ],
    children,
  )
