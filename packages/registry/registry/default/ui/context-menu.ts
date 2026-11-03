/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as ContextMenu from '@/components/ui/context-menu'`
 */
import { Menu as FoldkitMenu } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/menu'
import { Option, Schema as S } from 'effect'
import { childAttributes, inertHtml, type Html } from 'foldkit/html'

import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Menu surface. A context menu is a Menu variant
// whose trigger is moved to the pointer: the caller records the right-click
// (or touch long-press) position as a `Point`, passes it to `viewInputs` as
// `maybePoint`, and the trigger becomes a zero-size fixed element at that
// point. foldkit's anchor positioning (flip + shift with the anchor padding)
// then places the panel at the pointer and keeps it inside the viewport.
// Without a point (keyboard open) the trigger stays at the wrapper.

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
// the anchor placement (foldkit anchors expose placement, not side). Flat item
// path uses correct tokens/slots; per-item data-slot (context-menu-item etc)
// cannot be stamped — primitive has no per-item attribute hook. Submenu/
// checkbox/radio/destructive/inset kinds require primitive work.

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
  'cn-context-menu-sub-trigger flex cursor-default items-center outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const contextMenuBackdropClass = 'fixed inset-0 z-0'

export const contextMenuWrapperClass = 'relative inline-block'

// Invisible trigger kept focusable (Tab, then Enter/ArrowDown opens). It is
// not clickable so a left-click on the region does not open the menu.
export const contextMenuTriggerAnchorClass =
  'pointer-events-none absolute top-0 left-0 size-0 opacity-0'

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
      contextMenuTriggerAnchorClass,
      config.triggerClass,
    ),
    buttonAttributes: childAttributes([
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
    itemsClassName: cn(
      config.isAnimated !== false ? contextMenuItemsAnimatedClass : contextMenuItemsClass,
      config.itemsClass,
    ),
    itemsAttributes: childAttributes([
      inertHtml.DataAttribute('slot', 'context-menu-content'),
      inertHtml.DataAttribute('side', side),
    ]),
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
