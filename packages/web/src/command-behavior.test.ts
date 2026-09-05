import { describe, expect, it } from 'vitest'
import { Option } from 'effect'
import { Scene } from 'foldkit/test'
import * as Command from '../../registry/registry/default/ui/command'
import { commandScore } from '../../registry/registry/default/ui/command-score'

const items: ReadonlyArray<Command.Item> = [
  { value: 'calendar', label: 'Calendar', keywords: ['schedule'], group: 'tools' },
  { value: 'calculator', label: 'Calculator', group: 'tools', isDisabled: true },
  { value: 'profile', label: 'Profile', group: 'account' },
  { value: 'billing', label: 'Billing', keywords: ['payment'], group: 'account' },
]
const config: Command.ViewInputs = {
  items,
  groups: [
    { value: 'tools', heading: 'Tools' },
    { value: 'account', heading: 'Account' },
  ],
}
const values = (result: ReadonlyArray<Command.Item>) => result.map((item) => item.value)

describe('cmdk scoring and filtering', () => {
  it('prefers exact and word-boundary matches over loose character matches', () => {
    expect(commandScore('Calendar', 'Calendar')).toBe(1)
    expect(commandScore('Calendar', 'cal')).toBeGreaterThan(commandScore('Calculator', 'clr'))
    expect(commandScore('Search Emoji', 'se')).toBeGreaterThan(commandScore('Somewhere', 'se'))
    expect(commandScore('Calendar', 'clndr')).toBeGreaterThan(0)
    expect(commandScore('Calendar', 'zzzz')).toBe(0)
    expect(commandScore('Calendar', 'calnedar')).toBeGreaterThan(0)
  })
  it('filters labels and aliases, trims queries, and retains disabled matches', () => {
    expect(values(Command.getResults(' CAL ', config))).toEqual(['calendar', 'calculator'])
    expect(values(Command.getResults('payment', config))).toEqual(['billing'])
    expect(values(Command.getResults('clndr', config))).toEqual(['calendar'])
    expect(Command.getResults('zzzz', config)).toEqual([])
  })
  it('ranks groups by their best member and preserves declaration order for ties', () => {
    const result = Command.getResults('x', {
      ...config,
      filter: (label) => (label === 'Billing' ? 1 : 0.5),
    })
    expect(values(result)).toEqual(['billing', 'profile', 'calendar', 'calculator'])
    expect(values(Command.getResults('', config))).toEqual(items.map((item) => item.value))
  })
  it('supports custom ranking, external filtering, and forced items/groups', () => {
    expect(
      values(
        Command.getResults('x', { ...config, filter: (label) => (label === 'Profile' ? 1 : 0) }),
      ),
    ).toEqual(['profile'])
    expect(values(Command.getResults('zzzz', { ...config, shouldFilter: false }))).toEqual(
      items.map((item) => item.value),
    )
    expect(
      values(
        Command.getResults('zzzz', {
          ...config,
          items: [...items, { value: 'always', forceMount: true }],
        }),
      ),
    ).toEqual(['always'])
    expect(
      values(
        Command.getResults('zzzz', {
          ...config,
          groups: [{ value: 'tools', heading: 'Tools', forceMount: true }],
        }),
      ),
    ).toEqual(['calendar', 'calculator'])
  })
})

describe('command state and navigation', () => {
  it('skips disabled items, clamps by default, and wraps only when requested', () => {
    expect(Command.navigate(items, 'calendar', 1)?.value).toBe('profile')
    expect(Command.navigate(items, 'profile', -1)?.value).toBe('calendar')
    expect(Command.navigate(items, 'billing', 1)?.value).toBe('billing')
    expect(Command.navigate(items, 'billing', 1, true)?.value).toBe('calendar')
    expect(Command.navigate(items, 'calendar', -1, true)?.value).toBe('billing')
    expect(Command.navigate([], undefined, 1)).toBeUndefined()
  })
  it('jumps groups and falls back when an async result removes the active item', () => {
    expect(Command.navigate(items, 'calendar', 1, false, true)?.value).toBe('profile')
    expect(Command.navigate(items, 'billing', -1, false, true)?.value).toBe('calendar')
    const model = Command.init({ id: 'test', value: 'billing' })
    expect(Command.activeItem(model, items.slice(0, 2))?.value).toBe('calendar')
    expect(Command.activeItem(model, [{ value: 'no', isDisabled: true }])).toBeUndefined()
  })
  it('search resets the active preference; selection does not erase a controlled query', () => {
    const result = Command.update(
      Command.init({ id: 'test', value: 'billing' }),
      Command.Message.ChangedSearch({ search: 'cal' }),
    )
    expect(Option.isNone(result.model.value)).toBe(true)
    expect(result.outMessage).toEqual(Command.OutMessage.SearchChanged({ search: 'cal' }))
    const selected = Command.update(result.model, Command.Message.Selected({ value: 'calendar' }))
    expect(selected.model.search).toBe('cal')
    expect(selected.outMessage).toEqual(Command.OutMessage.Selected({ value: 'calendar' }))
  })
})

