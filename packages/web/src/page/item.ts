import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { createLazy } from 'foldkit/html'

import { Alert } from '../generated/registry/ui/alert'
import { badge } from '../generated/registry/ui/badge'
import { Breadcrumb, breadcrumbLinkClass } from '../generated/registry/ui/breadcrumb'
import { Card } from '../generated/registry/ui/card'
import { cn } from '@/lib/utils'
import { icon } from '../generated/registry/lib/icons'
import { Bug, ExternalLink, TriangleAlert } from 'lucide'

import * as Demo from '../demo'
import { REGISTRY_STYLES, activeRegistryStyle, styleLabel } from '../active-style'
import type { RegistryStyle } from '../active-style'
import { type DemoItemName, hasDemo } from '../demo/view'
import { gapsForItem } from '../catalog/gaps'
import { parityStatus } from '../catalog/parity'
import { incompatibilityIssueUrl } from '../catalog/issues'
import { shadcnUrlFor } from '../catalog/upstream'
import { itemByName } from '../catalog'
import type { Item } from '../catalog/types'
import { Message } from '../message'
import type { Message as AppMessage } from '../message'
import type { Model } from '../model'

import { demoExampleByName } from '../demo/examples'
import { collapsibleCodeBlock, installTabs, sidebarView } from './chrome'
import { notFoundView } from './home'

const categoryLabel = (category: Item['category']): string =>
  ({ Base: 'Base', Lib: 'Lib', Components: 'Components', Blocks: 'Blocks' })[category]

/** Known behavioral differences vs the shadcn/ui counterpart — see catalog/gaps.ts. */
const gapsCallout = (name: string, h: HtmlBuilder<AppMessage>): Html => {
  const gaps = gapsForItem(name)
  if (gaps === undefined) return h.div([], [])
  return Alert<AppMessage>(
    { className: 'mt-4' },
    [
      icon(h, TriangleAlert),
      Alert.title<AppMessage>({}, ['Differences vs shadcn/ui'], h),
      Alert.description<AppMessage>({}, [h.ul([h.Class('list-disc space-y-1 pl-4')], gaps)], h),
    ],
    h,
  )
}

const dependencyChips = (
  h: HtmlBuilder<AppMessage>,
  dependencies: ReadonlyArray<string> | undefined,
): ReadonlyArray<Html> =>
  (dependencies ?? []).map((dependency) =>
    badge<AppMessage>(
      { variant: 'secondary', className: 'font-mono font-normal' },
      [dependency],
      h,
    ),
  )

/** Memo slots for the scroll-stable page subtrees. Args are primitives,
stable catalog strings, child-model refs that keep identity while the demo
updates, or the active registry style — so scroll ticks are cache hits and
VNode construction + subtree diffing are skipped. Every slot's args include
the style: switching styles rebinds the styled primitives, and a hit would
otherwise keep the old tree's classes. One slot per render position. */
const sidebarNotFoundLazy = createLazy()
const sidebarMainLazy = createLazy()
const breadcrumbLazy = createLazy()
const titleRowLazy = createLazy()
const gapsLazy = createLazy()
const depsLazy = createLazy()
const previewHeadLazy = createLazy()
const demoNoteLazy = createLazy()
const installSectionLazy = createLazy()
const sourceSectionLazy = createLazy()
const demoCodeLazy = createLazy()
const sourceCodeLazy = createLazy()

const demoCodeBlock = (
  h: HtmlBuilder<AppMessage>,
  id: string,
  path: string,
  code: string,
  className: string | undefined,
  isCopied: boolean,
  isExpanded: boolean,
  // oxlint-disable-next-line typescript/no-unused-vars
  _style: RegistryStyle,
): Html => collapsibleCodeBlock(h, id, path, code, isCopied, isExpanded, className)

const sourceCodeBlock = (
  h: HtmlBuilder<AppMessage>,
  id: string,
  path: string,
  code: string,
  isCopied: boolean,
  isExpanded: boolean,
  // oxlint-disable-next-line typescript/no-unused-vars
  _style: RegistryStyle,
): Html => collapsibleCodeBlock(h, id, path, code, isCopied, isExpanded)

