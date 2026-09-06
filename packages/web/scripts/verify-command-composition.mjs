// Run on /docs/command in the dev server; see docs/command-composition.md.
export const verifyCommandComposition = async () => {
  // Wait for the runtime's mount hook, rather than interacting with SSR markup.
  for (let attempt = 0; attempt < 200; attempt++) {
    if (document.querySelector('[cmdk-list]')?.style.getPropertyValue('--cmdk-list-height')) break
    if (attempt === 199) throw new Error('Command runtime did not mount within 10 seconds.')
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  const trigger = document.getElementById('command-dialog-trigger')
  const inline = document.getElementById('command-inline-input')
  if (!(trigger instanceof HTMLButtonElement) || !(inline instanceof HTMLInputElement))
    throw new Error('Open /docs/command first.')
  const pause = () => new Promise((resolve) => setTimeout(resolve, 160))
  const waitFor = async (test, label) => {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (test()) return
      await new Promise((resolve) => setTimeout(resolve, 20))
    }
    throw new Error(label)
  }
  const assert = (condition, message) => {
    if (!condition) throw new Error(message)
  }
  const status = () => document.querySelector('[data-command-result]')?.textContent ?? ''
  const count = () => Number(status().match(/Commands run: (\d+)/)?.[1] ?? 0)
  const initialCount = count()
  const options = (input) => [...input.closest('[cmdk-root]').querySelectorAll('[cmdk-item]')]
  const active = (input) =>
    document.getElementById(input.getAttribute('aria-activedescendant'))?.getAttribute('data-value')
  const key = async (input, value, modifiers = {}) => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...modifiers }),
    )
    await pause()
  }
  const type = async (input, query) => {
    input.focus()
    input.value = query
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await pause()
  }
  const open = async () => {
    trigger.scrollIntoView({ block: 'center' })
    trigger.focus()
    trigger.click()
    await waitFor(
      () => document.getElementById('command-demo-dialog')?.open,
      'Dialog failed to open',
    )
    const input = document.getElementById('command-demo-input')
    assert(input instanceof HTMLInputElement, 'Dialog input missing')
    await waitFor(() => document.activeElement === input, 'Dialog did not focus search')
    return input
  }
  const closed = async () => {
    await waitFor(
      () => !document.getElementById('command-demo-dialog')?.open,
      'Dialog failed to close',
    )
    await waitFor(() => document.activeElement === trigger, 'Dialog did not restore trigger focus')
  }
  assert(
    !document.getElementById('command-demo-dialog')?.open,
    'Close the dialog before running this check',
  )

  await type(inline, 'clndr')
  assert(
    options(inline).length === 1 && active(inline) === 'calendar',
    'Inline fuzzy filtering failed',
  )
  await key(inline, 'Enter')
  assert(
    count() === initialCount + 1 && status().includes('Ran calendar.'),
    'Inline selection failed',
  )
  assert(
    inline.value === 'clndr' && options(inline).length === 1,
    'Inline selection must preserve search and list',
  )
  await type(inline, '')
  await key(inline, 'End')
  assert(active(inline) === 'settings', 'End failed')
  await key(inline, 'ArrowDown')
  assert(active(inline) === 'calendar', 'Loop failed')
  await key(inline, 'ArrowDown', { altKey: true })
  assert(active(inline) === 'profile', 'Group navigation failed')
  await key(inline, 'Home')
  await key(inline, 'j', { ctrlKey: true })
  assert(active(inline) === 'emoji', 'Vim navigation failed')
  await key(inline, 'ArrowDown')
  assert(active(inline) === 'profile', 'Navigation did not skip disabled item')
  await key(inline, 'ArrowUp')
  assert(active(inline) === 'emoji', 'Reverse navigation did not skip disabled item')

  let input = await open()
  assert(options(input).length === 6, 'Dialog results must be visible without typing')
  assert(active(input) === 'calendar', 'First enabled item must be active')
  assert(
    input.closest('dialog').getAttribute('aria-labelledby'),
    'Dialog title association missing',
  )
  await type(input, 'payment')
  assert(
    active(input) === 'billing' && options(input).length === 1,
    'Keyword alias filtering failed',
  )
  await key(input, 'Enter', { isComposing: true })
  assert(
    count() === initialCount + 1 && input.closest('dialog').open,
    'IME Enter executed a command',
  )
  await key(input, 'Enter')
  await closed()
  assert(
    count() === initialCount + 2 && status().includes('Ran billing.'),
    'Dialog Enter selection failed',
  )

  input = await open()
  assert(input.value === '', 'Configured resetOnOpen failed')
  const billing = options(input).find((item) => item.getAttribute('data-value') === 'billing')
  assert(billing, 'Billing result missing')
  billing.dispatchEvent(
    new PointerEvent('pointermove', {
      bubbles: true,
      pointerType: 'mouse',
      screenX: 30,
      screenY: 40,
    }),
  )
  await pause()
  assert(active(input) === 'billing', 'Pointer hover did not activate item')
  const bounds = billing.getBoundingClientRect()
  assert(
    billing.contains(
      document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2),
    ),
    'Dialog option is covered',
  )
  billing.click()
  await closed()
  assert(count() === initialCount + 3, 'Repeated pointer selection failed')

  input = await open()
  await type(input, 'calculator')
  assert(
    options(input).length === 1 && options(input)[0].getAttribute('aria-disabled') === 'true',
    'Disabled results missing',
  )
  assert(!input.hasAttribute('aria-activedescendant'), 'Disabled item became active')
  options(input)[0].click()
  await key(input, 'Enter')
  assert(count() === initialCount + 3, 'Disabled result executed')
  await type(input, 'zzzz')
  assert(
    options(input).length === 0 &&
      input.closest('[cmdk-root]').querySelector('[cmdk-empty]')?.textContent ===
        'No results found.',
    'Empty state missing',
  )
  await key(input, 'Enter')
  assert(count() === initialCount + 3, 'Empty list executed a command')
  await type(input, 'CAL')
  assert(
    !input.closest('[cmdk-root]').querySelector('[cmdk-empty]'),
    'Empty state persisted after results returned',
  )
  assert(options(input).length === 2, 'Case-insensitive filtering failed')
  await key(input, 'Escape')
  await closed()
  assert(count() === initialCount + 3, 'Escape executed an action')

  // Verify the demo-owned shortcut opens and closes from outside the palette.
  await key(trigger, 'k', { metaKey: true })
  await waitFor(() => document.getElementById('command-demo-dialog')?.open, 'Cmd+K did not open')
  input = document.getElementById('command-demo-input')
  await key(input, 'k', { ctrlKey: true })
  await closed()
  await type(inline, '')
  return 'Passed: inline and dialog search, aliases, fuzzy ranking, keys, groups, disabled and empty results, pointer selection, IME, repeat actions, shortcuts, and focus restoration.'
}
