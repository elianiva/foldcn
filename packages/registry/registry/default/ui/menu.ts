/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Menu from '@/components/ui/menu'`
 */
import { Menu as FoldkitMenu } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/menu'
import { childAttributes, inertHtml, type Html } from 'foldkit/html'

import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Menu surface. Create a bundle once per item type:
//
//   export const ActionMenu = Menu.create<"Edit" | "Delete">()
//
// foldkit deltas: items highlight via data-active (upstream uses focus:) —
// prefix adjusted per docs/deriving-from-base.md; the panel's data-side is
// emitted here from the anchor placement (foldkit anchors expose placement,
// not side). Gaps vs upstream: no checkbox/radio/submenu/
// destructive/inset item kinds (primitive-level). Flat item path uses correct
// tokens/slots; per-item data-slot (dropdown-menu-item etc) cannot be stamped —
// primitive has no per-item attribute hook (documented gap). Sub-trigger uses
// data-popup-open per upstream but foldkit emits data-open — compat via style
// token's data-open handling (see cn-compat.css).

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
export const menuTriggerClass = 'cn-button cn-button-variant-ghost cn-button-size-default'

export const menuItemsClass =
  'cn-dropdown-menu-content cn-dropdown-menu-content-logical cn-menu-target cn-menu-translucent z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none data-closed:overflow-hidden'

export const menuItemsAnimatedClass = menuItemsClass

export const menuItemClass =
  'cn-dropdown-menu-item group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-active:bg-accent data-active:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const menuSeparatorClass = 'cn-dropdown-menu-separator'

export const menuHeadingClass = 'cn-dropdown-menu-label'

export const menuShortcutClass = 'cn-dropdown-menu-shortcut'

export const menuLabelClass = menuHeadingClass

export const menuSubTriggerClass =
  'cn-dropdown-menu-sub-trigger flex cursor-default items-center outline-hidden select-none data-popup-open:bg-accent data-popup-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const menuCheckboxItemClass =
  'cn-dropdown-menu-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const menuRadioItemClass =
  'cn-dropdown-menu-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

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
): ViewInputs<Item> => {
  // Upstream slide-in variants key on data-side; foldkit anchors expose
  // placement ("bottom-start"), so derive the physical side here.
  const anchor = config.anchor ?? MENU_ANCHOR
  const side = (anchor.placement ?? 'bottom').split('-')[0] || 'bottom'
  return {
    items: config.items,
    anchor,
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
    buttonAttributes: childAttributes([inertHtml.DataAttribute('slot', 'dropdown-menu-trigger')]),
    itemsClassName: cn(
      config.isAnimated !== false ? menuItemsAnimatedClass : menuItemsClass,
      config.itemsClass,
    ),
    itemsAttributes: childAttributes([
      inertHtml.DataAttribute('slot', 'dropdown-menu-content'),
      inertHtml.DataAttribute('side', side),
    ]),
    itemToConfig: (item, context) => {
      const { className, content } = config.itemToConfig(item, context)
      return { className: cn(menuItemClass, config.itemClass, className), content }
    },
    separatorClassName: cn(menuSeparatorClass, config.separatorClass),
    separatorAttributes: childAttributes([
      inertHtml.DataAttribute('slot', 'dropdown-menu-separator'),
    ]),
    groupClassName: config.groupClass,
    groupAttributes: childAttributes([inertHtml.DataAttribute('slot', 'dropdown-menu-group')]),
    backdropClassName: cn(menuBackdropClass, config.backdropClass),
    className: cn(menuWrapperClass, config.wrapperClass),
    attributes: childAttributes([inertHtml.DataAttribute('slot', 'dropdown-menu')]),
  }
}
