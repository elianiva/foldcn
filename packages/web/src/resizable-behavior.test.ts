import { describe, expect, it } from 'vitest'
import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Scene } from 'foldkit/test'
import * as Resizable from '../../registry/registry/default/ui/resizable'
import * as Box from '../../registry/registry/default/ui/resizable-box'

const constraint = (overrides: Partial<Box.PanelConstraint> = {}): Box.PanelConstraint => ({
  id: 'panel',
  minSize: 0,
  maxSize: 100,
  collapsible: false,
  collapsedSize: 0,
  ...overrides,
})

const adjust = (
  delta: number,
  initialLayout: ReadonlyArray<number>,
  panelConstraints: ReadonlyArray<Box.PanelConstraint>,
  trigger?: Box.LayoutTrigger,
) =>
  Box.adjustLayoutByDelta({
    delta,
    initialLayout,
    prevLayout: initialLayout,
    panelConstraints,
    pivotIndices: { first: 0, second: 1 },
    trigger,
  })

describe('resizable engine — panel size validation', () => {
  it('clamps to min and max, and snaps a collapsible panel at the halfway point', () => {
    expect(Box.validatePanelSize(constraint({ minSize: 20 }), 5)).toBe(20)
    expect(Box.validatePanelSize(constraint({ maxSize: 60 }), 90)).toBe(60)
    expect(Box.validatePanelSize(constraint({ minSize: 50 }), 75)).toBe(75)
    const collapsible = constraint({ minSize: 20, collapsedSize: 0, collapsible: true })
    expect(Box.validatePanelSize(collapsible, 9)).toBe(0)
    expect(Box.validatePanelSize(collapsible, 11)).toBe(20)
    expect(Box.validatePanelSize(collapsible, 30)).toBe(30)
  })
})

describe('resizable engine — default layout', () => {
  it('shares the remainder between panels without an explicit size', () => {
    expect(Box.calculateDefaultLayout([{ defaultSize: 25 }, {}])).toEqual([25, 75])
    expect(Box.calculateDefaultLayout([{}, {}, {}])).toEqual([33.333, 33.333, 33.333])
    expect(Box.calculateDefaultLayout([{ defaultSize: 40 }, { defaultSize: 60 }])).toEqual([40, 60])
  })

  it('rescales to 100 and clamps to constraints', () => {
    expect(Box.validatePanelGroupLayout([30, 30], [constraint(), constraint()])).toEqual([50, 50])
    expect(
      Box.validatePanelGroupLayout(
        [20, 80],
        [constraint({ minSize: 40 }), constraint({ maxSize: 50, minSize: 10 })],
      ),
    ).toEqual([50, 50])
  })

  it('throws when the layout and constraint counts disagree', () => {
    expect(() => Box.validatePanelGroupLayout([50], [constraint(), constraint()])).toThrow()
  })

  it('rejects duplicate panel ids', () => {
    expect(() =>
      Box.init({ id: 'split', panels: [{ id: 'a' }, { id: 'b' }, { id: 'a' }] }),
    ).toThrow()
  })
})

