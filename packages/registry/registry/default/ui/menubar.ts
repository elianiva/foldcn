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

// foldcn gaps vs upstream (primitive ceiling — needs @foldkit/ui work): each
// trigger is an independent Menu bundle — no cross-menu ArrowLeft/Right
// traversal or open-on-hover-of-next-trigger (upstream Menubar primitive
// behavior). No submenu/checkbox/radio item kinds (upstream MenubarSub,
// MenubarCheckboxItem, MenubarRadioGroup/Item) — the Menu primitive has flat
// items + labeled groups only; demo state can toggle check/radio affordances
// (see the web menubar demo). No per-item data-inset/data-variant attributes
// (upstream MenubarItem inset/destructive props) and no per-item data-slot
// (menubar-item etc) — the primitive has no per-item attribute hook.
// Menubar content/item/label/separator/shortcut use the cn-menubar-* family.
// Group headings render via itemGroupKey/groupToHeading (upstream
// MenubarGroup/MenubarLabel); separators render between groups. The panel is
// portaled to the document body by the primitive itself (upstream
// MenubarPortal equivalent). Align offset (-4) has no anchor equivalent.

export type Bundle<Item extends string = string> = FoldkitMenu.Bundle<Item>
export type InitConfig = FoldkitMenu.InitConfig
export type ViewInputs<Item extends string = string> = FoldkitMenu.ViewInputs<Item>
export type ItemConfig = FoldkitMenu.ItemConfig
export type GroupHeading = FoldkitMenu.GroupHeading

export const menubarClass = 'cn-menubar flex items-center'

/** Upstream menubar trigger token string. */
export const menubarTriggerClass = 'cn-menubar-trigger flex items-center outline-hidden select-none'

export const menubarContentClass =
  'cn-menubar-content cn-menubar-content-logical cn-menu-target cn-menu-translucent'

export const menubarContentAnimatedClass = menubarContentClass

export const menubarItemClass =
  'cn-menubar-item group/menubar-item relative flex cursor-default items-center outline-hidden select-none data-active:bg-accent data-active:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const menubarSeparatorClass = 'cn-menubar-separator -mx-1 my-1 h-px'

export const menubarHeadingClass = 'cn-menubar-label'

/** Upstream `MenubarLabel` token (alias — foldcn historically named it heading). */
export const menubarLabelClass = menubarHeadingClass

export const menubarShortcutClass = 'cn-menubar-shortcut ml-auto'

/** Upstream `MenubarCheckboxItem` token string (verbatim). No foldkit highlight
 *  twin: upstream keys checkbox highlight on focus: inside the token. */
export const menubarCheckboxItemClass =
  'cn-menubar-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const menubarCheckboxItemIndicatorClass =
  'cn-menubar-checkbox-item-indicator pointer-events-none absolute flex items-center justify-center'

/** Upstream `MenubarRadioItem` token string (verbatim — note: no disabled
 *  opacity, matching upstream). */
export const menubarRadioItemClass =
  'cn-menubar-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const menubarRadioItemIndicatorClass =
  'cn-menubar-radio-item-indicator pointer-events-none absolute flex items-center justify-center'

/** Upstream `MenubarSubTrigger` token (verbatim). Open-state styling arrives
 *  via cn-compat.css twins (foldkit emits data-open, Base UI data-popup-open). */
export const menubarSubTriggerClass = 'cn-menubar-sub-trigger'

/** Upstream `MenubarSubContent` token string (verbatim). */
export const menubarSubContentClass = 'cn-menubar-sub-content cn-menu-target cn-menu-translucent'

export const menubarBackdropClass = 'fixed inset-0 z-0'

export const menubarWrapperClass = 'relative inline-block'

// Upstream MenubarContent: align=start (placement bottom-start), sideOffset=8
// (gap), alignOffset=-4 (no anchor equivalent — documented gap above).
export const MENUBAR_ANCHOR: AnchorConfig = {
  placement: 'bottom-start',
  gap: 8,
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
  itemGroupKey: config.itemGroupKey,
  groupToHeading: config.groupToHeading
    ? (groupKey) => {
        const heading = config.groupToHeading!(groupKey)
        if (!heading) return undefined
        return {
          content: heading.content,
          className: cn(menubarHeadingClass, heading.className),
        }
      }
    : undefined,
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
  groupClassName: config.groupClass,
  groupAttributes: childAttributes([inertHtml.DataAttribute('slot', 'menubar-group')]),
  backdropClassName: cn(menubarBackdropClass, config.backdropClass),
  className: cn(menubarWrapperClass, config.wrapperClass),
  attributes: childAttributes([inertHtml.DataAttribute('slot', 'menubar')]),
})

/** Wrap a single menubar trigger's menu in the bar container. */
export const menubar = <M>(children: ReadonlyArray<Html>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(menubarClass)), h.DataAttribute('slot', 'menubar')], children)
