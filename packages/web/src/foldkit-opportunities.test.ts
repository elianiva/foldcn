import { describe, expect, it, vi } from 'vitest'
import { Effect, Option, Stream } from 'effect'
import { Calendar as Dates } from 'foldkit'
import { Calendar as FoldkitCalendar } from '@foldkit/ui'
import { Scene } from 'foldkit/test'
import * as Calendar from '../../registry/registry/default/ui/calendar'
import * as DatePicker from '../../registry/registry/default/ui/date-picker'
import * as Collapsible from '../../registry/registry/default/ui/collapsible'
import * as Accordion from '../../registry/registry/default/ui/accordion'
import * as Command from '../../registry/registry/default/ui/command'
import * as Sidebar from '../../registry/registry/default/ui/sidebar'
import { subscriptions as commandSubscriptions } from './demo/views/command'
import { germanLabels, germanLocale } from './demo/calendar-locale'
import * as Demo from './demo/assemble'
import { calendarView } from './demo/views/calendar'
import { datePickerView } from './demo/views/date-picker'
import { collapsibleView } from './demo/views/collapsible'
import { accordionView } from './demo/views/accordion'

const today = Dates.CalendarDate.make({ year: 2026, month: 1, day: 15 })

// Run the actual subscription listener in a scope; its finalizer must remove it.
const dispatchKeys = async <Message>(stream: Stream.Stream<Message>, dispatch: () => void) => {
  const registration = vi.spyOn(document, 'addEventListener')
  try {
    return await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const received: Message[] = []
          yield* Stream.runForEach(stream, (message) =>
            Effect.sync(() => {
              received.push(message)
            }),
          ).pipe(Effect.forkScoped)
          yield* Effect.promise(() =>
            vi.waitFor(() => {
              expect(registration.mock.calls.some(([event]) => event === 'keydown')).toBe(true)
            }),
          )
          dispatch()
          yield* Effect.sleep('10 millis')
          return received
        }),
      ),
    )
  } finally {
    registration.mockRestore()
  }
}

const key = (letter: string, options: KeyboardEventInit = {}) =>
  new KeyboardEvent('keydown', {
    key: letter,
    bubbles: true,
    cancelable: true,
    ...(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? { metaKey: true } : { ctrlKey: true }),
    ...options,
  })

describe('localized calendar rendering', () => {
  it('uses localized date order, day names, headings, and view labels', () => {
    Scene.scene(
      {
        update: Calendar.update,
        view: (model, h) =>
          Calendar.view(
            model,
            Calendar.styledViewInputs(
              { ...germanLabels, maybeSelectedDate: Option.some(today) },
              h,
            ),
            h,
          ),
      },
      Scene.given(Calendar.init({ id: 'german-calendar', today, locale: germanLocale })),
      Scene.expect(Scene.role('grid', { name: 'Kalender für Januar 2026' })).toExist(),
      Scene.expect(Scene.role('columnheader', { name: 'Montag' })).toExist(),
      Scene.expect(Scene.role('button', { name: 'Donnerstag, 15. Januar 2026' })).toExist(),
      Scene.click(Scene.role('button', { name: 'Monat wählen' })),
      Scene.expect(Scene.role('grid', { name: 'Monate 2026' })).toExist(),
      Scene.Command.resolve(FoldkitCalendar.FocusGrid, Calendar.Message.CompletedFocusGrid()),
      Scene.click(Scene.role('button', { name: 'Jahr wählen' })),
      Scene.expect(Scene.role('grid', { name: /^Jahre / })).toExist(),
      Scene.Command.resolve(FoldkitCalendar.FocusGrid, Calendar.Message.CompletedFocusGrid()),
    )
  })

  it('formats the picker trigger using its calendar locale', () => {
    Scene.scene(
      {
        update: DatePicker.update,
        view: (model, h) =>
          DatePicker.view(
            model,
            DatePicker.styledViewInputs(
              {
                ...germanLabels,
                locale: model.calendar.locale,
                maybeSelectedDate: Option.some(today),
              },
              h,
            ),
            h,
          ),
      },
      Scene.given(DatePicker.init({ id: 'german-picker', today, locale: germanLocale })),
      Scene.expect(Scene.role('button', { name: '15. Januar 2026' })).toExist(),
    )
  })

  it('renders both localized examples on their real demo paths', () => {
    const model = Demo.init().model
    Scene.scene(
      { update: Demo.update, view: calendarView },
      Scene.given(model),
      Scene.expect(Scene.selector('[data-localized-example] [role="grid"]')).toHaveAttr(
        'aria-label',
        germanLabels.toDaysGridLabel?.(
          Dates.formatMonthYear(model.localizedCalendar.today, germanLocale),
        ) ?? '',
      ),
    )
    Scene.scene(
      { update: Demo.update, view: datePickerView },
      Scene.given(model),
      Scene.expect(Scene.selector('[data-localized-example] button')).toHaveAccessibleName(
        Dates.formatLong(model.localizedDatepicker.calendar.today, germanLocale),
      ),
    )
  })
})

