import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { dataTable } from '../../generated/registry/blocks/data-table/data-table'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  UpdatedTableSearch: { value: S.String },
})

const INITIAL_ROWS: ReadonlyArray<{
  id: string
  name: string
  email: string
  plan: string
  status: string
}> = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', plan: 'Business', status: 'Active' },
  { id: '2', name: 'Grace Hopper', email: 'grace@example.com', plan: 'Startup', status: 'Active' },
  { id: '3', name: 'Alan Turing', email: 'alan@example.com', plan: 'Business', status: 'Invited' },
  { id: '4', name: 'Linus Pauling', email: 'linus@example.com', plan: 'Startup', status: 'Active' },
  {
    id: '5',
    name: 'Barbara Liskov',
    email: 'barbara@example.com',
    plan: 'Enterprise',
    status: 'Inactive',
  },
]

/** Filtered rows for the data-table block demo, derived from the search. */
export const filteredRows = (search: string) =>
  INITIAL_ROWS.filter((row) => row.name.toLowerCase().includes(search.trim().toLowerCase()))

const TABLE_COLUMNS = [
  { key: 'name', title: 'Name' },
  { key: 'email', title: 'Email' },
  { key: 'plan', title: 'Plan', align: 'right' as const },
  { key: 'status', title: 'Status', align: 'right' as const },
]

export const dataTableView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('w-full rounded-xl border border-border')],
    [
      dataTable<AppMessage>(
        {
          columns: TABLE_COLUMNS,
          rows: filteredRows(model.tableSearch).map((row) => ({
            id: row.id,
            cells: {
              name: row.name,
              email: row.email,
              plan: row.plan,
              status: row.status,
            },
          })),
          searchValue: model.tableSearch,
          onSearchInput: (value) => Message.UpdatedTableSearch({ value }),
        },
        h,
      ),
    ],
  )

const fields = { tableSearch: S.String }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { tableSearch: '' },
  messages: [Message.UpdatedTableSearch],
  handlers: (model: State) => ({
    UpdatedTableSearch: ({ value }: typeof Message.UpdatedTableSearch.Type): UpdateReturn => ({
      model: evo(model, { tableSearch: () => value }),
    }),
  }),
  samples: [Message.UpdatedTableSearch({ value: 'ada' })],
})
