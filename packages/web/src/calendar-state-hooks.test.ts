// Regression guard: foldcn's calendar state styling must stay wired to the
// attributes foldkit actually emits. The @foldkit/ui Calendar submodel puts
// its state data attrs (data-today/data-selected/data-focused/data-outside-
// month/data-disabled) on the gridcell div with EMPTY values ("data-x="""),
// so the day/month/year button hooks must (a) match on attribute presence
// — never upstream's [data-x=true] form — and (b) key off a plain `group`
// class that calendarCellClass mounts alongside upstream's named group/day.
// Before this guard, the cell lost its plain `group` during the shadcn v4
// derivation and every unscooped group-data-* hook compiled to selectors
// nothing in the rendered tree could match, silently unstyling selected,
// today, outside-month, disabled and focused days.
import { describe, expect, it } from 'vitest'
import { Option } from 'effect'
import { inertHtml } from 'foldkit/html'
import { CalendarDate } from 'foldkit/calendar'
import { Scene } from 'foldkit/test'
import { Calendar as FoldkitCalendar } from '@foldkit/ui'

import * as Calendar from '../../registry/styles/default/ui/calendar'

const today = CalendarDate.make({ year: 2026, month: 8, day: 22 })

type StateNode = {
  sel?: string
  data?: { attrs?: Record<string, unknown>; class?: Record<string, boolean> }
  children?: ReadonlyArray<StateNode | string>
}

const classTokens = (node: StateNode): Array<string> =>
  Object.entries(node.data?.class ?? {})
    .filter(([, on]) => on)
    .map(([name]) => name)

const walk = (node: StateNode | string | undefined, visit: (n: StateNode) => void): void => {
  if (!node || typeof node === 'string') return
  visit(node)
  for (const child of node.children ?? []) walk(child, visit)
}

/** Gridcell divs carrying a given foldkit state attr (data-* empty value). */
const cellsWithAttr = (html: StateNode, attr: string): Array<StateNode> => {
  const found: Array<StateNode> = []
  walk(html, (n) => {
    if (n.sel === 'div' && n.data?.attrs && attr in n.data.attrs) found.push(n)
  })
  return found
}

/** Day buttons of the styled Days view (the cn-calendar-day-button marker is
 *  an unstyled extension hook, stripped at resolve time like upstream). */
const dayButtons = (html: StateNode): Array<StateNode> => {
  const found: Array<StateNode> = []
  walk(html, (n) => {
    if (n.sel === 'button' && classTokens(n).includes('group-data-[focused]/day:relative')) {
      found.push(n)
    }
  })
  return found
}

const assertHtml = (sim: { html?: StateNode }, assert: (html: StateNode) => void): void => {
  expect(sim.html).toBeDefined()
  if (sim.html) assert(sim.html)
}

