/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as RadioGroup from '@/components/ui/radio-group'`
 */
import { RadioGroup as FoldkitRadioGroup } from '@foldkit/ui'
import type { Option } from 'effect/Option'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'
import {
  fieldBaseClass,
  fieldContentClass,
  fieldDescriptionClass,
  fieldLabelClass,
  fieldOrientationClasses,
  fieldTitleClass,
  labelClass,
} from './fieldset'

/**
 * Two rendering paths in `styledViewInputs`:
 *  - `optionLabel` (+ optional `optionDescription`) → upstream anatomy: a
 *    16px circle control carrying the foldkit attributes, an indicator dot
 *    mounted only while selected, and a wired label/description pair. Set
 *    `optionLayout` to compose the documented Field or Choice Card anatomy.
 *  - legacy `option` callback → consumer-owned row content inside a
 *    group-attributed wrapper (kept for backward compatibility).
 *
 */

// Re-export the @foldkit/ui RadioGroup surface. Create a bundle once per
// option type:
//
//   export const PlanRadioGroup = RadioGroup.create<"Startup" | "Business">()

export const create = FoldkitRadioGroup.create
export const init = FoldkitRadioGroup.init
export const Model = FoldkitRadioGroup.Model
export type Model = typeof Model.Type
export const Message = FoldkitRadioGroup.Message
export type Message = typeof Message.Type
export const OutMessage = FoldkitRadioGroup.OutMessage
export type OutMessage = typeof OutMessage.Type

export type Bundle<Value extends string = string> = FoldkitRadioGroup.Bundle<Value>
export type InitConfig = FoldkitRadioGroup.InitConfig
export type ViewInputs<Value extends string = string> = FoldkitRadioGroup.ViewInputs<Value>
export type RenderInfo<Value extends string = string> = FoldkitRadioGroup.RenderInfo<Value>

/** Upstream group component string. Horizontal orientation appends a
 *  responsive row extension (foldcn API exposes orientation; upstream leaves
 *  layout to the consumer). */
export const radioGroupClass = 'cn-radio-group w-full'

export const radioGroupVerticalClass = 'cn-radio-group w-full'

export const radioGroupHorizontalClass = 'cn-radio-group w-full sm:flex-row sm:items-center'

/** Upstream item component string. The disabled: variants are inert under
 *  foldkit (aria-/data- twins are inlined at style resolution). */
export const radioItemClass =
  'cn-radio-group-item group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50'

export const radioIndicatorClass = 'cn-radio-group-indicator'

export const radioDotClass = 'cn-radio-group-indicator-icon'

/** Label for the upstream-anatomy option row. The circle control (radioItemClass)
 *  carries `peer` and precedes the label, and foldkit emits aria-disabled/
 *  data-disabled on it when disabled — so the peer twins below are live
 *  (upstream's native peer-disabled variant can never match). */
export const radioItemLabelClass =
  'cn-label flex items-center select-none peer-aria-disabled:pointer-events-none peer-aria-disabled:cursor-not-allowed peer-data-[disabled]:pointer-events-none peer-data-[disabled]:cursor-not-allowed'

export const radioItemDescriptionClass = 'text-sm text-muted-foreground'

/** Legacy consumer-drawn row (used when `option` callback is supplied). */
export const radioOptionClass =
  'group/radio-group-item peer relative flex cursor-pointer select-none items-center justify-between rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 hover:bg-accent hover:text-accent-foreground data-[checked]:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50'

/** Legacy path label: nested inside the option row (which itself is the
 *  `group/radio-group-item` carrying foldkit's data-disabled), so disabled
 *  state flows via the group variant — a `peer-*` form can never match a
 *  descendant of the peer element. */
export const radioOptionLabelClass =
  'text-sm font-medium leading-none group-data-[disabled]/radio-group-item:cursor-not-allowed group-data-[disabled]/radio-group-item:opacity-70'

export const radioOptionDescriptionClass = 'text-sm text-muted-foreground'

export type StyledViewInputs<M, Value extends string = string> = Readonly<{
  options: ReadonlyArray<Value>
  selectedValue: Option<Value>
  ariaLabel: string
  /** Legacy path: renders each option row's content yourself. Receives the
   *  option value, its per-option render info (`isSelected`, attribute
   *  bundles) and the full render. Mutually exclusive with `optionLabel`. */
  option?: (
    value: Value,
    info: FoldkitRadioGroup.OptionInfo<Value>,
    render: RenderInfo<Value>,
    h: HtmlBuilder<M>,
  ) => Html
  /** Upstream-anatomy path: plain text label per option, rendered next to a
   *  circle control with the indicator dot. */
  optionLabel?: (value: Value) => string
  optionDescription?: (value: Value) => string
  /** `field` matches upstream's Description, Fieldset, Disabled, Invalid, and
   * RTL examples. `choice-card` places the control at the end of a card row. */
  optionLayout?: 'default' | 'field' | 'choice-card'
  orientation?: 'Horizontal' | 'Vertical'
  isOptionDisabled?: (value: Value, index: number) => boolean
  isInvalid?: boolean
  isDisabled?: boolean
  isReadOnly?: boolean
  name?: string
  groupClass?: string
  optionClass?: string
}>

const defaultOptionRow = <M, Value extends string>(
  info: FoldkitRadioGroup.OptionInfo<Value>,
  labelText: string,
  descriptionText: string | undefined,
  optionClass: string | undefined,
  isInvalid: boolean | undefined,
  optionLayout: 'default' | 'field' | 'choice-card',
  h: HtmlBuilder<M>,
): Html => {
  const isDisabled = info.isDisabled
  const control = h.button(
    [
      ...info.option,
      ...(isDisabled ? [h.Disabled(true), h.Tabindex(-1)] : []),
      ...(isInvalid ? [h.Attribute('aria-invalid', 'true')] : []),
      h.DataAttribute('slot', 'radio-group-item'),
      h.Class(radioItemClass),
    ],
    info.isSelected
      ? [
          h.span(
            [h.DataAttribute('slot', 'radio-group-indicator'), h.Class(radioIndicatorClass)],
            [h.span([h.Class(radioDotClass)])],
          ),
        ]
      : [],
  )

  if (optionLayout === 'choice-card') {
    return h.label(
      [
        h.DataAttribute('slot', 'field-label'),
        h.Class(cn(labelClass, fieldLabelClass, optionClass)),
      ],
      [
        h.div(
          [
            h.Role('group'),
            h.DataAttribute('slot', 'field'),
            h.DataAttribute('orientation', 'horizontal'),
            ...(isDisabled ? [h.DataAttribute('disabled', 'true')] : []),
            ...(isInvalid ? [h.DataAttribute('invalid', 'true')] : []),
            h.Class(cn(fieldBaseClass, fieldOrientationClasses.horizontal)),
          ],
          [
            h.div(
              [h.DataAttribute('slot', 'field-content'), h.Class(fieldContentClass)],
              [
                h.div(
                  [...info.label, h.DataAttribute('slot', 'field-label'), h.Class(fieldTitleClass)],
                  [labelText],
                ),
                ...(descriptionText === undefined
                  ? []
                  : [
                      h.p(
                        [
                          ...info.description,
                          h.DataAttribute('slot', 'field-description'),
                          h.Class(cn(fieldDescriptionClass, 'cn-radio-group-field-description')),
                        ],
                        [descriptionText],
                      ),
                    ]),
              ],
            ),
            control,
          ],
        ),
      ],
    )
  }

  const label = h.span(
    [
      ...info.label,
      h.DataAttribute('slot', optionLayout === 'field' ? 'field-label' : 'radio-group-item-label'),
      h.Class(
        optionLayout === 'field'
          ? cn(
              labelClass,
              fieldLabelClass,
              descriptionText === undefined ? 'cn-radio-group-field-label' : undefined,
            )
          : radioItemLabelClass,
      ),
    ],
    [labelText],
  )

  if (optionLayout === 'field') {
    return h.label(
      [
        h.DataAttribute('slot', 'field'),
        h.DataAttribute('orientation', 'horizontal'),
        ...(isDisabled ? [h.DataAttribute('disabled', 'true')] : []),
        ...(isInvalid ? [h.DataAttribute('invalid', 'true')] : []),
        h.Class(cn(fieldBaseClass, fieldOrientationClasses.horizontal, optionClass)),
      ],
      [
        control,
        descriptionText === undefined
          ? label
          : h.span(
              [h.DataAttribute('slot', 'field-content'), h.Class(fieldContentClass)],
              [
                label,
                h.span(
                  [
                    ...info.description,
                    h.DataAttribute('slot', 'field-description'),
                    h.Class(cn(fieldDescriptionClass, 'cn-radio-group-field-description')),
                  ],
                  [descriptionText],
                ),
              ],
            ),
      ],
    )
  }

  return h.label(
    [
      h.Class(
        cn(
          descriptionText === undefined
            ? 'flex w-full items-center gap-2'
            : 'cn-radio-group-description-row',
          optionClass,
        ),
      ),
    ],
    [
      control,
      descriptionText === undefined
        ? label
        : h.span(
            [h.Class('cn-radio-group-description-content')],
            [
              label,
              h.span(
                [
                  ...info.description,
                  h.DataAttribute('slot', 'radio-group-item-description'),
                  h.Class(radioItemDescriptionClass),
                ],
                [descriptionText],
              ),
            ],
          ),
    ],
  )
}

/** Build styled `RadioGroup.ViewInputs`. Pass your view's `h`. */
export const styledViewInputs = <M, Value extends string = string>(
  viewInputs: StyledViewInputs<M, Value>,
  h: HtmlBuilder<M>,
): ViewInputs<Value> => {
  const isHorizontal = viewInputs.orientation === 'Horizontal'
  return {
    options: viewInputs.options,
    selectedValue: viewInputs.selectedValue,
    ariaLabel: viewInputs.ariaLabel,
    orientation: viewInputs.orientation,
    isOptionDisabled: viewInputs.isOptionDisabled,
    hasOptionDescription: (value) =>
      viewInputs.option === undefined && viewInputs.optionDescription?.(value) !== undefined,
    isDisabled: viewInputs.isDisabled,
    isReadOnly: viewInputs.isReadOnly,
    name: viewInputs.name,
    toView: (render) => {
      const { group, options, hiddenInput } = render
      return h.div(
        [
          ...group,
          h.DataAttribute('slot', 'radio-group'),
          h.Class(
            cn(
              isHorizontal ? radioGroupHorizontalClass : radioGroupVerticalClass,
              viewInputs.groupClass,
            ),
          ),
        ],
        [
          ...options.map((option) => {
            if (viewInputs.option !== undefined) {
              // Legacy path: consumer-owned content inside the attributed row.
              return h.div(
                [
                  ...option.option,
                  ...(option.isDisabled ? [h.Tabindex(-1)] : []),
                  ...(viewInputs.isInvalid ? [h.Attribute('aria-invalid', 'true')] : []),
                  h.DataAttribute('slot', 'radio-group-item'),
                  h.Class(cn(radioOptionClass, viewInputs.optionClass)),
                ],
                [viewInputs.option(option.value, option, render, h)],
              )
            }
            return defaultOptionRow(
              option,
              viewInputs.optionLabel?.(option.value) ?? String(option.value),
              viewInputs.optionDescription?.(option.value),
              viewInputs.optionClass,
              viewInputs.isInvalid,
              viewInputs.optionLayout ?? 'default',
              h,
            )
          }),
          ...(hiddenInput.length > 0 ? [h.input([...hiddenInput])] : []),
        ],
      )
    },
  }
}
