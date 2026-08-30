import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { Combobox as FoldkitCombobox } from '@foldkit/ui'

import * as combobox from '../../generated/registry/ui/combobox'

import { City, CityCombobox } from '../bundles'
import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotComboboxMessage: { message: combobox.Message },
})

// Frameworks mirror apps/v4/examples/base/combobox-demo.tsx (single-select).
// Cast through City to reuse the shared CityCombobox bundle without adding a second bundle.
const FRAMEWORKS = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro'] as const

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
                view: CityCombobox.view,
                viewInputs: combobox.viewInputs<City>({
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  items: FRAMEWORKS as unknown as ReadonlyArray<City>,
                  restingInputValue: Option.getOrElse(model.maybeComboboxValue, () => ''),
                  maybeSelectedValue: model.maybeComboboxValue,
                  itemToValue: (item) => item,
                  itemToDisplayText: (item) => item,
                  inputPlaceholder: 'Select framework...',
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
            [h.Class('mx-auto w-full max-w-xs rounded-lg border p-4 text-sm')],
            [h.p([], ['Multi-select combobox with pills.'])],
          ),
        ],
      ),
    ],
  )

const foldComboboxOutMessage = M.type<FoldkitCombobox.OutMessage<City>>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected:
      ({ value }) =>
      (model) => ({ model: evo(model, { maybeComboboxValue: () => Option.some(value) }) }),
    ClearedSelection: () => (model) => ({ model }),
  }),
)

const foldCombobox = Update.foldChild({
  update: CityCombobox.update,
  read: (model: State) => Option.some(model.combobox),
  write: (model, next) => evo(model, { combobox: () => next }),
  toParentMessage: (message) => Message.GotComboboxMessage({ message }),
  foldOutMessage: foldComboboxOutMessage,
})

const fields = { combobox: combobox.Model, maybeComboboxValue: S.Option(City) }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    combobox: combobox.init({ id: 'combobox-demo' }),
    maybeComboboxValue: Option.none(),
  },
  messages: [Message.GotComboboxMessage],
  handlers: (model: State) => ({
    GotComboboxMessage: (payload: typeof Message.GotComboboxMessage.Type): UpdateReturn =>
      foldCombobox(model, payload.message),
  }),
  samples: [],
})
