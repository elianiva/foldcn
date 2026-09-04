import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Tabs from '@foldkit/ui/tabs'

import { cn } from '@/lib/utils'
import { codeBlock as registryCodeBlock } from '../generated/registry/lib/code-block'
import { copyButton as registryCopyButton } from '../generated/registry/lib/copy-button'
import { icon } from '../generated/registry/lib/icons'
import { badge } from '../generated/registry/ui/badge'
import { separator } from '../generated/registry/ui/separator'
import { styledViewInputs as tabsStyledViewInputs } from '../generated/registry/ui/tabs'
import * as toggleGroup from '../generated/registry/ui/toggle-group'
import { ArrowRight, Computer, Moon, Sun } from 'lucide'

import { Message } from '../message'
import type { Message as AppMessage } from '../message'
import type { Model, PackageManager } from '../model'
import type { RegistryStyle } from '../active-style'

import { categoryGroups } from '../catalog'
import { gapsForItem } from '../catalog/gaps'
import { requestComponentUrl } from '../catalog/issues'
import {
  parityIcon,
  parityLabel,
  parityStatus,
  parityTitle,
  parityTitleForItem,
  parityVariant,
  type ParityStatus,
} from '../catalog/parity'

const betaBadge = (h: HtmlBuilder<AppMessage>): Html =>
  badge<AppMessage>(
    {
      variant: 'outline',
      className:
        'h-5 border-red-500/25 bg-red-500/10 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-300',
    },
    ['Beta'],
    h,
  )

export const themeSelector = (
  h: HtmlBuilder<AppMessage>,
  themeToggle: Model['themeToggleGroup'],
): Html =>
  h.submodel({
    slotId: themeToggle.id,
    model: themeToggle,
    view: toggleGroup.view,
    viewInputs: {
      variant: 'outline',
      size: 'sm',
      spacing: 0,
      ariaLabel: 'Theme preference',
      items: [
        { value: 'Light', label: '', icon: Sun, ariaLabel: 'Light mode' },
        { value: 'System', label: '', icon: Computer, ariaLabel: 'System mode' },
        { value: 'Dark', label: '', icon: Moon, ariaLabel: 'Dark mode' },
      ],
    },
    toParentMessage: (message) => Message.GotThemeToggleGroupMessage({ message }),
  })

export const headerView = (
  h: HtmlBuilder<AppMessage>,
  themeToggle: Model['themeToggleGroup'],
  // Cache key only: style switching rebinds the styled primitives, so the
  // memoized VNode must rebuild for the new tree. Unused by design.
  // oxlint-disable-next-line typescript/no-unused-vars
  _style: RegistryStyle,
): Html => {
  return h.header(
    [h.Class('py-4 font-mono')],
    [
      h.div(
        [
          h.Class(
            'mx-auto flex h-10 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6',
          ),
        ],
        [
          h.a(
            [h.Href('/'), h.Class('flex items-center gap-2 font-semibold tracking-tight')],
            [
              h.span(
                [
                  h.Class(
                    'flex size-5 items-center justify-center rounded bg-foreground text-background',
                  ),
                ],
                [h.span([h.Class('text-[11px] leading-none font-black')], ['F'])],
              ),
              h.span([], ['foldcn']),
              betaBadge(h),
            ],
          ),
          h.div(
            [h.Class('flex items-center gap-4')],
            [
              h.a(
                [
                  h.Href('/docs'),
                  h.Class(
                    'hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block',
                  ),
                ],
                ['Docs'],
              ),
              h.a(
                [
                  h.Href('https://github.com/elianiva/foldcn'),
                  h.Target('_blank'),
                  h.Rel('noopener noreferrer'),
                  h.Class(
                    'hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex',
                  ),
                  h.AriaLabel('View source on GitHub'),
                ],
                ['GitHub'],
              ),
              themeSelector(h, themeToggle),
            ],
          ),
        ],
      ),
    ],
  )
}

const parityBadge = (status: ParityStatus, h: HtmlBuilder<AppMessage>): Html =>
  badge<AppMessage>(
    { variant: parityVariant[status], className: 'h-5 shrink-0 gap-1 px-1.5' },
    [icon(h, parityIcon[status], 'size-3'), h.span([h.Class('sr-only')], [parityLabel[status]])],
    h,
  )

const parityLegendBadge = (status: ParityStatus, h: HtmlBuilder<AppMessage>): Html =>
  badge<AppMessage>(
    { variant: parityVariant[status], className: 'h-5 gap-1 px-2 text-xs' },
    [icon(h, parityIcon[status], 'size-3'), parityLabel[status]],
    h,
  )

