import { clsx } from 'clsx'
import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Tabs from '@foldkit/ui/tabs'

import { codeBlock as registryCodeBlock } from '@foldcn/registry/styles/default/lib/code-block'
import { copyButton as registryCopyButton } from '@foldcn/registry/styles/default/lib/copy-button'
import { icon } from '@foldcn/registry/styles/default/lib/icons'
import { styledViewInputs as tabsStyledViewInputs } from '@foldcn/registry/styles/default/ui/tabs'
import { ArrowRight, Computer, Moon, Sun } from 'lucide'

import {
  ClickedCopy,
  GotInstallTabsMessage,
  SelectedThemePreference,
  ToggledCodeBlock,
  type Message,
} from '../message'
import type { Model, PackageManager, ThemePreference } from '../model'

import { categoryGroups, componentCount } from '../catalog'

const THEME_OPTIONS: ReadonlyArray<{
  preference: ThemePreference
  label: string
  icon: (h: HtmlBuilder<Message>) => Html
}> = [
  { preference: 'Light', label: 'Light mode', icon: (h) => icon(h, Sun) },
  { preference: 'System', label: 'System mode', icon: (h) => icon(h, Computer) },
  { preference: 'Dark', label: 'Dark mode', icon: (h) => icon(h, Moon) },
]

export const themeSelector = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Role('group'),
      h.AriaLabel('Theme preference'),
      h.Class(
        'flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5 font-sans',
      ),
    ],
    THEME_OPTIONS.map(({ preference, label, icon }) => {
      const isActive = Option.exists(model.maybeThemePreference, (p) => p === preference)
      return h.button(
        [
          h.AriaPressed(String(isActive)),
          h.Class(
            clsx(
              'rounded p-1.5 transition cursor-pointer',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ),
          ),
          h.AriaLabel(label),
          h.OnClick(SelectedThemePreference({ preference })),
        ],
        [icon(h)],
      )
    }),
  )

export const headerView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.header(
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
              themeSelector(model, h),
            ],
          ),
        ],
      ),
    ],
  )

export const sidebarView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.aside(
    [h.Class('hidden w-[220px] shrink-0 font-mono lg:block'), h.AriaLabel('Sidebar')],
    [
      h.div(
        [
          h.Class(
            'sticky top-10 h-[calc(100vh-2.5rem)] overflow-y-auto border-r border-border py-6 pr-4',
          ),
        ],
        [
          h.nav(
            [h.Class('flex flex-col gap-6'), h.AriaLabel('Components')],
            categoryGroups.map((group) => {
              const sortedItems = [...group.items].sort((a, b) => a.title.localeCompare(b.title))
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
                      const isActive = model.route._tag === 'Item' && model.route.name === item.name
                      return h.li(
                        [],
                        [
                          h.a(
                            [
                              h.Href(`/docs/${item.name}`),
                              h.Class(
                                clsx(
                                  'flex rounded-md px-2 py-1.5 text-sm transition-colors',
                                  isActive
                                    ? 'bg-muted font-medium text-foreground'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                                ),
                              ),
                              ...(isActive ? [h.AriaCurrent('page')] : []),
                            ],
                            [item.title],
                          ),
                        ],
                      )
                    }),
                  ),
                ],
              )
            }),
          ),
        ],
      ),
    ],
  )

export const footerView = (h: HtmlBuilder<Message>): Html =>
  h.footer(
    [h.Class('border-t border-border font-mono')],
    [
      h.div(
        [
          h.Class(
            'mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:px-6',
          ),
        ],
        [
          h.p(
            [],
            [
              'foldcn — ',
              String(componentCount),
              ' copy-paste components for ',
              h.a(
                [
                  h.Href('https://foldkit.dev'),
                  h.Class('underline underline-offset-4 hover:text-foreground'),
                  h.Rel('noopener noreferrer'),
                ],
                ['Foldkit'],
              ),
              '. Built on @foldkit/ui with Foldkit TEA and Tailwind CSS.',
            ],
          ),
        ],
      ),
    ],
  )

export const copyButton = (
  h: HtmlBuilder<Message>,
  value: string,
  maybeCopied: Option.Option<string>,
): Html =>
  registryCopyButton<Message>(
    {
      value,
      onCopy: ClickedCopy({ value }),
      isCopied: Option.exists(maybeCopied, (v) => v === value),
    },
    h,
  )

export const installLine = (h: HtmlBuilder<Message>, model: Model, command: string): Html =>
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
  h: HtmlBuilder<Message>,
  model: Model,
  path: string,
  code: string,
): Html =>
  registryCodeBlock(
    {
      path,
      code,
      onCopy: ClickedCopy({ value: code }),
      isCopied: Option.exists(model.maybeCopiedValue, (v) => v === code),
    },
    h,
  )

export const collapsibleCodeBlock = (
  h: HtmlBuilder<Message>,
  model: Model,
  id: string,
  path: string,
  code: string,
  className?: string,
): Html =>
  registryCodeBlock<Message>(
    {
      path,
      code,
      onCopy: ClickedCopy({ value: code }),
      isCopied: Option.exists(model.maybeCopiedValue, (v) => v === code),
      isCollapsible: true,
      isExpanded: model.expandedCodeBlocks.has(id),
      onToggle: ToggledCodeBlock({ id }),
      className,
    },
    h,
  )

export const sectionLink = (h: HtmlBuilder<Message>, href: string, label: string): Html =>
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

export const installTabs = (h: HtmlBuilder<Message>, model: Model, componentName: string): Html =>
  h.submodel({
    slotId: 'install-tabs',
    model: model.installTabs,
    view: PackageManagerTabs.view,
    viewInputs: tabsStyledViewInputs<Message, PackageManager>(
      {
        tabs: ['pnpm', 'npm', 'bun'],
        selectedValue: model.selectedPackageManager,
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
              copyButton(h, command, model.maybeCopiedValue),
            ],
          )
        },
      },
      h,
    ),
    toParentMessage: (message) => GotInstallTabsMessage({ message }),
  })
