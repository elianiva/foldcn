import { Popover as FoldkitPopover } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/popover'
import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Popover submodel surface. A hover card is a
// Popover variant with card-styled content and no arrow. (The foldkit Popover
// opens on activation rather than pointer-hover, so this mirrors the visual
// surface of shadcn's `hover-card` while reusing the popover trigger.)

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

export const HOVER_CARD_ANCHOR: AnchorConfig = {
  placement: 'bottom',
  gap: 8,
  padding: 8,
}

export const hoverCardTriggerClass =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 underline-offset-4 hover:underline'

/**
 * Derived from the shadcn v4 BASE registry:
 * apps/v4/registry/bases/base/ui/hover-card.tsx. Class strings are identical
 * to upstream; visual styling lives in the central foldcn style definition.
 *
 * foldcn gap vs upstream: Base UI backs hover-card with PreviewCard (true
 * hover-intent open/close); foldkit has no hover primitive, so this stays a
 * click-activated popover wearing the card styles. The panel emits data-side
 * derived from the anchor placement alongside foldkit's data-placement.
 */
export const hoverCardContentClass =
  'cn-hover-card-content cn-hover-card-content-logical z-50 origin-(--transform-origin) outline-hidden'

/** Kept for backward compatibility — animations now live in the token. */
export const hoverCardContentAnimatedClass = hoverCardContentClass

export const hoverCardBackdropClass = 'fixed inset-0 z-0'

export const hoverCardWrapperClass = 'relative inline-block'

export const hoverCardHeaderClass = 'cn-popover-header flex flex-col gap-1'

export const hoverCardTitleClass = 'cn-popover-title font-medium'

export const hoverCardDescriptionClass = 'cn-popover-description text-muted-foreground'

// --- Composable sub-components ---

type StyleConfig = Readonly<{ className?: string }>

export const header = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => h.div([h.Class(cn(hoverCardHeaderClass, config.className))], children)

export const title = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => h.div([h.Class(cn(hoverCardTitleClass, config.className))], children)

export const description = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => h.p([h.Class(cn(hoverCardDescriptionClass, config.className))], children)

// --- styledViewInputs factory ---

export type StyledViewInputs = Readonly<{
  anchor?: AnchorConfig
  trigger: Child
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
  isAnimated?: boolean
}>

/** Build styled `Popover.ViewInputs` for a hover card. */
export const styledViewInputs = <M>(
  viewInputs: StyledViewInputs,
  h: HtmlBuilder<M>,
): FoldkitPopover.ViewInputs => {
  const anchor = { ...HOVER_CARD_ANCHOR, ...viewInputs.anchor }
  const side = (anchor.placement ?? 'bottom').split('-')[0] || 'bottom'
  return {
    anchor,
  isDisabled: viewInputs.isDisabled,
  focusSelector: viewInputs.focusSelector,
  ariaLabel: viewInputs.ariaLabel,
  ariaLabelledBy: viewInputs.ariaLabelledBy,
  toView: ({ button, panel, backdrop, isVisible }) =>
    h.div(
      [h.Class(cn(hoverCardWrapperClass, viewInputs.wrapperClass)), h.DataAttribute('slot', 'hover-card')],
      [
        h.button(
          [
            ...button,
            h.Class(cn(hoverCardTriggerClass, viewInputs.triggerClass)),
            h.DataAttribute('slot', 'hover-card-trigger'),
          ],
          [viewInputs.trigger],
        ),
        ...(isVisible
          ? [
              h.div([...backdrop, h.Class(cn(hoverCardBackdropClass, viewInputs.backdropClass))]),
              h.div(
                [
                  ...panel,
                  h.Class(
                    cn(
                      viewInputs.isAnimated !== false
                        ? hoverCardContentAnimatedClass
                        : hoverCardContentClass,
                      viewInputs.contentClass,
                    ),
                  ),
                  h.DataAttribute('slot', 'hover-card-content'),
                  h.DataAttribute('side', side),
                ],
                viewInputs.content,
              ),
            ]
          : []),
      ],
    ),
  }
}