const pageBreadcrumb = (
  h: HtmlBuilder<AppMessage>,
  itemName: string,
  // oxlint-disable-next-line typescript/no-unused-vars
  _style: RegistryStyle,
): Html => {
  const item = itemByName[itemName]!
  return Breadcrumb<AppMessage>(
    { className: 'mb-6' },
    [
      Breadcrumb.list<AppMessage>(
        {},
        [
          Breadcrumb.item<AppMessage>(
            {},
            [
              h.a(
                [
                  h.Href('/'),
                  h.Class(cn(breadcrumbLinkClass)),
                  h.DataAttribute('slot', 'breadcrumb-link'),
                ],
                ['Registry'],
              ),
            ],
            h,
          ),
          Breadcrumb.separator<AppMessage>({}, [], h),
          Breadcrumb.item<AppMessage>(
            {},
            [Breadcrumb.page<AppMessage>({}, [categoryLabel(item.category)], h)],
            h,
          ),
          Breadcrumb.separator<AppMessage>({}, [], h),
          Breadcrumb.item<AppMessage>(
            {},
            [Breadcrumb.page<AppMessage>({ isCurrent: true }, [item.title], h)],
            h,
          ),
        ],
        h,
      ),
    ],
    h,
  )
}

const titleRow = (
  h: HtmlBuilder<AppMessage>,
  itemName: string,
  // oxlint-disable-next-line typescript/no-unused-vars
  _style: RegistryStyle,
): Html => {
  const item = itemByName[itemName]!
  const upstream = item.category === 'Components' ? shadcnUrlFor(item.name) : undefined
  const gaps = gapsForItem(item.name) ?? []
  const reportUrl = incompatibilityIssueUrl(item.name, gaps, parityStatus(item.name))
  return h.div(
    [h.Class('flex flex-wrap items-center justify-between gap-4 font-mono')],
    [
      h.h1([h.Class('text-3xl font-bold tracking-tight sm:text-4xl')], [item.title]),
      h.div(
        [h.Class('flex items-center overflow-hidden rounded-md border border-border')],
        [
          ...(upstream
            ? [
                h.a(
                  [
                    h.Href(upstream),
                    h.Target('_blank'),
                    h.Rel('noopener noreferrer'),
                    h.Class(
                      'inline-flex items-center justify-center gap-1.5 bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted',
                    ),
                  ],
                  ['View original', icon(h, ExternalLink, 'size-3')],
                ),
                h.div([h.Class('w-px self-stretch bg-border')], []),
              ]
            : []),
          h.a(
            [
              h.Href(reportUrl),
              h.Target('_blank'),
              h.Rel('noopener noreferrer'),
              h.Class(
                'inline-flex items-center justify-center gap-1.5 bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted',
              ),
            ],
            [icon(h, Bug, 'size-3'), 'Report issue'],
          ),
        ],
      ),
    ],
  )
}

const gapsBlock = (
  h: HtmlBuilder<AppMessage>,
  itemName: string,
  // oxlint-disable-next-line typescript/no-unused-vars
  _style: RegistryStyle,
): Html => gapsCallout(itemName, h)

const depsBlock = (
  h: HtmlBuilder<AppMessage>,
  itemName: string,
  // oxlint-disable-next-line typescript/no-unused-vars
  _style: RegistryStyle,
): Html => {
  const dependencies = itemByName[itemName]!.maybeDependencies ?? []
  if (dependencies.length === 0) return h.div([], [])
  return h.div(
    [h.Class('mt-4 flex flex-wrap items-center gap-1.5 font-mono')],
    [
      h.span([h.Class('text-xs font-medium text-muted-foreground')], ['Dependencies:']),
      ...dependencyChips(h, dependencies),
    ],
  )
}

