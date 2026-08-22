import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

type Child = Html | string

// NavigationMenu is a pure presentational top-level nav (a styled horizontal
// bar). `NavigationMenu` is the container (`nav`); sub-builders are attached
// as properties: NavigationMenu.list, NavigationMenu.item,
// NavigationMenu.link, NavigationMenu.trigger, NavigationMenu.content.
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/navigation-menu.tsx. Class strings are
// identical to upstream; visual styling lives in the central foldcn style definition.
//
// foldcn gaps vs upstream: no Positioner/Viewport/Indicator popup management
// (content is a per-item absolute dropdown driven by consumer state), and
// cn-navigation-menu-item is an intentional no-op hook upstream.

export const navigationMenuClass =
  'cn-navigation-menu group/navigation-menu relative flex max-w-max flex-1 items-center justify-center'

export const navigationMenuListClass = 'cn-navigation-menu-list flex flex-1 list-none items-center justify-center'

export const navigationMenuItemClass = 'cn-navigation-menu-item relative'

/** Upstream link token string; data-active is foldkit's attr name. */
export const navigationMenuLinkClass = 'cn-navigation-menu-link'

/** Upstream trigger component + token strings. */
export const navigationMenuTriggerClass =
  'cn-navigation-menu-trigger group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none'

export const navigationMenuContentClass = 'cn-navigation-menu-content absolute top-full left-0'

export const navigationMenuViewportClass = 'cn-navigation-menu-positioner isolate z-50'

type StyleConfig = Readonly<{ className?: string }>

const navigationMenuContainer = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.nav(
    [h.Class(cn(navigationMenuClass, config.className)), h.DataAttribute('slot', 'navigation-menu')],
    children,
  )

const navigationMenuList = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.ul([h.Class(cn(navigationMenuListClass)), h.DataAttribute('slot', 'navigation-menu-list')], children)

const navigationMenuItem = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.li([h.Class(cn(navigationMenuItemClass)), h.DataAttribute('slot', 'navigation-menu-item')], children)

const navigationMenuLink = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.a([h.Class(cn(navigationMenuLinkClass, config.className)), h.DataAttribute('slot', 'navigation-menu-link')], children)

const navigationMenuTrigger = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.button(
    [h.Type('button'), h.Class(cn(navigationMenuTriggerClass, config.className)), h.DataAttribute('slot', 'navigation-menu-trigger')],
    children,
  )

const navigationMenuContent = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.Class(cn(navigationMenuContentClass, config.className)), h.DataAttribute('slot', 'navigation-menu-content')], children)

/** Composable navigation menu — `NavigationMenu` is the container, with
 *  sub-builders as properties: `NavigationMenu.list`, `NavigationMenu.item`,
 *  `NavigationMenu.link`, `NavigationMenu.trigger`, `NavigationMenu.content`. */
export const NavigationMenu = Object.assign(navigationMenuContainer, {
  list: navigationMenuList,
  item: navigationMenuItem,
  link: navigationMenuLink,
  trigger: navigationMenuTrigger,
  content: navigationMenuContent,
})
