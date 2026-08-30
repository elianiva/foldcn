import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { input, inputClass } from '../../generated/registry/ui/input'
import {
  field,
  fieldDescription,
  fieldGroup,
  fieldLabel,
} from '../../generated/registry/ui/fieldset'
import { button } from '../../generated/registry/ui/button'
import {
  nativeSelectClass,
  nativeSelectWrapperClass,
  nativeSelectIconClass,
} from '../../generated/registry/ui/native-select'
import { icon } from '../../generated/registry/lib/icons'
import { ChevronDown } from 'lucide'
import * as select from '../../generated/registry/ui/select'
import { LanguageSelect } from '../bundles'
import { Option } from 'effect'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  UpdatedInputValue: { value: S.String },
})

const CURRENCY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'usd', label: 'USD' },
  { value: 'eur', label: 'EUR' },
  { value: 'gbp', label: 'GBP' },
]

export const inputView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.div(
            [h.Class('w-full max-w-sm')],
            [h.input([h.Type('email'), h.Placeholder('Email'), h.Class(inputClass)])],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Invalid']),
          h.div(
            [h.Class('w-full max-w-sm')],
            [
              h.input([
                h.Type('text'),
                h.Placeholder('Error'),
                h.AriaInvalid(true),
                h.Class(inputClass),
              ]),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Label']),
          h.div(
            [h.Class('w-full max-w-sm')],
            [
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'input-demo-email' }, ['Email'], h),
                  h.input([
                    h.Id('input-demo-email'),
                    h.Type('email'),
                    h.Placeholder('name@example.com'),
                    h.Class(inputClass),
                  ]),
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Description']),
          h.div(
            [h.Class('w-full max-w-sm')],
            [
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'input-demo-username' }, ['Username'], h),
                  h.input([
                    h.Id('input-demo-username'),
                    h.Type('text'),
                    h.Placeholder('Enter your username'),
                    h.Class(inputClass),
                  ]),
                  fieldDescription<AppMessage>(
                    {},
                    ['Choose a unique username for your account.'],
                    h,
                  ),
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
          h.div(
            [h.Class('w-full max-w-sm')],
            [
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'input-demo-disabled' }, ['Email'], h),
                  h.input([
                    h.Id('input-demo-disabled'),
                    h.Type('email'),
                    h.Placeholder('Email'),
                    h.Disabled(true),
                    h.Class(inputClass),
                  ]),
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Input Types']),
          h.div(
            [h.Class('flex w-full max-w-sm flex-col gap-6')],
            [
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'input-demo-password' }, ['Password'], h),
                  h.input([
                    h.Id('input-demo-password'),
                    h.Type('password'),
                    h.Placeholder('Password'),
                    h.Class(inputClass),
                  ]),
                ],
                h,
              ),
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'input-demo-tel' }, ['Phone'], h),
                  h.input([
                    h.Id('input-demo-tel'),
                    h.Type('tel'),
                    h.Placeholder('+1 (555) 123-4567'),
                    h.Class(inputClass),
                  ]),
                ],
                h,
              ),
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'input-demo-url' }, ['URL'], h),
                  h.input([
                    h.Id('input-demo-url'),
                    h.Type('url'),
                    h.Placeholder('https://example.com'),
                    h.Class(inputClass),
                  ]),
                ],
                h,
              ),
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'input-demo-search' }, ['Search'], h),
                  h.input([
                    h.Id('input-demo-search'),
                    h.Type('search'),
                    h.Placeholder('Search'),
                    h.Class(inputClass),
                  ]),
                ],
                h,
              ),
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'input-demo-number' }, ['Number'], h),
                  h.input([
                    h.Id('input-demo-number'),
                    h.Type('number'),
                    h.Placeholder('123'),
                    h.Class(inputClass),
                  ]),
                ],
                h,
              ),
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'input-demo-date' }, ['Date'], h),
                  h.input([h.Id('input-demo-date'), h.Type('date'), h.Class(inputClass)]),
                ],
                h,
              ),
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'input-demo-time' }, ['Time'], h),
                  h.input([h.Id('input-demo-time'), h.Type('time'), h.Class(inputClass)]),
                ],
                h,
              ),
              field<AppMessage>(
                {},
                [
                  fieldLabel<AppMessage>({ for: 'input-demo-file' }, ['File'], h),
                  h.input([h.Id('input-demo-file'), h.Type('file'), h.Class(inputClass)]),
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Select']),
          h.div(
            [h.Class('flex w-full max-w-sm gap-2')],
            [
              h.input([
                h.Type('text'),
                h.Placeholder('Enter amount'),
                h.Class(`${inputClass} flex-1`),
              ]),
              h.div(
                [h.Class('w-32')],
                [
                  h.submodel({
                    slotId: model.select.id,
                    model: model.select,
                    view: LanguageSelect.view,
                    viewInputs: select.styledViewInputs<
                      AppMessage,
                      { value: string; label: string },
                      string
                    >(
                      {
                        options: CURRENCY_OPTIONS,
                        maybeSelectedValue: Option.some('usd'),
                        itemToValue: (item) => item.value,
                        itemToLabel: (item) => item.label,
                        label: 'Currency',
                        triggerClass: 'w-32',
                      },
                      h,
                    ),
                    toParentMessage: (_message) => Message.UpdatedInputValue({ value: '' }),
                  }),
                ],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Button']),
          h.div(
            [h.Class('flex w-full max-w-sm gap-2')],
            [
              h.input([
                h.Type('search'),
                h.Placeholder('Search...'),
                h.Class(`${inputClass} flex-1`),
              ]),
              button<AppMessage>({}, 'Search', h),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div(
            [h.Class('px-1 text-xs font-medium text-muted-foreground')],
            ['With Native Select'],
          ),
          h.div(
            [h.Class('flex w-full max-w-sm gap-2')],
            [
              h.input([
                h.Type('tel'),
                h.Placeholder('(555) 123-4567'),
                h.Class(`${inputClass} flex-1`),
              ]),
              h.div(
                [h.Class(`${nativeSelectWrapperClass} w-24`)],
                [
                  h.select(
                    [h.Class(nativeSelectClass)],
                    [
                      h.option([h.Value('+1')], ['+1']),
                      h.option([h.Value('+44')], ['+44']),
                      h.option([h.Value('+46')], ['+46']),
                    ],
                  ),
                  h.span(
                    [h.Class(nativeSelectIconClass), h.AriaHidden(true)],
                    [icon(h, ChevronDown, 'size-4')],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Form']),
          h.div(
            [h.Class('w-full max-w-md')],
            [
              h.form(
                [h.Class('w-full')],
                [
                  fieldGroup<AppMessage>(
                    {},
                    [
                      field<AppMessage>(
                        {},
                        [
                          fieldLabel<AppMessage>({ for: 'form-name' }, ['Name'], h),
                          h.input([
                            h.Id('form-name'),
                            h.Type('text'),
                            h.Placeholder('John Doe'),
                            h.Class(inputClass),
                          ]),
                        ],
                        h,
                      ),
                      field<AppMessage>(
                        {},
                        [
                          fieldLabel<AppMessage>({ for: 'form-email' }, ['Email'], h),
                          h.input([
                            h.Id('form-email'),
                            h.Type('email'),
                            h.Placeholder('john@example.com'),
                            h.Class(inputClass),
                          ]),
                          fieldDescription<AppMessage>(
                            {},
                            ["We'll never share your email with anyone."],
                            h,
                          ),
                        ],
                        h,
                      ),
                      h.div(
                        [h.Class('grid grid-cols-2 gap-4')],
                        [
                          field<AppMessage>(
                            {},
                            [
                              fieldLabel<AppMessage>({ for: 'form-phone' }, ['Phone'], h),
                              h.input([
                                h.Id('form-phone'),
                                h.Type('tel'),
                                h.Placeholder('+1 (555) 123-4567'),
                                h.Class(inputClass),
                              ]),
                            ],
                            h,
                          ),
                          field<AppMessage>(
                            {},
                            [
                              fieldLabel<AppMessage>({ for: 'form-country' }, ['Country'], h),
                              h.div(
                                [h.Class(nativeSelectWrapperClass)],
                                [
                                  h.select(
                                    [h.Id('form-country'), h.Class(nativeSelectClass)],
                                    [
                                      h.option([h.Value('us')], ['United States']),
                                      h.option([h.Value('uk')], ['United Kingdom']),
                                      h.option([h.Value('ca')], ['Canada']),
                                    ],
                                  ),
                                  h.span(
                                    [h.Class(nativeSelectIconClass), h.AriaHidden(true)],
                                    [icon(h, ChevronDown, 'size-4')],
                                  ),
                                ],
                              ),
                            ],
                            h,
                          ),
                        ],
                      ),
                      field<AppMessage>(
                        {},
                        [
                          fieldLabel<AppMessage>({ for: 'form-address' }, ['Address'], h),
                          h.input([
                            h.Id('form-address'),
                            h.Type('text'),
                            h.Placeholder('123 Main St'),
                            h.Class(inputClass),
                          ]),
                        ],
                        h,
                      ),
                      field<AppMessage>(
                        { orientation: 'horizontal' },
                        [
                          button<AppMessage>({ variant: 'outline', type: 'button' }, 'Cancel', h),
                          button<AppMessage>({ type: 'submit' }, 'Submit', h),
                        ],
                        h,
                      ),
                    ],
                    h,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Controlled']),
          h.div(
            [h.Class('w-full max-w-sm')],
            [
              input<AppMessage>(
                {
                  id: 'input-demo-api-key',
                  label: 'API Key',
                  type: 'password',
                  value: model.inputValue,
                  onInput: (value) => Message.UpdatedInputValue({ value }),
                  placeholder: 'sk-...',
                  description: 'Your API key is encrypted and stored securely.',
                },
                h,
              ),
            ],
          ),
        ],
      ),
    ],
  )

const fields = { inputValue: S.String }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { inputValue: '' },
  messages: [Message.UpdatedInputValue],
  handlers: (model: State) => ({
    UpdatedInputValue: ({ value }: typeof Message.UpdatedInputValue.Type): UpdateReturn => ({
      model: evo(model, { inputValue: () => value }),
    }),
  }),
  samples: [Message.UpdatedInputValue({ value: 'sk-1234' })],
})
