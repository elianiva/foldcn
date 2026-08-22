import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

// --- Class constants ---
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/item.tsx. Class strings are identical to
// upstream; visual styling lives in the central foldcn style definition.

export const itemGroupClass = 'cn-item-group group/item-group flex w-full flex-col'

export const itemSeparatorClass = 'cn-item-separator'

export const itemVariantKeys = ['default', 'outline', 'muted'] as const
export type ItemVariant = (typeof itemVariantKeys)[number]

export const itemVariants: Record<ItemVariant, string> = {
  default: 'cn-item-variant-default',
  outline: 'cn-item-variant-outline',
  muted: 'cn-item-variant-muted',
}

export const itemSizeKeys = ['default', 'sm', 'xs'] as const
export type ItemSize = (typeof itemSizeKeys)[number]

export const itemSizes: Record<ItemSize, string> = {
  default: 'cn-item-size-default',
  sm: 'cn-item-size-sm',
  xs: 'cn-item-size-xs',
}

/** Upstream cva base string. */
export const itemClass =
  'cn-item group/item flex w-full flex-wrap items-center transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors'

export const itemMediaVariantKeys = ['default', 'icon', 'image'] as const
export type ItemMediaVariant = (typeof itemMediaVariantKeys)[number]

export const itemMediaVariants: Record<ItemMediaVariant, string> = {
  default: 'cn-item-media-variant-default',
  icon: 'cn-item-media-variant-icon',
  image: 'cn-item-media-variant-image',
}

export const itemMediaClass =
  'cn-item-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none'

export const itemContentClass =
  'cn-item-content flex flex-1 flex-col [&+[data-slot=item-content]]:flex-none'

export const itemTitleClass = 'cn-item-title line-clamp-1 flex w-fit items-center'

export const itemDescriptionClass =
  'cn-item-description line-clamp-2 font-normal [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary'

export const itemActionsClass = 'cn-item-actions flex items-center'
export const itemHeaderClass = 'cn-item-header flex basis-full items-center justify-between'
export const itemFooterClass = 'cn-item-footer flex basis-full items-center justify-between'

// --- Types ---

type StyleConfig = Readonly<{ className?: string }>

type ItemConfig = Readonly<{
  variant?: ItemVariant
  size?: ItemSize
  className?: string
}>

type ItemMediaConfig = Readonly<{ variant?: ItemMediaVariant; className?: string }>

type ItemSeparatorConfig = Readonly<{
  orientation?: 'horizontal' | 'vertical'
  className?: string
}>

// --- Builders ---

const itemGroup = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Role('list'), h.Class(cn(itemGroupClass, config.className)), h.DataAttribute('slot', 'item-group')],
    children,
  )

const itemSeparator = <M>(config: ItemSeparatorConfig, h: HtmlBuilder<M>): Html =>
  h.div(
    [
      h.Class(cn(itemSeparatorClass, config.className)),
      h.DataAttribute('slot', 'item-separator'),
      h.DataAttribute('orientation', config.orientation ?? 'horizontal'),
    ],
    [],
  )

const itemContainer = <M>(
  config: ItemConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(
        cn(
          itemClass,
          itemVariants[config.variant ?? 'default'],
          itemSizes[config.size ?? 'default'],
          config.className,
        ),
      ),
      h.DataAttribute('slot', 'item'),
      h.DataAttribute('variant', config.variant ?? 'default'),
      h.DataAttribute('size', config.size ?? 'default'),
    ],
    children,
  )

const itemMedia = <M>(
  config: ItemMediaConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(itemMediaClass, itemMediaVariants[config.variant ?? 'default'], config.className)),
      h.DataAttribute('slot', 'item-media'),
      h.DataAttribute('variant', config.variant ?? 'default'),
    ],
    children,
  )

const itemContent = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.Class(cn(itemContentClass, config.className)), h.DataAttribute('slot', 'item-content')], children)

const itemTitle = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.Class(cn(itemTitleClass, config.className)), h.DataAttribute('slot', 'item-title')], children)

const itemDescription = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class(cn(itemDescriptionClass, config.className)), h.DataAttribute('slot', 'item-description')],
    children,
  )

const itemActions = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.Class(cn(itemActionsClass, config.className)), h.DataAttribute('slot', 'item-actions')], children)

const itemHeader = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.Class(cn(itemHeaderClass, config.className)), h.DataAttribute('slot', 'item-header')], children)

const itemFooter = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.Class(cn(itemFooterClass, config.className)), h.DataAttribute('slot', 'item-footer')], children)

/** Styled item — a flexible list row with `Item.group`, `Item.separator`,
 *  `Item.media`, `Item.content`, `Item.title`, `Item.description`,
 *  `Item.actions`, `Item.header`, `Item.footer` sub-builders. Mirrors the
 *  shadcn v4 `item.tsx`. */
export const Item = Object.assign(itemContainer, {
  group: itemGroup,
  separator: itemSeparator,
  media: itemMedia,
  content: itemContent,
  title: itemTitle,
  description: itemDescription,
  actions: itemActions,
  header: itemHeader,
  footer: itemFooter,
})
