import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

/** Bubble variant keys. Sync with `bubbleVariants` is compiler-enforced:
 *  `bubbleVariants` is `Record<BubbleVariant, string>` (missing key = error)
 *  and annotated object literals reject unknown keys. */
export const bubbleVariantKeys = [
  'default',
  'secondary',
  'muted',
  'tinted',
  'outline',
  'ghost',
  'destructive',
] as const

export type BubbleVariant = (typeof bubbleVariantKeys)[number]

export const bubbleVariants: Record<BubbleVariant, string> = {
  default: 'cn-bubble-variant-default',
  secondary: 'cn-bubble-variant-secondary',
  muted: 'cn-bubble-variant-muted',
  tinted: 'cn-bubble-variant-tinted',
  outline: 'cn-bubble-variant-outline',
  ghost: 'cn-bubble-variant-ghost',
  destructive: 'cn-bubble-variant-destructive',
}

export type BubbleAlign = 'start' | 'end'

export type BubbleReactionsSide = 'top' | 'bottom'

export const bubbleClass = 'cn-bubble group/bubble relative flex w-fit min-w-0 flex-col'

export const bubbleGroupClass = 'cn-bubble-group flex min-w-0 flex-col'

export const bubbleContentClass =
  'cn-bubble-content w-fit max-w-full min-w-0 overflow-hidden wrap-break-word [button]:text-left [button,a]:transition-colors'

export const bubbleReactionsClass =
  'cn-bubble-reactions absolute z-10 flex w-fit items-center justify-center'

export const bubbleReactionsSideClasses: Record<BubbleReactionsSide, string> = {
  top: 'cn-bubble-reactions-side-top',
  bottom: 'cn-bubble-reactions-side-bottom',
}

export const bubbleReactionsAlignClasses: Record<BubbleAlign, string> = {
  start: 'cn-bubble-reactions-align-start',
  end: 'cn-bubble-reactions-align-end',
}

type BubbleConfig = Readonly<{
  className?: string
  variant?: BubbleVariant
  align?: BubbleAlign
}>

const bubbleGroup = <M>(
  config: Readonly<{ className?: string }>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class(cn(bubbleGroupClass, config.className)), h.DataAttribute('slot', 'bubble-group')],
    children,
  )

const bubbleContainer = <M>(
  config: BubbleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(bubbleClass, bubbleVariants[config.variant ?? 'default'], config.className)),
      h.DataAttribute('slot', 'bubble'),
      h.DataAttribute('variant', config.variant ?? 'default'),
      h.DataAttribute('align', config.align ?? 'start'),
    ],
    children,
  )

export type BubbleContentConfig<M> = Readonly<{
  className?: string
  /** Element to render as — foldcn's stand-in for upstream's `useRender`
   *  `render` prop. Button/anchor bubbles keep the same content classes,
   *  including the variant hover state keyed on the content element itself. */
  as?: 'div' | 'button' | 'a'
  /** Click message when rendered `as: 'button'`. */
  onClick?: M
  /** Extra attributes merged onto the content element (href, labels, …). */
  attributes?: ReadonlyArray<Attribute<M>>
}>

const bubbleContent = <M>(
  config: BubbleContentConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => {
  const attributes: ReadonlyArray<Attribute<M>> = [
    h.Class(cn(bubbleContentClass, config.className)),
    h.DataAttribute('slot', 'bubble-content'),
    ...(config.attributes ?? []),
  ]
  if (config.as === 'button')
    return h.button(
      [...attributes, ...(config.onClick ? [h.OnClick(config.onClick)] : [])],
      children,
    )
  if (config.as === 'a') return h.a(attributes, children)
  return h.div(attributes, children)
}

export type BubbleReactionsConfig<M> = Readonly<{
  side?: BubbleReactionsSide
  align?: BubbleAlign
  className?: string
  /** Extra attributes merged onto the reactions element (role, labels, …). */
  attributes?: ReadonlyArray<Attribute<M>>
}>

const bubbleReactions = <M>(
  config: BubbleReactionsConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => {
  const side = config.side ?? 'bottom'
  const align = config.align ?? 'end'
  return h.div(
    [
      h.Class(
        cn(
          bubbleReactionsClass,
          bubbleReactionsSideClasses[side],
          bubbleReactionsAlignClasses[align],
          config.className,
        ),
      ),
      h.DataAttribute('slot', 'bubble-reactions'),
      h.DataAttribute('align', align),
      h.DataAttribute('side', side),
    ],
    children,
  )
}

/** Styled chat bubble — `Bubble.group`, `Bubble.content` and
 *  `Bubble.reactions` sub-builders. Mirrors the shadcn v4 `bubble.tsx`. */
export const Bubble = Object.assign(bubbleContainer, {
  group: bubbleGroup,
  content: bubbleContent,
  reactions: bubbleReactions,
})