describe('resizable engine — delta redistribution', () => {
  it('moves the separator between the pivot pair', () => {
    const even = [constraint(), constraint()]
    expect(adjust(10, [50, 50], even)).toEqual([60, 40])
    expect(adjust(-10, [50, 50], even)).toEqual([40, 60])
    expect(adjust(0, [50, 50], even)).toEqual([50, 50])
  })

  it('stops at the neighbour min instead of overflowing it', () => {
    expect(adjust(10, [50, 50], [constraint(), constraint({ minSize: 45 })])).toEqual([55, 45])
    expect(adjust(-10, [50, 50], [constraint({ minSize: 45 }), constraint()])).toEqual([45, 55])
  })

  it('cascades into a third panel when the adjacent one is clamped', () => {
    const constraints = [constraint(), constraint({ minSize: 25 }), constraint()]
    expect(adjust(30, [50, 25, 25], constraints)).toEqual([75, 25, 0])
  })

  it('redistributes around a non-zero pivot', () => {
    const constraints = [constraint(), constraint(), constraint()]
    expect(
      Box.adjustLayoutByDelta({
        delta: 10,
        initialLayout: [25, 25, 50],
        prevLayout: [25, 25, 50],
        panelConstraints: constraints,
        pivotIndices: { first: 1, second: 2 },
      }),
    ).toEqual([25, 35, 40])
  })

  it('expands a collapsed panel only once the drag crosses the halfway point', () => {
    const constraints = [
      constraint({ collapsible: true, minSize: 20, collapsedSize: 0 }),
      constraint(),
    ]
    expect(adjust(10, [0, 100], constraints, 'mouse-or-touch')).toEqual([0, 100])
    expect(adjust(15, [0, 100], constraints, 'mouse-or-touch')).toEqual([20, 80])
  })

  it('collapses a panel at its minimum on a keyboard nudge', () => {
    const constraints = [
      constraint({ collapsible: true, minSize: 20, collapsedSize: 0 }),
      constraint(),
    ]
    expect(adjust(-5, [20, 80], constraints, 'keyboard')).toEqual([0, 100])
    expect(adjust(5, [0, 100], constraints, 'keyboard')).toEqual([20, 80])
  })

  it('returns the previous layout when the delta cannot be applied', () => {
    const constraints = [constraint({ maxSize: 60 }), constraint({ maxSize: 40 })]
    expect(adjust(50, [60, 40], constraints)).toEqual([60, 40])
  })
})

describe('resizable submodel — init', () => {
  it('normalizes explicit and default sizes and resolves constraints', () => {
    const model = Box.init({
      id: 'split',
      panels: [{ id: 'left', defaultSize: 25, minSize: 20 }, { id: 'right' }],
    })
    expect(model.orientation).toBe('horizontal')
    expect(Box.layoutFromModel(model)).toEqual({ left: 25, right: 75 })
    expect(Box.constraintsFromModel(model)[0]).toMatchObject({ id: 'left', minSize: 20 })
    expect(model.dragState._tag).toBe('Idle')
  })

  it('honours an initial layout and the orientation', () => {
    const model = Box.init({
      id: 'stack',
      orientation: 'vertical',
      panels: [{ id: 'top', defaultSize: 30 }, { id: 'bottom' }],
      defaultLayout: { top: 60 },
    })
    expect(model.orientation).toBe('vertical')
    expect(Box.layoutFromModel(model)).toEqual({ top: 60, bottom: 40 })
  })
})

