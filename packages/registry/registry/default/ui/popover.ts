import { Popover as FoldkitPopover } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/popover'
import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Popover submodel surface.
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/popover.tsx. Class strings are identical to
// upstream; visual styling lives in the central foldcn style definition (enter/leave
// animations are pre-transformed there). The panel emits data-side derived
// from the anchor placement alongside foldkit's data-placement.

export const Model = FoldkitPopover.Model
export type Model = typeof Model.Type

export const Message = FoldkitPopover.Message
export type Message = typeof Message.Type

export const OutMessage = FoldkitPopover.OutMessage
export type OutMessage = typeof OutMessage.Type

export const init = (config: InitConfig): Model => FoldkitPopover.init({ isAnimated: true, ...config })
export const update = FoldkitPopover.update
export const open = FoldkitPopover.open
export const close = FoldkitPopover.close
export const buttonId = FoldkitPopover.buttonId
export const view = FoldkitPopover.view

export type InitConfig = FoldkitPopover.InitConfig
export type RenderInfo = FoldkitPopover.RenderInfo

// --- Class constants ---

export const POPOVER_ANCHOR: AnchorConfig = {
  placement: 'bottom',
  gap: 4,
  padding: 8,
}

export const popoverTriggerClass =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

/** Upstream PopoverContent string; enter/leave animations come baked into
 *  the cn-popover-content token (sync-script transform). */
export const popoverContentClass =
  'cn-popover-content cn-popover-content-logical z-50 w-72 origin-(--transform-origin) outline-hidden'

/** Kept for backward compatibility — animations now live in the token, so
 *  this matches `popoverContentClass`. */
export const popoverContentAnimatedClass = popoverContentClass

export const popoverBackdropClass = 'fixed inset-0 z-0'

export const popoverWrapperClass = 'relative inline-block'

export const popoverHeaderClass = 'flex flex-col gap-1 text-sm'

export const popoverTitleClass = 'font-medium'

export const popoverDescriptionClass = 'text-sm text-muted-foreground'

// --- Composable sub-components ---
//
// Use inside `styledViewInputs` content arrays:
//
//   content: [
//     Popover.header({}, [
//       Popover.title({}, ['Title'], h),
//       Popover.description({}, ['Subtitle'], h),
//     ], h),
//     h.p([], ['Custom content']),
//   ]

type StyleConfig = Readonly<{ className?: string }>

/** Popover header wrapper. */
export const header = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'popover-header'), h.Class(cn(popoverHeaderClass, config.className))],
    children,
  )

/** Popover title. */
export const title = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'popover-title'), h.Class(cn(popoverTitleClass, config.className))],
    children,
  )

/** Popover description. */
export const description = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.p(
    [h.DataAttribute('slot', 'popover-description'), h.Class(cn(popoverDescriptionClass, config.className))],
    children,
  )

// --- styledViewInputs factory ---

export type PopoverContent = Readonly<{
  button: ReadonlyArray<Child>
  isVisible: boolean
}>

export type StyledViewInputs = Readonly<{
  anchor?: AnchorConfig
  /** Trigger button label. */
  trigger: Child
  /** Panel content. */
  content: ReadonlyArray<Child>
  isDisabled?: boolean
  focusSelector?: string
  ariaLabel?: string
  ariaLabelledBy?: string
  className?: string
  triggerClass?: string
  contentClass?: string
  backdropClass?: string
  wrapperClass?: string
  /** When true, apply enter/leave transition classes on the panel. */
  isAnimated?: boolean
}>

/** Derives upstream's data-side from a foldkit anchor placement
 *  ("bottom-start" → "bottom"). Logical sides have no foldkit equivalent. */
const placementToSide = (placement: string): string => placement.split('-')[0] || 'bottom'

/** Build styled `Popover.ViewInputs`. Pass your view's `h` so the trigger
 *  and content can dispatch your app's own messages. */
export const styledViewInputs = <M>(
  viewInputs: StyledViewInputs,
  h: HtmlBuilder<M>,
): FoldkitPopover.ViewInputs => {
  const anchor = { ...POPOVER_ANCHOR, ...viewInputs.anchor }
  return {
  anchor,
  isDisabled: viewInputs.isDisabled,
  focusSelector: viewInputs.focusSelector,
  ariaLabel: viewInputs.ariaLabel,
  ariaLabelledBy: viewInputs.ariaLabelledBy,
  toView: ({ button, panel, backdrop, isVisible }) =>
    h.div(
      [
        h.Class(cn(popoverWrapperClass, viewInputs.wrapperClass)),
        h.DataAttribute('slot', 'popover'),
      ],
      [
        h.button(
          [
            ...button,
            h.Class(cn(popoverTriggerClass, viewInputs.triggerClass)),
            h.DataAttribute('slot', 'popover-trigger'),
          ],
          [viewInputs.trigger],
        ),
        ...(isVisible
          ? [
              h.div([...backdrop, h.Class(cn(popoverBackdropClass, viewInputs.backdropClass))]),
              h.div(
                [
                  ...panel,
                  h.DataAttribute('slot', 'popover-content'),
                  h.DataAttribute(
                    'side',
                    placementToSide(anchor.placement ?? 'bottom'),
                  ),
                  h.Class(
                    cn(
                      viewInputs.isAnimated !== false ? popoverContentAnimatedClass : popoverContentClass,
                      viewInputs.contentClass,
                    ),
                  ),
                ],
                viewInputs.content,
              ),
            ]
          : []),
      ],
    ),
  }
}
