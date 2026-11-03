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
// `.link` (fully presentational, for static links) and `viewInputs`
// (stateful — see below).
//
// The bar is one submodel: a single HoverIntent (pointer/focus engagement,
// shared by every trigger so moving between triggers cancels the pending
// close), a single Popover (anchoring, open state, enter/leave animation) and
// the id of the active item. Hovering or focusing a trigger activates its id;
// the one shared panel stays mounted under the bar and swaps in the active
// item's content. `viewInputs` builds the `ViewInputs` for `view` from a list
// of dropdown and static items; the consumer wires it up with `h.submodel`.
//
// foldcn gaps vs upstream: no slide-direction indicator and no
// activation-direction slide/size morph between contents (the panel swaps
// content in place). cn-navigation-menu-item is an intentional no-op hook
// upstream.

export const Model = S.Struct({
  hoverIntent: HoverIntent.Model,
  popover: FoldkitPopover.Model,
  maybeActiveId: S.Option(S.String),
})
export type Model = typeof Model.Type

/** Creates an initial closed nav-menu model with no active item. `id` is the
 *  base DOM id of the shared panel. */
export const init = (id = 'navigation-menu'): Model => ({
  hoverIntent: HoverIntent.init({ closeDelay: 200 }),
  popover: FoldkitPopover.init({ id, isAnimated: true, contentFocus: true }),
  maybeActiveId: Option.none(),
})

export const Message = defineMessageUnion({
  GotHoverIntentMessage: { message: HoverIntent.Message },
  GotPopoverMessage: { message: FoldkitPopover.Message },
  EnteredTrigger: { id: S.String },
  FocusedTrigger: { id: S.String },
})
export type Message = typeof Message.Type

/** Emitted when the shared panel opens or closes; read `maybeActiveId` for the item. */
export const OutMessage = defineMessageUnion({
  Opened: {},
  Closed: {},
})
export type OutMessage = typeof OutMessage.Type

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const withoutAttributes = (
  attributes: ReadonlyArray<ChildAttribute>,
  tags: ReadonlyArray<string>,
): ReadonlyArray<ChildAttribute> =>
  attributes.filter((wrapped) => {
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: foldkit attribute._tag
    const tag = (wrapped.attribute as { readonly _tag?: string } | undefined)?._tag
    return !tags.includes(tag ?? '')
  })

const mapPopoverCommands = (
  commands: NonNullable<ReturnType<typeof FoldkitPopover.open>['commands']> = [],
) =>
  Command.mapMessages(
    commands.filter((command) => command.name !== 'FocusButton'),
    (message) => Message.GotPopoverMessage({ message }),
  )

