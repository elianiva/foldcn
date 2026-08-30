import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { Command, commandGroupHeadingClass } from '../../generated/registry/ui/command'
import { icon } from '../../generated/registry/lib/icons'
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from 'lucide'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  UpdatedCommandSearch: { value: S.String },
})

// Presentational palette mirroring apps/v4/examples/base/command-demo.tsx.
// Filtering is parent-owned; the upstream cmdk behaviors (arrow nav, Enter
// selection) are inert in foldcn (see registry/default/ui/command.ts).
const GROUPS: ReadonlyArray<{
  heading: string
  items: ReadonlyArray<{
    label: string
    icon: typeof Calendar
    disabled?: boolean
    shortcut?: string
  }>
}> = [
  {
    heading: 'Suggestions',
    items: [
      { label: 'Calendar', icon: Calendar },
      { label: 'Search Emoji', icon: Smile },
      { label: 'Calculator', icon: Calculator, disabled: true },
    ],
  },
  {
    heading: 'Settings',
    items: [
      { label: 'Profile', icon: User, shortcut: '⌘P' },
      { label: 'Billing', icon: CreditCard, shortcut: '⌘B' },
      { label: 'Settings', icon: Settings, shortcut: '⌘S' },
    ],
  },
]

export const commandView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          (() => {
            const query = model.commandSearch.toLowerCase()
            const groups = GROUPS.map((group) => {
              const items = group.items.filter((item) => item.label.toLowerCase().includes(query))
              if (items.length === 0) return null
              return Command.group(
                {},
                [
                  h.div(
                    [
                      h.Class(commandGroupHeadingClass),
                      h.DataAttribute('slot', 'command-group-heading'),
                    ],
                    [group.heading],
                  ),
                  ...items.map((item) =>
                    Command.item(
                      { isDisabled: item.disabled },
                      [
                        icon(h, item.icon, 'size-4'),
                        h.span([], [item.label]),
                        ...(item.shortcut ? [Command.shortcut({}, [item.shortcut], h)] : []),
                      ],
                      h,
                    ),
                  ),
                ],
                h,
              )
            }).filter((group): group is Html => group !== null)

            return Command(
              { className: 'max-w-sm rounded-lg border' },
              [
                Command.input(
                  {
                    value: model.commandSearch,
                    onInput: (value) => Message.UpdatedCommandSearch({ value }),
                    placeholder: 'Type a command or search...',
                  },
                  h,
                ),
                Command.list({}, [...groups, Command.empty({}, ['No results found.'], h)], h),
              ],
              h,
            )
          })(),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Icons']),
          h.div(
            [h.Class('mx-auto w-full max-w-sm rounded-lg border p-3 text-sm')],
            [h.p([], ['Command palette with icons and shortcuts.'])],
          ),
        ],
      ),
    ],
  )

const fields = { commandSearch: S.String }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { commandSearch: '' },
  messages: [Message.UpdatedCommandSearch],
  handlers: (model: State) => ({
    UpdatedCommandSearch: ({ value }: typeof Message.UpdatedCommandSearch.Type): UpdateReturn => ({
      model: evo(model, { commandSearch: () => value }),
    }),
  }),
  samples: [Message.UpdatedCommandSearch({ value: 'cal' })],
})
