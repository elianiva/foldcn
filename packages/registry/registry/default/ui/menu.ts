import { Menu as FoldkitMenu } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/menu'
import type { Html } from 'foldkit/html'

import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Menu surface. Create a bundle once per item type:
//
//   export const ActionMenu = Menu.create<"Edit" | "Delete">()
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/dropdown-menu.tsx. Class strings are
// identical to upstream; visual styling lives in the central foldcn style definition.
//
// foldkit deltas: items highlight via data-active (upstream uses focus:) —
// prefix adjusted per docs/deriving-from-base.md; panels emit data-side
// derived from anchor placement. Gaps vs upstream: no checkbox/radio/submenu/
// destructive/inset item kinds (primitive-level).

export const create = FoldkitMenu.create
export const init = (config: InitConfig): Model => FoldkitMenu.init({ isAnimated: true, ...config })
export const buttonId = FoldkitMenu.buttonId
export const Model = FoldkitMenu.Model
export type Model = typeof Model.Type
export const Message = FoldkitMenu.Message
export type Message = typeof Message.Type
export const OutMessage = FoldkitMenu.OutMessage
export type OutMessage = typeof OutMessage.Type

export type Bundle<Item extends string = string> = FoldkitMenu.Bundle<Item>
export type InitConfig = FoldkitMenu.InitConfig
export type ViewInputs<Item extends string = string> = FoldkitMenu.ViewInputs<Item>
export type ItemConfig = FoldkitMenu.ItemConfig
export type GroupHeading = FoldkitMenu.GroupHeading

/** Upstream renders DropdownMenuTrigger unstyled (consumers pass a Button);
 *  foldcn's trigger builder keeps a ghost-button composition. */
export const menuTriggerClass =
  'cn-button cn-button-variant-ghost cn-button-size-default'

export const menuItemsClass =
  'cn-dropdown-menu-content z-50 min-w-32 overflow-hidden outline-hidden'

export const menuItemsAnimatedClass = menuItemsClass

export const menuItemClass =
  'cn-dropdown-menu-item relative flex w-full cursor-default select-none outline-hidden data-active:bg-accent data-active:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50'

export const menuSeparatorClass = 'cn-dropdown-menu-separator -mx-1 my-1 h-px'

export const menuHeadingClass = 'cn-dropdown-menu-label px-2 py-1.5 text-xs font-medium text-muted-foreground'

export const menuShortcutClass = 'cn-dropdown-menu-shortcut ml-auto text-xs tracking-widest text-muted-foreground'

export const menuLabelClass = menuHeadingClass

export const menuSubTriggerClass =
  'cn-dropdown-menu-sub-trigger flex w-full cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-open:bg-accent data-open:text-accent-foreground'

export const menuCheckboxItemClass =
  'cn-dropdown-menu-checkbox-item relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50'

export const menuRadioItemClass = menuCheckboxItemClass

export const menuBackdropClass = 'fixed inset-0 z-0'

export const menuWrapperClass = 'relative inline-block'

export const MENU_ANCHOR: AnchorConfig = {
  placement: 'bottom-start',
  gap: 4,
  padding: 8,
}

export type MenuViewInputsConfig<Item extends string> = Readonly<{
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

/** Build styled `Menu.ViewInputs` with foldcn's classes baked in. */
export const viewInputs = <Item extends string>(
  config: MenuViewInputsConfig<Item>,
): ViewInputs<Item> => ({
  items: config.items,
  anchor: config.anchor ?? MENU_ANCHOR,
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
          className: cn(menuHeadingClass, heading.className),
        }
      }
    : undefined,
  ariaLabel: config.ariaLabel,
  ariaLabelledBy: config.ariaLabelledBy,
  buttonClassName: cn(menuTriggerClass, config.triggerClass),
  itemsClassName: cn(
    config.isAnimated !== false ? menuItemsAnimatedClass : menuItemsClass,
    config.itemsClass,
  ),
  itemToConfig: (item, context) => {
    const { className, content } = config.itemToConfig(item, context)
    return { className: cn(menuItemClass, config.itemClass, className), content }
  },
  separatorClassName: cn(menuSeparatorClass, config.separatorClass),
  groupClassName: config.groupClass,
  backdropClassName: cn(menuBackdropClass, config.backdropClass),
  className: cn(menuWrapperClass, config.wrapperClass),
})
