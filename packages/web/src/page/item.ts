import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Demo from '../demo'
import { type DemoItemName, hasDemo } from '../demo/view'
import { itemByName } from '../catalog'
import type { Item } from '../catalog/types'
import { GotDemoMessage, type Message } from '../message'
import type { Model } from '../model'

import { demoExampleByName } from '../demo/examples'
import { collapsibleCodeBlock, installTabs, sidebarView } from './chrome'
import { notFoundView } from './home'

const categoryLabel = (category: Item['category']): string =>
  ({ Base: 'Base', Lib: 'Lib', Components: 'Components', Blocks: 'Blocks' })[category]

const dependencyChips = (
  h: HtmlBuilder<Message>,
  dependencies: ReadonlyArray<string> | undefined,
): ReadonlyArray<Html> =>
  (dependencies ?? []).map((dependency) =>
    h.code(
      [h.Class('rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-muted-foreground')],
      [dependency],
    ),
  )

export const itemPage = (model: Model, name: string, h: HtmlBuilder<Message>): Html => {
  const item = itemByName[name]
  if (item === undefined)
    return h.div(
      [h.Class('mx-auto flex w-full max-w-6xl flex-1')],
      [sidebarView(model, h), h.div([h.Class('flex flex-1')], [notFoundView(h)])],
    )

  const demoName: DemoItemName | undefined = hasDemo(item.name) ? item.name : undefined

  return h.div(
    [h.Class('mx-auto flex w-full max-w-6xl flex-1')],
    [
      sidebarView(model, h),
      h.div(
        [h.Class('flex-1 min-w-0')],
        [
          h.div(
            [h.Class('mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 font-mono')],
            [
              // breadcrumb
              h.nav(
                [h.Class('mb-6 flex items-center gap-2 text-sm text-muted-foreground')],
                [
                  h.a([h.Href('/'), h.Class('transition-colors hover:text-foreground')], ['Registry']),
                  h.span([], ['/']),
                  h.span([h.Class('text-foreground')], [categoryLabel(item.category)]),
                  h.span([], ['/']),
                  h.span([], [item.title]),
                ],
              ),

              // title
              h.div(
                [h.Class('flex flex-wrap items-center gap-2 font-mono')],
                [
                  h.h1([h.Class('text-3xl font-bold tracking-tight sm:text-4xl')], [item.title]),
                  h.span(
                    [
                      h.Class(
                        'rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground',
                      ),
                    ],
                    [item.type],
                  ),
                ],
              ),
              h.p([h.Class('mt-4 text-pretty text-muted-foreground font-mono')], [item.description]),

              // dependencies
              ...(item.maybeDependencies && item.maybeDependencies.length > 0
                ? [
                    h.div(
                      [h.Class('mt-4 flex flex-wrap items-center gap-1.5 font-mono')],
                      [
                        h.span(
                          [h.Class('text-xs font-medium text-muted-foreground')],
                          ['Dependencies:'],
                        ),
                        ...dependencyChips(h, item.maybeDependencies),
                      ],
                    ),
                  ]
                : []),

              // preview + demo code (stacked vertically, per design: [preview/demo code] then [source])
              ...(demoName !== undefined
                ? (() => {
                    const demoExample = demoExampleByName[demoName]
                    return [
                      h.div(
                        [h.Class('mt-10 overflow-hidden rounded-xl border border-border bg-background font-sans')],
                        [
                          h.div(
                            [
                              h.Class(
                                'flex items-center justify-between border-b border-border px-4 py-2.5',
                              ),
                            ],
                            [
                              h.span([h.Class('text-xs font-medium text-muted-foreground')], ['Preview']),
                              h.span(
                                [h.Class('flex items-center gap-1.5 text-xs text-muted-foreground')],
                                ['Interactive demo'],
                              ),
                            ],
                          ),
                          h.div(
                            [h.Class('flex min-h-[260px] items-center justify-center p-6')],
                            [
                              h.submodel({
                                slotId: 'demo-harness',
                                model: model.demo,
                                view: Demo.view,
                                viewInputs: { itemName: demoName! },
                                toParentMessage: (message) => GotDemoMessage({ message }),
                              }),
                            ],
                          ),
                          // Demo usage code — the actual view source, imported ?raw.
                          collapsibleCodeBlock(
                            h,
                            model,
                            `demo:${demoName}`,
                            demoExample.path,
                            demoExample.code,
                            'rounded-none border-x-0 border-b-0 border-t',
                          ),
                        ],
                      ),
                    ]
                  })()
                : []),

              // install
              h.div(
                [h.Class('mt-12 font-mono')],
                [
                  h.h2([h.Class('text-lg font-semibold tracking-tight')], ['Installation']),
                  h.p(
                    [h.Class('mt-2 mb-3 text-sm text-muted-foreground')],
                    ['Add this component to your project:'],
                  ),
                  installTabs(h, model, item.name),
                ],
              ),

              // source — collapsible with same gradient preview, collapsed by default
              ...(item.maybeSource
                ? [
                    h.div(
                      [h.Class('mt-12 font-mono')],
                      [
                        h.h2([h.Class('text-lg font-semibold tracking-tight')], ['Source']),
                        h.p(
                          [h.Class('mt-2 mb-3 text-sm text-muted-foreground')],
                          [
                            'The component ships as plain source — no build step, no wrapper. Copy it and make it yours.',
                          ],
                        ),
                        collapsibleCodeBlock(
                          h,
                          model,
                          `source:${item.name}`,
                          item.maybeSource.path,
                          item.maybeSource.code,
                        ),
                      ],
                    ),
                  ]
                : []),
            ],
          ),
        ],
      ),
    ],
  )
}
