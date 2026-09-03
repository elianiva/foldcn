import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { Alert } from '../generated/registry/ui/alert'
import { badge } from '../generated/registry/ui/badge'
import { codeBlock as registryCodeBlock } from '../generated/registry/lib/code-block'
import { separator } from '../generated/registry/ui/separator'

import { componentCount } from '../catalog'
import { Message } from '../message'
import type { Message as AppMessage } from '../message'
import type { Model } from '../model'

const AGENT_PROMPT = `Set up foldcn in this project.

Foldcn is a shadcn-compatible registry for Foldkit (not React). Follow these steps exactly:

1. Prerequisites: This must be a Foldkit project with Tailwind CSS v4. Ensure the Tailwind entry file (e.g. src/index.css) contains @import "tailwindcss"; — without it the shadcn CLI crashes with a cryptic proxyOf error. See https://foldkit.dev for Foldkit setup.

2. Initialize shadcn if needed: If no components.json exists, run npx shadcn@latest init per https://ui.shadcn.com/docs/installation and configure aliases (components/ui/lib/hooks). Keep your existing components.json otherwise.

3. Register the @foldcn namespace: Run npx shadcn@latest registry add @foldcn=https://foldcn.elianiva.com/r/{name}.json — or add "registries": { "@foldcn": "https://foldcn.elianiva.com/r/{name}.json" } to components.json manually.

4. Install the base style: npx shadcn@latest add @foldcn/foldcn — this writes the theme variables (:root/.dark + @theme inline) and installs foldkit, effect, @foldkit/ui, cn, lucide, tw-animate-css.

5. Add components as needed: npx shadcn@latest add @foldcn/button @foldcn/dialog (replace with the components you need). pnpm dlx / bunx work too.

Docs: https://foldcn.elianiva.com — every page has a Markdown twin for agents: /llms.txt index, /docs/<name>.md per component, or request with Accept: text/markdown.`

