import type { Html, HtmlBuilder } from 'foldkit/html'

import { Table } from '@foldcn/registry/styles/default/ui/table'

import type { Message } from '../message'
import type { Model } from '../model'

export const tableView = (model: Model, h: HtmlBuilder<Message>): Html =>
  Table(
    {},
    [
      Table.caption({}, ['A list of recent invoices.'], h),
      Table.header(
        {},
        [
          Table.row(
            {},
            [
              Table.head({}, ['Invoice'], h),
              Table.head({}, ['Status'], h),
              Table.head({}, ['Amount'], h),
            ],
            h,
          ),
        ],
        h,
      ),
      Table.body(
        {},
        [
          Table.row(
            {},
            [Table.cell({}, ['INV001'], h), Table.cell({}, ['Paid'], h), Table.cell({}, ['$250.00'], h)],
            h,
          ),
          Table.row(
            {},
            [Table.cell({}, ['INV002'], h), Table.cell({}, ['Pending'], h), Table.cell({}, ['$150.00'], h)],
            h,
          ),
          Table.row(
            {},
            [Table.cell({}, ['INV003'], h), Table.cell({}, ['Unpaid'], h), Table.cell({}, ['$350.00'], h)],
            h,
          ),
        ],
        h,
      ),
    ],
    h,
  )
