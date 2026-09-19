/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as AlertDialog from '@/components/ui/alert-dialog'`
 */
import { Dialog as FoldkitDialog } from '@foldkit/ui'
import type { Attribute, ChildAttribute, Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Dialog submodel surface. An alert dialog is a
// Dialog variant: same headless behavior, destructive-confirm styling.
//
// foldcn gaps vs upstream: no Media part slot wiring in styledViewInputs
// (use AlertDialog.media inside content), and Action/Cancel compose Button
// tokens instead of rendering the Button component.

export const Model = FoldkitDialog.Model
export type Model = typeof Model.Type

export const Message = FoldkitDialog.Message
export type Message = typeof Message.Type

export const OutMessage = FoldkitDialog.OutMessage
export type OutMessage = typeof OutMessage.Type

export const init = (config: InitConfig): Model =>
  FoldkitDialog.init({ isAnimated: true, ...config })
/** Starts open; fold the result into the parent with Update.foldChildInit. */
export const boot = (config: InitConfig) => FoldkitDialog.boot({ isAnimated: true, ...config })
export const update = FoldkitDialog.update
export const open = FoldkitDialog.open
export const close = FoldkitDialog.close
export const titleId = FoldkitDialog.titleId
export const descriptionId = FoldkitDialog.descriptionId
export const view = FoldkitDialog.view

export type InitConfig = FoldkitDialog.InitConfig
export type RenderInfo = FoldkitDialog.RenderInfo

/** foldkit delta: host <dialog> element chrome (upstream Root renders
 *  nothing). See dialog.ts. */
export const alertDialogClass = 'bg-transparent p-0 open:flex items-center justify-center'

export const alertDialogBackdropClass = 'cn-alert-dialog-overlay fixed inset-0 isolate z-50'

/** Upstream content string. The `data-size` attr ("default" | "sm") keys the
 *  cn-alert-dialog-content token's max-width variants. */
export const alertDialogPanelClass =
  'cn-alert-dialog-content group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none'

export const alertDialogMediaClass = 'cn-alert-dialog-media'

export const alertDialogTitleClass = 'cn-alert-dialog-title cn-font-heading'

export const alertDialogDescriptionClass = 'cn-alert-dialog-description'

export const alertDialogHeaderClass = 'cn-alert-dialog-header'

export const alertDialogFooterClass =
  'cn-alert-dialog-footer flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end'

/** Upstream renders Cancel via `<Button variant="outline" size="default">`. */
export const alertDialogCancelClass =
  'cn-button cn-button-variant-outline cn-button-size-default cn-alert-dialog-cancel'

/** Upstream renders Action via `<Button>` (default variant). */
export const alertDialogActionClass =
  'cn-button cn-button-variant-default cn-button-size-default cn-alert-dialog-action'

/** foldcn extra (upstream alert-dialog has no close X): ghost icon button,
 *  kept for backward compatibility with the closeButton helper. */
export const alertDialogCloseButtonClass =
  'cn-button cn-button-variant-ghost cn-button-size-icon-sm'

type StyleConfig<M> = Readonly<{
  className?: string
  /** Submodel-provided attributes (from the `styledViewInputs` content
   *  callback render bundle) to merge onto the element. */
  attributes?: ReadonlyArray<Attribute<M> | ChildAttribute>
}>

/** Alert dialog header wrapper. */
export const header = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'alert-dialog-header'),
      h.Class(cn(alertDialogHeaderClass, config.className)),
    ],
    children,
  )

/** Media slot — icon/media area above the title (upstream AlertDialogMedia). */
export const media = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'alert-dialog-media'),
      h.Class(cn(alertDialogMediaClass, config.className)),
    ],
    children,
  )

/** Alert dialog title — merges with the submodel's title attributes. */
export const title = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.h2(
    [
      ...(config.attributes ?? []),
      h.DataAttribute('slot', 'alert-dialog-title'),
      h.Class(cn(alertDialogTitleClass, config.className)),
    ],
    children,
  )

/** Alert dialog description — merges with the submodel's description attributes. */
export const description = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.p(
    [
      ...(config.attributes ?? []),
      h.DataAttribute('slot', 'alert-dialog-description'),
      h.Class(cn(alertDialogDescriptionClass, config.className)),
    ],
    children,
  )

/** Alert dialog footer wrapper. */
export const footer = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'alert-dialog-footer'),
      h.Class(cn(alertDialogFooterClass, config.className)),
    ],
    children,
  )

/** Close button — merges with the submodel's closeButton attributes. */
export const closeButton = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.button(
    [
      ...(config.attributes ?? []),
      h.DataAttribute('slot', 'alert-dialog-close'),
      h.Class(cn(alertDialogCloseButtonClass, config.className)),
    ],
    children,
  )

/** Destructive action button. Pass the submodel's `closeButton` attributes
 *  via `attributes` so a confirm also dismisses the dialog. */
export const actionButton = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.button(
    [
      ...(config.attributes ?? []),
      h.DataAttribute('slot', 'alert-dialog-action'),
      h.Class(cn(alertDialogActionClass, config.className)),
    ],
    children,
  )

/** Secondary cancel button. */
export const cancelButton = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.button(
    [
      ...(config.attributes ?? []),
      h.DataAttribute('slot', 'alert-dialog-cancel'),
      h.Class(cn(alertDialogCancelClass, config.className)),
    ],
    children,
  )

export type AlertDialogContent<M> = Readonly<{
  closeButton: ReadonlyArray<Attribute<M> | ChildAttribute>
  title: ReadonlyArray<Attribute<M> | ChildAttribute>
  description: ReadonlyArray<Attribute<M> | ChildAttribute>
}>

export type StyledViewInputs<M> = Readonly<{
  /** Set when content renders the description element. */
  hasDescription?: boolean
  content: (render: AlertDialogContent<M>, h: HtmlBuilder<M>) => ReadonlyArray<Child>
  className?: string
  backdropClass?: string
  panelClass?: string
  /** Upstream Content `size` prop ("default" | "sm"); keys the panel token's
   *  max-width variants via data-size. */
  size?: 'default' | 'sm'
}>

/** Build styled `Dialog.ViewInputs` for an alert dialog. Pass your view's `h`
 *  so the content callback can dispatch your own messages. */
export const styledViewInputs = <M>(
  viewInputs: StyledViewInputs<M>,
  h: HtmlBuilder<M>,
): FoldkitDialog.ViewInputs => ({
  hasDescription: viewInputs.hasDescription,
  toView: ({ dialog, backdrop, panel, closeButton, title, description, isVisible }) =>
    h.dialog(
      [
        ...dialog,
        h.DataAttribute('slot', 'alert-dialog'),
        h.Class(cn(alertDialogClass, viewInputs.className)),
      ],
      isVisible
        ? [
            h.div([
              ...backdrop,
              h.DataAttribute('slot', 'alert-dialog-overlay'),
              h.Class(cn(alertDialogBackdropClass, viewInputs.backdropClass)),
            ]),
            h.div(
              [
                ...panel,
                h.DataAttribute('slot', 'alert-dialog-content'),
                h.DataAttribute('size', viewInputs.size ?? 'default'),
                h.Class(cn(alertDialogPanelClass, viewInputs.panelClass)),
              ],
              viewInputs.content({ closeButton, title, description }, h),
            ),
          ]
        : [],
    ),
})