describe('resizable submodel — keyboard and out-message', () => {
  const model = Box.init({ id: 'split', panels: [{ id: 'a' }, { id: 'b' }] })

  it('steps 5% on the group axis and ignores the other axis and unknown keys', () => {
    expect(
      Box.layoutFromModel(
        Box.update(model, Box.Message.KeyedHandle({ handleIndex: 0, key: 'ArrowRight' })).model,
      ),
    ).toEqual({ a: 55, b: 45 })
    expect(
      Box.layoutFromModel(
        Box.update(model, Box.Message.KeyedHandle({ handleIndex: 0, key: 'ArrowLeft' })).model,
      ),
    ).toEqual({ a: 45, b: 55 })
    expect(
      Box.update(model, Box.Message.KeyedHandle({ handleIndex: 0, key: 'ArrowUp' })).model,
    ).toEqual(model)
    expect(
      Box.update(model, Box.Message.KeyedHandle({ handleIndex: 0, key: 'Tab' })).model,
    ).toEqual(model)
  })

  it('drives the primary panel to its bounds with Home and End', () => {
    expect(
      Box.layoutFromModel(
        Box.update(model, Box.Message.KeyedHandle({ handleIndex: 0, key: 'End' })).model,
      ),
    ).toEqual({ a: 100, b: 0 })
    expect(
      Box.layoutFromModel(
        Box.update(model, Box.Message.KeyedHandle({ handleIndex: 0, key: 'Home' })).model,
      ),
    ).toEqual({ a: 0, b: 100 })
  })

  it('restores the pre-collapse size on the second Enter and falls back to minSize', () => {
    const collapsible = Box.init({
      id: 'split',
      panels: [{ id: 'a', collapsible: true, minSize: 20, collapsedSize: 0 }, { id: 'b' }],
    })
    const collapsed = Box.update(
      collapsible,
      Box.Message.KeyedHandle({ handleIndex: 0, key: 'Enter' }),
    )
    expect(Box.layoutFromModel(collapsed.model)).toEqual({ a: 0, b: 100 })
    expect(collapsed.outMessage).toEqual(Box.OutMessage.LayoutChanged({ layout: { a: 0, b: 100 } }))
    const expanded = Box.update(
      collapsed.model,
      Box.Message.KeyedHandle({ handleIndex: 0, key: 'Enter' }),
    )
    expect(Box.layoutFromModel(expanded.model)).toEqual({ a: 50, b: 50 })

    const startsCollapsed = Box.init({
      id: 'split',
      panels: [
        { id: 'a', defaultSize: 0, collapsible: true, minSize: 20, collapsedSize: 0 },
        { id: 'b' },
      ],
    })
    expect(
      Box.layoutFromModel(
        Box.update(startsCollapsed, Box.Message.KeyedHandle({ handleIndex: 0, key: 'Enter' }))
          .model,
      ),
    ).toEqual({ a: 20, b: 80 })
  })

  it('steps the vertical axis with ArrowDown and ignores the horizontal one', () => {
    const vertical = Box.init({
      id: 'split',
      orientation: 'vertical',
      panels: [{ id: 'a' }, { id: 'b' }],
    })
    expect(
      Box.layoutFromModel(
        Box.update(vertical, Box.Message.KeyedHandle({ handleIndex: 0, key: 'ArrowDown' })).model,
      ),
    ).toEqual({ a: 55, b: 45 })
    expect(
      Box.layoutFromModel(
        Box.update(vertical, Box.Message.KeyedHandle({ handleIndex: 0, key: 'ArrowUp' })).model,
      ),
    ).toEqual({ a: 45, b: 55 })
    expect(
      Box.update(vertical, Box.Message.KeyedHandle({ handleIndex: 0, key: 'ArrowRight' })).model,
    ).toEqual(vertical)
  })

  it('drives a non-zero pivot handle from a middle panel', () => {
    const three = Box.init({
      id: 'split',
      panels: [
        { id: 'a', defaultSize: 50 },
        { id: 'b', defaultSize: 25 },
        { id: 'c', defaultSize: 25 },
      ],
    })
    expect(
      Box.layoutFromModel(
        Box.update(three, Box.Message.KeyedHandle({ handleIndex: 1, key: 'ArrowRight' })).model,
      ),
    ).toEqual({ a: 50, b: 30, c: 20 })
  })

  it('computes the separator ARIA bounds from the primary panel constraints', () => {
    const collapsible = Box.init({
      id: 'split',
      panels: [
        { id: 'a', collapsible: true, minSize: 20, collapsedSize: 0, maxSize: 60 },
        { id: 'b' },
      ],
    })
    expect(Box.separatorAria(collapsible, 0)).toEqual({
      valueNow: 50,
      valueMin: 0,
      valueMax: 60,
      valueControls: 'split-panel-a',
    })
    expect(
      Box.separatorAria(Box.init({ id: 'x', panels: [{ id: 'a', minSize: 20 }, { id: 'b' }] }), 0),
    ).toEqual({
      valueNow: 50,
      valueMin: 20,
      valueMax: 100,
      valueControls: 'x-panel-a',
    })
  })

  it('ignores out-of-range handle indices', () => {
    expect(
      Box.update(model, Box.Message.PressedHandle({ handleIndex: -1, clientX: 0, clientY: 0 }))
        .model,
    ).toEqual(model)
    expect(
      Box.update(model, Box.Message.PressedHandle({ handleIndex: 1, clientX: 0, clientY: 0 }))
        .model,
    ).toEqual(model)
    expect(
      Box.update(model, Box.Message.KeyedHandle({ handleIndex: 1, key: 'ArrowRight' })).model,
    ).toEqual(model)
    expect(Box.update(model, Box.Message.DoubleClickedHandle({ handleIndex: 1 })).model).toEqual(
      model,
    )
    expect(Box.update(model, Box.Message.DoubleClickedHandle({ handleIndex: -1 })).model).toEqual(
      model,
    )
  })

  it('emits nothing when a key does not move the separator', () => {
    const result = Box.update(model, Box.Message.KeyedHandle({ handleIndex: 0, key: 'Tab' }))
    expect(result.outMessage).toBeUndefined()
  })
})

