// Sections mirror apps/v4/examples/base/pagination-{demo,simple,icons-only}.tsx.
// Pagination is fully presentational — no state, no messages; the slice is
// empty but keeps the harness contract (fields/init/messages/handlers).

import type { Html, HtmlBuilder } from 'foldkit/html'

import { Pagination } from '../../generated/registry/ui/pagination'

import { defineSlice } from '../slice'
import type { Message, Model } from '../assemble'

const section = (h: HtmlBuilder<Message>, label: string, content: Html): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-2')],
    [h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], [label]), content],
  )

export const paginationView = (_model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      section(
        h,
        'Basic',
        Pagination(
          {},
          [
            Pagination.content(
              {},
              [
                Pagination.item({}, [Pagination.previous({}, [], h)], h),
                Pagination.item({}, [Pagination.link({}, ['1'], h)], h),
                Pagination.item({}, [Pagination.link({ isActive: true }, ['2'], h)], h),
                Pagination.item({}, [Pagination.link({}, ['3'], h)], h),
                Pagination.item({}, [Pagination.ellipsis({}, [], h)], h),
                Pagination.item({}, [Pagination.next({}, [], h)], h),
              ],
              h,
            ),
          ],
          h,
        ),
      ),
      section(
        h,
        'Simple',
        Pagination(
          {},
          [
            Pagination.content(
              {},
              [
                Pagination.item({}, [Pagination.link({}, ['1'], h)], h),
                Pagination.item({}, [Pagination.link({ isActive: true }, ['2'], h)], h),
                Pagination.item({}, [Pagination.link({}, ['3'], h)], h),
                Pagination.item({}, [Pagination.link({}, ['4'], h)], h),
                Pagination.item({}, [Pagination.link({}, ['5'], h)], h),
              ],
              h,
            ),
          ],
          h,
        ),
      ),
      section(
        h,
        'Icons Only',
        h.div(
          [h.Class('flex items-center justify-between gap-4')],
          [
            h.div([h.Class('text-sm text-muted-foreground')], ['Rows per page: 25']),
            Pagination(
              { className: 'mx-0 w-auto' },
              [
                Pagination.content(
                  {},
                  [
                    Pagination.item({}, [Pagination.previous({}, [], h)], h),
                    Pagination.item({}, [Pagination.next({}, [], h)], h),
                  ],
                  h,
                ),
              ],
              h,
            ),
          ],
        ),
      ),
    ],
  )

export const slice = defineSlice({
  fields: {},
  init: {},
  messages: [],
  handlers: () => ({}),
})
