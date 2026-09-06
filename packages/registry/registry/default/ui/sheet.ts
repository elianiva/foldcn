/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Sheet from '@/components/ui/sheet'`
 */
import { Dialog as FoldkitDialog } from '@foldkit/ui'
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

export const init = (config: InitConfig): Model =>
  FoldkitDialog.init({ isAnimated: true, ...config })
export const update = FoldkitDialog.update
export const open = FoldkitDialog.open
export const close = FoldkitDialog.close
export const titleId = FoldkitDialog.titleId
export const descriptionId = FoldkitDialog.descriptionId
export const view = FoldkitDialog.view

export type InitConfig = FoldkitDialog.InitConfig
export type RenderInfo = FoldkitDialog.RenderInfo
export type ViewInputs = FoldkitDialog.ViewInputs

// foldkit delta: upstream keys enter/exit motion on
// data-starting-style/data-ending-style, which foldkit cannot emit — the
// equivalent declarations are inlined under data-enter/data-leave,
// and the panel emits data-side (from the `side` view input).

export type SheetSide = 'top' | 'bottom' | 'left' | 'right'

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

type StyleConfig<M> = Readonly<{
  className?: string
  /** Submodel-provided attributes (from the `styledViewInputs` content
   *  callback render bundle) to merge onto the element. */
  attributes?: ReadonlyArray<Attribute<M> | ChildAttribute>
}>

export const header = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'sheet-header'), h.Class(cn(sheetHeaderClass, config.className))],
    children,
  )

export const title = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.h2(
    [
      ...(config.attributes ?? []),
      h.DataAttribute('slot', 'sheet-title'),
      h.Class(cn(sheetTitleClass, config.className)),
    ],
    children,
  )

export const description = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.p(
    [
      ...(config.attributes ?? []),
      h.DataAttribute('slot', 'sheet-description'),
      h.Class(cn(sheetDescriptionClass, config.className)),
    ],
    children,
  )

export const footer = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'sheet-footer'), h.Class(cn(sheetFooterClass, config.className))],
    children,
  )

export const closeButton = <M>(
  config: StyleConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.button(
    [
      ...(config.attributes ?? []),
      h.DataAttribute('slot', 'sheet-close'),
      h.Class(cn(sheetCloseButtonClass, config.className)),
    ],
    children,
  )

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
  /** Extra attributes merged onto the panel (e.g. data-mobile for sidebar). */
  panelAttributes?: ReadonlyArray<Attribute<M> | ChildAttribute>
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
        [
          ...dialog,
          h.DataAttribute('slot', 'sheet'),
          h.Class(cn('bg-transparent p-0 open:block', viewInputs.className)),
        ],
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
                  ...(viewInputs.panelAttributes ?? []),
                ],
                viewInputs.content({ closeButton, title, description }, h),
              ),
            ]
          : [],
      ),
  }
}
