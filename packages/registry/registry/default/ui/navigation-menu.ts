import { Popover as FoldkitPopover } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/popover'
import { Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Update from 'foldkit/update'
import { ChevronDown } from 'lucide'
import { icon } from '@/lib/icons'

type Child = Html | string

import { cn } from '@/lib/utils'
import { placementToSide } from './popover'

// NavigationMenu is a top-level nav bar. `NavigationMenu` is the container
// (`nav`); sub-builders are attached as properties: `.list`, `.item`,
// `.link` (fully presentational, for static links) and `dropdownViewInputs`
// (stateful — see below).
//
// `dropdownViewInputs` builds the `ViewInputs` for one @foldkit/ui Popover
// submodel per item, keyed by id; the consumer wires it up with `h.submodel`
// themselves, the same way `Menubar.viewInputs`/`HoverCard.styledViewInputs`
// do — this keeps `h.submodel`, `model`, and `toParentMessage` visible at the
// call site instead of hidden behind a bespoke `(config, children, model,
// toParentMessage, h)` signature. Popover already supplies click-toggle,
// outside-click/Escape dismissal, and focus management — the nav menu
// doesn't reimplement any of that; `update` only adds "opening one item's
// dropdown closes any other open one," since a nav bar shows at most one
// dropdown at a time.
//
// foldcn gaps vs upstream: no shared/animated Viewport (Radix's single
// morphing panel with a slide-direction indicator) — each dropdown is its
// own independently-anchored Popover panel instead. cn-navigation-menu-item
// is an intentional no-op hook upstream.

export const Model = S.Struct({
  popovers: S.Record(S.String, FoldkitPopover.Model),
})
export type Model = typeof Model.Type

/** Creates an initial nav-menu model with one closed Popover per given item id. */
export const init = (itemIds: ReadonlyArray<string>): Model => ({
  popovers: Object.fromEntries(
    itemIds.map((id) => [id, FoldkitPopover.init({ id, isAnimated: true })]),
  ),
})

export const Message = defineMessageUnion({
  GotItemMessage: { id: S.String, message: FoldkitPopover.Message },
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  Opened: { id: S.String },
  Closed: { id: S.String },
})
export type OutMessage = typeof OutMessage.Type

/** Re-export of the underlying Popover submodel's `view`, for `h.submodel`
 *  calls built from `dropdownViewInputs`. */
export const view = FoldkitPopover.view

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

/** Looks up the Popover model for `id`, throwing a message that names the
 *  bad id and the ids that were actually passed to `init` — the mismatch is
 *  otherwise easy to miss until the dropdown silently never opens. */
export const getPopover = (model: Model, id: string): FoldkitPopover.Model => {
  const popover = model.popovers[id]
  if (popover === undefined) {
    const knownIds = Object.keys(model.popovers)
    throw new Error(
      `NavigationMenu: unknown item id "${id}" — add it to the array passed to NavigationMenu.init. Known ids: ${knownIds.length > 0 ? knownIds.join(', ') : '(none — init was called with an empty array)'}.`,
    )
  }
  return popover
}

const toItemMessage =
  (id: string) =>
  (message: FoldkitPopover.Message): Message =>
    Message.GotItemMessage({ id, message })

/** Processes a nav-menu message. Opening one item's popover force-closes any
 *  other currently-open item, so at most one dropdown shows at a time.
 *  That auto-close is silent: only the newly opened id's `OutMessage.Opened`
 *  is emitted, the siblings are closed purely via commands with no matching
 *  `Closed` out message, so don't expect one for the item that got bumped. */
export const update = (model: Model, message: Message): UpdateReturn => {
  const { id, message: popoverMessage } = message
  const current = model.popovers[id]
  if (current === undefined) {
    return { model }
  }

  const {
    model: nextPopover,
    commands: popoverCommands = [],
    outMessage,
  } = FoldkitPopover.update(current, popoverMessage)
  const justOpened = outMessage?._tag === 'Opened'

  if (!justOpened) {
    return {
      model: { popovers: { ...model.popovers, [id]: nextPopover } },
      commands: Command.mapMessages(popoverCommands, toItemMessage(id)),
      ...(outMessage === undefined ? {} : { outMessage: OutMessage.Closed({ id }) }),
    }
  }

  const closedOthers = Object.entries(model.popovers).flatMap(([key, popover]) =>
    key === id || !popover.isOpen ? [] : [[key, FoldkitPopover.close(popover)] as const],
  )

  return {
    model: {
      popovers: {
        ...model.popovers,
        [id]: nextPopover,
        ...Object.fromEntries(
          closedOthers.map(([key, { model: closedPopover }]) => [key, closedPopover]),
        ),
      },
    },
    commands: [
      ...Command.mapMessages(popoverCommands, toItemMessage(id)),
      ...closedOthers.flatMap(([key, { commands: closeCommands = [] }]) =>
        Command.mapMessages(closeCommands, toItemMessage(key)),
      ),
    ],
    outMessage: OutMessage.Opened({ id }),
  }
}

export const navigationMenuClass =
  'cn-navigation-menu group/navigation-menu relative flex max-w-max flex-1 items-center justify-center'

export const navigationMenuListClass =
  'cn-navigation-menu-list group flex flex-1 list-none items-center justify-center'

export const navigationMenuItemClass = 'cn-navigation-menu-item relative'

/** Upstream link token string; data-active is foldkit's attr name. */
export const navigationMenuLinkClass = 'cn-navigation-menu-link'

/** Upstream trigger component + token strings. */
export const navigationMenuTriggerClass =
  'cn-navigation-menu-trigger group/navigation-menu-trigger group inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none'

export const navigationMenuTriggerIconClass = 'cn-navigation-menu-trigger-icon'

export const navigationMenuContentClass =
  'cn-navigation-menu-content data-ending-style:data-activation-direction=left:translate-x-[50%] data-ending-style:data-activation-direction=right:translate-x-[-50%] data-starting-style:data-activation-direction=left:translate-x-[-50%] data-starting-style:data-activation-direction=right:translate-x-[50%] transition-[opacity,transform,translate] duration-[0.35s] data-ending-style:opacity-0 data-starting-style:opacity-0 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none z-50 bg-popover text-popover-foreground shadow ring-1 ring-foreground/10 rounded-lg'

export const navigationMenuViewportClass = 'cn-navigation-menu-viewport'

export const navigationMenuPositionerClass = 'cn-navigation-menu-positioner'

export const navigationMenuPopupClass = 'cn-navigation-menu-popup'

export const navigationMenuIndicatorClass = 'cn-navigation-menu-indicator'

export const navigationMenuIndicatorArrowClass = 'cn-navigation-menu-indicator-arrow'

export const navigationMenuTriggerStyle = () => navigationMenuTriggerClass

export const NAVIGATION_MENU_ANCHOR: AnchorConfig = {
  placement: 'bottom-start',
  gap: 8,
  padding: 8,
}

type StyleConfig = Readonly<{ className?: string }>

const navigationMenuContainer = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.nav(
    [
      h.Class(cn(navigationMenuClass, config.className)),
      h.DataAttribute('slot', 'navigation-menu'),
      h.DataAttribute('viewport', 'false'),
    ],
    children,
  )

const navigationMenuList = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.ul(
    [h.Class(cn(navigationMenuListClass)), h.DataAttribute('slot', 'navigation-menu-list')],
    children,
  )

const navigationMenuItem = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.li(
    [h.Class(cn(navigationMenuItemClass)), h.DataAttribute('slot', 'navigation-menu-item')],
    children,
  )

type LinkConfig = Readonly<{ className?: string; href?: string }>

const navigationMenuLink = <M>(
  config: LinkConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.a(
    [
      h.Class(cn(navigationMenuLinkClass, config.className)),
      h.DataAttribute('slot', 'navigation-menu-link'),
      ...(config.href !== undefined ? [h.Attribute('href', config.href)] : []),
    ],
    children,
  )

export type DropdownConfig = Readonly<{
  id: string
  trigger: Child
  anchor?: AnchorConfig
  triggerClass?: string
  contentClass?: string
  isDisabled?: boolean
}>

/** Builds a Popover `ViewInputs` for one nav-item's trigger + dropdown
 *  panel. The consumer owns `h.submodel` (model: `NavigationMenu.getPopover(model, config.id)`,
 *  view: `FoldkitPopover.view`) and the surrounding `<li>` — wrap the
 *  `h.submodel` call in `NavigationMenu.item` yourself, the same way
 *  `Menubar.viewInputs`/`HoverCard.styledViewInputs` leave their wrapping
 *  markup to the caller instead of hiding it behind a bespoke signature. */
const navigationMenuViewport = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(navigationMenuViewportClass, config.className)),
      h.DataAttribute('slot', 'navigation-menu-viewport'),
    ],
    children,
  )

