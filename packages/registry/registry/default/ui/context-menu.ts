/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as ContextMenu from '@/components/ui/context-menu'`
 */
import { Menu as FoldkitMenu } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/menu'
import { Option, Schema as S } from 'effect'
import {
  childAttributes,
  inertHtml,
  type ChildAttribute,
  type Html,
  type HtmlBuilder,
} from 'foldkit/html'
import { Check, ChevronRight } from 'lucide'

import { icon } from '@/lib/icons'

import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Menu surface. A context menu is a Menu variant
// whose trigger is moved to the pointer: the caller records the right-click
// (or touch long-press) position as a `Point`, passes it to `viewInputs` as
// `maybePoint`, and the trigger becomes a zero-size fixed element at that
// point. foldkit's anchor positioning (flip + shift with the anchor padding)
// then places the panel at the pointer and keeps it inside the viewport.
// Without a point (keyboard open) the trigger keeps its normal place. The
// trigger is the anchor, so content passed as `buttonContent` travels with it
// while the menu is open; region content that must stay in place belongs
// beside the submodel.

export const create = FoldkitMenu.create
export const init = (config: InitConfig): Model => FoldkitMenu.init({ isAnimated: true, ...config })
export const buttonId = FoldkitMenu.buttonId
export const Model = FoldkitMenu.Model
export type Model = typeof Model.Type
export const Message = FoldkitMenu.Message
export type Message = typeof Message.Type
export const OutMessage = FoldkitMenu.OutMessage
export type OutMessage = typeof OutMessage.Type

// Remaining gaps vs upstream: items highlight via data-active (upstream
// focus:) per the derivation mapping. The panel's data-side is emitted from
// the anchor placement (foldkit anchors expose placement, not side). Per-item
// data-slot (context-menu-item etc) cannot be stamped — primitive has no
// per-item attribute hook. The primitive's item config is `{ className, content }`
// over one flat level, so item kinds are foldcn-owned: destructive/inset via
// `contextMenuItemDestructiveClass` / `contextMenuItemInsetClass`; checkbox/radio
// via `contextMenuItemIndicator` (keep the panel open by handling `SelectedItem`
// yourself instead of forwarding it to `update`, which would close the menu);
// submenus via a nested bundle built with `subViewInputs` that the consumer
// slice opens/closes and key-coordinates (see the web menu demo).

/** Viewport (client) coordinates of the pointer that requested the menu. */
export const Point = S.Struct({ x: S.Number, y: S.Number })
export type Point = typeof Point.Type

/** Pointer-down handler result: the point for a right-click or a touch/pen
 *  press (which becomes a long-press `contextmenu` on touch browsers that
 *  fire it), none for other buttons. Wire it to the region's `h.OnPointerDown`
 *  alongside `h.OnContextMenu(Opened)`. */
export const pointFromPointerDown = (
  pointerType: string,
  button: number,
  clientX: number,
  clientY: number,
): Option.Option<Point> =>
  button === 2 || pointerType === 'touch' || pointerType === 'pen'
    ? Option.some({ x: clientX, y: clientY })
    : Option.none()

export type Bundle<Item extends string = string> = FoldkitMenu.Bundle<Item>
export type InitConfig = FoldkitMenu.InitConfig
export type ViewInputs<Item extends string = string> = FoldkitMenu.ViewInputs<Item>
export type ItemConfig = FoldkitMenu.ItemConfig
export type GroupHeading = FoldkitMenu.GroupHeading

export const contextMenuTriggerClass = 'cn-context-menu-trigger select-none'

export const contextMenuItemsClass =
  'cn-context-menu-content cn-context-menu-content-logical cn-menu-target cn-menu-translucent z-50 max-h-(--available-height) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none'

export const contextMenuItemsAnimatedClass = contextMenuItemsClass

export const contextMenuItemClass =
  'cn-context-menu-item group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-active:bg-accent data-active:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const contextMenuSeparatorClass = 'cn-context-menu-separator'

export const contextMenuHeadingClass = 'cn-context-menu-label'

export const contextMenuShortcutClass = 'cn-context-menu-shortcut'

export const contextMenuSubTriggerClass =
  'cn-context-menu-sub-trigger group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-active:bg-accent data-active:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

/** Highlight for the parent row while its submenu is open. */
export const contextMenuSubTriggerOpenClass = 'bg-accent text-accent-foreground'

/** Upstream `ContextMenuSubContent` string (the nested panel). */
export const contextMenuSubContentClass =
  'cn-context-menu-sub-content cn-menu-target cn-menu-translucent z-50 max-h-(--available-height) w-auto origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none'

/** Row className for upstream `variant="destructive"`. */
export const contextMenuItemDestructiveClass = 'cn-context-menu-item-destructive'

/** Row className for upstream `inset`. */
export const contextMenuItemInsetClass = 'cn-context-menu-item-inset'

/** Upstream `ContextMenuCheckboxItem` / `ContextMenuRadioItem` strings, with
 *  the foldkit highlight twin. */
export const contextMenuCheckboxItemClass =
  'cn-context-menu-checkbox-item data-active:bg-accent data-active:text-accent-foreground relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const contextMenuRadioItemClass =
  'cn-context-menu-radio-item data-active:bg-accent data-active:text-accent-foreground relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const contextMenuItemIndicatorClass = 'cn-context-menu-item-indicator pointer-events-none'

/** Check indicator for a checkbox or radio row: render it inside the row's
 *  `content` (empty when unchecked) and give the row `contextMenuCheckboxItemClass`
 *  / `contextMenuRadioItemClass`. */
export const contextMenuItemIndicator = <M>(h: HtmlBuilder<M>, isChecked: boolean): Html =>
  h.span(
    [
      h.Class(contextMenuItemIndicatorClass),
      h.DataAttribute('slot', 'context-menu-item-indicator'),
    ],
    isChecked ? [icon(h, Check)] : [],
  )

/** Trailing chevron for a submenu trigger row. */
export const contextMenuSubTriggerChevron = <M>(h: HtmlBuilder<M>): Html =>
  icon(h, ChevronRight, 'cn-rtl-flip ml-auto size-4')

export const contextMenuBackdropClass = 'fixed inset-0 z-0'

export const contextMenuWrapperClass = 'relative inline-block'

// Applied only while a pointer point is set: the trigger collapses to an
// invisible zero-size anchor (positioned by inline style) at the pointer.
export const contextMenuTriggerAnchorClass = 'pointer-events-none size-0 opacity-0'

export const CONTEXT_MENU_ANCHOR: AnchorConfig = {
  placement: 'bottom-start',
  gap: 4,
  padding: 8,
}

export type ContextMenuViewInputsConfig<Item extends string> = Readonly<{
  items: ReadonlyArray<Item>
  itemToConfig: ViewInputs<Item>['itemToConfig']
  buttonContent: Html
  /** Where the pointer requested the menu; the panel anchors here. */
  maybePoint?: Option.Option<Point>
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
  /** Extra trigger attributes. Build them with `childAttributes` so handlers
   *  dispatch through your own update. */
  triggerAttributes?: ReadonlyArray<ChildAttribute>
  /** Extra panel attributes (used for submenu ArrowRight/ArrowLeft). */
  contentAttributes?: ReadonlyArray<ChildAttribute>
}>

/** Build styled `Menu.ViewInputs` for a context menu with foldcn's classes. */
export const viewInputs = <Item extends string>(
  config: ContextMenuViewInputsConfig<Item>,
): ViewInputs<Item> => {
  // Upstream slide-in variants key on data-side; foldkit anchors expose
  // placement ("bottom-start"), so derive the physical side here.
  const anchor = config.anchor ?? CONTEXT_MENU_ANCHOR
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
            className: cn(contextMenuHeadingClass, heading.className),
          }
        }
      : undefined,
    ariaLabel: config.ariaLabel,
    ariaLabelledBy: config.ariaLabelledBy,
    buttonClassName: cn(
      contextMenuTriggerClass,
      Option.isSome(config.maybePoint ?? Option.none()) ? contextMenuTriggerAnchorClass : undefined,
      config.triggerClass,
    ),
    buttonAttributes: [
      ...childAttributes([
        inertHtml.DataAttribute('slot', 'context-menu-trigger'),
        // Replaces the primitive's open-state Style (position: relative) so the
        // zero-size trigger sits at the pointer while the menu is open.
        ...Option.match(config.maybePoint ?? Option.none(), {
          onNone: () => [],
          onSome: ({ x, y }) => [
            inertHtml.Style({ position: 'fixed', left: `${x}px`, top: `${y}px`, zIndex: '1' }),
          ],
        }),
      ]),
      ...(config.triggerAttributes ?? []),
    ],
    itemsClassName: cn(
      config.isAnimated !== false ? contextMenuItemsAnimatedClass : contextMenuItemsClass,
      config.itemsClass,
    ),
    itemsAttributes: [
      ...childAttributes([
        inertHtml.DataAttribute('slot', 'context-menu-content'),
        inertHtml.DataAttribute('side', side),
      ]),
      ...(config.contentAttributes ?? []),
    ],
    itemToConfig: (item, context) => {
      const { className, content } = config.itemToConfig(item, context)
      return { className: cn(contextMenuItemClass, config.itemClass, className), content }
    },
    separatorClassName: cn(contextMenuSeparatorClass, config.separatorClass),
    separatorAttributes: childAttributes([
      inertHtml.DataAttribute('slot', 'context-menu-separator'),
    ]),
    groupClassName: config.groupClass,
    groupAttributes: childAttributes([inertHtml.DataAttribute('slot', 'context-menu-group')]),
    backdropClassName: cn(contextMenuBackdropClass, config.backdropClass),
    className: cn(contextMenuWrapperClass, config.wrapperClass),
    attributes: childAttributes([inertHtml.DataAttribute('slot', 'context-menu')]),
  }
}

// The trigger button sits inside the parent row (px-1.5) inside the parent
// panel (p-1), so the gap clears both and the offset lines the first row up with
// the trigger row (the sub panel's own p-1).
export const CONTEXT_MENU_SUB_ANCHOR: AnchorConfig = {
  placement: 'right-start',
  gap: 14,
  offset: -8,
  padding: 8,
}

/** `viewInputs` for a nested menu, rendered as the `content` of a parent row.
 *  The trigger is a full-width, pointer-transparent button: the parent row owns
 *  the click (its `SelectedItem` message opens the submenu — handle it yourself, do not forward it) and the panel
 *  anchors to the trigger. Pair it with `contextMenuSubTriggerClass` on the
 *  parent row's className and `contextMenuSubTriggerChevron` in the trigger's
 *  content. */
export const subViewInputs = <Item extends string>(
  config: ContextMenuViewInputsConfig<Item>,
): ViewInputs<Item> => {
  const anchor = config.anchor ?? CONTEXT_MENU_SUB_ANCHOR
  const inputs = viewInputs({ wrapperClass: 'block w-full', ...config, anchor })
  return {
    ...inputs,
    buttonClassName: cn(
      'pointer-events-none flex w-full items-center gap-1.5',
      config.triggerClass,
    ),
    buttonAttributes: [
      ...childAttributes([
        inertHtml.DataAttribute('slot', 'context-menu-sub-trigger'),
        inertHtml.Tabindex(-1),
      ]),
      ...(config.triggerAttributes ?? []),
    ],
    itemsClassName: cn(contextMenuSubContentClass, config.itemsClass),
    itemsAttributes: [
      ...childAttributes([
        inertHtml.DataAttribute('slot', 'context-menu-sub-content'),
        inertHtml.DataAttribute('side', anchor.placement?.split('-')[0] ?? 'right'),
      ]),
      ...(config.contentAttributes ?? []),
    ],
  }
}
