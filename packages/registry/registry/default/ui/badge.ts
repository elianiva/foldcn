import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

/**
 * Derived from the shadcn v4 BASE registry: apps/v4/registry/bases/base/ui/badge.tsx.
 * Keep the class strings identical to upstream — visual styling lives in the central foldcn style definition. See docs/deriving-from-base.md.
 */

/** Badge variant keys — keep in sync with `badgeVariants`. */
export const badgeVariantKeys = [
  'default',
  'secondary',
  'destructive',
  'outline',
  'ghost',
  'link',
] as const

export const badgeVariants: Record<BadgeVariant, string> = {
  default: 'cn-badge-variant-default',
  secondary: 'cn-badge-variant-secondary',
  destructive: 'cn-badge-variant-destructive',
  outline: 'cn-badge-variant-outline',
  ghost: 'cn-badge-variant-ghost',
  link: 'cn-badge-variant-link',
}

export type BadgeVariant = (typeof badgeVariantKeys)[number]

export const badgeClass =
  'cn-badge group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none'

type StyleConfig = Readonly<{ className?: string; variant?: BadgeVariant }>

/** Styled badge built as a themed `<span>` (mirrors the shadcn v4 `badge.tsx`
 *  default element). For a link badge, render an `<a>` child and apply
 *  `badgeClass` via `cn` — foldcn has no Radix `Slot`. */
export const badge = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.span(
    [
      h.Class(cn(badgeClass, badgeVariants[config.variant ?? 'default'], config.className)),
      h.DataAttribute('slot', 'badge'),
      h.DataAttribute('variant', config.variant ?? 'default'),
    ],
    children,
  )
