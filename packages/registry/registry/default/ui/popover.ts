/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Popover from '@/components/ui/popover'`
 */
import { Popover as FoldkitPopover } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/popover'
import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Popover submodel surface.

export const Model = FoldkitPopover.Model
export type Model = typeof Model.Type

export const Message = FoldkitPopover.Message
export type Message = typeof Message.Type

export const OutMessage = FoldkitPopover.OutMessage
export type OutMessage = typeof OutMessage.Type

export const init = (config: InitConfig): Model =>
  FoldkitPopover.init({ isAnimated: true, ...config })
export const update = FoldkitPopover.update
export const open = FoldkitPopover.open
export const close = FoldkitPopover.close
export const buttonId = FoldkitPopover.buttonId
export const view = FoldkitPopover.view

export type InitConfig = FoldkitPopover.InitConfig
export type RenderInfo = FoldkitPopover.RenderInfo

/** Default anchor matching the shadcn reference `PopoverContent` defaults:
 *  `side="bottom"`, `sideOffset=4`, `align="center"`, `alignOffset=0`.
 *  `placement` maps side+align (a bare side centers the popover), `gap` maps
 *  sideOffset, `offset` maps alignOffset and defaults to 0. */
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

export const popoverHeaderClass = 'cn-popover-header'

export const popoverTitleClass = 'cn-popover-title'

export const popoverDescriptionClass = 'cn-popover-description'

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
    [
      h.DataAttribute('slot', 'popover-description'),
      h.Class(cn(popoverDescriptionClass, config.className)),
    ],
    children,
  )

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
 *  ("bottom-start" → "bottom"). Logical sides have no foldkit equivalent.
 *  Exported so other Popover-backed components (e.g. navigation-menu) share
 *  this mapping instead of duplicating it. */
export const placementToSide = (placement: string): string => placement.split('-')[0] || 'bottom'

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
                    h.DataAttribute('side', placementToSide(anchor.placement ?? 'bottom')),
                    h.Class(
                      cn(
                        viewInputs.isAnimated !== false
                          ? popoverContentAnimatedClass
                          : popoverContentClass,
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
