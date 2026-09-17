import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import { childAttributes, type Html, type HtmlBuilder } from 'foldkit/html'

import { Combobox as FoldkitCombobox } from '@foldkit/ui'

import * as combobox from '../../generated/registry/ui/combobox'

import { Framework, FrameworkCombobox, FrameworkMultiCombobox } from '../bundles'
import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'
import { icon } from '@/lib/icons'
import { X } from 'lucide'

const Message = defineMessageUnion({
  GotComboboxMessage: { message: combobox.Message },
  GotMultiComboboxMessage: { message: combobox.Message },
})

const FRAMEWORKS: ReadonlyArray<Framework> = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro']

const filteredFrameworks = (inputValue: string): ReadonlyArray<Framework> => {
  const query = inputValue.trim().toLowerCase()
  return query === '' ? FRAMEWORKS : FRAMEWORKS.filter((item) => item.toLowerCase().includes(query))
}

export const comboboxView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Single']),
          h.div(
            [h.Class('w-full max-w-xs')],
            [
              h.submodel({
                slotId: model.combobox.id,
                model: model.combobox,
                view: FrameworkCombobox.view,
                viewInputs: combobox.viewInputs<Framework>({
                  items:
                    model.combobox.isOpen &&
                    Option.exists(
                      model.maybeComboboxValue,
                      (value) => value === model.combobox.inputValue,
                    )
                      ? FRAMEWORKS
                      : filteredFrameworks(model.combobox.inputValue),
                  restingInputValue: Option.getOrElse(model.maybeComboboxValue, () => ''),
                  maybeSelectedValue: model.maybeComboboxValue,
                  itemToValue: (item) => item,
                  itemToDisplayText: (item) => item,
                  inputPlaceholder: 'Select framework...',
                  buttonContent: combobox.comboboxChevron(h),
                  inputAttributes: childAttributes([
                    h.OnInput(() =>
                      Message.GotComboboxMessage({
                        message: combobox.Message.Opened({ maybeActiveItemIndex: Option.none() }),
                      }),
                    ),
                  ]),
                  itemToConfig: (item, { isSelected, isActive }) => ({
                    className: isActive ? 'font-medium' : '',
                    content: h.span(
                      [h.Class('flex w-full items-center justify-between gap-2')],
                      [h.span([], [item]), ...(isSelected ? [h.span([], ['✓'])] : [])],
                    ),
                  }),
                }),
                toParentMessage: (message) => Message.GotComboboxMessage({ message }),
              }),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Multi']),
          h.div(
            [
              h.Id('combobox-multi-demo-input-wrapper'),
              h.Class('flex w-full max-w-xs flex-wrap items-center gap-1 rounded-lg border p-1'),
            ],
            [
              h.div(
                [h.Class('contents')],
                model.multiComboboxValues.map((value) =>
                  h.span(
                    [
                      h.Class(
                        'inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs',
                      ),
                    ],
                    [
                      h.span([], [value]),
                      h.button(
                        [
                          h.Type('button'),
                          h.AriaLabel(`Remove ${value}`),
                          h.Class('rounded-sm text-muted-foreground hover:text-foreground'),
                          h.OnClick(
                            Message.GotMultiComboboxMessage({
                              message: combobox.Message.SelectedItem({
                                item: value,
                                displayText: value,
                                wasSelected: true,
                              }),
                            }),
                          ),
                        ],
                        [icon(h, X, 'size-3')],
                      ),
                    ],
                  ),
                ),
              ),
              h.submodel({
                slotId: model.multiCombobox.id,
                model: model.multiCombobox,
                view: FrameworkMultiCombobox.view,
                viewInputs: combobox.multiViewInputs<Framework>({
                  items: filteredFrameworks(model.multiCombobox.inputValue),
                  selectedValues: model.multiComboboxValues,
                  restingInputValue: '',
                  itemToValue: (item) => item,
                  itemToDisplayText: (item) => item,
                  inputPlaceholder:
                    model.multiComboboxValues.length === 0 ? 'Add framework...' : undefined,
                  buttonContent: combobox.comboboxChevron(h),
                  inputClass: 'border-0 shadow-none focus-visible:ring-0',
                  // Share the first row with chips until the input reaches
                  // its usable minimum, then wrap onto a new row.
                  // Match Base UI's chip input: keep a small usable input
                  // width, then wrap only after the row has no room left.
                  wrapperClass: 'min-w-16 flex-1',
                  inputWrapperClass: 'w-full min-w-0',
                  inputWrapperAttributes: [h.Id('combobox-multi-input-inner')],
                  inputAttributes: childAttributes([
                    h.OnInput(() =>
                      Message.GotMultiComboboxMessage({
                        message: combobox.Message.Opened({ maybeActiveItemIndex: Option.none() }),
                      }),
                    ),
                  ]),
                  itemToConfig: (item, { isSelected, isActive }) => ({
                    className: isActive ? 'font-medium' : '',
                    content: h.span(
                      [h.Class('flex w-full items-center justify-between gap-2')],
                      [h.span([], [item]), ...(isSelected ? [combobox.comboboxCheck(h)] : [])],
                    ),
                  }),
                }),
                toParentMessage: (message) => Message.GotMultiComboboxMessage({ message }),
              }),
            ],
          ),
        ],
      ),
    ],
  )

const foldComboboxOutMessage = M.type<FoldkitCombobox.OutMessage<Framework>>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => ({ model: evo(model, { maybeComboboxValue: () => Option.some(value) }) }),
    ClearedSelection: () => (model) => ({ model }),
  }),
)

const foldMultiComboboxOutMessage = M.type<FoldkitCombobox.OutMessage<Framework>>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => ({
        model: evo(model, {
          multiComboboxValues: (values) =>
            values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
        }),
      }),
    ClearedSelection: () => (model) => ({ model }),
  }),
)

const foldCombobox = Update.foldChild({
  update: FrameworkCombobox.update,
  read: (model: State) => Option.some(model.combobox),
  write: (model, next) => evo(model, { combobox: () => next }),
  toParentMessage: (message) => Message.GotComboboxMessage({ message }),
  foldOutMessage: foldComboboxOutMessage,
})

const foldMultiCombobox = Update.foldChild({
  update: FrameworkMultiCombobox.update,
  read: (model: State) => Option.some(model.multiCombobox),
  write: (model, next) => evo(model, { multiCombobox: () => next }),
  toParentMessage: (message) => Message.GotMultiComboboxMessage({ message }),
  foldOutMessage: foldMultiComboboxOutMessage,
})

const fields = {
  combobox: combobox.Model,
  maybeComboboxValue: S.Option(Framework),
  multiCombobox: combobox.Multi.Model,
  multiComboboxValues: S.Array(Framework),
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    combobox: combobox.init({ id: 'combobox-demo' }),
    maybeComboboxValue: Option.none(),
    multiCombobox: combobox.Multi.init({ id: 'combobox-multi-demo' }),
    multiComboboxValues: [],
  },
  messages: [Message.GotComboboxMessage, Message.GotMultiComboboxMessage],
  handlers: (model: State) => ({
    GotComboboxMessage: (payload: typeof Message.GotComboboxMessage.Type): UpdateReturn =>
      foldCombobox(model, payload.message),
    GotMultiComboboxMessage: (payload: typeof Message.GotMultiComboboxMessage.Type): UpdateReturn =>
      foldMultiCombobox(model, payload.message),
  }),
  samples: [],
})
