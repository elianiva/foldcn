import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

type Child = Html | string

// Table is a pure presentational primitive. `Table` is the container
// (`table`); sub-builders are attached as properties: Table.header, Table.body,
// Table.footer, Table.row, Table.head, Table.cell, Table.caption.
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/table.tsx. Class strings are identical to
// upstream; visual styling lives in the central foldcn style definition.

export const tableContainerClass = 'cn-table-container'

export const tableClass = 'cn-table'

export const tableHeaderClass = 'cn-table-header'

export const tableBodyClass = 'cn-table-body'

export const tableFooterClass = 'cn-table-footer'

export const tableRowClass = 'cn-table-row has-aria-expanded:bg-muted/50'

export const tableHeadClass = 'cn-table-head'

export const tableCellClass = 'cn-table-cell'

export const tableCaptionClass = 'cn-table-caption'

type StyleConfig = Readonly<{ className?: string }>

const tableContainer = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.div(
    [h.Class(cn(tableContainerClass)), h.DataAttribute('slot', 'table-container')],
    [h.table([h.Class(cn(tableClass, config.className)), h.DataAttribute('slot', 'table')], children)],
  )

const tableHeader = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.thead([h.Class(cn(tableHeaderClass)), h.DataAttribute('slot', 'table-header')], children)

const tableBody = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.tbody([h.Class(cn(tableBodyClass)), h.DataAttribute('slot', 'table-body')], children)

const tableFooter = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.tfoot([h.Class(cn(tableFooterClass)), h.DataAttribute('slot', 'table-footer')], children)

const tableRow = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.tr([h.Class(cn(tableRowClass, config.className)), h.DataAttribute('slot', 'table-row')], children)

const tableHead = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.th([h.Class(cn(tableHeadClass, config.className)), h.DataAttribute('slot', 'table-head')], children)

const tableCell = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.td([h.Class(cn(tableCellClass, config.className)), h.DataAttribute('slot', 'table-cell')], children)

const tableCaption = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.caption([h.Class(cn(tableCaptionClass, config.className)), h.DataAttribute('slot', 'table-caption')], children)

/** Composable table — `Table` is the container, with sub-builders as
 *  properties: `Table.header`, `Table.body`, `Table.footer`, `Table.row`,
 *  `Table.head`, `Table.cell`, `Table.caption`. */
export const Table = Object.assign(tableContainer, {
  header: tableHeader,
  body: tableBody,
  footer: tableFooter,
  row: tableRow,
  head: tableHead,
  cell: tableCell,
  caption: tableCaption,
})
