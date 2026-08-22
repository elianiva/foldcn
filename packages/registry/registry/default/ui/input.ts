import { Input as FoldkitInput } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

/**
 * Derived from the shadcn v4 BASE registry: apps/v4/registry/bases/base/ui/input.tsx.
 * Keep the class strings identical to upstream — visual styling lives in the central foldcn style definition . See docs/deriving-from-base.md.
 */

export const inputClass =
  'cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'

/** Same string as the `label` item's component classes (upstream label.tsx). */
export const inputLabelClass =
  'cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed'

export const inputDescriptionClass = 'text-sm text-muted-foreground'

export const inputWrapperClass = 'flex flex-col gap-1.5 w-full'

export type InputConfig<M> = Readonly<{
  id: string
  label: string
  maybeDescription?: string
  onInput?: (value: string) => M
  value?: string
  isDisabled?: boolean
  isReadOnly?: boolean
  isInvalid?: boolean
  isAutofocus?: boolean
  name?: string
  type?: string
  placeholder?: string
  className?: string
  labelClass?: string
  descriptionClass?: string
  wrapperClass?: string
}>

/** Styled text input with label and optional description, built on the
 *  @foldkit/ui Input helper. */
export const input = <M>(config: InputConfig<M>, h: HtmlBuilder<M>): Html =>
  FoldkitInput.view<M>(
    {
      id: config.id,
      onInput: config.onInput,
      value: config.value,
      isDisabled: config.isDisabled,
      isReadOnly: config.isReadOnly,
      isInvalid: config.isInvalid,
      isAutofocus: config.isAutofocus,
      name: config.name,
      type: config.type,
      placeholder: config.placeholder,
      toView: (attributes) =>
        h.div(
          [h.Class(cn(inputWrapperClass, config.wrapperClass))],
          [
            h.label(
              [
                ...attributes.label,
                h.DataAttribute('slot', 'label'),
                h.Class(cn(inputLabelClass, config.labelClass)),
              ],
              [config.label],
            ),
            h.input([
              ...attributes.input,
              h.DataAttribute('slot', 'input'),
              h.Class(cn(inputClass, config.className)),
            ]),
            config.maybeDescription === undefined
              ? h.empty
              : h.span(
                  [
                    ...attributes.description,
                    h.Class(cn(inputDescriptionClass, config.descriptionClass)),
                  ],
                  [config.maybeDescription],
                ),
          ],
        ),
    },
    h,
  )