describe('calendar state hooks', () => {
  it('selected day cell mounts plain .group + group/day + data-selected', () => {
    const model = Calendar.init({ id: 'cal', today })
    const viewInputs = Calendar.styledViewInputs(
      { maybeSelectedDate: Option.some(today) },
      inertHtml,
    )
    Scene.scene(
      { update: Calendar.update, view: Scene.withViewInputs(Calendar.view, viewInputs)() },
      Scene.given(model),
      Scene.tap((sim) =>
        assertHtml(sim, (html) => {
          const cells = cellsWithAttr(html, 'data-selected')
          expect(cells.length).toBe(1)
          for (const cell of cells) {
            expect(classTokens(cell)).toContain('group')
            expect(classTokens(cell)).toContain('group/day')
          }
        }),
      ),
    )
  })

  it('today cell mounts .group + data-today', () => {
    const model = Calendar.init({ id: 'cal', today })
    const viewInputs = Calendar.styledViewInputs({ maybeSelectedDate: Option.none() }, inertHtml)
    Scene.scene(
      { update: Calendar.update, view: Scene.withViewInputs(Calendar.view, viewInputs)() },
      Scene.given(model),
      Scene.tap((sim) =>
        assertHtml(sim, (html) => {
          const cells = cellsWithAttr(html, 'data-today')
          expect(cells.length).toBe(1)
          for (const cell of cells) {
            expect(classTokens(cell)).toContain('group')
            expect(classTokens(cell)).toContain('group/day')
          }
        }),
      ),
    )
  })

  it('outside-month cells carry data-outside-month on .group elements', () => {
    const model = Calendar.init({ id: 'cal', today })
    const viewInputs = Calendar.styledViewInputs({ maybeSelectedDate: Option.none() }, inertHtml)
    Scene.scene(
      { update: Calendar.update, view: Scene.withViewInputs(Calendar.view, viewInputs)() },
      Scene.given(model),
      Scene.tap((sim) =>
        assertHtml(sim, (html) => {
          const cells = cellsWithAttr(html, 'data-outside-month')
          expect(cells.length).toBeGreaterThanOrEqual(1) // six-week grid edges
          for (const cell of cells) expect(classTokens(cell)).toContain('group')
        }),
      ),
    )
  })

  it('disabled cells carry data-disabled on .group elements', () => {
    const model = Calendar.init({
      id: 'cal',
      today,
      maxDate: CalendarDate.make({ year: 2026, month: 8, day: 25 }),
    })
    const viewInputs = Calendar.styledViewInputs({ maybeSelectedDate: Option.none() }, inertHtml)
    Scene.scene(
      { update: Calendar.update, view: Scene.withViewInputs(Calendar.view, viewInputs)() },
      Scene.given(model),
      Scene.tap((sim) =>
        assertHtml(sim, (html) => {
          const cells = cellsWithAttr(html, 'data-disabled')
          expect(cells.length).toBeGreaterThan(0)
          for (const cell of cells) {
            expect(classTokens(cell)).toContain('group')
            expect(classTokens(cell)).toContain('group/day')
          }
        }),
      ),
    )
  })

  it('day button hooks are presence-based and ride the cell group mount', () => {
    const model = Calendar.init({ id: 'cal', today })
    const viewInputs = Calendar.styledViewInputs(
      { maybeSelectedDate: Option.some(today) },
      inertHtml,
    )
    Scene.scene(
      { update: Calendar.update, view: Scene.withViewInputs(Calendar.view, viewInputs)() },
      Scene.given(model),
      Scene.tap((sim) =>
        assertHtml(sim, (html) => {
          const buttons = dayButtons(html)
          expect(buttons.length).toBeGreaterThanOrEqual(28) // 6-week grid
          for (const button of buttons) {
            const classes = classTokens(button)
            expect(classes.join(' ')).not.toContain('focused=true')
            expect(classes).toContain('group-data-[focused]/day:relative')
            expect(classes).toContain('group-data-[selected]:bg-primary')
          }
          const selectedCells = cellsWithAttr(html, 'data-selected')
          expect(selectedCells.length).toBe(1)
        }),
      ),
    )
  })

  it('months grid: current-month cell rides the shared .group mount too', () => {
    const model = Calendar.init({ id: 'cal', today })
    const viewInputs = Calendar.styledViewInputs({ maybeSelectedDate: Option.none() }, inertHtml)
    Scene.scene(
      { update: Calendar.update, view: Scene.withViewInputs(Calendar.view, viewInputs)() },
      Scene.given(model),
      Scene.Subscription.emit(FoldkitCalendar.ClickedHeading({})),
      Scene.Command.resolve(FoldkitCalendar.FocusGrid, FoldkitCalendar.CompletedFocusGrid({})),
      Scene.tap((sim) =>
        assertHtml(sim, (html) => {
          const cells = cellsWithAttr(html, 'data-today') // current month in Months view
          expect(cells.length).toBe(1)
          for (const cell of cells) expect(classTokens(cell)).toContain('group')
        }),
      ),
    )
  })

  it('focusing the grid emits data-focused="" on a group/day cell', () => {
    const model = Calendar.init({ id: 'cal', today })
    const viewInputs = Calendar.styledViewInputs({ maybeSelectedDate: Option.none() }, inertHtml)
    Scene.scene(
      { update: Calendar.update, view: Scene.withViewInputs(Calendar.view, viewInputs)() },
      Scene.given(model),
      Scene.Subscription.emit(FoldkitCalendar.FocusedGrid({})),
      Scene.tap((sim) =>
        assertHtml(sim, (html) => {
          const focused = cellsWithAttr(html, 'data-focused')
          expect(focused.length).toBeGreaterThanOrEqual(1)
          for (const cell of focused) expect(classTokens(cell)).toContain('group/day')
        }),
      ),
    )
  })
})
