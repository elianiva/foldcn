/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Menu from '@/components/ui/menu'`
 */
import { Menu as FoldkitMenu } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/menu'
import { childAttributes, inertHtml, type Html, type HtmlBuilder } from 'foldkit/html'
import { Check, ChevronRight } from 'lucide'

import { icon } from '@/lib/icons'
import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Menu surface. Create a bundle once per item type:
//
//   export const ActionMenu = Menu.create<"Edit" | "Delete">()
//
// foldkit deltas: items highlight via data-active (upstream uses focus:) —
// prefix adjusted per docs/deriving-from-base.md; the panel's data-side is
// emitted here from the anchor placement (foldkit anchors expose placement,
// not side). The primitive's item config is `{ className, content }` with a
// single flat level, so item kinds are foldcn-owned:
//   - destructive / inset: `menuItemDestructiveClass` / `menuItemInsetClass`
//     (cn-compat tokens; the row cannot carry data-variant / data-inset).
//   - checkbox / radio: render `menuItemIndicator` inside the row. The
//     primitive closes on every `SelectedItem`, so keep the panel open by
//     handling that message yourself (apply your toggle, do not forward it to
//     `update`) — the menu never closes, animated or not.
//   - submenu: nest a second bundle inside the parent row, built with
//     `subViewInputs`; the consumer slice coordinates open/close and keys.
// Per-item data-slot (dropdown-menu-item etc) cannot be stamped — the primitive
// has no per-item attribute hook. Sub-trigger uses data-popup-open per upstream
// but foldkit emits data-open — compat via cn-compat.css.

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
  'cn-dropdown-menu-sub-trigger group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-active:bg-accent data-active:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

/** Highlight for the parent row while its submenu is open (upstream keys this
 *  on the trigger's `data-popup-open`). */
export const menuSubTriggerOpenClass = 'bg-accent text-accent-foreground'

/** Upstream `DropdownMenuSubContent` string (the nested panel). */
export const menuSubContentClass =
  'cn-dropdown-menu-sub-content cn-menu-target cn-menu-translucent z-50 max-h-(--available-height) w-auto origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none data-closed:overflow-hidden'

/** Row className for upstream `variant="destructive"`. */
export const menuItemDestructiveClass = 'cn-dropdown-menu-item-destructive'

/** Row className for upstream `inset`. */
export const menuItemInsetClass = 'cn-dropdown-menu-item-inset'

/** Upstream `DropdownMenuItemIndicator` (right-aligned check). */
export const menuItemIndicatorClass = 'cn-dropdown-menu-item-indicator pointer-events-none'

export const menuCheckboxItemClass =
  'cn-dropdown-menu-checkbox-item data-active:bg-accent data-active:text-accent-foreground relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const menuRadioItemClass =
  'cn-dropdown-menu-radio-item data-active:bg-accent data-active:text-accent-foreground relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

/** Check indicator for a checkbox or radio row: render it inside the row's
 *  `content` (empty when unchecked) and give the row `menuCheckboxItemClass` /
 *  `menuRadioItemClass`. */
export const menuItemIndicator = <M>(h: HtmlBuilder<M>, isChecked: boolean): Html =>
  h.span(
    [h.Class(menuItemIndicatorClass), h.DataAttribute('slot', 'dropdown-menu-item-indicator')],
    isChecked ? [icon(h, Check)] : [],
  )

/** Trailing chevron for a submenu trigger row. */
export const menuSubTriggerChevron = <M>(h: HtmlBuilder<M>): Html =>
  icon(h, ChevronRight, 'cn-rtl-flip ml-auto size-4')

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
  /** Extra attributes for the trigger and the panel. Build them with
   *  `childAttributes` so handlers dispatch through your own update (used for
   *  submenu ArrowRight/ArrowLeft coordination). */
  triggerAttributes?: ViewInputs<Item>['buttonAttributes']
  contentAttributes?: ViewInputs<Item>['itemsAttributes']
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
    buttonAttributes: [
      ...childAttributes([inertHtml.DataAttribute('slot', 'dropdown-menu-trigger')]),
      ...(config.triggerAttributes ?? []),
    ],
    itemsClassName: cn(
      config.isAnimated !== false ? menuItemsAnimatedClass : menuItemsClass,
      config.itemsClass,
    ),
    itemsAttributes: [
      ...childAttributes([
        inertHtml.DataAttribute('slot', 'dropdown-menu-content'),
        inertHtml.DataAttribute('side', side),
      ]),
      ...(config.contentAttributes ?? []),
    ],
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

// The trigger button sits inside the parent row (px-1.5) inside the parent
// panel (p-1), so the gap clears both and the offset lines the first row up with
// the trigger row (the sub panel's own p-1).
export const MENU_SUB_ANCHOR: AnchorConfig = {
  placement: 'right-start',
  gap: 14,
  offset: -8,
  padding: 8,
}

/** `viewInputs` for a nested menu, rendered as the `content` of a parent row.
 *  The trigger is a full-width, pointer-transparent button: the parent row owns
 *  the click (its `SelectedItem` message opens the submenu — handle it yourself, do not forward it) and the panel
 *  anchors to the trigger. Pair it with `menuSubTriggerClass` on the parent
 *  row's className and `menuSubTriggerChevron` in the trigger's content. */
export const subViewInputs = <Item extends string>(
  config: MenuViewInputsConfig<Item>,
): ViewInputs<Item> => {
  const inputs = viewInputs({
    anchor: MENU_SUB_ANCHOR,
    wrapperClass: 'block w-full',
    ...config,
  })
  return {
    ...inputs,
    buttonClassName: cn(
      'pointer-events-none flex w-full items-center gap-1.5',
      config.triggerClass,
    ),
    buttonAttributes: [
      ...childAttributes([
        inertHtml.DataAttribute('slot', 'dropdown-menu-sub-trigger'),
        inertHtml.Tabindex(-1),
      ]),
      ...(config.triggerAttributes ?? []),
    ],
    itemsClassName: cn(menuSubContentClass, config.itemsClass),
    itemsAttributes: [
      ...childAttributes([
        inertHtml.DataAttribute('slot', 'dropdown-menu-sub-content'),
        inertHtml.DataAttribute(
          'side',
          (config.anchor ?? MENU_SUB_ANCHOR).placement?.split('-')[0] ?? 'right',
        ),
      ]),
      ...(config.contentAttributes ?? []),
    ],
  }
}
