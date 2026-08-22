import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

/**
 * Derived from the shadcn v4 BASE registry: apps/v4/registry/bases/base/ui/alert.tsx.
 * Keep the class strings identical to upstream — visual styling lives in the central foldcn style definition. See docs/deriving-from-base.md.
 */

export const alertVariantKeys = ['default', 'destructive'] as const
export type AlertVariant = (typeof alertVariantKeys)[number]

export const alertVariants: Record<AlertVariant, string> = {
  default: 'cn-alert-variant-default',
  destructive: 'cn-alert-variant-destructive',
}

export const alertClass = 'cn-alert group/alert relative w-full'

export const alertTitleClass =
  'cn-alert-title [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground'

export const alertDescriptionClass =
  'cn-alert-description [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground'

export const alertActionClass = 'cn-alert-action'

type StyleConfig = Readonly<{ className?: string; variant?: AlertVariant }>

const alertContainer = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(alertClass, alertVariants[config.variant ?? 'default'], config.className)),
      h.Role('alert'),
      h.DataAttribute('slot', 'alert'),
      h.DataAttribute('variant', config.variant ?? 'default'),
    ],
    children,
  )

const alertTitle = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class(cn(alertTitleClass, config.className)), h.DataAttribute('slot', 'alert-title')],
    children,
  )

const alertDescription = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class(cn(alertDescriptionClass, config.className)), h.DataAttribute('slot', 'alert-description')],
    children,
  )

/** Alert action — an absolutely positioned slot in the top-right corner; the
 *  container token reserves room for it via has-data-[slot=alert-action]. */
const alertAction = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div([h.Class(cn(alertActionClass, config.className)), h.DataAttribute('slot', 'alert-action')], children)

/** Styled alert — `Alert.title`, `Alert.description` and `Alert.action`
 *  sub-builders. Derived from the shadcn v4 BASE registry `alert.tsx`. */
export const Alert = Object.assign(alertContainer, {
  title: alertTitle,
  description: alertDescription,
  action: alertAction,
})
