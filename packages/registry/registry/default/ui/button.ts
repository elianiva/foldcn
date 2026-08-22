import { Button as FoldkitButton } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

/**
 * Derived from the shadcn v4 BASE registry: apps/v4/registry/bases/base/ui/button.tsx.
 * Keep the class strings identical to upstream — visual styling lives in the central foldcn style definition . See docs/deriving-from-base.md.
 */

/** Button variant keys — keep in sync with `buttonVariants`. */
export const buttonVariantKeys = [
  'default',
  'destructive',
  'outline',
  'secondary',
  'ghost',
  'link',
] as const

export const buttonVariants: Record<ButtonVariant, string> = {
  default: 'cn-button-variant-default',
  destructive: 'cn-button-variant-destructive',
  outline: 'cn-button-variant-outline',
  secondary: 'cn-button-variant-secondary',
  ghost: 'cn-button-variant-ghost',
  link: 'cn-button-variant-link',
}

export type ButtonVariant = (typeof buttonVariantKeys)[number]

/** Button size keys — keep in sync with `buttonSizes`. */
export const buttonSizeKeys = [
  'default',
  'xs',
  'sm',
  'lg',
  'icon',
  'icon-xs',
  'icon-sm',
  'icon-lg',
] as const

export const buttonSizes: Record<ButtonSize, string> = {
  default: 'cn-button-size-default',
  xs: 'cn-button-size-xs',
  sm: 'cn-button-size-sm',
  lg: 'cn-button-size-lg',
  icon: 'cn-button-size-icon',
  'icon-xs': 'cn-button-size-icon-xs',
  'icon-sm': 'cn-button-size-icon-sm',
  'icon-lg': 'cn-button-size-icon-lg',
}

export type ButtonSize = (typeof buttonSizeKeys)[number]

const buttonBase = 'cn-button'

export type ButtonConfig<M> = Readonly<{
  onClick?: M
  isDisabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  isAutofocus?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}>

/** Styled button built on the @foldkit/ui Button helper. */
export const button = <M>(config: ButtonConfig<M>, label: Html | string, h: HtmlBuilder<M>): Html =>
  FoldkitButton.view<M>(
    {
      onClick: config.onClick,
      isDisabled: config.isDisabled,
      type: config.type,
      isAutofocus: config.isAutofocus,
      toView: (attributes) =>
        h.button(
          [
            ...attributes.button,
            h.Class(
              cn(
                buttonBase,
                buttonVariants[config.variant ?? 'default'],
                buttonSizes[config.size ?? 'default'],
                config.className,
              ),
            ),
            h.DataAttribute('slot', 'button'),
          ],
          [label],
        ),
    },
    h,
  )