describe('collapsed previews', () => {
  it('keeps a Collapsible preview inert until opened, even without isAnimated', () => {
    Scene.scene(
      {
        update: Collapsible.update,
        view: (model, h) =>
          Collapsible.view(
            model,
            { title: 'Preview', peek: '2.5rem', content: h.a([h.Href('#details')], ['Details']) },
            h,
          ),
      },
      Scene.given(Collapsible.init({ id: 'peek' })),
      Scene.expect(Scene.selector('[inert]')).toHaveAttr('aria-hidden', 'true'),
      Scene.expect(Scene.selector('[inert]')).toHaveStyle('min-height', '2.5rem'),
      Scene.click(Scene.role('button', { name: 'Preview' })),
      Scene.expect(Scene.selector('[inert]')).not.toExist(),
      Scene.expect(Scene.role('link', { name: 'Details' })).toExist(),
      Scene.click(Scene.role('button', { name: 'Preview' })),
      Scene.expect(Scene.selector('[inert]')).toExist(),
    )
  })

  it('opens an Accordion preview without losing single-open behavior', () => {
    Scene.scene(
      {
        update: Accordion.update,
        view: (model, h) =>
          Accordion.view(
            model,
            {
              items: [
                { id: 'peek-first', title: 'First', peek: '3rem', content: 'First details' },
                { id: 'peek-second', title: 'Second', peek: '3rem', content: 'Second details' },
              ],
            },
            h,
          ),
      },
      Scene.given(Accordion.init({ id: 'peek-group', type: 'single', value: [false, false] })),
      Scene.click(Scene.role('button', { name: 'First' })),
      Scene.expect(Scene.role('button', { name: 'First' })).toHaveAttr('aria-expanded', 'true'),
      Scene.click(Scene.role('button', { name: 'Second' })),
      Scene.expect(Scene.role('button', { name: 'First' })).toHaveAttr('aria-expanded', 'false'),
      Scene.expect(Scene.role('button', { name: 'Second' })).toHaveAttr('aria-expanded', 'true'),
      Scene.expect(Scene.selector('[inert]')).toHaveStyle('min-height', '3rem'),
    )
  })

  it('renders working previews on both documentation routes', () => {
    for (const view of [collapsibleView, accordionView]) {
      Scene.scene(
        { update: Demo.update, view },
        Scene.given(Demo.init().model),
        Scene.expect(Scene.selector('[data-peek-example] [inert]')).toExist(),
        Scene.click(Scene.selector('[data-peek-example] button')),
        Scene.expect(Scene.selector('[data-peek-example] [inert]')).not.toExist(),
        Scene.expect(Scene.role('link', { name: 'Read the details' })).toExist(),
      )
    }
  })
})

describe('declarative shortcuts', () => {
  it('scopes Command to its route and ignores composition, repeats, and extra modifiers', async () => {
    const entry = commandSubscriptions.commandShortcut
    const model = { ...Demo.init().model, isCommandPage: false }
    const unrelated = key('k')
    expect(
      await dispatchKeys(entry.dependenciesToStream(entry.modelToDependencies(model)), () =>
        document.dispatchEvent(unrelated),
      ),
    ).toEqual([])
    expect(unrelated.defaultPrevented).toBe(false)
    const input = document.createElement('input')
    document.body.append(input)
    const accepted = key('k')
    try {
      const messages = await dispatchKeys(entry.dependenciesToStream({ isEnabled: true }), () => {
        input.dispatchEvent(key('k', { repeat: true }))
        input.dispatchEvent(key('k', { isComposing: true }))
        input.dispatchEvent(key('k', { altKey: true }))
        input.dispatchEvent(accepted)
        expect(accepted.defaultPrevented).toBe(true)
      })
      expect(messages).toEqual([{ _tag: 'ToggledCommandDialog' }])
      const afterDispose = key('k')
      input.dispatchEvent(afterDispose)
      expect(afterDispose.defaultPrevented).toBe(false)
    } finally {
      input.remove()
    }
  })

  it('toggles Sidebar with Mod+B while typing, once per non-repeat press', async () => {
    const input = document.createElement('input')
    document.body.append(input)
    try {
      const messages = await dispatchKeys(
        Sidebar.subscriptions.keyboardShortcut.dependenciesToStream({ isListening: true }),
        () => {
          input.dispatchEvent(key('b'))
          input.dispatchEvent(key('b', { repeat: true }))
        },
      )
      expect(messages).toEqual([{ _tag: 'Toggled' }])
    } finally {
      input.remove()
    }
  })
})

it('CommandDialog.boot preserves opening effects and routes results into its Dialog', async () => {
  const result = Command.CommandDialog.boot({ id: 'boot-command' })
  expect(result.model.dialog.isOpen).toBe(true)
  expect(result.model.command.id).toBe('boot-command')
  expect(result.outMessage?._tag).toBe('Opened')
  expect(result.commands?.length).toBeGreaterThan(0)
  const command = result.commands?.find((command) => command.name === 'ShowDialog')
  if (!command) throw new Error('Expected ShowDialog command')
  const message = await Effect.runPromise(command.effect)
  expect(message._tag).toBe('GotDialogMessage')
  // No matching dialog is mounted, so the real opening effect reports failure.
  const failed = Command.CommandDialog.update(result.model, message)
  expect(failed.model.dialog.isOpen).toBe(false)
})
