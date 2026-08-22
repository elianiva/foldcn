import type { Html, HtmlBuilder } from 'foldkit/html'

import { dataTable } from '@foldcn/registry/styles/default/blocks/data-table/data-table'

import { UpdatedTableSearch, type Message } from '../message'
import type { Model } from '../model'
import { filteredRows } from '../update'

const TABLE_COLUMNS = [
  { key: 'name', title: 'Name' },
  { key: 'email', title: 'Email' },
  { key: 'plan', title: 'Plan', align: 'right' as const },
  { key: 'status', title: 'Status', align: 'right' as const },
]

export const dataTableView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('w-full rounded-xl border border-border')],
    [
      dataTable<Message>(
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
          onSearchInput: (value) => UpdatedTableSearch({ value }),
        },
        h,
      ),
    ],
  )
