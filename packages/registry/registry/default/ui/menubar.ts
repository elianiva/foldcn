import { Menu as FoldkitMenu } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/menu'
import type { Html, HtmlBuilder } from 'foldkit/html'

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

// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/menubar.tsx. Class strings are identical to
// upstream; visual styling lives in the central foldcn style definition.
//
// foldcn gaps vs upstream: each trigger is an independent Menu bundle — no
// cross-menu arrow traversal or open-on-hover-of-next-trigger (needs a
// menubar behavior primitive).

export type Bundle<Item extends string = string> = FoldkitMenu.Bundle<Item>
export type InitConfig = FoldkitMenu.InitConfig
export type ViewInputs<Item extends string = string> = FoldkitMenu.ViewInputs<Item>
export type ItemConfig = FoldkitMenu.ItemConfig
export type GroupHeading = FoldkitMenu.GroupHeading

export const menubarClass = 'cn-menubar flex h-9 items-center gap-1 rounded-md border bg-background p-1 shadow-xs'

/** Upstream menubar trigger token string. */
export const menubarTriggerClass =
  'cn-menubar-trigger flex items-center justify-center rounded-sm px-1.5 py-[2px] text-sm font-medium outline-hidden select-none transition-colors hover:bg-muted aria-expanded:bg-muted data-open:bg-muted'

export const menubarContentClass =
  'cn-menubar-content z-50 min-w-36 overflow-hidden outline-hidden'

export const menubarContentAnimatedClass = menubarContentClass

export const menubarItemClass =
  'cn-dropdown-menu-item group/menubar-item relative flex w-full cursor-default select-none outline-hidden data-active:bg-accent data-active:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50'

export const menubarSeparatorClass = 'cn-dropdown-menu-separator -mx-1 my-1 h-px'

export const menubarHeadingClass = 'cn-dropdown-menu-label px-2 py-1.5 text-xs font-medium text-muted-foreground'

export const menubarShortcutClass = 'ml-auto text-xs tracking-widest text-muted-foreground'

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
  itemsClassName: cn(
    config.isAnimated !== false ? menubarContentAnimatedClass : menubarContentClass,
    config.itemsClass,
  ),
  itemToConfig: (item, context) => {
    const { className, content } = config.itemToConfig(item, context)
    return { className: cn(menubarItemClass, config.itemClass, className), content }
  },
  separatorClassName: cn(menubarSeparatorClass, config.separatorClass),
  backdropClassName: cn(menubarBackdropClass, config.backdropClass),
  className: cn(menubarWrapperClass, config.wrapperClass),
})

/** Wrap a single menubar trigger's menu in the bar container. */
export const menubar = <M>(children: ReadonlyArray<Html>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(menubarClass))], children)
