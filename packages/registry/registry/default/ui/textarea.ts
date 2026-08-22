import { Textarea as FoldkitTextarea } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

/** Derived from the shadcn v4 BASE registry:
 *  apps/v4/registry/bases/base/ui/textarea.tsx. */
export const textareaClass =
  'cn-textarea flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'

/** Same string as the `label` item's component classes (upstream label.tsx). */
export const textareaLabelClass =
  'cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed'

export const textareaDescriptionClass = 'text-sm text-muted-foreground'

export const textareaWrapperClass = 'flex flex-col gap-1.5 w-full'

export type TextareaConfig<M> = Readonly<{
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
  rows?: number
  placeholder?: string
  className?: string
  labelClass?: string
  descriptionClass?: string
  wrapperClass?: string
}>

/** Styled textarea with label and optional description, built on the
 *  @foldkit/ui Textarea helper. */
export const textarea = <M>(config: TextareaConfig<M>, h: HtmlBuilder<M>): Html =>
  FoldkitTextarea.view<M>(
    {
      id: config.id,
      onInput: config.onInput,
      value: config.value,
      isDisabled: config.isDisabled,
      isReadOnly: config.isReadOnly,
      isInvalid: config.isInvalid,
      isAutofocus: config.isAutofocus,
      name: config.name,
      rows: config.rows,
      placeholder: config.placeholder,
      toView: (attributes) =>
        h.div(
          [h.Class(cn(textareaWrapperClass, config.wrapperClass))],
          [
            h.label(
              [
                ...attributes.label,
                h.DataAttribute('slot', 'label'),
                h.Class(cn(textareaLabelClass, config.labelClass)),
              ],
              [config.label],
            ),
            h.textarea([
              ...attributes.textarea,
              h.DataAttribute('slot', 'textarea'),
              h.Class(cn(textareaClass, config.className)),
            ]),
            config.maybeDescription === undefined
              ? h.empty
              : h.span(
                  [
                    ...attributes.description,
                    h.Class(cn(textareaDescriptionClass, config.descriptionClass)),
                  ],
                  [config.maybeDescription],
                ),
          ],
        ),
    },
    h,
  )
