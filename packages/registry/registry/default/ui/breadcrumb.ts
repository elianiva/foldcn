import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'
import { icon } from '@/lib/icons'
import { ChevronRight, MoreHorizontal } from 'lucide'

type Child = Html | string

// Breadcrumb is a pure presentational landmark. `Breadcrumb` is the container
// (a `nav`); sub-builders are attached as properties: Breadcrumb.list,
// Breadcrumb.item, Breadcrumb.link, Breadcrumb.page, Breadcrumb.separator,
// Breadcrumb.ellipsis.
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/breadcrumb.tsx. Class strings are identical
// to upstream; visual styling lives in the central foldcn style definition
// (cn-breadcrumb itself is an intentional no-op hook upstream).

export const breadcrumbClass = 'cn-breadcrumb'

export const breadcrumbListClass = 'cn-breadcrumb-list flex flex-wrap items-center wrap-break-word'

export const breadcrumbItemClass = 'cn-breadcrumb-item inline-flex items-center'

export const breadcrumbLinkClass = 'cn-breadcrumb-link transition-colors hover:text-foreground'

export const breadcrumbPageClass = 'cn-breadcrumb-page font-normal text-foreground'

export const breadcrumbSeparatorClass = 'cn-breadcrumb-separator [&>svg]:size-3.5 shrink-0'

export const breadcrumbEllipsisClass =
  'cn-breadcrumb-ellipsis flex items-center justify-center'

type StyleConfig = Readonly<{ className?: string }>

const breadcrumbContainer = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.nav(
    [
      h.AriaLabel('breadcrumb'),
      h.Class(cn(breadcrumbClass, config.className)),
      h.DataAttribute('slot', 'breadcrumb'),
    ],
    children,
  )

const breadcrumbList = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.ol([h.Class(cn(breadcrumbListClass)), h.DataAttribute('slot', 'breadcrumb-list')], children)

const breadcrumbItem = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.li([h.Class(cn(breadcrumbItemClass)), h.DataAttribute('slot', 'breadcrumb-item')], children)

const breadcrumbLink = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.a([h.Class(cn(breadcrumbLinkClass, config.className)), h.DataAttribute('slot', 'breadcrumb-link')], children)

type BreadcrumbPageConfig = Readonly<{ className?: string; isCurrent?: boolean }>

const breadcrumbPage = <M>(
  config: BreadcrumbPageConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.span(
    [
      ...(config.isCurrent ?? false
        ? [h.Role('link'), h.AriaDisabled(true), h.AriaCurrent('page')]
        : []),
      h.Class(cn(breadcrumbPageClass, config.className)),
      h.DataAttribute('slot', 'breadcrumb-page'),
    ],
    children,
  )

/** Ellipsis — collapsed middle pages. */
const breadcrumbEllipsis = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child> = [],
  h: HtmlBuilder<M>,
): Html =>
  h.li(
    [
      h.Role('presentation'),
      h.AriaHidden(true),
      h.Class(cn(breadcrumbEllipsisClass, config.className)),
      h.DataAttribute('slot', 'breadcrumb-ellipsis'),
    ],
    children.length === 0 ? [icon(h, MoreHorizontal)] : children,
  )

const breadcrumbSeparator = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child> = [],
  h: HtmlBuilder<M>,
): Html =>
  h.li(
    [
      h.Role('presentation'),
      h.AriaHidden(true),
      h.Class(cn(breadcrumbSeparatorClass, config.className)),
      h.DataAttribute('slot', 'breadcrumb-separator'),
    ],
    children.length === 0 ? [icon(h, ChevronRight)] : children,
  )

/** Composable breadcrumb — `Breadcrumb` is the container, with sub-builders
 *  as properties: `Breadcrumb.list`, `Breadcrumb.item`, `Breadcrumb.link`,
 *  `Breadcrumb.page`, `Breadcrumb.separator`. */
export const Breadcrumb = Object.assign(breadcrumbContainer, {
  list: breadcrumbList,
  item: breadcrumbItem,
  link: breadcrumbLink,
  page: breadcrumbPage,
  separator: breadcrumbSeparator,
  ellipsis: breadcrumbEllipsis,
})