describe('rendered Command contract', () => {
  it('renders an inline list, chooses the first enabled result, selects on Enter and hides empty groups', () => {
    const input = Scene.role('combobox')
    Scene.scene(
      { update: Command.update, view: Scene.withViewInputs(Command.view, config)() },
      Scene.given(Command.init({ id: 'test' })),
      Scene.Mount.resolve(Command.CommandDom, Command.Message.Mounted()),
      Scene.expect(input).toHaveAttr('aria-activedescendant', 'test-item-calendar'),
      Scene.expect(Scene.role('listbox')).toExist(),
      Scene.type(input, 'payment'),
      Scene.expect(input).toHaveAttr('aria-activedescendant', 'test-item-billing'),
      Scene.expect(Scene.selector('[cmdk-group][hidden]')).toExist(),
      Scene.keydown(input, 'Enter'),
      Scene.expectOutMessage(Command.OutMessage.Selected({ value: 'billing' })),
      Scene.type(input, 'zzzz'),
      Scene.expect(Scene.text('No results found.')).toExist(),
      Scene.keydown(input, 'Enter'),
      Scene.expectNoOutMessage(),
    )
  })
  it('ignores disabled clicks and supports Home/End through the real key handler', () => {
    Scene.scene(
      { update: Command.update, view: Scene.withViewInputs(Command.view, config)() },
      Scene.given(Command.init({ id: 'test' })),
      Scene.Mount.resolve(Command.CommandDom, Command.Message.Mounted()),
      Scene.expect(Scene.role('option', { name: 'Calculator' })).toBeDisabled(),
      Scene.expectNoOutMessage(),
      Scene.keydown(Scene.role('combobox'), 'End'),
      Scene.Command.resolve(Command.ScrollActive, Command.Message.CompletedScroll()),
      Scene.expect(Scene.role('combobox')).toHaveAttr('aria-activedescendant', 'test-item-billing'),
      Scene.keydown(Scene.role('combobox'), 'Home'),
      Scene.Command.resolve(Command.ScrollActive, Command.Message.CompletedScroll()),
      Scene.expect(Scene.role('combobox')).toHaveAttr(
        'aria-activedescendant',
        'test-item-calendar',
      ),
    )
  })
})

describe('CommandDialog ownership', () => {
  it('keeps selection and query by default, with opt-in close and reset', () => {
    const initial = Command.CommandDialog.init({ id: 'test', search: 'cal', isAnimated: false })
    const open = Command.CommandDialog.open(initial)
    const selected = Command.CommandDialog.update(
      open.model,
      Command.CommandDialog.Message.GotCommandMessage({
        message: Command.Message.Selected({ value: 'calendar' }),
      }),
    )
    expect(selected.model.dialog.isOpen).toBe(true)
    expect(selected.model.command.search).toBe('cal')
    const configured = Command.CommandDialog.open(
      Command.CommandDialog.init({
        id: 'other',
        closeOnSelect: true,
        resetOnOpen: true,
        search: 'old',
        isAnimated: false,
      }),
    )
    expect(configured.model.command.search).toBe('')
    const closed = Command.CommandDialog.update(
      configured.model,
      Command.CommandDialog.Message.GotCommandMessage({
        message: Command.Message.Selected({ value: 'billing' }),
      }),
    )
    expect(closed.model.dialog.isOpen).toBe(false)
    expect(closed.outMessage).toEqual(
      Command.CommandDialog.OutMessage.Selected({ value: 'billing' }),
    )
    expect(closed.commands?.length).toBeGreaterThan(0)
  })
})

it('routes selection through the demo parent', async () => {
  const Demo = await import('./demo/assemble')
  const result = Demo.update(Demo.init().model, {
    _tag: 'GotInlineCommandMessage',
    message: Command.Message.Selected({ value: 'calendar' }),
  })
  expect(result.model.commandRunCount).toBe(1)
  expect(result.model.lastCommand).toBe('calendar')
})

// The resolver previously stripped cmdk selectors from every string literal,
// including DOM queries. Exercise distributed source, not only authored views.
describe('resolved Command selectors', () => {
  const sources = import.meta.glob('../../registry/styles/*/ui/command.ts', {
    query: '?raw',
    import: 'default',
    eager: true,
  })
  it('preserves DOM queries and group styling in every style', () => {
    expect(Object.keys(sources)).toHaveLength(9)
    for (const source of Object.values(sources)) {
      expect(source).toContain("closest('[cmdk-item]')")
      expect(source).toContain("('[cmdk-list]')")
      expect(source).toContain("('[cmdk-list-sizer]')")
      expect(source).toContain('[cmdk-group-heading]')
    }
  })
})
