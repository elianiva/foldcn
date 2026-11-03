/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Menubar from '@/components/ui/menubar'`
 */
import { Menu as FoldkitMenu } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/menu'
import {
  childAttributes,
  inertHtml,
  type ChildAttribute,
  type Html,
  type HtmlBuilder,
} from 'foldkit/html'
import { Option } from 'effect'
import { Check, ChevronRight } from 'lucide'

import { icon } from '@/lib/icons'
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

// Cross-menu behavior is app-owned: each trigger is still an independent Menu
// bundle, so the bar's owner coordinates them. `navigationAttributes` emits the
// trigger/panel events (hover on a trigger, ArrowLeft/Right) as parent
// messages; the owner closes the open menu and opens the neighbour in its
// update (see the web menubar demo slice for the reference wiring).
// foldcn gaps vs upstream (primitive ceiling — needs @foldkit/ui work): the
// primitive's item config is `{ className, content }` over one flat level, so
// item kinds are foldcn-owned: destructive/inset via `menubarItemDestructiveClass`
// / `menubarItemInsetClass`; checkbox/radio via the indicator helpers (keep the
// panel open by handling `SelectedItem` yourself instead of forwarding it to
// `update`, which would close the menu); submenus via a nested bundle built with
// `subViewInputs` that the consumer slice opens/closes and key-coordinates (see
// the web menu demo). No per-item data-slot (menubar-item etc) — the primitive
// has no per-item attribute hook.
// Menubar content/item/label/separator/shortcut use the cn-menubar-* family.
// Group headings render via itemGroupKey/groupToHeading (upstream
// MenubarGroup/MenubarLabel); separators render between groups. The panel is
// portaled to the document body by the primitive itself (upstream
// MenubarPortal equivalent). Align offset (-4) has no anchor equivalent.
// Items highlight via data-active (upstream focus:) per the derivation mapping;
// the panel's data-side is emitted from the anchor placement.

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

/** Upstream `MenubarLabel` token (alias — foldcn historically named it heading). */
export const menubarLabelClass = menubarHeadingClass

export const menubarShortcutClass = 'cn-menubar-shortcut ml-auto'

/** Upstream `MenubarCheckboxItem` token string, plus the foldkit highlight twin
 *  (upstream keys the highlight on focus: inside the token). */
export const menubarCheckboxItemClass =
  'cn-menubar-checkbox-item data-active:bg-accent data-active:text-accent-foreground relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const menubarCheckboxItemIndicatorClass =
  'cn-menubar-checkbox-item-indicator pointer-events-none absolute flex items-center justify-center'

/** Upstream `MenubarRadioItem` token string (verbatim — note: no disabled
 *  opacity, matching upstream), plus the foldkit highlight twin. */
export const menubarRadioItemClass =
  'cn-menubar-radio-item data-active:bg-accent data-active:text-accent-foreground relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const menubarRadioItemIndicatorClass =
  'cn-menubar-radio-item-indicator pointer-events-none absolute flex items-center justify-center'

/** Upstream `MenubarSubTrigger` token (verbatim). Open-state styling arrives
 *  via cn-compat.css twins (foldkit emits data-open, Base UI data-popup-open). */
export const menubarSubTriggerClass =
  'cn-menubar-sub-trigger group/menubar-item relative flex cursor-default items-center outline-hidden select-none data-active:bg-accent data-active:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

/** Highlight for the parent row while its submenu is open. */
export const menubarSubTriggerOpenClass = 'bg-accent text-accent-foreground'

/** Row className for upstream `variant="destructive"`. */
export const menubarItemDestructiveClass = 'cn-menubar-item-destructive'

/** Row className for upstream `inset`. */
export const menubarItemInsetClass = 'cn-menubar-item-inset'

/** Upstream `MenubarSubContent` token string (verbatim). */
export const menubarSubContentClass = 'cn-menubar-sub-content cn-menu-target cn-menu-translucent'

/** Check indicator for a checkbox row: render it inside the row's `content`
 *  (empty when unchecked) with `menubarCheckboxItemClass` on the row. */
export const menubarCheckboxIndicator = <M>(h: HtmlBuilder<M>, isChecked: boolean): Html =>
  h.span(
    [
      h.Class(menubarCheckboxItemIndicatorClass),
      h.DataAttribute('slot', 'menubar-checkbox-item-indicator'),
    ],
    isChecked ? [icon(h, Check)] : [],
  )

/** Same for a radio row, with `menubarRadioItemClass` on the row. */
export const menubarRadioIndicator = <M>(h: HtmlBuilder<M>, isSelected: boolean): Html =>
  h.span(
    [
      h.Class(menubarRadioItemIndicatorClass),
      h.DataAttribute('slot', 'menubar-radio-item-indicator'),
    ],
    isSelected ? [icon(h, Check)] : [],
  )

/** Trailing chevron for a submenu trigger row. */
export const menubarSubTriggerChevron = <M>(h: HtmlBuilder<M>): Html =>
  icon(h, ChevronRight, 'cn-rtl-flip ml-auto size-4')

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
  /** Extra trigger attributes, e.g. from `navigationAttributes`. */
  triggerAttributes?: ReadonlyArray<ChildAttribute>
  /** Extra panel attributes, e.g. from `navigationAttributes`. */
  contentAttributes?: ReadonlyArray<ChildAttribute>
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
): ViewInputs<Item> => {
  // Upstream slide-in variants key on data-side; foldkit anchors expose
  // placement ("bottom-start"), so derive the physical side here.
  const anchor = config.anchor ?? MENUBAR_ANCHOR
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
            className: cn(menubarHeadingClass, heading.className),
          }
        }
      : undefined,
    ariaLabel: config.ariaLabel,
    ariaLabelledBy: config.ariaLabelledBy,
    buttonClassName: cn(menubarTriggerClass, config.triggerClass),
    buttonAttributes: [
      ...childAttributes([
        inertHtml.DataAttribute('slot', 'menubar-trigger'),
        // The primitive's backdrop covers the page and only lifts the OPEN
        // trigger above it; lift every trigger so the others stay hoverable
        // and clickable while a menu is open.
        inertHtml.Style({ position: 'relative', zIndex: '1' }),
      ]),
      ...(config.triggerAttributes ?? []),
    ],
    itemsClassName: cn(
      config.isAnimated !== false ? menubarContentAnimatedClass : menubarContentClass,
      config.itemsClass,
    ),
    itemsAttributes: [
      ...childAttributes([
        inertHtml.DataAttribute('slot', 'menubar-content'),
        inertHtml.DataAttribute('side', side),
      ]),
      ...(config.contentAttributes ?? []),
    ],
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
  }
}

// The trigger button sits inside the parent row (px-1.5) inside the parent
// panel (p-1), so the gap clears both and the offset lines the first row up with
// the trigger row (the sub panel's own p-1).
export const MENUBAR_SUB_ANCHOR: AnchorConfig = {
  placement: 'right-start',
  gap: 14,
  offset: -8,
  padding: 8,
}

/** `viewInputs` for a nested menu, rendered as the `content` of a parent row.
 *  The trigger is a full-width, pointer-transparent button: the parent row owns
 *  the click (its `SelectedItem` message opens the submenu — handle it yourself, do not forward it) and the panel
 *  anchors to the trigger. Pair it with `menubarSubTriggerClass` on the parent
 *  row's className and `menubarSubTriggerChevron` in the trigger's content. */
export const subViewInputs = <Item extends string>(
  config: MenubarViewInputsConfig<Item>,
): ViewInputs<Item> => {
  const anchor = config.anchor ?? MENUBAR_SUB_ANCHOR
  const inputs = viewInputs({ wrapperClass: 'block w-full', ...config, anchor })
  return {
    ...inputs,
    buttonClassName: cn(
      'pointer-events-none flex w-full items-center gap-1.5',
      config.triggerClass,
    ),
    buttonAttributes: [
      ...childAttributes([
        inertHtml.DataAttribute('slot', 'menubar-sub-trigger'),
        inertHtml.Tabindex(-1),
      ]),
      ...(config.triggerAttributes ?? []),
    ],
    itemsClassName: cn(
      menubarSubContentClass,
      'z-50 max-h-(--available-height) w-auto origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none',
      config.itemsClass,
    ),
    itemsAttributes: [
      ...childAttributes([
        inertHtml.DataAttribute('slot', 'menubar-sub-content'),
        inertHtml.DataAttribute('side', anchor.placement?.split('-')[0] ?? 'right'),
      ]),
      ...(config.contentAttributes ?? []),
    ],
  }
}

/** Wrap a single menubar trigger's menu in the bar container. */
export const menubar = <M>(children: ReadonlyArray<Html>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(menubarClass)), h.DataAttribute('slot', 'menubar')], children)

export type NavigationConfig<M> = Readonly<{
  /** The builder of the view that renders the bar, so handlers dispatch to its owner. */
  h: HtmlBuilder<M>
  /** The pointer entered this trigger. */
  onHoverTrigger: M
  /** ArrowLeft/ArrowRight asked for the previous/next trigger. */
  onStep: (direction: 'Previous' | 'Next') => M
  /** Swap the arrow keys inside `dir="rtl"` bars. */
  isRtl?: boolean
}>

export type NavigationAttributes = Readonly<{
  triggerAttributes: ReadonlyArray<ChildAttribute>
  contentAttributes: ReadonlyArray<ChildAttribute>
}>

/** Trigger/panel attributes that surface menubar navigation as owner
 *  messages: hover on a trigger, and ArrowLeft/ArrowRight on a trigger or an
 *  open panel. Spread the result into `viewInputs`. */
export const navigationAttributes = <M>(config: NavigationConfig<M>): NavigationAttributes => {
  const { h } = config
  const [before, after] = config.isRtl
    ? (['ArrowRight', 'ArrowLeft'] as const)
    : (['ArrowLeft', 'ArrowRight'] as const)
  const onKeyDown = h.OnKeyDownPreventDefault((key) =>
    key === before
      ? Option.some(config.onStep('Previous'))
      : key === after
        ? Option.some(config.onStep('Next'))
        : Option.none(),
  )
  return {
    triggerAttributes: childAttributes([h.OnMouseEnter(config.onHoverTrigger), onKeyDown]),
    contentAttributes: childAttributes([onKeyDown]),
  }
}
