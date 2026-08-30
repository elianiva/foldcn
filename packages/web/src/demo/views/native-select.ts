import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  nativeSelect,
  nativeSelectClass,
  nativeSelectWrapperClass,
  nativeSelectIconClass,
} from '../../generated/registry/ui/native-select'
import { field, fieldDescription, fieldLabel } from '../../generated/registry/ui/fieldset'
import { icon } from '../../generated/registry/lib/icons'
import { ChevronDown } from 'lucide'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  ChangedFruit: { value: S.String },
})

const FRUITS = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'] as const

const staticNative = (
  h: HtmlBuilder<AppMessage>,
  placeholder: string,
  opts?: { disabled?: boolean; invalid?: boolean; size?: 'sm' | 'default' },
): Html =>
  h.div(
    [
      h.Class(nativeSelectWrapperClass),
      h.DataAttribute('slot', 'native-select-wrapper'),
      h.DataAttribute('size', opts?.size ?? 'default'),
    ],
    [
      h.select(
        [
          h.Class(nativeSelectClass),
          h.DataAttribute('slot', 'native-select'),
          h.DataAttribute('size', opts?.size ?? 'default'),
          ...(opts?.disabled === true ? [h.Disabled(true)] : []),
          ...(opts?.invalid === true ? [h.AriaInvalid(true)] : []),
        ],
        [h.option([], [placeholder])],
      ),
      h.span(
        [
          h.DataAttribute('slot', 'native-select-icon'),
          h.Class(nativeSelectIconClass),
          h.AriaHidden(true),
        ],
        [icon(h, ChevronDown, 'size-4')],
      ),
    ],
  )

export const nativeSelectView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.div(
            [h.Class('w-full max-w-48')],
            [
              nativeSelect<AppMessage>(
                {
                  id: 'native-select-demo',
                  label: 'Favorite fruit',
                  value: model.fruit,
                  onChange: (value) => Message.ChangedFruit({ value }),
                  description: 'Rendered by the native select element.',
                  options: FRUITS.map((fruit) => h.option([h.Value(fruit)], [fruit])),
                },
                h,
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Groups']),
          h.div([h.Class('w-full max-w-48')], [staticNative(h, 'Select a food')]),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Sizes']),
          h.div(
            [h.Class('flex flex-col gap-4 w-full max-w-48')],
            [
              staticNative(h, 'Select a fruit', { size: 'sm' }),
              staticNative(h, 'Select a fruit', { size: 'default' }),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Field']),
          h.div(
            [h.Class('w-full max-w-48')],
            [
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'native-select-country' }, ['Country'], h),
                  h.div(
                    [h.Class(nativeSelectWrapperClass)],
                    [
                      h.select(
                        [
                          h.Id('native-select-country'),
                          h.Class(nativeSelectClass),
                          h.DataAttribute('slot', 'native-select'),
                        ],
                        [
                          h.option([h.Value('')], ['Select a country']),
                          h.option([h.Value('us')], ['United States']),
                          h.option([h.Value('uk')], ['United Kingdom']),
                          h.option([h.Value('ca')], ['Canada']),
                          h.option([h.Value('au')], ['Australia']),
                        ],
                      ),
                      h.span(
                        [h.Class(nativeSelectIconClass), h.AriaHidden(true)],
                        [icon(h, ChevronDown, 'size-4')],
                      ),
                    ],
                  ),
                  fieldDescription<AppMessage>({}, ['Select your country of residence.'], h),
                ],
                h,
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Disabled']),
          h.div([h.Class('w-full max-w-48')], [staticNative(h, 'Disabled', { disabled: true })]),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Invalid']),
          h.div([h.Class('w-full max-w-48')], [staticNative(h, 'Error state', { invalid: true })]),
        ],
      ),
    ],
  )

const fields = { fruit: S.String }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { fruit: 'Apple' },
  messages: [Message.ChangedFruit],
  handlers: (model: State) => ({
    ChangedFruit: ({ value }: typeof Message.ChangedFruit.Type): UpdateReturn => ({
      model: evo(model, { fruit: () => value }),
    }),
  }),
  samples: [Message.ChangedFruit({ value: 'Blueberry' })],
})
