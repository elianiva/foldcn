/** ⚠ BEHAVIOR GAP vs upstream shadcn: each trigger is an independent menu bundle — no ArrowLeft/Right traversal between menus and no open-on-hover-of-next-trigger.
 *  The styled surface matches, but this behavior is absent — do not use
 *  where that behavior is required.
 */
/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Menubar from '@/components/ui/menubar'`
 */
import { Menu as FoldkitMenu } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/menu'
import { childAttributes, inertHtml, type Html, type HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Menu surface. A menubar is a horizontal bar of
// menu triggers; each trigger is a Menu instance. This module provides the
// bar/trigger styling and a `viewInputs` helper for the per-trigger menus.

export const create = FoldkitMenu.create
export const init = (config: InitConfig): Model => FoldkitMenu.init({ isAnimated: true, ...config })
export const buttonId = FoldkitMenu.buttonId
export const Model = FoldkitMenu.Model
export type Model = typeof Model.Type
export const Message = FoldkitMenu.Message
export type Message = typeof Message.Type
export const OutMessage = FoldkitMenu.OutMessage
export type OutMessage = typeof OutMessage.Type

// foldcn gaps vs upstream: each trigger is an independent Menu bundle — no
// cross-menu arrow traversal or open-on-hover-of-next-trigger (needs a
// menubar behavior primitive). Menubar content/item/label/separator/shortcut
// now use correct cn-menubar-* family (was cn-dropdown-menu-*). Flat item
// path only; checkbox/radio/submenu/destructive/inset require primitive work.
// Per-item data-slot (menubar-item etc) cannot be stamped — primitive has no
// per-item attribute hook.

export type Bundle<Item extends string = string> = FoldkitMenu.Bundle<Item>
export type InitConfig = FoldkitMenu.InitConfig
export type ViewInputs<Item extends string = string> = FoldkitMenu.ViewInputs<Item>
export type ItemConfig = FoldkitMenu.ItemConfig
export type GroupHeading = FoldkitMenu.GroupHeading

export const menubarClass = 'cn-menubar flex items-center'

/** Upstream menubar trigger token string. */
export const menubarTriggerClass = 'cn-menubar-trigger flex items-center outline-hidden select-none'

/** Upstream MenubarContent renders DropdownMenuContent (which owns the panel's
 *  scroll-container utilities) with the menubar tokens layered on. Mirror that
 *  composition so the panel scrolls intentionally like upstream instead of
 *  relying on the anchor's inline overflow (whose computed overflow-x: auto
 *  risks horizontal scrollbars). */
export const menubarContentClass =
  'cn-dropdown-menu-content cn-dropdown-menu-content-logical cn-menu-target cn-menu-translucent z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none data-closed:overflow-hidden cn-menubar-content cn-menubar-content-logical'

export const menubarContentAnimatedClass = menubarContentClass

export const menubarItemClass =
  'cn-menubar-item group/menubar-item relative flex cursor-default items-center outline-hidden select-none data-active:bg-accent data-active:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const menubarSeparatorClass = 'cn-menubar-separator -mx-1 my-1 h-px'

export const menubarHeadingClass = 'cn-menubar-label'

export const menubarShortcutClass = 'cn-menubar-shortcut ml-auto'

export const menubarBackdropClass = 'fixed inset-0 z-0'

export const menubarWrapperClass = 'relative inline-block'

export const MENUBAR_ANCHOR: AnchorConfig = {
  placement: 'bottom-start',
  gap: 4,
  padding: 8,
}

export type MenubarViewInputsConfig<Item extends string> = Readonly<{
  items: ReadonlyArray<Item>
  itemToConfig: ViewInputs<Item>['itemToConfig']
  buttonContent: Html
  anchor?: AnchorConfig
  isItemDisabled?: (item: Item, index: number) => boolean
  itemToSearchText?: (item: Item, index: number) => string
  isButtonDisabled?: boolean
  isAnimated?: boolean
  triggerClass?: string
  itemsClass?: string
  itemClass?: string
  backdropClass?: string
  wrapperClass?: string
  separatorClass?: string
  ariaLabel?: string
  ariaLabelledBy?: string
}>

/** Build styled `Menu.ViewInputs` for a menubar trigger's dropdown. */
export const viewInputs = <Item extends string>(
  config: MenubarViewInputsConfig<Item>,
): ViewInputs<Item> => ({
  items: config.items,
  anchor: config.anchor ?? MENUBAR_ANCHOR,
  isItemDisabled: config.isItemDisabled,
  itemToSearchText: config.itemToSearchText,
  isButtonDisabled: config.isButtonDisabled,
  buttonContent: config.buttonContent,
  ariaLabel: config.ariaLabel,
  ariaLabelledBy: config.ariaLabelledBy,
  buttonClassName: cn(menubarTriggerClass, config.triggerClass),
  buttonAttributes: childAttributes([inertHtml.DataAttribute('slot', 'menubar-trigger')]),
  itemsClassName: cn(
    config.isAnimated !== false ? menubarContentAnimatedClass : menubarContentClass,
    config.itemsClass,
  ),
  itemsAttributes: childAttributes([inertHtml.DataAttribute('slot', 'menubar-content')]),
  itemToConfig: (item, context) => {
    const { className, content } = config.itemToConfig(item, context)
    return { className: cn(menubarItemClass, config.itemClass, className), content }
  },
  separatorClassName: cn(menubarSeparatorClass, config.separatorClass),
  separatorAttributes: childAttributes([inertHtml.DataAttribute('slot', 'menubar-separator')]),
  backdropClassName: cn(menubarBackdropClass, config.backdropClass),
  className: cn(menubarWrapperClass, config.wrapperClass),
  attributes: childAttributes([inertHtml.DataAttribute('slot', 'menubar')]),
})

/** Wrap a single menubar trigger's menu in the bar container. */
export const menubar = <M>(children: ReadonlyArray<Html>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(menubarClass)), h.DataAttribute('slot', 'menubar')], children)