const previewHead = (
  h: HtmlBuilder<AppMessage>,
  selectedStyle: Model['selectedStyle'],
  // oxlint-disable-next-line typescript/no-unused-vars
  _style: RegistryStyle,
): Html =>
  Card.header<AppMessage>(
    {
      className: 'flex flex-wrap items-center justify-between gap-3 border-b py-2.5',
    },
    [
      h.span([h.Class('text-xs font-medium text-muted-foreground')], ['Preview']),
      h.div(
        [h.Class('flex flex-wrap items-center gap-1')],
        [
          h.span([h.Class('mr-1 text-xs text-muted-foreground')], ['Style']),
          h.div(
            [h.Class('flex flex-wrap gap-1')],
            REGISTRY_STYLES.map((style) =>
              h.button(
                [
                  h.Type('button'),
                  h.AriaLabel(`Switch to ${styleLabel(style)} style`),
                  h.AriaPressed(String(selectedStyle === style)),
                  h.DataAttribute('state', selectedStyle === style ? 'on' : 'off'),
                  h.Class(
                    cn(
                      'inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                      selectedStyle === style
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground',
                    ),
                  ),
                  h.OnClick(Message.SelectedRegistryStyle({ style })),
                ],
                [styleLabel(style)],
              ),
            ),
          ),
        ],
      ),
    ],
    h,
  )

const demoNote = (
  h: HtmlBuilder<AppMessage>,
  demoName: DemoItemName,
  // oxlint-disable-next-line typescript/no-unused-vars
  _style: RegistryStyle,
): Html =>
  h.div(
    [h.Class('border-t border-border bg-muted/30 px-4 py-3 font-mono')],
    [
      h.p(
        [h.Class('text-xs leading-relaxed text-muted-foreground')],
        [
          'This code is shown verbatim — it\u2019s the exact file used for this preview. Much of the surrounding wiring (slice, fields, messages, handlers) belongs to this site\u2019s demo harness; you only need the view and the state that matters for your own app. Adapt what you need.',
        ],
      ),
      h.div(
        [h.Class('mt-2 flex flex-wrap items-center gap-2')],
        [
          h.a(
            [
              h.Href(demoExampleByName[demoName]!.githubUrl),
              h.Target('_blank'),
              h.Rel('noopener noreferrer'),
              h.Class(
                'inline-flex items-center gap-1 text-xs font-medium text-foreground underline decoration-1 decoration-border underline-offset-[3px] hover:decoration-foreground',
              ),
            ],
            ['View source on GitHub'],
          ),
        ],
      ),
    ],
  )

const installSection = (
  h: HtmlBuilder<AppMessage>,
  componentName: string,
  selectedValue: Model['selectedPackageManager'],
  installTabsModel: Model['installTabs'],
  maybeCopied: Model['maybeCopiedValue'],
  // oxlint-disable-next-line typescript/no-unused-vars
  _style: RegistryStyle,
): Html =>
  h.div(
    [h.Class('mt-12 font-mono')],
    [
      h.h2([h.Class('text-lg font-semibold tracking-tight')], ['Installation']),
      h.p(
        [h.Class('mt-2 mb-3 text-sm text-muted-foreground')],
        ['Add this component to your project:'],
      ),
      installTabs(h, componentName, selectedValue, installTabsModel, maybeCopied),
    ],
  )

const sourceSection = (
  h: HtmlBuilder<AppMessage>,
  itemName: string,
  path: string,
  code: string,
  isCopied: boolean,
  isExpanded: boolean,
  _style: RegistryStyle,
): Html =>
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
      sourceCodeLazy(sourceCodeBlock, [
        h,
        `source:${itemName}`,
        path,
        code,
        isCopied,
        isExpanded,
        _style,
      ]),
    ],
  )

