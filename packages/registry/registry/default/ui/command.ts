import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'
import { icon } from '@/lib/icons'
import { inputClass } from './input'
import { Search } from 'lucide'

type Child = Html | string

// Command is a presentational command-palette surface. `Command` is the
// container; sub-builders are attached as properties: Command.input,
// Command.list, Command.empty, Command.group, Command.item, Command.separator,
// Command.shortcut. Filtering is handled by the consumer (wire Command.input to
// your model), mirroring shadcn's `command` base surface.

// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/command.tsx. Class strings are identical to
// upstream; visual styling lives in the central foldcn style definition.
//
// foldcn gaps vs upstream: no cmdk behavior layer (filtering, arrow-key
// selection and Enter-to-select are consumer-owned) and no Dialog wrapper;
// the [cmdk-*] descendant selectors in the group token are inert here — use
// Command.groupHeading for the heading styles.

export const commandClass = 'cn-command flex size-full flex-col overflow-hidden'

export const commandInputClass =
  'cn-command-input outline-hidden disabled:cursor-not-allowed disabled:opacity-50'

export const commandListClass = 'cn-command-list overflow-x-hidden overflow-y-auto'

export const commandEmptyClass = 'cn-command-empty py-6 text-center text-sm'

export const commandGroupClass = 'cn-command-group overflow-hidden p-1 text-foreground'

export const commandGroupHeadingClass =
  'cn-dropdown-menu-label px-2 py-1.5 text-xs font-medium text-muted-foreground'

export const commandItemClass =
  'cn-command-item group/command-item relative flex cursor-default select-none items-center gap-2 px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-muted data-[selected=true]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const commandSeparatorClass = 'cn-command-separator -mx-1 h-px bg-border'

export const commandShortcutClass =
  'cn-command-shortcut ml-auto text-xs tracking-widest text-muted-foreground'

export type CommandInputConfig<M> = Readonly<{
  value?: string
  onInput?: (value: string) => M
  placeholder?: string
  isDisabled?: boolean
  className?: string
}>

type StyleConfig = Readonly<{ className?: string }>

const commandContainer = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(commandClass, config.className)), h.DataAttribute('slot', 'command')], children)

const commandInput = <M>(config: CommandInputConfig<M>, h: HtmlBuilder<M>): Html =>
  h.div(
    [h.Class('flex items-center border-b px-2.5'), h.DataAttribute('slot', 'command-input-wrapper')],
    [
      icon(h, Search, 'size-4 shrink-0 opacity-50'),
      h.input([
        h.Type('text'),
        ...(config.value === undefined ? [] : [h.Value(config.value)]),
        ...(config.isDisabled === true ? [h.Disabled(true)] : []),
        ...(config.placeholder === undefined ? [] : [h.Placeholder(config.placeholder)]),
        ...(config.onInput === undefined ? [] : [h.OnInput(config.onInput)]),
        h.Class(cn(commandInputClass, 'border-0 shadow-none focus-visible:ring-0', config.className)),
        h.DataAttribute('slot', 'command-input'),
      ]),
    ],
  )

const commandList = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(commandListClass)), h.DataAttribute('slot', 'command-list')], children)

const commandEmpty = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(commandEmptyClass)), h.DataAttribute('slot', 'command-empty')], children)

const commandGroup = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(commandGroupClass)), h.DataAttribute('slot', 'command-group'), h.Role('group')], children)

const commandItem = <M>(
  config: StyleConfig & Readonly<{ isSelected?: boolean; isDisabled?: boolean }>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(commandItemClass, config.className)),
      h.DataAttribute('slot', 'command-item'),
      h.Role('menuitem'),
      ...(config.isSelected === true ? [h.DataAttribute('selected', 'true')] : []),
      ...(config.isDisabled === true ? [h.DataAttribute('disabled', 'true')] : []),
    ],
    children,
  )

const commandSeparator = <M>(config: StyleConfig, h: HtmlBuilder<M>): Html =>
  h.div([h.Class(cn(commandSeparatorClass, config.className)), h.DataAttribute('slot', 'command-separator')], [])

const commandShortcut = <M>(config: StyleConfig, children: ReadonlyArray<Child>, h: HtmlBuilder<M>): Html =>
  h.span([h.Class(cn(commandShortcutClass, config.className)), h.DataAttribute('slot', 'command-shortcut')], children)

/** Composable command palette — `Command` is the container, with sub-builders
 *  as properties. */
export const Command = Object.assign(commandContainer, {
  input: commandInput,
  list: commandList,
  empty: commandEmpty,
  group: commandGroup,
  item: commandItem,
  separator: commandSeparator,
  shortcut: commandShortcut,
})
