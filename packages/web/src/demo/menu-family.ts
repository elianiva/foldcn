// Shared coordination for the menu-family demos (menu, context-menu, menubar).
// The @foldkit/ui Menu primitive closes on every selection and has no nesting,
// so the slices own two behaviors it cannot:
//   - `keepOpenOnSelect`: a checkbox/radio row toggles slice state without closing;
//   - `subMenu`: a second Menu embedded in a parent row opens as a submenu.
import { Option } from 'effect'
import { Menu as FoldkitMenu } from '@foldkit/ui'
import { Command, Update } from 'foldkit'
import { childAttributes, type HtmlBuilder } from 'foldkit/html'

import * as menu from '../generated/registry/ui/menu'

import { DemoMenu } from './bundles'

type Read<S> = (model: S) => menu.Model
type Write<S> = (model: S, next: menu.Model) => S

/** Keep a menu open when `message` selects a row. The primitive closes on every
 *  `SelectedItem`, so for rows that only toggle slice state (checkbox/radio) the
 *  slice applies the toggle and never forwards the message to the primitive:
 *  the menu is not closed, animated or not. Everything else goes to `forward`.
 *
 *  A menu opened with a mouse press also turns a pointer release over a
 *  highlighted row into a second, programmatic click (press-drag-release
 *  selection). The menu normally closed on the first selection, so that never
 *  mattered; for a kept row both clicks would toggle, so the release is dropped. */
export const keepOpenOnSelect =
  <S, A>(config: {
    items: ReadonlyArray<string>
    readMenu: (model: S) => menu.Model
    isKept: (item: string, index: number) => boolean
    onSelected: (item: string, index: number) => Update.Step<S, A>
    forward: (model: S, message: menu.Message) => Update.Return<S, A>
  }) =>
  (model: S, message: menu.Message): Update.Return<S, A> => {
    if (message._tag === 'SelectedItem' && config.isKept(message.item, message.index)) {
      return config.onSelected(message.item, message.index)(model)
    }
    if (message._tag === 'ReleasedPointerOnItems') {
      const active = config.readMenu(model).maybeActiveItemIndex
      if (Option.exists(active, (index) => config.isKept(config.items[index] ?? '', index))) {
        return { model }
      }
    }
    return config.forward(model, message)
  }

export type SubMenuConfig<S, A> = Readonly<{
  readParent: Read<S>
  writeParent: Write<S>
  readSub: Read<S>
  writeSub: Write<S>
  toParentMessage: (message: menu.Message) => A
  toSubMessage: (message: menu.Message) => A
  /** Position of the submenu row in the parent's items. */
  subIndex: number
  /** A parent row other than the submenu row was selected (the parent closed). */
  foldParentSelected: (outMessage: FoldkitMenu.OutMessage) => Update.Step<S, A>
  /** A submenu row was selected; the whole menu closes afterwards, like upstream. */
  foldSubSelected: (outMessage: FoldkitMenu.OutMessage) => Update.Step<S, A>
}>

/** Wires a parent Menu and a nested Menu into a submenu. Selecting the
 *  submenu row (click, Enter, Space) opens the submenu without ever closing the
 *  parent: `handleParent` intercepts that `SelectedItem` instead of forwarding it.
 *
 *  Slice wiring:
 *  - route the parent's and submenu's messages through `handleParent` /
 *    `handleSub` (the parent ignores the blur caused by focus entering the
 *    submenu; Escape inside the submenu closes only the submenu);
 *  - render the nested bundle as the parent row's `content` with
 *    `subViewInputs`, adding `parentKeys` / `subKeys` to the two panels;
 *  - handle the app messages those keys send with `openSub` / `closeSub`. */
export const subMenu = <S, A>(config: SubMenuConfig<S, A>) => {
  const foldParent = Update.foldChild({
    update: DemoMenu.update,
    read: (model: S) => Option.some(config.readParent(model)),
    write: config.writeParent,
    toParentMessage: config.toParentMessage,
    foldOutMessage: config.foldParentSelected,
  })

  const foldSub = Update.foldChild({
    update: DemoMenu.update,
    read: (model: S) => Option.some(config.readSub(model)),
    write: config.writeSub,
    toParentMessage: config.toSubMessage,
    foldOutMessage: (outMessage: FoldkitMenu.OutMessage): Update.Step<S, A> =>
      Update.combine([
        config.foldSubSelected(outMessage),
        (model) => foldParent(model, menu.Message.Closed()),
      ]),
  })

  const openSub: Update.Step<S, A> = (model) =>
    foldSub(model, menu.Message.Opened({ maybeActiveItemIndex: Option.some(0) }))

  // Closing quietly (no FocusButton on the nested trigger) lets focus return to
  // the parent panel, so its own keys (ArrowDown, Enter, ...) work again.
  const closeSub: Update.Step<S, A> = (model) => ({
    model: config.writeSub(model, DemoMenu.close(config.readSub(model)).model),
    commands: [
      Command.mapMessage(
        FoldkitMenu.FocusItems({ id: config.readParent(model).id }),
        config.toParentMessage,
      ),
    ],
  })

  return {
    openSub,
    closeSub,
    /** Focus leaves the parent panel for the submenu panel; that blur must not
     *  close the parent. */
    handleParent: (model: S, message: menu.Message): Update.Return<S, A> =>
      message._tag === 'SelectedItem' && message.index === config.subIndex
        ? openSub(model)
        : message._tag === 'BlurredItems' && config.readSub(model).isOpen
          ? { model }
          : foldParent(model, message),
    /** Escape inside the submenu closes only the submenu. */
    handleSub: (model: S, message: menu.Message): Update.Return<S, A> =>
      message._tag === 'Closed' ? closeSub(model) : foldSub(model, message),
    /** Parent panel: ArrowRight on the highlighted submenu row opens it (Enter,
     *  Space, and click arrive as `SelectedItem` and open it in `handleParent`). */
    parentKeys: (h: HtmlBuilder<A>, model: S, openMessage: A) =>
      childAttributes([
        h.OnKeyDownPreventDefault((key) =>
          key === 'ArrowRight' &&
          Option.exists(config.readParent(model).maybeActiveItemIndex, (i) => i === config.subIndex)
            ? Option.some(openMessage)
            : Option.none(),
        ),
      ]),
    /** Submenu panel: ArrowLeft closes it and returns focus to the parent. */
    subKeys: (h: HtmlBuilder<A>, closeMessage: A) =>
      childAttributes([
        h.OnKeyDownPreventDefault((key) =>
          key === 'ArrowLeft' ? Option.some(closeMessage) : Option.none(),
        ),
      ]),
  }
}