describe('resizable submodel — pointer drag', () => {
  const model = Box.init({
    id: 'split',
    panels: [{ id: 'a' }, { id: 'b' }],
  })

  it('measures the container, converts the pointer delta, then releases', () => {
    const pressed = Box.update(
      model,
      Box.Message.PressedHandle({ handleIndex: 0, clientX: 100, clientY: 0 }),
    )
    expect(pressed.commands?.[0]?.name).toBe('MeasureContainer')
    expect(pressed.model.dragState).toMatchObject({ _tag: 'Dragging', pointer: 100 })

    const measured = Box.update(
      pressed.model,
      Box.Message.MeasuredContainer({ handleIndex: 0, pixelSize: 200 }),
    )
    const dragState = measured.model.dragState
    expect(dragState._tag).toBe('Dragging')
    if (dragState._tag === 'Dragging') expect(Option.isSome(dragState.pixelSize)).toBe(true)

    const moved = Box.update(measured.model, Box.Message.MovedHandle({ clientX: 140, clientY: 0 }))
    expect(Box.layoutFromModel(moved.model)).toEqual({ a: 70, b: 30 })
    expect(moved.outMessage).toEqual(Box.OutMessage.LayoutChanged({ layout: { a: 70, b: 30 } }))

    const released = Box.update(moved.model, Box.Message.ReleasedHandle())
    expect(released.model.dragState._tag).toBe('Idle')
  })

  it('ignores pointer moves before the container is measured', () => {
    const pressed = Box.update(
      model,
      Box.Message.PressedHandle({ handleIndex: 0, clientX: 100, clientY: 0 }),
    )
    const moved = Box.update(pressed.model, Box.Message.MovedHandle({ clientX: 180, clientY: 0 }))
    expect(moved.model).toEqual(pressed.model)
  })

  it('resets to the panel default size on double click', () => {
    const sized = Box.init({ id: 'split', panels: [{ id: 'a', defaultSize: 30 }, { id: 'b' }] })
    const grown = Box.update(sized, Box.Message.KeyedHandle({ handleIndex: 0, key: 'End' })).model
    const reset = Box.update(grown, Box.Message.DoubleClickedHandle({ handleIndex: 0 })).model
    expect(Box.layoutFromModel(reset)).toEqual({ a: 30, b: 70 })
  })

  it('resets a secondary panel that is the only one with a default size', () => {
    const sized = Box.init({ id: 'split', panels: [{ id: 'a' }, { id: 'b', defaultSize: 30 }] })
    const grown = Box.update(sized, Box.Message.KeyedHandle({ handleIndex: 0, key: 'Home' })).model
    expect(Box.layoutFromModel(grown)).toEqual({ a: 0, b: 100 })
    const reset = Box.update(grown, Box.Message.DoubleClickedHandle({ handleIndex: 0 })).model
    expect(Box.layoutFromModel(reset)).toEqual({ a: 70, b: 30 })
  })

  it('rejects a zero-size measurement and ignores stale drag messages', () => {
    const pressed = Box.update(
      model,
      Box.Message.PressedHandle({ handleIndex: 0, clientX: 100, clientY: 0 }),
    )
    const unmeasured = Box.update(
      pressed.model,
      Box.Message.MeasuredContainer({ handleIndex: 0, pixelSize: 0 }),
    )
    const dragState = unmeasured.model.dragState
    expect(dragState._tag === 'Dragging' && Option.isNone(dragState.pixelSize)).toBe(true)
    expect(
      Box.update(unmeasured.model, Box.Message.MovedHandle({ clientX: 180, clientY: 0 })).model,
    ).toEqual(unmeasured.model)

    const measured = Box.update(
      pressed.model,
      Box.Message.MeasuredContainer({ handleIndex: 0, pixelSize: 200 }),
    )
    const released = Box.update(measured.model, Box.Message.ReleasedHandle()).model
    expect(
      Box.update(released, Box.Message.MovedHandle({ clientX: 180, clientY: 0 })).model,
    ).toEqual(released)
    expect(
      Box.update(released, Box.Message.MeasuredContainer({ handleIndex: 0, pixelSize: 50 })).model,
    ).toEqual(released)
  })

  it('conforms an externally-driven layout without an out-message', () => {
    expect(Box.layoutFromModel(Box.reflect(model, { a: 20, b: 80 }))).toEqual({ a: 20, b: 80 })
    expect(Box.layoutFromModel(Box.reflect({ a: 10, b: 90 })(model))).toEqual({ a: 10, b: 90 })
  })

  it('honours a partial reflect by sharing the remainder', () => {
    expect(Box.layoutFromModel(Box.reflect(model, { a: 30 }))).toEqual({ a: 30, b: 70 })
  })
})

