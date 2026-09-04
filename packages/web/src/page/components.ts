import type { Html, HtmlBuilder } from 'foldkit/html'
import { createLazy } from 'foldkit/html'

import { badge } from '../generated/registry/ui/badge'
import { separator } from '../generated/registry/ui/separator'

import { items } from '../catalog'
import { requestComponentUrl } from '../catalog/issues'
import type { Category, Item } from '../catalog/types'
import type { Message } from '../message'
import type { Model } from '../model'
import { sidebarView } from './chrome'
import { activeRegistryStyle } from '../active-style'

const GROUP_ORDER: ReadonlyArray<{
  category: Category
  label: string
  description: string
}> = [
  {
    category: 'Base',
    label: 'Base',
    description: 'The foundation: theme variables, base CSS, and core dependencies.',
  },
  {
    category: 'Lib',
    label: 'Lib',
    description: 'Utilities and helpers used across the registry.',
  },
  {
    category: 'Components',
    label: 'Components',
    description: 'The styled primitives: stateless helpers and stateful submodels.',
  },
  {
    category: 'Blocks',
    label: 'Blocks',
    description: 'Composed pages that combine primitives into ready-to-use sections.',
  },
]

const row = (item: Item, h: HtmlBuilder<Message>): Html =>
  h.li(
    [h.Class('mt-[0.375rem]')],
    [
      h.a(
        [
          h.Href(`/docs/${item.name}`),
          h.Class(
            'text-foreground underline decoration-1 decoration-border underline-offset-[3px] hover:decoration-foreground',
          ),
        ],
        [item.title],
      ),
      ' — ',
      item.description,
    ],
  )

const sidebarLazy = createLazy()

export const componentsIndexView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('mx-auto flex w-full max-w-6xl flex-1')],
    [
      sidebarLazy(sidebarView, [h, 'Components', undefined, activeRegistryStyle()]),
      h.div(
        [
          h.Class(
            'mx-auto w-full max-w-3xl px-4 py-10 font-mono text-[15px] leading-[1.7] text-muted-foreground sm:px-6',
          ),
        ],
        [
          h.h1(
            [
              h.Class(
                "text-3xl font-bold leading-[1.2] tracking-[-0.01em] text-foreground before:content-['#_'] before:font-normal before:text-muted-foreground",
              ),
            ],
            ['Components'],
          ),
          h.p(
            [h.Class('mt-5')],
            [
              'Every item in the foldcn registry — copy-paste source built on @foldkit/ui with Foldkit TEA and Tailwind CSS.',
            ],
          ),
          ...GROUP_ORDER.flatMap((group, index) => {
            const groupItems = items.filter((item) => item.category === group.category)
            if (groupItems.length === 0) return []
            return [
              ...(index > 0 ? [separator<Message>({ className: 'mt-10' }, h)] : []),
              h.div(
                [h.Class('mt-10 flex items-center gap-2')],
                [
                  h.h2(
                    [
                      h.Class(
                        "text-[1.375rem] font-semibold leading-[1.25] text-foreground before:content-['##_'] before:font-normal before:text-muted-foreground",
                      ),
                    ],
                    [group.label],
                  ),
                  badge<Message>(
                    { variant: 'secondary', className: 'tabular-nums' },
                    [String(groupItems.length)],
                    h,
                  ),
                ],
              ),
              h.p([h.Class('mt-5')], [group.description]),
              h.ul(
                [h.Class('mt-5 list-disc pl-5')],
                groupItems.map((item) => row(item, h)),
              ),
            ]
          }),
          separator<Message>({ className: 'mt-10' }, h),
          h.div(
            [h.Class('mt-10 rounded-lg border border-border bg-muted/20 px-4 py-4')],
            [
              h.h2([h.Class('text-base font-semibold text-foreground')], ['Missing a component?']),
              h.p(
                [h.Class('mt-2 text-sm text-muted-foreground')],
                [
                  'Can\u0027t find what you need? Request a component and we\u0027ll consider adding it.',
                ],
              ),
              h.a(
                [
                  h.Href(requestComponentUrl()),
                  h.Target('_blank'),
                  h.Rel('noopener noreferrer'),
                  h.Class(
                    'mt-3 inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted',
                  ),
                ],
                ['Request a component \u2192'],
              ),
            ],
          ),
        ],
      ),
    ],
  )