const syncPopover = (
  model: Model,
  operation: typeof FoldkitPopover.open | typeof FoldkitPopover.close,
  outMessage: OutMessage,
): UpdateReturn => {
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

const updateHoverIntent = (model: Model, message: HoverIntent.Message): UpdateReturn => {
  const result = HoverIntent.update(
    message._tag === 'LeftTrigger' ? releaseTriggerFocus(model.hoverIntent) : model.hoverIntent,
    message,
  )
  const nextModel = { ...model, hoverIntent: result.model }

  if (result.outMessage?._tag === 'Opened') {
    return syncPopover(nextModel, FoldkitPopover.open, OutMessage.Opened())
  }
  if (result.outMessage?._tag === 'Closed') {
    return syncPopover(nextModel, FoldkitPopover.close, OutMessage.Closed())
  }
  return {
    model: nextModel,
    commands: Command.mapMessages(result.commands ?? [], (message) =>
      Message.GotHoverIntentMessage({ message }),
    ),
  }
}

/** Processes a nav-menu message. Entering or focusing any trigger activates
 *  that item and feeds the shared HoverIntent, so there is one open state for
 *  the whole bar and moving between triggers keeps the panel open. */
export const update = (model: Model, message: Message): UpdateReturn =>
  Message.match(message, {
    GotHoverIntentMessage: ({ message }) => updateHoverIntent(model, message),
    EnteredTrigger: ({ id }) =>
      updateHoverIntent(
        { ...model, maybeActiveId: Option.some(id) },
        HoverIntent.Message.EnteredTrigger(),
      ),
    FocusedTrigger: ({ id }) =>
      updateHoverIntent(
        { ...model, maybeActiveId: Option.some(id) },
        HoverIntent.Message.FocusedTrigger(),
      ),
    GotPopoverMessage: ({ message }) => {
      const result = FoldkitPopover.update(model.popover, message)
      const hoverIntent =
        message._tag === 'RequestedClose'
          ? HoverIntent.close(model.hoverIntent)
          : { model: model.hoverIntent }
      const base = {
        model: { ...model, hoverIntent: hoverIntent.model, popover: result.model },
        commands: mapPopoverCommands(result.commands),
      }
      if (hoverIntent.outMessage === undefined) return base
      return { ...base, outMessage: OutMessage.Closed() }
    },
  })

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

type ListConfig = Readonly<{ attributes?: ReadonlyArray<ChildAttribute> }>

const navigationMenuList = <M>(
  config: ListConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.ul(
    [
      h.Class(cn(navigationMenuListClass)),
      h.DataAttribute('slot', 'navigation-menu-list'),
      ...(config.attributes ?? []),
    ],
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

export type DropdownItem = Readonly<{
  id: string
  trigger: Child
  content: ReadonlyArray<Child>
  triggerClass?: string
  isDisabled?: boolean
}>

export type Item =
  | (DropdownItem & Readonly<{ _tag: 'Dropdown' }>)
  | Readonly<{ _tag: 'Static'; child: Child }>

/** A dropdown item: a trigger plus the content the shared panel shows while it is active. */
export const dropdown = (item: DropdownItem): Item => ({ _tag: 'Dropdown', ...item })

/** A static item, such as a plain link, rendered inside its own `<li>`. */
export const staticItem = (child: Child): Item => ({ _tag: 'Static', child })

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
  /** The dropdown triggers in the bar. Their attributes are built up front,
   *  inside the bar's own boundary, and handed to `toView` by id. */
  triggers: ReadonlyArray<Readonly<{ id: string; isDisabled?: boolean }>>
  toView: (render: RenderInfo) => Html
}>

export type RenderInfo = Readonly<{
  /** Attributes for the element the shared panel anchors to. */
  anchor: ReadonlyArray<ChildAttribute>
  /** Attributes for each trigger button, keyed by item id. */
  triggers: Readonly<Record<string, ReadonlyArray<ChildAttribute>>>
  /** Attributes for the single shared panel. */
  panel: ReadonlyArray<ChildAttribute>
  maybeActiveId: Option.Option<string>
  isVisible: boolean
}>

const triggerId = (model: Model, id: string) => `${model.popover.id}-trigger-${id}`

/** One HoverIntent and one Popover serve every trigger; the active id decides
 *  which item's content the shared panel shows. */
export const view = defineView<Model, Message, ViewInputs>((model, viewInputs, h) => {
  const panelId = `${model.popover.id}-panel`
  const focusPanel = (key: string, id: string) =>
    key === 'ArrowDown'
      ? Option.some({
          focusSelector: `#${panelId} :is(a[href], button, [tabindex]):not([tabindex="-1"])`,
          message: Message.GotHoverIntentMessage({ message: HoverIntent.Message.FocusedPanel() }),
        })
      : key === 'Escape'
        ? Option.some({
            focusSelector: `#${triggerId(model, id)}`,
            message: Message.GotHoverIntentMessage({
              message: HoverIntent.Message.PressedEscape({ source: 'Trigger' }),
            }),
          })
        : Option.none()

  return h.submodel({
    slotId: `${model.popover.id}-hover-intent`,
    model: model.hoverIntent,
    view: HoverIntent.view,
    viewInputs: {
      ...Option.match(model.maybeActiveId, {
        onNone: () => ({}),
        onSome: (id) => ({ focusTriggerSelector: `#${triggerId(model, id)}` }),
      }),
      toView: ({ trigger, panel }) =>
        h.submodel({
          slotId: `${model.popover.id}-popover`,
          model: model.popover,
          view: FoldkitPopover.view,
          viewInputs: {
            anchor: viewInputs.anchor,
            toView: ({ panel: popoverPanel, isVisible }) =>
              viewInputs.toView({
                anchor: childAttributes([h.Id(FoldkitPopover.buttonId(model.popover.id))]),
                triggers: Object.fromEntries(
                  viewInputs.triggers.map(({ id, isDisabled }) => {
                    const isActive = isVisible && Option.contains(model.maybeActiveId, id)
                    return [
                      id,
                      [
                        ...(isDisabled
                          ? []
                          : [
                              ...withoutAttributes(trigger, [
                                'OnMouseEnter',
                                'OnFocus',
                                'OnKeyDownPreventDefault',
                              ]),
                              ...childAttributes([
                                h.OnMouseEnter(Message.EnteredTrigger({ id })),
                                h.OnFocus(Message.FocusedTrigger({ id })),
                                h.OnKeyDownFocus((key) => focusPanel(key, id)),
                              ]),
                            ]),
                        ...childAttributes([
                          h.Id(triggerId(model, id)),
                          h.Type('button'),
                          h.AriaExpanded(isActive),
                          ...(isActive
                            ? [h.AriaControls(panelId), h.DataAttribute('open', '')]
                            : []),
                          ...(isDisabled
                            ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')]
                            : []),
                          h.DataAttribute('slot', 'navigation-menu-trigger'),
                        ]),
                      ],
                    ]
                  }),
                ),
                panel: [
                  ...withoutAttributes(popoverPanel, [
                    'OnPointerDown',
                    'OnClick',
                    'OnKeyDownPreventDefault',
                    'OnKeyUpPreventDefault',
                  ]),
                  ...panel,
                  ...childAttributes([h.DataAttribute('slot', 'navigation-menu-content')]),
                ],
                maybeActiveId: model.maybeActiveId,
                isVisible,
              }),
          },
          toParentMessage: (message) => Message.GotPopoverMessage({ message }),
        }),
    },
    toParentMessage: (message) => Message.GotHoverIntentMessage({ message }),
  })
})

type ViewConfig = Readonly<{
  items: ReadonlyArray<Item>
  anchor?: AnchorConfig
  className?: string
  contentClass?: string
}>

/** Builds `ViewInputs` for the whole bar. The consumer owns `h.submodel`
 *  (model: the `NavigationMenu.Model`, view: `NavigationMenu.view`). The
 *  shared panel renders once, after the list, and shows the active dropdown's
 *  content. */
export const viewInputs = <M>(config: ViewConfig, h: HtmlBuilder<M>): ViewInputs => {
  const anchor = config.anchor ?? NAVIGATION_MENU_ANCHOR
  return {
    anchor,
    triggers: config.items.flatMap((item) =>
      item._tag === 'Dropdown' ? [{ id: item.id, isDisabled: item.isDisabled }] : [],
    ),
    toView: ({ anchor: anchorAttributes, triggers, panel, maybeActiveId, isVisible }) => {
      const activeContent = config.items.flatMap((item) =>
        item._tag === 'Dropdown' && Option.contains(maybeActiveId, item.id) ? [item.content] : [],
      )[0]
      return navigationMenuContainer(
        { className: config.className },
        [
          navigationMenuList(
            { attributes: anchorAttributes },
            config.items.map((item) =>
              navigationMenuItem(
                {},
                item._tag === 'Static'
                  ? [item.child]
                  : [
                      h.button(
                        [
                          h.Class(cn(navigationMenuTriggerClass, item.triggerClass)),
                          ...(triggers[item.id] ?? []),
                        ],
                        [item.trigger, icon(h, ChevronDown, navigationMenuTriggerIconClass)],
                      ),
                    ],
                h,
              ),
            ),
            h,
          ),
          ...(isVisible && activeContent !== undefined
            ? [
                h.div(
                  [
                    h.Class(cn(navigationMenuContentClass, config.contentClass)),
                    h.DataAttribute('side', placementToSide(anchor.placement ?? 'bottom')),
                    ...panel,
                  ],
                  activeContent,
                ),
              ]
            : []),
        ],
        h,
      )
    },
  }
}

/** Composable navigation menu — `NavigationMenu` is the container, with
 *  sub-builders as properties: `NavigationMenu.list`, `NavigationMenu.item`,
 *  `NavigationMenu.link` (presentational), `NavigationMenu.viewport`,
 *  `NavigationMenu.indicator`. Build the stateful bar with
 *  `viewInputs` + `h.submodel`. */
export const NavigationMenu = Object.assign(navigationMenuContainer, {
  list: navigationMenuList,
  item: navigationMenuItem,
  link: navigationMenuLink,
  viewport: navigationMenuViewport,
  indicator: navigationMenuIndicator,
})
