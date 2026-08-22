import { Switch as FoldkitSwitch } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

/**
 * Derived from the shadcn v4 BASE registry: apps/v4/registry/bases/base/ui/switch.tsx.
 * Class strings are identical to upstream; visual styling lives in the central foldcn style definition. See docs/deriving-from-base.md.
 *
 * foldkit deltas (inlined at style resolution): foldkit emits aria-disabled/
 * data-disabled instead of native disabled, and only data-checked (never
 * data-unchecked) — this view hand-emits data-unchecked when off so the
 * upstream thumb/track variants resolve.
 */

export const switchSizeKeys = ['default', 'sm'] as const
export type SwitchSize = (typeof switchSizeKeys)[number]

/** Upstream switch component string; sizes come from the cn-switch token via
 *  the data-size attribute. */
export const switchClass =
  'cn-switch peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50'

/** Upstream thumb string; geometry/travel come from the token keyed on
 *  group data-size + data-checked/data-unchecked. */
export const switchThumbClass =
  'cn-switch-thumb pointer-events-none block ring-0 transition-transform'

export const switchLabelClass =
  'text-sm font-medium leading-none group-data-[disabled]/field:cursor-not-allowed group-data-[disabled]/field:opacity-70'

export const switchDescriptionClass = 'text-sm text-muted-foreground'

export const switchWrapperClass = 'group/field flex items-center gap-3'

export const switchTextWrapperClass = 'flex flex-col gap-1'

export type SwitchConfig<M> = Readonly<{
  id: string
  isChecked: boolean
  onToggle: (isChecked: boolean) => M
  label: string
  maybeDescription?: string
  isDisabled?: boolean
  isReadOnly?: boolean
  name?: string
  value?: string
  size?: SwitchSize
  className?: string
  thumbClass?: string
  labelClass?: string
  descriptionClass?: string
  wrapperClass?: string
}>

/** Styled switch with label and optional description, built on the
 *  @foldkit/ui Switch helper. */
export const switch_ = <M>(config: SwitchConfig<M>, h: HtmlBuilder<M>): Html =>
  FoldkitSwitch.view<M>(
    {
      id: config.id,
      isChecked: config.isChecked,
      onToggle: config.onToggle,
      isDisabled: config.isDisabled,
      isReadOnly: config.isReadOnly,
      name: config.name,
      value: config.value,
      toView: (attributes) =>
        h.div(
          [
            h.Class(cn(switchWrapperClass, config.wrapperClass)),
            ...(config.isDisabled ? [h.DataAttribute('disabled', '')] : []),
          ],
          [
            h.button(
              [
                ...attributes.button,
                h.DataAttribute('slot', 'switch'),
                h.DataAttribute('size', config.size ?? 'default'),
                ...(config.isChecked ? [] : [h.DataAttribute('unchecked', '')]),
                h.Class(cn(switchClass, config.className)),
              ],
              [
                h.span([
                  h.DataAttribute('slot', 'switch-thumb'),
                  h.Class(cn(switchThumbClass, config.thumbClass)),
                ]),
              ],
            ),
            ...(attributes.hiddenInput.length > 0 ? [h.input([...attributes.hiddenInput])] : []),
            h.div(
              [h.Class(switchTextWrapperClass)],
              [
                h.label(
                  [...attributes.label, h.Class(cn(switchLabelClass, config.labelClass))],
                  [config.label],
                ),
                config.maybeDescription === undefined
                  ? h.empty
                  : h.p(
                      [
                        ...attributes.description,
                        h.Class(cn(switchDescriptionClass, config.descriptionClass)),
                      ],
                      [config.maybeDescription],
                    ),
              ],
            ),
          ],
        ),
    },
    h,
  )
