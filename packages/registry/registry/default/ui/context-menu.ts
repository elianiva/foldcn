import { Menu as FoldkitMenu } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/menu'
import type { Html } from 'foldkit/html'

import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Menu surface. A context menu is a Menu variant
// anchored to the top-start of a trigger region, styled like shadcn's
// `context-menu`. (The foldkit Menu opens on activation; wire a region trigger
// to open it from a right-click handler if you want literal contextmenu
// behavior.)

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
// apps/v4/registry/bases/base/ui/context-menu.tsx. Class strings are
// identical to upstream; visual styling lives in the central foldcn style definition.
//
// foldcn gap vs upstream: opens on activation at a fixed anchor — foldkit has
// no right-click/pointer-position anchoring primitive (wire a region trigger
// yourself). Items highlight via data-active (upstream focus:) per the
// derivation mapping.

export type Bundle<Item extends string = string> = FoldkitMenu.Bundle<Item>
export type InitConfig = FoldkitMenu.InitConfig
export type ViewInputs<Item extends string = string> = FoldkitMenu.ViewInputs<Item>
export type ItemConfig = FoldkitMenu.ItemConfig
export type GroupHeading = FoldkitMenu.GroupHeading

export const contextMenuTriggerClass =
  'flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden focus:outline-hidden'

export const contextMenuItemsClass =
  'cn-context-menu-content cn-context-menu-content-logical z-50 min-w-36 overflow-hidden outline-hidden'

export const contextMenuItemsAnimatedClass = contextMenuItemsClass

export const contextMenuItemClass =
  'cn-context-menu-item relative flex w-full cursor-default select-none outline-hidden data-active:bg-accent data-active:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50'

export const contextMenuSeparatorClass = 'cn-context-menu-separator -mx-1 my-1 h-px'

export const contextMenuHeadingClass = 'cn-context-menu-label px-2 py-1.5 text-xs font-medium text-muted-foreground'

export const contextMenuShortcutClass =
  'cn-context-menu-shortcut ml-auto text-xs tracking-widest text-muted-foreground'

export const contextMenuSubTriggerClass =
  "flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[open]:bg-accent data-[open]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

export const contextMenuBackdropClass = 'fixed inset-0 z-0'

export const contextMenuWrapperClass = 'relative inline-block'

export const CONTEXT_MENU_ANCHOR: AnchorConfig = {
  placement: 'bottom-start',
  gap: 4,
  padding: 8,
}

export type ContextMenuViewInputsConfig<Item extends string> = Readonly<{
  items: ReadonlyArray<Item>
  itemToConfig: ViewInputs<Item>['itemToConfig']
  buttonContent: Html
  anchor?: AnchorConfig
  isItemDisabled?: (item: Item, index: number) => boolean
  itemToSearchText?: (item: Item, index: number) => string
  isButtonDisabled?: boolean
  isAnimated?: boolean
  itemGroupKey?: (item: Item, index: number) => string
  groupToHeading?: (groupKey: string) => GroupHeading | undefined
  triggerClass?: string
  itemsClass?: string
  itemClass?: string
  backdropClass?: string
  wrapperClass?: string
  separatorClass?: string
  groupClass?: string
  ariaLabel?: string
  ariaLabelledBy?: string
}>

/** Build styled `Menu.ViewInputs` for a context menu with foldcn's classes. */
export const viewInputs = <Item extends string>(
  config: ContextMenuViewInputsConfig<Item>,
): ViewInputs<Item> => ({
  items: config.items,
  anchor: config.anchor ?? CONTEXT_MENU_ANCHOR,
  isItemDisabled: config.isItemDisabled,
  itemToSearchText: config.itemToSearchText,
  isButtonDisabled: config.isButtonDisabled,
  buttonContent: config.buttonContent,
  itemGroupKey: config.itemGroupKey,
  groupToHeading: config.groupToHeading
    ? (groupKey) => {
        const heading = config.groupToHeading!(groupKey)
        if (!heading) return undefined
        return {
          content: heading.content,
          className: cn(contextMenuHeadingClass, heading.className),
        }
      }
    : undefined,
  ariaLabel: config.ariaLabel,
  ariaLabelledBy: config.ariaLabelledBy,
  buttonClassName: cn(contextMenuTriggerClass, config.triggerClass),
  itemsClassName: cn(
    config.isAnimated !== false ? contextMenuItemsAnimatedClass : contextMenuItemsClass,
    config.itemsClass,
  ),
  itemToConfig: (item, context) => {
    const { className, content } = config.itemToConfig(item, context)
    return { className: cn(contextMenuItemClass, config.itemClass, className), content }
  },
  separatorClassName: cn(contextMenuSeparatorClass, config.separatorClass),
  groupClassName: config.groupClass,
  backdropClassName: cn(contextMenuBackdropClass, config.backdropClass),
  className: cn(contextMenuWrapperClass, config.wrapperClass),
})
