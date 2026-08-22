import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

type Child = Html | string

// Resizable is a two-pane split with a draggable handle. The handle carries a
// visually hidden range input so the split stays accessible and keyboard
// operable; `onValueChange` reports the first pane's size as a percentage.
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/resizable.tsx. Class strings are identical
// to upstream; visual styling lives in the central foldcn style definition
// (cn-resizable-panel-group / cn-resizable-handle are intentional no-op
// hooks upstream — the effective classes are the literal strings).
//
// foldcn gaps vs upstream: fixed two panes (no N panels), no min/max/collapse
// constraints, no autoSaveId persistence; the handle is a range input rather
// than a pointer-drag separator.

export const resizableContainerClass =
  'cn-resizable-panel-group flex h-full w-full aria-[orientation=vertical]:flex-col'

export const resizableContainerVerticalClass = resizableContainerClass

export const resizablePanelClass = 'overflow-auto'

/** Upstream Separator string (aria-[orientation] variants key on the emitted
 *  aria-orientation attr). */
export const resizableHandleClass =
  'cn-resizable-handle relative flex w-px items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90'

export const resizableHandleHorizontalClass = ''

export const resizableHandleVerticalClass = ''

export type ResizablePane = Readonly<{ content: Child; className?: string }>

export type ResizableConfig<M> = Readonly<{
  value: number
  onValueChange?: (value: number) => M
  direction?: 'horizontal' | 'vertical'
  firstPane: ResizablePane
  secondPane: ResizablePane
  className?: string
}>

/** A two-pane layout with a draggable split handle. */
export const resizable = <M>(config: ResizableConfig<M>, h: HtmlBuilder<M>): Html => {
  const isHorizontal = (config.direction ?? 'horizontal') === 'horizontal'
  const firstStyle: Record<string, string> = isHorizontal ? { width: `${config.value}%` } : { height: `${config.value}%` }
  const secondStyle: Record<string, string> = isHorizontal
    ? { width: `${100 - config.value}%` }
    : { height: `${100 - config.value}%` }
  const handle = h.div(
    [
      h.Class(
        cn(
          resizableHandleClass,
          isHorizontal ? resizableHandleHorizontalClass : resizableHandleVerticalClass,
        ),
      ),
      h.AriaOrientation(isHorizontal ? 'vertical' : 'horizontal'),
      h.DataAttribute('slot', 'resizable-handle'),
    ],
    [
      h.input([
        h.Type('range'),
        h.Min('0'),
        h.Max('100'),
        h.Step('1'),
        h.Value(String(config.value)),
        ...(config.onValueChange === undefined
          ? []
          : [h.OnInput((raw) => config.onValueChange!(Number(raw)))]),
        h.AriaLabel('Resize panels'),
        h.Class(
          cn(
            'absolute inset-0 opacity-0',
            isHorizontal ? 'h-full w-full cursor-col-resize' : 'h-full w-full cursor-row-resize',
          ),
        ),
      ]),
    ],
  )
  return h.div(
    [
      h.Class(
        cn(isHorizontal ? resizableContainerClass : resizableContainerVerticalClass, config.className),
      ),
      h.DataAttribute('slot', 'resizable'),
    ],
    [
      h.div(
        [h.Style(firstStyle), h.Class(cn(resizablePanelClass, config.firstPane.className)), h.DataAttribute('slot', 'resizable-panel')],
        [config.firstPane.content],
      ),
      handle,
      h.div(
        [h.Style(secondStyle), h.Class(cn(resizablePanelClass, config.secondPane.className)), h.DataAttribute('slot', 'resizable-panel')],
        [config.secondPane.content],
      ),
    ],
  )
}