describe('rendered Resizable contract', () => {
  const view = (model: Resizable.Model, h: HtmlBuilder<Resizable.Message>): Html =>
    Resizable.view(
      model,
      {
        panels: [{}, {}],
        handles: [{ withHandle: true }],
        handleLabel: 'Resize panels',
        toPanelContent: (index) => h.span([h.Class('panel-label')], [`Panel ${index}`]),
      },
      h,
    )
  const separator = Scene.role('separator')

  it('renders a separator per pair with the primary panel ARIA range', () => {
    Scene.scene(
      { update: Resizable.update, view },
      Scene.given(Resizable.init({ id: 'demo', panels: [{ id: 'a' }, { id: 'b' }] })),
      Scene.expect(separator).toHaveAttr('aria-valuenow', '50'),
      Scene.expect(separator).toHaveAttr('aria-valuemin', '0'),
      Scene.expect(separator).toHaveAttr('aria-valuemax', '100'),
      Scene.expect(separator).toHaveAttr('aria-controls', 'demo-panel-a'),
      Scene.expect(separator).toHaveAttr('aria-orientation', 'vertical'),
      Scene.expect(separator).toHaveAccessibleName('Resize panels'),
      Scene.expect(
        Scene.selector('[data-slot="resizable-handle"] .cn-resizable-handle-icon'),
      ).toExist(),
      Scene.expectAll(Scene.all.selector('[data-slot="resizable-panel"]')).toHaveCount(2),
      Scene.keydown(separator, 'ArrowRight'),
      Scene.expect(separator).toHaveAttr('aria-valuenow', '55'),
      Scene.expectOutMessage(Resizable.OutMessage.LayoutChanged({ layout: { a: 55, b: 45 } })),
    )
  })

  it('grows each panel by its percentage and flips the separator for a vertical group', () => {
    Scene.scene(
      { update: Resizable.update, view },
      Scene.given(
        Resizable.init({
          id: 'demo',
          orientation: 'vertical',
          panels: [{ id: 'a', defaultSize: 25 }, { id: 'b' }],
        }),
      ),
      Scene.expect(Scene.selector('#demo-panel-a')).toHaveStyle('flex-grow', '25'),
      Scene.expect(Scene.selector('#demo')).toHaveStyle('flex-direction', 'column'),
      Scene.expect(separator).toHaveAttr('aria-orientation', 'horizontal'),
    )
  })
})
