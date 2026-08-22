import type { Html, HtmlBuilder } from 'foldkit/html'

import { Command, commandGroupHeadingClass } from '@foldcn/registry/styles/default/ui/command'

import { UpdatedCommandSearch, type Message } from '../message'
import type { Model } from '../model'

const ALL_COMMANDS = [
  { group: 'Suggestions', items: ['Calendar', 'Search Emoji', 'Launch'] },
  { group: 'Settings', items: ['Profile', 'Billing', 'Security'] },
]

export const commandView = (model: Model, h: HtmlBuilder<Message>): Html => {
  const query = model.commandSearch.toLowerCase()
  const groups = ALL_COMMANDS.map((group) => {
    const items = group.items.filter((item) => item.toLowerCase().includes(query))
    if (items.length === 0) return null
    return Command.group(
      {},
      [
        h.div([h.Class(commandGroupHeadingClass), h.DataAttribute('slot', 'command-group-heading')], [
          group.group,
        ]),
        ...items.map((item) => Command.item({}, [item], h)),
      ],
      h,
    )
  }).filter((group): group is Html => group !== null)

  return Command(
    {},
    [
      Command.input(
        { value: model.commandSearch, onInput: (value) => UpdatedCommandSearch({ value }), placeholder: 'Type a command or search…' },
        h,
      ),
      Command.list({}, [...groups, Command.empty({}, ['No results found.'], h)], h),
    ],
    h,
  )
}
