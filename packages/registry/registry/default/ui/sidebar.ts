import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

type Child = Html | string

// Sidebar is a pure presentational layout primitive (no headless provider).
// `SidebarProvider` establishes the flex shell; `Sidebar` is the aside rail,
// and `SidebarInset` is the scrolling content column. Sub-builders are attached
// as properties on each piece.
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/sidebar.tsx. Class strings are identical to
// upstream; visual styling lives in the central foldcn style definition.
//
// foldcn gaps vs upstream: static rail only — no collapsible/icon mode, no
// drag-resize, no off-canvas sheet, no variant=inset choreography (the
// cn-sidebar-inset margins key off peer collapse state that foldcn does not
// model), and no rail hot-spot. The aside keeps a hand-written string because
// upstream's visible-panel classes live inside its collapse-state container.

export const sidebarProviderClass =
  'flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar'

export const sidebarClass =
  'flex h-svh w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground [--sidebar-width:16rem]'

/** Upstream SidebarHeader string. */
export const sidebarHeaderClass = 'cn-sidebar-header flex flex-col gap-2 p-2'

/** Upstream SidebarContent string (collapsible selector kept inert). */
export const sidebarContentClass =
  'cn-sidebar-content flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden'

/** Upstream SidebarFooter string. */
export const sidebarFooterClass = 'cn-sidebar-footer flex flex-col gap-2 p-2'

/** Upstream SidebarGroup string. */
export const sidebarGroupClass = 'cn-sidebar-group relative flex w-full min-w-0 flex-col'

/** Upstream SidebarGroupLabel string (sizing/color from the token). */
export const sidebarGroupLabelClass =
  'cn-sidebar-group-label flex shrink-0 items-center outline-hidden [&>svg]:shrink-0'

/** Upstream SidebarMenu string. */
export const sidebarMenuClass = 'cn-sidebar-menu flex w-full min-w-0 flex-col'

export const sidebarMenuItemClass = 'group/menu-item relative'

/** Upstream SidebarMenuButton cva base + variant=default + size=default. */
export const sidebarMenuButtonClass =
  'cn-sidebar-menu-button cn-sidebar-menu-button-variant-default cn-sidebar-menu-button-size-default peer/menu-button group/menu-button flex w-full items-center overflow-hidden outline-hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate'

/** Upstream SidebarInset string (bg + inset margins from the token). */
export const sidebarInsetClass = 'cn-sidebar-inset relative flex w-full flex-1 flex-col'

/** Token color + foldcn's raw-div separator mechanics (upstream delegates to
 *  its Separator primitive). */
export const sidebarSeparatorClass = 'cn-sidebar-separator -mx-2 my-2 h-px w-auto'

/** Upstream SidebarTrigger: ghost icon Button + trigger token. */
export const sidebarTriggerClass =
  'cn-button cn-button-variant-ghost cn-button-size-icon cn-sidebar-trigger size-7 text-sidebar-foreground'

type StyleConfig = Readonly<{ className?: string }>

const sidebarProvider = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(sidebarProviderClass, config.className)), h.DataAttribute('slot', 'sidebar-provider')], children)

const sidebar = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.aside([h.Class(cn(sidebarClass, config.className)), h.DataAttribute('slot', 'sidebar')], children)

const sidebarHeader = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(sidebarHeaderClass)), h.DataAttribute('slot', 'sidebar-header')], children)

const sidebarContent = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(sidebarContentClass)), h.DataAttribute('slot', 'sidebar-content')], children)

const sidebarFooter = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(sidebarFooterClass)), h.DataAttribute('slot', 'sidebar-footer')], children)

const sidebarGroup = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(sidebarGroupClass)), h.DataAttribute('slot', 'sidebar-group')], children)

const sidebarGroupLabel = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(sidebarGroupLabelClass, config.className)), h.DataAttribute('slot', 'sidebar-group-label')], children)

const sidebarMenu = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.ul([h.Class(cn(sidebarMenuClass)), h.DataAttribute('slot', 'sidebar-menu')], children)

const sidebarMenuItem = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.li([h.Class(cn(sidebarMenuItemClass)), h.DataAttribute('slot', 'sidebar-menu-item')], children)

const sidebarMenuButton = <M>(
  config: StyleConfig & Readonly<{ isActive?: boolean }>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.button(
    [
      h.Type('button'),
      h.Class(cn(sidebarMenuButtonClass, config.className)),
      h.DataAttribute('slot', 'sidebar-menu-button'),
      ...(config.isActive === true ? [h.DataAttribute('active', 'true')] : []),
    ],
    children,
  )

const sidebarInset = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(sidebarInsetClass, config.className)), h.DataAttribute('slot', 'sidebar-inset')], children)

const sidebarSeparator = <M>(config: StyleConfig, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(sidebarSeparatorClass, config.className)), h.DataAttribute('slot', 'sidebar-separator')], [])

const sidebarTrigger = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.button(
    [h.Type('button'), h.Class(cn(sidebarTriggerClass, config.className)), h.DataAttribute('slot', 'sidebar-trigger')],
    children,
  )

/** Composable sidebar layout. */
export const Sidebar = Object.assign(sidebar, {
  header: sidebarHeader,
  content: sidebarContent,
  footer: sidebarFooter,
  group: sidebarGroup,
  groupLabel: sidebarGroupLabel,
  menu: sidebarMenu,
  menuItem: sidebarMenuItem,
  menuButton: sidebarMenuButton,
  separator: sidebarSeparator,
  trigger: sidebarTrigger,
})

export const SidebarProvider = Object.assign(sidebarProvider)
export const SidebarInset = Object.assign(sidebarInset)
