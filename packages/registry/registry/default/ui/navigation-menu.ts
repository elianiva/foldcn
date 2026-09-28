import { HoverIntent, Popover as FoldkitPopover } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/popover'
import { Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { childAttributes, type ChildAttribute, type Html, type HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { modifyFields } from 'foldkit/struct'
import { defineView } from 'foldkit/submodel'
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
// `dropdownViewInputs` builds the `ViewInputs` for one hover-aware Popover
// submodel per item, keyed by id; the consumer wires it up with `h.submodel`
// themselves. HoverIntent owns delayed pointer/focus engagement; Popover owns
// anchoring, dismissal, and focus management. `update` adds "opening one
// item's dropdown closes any other open one," since a nav bar shows at most
// one dropdown at a time.
//
// foldcn gaps vs upstream: no shared/animated Viewport (Base UI's single
// morphing panel with a slide-direction indicator) — each dropdown is its own
// independently-anchored Popover panel instead. cn-navigation-menu-item is an
// intentional no-op hook upstream.

export const ItemModel = S.Struct({
  hoverIntent: HoverIntent.Model,
  popover: FoldkitPopover.Model,
})
export type ItemModel = typeof ItemModel.Type

export const Model = S.Struct({
  items: S.Record(S.String, ItemModel),
})
export type Model = typeof Model.Type

/** Creates an initial nav-menu model with one closed hover-aware item per id. */
export const init = (itemIds: ReadonlyArray<string>): Model => ({
  items: Object.fromEntries(
    itemIds.map((id) => [
      id,
      {
        hoverIntent: HoverIntent.init({ closeDelay: 200 }),
        popover: FoldkitPopover.init({ id, isAnimated: true, contentFocus: true }),
      },
    ]),
  ),
})

export const ItemMessage = defineMessageUnion({
  GotHoverIntentMessage: { message: HoverIntent.Message },
  GotPopoverMessage: { message: FoldkitPopover.Message },
})
export type ItemMessage = typeof ItemMessage.Type

export const Message = defineMessageUnion({
  GotItemMessage: { id: S.String, message: ItemMessage },
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  Opened: { id: S.String },
  Closed: { id: S.String },
})
export type OutMessage = typeof OutMessage.Type

const ItemOutMessage = defineMessageUnion({
  Opened: {},
  Closed: {},
})
type ItemOutMessage = typeof ItemOutMessage.Type

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>
type ItemUpdateReturn = Update.ReturnWithOutMessage<ItemModel, ItemMessage, ItemOutMessage>

/** Looks up one item's hover and popover state. */
export const getItem = (model: Model, id: string): ItemModel => {
  const item = model.items[id]
  if (item === undefined) {
    const knownIds = Object.keys(model.items)
    throw new Error(
      `NavigationMenu: unknown item id "${id}" — add it to the array passed to NavigationMenu.init. Known ids: ${knownIds.length > 0 ? knownIds.join(', ') : '(none — init was called with an empty array)'}.`,
    )
  }
  return item
}

const toItemMessage =
  (id: string) =>
  (message: ItemMessage): Message =>
    Message.GotItemMessage({ id, message })

const withoutPopoverInteractions = (
  attributes: ReadonlyArray<ChildAttribute>,
): ReadonlyArray<ChildAttribute> =>
  attributes.filter((wrapped) => {
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: foldkit attribute._tag
    const tag = (wrapped.attribute as { readonly _tag?: string } | undefined)?._tag
    return ![
      'OnPointerDown',
      'OnClick',
      'OnKeyDownPreventDefault',
      'OnKeyUpPreventDefault',
    ].includes(tag ?? '')
  })

const mapPopoverCommands = (
  commands: NonNullable<ReturnType<typeof FoldkitPopover.open>['commands']> = [],
) =>
  Command.mapMessages(
    commands.filter((command) => command.name !== 'FocusButton'),
    (message) => ItemMessage.GotPopoverMessage({ message }),
  )

const syncPopover = (
  model: ItemModel,
  operation: typeof FoldkitPopover.open | typeof FoldkitPopover.close,
  outMessage: ItemOutMessage,
): ItemUpdateReturn => {
  const result = operation(model.popover)
  return {
    model: { ...model, popover: result.model },
    commands: mapPopoverCommands(result.commands),
    outMessage,
  }
}

const releaseTriggerFocus = (hoverIntent: HoverIntent.Model): HoverIntent.Model =>
  modifyFields(hoverIntent, {
    maybeFocusLocation: () =>
      Option.filter(hoverIntent.maybeFocusLocation, (location) => location !== 'Trigger'),
  })

const updateItem = (model: ItemModel, message: ItemMessage): ItemUpdateReturn => {
  if (message._tag === 'GotHoverIntentMessage') {
    if (message.message._tag === 'FocusedPanel' || message.message._tag === 'BlurredPanel') {
      return { model }
    }

    const result = HoverIntent.update(
      message.message._tag === 'LeftTrigger'
        ? releaseTriggerFocus(model.hoverIntent)
        : model.hoverIntent,
      message.message,
    )
    const nextModel = { ...model, hoverIntent: result.model }

    if (result.outMessage?._tag === 'Opened') {
      return syncPopover(nextModel, FoldkitPopover.open, ItemOutMessage.Opened())
    }
    if (result.outMessage?._tag === 'Closed') {
      return syncPopover(nextModel, FoldkitPopover.close, ItemOutMessage.Closed())
    }
    return {
      model: nextModel,
      commands: Command.mapMessages(result.commands ?? [], (message) =>
        ItemMessage.GotHoverIntentMessage({ message }),
      ),
    }
  }

  const result = FoldkitPopover.update(model.popover, message.message)
  const hoverIntent =
    message.message._tag === 'RequestedClose'
      ? HoverIntent.close(model.hoverIntent)
      : { model: model.hoverIntent }
  const base = {
    model: { hoverIntent: hoverIntent.model, popover: result.model },
    commands: mapPopoverCommands(result.commands),
  }
  if (hoverIntent.outMessage === undefined) return base
  return { ...base, outMessage: hoverIntent.outMessage }
}

const closeItem = (item: ItemModel): ItemUpdateReturn =>
  updateItem(
    item,
    ItemMessage.GotPopoverMessage({ message: FoldkitPopover.Message.RequestedClose() }),
  )

/** Processes a nav-menu message. Opening one item's popover force-closes any
 *  other currently-open item, so at most one dropdown shows at a time.
 *  That auto-close is silent: only the newly opened id's `OutMessage.Opened`
 *  is emitted, the siblings are closed purely via commands with no matching
 *  `Closed` out message, so don't expect one for the item that got bumped. */
export const update = (model: Model, message: Message): UpdateReturn => {
  const { id, message: itemMessage } = message
  const current = model.items[id]
  if (current === undefined) return { model }

  const {
    model: nextItem,
    commands: itemCommands = [],
    outMessage,
  } = updateItem(current, itemMessage)
  const justOpened = outMessage?._tag === 'Opened'

  if (!justOpened) {
    const base = {
      model: { items: { ...model.items, [id]: nextItem } },
      commands: Command.mapMessages(itemCommands, toItemMessage(id)),
    }
    if (outMessage === undefined) return base
    return { ...base, outMessage: OutMessage.Closed({ id }) }
  }

  const closedOthers = Object.entries(model.items).flatMap(([key, item]) =>
    key === id || !item.popover.isOpen ? [] : [[key, closeItem(item)] as const],
  )

  return {
    model: {
      items: {
        ...model.items,
        [id]: nextItem,
        ...Object.fromEntries(closedOthers.map(([key, result]) => [key, result.model])),
      },
    },
    commands: [
      ...Command.mapMessages(itemCommands, toItemMessage(id)),
      ...closedOthers.flatMap(([key, { commands = [] }]) =>
        Command.mapMessages(commands, toItemMessage(key)),
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

/** Builds hover-aware `ViewInputs` for one nav item. The consumer owns
 * `h.submodel` (model: `NavigationMenu.getItem(model, config.id)`, view:
 * `NavigationMenu.view`) and the surrounding `<li>`. */
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

export type ViewInputs = Readonly<{
  anchor: AnchorConfig
  toView: (render: RenderInfo) => Html
  isDisabled?: boolean
}>

export type RenderInfo = Readonly<{
  trigger: ReadonlyArray<ChildAttribute>
  panel: ReadonlyArray<ChildAttribute>
  isVisible: boolean
}>

/** HoverIntent owns interaction; Popover remains only for positioning. */
export const view = defineView<ItemModel, ItemMessage, ViewInputs>((model, viewInputs, h) =>
  h.submodel({
    slotId: `${model.popover.id}-hover-intent`,
    model: model.hoverIntent,
    view: HoverIntent.view,
    viewInputs: {
      focusTriggerSelector: `#${FoldkitPopover.buttonId(model.popover.id)}`,
      toView: ({ trigger, panel }) =>
        h.submodel({
          slotId: `${model.popover.id}-popover`,
          model: model.popover,
          view: FoldkitPopover.view,
          viewInputs: {
            anchor: viewInputs.anchor,
            isDisabled: viewInputs.isDisabled,
            toView: ({ button, panel: popoverPanel, isVisible }) =>
              viewInputs.toView({
                trigger: [
                  ...withoutPopoverInteractions(button),
                  ...(viewInputs.isDisabled ? [] : trigger),
                  ...childAttributes([h.DataAttribute('slot', 'navigation-menu-trigger')]),
                ],
                panel: [
                  ...withoutPopoverInteractions(popoverPanel),
                  ...(viewInputs.isDisabled ? [] : panel),
                  ...childAttributes([h.DataAttribute('slot', 'navigation-menu-content')]),
                ],
                isVisible,
              }),
          },
          toParentMessage: (message) => ItemMessage.GotPopoverMessage({ message }),
        }),
    },
    toParentMessage: (message) => ItemMessage.GotHoverIntentMessage({ message }),
  }),
)

export const dropdownViewInputs = <M>(
  config: DropdownConfig,
  content: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): ViewInputs => {
  const anchor = config.anchor ?? NAVIGATION_MENU_ANCHOR
  return {
    anchor,
    ...(config.isDisabled !== undefined && { isDisabled: config.isDisabled }),
    toView: ({ trigger, panel, isVisible }) =>
      h.div(
        [h.Class('contents')],
        [
          h.button(
            [h.Class(cn(navigationMenuTriggerClass, config.triggerClass)), ...trigger],
            [config.trigger, icon(h, ChevronDown, navigationMenuTriggerIconClass)],
          ),
          ...(isVisible
            ? [
                h.div(
                  [
                    h.Class(cn(navigationMenuContentClass, config.contentClass)),
                    h.DataAttribute('side', placementToSide(anchor.placement ?? 'bottom')),
                    ...panel,
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