export const sidebarView = (
  h: HtmlBuilder<AppMessage>,
  routeTag: string,
  routeName: string | undefined,
  // oxlint-disable-next-line typescript/no-unused-vars
  _style: RegistryStyle,
): Html => {
  const componentsGroup = categoryGroups.find((g) => g.category === 'Components')
  const components = componentsGroup?.items ?? []
  const counts = {
    full: components.filter((i) => parityStatus(i.name) === 'full').length,
    diverged: components.filter((i) => parityStatus(i.name) === 'diverged').length,
    'foldcn-only': components.filter((i) => parityStatus(i.name) === 'foldcn-only').length,
  } as const

  return h.aside(
    [h.Class('hidden w-[220px] shrink-0 font-mono lg:block'), h.AriaLabel('Sidebar')],
    [
      h.div(
        [
          h.Class(
            'sticky top-10 h-[calc(100vh-2.5rem)] overflow-y-auto overflow-x-visible border-r border-border py-6 pr-4',
          ),
        ],
        [
          h.div(
            [h.Class('mb-6 rounded-lg border border-border bg-muted/20 px-3 py-3')],
            [
              h.p(
                [h.Class('text-xs font-semibold tracking-wide text-foreground')],
                ['Parity with shadcn/ui'],
              ),
              h.ul(
                [h.Class('mt-2 flex flex-col gap-2')],
                [
                  h.li(
                    [h.Class('flex items-center justify-between gap-2')],
                    [
                      parityLegendBadge('full', h),
                      h.span(
                        [h.Class('text-xs tabular-nums text-muted-foreground')],
                        [String(counts.full)],
                      ),
                    ],
                  ),
                  h.li(
                    [h.Class('flex items-center justify-between gap-2')],
                    [
                      parityLegendBadge('diverged', h),
                      h.span(
                        [h.Class('text-xs tabular-nums text-muted-foreground')],
                        [String(counts.diverged)],
                      ),
                    ],
                  ),
                  h.li(
                    [h.Class('flex items-center justify-between gap-2')],
                    [
                      parityLegendBadge('foldcn-only', h),
                      h.span(
                        [h.Class('text-xs tabular-nums text-muted-foreground')],
                        [String(counts['foldcn-only'])],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          h.nav(
            [h.Class('flex flex-col gap-6'), h.AriaLabel('Components')],
            categoryGroups.map((group) => {
              const sortedItems = [...group.items].sort((a, b) => a.title.localeCompare(b.title))
              const isComponentsGroup = group.category === 'Components'
              return h.div(
                [h.Class('flex flex-col gap-2')],
                [
                  h.h3(
                    [h.Class('px-2 text-xs font-semibold tracking-wide text-foreground')],
                    [group.label],
                  ),
                  h.ul(
                    [h.Class('flex flex-col gap-0.5')],
                    sortedItems.map((item) => {
                      const isActive = routeTag === 'Item' && routeName === item.name
                      const status: ParityStatus | null = isComponentsGroup
                        ? parityStatus(item.name)
                        : null
                      const badgeTitle =
                        status === null
                          ? ''
                          : status === 'diverged'
                            ? (gapsForItem(item.name)?.[0] ?? parityTitle.diverged)
                            : parityTitleForItem(item.name)
                      return h.li(
                        [],
                        [
                          h.a(
                            [
                              h.Href(`/docs/${item.name}`),
                              h.Class(
                                cn(
                                  'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                                  isActive
                                    ? 'bg-muted font-medium text-foreground'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                                ),
                              ),
                              ...(isActive ? [h.AriaCurrent('page')] : []),
                              ...(status !== null
                                ? [
                                    h.Title(badgeTitle),
                                    h.AriaLabel(`${item.title} — ${badgeTitle}`),
                                  ]
                                : []),
                            ],
                            [
                              h.span([h.Class('truncate')], [item.title]),
                              status !== null ? parityBadge(status, h) : h.span([], []),
                            ],
                          ),
                        ],
                      )
                    }),
                  ),
                ],
              )
            }),
          ),
          h.div(
            [h.Class('mt-6 rounded-lg border border-border bg-muted/20 px-3 py-3')],
            [
              h.p([h.Class('text-xs font-medium text-foreground')], ['Missing something?']),
              h.p(
                [h.Class('mt-1 text-xs leading-relaxed text-muted-foreground')],
                ['Request a component'],
              ),
              h.a(
                [
                  h.Href(requestComponentUrl()),
                  h.Target('_blank'),
                  h.Rel('noopener noreferrer'),
                  h.Class(
                    'mt-2 inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted',
                  ),
                ],
                ['Request a component →'],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

export const footerView = (
  h: HtmlBuilder<AppMessage>,
  // oxlint-disable-next-line typescript/no-unused-vars
  _style: RegistryStyle,
): Html => {
  return h.footer(
    [h.Class('font-mono')],
    [
      separator<AppMessage>({}, h),
      h.div(
        [
          h.Class(
            'mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6',
          ),
        ],
        [
          h.p([], ['MIT licensed.']),
          h.div(
            [h.Class('flex flex-wrap items-center gap-x-4 gap-y-1')],
            [
              h.a(
                [
                  h.Href('https://github.com/elianiva/foldcn'),
                  h.Target('_blank'),
                  h.Rel('noopener noreferrer'),
                  h.Class('underline underline-offset-4 hover:text-foreground'),
                ],
                ['GitHub'],
              ),
              h.a(
                [
                  h.Href('https://foldkit.dev'),
                  h.Target('_blank'),
                  h.Rel('noopener noreferrer'),
                  h.Class('underline underline-offset-4 hover:text-foreground'),
                ],
                ['Foldkit'],
              ),
              h.a(
                [
                  h.Href('https://ui.shadcn.com'),
                  h.Target('_blank'),
                  h.Rel('noopener noreferrer'),
                  h.Class('underline underline-offset-4 hover:text-foreground'),
                ],
                ['shadcn/ui'],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

export const copyButton = (
  h: HtmlBuilder<AppMessage>,
  value: string,
  maybeCopied: Option.Option<string>,
): Html =>
  registryCopyButton<AppMessage>(
    {
      value,
      onCopy: Message.ClickedCopy({ value }),
      isCopied: Option.exists(maybeCopied, (v) => v === value),
    },
    h,
  )

export const installLine = (h: HtmlBuilder<AppMessage>, model: Model, command: string): Html =>
  h.div(
    [
      h.Class(
        'flex w-full items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2',
      ),
    ],
    [
      h.code(
        [h.Class('select-all overflow-x-auto whitespace-nowrap font-mono text-[13px]')],
        [command],
      ),
      copyButton(h, command, model.maybeCopiedValue),
    ],
  )

export const codeBlock = (
  h: HtmlBuilder<AppMessage>,
  model: Model,
  path: string,
  code: string,
): Html =>
  registryCodeBlock(
    {
      path,
      code,
      onCopy: Message.ClickedCopy({ value: code }),
      isCopied: Option.exists(model.maybeCopiedValue, (v) => v === code),
    },
    h,
  )

export const collapsibleCodeBlock = (
  h: HtmlBuilder<AppMessage>,
  id: string,
  path: string,
  code: string,
  isCopied: boolean,
  isExpanded: boolean,
  className?: string,
): Html =>
  registryCodeBlock<AppMessage>(
    {
      path,
      code,
      onCopy: Message.ClickedCopy({ value: code }),
      isCopied,
      isCollapsible: true,
      isExpanded,
      onToggle: Message.ToggledCodeBlock({ id }),
      className,
    },
    h,
  )

export const sectionLink = (h: HtmlBuilder<AppMessage>, href: string, label: string): Html =>
  h.a(
    [
      h.Href(href),
      h.Class(
        'inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline',
      ),
    ],
    [label, icon(h, ArrowRight, 'size-3.5')],
  )

const PackageManagerTabs = Tabs.create<PackageManager>()

const PACKAGE_MANAGER_COMMANDS: Record<PackageManager, string> = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  bun: 'bunx',
}

const installCommand = (packageManager: PackageManager, componentName: string): string =>
  `${PACKAGE_MANAGER_COMMANDS[packageManager]} shadcn@latest add @foldcn/${componentName}`

export const installTabs = (
  h: HtmlBuilder<AppMessage>,
  componentName: string,
  selectedValue: Model['selectedPackageManager'],
  installTabsModel: Model['installTabs'],
  maybeCopied: Model['maybeCopiedValue'],
): Html =>
  h.submodel({
    slotId: 'install-tabs',
    model: installTabsModel,
    view: PackageManagerTabs.view,
    viewInputs: tabsStyledViewInputs<Message, PackageManager>(
      {
        tabs: ['pnpm', 'npm', 'bun'],
        selectedValue,
        ariaLabel: 'Package manager',
        variant: 'line',
        panel: (tab, _render, h) => {
          const command = installCommand(tab, componentName)
          return h.div(
            [
              h.Class(
                'flex w-full items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2',
              ),
            ],
            [
              h.code(
                [h.Class('select-all overflow-x-auto whitespace-nowrap font-mono text-[13px]')],
                [command],
              ),
              copyButton(h, command, maybeCopied),
            ],
          )
        },
      },
      h,
    ),
    toParentMessage: (message) => Message.GotInstallTabsMessage({ message }),
  })
