import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

export type Direction = 'ltr' | 'rtl'

type DirectionConfig = Readonly<{ dir: Direction; className?: string }>

/**
 * Derived from the shadcn v4 BASE registry: apps/v4/registry/bases/base/ui/direction.tsx.
 * Upstream is a pure context provider (no DOM); foldcn has no context
 * primitive, so this renders a wrapper `<div dir=…>` descendants inherit.
 */
export const direction = <M>(
  config: DirectionConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => h.div([h.Dir(config.dir), h.Class(cn('w-full', config.className))], children)
