import { Select as FoldkitSelect } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { icon } from '@/lib/icons'
import { ChevronDown } from 'lucide'
import { cn } from '@/lib/utils'

/** Stateless styled native `<select>` — use when every option is always
 *  visible and plain. For a searchable/filterable dropdown submodel, use
 *  `select` (Listbox-backed) instead. */

export const nativeSelectSizeKeys = ['default', 'sm'] as const
export type NativeSelectSize = (typeof nativeSelectSizeKeys)[number]

/** Upstream NativeSelect select string. */
export const nativeSelectClass =
  'cn-native-select outline-none disabled:pointer-events-none disabled:cursor-not-allowed'

/** Upstream NativeSelect wrapper string. */
export const nativeSelectWrapperClass =
  'cn-native-select-wrapper group/native-select relative w-fit has-[select:disabled]:opacity-50'

export const nativeSelectIconClass =
  'cn-native-select-icon pointer-events-none absolute select-none'

export const nativeSelectOptionClass = 'bg-[Canvas] text-[CanvasText]'

export const nativeSelectOptGroupClass = 'bg-[Canvas] text-[CanvasText]'

export const nativeSelectLabelClass = 'cn-select-label px-1.5 py-1 text-xs text-muted-foreground'
export const nativeSelectDescriptionClass = 'text-sm text-muted-foreground'
export const nativeSelectFieldWrapperClass = 'flex w-full flex-col gap-1.5'

export type NativeSelectConfig<M> = Readonly<{
  id: string
  label: string
  description?: string
  onChange?: (value: string) => M
  value?: string
  size?: NativeSelectSize
  isDisabled?: boolean
  isInvalid?: boolean
  isAutofocus?: boolean
  name?: string
  /** `<option>` elements — pass prebuilt markup, e.g.
   *  `cities.map((city) => h.option([], [city]))`. */
  options: ReadonlyArray<Html | string>
  className?: string
  labelClass?: string
  descriptionClass?: string
  wrapperClass?: string
}>

/** Styled native select with label, chevron and optional description, built
 *  on the @foldkit/ui Select helper. Mirrors the shadcn v4 `native-select.tsx`:
 *  an `appearance-none` select whose chevron overlays the control at its right
 *  edge. Pass `<option>` markup via `options`.
 *
 *  ```ts
 *  import { nativeSelect } from '@/components/ui/native-select'
 *
 *  nativeSelect(
 *    {
 *      id: 'fruit',
 *      label: 'Fruit',
 *      onChange: (value) => Message.PickedFruit({ value }),
 *      options: fruits.map((fruit) => h.option([h.Value(fruit)], [fruit])),
 *    },
 *    h,
 *  )
 *  ``` */
export const nativeSelect = <M>(config: NativeSelectConfig<M>, h: HtmlBuilder<M>): Html =>
  FoldkitSelect.view<M>(
    {
      id: config.id,
      hasDescription: config.description !== undefined,
      onChange: config.onChange,
      value: config.value,
      isDisabled: config.isDisabled,
      isInvalid: config.isInvalid,
      isAutofocus: config.isAutofocus,
      name: config.name,
      toView: (attributes) =>
        h.div(
          [h.Class(cn(nativeSelectFieldWrapperClass, config.wrapperClass))],
          [
            h.label(
              [...attributes.label, h.Class(cn(nativeSelectLabelClass, config.labelClass))],
              [config.label],
            ),
            h.div(
              [
                h.Class(cn(nativeSelectWrapperClass)),
                h.DataAttribute('slot', 'native-select-wrapper'),
                h.DataAttribute('size', config.size ?? 'default'),
              ],
              [
                h.select(
                  [
                    ...attributes.select,
                    h.DataAttribute('slot', 'native-select'),
                    h.DataAttribute('size', config.size ?? 'default'),
                    h.Class(cn(nativeSelectClass, config.className)),
                  ],
                  config.options,
                ),
                h.span(
                  [
                    h.DataAttribute('slot', 'native-select-icon'),
                    h.Class(nativeSelectIconClass),
                    h.AriaHidden(true),
                  ],
                  [nativeSelectChevron(h)],
                ),
              ],
            ),
            config.description === undefined
              ? h.empty
              : h.span(
                  [
                    ...attributes.description,
                    h.Class(cn(nativeSelectDescriptionClass, config.descriptionClass)),
                  ],
                  [config.description],
                ),
          ],
        ),
    },
    h,
  )

export const nativeSelectChevron = <M>(h: HtmlBuilder<M>): Html => icon(h, ChevronDown, 'size-4')

/** Helper to render an `<option>` with correct data-slot and Canvas colors. */
export const nativeSelectOption = <M>(
  config: Readonly<{ value: string; label: string; isDisabled?: boolean; className?: string }>,
  h: HtmlBuilder<M>,
): Html =>
  h.option(
    [
      h.Value(config.value),
      h.DataAttribute('slot', 'native-select-option'),
      h.Class(cn(nativeSelectOptionClass, config.className)),
      ...(config.isDisabled === true ? [h.Disabled(true)] : []),
    ],
    [config.label],
  )

/** Helper to render an `<optgroup>` with correct data-slot and Canvas colors. */
export const nativeSelectOptGroup = <M>(
  config: Readonly<{ label: string; className?: string }>,
  children: ReadonlyArray<Html | string>,
  h: HtmlBuilder<M>,
): Html =>
  h.optgroup(
    [
      h.DataAttribute('slot', 'native-select-optgroup'),
      h.Class(cn(nativeSelectOptGroupClass, config.className)),
      h.Attribute('label', config.label),
    ],
    [...children],
  )
