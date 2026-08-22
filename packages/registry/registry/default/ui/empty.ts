import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

/**
 * Derived from the shadcn v4 BASE registry: apps/v4/registry/bases/base/ui/empty.tsx.
 * Keep the class strings identical to upstream — visual styling lives in the central foldcn style definition. See docs/deriving-from-base.md.
 */

export const emptyClass =
  'cn-empty flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance'

export const emptyHeaderClass = 'cn-empty-header flex max-w-sm flex-col items-center'

export const emptyMediaVariantKeys = ['default', 'icon'] as const
export type EmptyMediaVariant = (typeof emptyMediaVariantKeys)[number]

export const emptyMediaClass =
  'cn-empty-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const emptyMediaVariants: Record<EmptyMediaVariant, string> = {
  default: 'cn-empty-media-default',
  icon: 'cn-empty-media-icon',
}

export const emptyTitleClass = 'cn-empty-title cn-font-heading'

export const emptyDescriptionClass =
  'cn-empty-description text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary'

export const emptyContentClass =
  'cn-empty-content flex w-full max-w-sm min-w-0 flex-col items-center text-balance'

type StyleConfig = Readonly<{ className?: string }>

type EmptyMediaConfig = Readonly<{ variant?: EmptyMediaVariant; className?: string }>

const emptyContainer = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.Class(cn(emptyClass, config.className)), h.DataAttribute('slot', 'empty')], children)

const emptyHeader = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.Class(cn(emptyHeaderClass, config.className)), h.DataAttribute('slot', 'empty-header')], children)

const emptyMedia = <M>(
  config: EmptyMediaConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(emptyMediaClass, emptyMediaVariants[config.variant ?? 'default'], config.className)),
      h.DataAttribute('slot', 'empty-icon'),
      h.DataAttribute('variant', config.variant ?? 'default'),
    ],
    children,
  )

const emptyTitle = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.Class(cn(emptyTitleClass, config.className)), h.DataAttribute('slot', 'empty-title')], children)

const emptyDescription = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class(cn(emptyDescriptionClass, config.className)), h.DataAttribute('slot', 'empty-description')],
    children,
  )

const emptyContent = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.Class(cn(emptyContentClass, config.className)), h.DataAttribute('slot', 'empty-content')], children)

/** Styled empty state — `Empty.header`, `Empty.media`, `Empty.title`,
 *  `Empty.description`, `Empty.content` sub-builders. Mirrors the shadcn v4
 *  `empty.tsx`. */
export const Empty = Object.assign(emptyContainer, {
  header: emptyHeader,
  media: emptyMedia,
  title: emptyTitle,
  description: emptyDescription,
  content: emptyContent,
})
