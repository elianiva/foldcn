/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update/subscriptions into your app:
 *  `import * as Resizable from '@/components/ui/resizable'`
 */
import { Option } from 'effect'
import type { Html } from 'foldkit/html'
import { defineView } from 'foldkit/submodel'

import * as ResizableBox from '@/ui/resizable-box'
import { cn } from '@/lib/utils'

// Resizable renders the styled shadcn parts (PanelGroup, Panel, Handle) over the
// ResizableBox engine. Wire it like any Submodel: `init` with the panel
// constraints, embed with `h.submodel`, lift `subscriptions`, and listen for
// `LayoutChanged` to own the split. The handle is a real pointer-drag,
// keyboard-operable separator with min/max and collapsible support.

export const Model = ResizableBox.Model
export type Model = typeof Model.Type
export const Message = ResizableBox.Message
export type Message = typeof Message.Type
export const OutMessage = ResizableBox.OutMessage
export type OutMessage = typeof OutMessage.Type

export const init = ResizableBox.init
export const update = ResizableBox.update
export const reflect = ResizableBox.reflect
export const subscriptions = ResizableBox.subscriptions
export const MeasureContainer = ResizableBox.MeasureContainer
export const layoutFromModel = ResizableBox.layoutFromModel

export type InitConfig = ResizableBox.InitConfig
export type PanelConfig = ResizableBox.PanelConfig
export type Layout = ResizableBox.Layout

/** Upstream ResizablePanelGroup string. */
export const resizablePanelGroupClass =
  'cn-resizable-panel-group flex h-full w-full aria-[orientation=vertical]:flex-col'

/** Upstream ResizablePanel carries no class of its own. */
export const resizablePanelClass = ''

/** Upstream ResizableHandle string (the emitted aria-orientation drives the
 *  perpendicular variants). */
export const resizableHandleClass =
  'cn-resizable-handle relative flex w-px items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90'

/** Upstream ResizableHandle `withHandle` grip. */
export const resizableHandleIconClass = 'cn-resizable-handle-icon z-10 flex shrink-0'

const LEFT_MOUSE_BUTTON = 0

const RESIZE_KEYS: ReadonlySet<string> = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'Enter',
])

export type ResizablePanelInput = Readonly<{
  className?: string
}>

export type ResizableHandleInput = Readonly<{
  /** Renders the centered grip (upstream `withHandle`). */
  withHandle?: boolean
  className?: string
}>

export type ViewInputs = Readonly<{
  /** One entry per panel, in the same order the panels were declared in
   *  `init`. */
  panels: ReadonlyArray<ResizablePanelInput>
  /** One entry per separator (panels minus one). */
  handles?: ReadonlyArray<ResizableHandleInput>
  /** Slot callback building the panel at `index`. Runs in the embedding
   *  boundary, so a panel may contain a nested Submodel. */
  toPanelContent: (index: number) => Html
  className?: string
  /** Accessible name for every separator. Defaults to none. */
  handleLabel?: string
}>

// The panel is the flex item that grows by its percentage; the inner wrapper
// carries the caller's class and scrolls, matching react-resizable-panels'
// own two-node structure so `h-full` content sizes predictably.
const panelStyle = (size: number): Record<string, string> => {
  // oxlint-disable-next-line anti-slop/no-known-value-widening -- SAFETY: style bag must be Record<string,string> for h.Style; literal evidence is intentionally widened to the style contract
  return {
    display: 'flex',
    'flex-basis': '0',
    'flex-grow': String(size),
    'flex-shrink': '1',
    'min-width': '0',
    'min-height': '0',
    overflow: 'visible',
  }
}

const panelContentStyle = (horizontal: boolean): Record<string, string> => {
  // oxlint-disable-next-line anti-slop/no-known-value-widening -- SAFETY: style bag must be Record<string,string> for h.Style; literal evidence is intentionally widened to the style contract
  return {
    'max-height': '100%',
    'max-width': '100%',
    'flex-grow': '1',
    overflow: 'auto',
    'touch-action': horizontal ? 'pan-y' : 'pan-x',
  }
}

