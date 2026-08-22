import type { Html, HtmlBuilder } from 'foldkit/html'

import { icon } from '@foldcn/registry/styles/default/lib/icons'
import { Check, ChevronDown, ChevronLeft, ChevronRight, Minus, X } from 'lucide'

import type { Message } from '../message'
import type { Model } from '../model'

const ICON_ROWS: ReadonlyArray<ReadonlyArray<[string, (h: HtmlBuilder<Message>) => Html]>> = [
  [
    ['check', (h) => icon(h, Check)],
    ['chevron-down', (h) => icon(h, ChevronDown)],
    ['chevron-left', (h) => icon(h, ChevronLeft)],
    ['chevron-right', (h) => icon(h, ChevronRight)],
    ['minus', (h) => icon(h, Minus)],
    ['x', (h) => icon(h, X)],
  ],
]

export const iconsView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('w-full max-w-lg')],
    [
      h.p(
        [h.Class('mb-4 text-sm text-muted-foreground')],
        [
          'Lucide icons rendered as Foldkit virtual DOM via the h builder. Import `icon(h, node, className?)` from `@foldcn/registry/styles/default/lib/icons`.',
        ],
      ),
      ...ICON_ROWS.map((row) =>
        h.div(
          [h.Class('mb-2 grid grid-cols-6 gap-2')],
          row.map(([label, render]) =>
            h.div(
              [
                h.Class(
                  'flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 text-muted-foreground',
                ),
              ],
              [render(h), h.span([h.Class('text-[11px]')], [label])],
            ),
          ),
        ),
      ),
    ],
  )
