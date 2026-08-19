import { Animation as FoldkitAnimation } from '@foldkit/ui'
import type { Html } from 'foldkit/html'

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

export type InitConfig = FoldkitAnimation.InitConfig
export type ViewInputs = FoldkitAnimation.ViewInputs

export const animationContentClass =
  'rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[closed]:opacity-0 data-[closed]:scale-95 data-[closed]:-translate-y-2 motion-reduce:transition-none motion-reduce:transform-none'

export type StyledViewInputs = Readonly<{
  content: Html
  className?: string
  animateSize?: boolean
}>

/** Build styled `Animation.ViewInputs` with foldcn's enter/leave classes. */
export const styledViewInputs = (viewInputs: StyledViewInputs): ViewInputs => ({
  content: viewInputs.content,
  className: cn(animationContentClass, viewInputs.className),
  animateSize: viewInputs.animateSize,
})