const handleStyle = (horizontal: boolean): Record<string, string> => {
  // oxlint-disable-next-line anti-slop/no-known-value-widening -- SAFETY: style bag must be Record<string,string> for h.Style; literal evidence is intentionally widened to the style contract
  return {
    'flex-basis': 'auto',
    'flex-grow': '0',
    'flex-shrink': '0',
    'touch-action': 'none',
    cursor: horizontal ? 'col-resize' : 'row-resize',
  }
}

// Upstream's Group sets orientation through flex-direction, not an
// `aria-orientation` on a role-less div; the `aria-[orientation=vertical]`
// utility in the copied class string is left in place to stay byte-identical
// to upstream.
const groupStyle = (horizontal: boolean): Record<string, string> => {
  // oxlint-disable-next-line anti-slop/no-known-value-widening -- SAFETY: style bag must be Record<string,string> for h.Style; literal evidence is intentionally widened to the style contract
  return {
    'flex-direction': horizontal ? 'row' : 'column',
    overflow: 'hidden',
    'touch-action': horizontal ? 'pan-y' : 'pan-x',
  }
}

/** Renders the styled panel group with a separator between every adjacent
 *  pair. Embedded via `h.submodel`. */
export const view = defineView<Model, Message, ViewInputs>((model, viewInputs, h) => {
  const horizontal = model.orientation === 'horizontal'
  const separatorOrientation = horizontal ? 'vertical' : 'horizontal'
  const lastIndex = model.panels.length - 1

  const panel = (index: number): Html => {
    const state = model.panels[index]
    const input = viewInputs.panels[index]
    return h.div(
      [
        h.Id(ResizableBox.panelDomId(model.id, state?.id ?? '')),
        h.DataAttribute('slot', 'resizable-panel'),
        h.Style(panelStyle(state?.size ?? 0)),
      ],
      [
        h.div(
          [
            h.Class(cn(resizablePanelClass, input?.className)),
            h.Style(panelContentStyle(horizontal)),
          ],
          [viewInputs.toPanelContent(index)],
        ),
      ],
    )
  }

  const separator = (index: number): Html => {
    const aria = ResizableBox.separatorAria(model, index)
    const input = viewInputs.handles?.[index]
    return h.div(
      [
        h.Role('separator'),
        h.Tabindex(0),
        h.AriaOrientation(separatorOrientation),
        h.AriaControls(aria.valueControls),
        h.AriaValuemin(aria.valueMin),
        h.AriaValuemax(aria.valueMax),
        h.AriaValuenow(aria.valueNow),
        ...(viewInputs.handleLabel === undefined ? [] : [h.AriaLabel(viewInputs.handleLabel)]),
        h.DataAttribute('slot', 'resizable-handle'),
        h.Style(handleStyle(horizontal)),
        h.OnPointerDown((_pointerType, button, _screenX, _screenY, _timeStamp, clientX, clientY) =>
          button === LEFT_MOUSE_BUTTON
            ? Option.some(Message.PressedHandle({ handleIndex: index, clientX, clientY }))
            : Option.none(),
        ),
        h.OnKeyDownPreventDefault((key) =>
          RESIZE_KEYS.has(key)
            ? Option.some(Message.KeyedHandle({ handleIndex: index, key }))
            : Option.none(),
        ),
        h.OnDoubleClick(Message.DoubleClickedHandle({ handleIndex: index })),
        h.Class(cn(resizableHandleClass, input?.className)),
      ],
      input?.withHandle === true ? [h.div([h.Class(resizableHandleIconClass)], [])] : [],
    )
  }

  return h.div(
    [
      h.Id(model.id),
      h.Class(cn(resizablePanelGroupClass, viewInputs.className)),
      h.DataAttribute('slot', 'resizable-panel-group'),
      h.Style(groupStyle(horizontal)),
    ],
    model.panels.flatMap((_panel, index) =>
      index === lastIndex ? [panel(index)] : [panel(index), separator(index)],
    ),
  )
})