export const homeView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex-1')],
    [
      h.div(
        [
          h.Class(
            'mx-auto w-full max-w-3xl px-4 py-10 font-mono text-[15px] leading-[1.7] text-muted-foreground sm:px-6',
          ),
        ],
        [
          h.div(
            [h.Class('flex flex-wrap items-center gap-3')],
            [
              h.h1(
                [
                  h.Class(
                    "whitespace-pre-line text-3xl font-bold leading-[1.2] tracking-[-0.01em] text-foreground before:content-['#_'] before:font-normal before:text-muted-foreground",
                  ),
                ],
                ['shadcn components for Foldkit.'],
              ),
              badge<AppMessage>(
                {
                  variant: 'outline',
                  className:
                    'h-6 border-red-500/25 bg-red-500/10 px-2 text-[11px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-300',
                },
                ['Beta'],
                h,
              ),
            ],
          ),
          h.p(
            [h.Class('mt-5')],
            [
              'A registry of ',
              String(componentCount),
              ' copy-paste components built with @foldkit/ui, Foldkit TEA architecture, and Tailwind CSS.',
            ],
          ),
          h.p(
            [h.Class('mt-3 text-sm')],
            [
              'Foldkit-only \u2014 not a React drop-in. If you use React, stay on ',
              h.a(
                [
                  h.Href('https://ui.shadcn.com'),
                  h.Target('_blank'),
                  h.Rel('noopener noreferrer'),
                  h.Class(
                    'text-foreground underline decoration-1 decoration-border underline-offset-[3px] hover:decoration-foreground',
                  ),
                ],
                ['shadcn/ui'],
              ),
              '. New to Foldkit? ',
              h.a(
                [
                  h.Href('https://foldkit.dev'),
                  h.Target('_blank'),
                  h.Rel('noopener noreferrer'),
                  h.Class(
                    'text-foreground underline decoration-1 decoration-border underline-offset-[3px] hover:decoration-foreground',
                  ),
                ],
                ['foldkit.dev'],
              ),
              ' first.',
            ],
          ),
          h.h2(
            [
              h.Class(
                "mt-10 text-[1.375rem] font-semibold leading-[1.25] text-foreground before:content-['##_'] before:font-normal before:text-muted-foreground",
              ),
            ],
            ['Get started'],
          ),
          h.p(
            [h.Class('mt-3 text-sm leading-relaxed')],
            [
              'Four steps from an existing Foldkit project. If you are starting from scratch, follow ',
              h.a(
                [
                  h.Href('https://ui.shadcn.com/docs/installation'),
                  h.Target('_blank'),
                  h.Rel('noopener noreferrer'),
                  h.Class(
                    'text-foreground underline decoration-1 decoration-border underline-offset-[3px] hover:decoration-foreground',
                  ),
                ],
                ['shadcn init'],
              ),
              ' first, then continue below.',
            ],
          ),
          Alert<AppMessage>(
            { className: 'mt-4 text-sm leading-relaxed' },
            [
              Alert.title<AppMessage>({}, ['Prerequisite'], h),
              Alert.description<AppMessage>(
                {},
                [
                  'Your Tailwind entry (e.g. ',
                  h.code([h.Class('font-mono text-[0.9em]')], ['src/index.css']),
                  ') must contain ',
                  h.code([h.Class('font-mono text-[0.9em]')], ['@import "tailwindcss";']),
                  ' before installing. Without it the CLI crashes with a cryptic ',
                  h.code([h.Class('font-mono text-[0.9em]')], ['proxyOf']),
                  ' error.',
                ],
                h,
              ),
            ],
            h,
          ),
          h.ol(
            [h.Class('mt-5 list-decimal pl-5')],
            [
              h.li(
                [h.Class('mt-4')],
                [
                  h.div(
                    [h.Class('font-semibold text-foreground')],
                    ['Initialize shadcn (new projects only)'],
                  ),
                  h.p(
                    [h.Class('mt-2 text-sm leading-relaxed')],
                    [
                      'If you do not have a ',
                      h.code([h.Class('font-mono text-[0.9em]')], ['components.json']),
                      ', scaffold it per ',
                      h.a(
                        [
                          h.Href('https://ui.shadcn.com/docs/installation'),
                          h.Target('_blank'),
                          h.Rel('noopener noreferrer'),
                          h.Class(
                            'text-foreground underline decoration-1 decoration-border underline-offset-[3px] hover:decoration-foreground',
                          ),
                        ],
                        ['ui.shadcn.com/docs/installation'],
                      ),
                      ': ',
                    ],
                  ),
                  registryCodeBlock<Message>(
                    {
                      path: 'Terminal',
                      code: 'npx shadcn@latest init',
                      lang: 'shell',
                      onCopy: Message.ClickedCopy({ value: 'npx shadcn@latest init' }),
                      isCopied: Option.exists(
                        model.maybeCopiedValue,
                        (v) => v === 'npx shadcn@latest init',
                      ),
                      className: 'mt-2',
                    },
                    h,
                  ),
                  h.p(
                    [h.Class('mt-2 text-sm leading-relaxed')],
                    [
                      'Configure aliases (components, utils, ui, lib, hooks) when prompted. Skip this if components.json already exists.',
                    ],
                  ),
                ],
              ),
              h.li(
                [h.Class('mt-4')],
                [
                  h.div(
                    [h.Class('font-semibold text-foreground')],
                    ['Register the @foldcn namespace'],
                  ),
                  h.p(
                    [h.Class('mt-2 text-sm leading-relaxed')],
                    ['So the CLI knows where to fetch foldcn items from:'],
                  ),
                  registryCodeBlock<Message>(
                    {
                      path: 'Terminal',
                      code: 'npx shadcn@latest registry add @foldcn=https://foldcn.elianiva.com/r/{name}.json',
                      lang: 'shell',
                      onCopy: Message.ClickedCopy({
                        value:
                          'npx shadcn@latest registry add @foldcn=https://foldcn.elianiva.com/r/{name}.json',
                      }),
                      isCopied: Option.exists(
                        model.maybeCopiedValue,
                        (v) =>
                          v ===
                          'npx shadcn@latest registry add @foldcn=https://foldcn.elianiva.com/r/{name}.json',
                      ),
                      className: 'mt-2',
                    },
                    h,
                  ),
                  h.p(
                    [h.Class('mt-2 text-sm leading-relaxed')],
                    [
                      'Or add ',
                      h.code(
                        [h.Class('font-mono text-[0.9em]')],
                        ['"@foldcn": "https://foldcn.elianiva.com/r/{name}.json"'],
                      ),
                      ' under ',
                      h.code([h.Class('font-mono text-[0.9em]')], ['registries']),
                      ' in ',
                      h.code([h.Class('font-mono text-[0.9em]')], ['components.json']),
                      ' manually.',
                    ],
                  ),
                ],
              ),
              h.li(
                [h.Class('mt-4')],
                [
                  h.div([h.Class('font-semibold text-foreground')], ['Install the base style']),
                  h.p(
                    [h.Class('mt-2 text-sm leading-relaxed')],
                    [
                      'Writes the theme variables (',
                      h.code([h.Class('font-mono text-[0.9em]')], [':root']),
                      ' / ',
                      h.code([h.Class('font-mono text-[0.9em]')], ['.dark']),
                      ' + ',
                      h.code([h.Class('font-mono text-[0.9em]')], ['@theme inline']),
                      ') and installs core deps (foldkit, effect, @foldkit/ui, cn, lucide, tw-animate-css):',
                    ],
                  ),
                  registryCodeBlock<Message>(
                    {
                      path: 'Terminal',
                      code: 'npx shadcn@latest add @foldcn/foldcn',
                      lang: 'shell',
                      onCopy: Message.ClickedCopy({
                        value: 'npx shadcn@latest add @foldcn/foldcn',
                      }),
                      isCopied: Option.exists(
                        model.maybeCopiedValue,
                        (v) => v === 'npx shadcn@latest add @foldcn/foldcn',
                      ),
                      className: 'mt-2',
                    },
                    h,
                  ),
                ],
              ),
              h.li(
                [h.Class('mt-4')],
                [
                  h.div(
                    [h.Class('font-semibold text-foreground')],
                    ['Add components as you need them'],
                  ),
                  registryCodeBlock<Message>(
                    {
                      path: 'Terminal',
                      code: 'npx shadcn@latest add @foldcn/button @foldcn/dialog',
                      lang: 'shell',
                      onCopy: Message.ClickedCopy({
                        value: 'npx shadcn@latest add @foldcn/button @foldcn/dialog',
                      }),
                      isCopied: Option.exists(
                        model.maybeCopiedValue,
                        (v) => v === 'npx shadcn@latest add @foldcn/button @foldcn/dialog',
                      ),
                      className: 'mt-2',
                    },
                    h,
                  ),
                  h.p(
                    [h.Class('mt-2 text-sm leading-relaxed')],
                    [
                      'pnpm dlx / bunx work too — pick your runner. Each component is copy-paste source you own.',
                    ],
                  ),
                ],
              ),
            ],
          ),
          h.h2(
            [
              h.Class(
                "mt-10 text-[1.375rem] font-semibold leading-[1.25] text-foreground before:content-['##_'] before:font-normal before:text-muted-foreground",
              ),
            ],
            ['For AI agents'],
          ),
          h.p(
            [h.Class('mt-3 text-sm leading-relaxed')],
            [
              'Paste this prompt to your agent so it follows the exact install contract. It covers prerequisites, namespace registration, and where to read docs as Markdown.',
            ],
          ),
          registryCodeBlock<Message>(
            {
              path: 'Agent prompt — copy and paste',
              code: AGENT_PROMPT,
              lang: 'markdown',
              onCopy: Message.ClickedCopy({ value: AGENT_PROMPT }),
              isCopied: Option.exists(model.maybeCopiedValue, (v) => v === AGENT_PROMPT),
              className: 'mt-3',
            },
            h,
          ),
          h.p(
            [h.Class('mt-3 text-sm leading-relaxed')],
            [
              'Agents can also read Markdown directly: ',
              h.code([h.Class('font-mono text-[0.9em]')], ['/llms.txt']),
              ' for the index, ',
              h.code([h.Class('font-mono text-[0.9em]')], ['/docs/<name>.md']),
              ' per component, or send ',
              h.code([h.Class('font-mono text-[0.9em]')], ['Accept: text/markdown']),
              '. Try ',
              h.code(
                [h.Class('font-mono text-[0.9em]')],
                ['curl -H "Accept: text/markdown" https://foldcn.elianiva.com/docs/button'],
              ),
              '.',
            ],
          ),
          separator<Message>({ className: 'mt-8' }, h),
          h.p(
            [h.Class('mt-5')],
            [
              h.a(
                [
                  h.Href('/docs'),
                  h.Class(
                    'text-foreground underline decoration-1 decoration-border underline-offset-[3px] hover:decoration-foreground',
                  ),
                ],
                [`Browse all ${componentCount} components`],
              ),
              ' — or ',
              h.a(
                [
                  h.Href('https://ui.shadcn.com/docs/registry/namespace'),
                  h.Target('_blank'),
                  h.Rel('noopener noreferrer'),
                  h.Class(
                    'text-foreground underline decoration-1 decoration-border underline-offset-[3px] hover:decoration-foreground',
                  ),
                ],
                ['read about shadcn namespaces'],
              ),
              '.',
            ],
          ),
        ],
      ),
    ],
  )

export const notFoundView = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [
      h.Class(
        'mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-32 text-center',
      ),
    ],
    [
      h.h1([h.Class('text-6xl font-bold tracking-tight')], ['404']),
      h.p([h.Class('mt-4 text-muted-foreground')], ['That page could not be found.']),
      h.div(
        [h.Class('mt-6')],
        [
          h.a(
            [
              h.Href('/'),
              h.Class(
                'inline-flex items-center rounded-full border border-border bg-muted/40 px-4 py-1.5 text-sm font-medium text-foreground underline-offset-4 hover:border-primary/40 hover:text-primary',
              ),
            ],
            ['Back to the registry'],
          ),
        ],
      ),
    ],
  )
