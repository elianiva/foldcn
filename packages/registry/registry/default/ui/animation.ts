/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Animation from '@/components/ui/animation'`
 */
import { Animation as FoldkitAnimation } from '@foldkit/ui'
import type { ChildAttribute, Html } from 'foldkit/html'

import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Animation submodel surface.

export const init = FoldkitAnimation.init
export const update = FoldkitAnimation.update
export const view = FoldkitAnimation.view
export const Model = FoldkitAnimation.Model
export type Model = typeof Model.Type
export const Message = FoldkitAnimation.Message
export type Message = typeof Message.Type
export const OutMessage = FoldkitAnimation.OutMessage
export type OutMessage = typeof OutMessage.Type

export const TransitionState = FoldkitAnimation.TransitionState
export type TransitionState = typeof TransitionState.Type
export type Showed = FoldkitAnimation.Showed
export type Hid = FoldkitAnimation.Hid

export const WaitForPaint = FoldkitAnimation.WaitForPaint
export const WaitForAnimationSettled = FoldkitAnimation.WaitForAnimationSettled
export const defaultLeaveCommand = FoldkitAnimation.defaultLeaveCommand

export type InitConfig = FoldkitAnimation.InitConfig
export type ViewInputs = FoldkitAnimation.ViewInputs

// Mirrors the shadcn dialog enter/leave utilities (tw-animate-css):
// `animate-in`/`animate-out` keyed off the Foldkit Animation coordinator's
// `data-enter`/`data-leave` attributes (never `data-state`). `duration-200`
// matches the dialog panel and accordion 0.2s ease-out timing. The
// `fade-in-0`/`zoom-in-95` pair reproduces the reference dialog content
// animation (fade + subtle scale), decoupled from the `animateSize` grid
// height animation that the view handles via inline `grid-template-rows`.
export const animationContentClass =
  'rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm duration-200 data-[enter]:animate-in data-[enter]:fade-in-0 data-[enter]:zoom-in-95 data-[leave]:animate-out data-[leave]:fade-out-0 data-[leave]:zoom-out-95'

export type StyledViewInputs = Readonly<{
  content: Html
  className?: string
  animateSize?: boolean
  attributes?: ReadonlyArray<ChildAttribute>
  element?: ViewInputs['element']
}>

/** Build styled `Animation.ViewInputs` with foldcn's enter/leave classes. */
export const styledViewInputs = (viewInputs: StyledViewInputs): ViewInputs => ({
  content: viewInputs.content,
  className: cn(animationContentClass, viewInputs.className),
  animateSize: viewInputs.animateSize,
  attributes: viewInputs.attributes,
  element: viewInputs.element,
})