const navigationMenuIndicator = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(navigationMenuIndicatorClass, config.className)),
      h.DataAttribute('slot', 'navigation-menu-indicator'),
    ],
    children.length > 0 ? children : [h.div([h.Class(navigationMenuIndicatorArrowClass)])],
  )

export const dropdownViewInputs = <M>(
  config: DropdownConfig,
  content: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): FoldkitPopover.ViewInputs => {
  const anchor = config.anchor ?? NAVIGATION_MENU_ANCHOR
  return {
    anchor,
    ...(config.isDisabled !== undefined && { isDisabled: config.isDisabled }),
    toView: ({ button, panel, isVisible }) =>
      h.div(
        [h.Class('contents')],
        [
          h.button(
            [
              ...button,
              h.Class(cn(navigationMenuTriggerClass, config.triggerClass)),
              h.DataAttribute('slot', 'navigation-menu-trigger'),
            ],
            [config.trigger, icon(h, ChevronDown, navigationMenuTriggerIconClass)],
          ),
          ...(isVisible
            ? [
                h.div(
                  [
                    ...panel,
                    h.Class(cn(navigationMenuContentClass, config.contentClass)),
                    h.DataAttribute('slot', 'navigation-menu-content'),
                    h.DataAttribute('side', placementToSide(anchor.placement ?? 'bottom')),
                  ],
                  content,
                ),
              ]
            : []),
        ],
      ),
  }
}

/** Composable navigation menu — `NavigationMenu` is the container, with
 *  sub-builders as properties: `NavigationMenu.list`, `NavigationMenu.item`,
 *  `NavigationMenu.link` (presentational), `NavigationMenu.viewport`,
 *  `NavigationMenu.indicator`. Build a stateful dropdown item
 *  with `dropdownViewInputs` + `h.submodel` + `NavigationMenu.item`. */
export const NavigationMenu = Object.assign(navigationMenuContainer, {
  list: navigationMenuList,
  item: navigationMenuItem,
  link: navigationMenuLink,
  viewport: navigationMenuViewport,
  indicator: navigationMenuIndicator,
})