export const itemPage = (model: Model, name: string, h: HtmlBuilder<AppMessage>): Html => {
  const item = itemByName[name]
  if (item === undefined)
    return h.div(
      [h.Class('mx-auto flex w-full max-w-6xl flex-1')],
      [
        sidebarNotFoundLazy(sidebarView, [h, model.route._tag, name, activeRegistryStyle()]),
        h.div([h.Class('flex flex-1')], [notFoundView(h)]),
      ],
    )

  const demoName: DemoItemName | undefined = hasDemo(item.name) ? item.name : undefined

  return h.div(
    [h.Class('mx-auto flex w-full max-w-6xl flex-1')],
    [
      sidebarMainLazy(sidebarView, [h, 'Item', item.name, activeRegistryStyle()]),
      h.main(
        [h.Class('flex-1 min-w-0')],
        [
          h.div(
            [h.Class('mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 font-mono')],
            [
              breadcrumbLazy(pageBreadcrumb, [h, item.name, activeRegistryStyle()]),

              // title — e.g. "accordion            [view original | report issue]"
              titleRowLazy(titleRow, [h, item.name, activeRegistryStyle()]),
              h.p(
                [h.Class('mt-4 text-pretty text-muted-foreground font-mono')],
                [item.description],
              ),
              gapsLazy(gapsBlock, [h, item.name, activeRegistryStyle()]),

              // dependencies
              depsLazy(depsBlock, [h, item.name, activeRegistryStyle()]),

              // preview + demo code (stacked vertically, per design: [preview/demo code] then [source])
              ...(demoName !== undefined
                ? (() => {
                    const demoExample = demoExampleByName[demoName]!
                    return [
                      Card<AppMessage>(
                        { className: 'mt-10 overflow-hidden font-sans py-0 gap-0' },
                        [
                          previewHeadLazy(previewHead, [
                            h,
                            model.selectedStyle,
                            activeRegistryStyle(),
                          ]),
                          // Sidebar wants a viewport-level shell (fixed inset-y-0,
                          // peer margins) — the centered justify-center/p-6 card
                          // gives it a narrow flex child and lets the fixed
                          // container escape to the document. Render it full-bleed
                          // with a transform isolation so the fixed shell is
                          // contained inside the preview.
                          ...(demoName === 'sidebar'
                            ? [
                                h.div(
                                  [h.Class('p-0'), h.Style({ transform: 'translateZ(0)' })],
                                  [
                                    h.submodel({
                                      slotId: 'demo-harness',
                                      model: model.demo,
                                      view: Demo.view,
                                      viewInputs: { itemName: demoName! },
                                      toParentMessage: (message) =>
                                        Message.GotDemoMessage({ message }),
                                    }),
                                  ],
                                ),
                              ]
                            : [
                                // 400px (up from 260px) so Floating UI-anchored
                                // panels (Popover/HoverCard/nav-menu dropdowns) have
                                // room to open without clipping inside this box.
                                h.div(
                                  [h.Class('flex min-h-[400px] items-center justify-center p-6')],
                                  [
                                    h.submodel({
                                      slotId: 'demo-harness',
                                      model: model.demo,
                                      view: Demo.view,
                                      viewInputs: { itemName: demoName! },
                                      toParentMessage: (message) =>
                                        Message.GotDemoMessage({ message }),
                                    }),
                                  ],
                                ),
                              ]),
                          // Demo usage code — the actual view source, imported ?raw.
                          demoCodeLazy(demoCodeBlock, [
                            h,
                            `demo:${demoName}`,
                            demoExample.path,
                            demoExample.code,
                            'rounded-none border-x-0 border-b-0 border-t',
                            Option.exists(model.maybeCopiedValue, (v) => v === demoExample.code),
                            model.expandedCodeBlocks.has(`demo:${demoName}`),
                            activeRegistryStyle(),
                          ]),
                          demoNoteLazy(demoNote, [h, demoName, activeRegistryStyle()]),
                        ],
                        h,
                      ),
                    ]
                  })()
                : []),

              // install
              installSectionLazy(installSection, [
                h,
                item.name,
                model.selectedPackageManager,
                model.installTabs,
                model.maybeCopiedValue,
                activeRegistryStyle(),
              ]),

              // source — collapsible with same gradient preview, collapsed by default
              ...(item.maybeSource
                ? [
                    sourceSectionLazy(sourceSection, [
                      h,
                      item.name,
                      item.maybeSource.path,
                      item.maybeSource.code,
                      Option.exists(model.maybeCopiedValue, (v) => v === item.maybeSource!.code),
                      model.expandedCodeBlocks.has(`source:${item.name}`),
                      activeRegistryStyle(),
                    ]),
                  ]
                : []),
            ],
          ),
        ],
      ),
    ],
  )
}
