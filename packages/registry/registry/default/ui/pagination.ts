// Pagination is a pure presentational landmark (a `nav`), mirroring the
// upstream base registry: `Pagination` is the container and sub-builders are
// attached as properties: Pagination.content, Pagination.item, Pagination.link,
// Pagination.previous, Pagination.next, Pagination.ellipsis.
//
// PaginationLink reproduces upstream's anchor-styled-as-button pattern
// (Button with `render={<a>}` / `nativeButton={false}`): it emits the button
// token classes on an `a` element directly, with `aria-current="page"` and
// `data-active` marking the active page.

import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'
import { icon } from '@/lib/icons'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide'

import { buttonSizes, buttonVariants, type ButtonSize } from './button'

type Child = Html | string

export const paginationClass = 'cn-pagination mx-auto flex w-full justify-center'

export const paginationContentClass = 'cn-pagination-content flex items-center'

export const paginationLinkClass = 'cn-pagination-link'

export const paginationPreviousClass = 'cn-pagination-previous'

export const paginationNextClass = 'cn-pagination-next'

export const paginationEllipsisClass = 'cn-pagination-ellipsis flex items-center justify-center'

type StyleConfig = Readonly<{ className?: string }>

export type PaginationLinkConfig<M> = Readonly<{
  className?: string
  /** Marks the link as the current page: outline variant, `aria-current="page"`
   *  and `data-active="true"`. */
  isActive?: boolean
  /** Button size tokens; defaults to `icon` like upstream. */
  size?: ButtonSize
  href?: string
  /** Extra attributes merged onto the anchor (ids, click handlers, …). */
  attributes?: ReadonlyArray<Attribute<M>>
}>

const paginationContainer = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.nav(
    [
      h.Role('navigation'),
      h.AriaLabel('pagination'),
      h.Class(cn(paginationClass, config.className)),
      h.DataAttribute('slot', 'pagination'),
    ],
    children,
  )

const paginationContent = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.ul(
    [
      h.Class(cn(paginationContentClass, config.className)),
      h.DataAttribute('slot', 'pagination-content'),
    ],
    children,
  )

const paginationItem = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => h.li([h.DataAttribute('slot', 'pagination-item')], children)

const paginationLink = <M>(
  config: PaginationLinkConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => {
  const variant = config.isActive === true ? 'outline' : 'ghost'
  return h.a(
    [
      ...(config.isActive === true ? [h.AriaCurrent('page')] : []),
      h.Href(config.href ?? '#'),
      h.DataAttribute('slot', 'pagination-link'),
      h.DataAttribute('active', config.isActive === true ? 'true' : 'false'),
      h.Class(
        cn(
          'cn-button',
          buttonVariants[variant],
          buttonSizes[config.size ?? 'icon'],
          paginationLinkClass,
          config.className,
        ),
      ),
      ...(config.attributes ?? []),
    ],
    children,
  )
}

const paginationPrevious = <M>(
  config: PaginationLinkConfig<M> & Readonly<{ text?: string }>,
  children: ReadonlyArray<Child> = [],
  h: HtmlBuilder<M>,
): Html =>
  h.a(
    [
      h.AriaLabel('Go to previous page'),
      h.Href(config.href ?? '#'),
      h.DataAttribute('slot', 'pagination-link'),
      h.DataAttribute('active', config.isActive === true ? 'true' : 'false'),
      h.Class(
        cn(
          'cn-button',
          buttonVariants[config.isActive === true ? 'outline' : 'ghost'],
          buttonSizes[config.size ?? 'default'],
          paginationPreviousClass,
          config.className,
        ),
      ),
      ...(config.attributes ?? []),
    ],
    children.length > 0
      ? children
      : [
          icon(h, ChevronLeft, 'cn-rtl-flip', 'inline-start'),
          h.span(
            [h.Class('cn-pagination-previous-text hidden sm:block')],
            [config.text ?? 'Previous'],
          ),
        ],
  )

const paginationNext = <M>(
  config: PaginationLinkConfig<M> & Readonly<{ text?: string }>,
  children: ReadonlyArray<Child> = [],
  h: HtmlBuilder<M>,
): Html =>
  h.a(
    [
      h.AriaLabel('Go to next page'),
      h.Href(config.href ?? '#'),
      h.DataAttribute('slot', 'pagination-link'),
      h.DataAttribute('active', config.isActive === true ? 'true' : 'false'),
      h.Class(
        cn(
          'cn-button',
          buttonVariants[config.isActive === true ? 'outline' : 'ghost'],
          buttonSizes[config.size ?? 'default'],
          paginationNextClass,
          config.className,
        ),
      ),
      ...(config.attributes ?? []),
    ],
    children.length > 0
      ? children
      : [
          h.span([h.Class('cn-pagination-next-text hidden sm:block')], [config.text ?? 'Next']),
          icon(h, ChevronRight, 'cn-rtl-flip', 'inline-end'),
        ],
  )

/** Ellipsis — collapsed middle pages. */
const paginationEllipsis = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child> = [],
  h: HtmlBuilder<M>,
): Html =>
  h.span(
    [
      h.AriaHidden(true),
      h.Class(cn(paginationEllipsisClass, config.className)),
      h.DataAttribute('slot', 'pagination-ellipsis'),
    ],
    children.length > 0
      ? children
      : [icon(h, MoreHorizontal), h.span([h.Class('sr-only')], ['More pages'])],
  )

/** Composable pagination — `Pagination` is the container, with sub-builders
 *  as properties: `Pagination.content`, `Pagination.item`, `Pagination.link`,
 *  `Pagination.previous`, `Pagination.next`, `Pagination.ellipsis`. */
export const Pagination = Object.assign(paginationContainer, {
  content: paginationContent,
  item: paginationItem,
  link: paginationLink,
  previous: paginationPrevious,
  next: paginationNext,
  ellipsis: paginationEllipsis,
})
