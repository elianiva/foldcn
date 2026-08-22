import { Dialog as FoldkitDialog } from '@foldkit/ui'
import type { Attribute, ChildAttribute, Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Dialog submodel surface so a foldcn Dialog is a
// drop-in for wiring `h.submodel`.

export const Model = FoldkitDialog.Model
export type Model = typeof Model.Type

export const Message = FoldkitDialog.Message
export type Message = typeof Message.Type

export const OutMessage = FoldkitDialog.OutMessage
export type OutMessage = typeof OutMessage.Type

export const init = (config: InitConfig): Model => FoldkitDialog.init({ isAnimated: true, ...config })
export const update = FoldkitDialog.update
export const open = FoldkitDialog.open
export const close = FoldkitDialog.close
export const titleId = FoldkitDialog.titleId
export const descriptionId = FoldkitDialog.descriptionId
export const view = FoldkitDialog.view

export type InitConfig = FoldkitDialog.InitConfig
export type RenderInfo = FoldkitDialog.RenderInfo

// --- Class constants ---
//
// Derived from the shadcn v4 BASE registry: apps/v4/registry/bases/base/ui/dialog.tsx.
// Keep the class strings identical to upstream — visual styling lives in the central foldcn style definition . See docs/deriving-from-base.md.

/** foldkit delta: the host <dialog> element's own chrome (upstream Root renders
 *  nothing). Backdrop/panel are fixed-position; this only neutralizes the
 *  native dialog box. */
export const dialogClass = 'bg-transparent p-0 open:flex items-center justify-center'

// The @foldkit/ui Dialog defers Animation submodel attributes onto the
// backdrop/panel elements: `data-enter` while entering, `data-leave` while
// leaving (never `data-state`). The sync script rewrites upstream's
// `data-open:`/`data-closed:` animation utilities to these windows during token
// sync; persistent `data-open:` styling passes through untouched.
export const dialogBackdropClass = 'cn-dialog-overlay fixed inset-0 isolate z-50'

export const dialogPanelClass =
  'cn-dialog-content fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none'

/** Upstream renders its close control as `<Button variant="ghost" size="icon-sm"
 *  className="cn-dialog-close">`; compose the same tokens here. */
export const dialogCloseButtonClass =
  'cn-button cn-button-variant-ghost cn-button-size-icon-sm cn-dialog-close'

export const dialogTitleClass = 'cn-dialog-title cn-font-heading'

export const dialogDescriptionClass = 'cn-dialog-description'

export const dialogHeaderClass = 'cn-dialog-header flex flex-col'

export const dialogFooterClass = 'cn-dialog-footer flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'

// --- Composable sub-components ---
//
// These abstract away element types, base classes, and attribute spreading.
// Use inside `styledViewInputs` content callbacks:
//
//   content: (render, h) => [
//     Dialog.header({}, [
//       Dialog.title(render.title, {}, ['Title'], h),
//       Dialog.description(render.description, {}, ['Subtitle'], h),
//     ], h),
//     Dialog.content({}, [/* ... */], h),
//     Dialog.footer({}, [button(...)], h),
//   ]

type StyleConfig = Readonly<{ className?: string }>

/** Dialog header wrapper. */
export const header = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.DataAttribute('slot', 'dialog-header'), h.Class(cn(dialogHeaderClass, config.className))], children)

/** Dialog title — merges with the submodel's title attributes. */
export const title = <M>(
  attributes: ReadonlyArray<Attribute<M> | ChildAttribute>,
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.h2(
    [...attributes, h.DataAttribute('slot', 'dialog-title'), h.Class(cn(dialogTitleClass, config.className))],
    children,
  )

/** Dialog description — merges with the submodel's description attributes. */
export const description = <M>(
  attributes: ReadonlyArray<Attribute<M> | ChildAttribute>,
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.p(
    [
      ...attributes,
      h.DataAttribute('slot', 'dialog-description'),
      h.Class(cn(dialogDescriptionClass, config.className)),
    ],
    children,
  )

/** Dialog footer wrapper. */
export const footer = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.DataAttribute('slot', 'dialog-footer'), h.Class(cn(dialogFooterClass, config.className))], children)

/** Close button — merges with the submodel's closeButton attributes. */
export const closeButton = <M>(
  attributes: ReadonlyArray<Attribute<M> | ChildAttribute>,
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.button(
    [...attributes, h.DataAttribute('slot', 'dialog-close'), h.Class(cn(dialogCloseButtonClass, config.className))],
    children,
  )

// --- styledViewInputs factory ---

export type DialogContent<M> = Readonly<{
  closeButton: ReadonlyArray<Attribute<M> | ChildAttribute>
  title: ReadonlyArray<Attribute<M> | ChildAttribute>
  description: ReadonlyArray<Attribute<M> | ChildAttribute>
}>

export type StyledViewInputs<M> = Readonly<{
  /** Panel content. Receives the close-button, title and description
   *  attribute bundles to spread onto your own elements, or pass to
   *  Dialog.title / Dialog.description / Dialog.closeButton helpers. */
  content: (render: DialogContent<M>, h: HtmlBuilder<M>) => ReadonlyArray<Child>
  className?: string
  backdropClass?: string
  panelClass?: string
}>

/** Build styled `Dialog.ViewInputs`. Pass your view's `h` so the content
 *  callback can dispatch your app's own messages (e.g. a destructive
 *  action button next to the dialog's `closeButton`). */
export const styledViewInputs = <M>(
  viewInputs: StyledViewInputs<M>,
  h: HtmlBuilder<M>,
): FoldkitDialog.ViewInputs => ({
  toView: ({ dialog, backdrop, panel, closeButton, title, description, isVisible }) =>
    h.dialog(
      [...dialog, h.DataAttribute('slot', 'dialog'), h.Class(cn(dialogClass, viewInputs.className))],
      isVisible
        ? [
            h.div([
              ...backdrop,
              h.DataAttribute('slot', 'dialog-overlay'),
              h.Class(cn(dialogBackdropClass, viewInputs.backdropClass)),
            ]),
            h.div(
              [
                ...panel,
                h.DataAttribute('slot', 'dialog-content'),
                h.Class(cn(dialogPanelClass, viewInputs.panelClass)),
              ],
              viewInputs.content({ closeButton, title, description }, h),
            ),
          ]
        : [],
    ),
})
