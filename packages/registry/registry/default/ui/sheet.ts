import { Dialog as FoldkitDialog } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/anchor'
import type { Attribute, ChildAttribute, Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Dialog submodel surface. A sheet is a Dialog
// variant anchored to an edge of the viewport instead of centered.

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

// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/sheet.tsx. Class strings are identical to
// upstream; visual styling lives in the central foldcn style definition.
//
// foldkit delta: upstream keys enter/exit motion on
// data-starting-style/data-ending-style, which foldkit cannot emit — the
// equivalent declarations are inlined under data-enter/data-leave,
// and the panel emits data-side (derived from the anchor placement).

// --- Sides ---

export type SheetSide = 'top' | 'bottom' | 'left' | 'right'

export const SHEET_ANCHOR: Readonly<Record<SheetSide, AnchorConfig>> = {
  top: { placement: 'top', gap: 0, padding: 0 },
  bottom: { placement: 'bottom', gap: 0, padding: 0 },
  left: { placement: 'left', gap: 0, padding: 0 },
  right: { placement: 'right', gap: 0, padding: 0 },
}

/** Upstream SheetContent string. Positioning comes from the cn-sheet-content
 *  token keyed on the emitted data-side attribute. */
export const sheetPanelClass: Readonly<Record<SheetSide, string>> = {
  top: 'cn-sheet-content',
  bottom: 'cn-sheet-content',
  left: 'cn-sheet-content',
  right: 'cn-sheet-content',
}

/** Upstream motion classes (data-starting-style/data-ending-style variants);
 *  foldkit equivalents are added to the same tokens at style resolution. */
export const sheetMotionClass =
  'data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem]'

export const sheetBackdropClass =
  'cn-sheet-overlay fixed inset-0 z-50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0'

export const sheetHeaderClass = 'cn-sheet-header flex flex-col'

export const sheetFooterClass = 'cn-sheet-footer mt-auto flex flex-col'

export const sheetTitleClass = 'cn-sheet-title cn-font-heading'

export const sheetDescriptionClass = 'cn-sheet-description'

/** Upstream renders close via `<Button variant="ghost" size="icon-sm">`. */
export const sheetCloseButtonClass =
  'cn-button cn-button-variant-ghost cn-button-size-icon-sm cn-sheet-close'

// --- Composable sub-components ---

type StyleConfig = Readonly<{ className?: string }>

export const header = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'sheet-header'), h.Class(cn(sheetHeaderClass, config.className))],
    children,
  )

export const title = <M>(
  attributes: ReadonlyArray<Attribute<M> | ChildAttribute>,
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.h2(
    [...attributes, h.DataAttribute('slot', 'sheet-title'), h.Class(cn(sheetTitleClass, config.className))],
    children,
  )

export const description = <M>(
  attributes: ReadonlyArray<Attribute<M> | ChildAttribute>,
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.p(
    [
      ...attributes,
      h.DataAttribute('slot', 'sheet-description'),
      h.Class(cn(sheetDescriptionClass, config.className)),
    ],
    children,
  )

export const footer = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'sheet-footer'), h.Class(cn(sheetFooterClass, config.className))],
    children,
  )

export const closeButton = <M>(
  attributes: ReadonlyArray<Attribute<M> | ChildAttribute>,
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.button(
    [...attributes, h.DataAttribute('slot', 'sheet-close'), h.Class(cn(sheetCloseButtonClass, config.className))],
    children,
  )

// --- styledViewInputs factory ---

export type SheetContent<M> = Readonly<{
  closeButton: ReadonlyArray<Attribute<M> | ChildAttribute>
  title: ReadonlyArray<Attribute<M> | ChildAttribute>
  description: ReadonlyArray<Attribute<M> | ChildAttribute>
}>

export type StyledViewInputs<M> = Readonly<{
  side?: SheetSide
  content: (render: SheetContent<M>, h: HtmlBuilder<M>) => ReadonlyArray<Child>
  className?: string
  backdropClass?: string
  panelClass?: string
}>

/** Build styled `Dialog.ViewInputs` for a sheet. Defaults to a right-side panel. */
export const styledViewInputs = <M>(
  viewInputs: StyledViewInputs<M>,
  h: HtmlBuilder<M>,
): FoldkitDialog.ViewInputs => {
  const side = viewInputs.side ?? 'right'
  return {
    toView: ({ dialog, backdrop, panel, closeButton, title, description, isVisible }) =>
      h.dialog(
        [...dialog, h.Class(cn('bg-transparent p-0 open:block', viewInputs.className))],
        isVisible
          ? [
              h.div([
                ...backdrop,
                h.DataAttribute('slot', 'sheet-overlay'),
                h.Class(cn(sheetBackdropClass, viewInputs.backdropClass)),
              ]),
              h.div(
                [
                  ...panel,
                  h.DataAttribute('slot', 'sheet-content'),
                  h.DataAttribute('side', side),
                  h.Class(cn(sheetPanelClass[side], sheetMotionClass, viewInputs.panelClass)),
                ],
                viewInputs.content({ closeButton, title, description }, h),
              ),
            ]
          : [],
      )
  }
}
