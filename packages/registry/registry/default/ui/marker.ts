import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

/**
 * Derived from the shadcn v4 BASE registry: apps/v4/registry/bases/base/ui/marker.tsx.
 * Keep the class strings identical to upstream — visual styling lives in the central foldcn style definition (cn-marker-variant-default is an intentional
 * no-op hook upstream too). See docs/deriving-from-base.md.
 */

export const markerVariantKeys = ['default', 'separator', 'border'] as const
export type MarkerVariant = (typeof markerVariantKeys)[number]

export const markerVariants: Record<MarkerVariant, string> = {
  default: 'cn-marker-variant-default',
  separator:
    'cn-marker-variant-separator',
  border: 'cn-marker-variant-border',
}

export const markerClass = 'cn-marker group/marker relative flex w-full items-center'

export const markerIconClass = 'cn-marker-icon shrink-0'

export const markerContentClass = 'cn-marker-content min-w-0 wrap-break-word'

type StyleConfig = Readonly<{ className?: string; variant?: MarkerVariant }>

const markerContainer = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(markerClass, markerVariants[config.variant ?? 'default'], config.className)),
      h.DataAttribute('slot', 'marker'),
      h.DataAttribute('variant', config.variant ?? 'default'),
    ],
    children,
  )

const markerIcon = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.span(
    [h.Class(cn(markerIconClass, config.className)), h.AriaHidden(true), h.DataAttribute('slot', 'marker-icon')],
    children,
  )

const markerContent = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.span(
    [h.Class(cn(markerContentClass, config.className)), h.DataAttribute('slot', 'marker-content')],
    children,
  )

/** Styled marker — `Marker.icon` and `Marker.content` sub-builders. Mirrors the
 *  shadcn v4 `marker.tsx`. */
export const Marker = Object.assign(markerContainer, {
  icon: markerIcon,
  content: markerContent,
})
