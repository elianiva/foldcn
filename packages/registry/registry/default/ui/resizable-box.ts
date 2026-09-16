/** The headless layout engine behind `resizable.ts`, shipped in the same
 *  registry item. It has no view of its own: install Resizable for the styled
 *  panel group, and reach for this module directly only when you want to render
 *  the panels yourself.
 *
 *  `import * as ResizableBox from '@/components/ui/resizable-box'`
 */
import { Effect, Function, Option, Schema as S, Stream } from 'effect'
import * as Command from 'foldkit/command'
import { defineMessageUnion } from 'foldkit/message'
import { defineTaggedUnion } from 'foldkit/schema'
import type { Reflect } from 'foldkit/submodel'
import * as Subscription from 'foldkit/subscription'
import * as Update from 'foldkit/update'
import { evo } from 'foldkit/struct'

// ResizableBox models a resizable container: an ordered list of panels along
// one orientation, with a draggable, keyboard-operable separator between each
// adjacent pair. It is a foldkit model of react-resizable-panels, the engine
// behind shadcn's Resizable: sizes are percentages of the container (numeric,
// 0–100), a drag redistributes between the panels the separator sits between
// (cascading into neighbours when one hits its min/max), and a panel can be
// collapsible.
//
// The redistribution math is a direct port of react-resizable-panels'
// `adjustLayoutByDelta` / `validatePanelSize` / `validatePanelGroupLayout`, so
// drag and keyboard follow the same pivot, cascade, and collapse-threshold
// rules. `resizable.ts` renders it with upstream's styled parts.
//
// Not ported from upstream: panel/separator `disabled`, separator
// `disableDoubleClick`, `resizeTargetMinimumSize`, and F6 separator focus
// cycling.

// PURE ENGINE (ported from react-resizable-panels lib/global/utils)

/** Layout numbers are percentages rounded to three decimals, matching the
 *  upstream `formatLayoutNumber`. */
const LAYOUT_PRECISION = 3

export const formatLayoutNumber = (value: number): number =>
  Number.parseFloat(value.toFixed(LAYOUT_PRECISION))

export const layoutNumbersEqual = (actual: number, expected: number, minimumDelta = 0): boolean =>
  Math.abs(formatLayoutNumber(actual) - formatLayoutNumber(expected)) <= minimumDelta

export const compareLayoutNumbers = (actual: number, expected: number): number => {
  if (layoutNumbersEqual(actual, expected)) return 0
  return actual > expected ? 1 : -1
}

const at = (values: ReadonlyArray<number>, index: number): number => values[index] ?? 0

const arraysEqual = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index])

export type PanelConstraint = Readonly<{
  id: string
  minSize: number
  maxSize: number
  collapsible: boolean
  collapsedSize: number
}>

/** Clamps one panel size to its constraints. A collapsible panel snaps to
 *  `collapsedSize` or `minSize` at the halfway point between the two. */
export const validatePanelSize = (constraints: PanelConstraint, size: number): number => {
  const { collapsedSize, collapsible, maxSize, minSize } = constraints
  let next = size
  if (compareLayoutNumbers(next, minSize) < 0) {
    if (collapsible) {
      const halfwayPoint = (collapsedSize + minSize) / 2
      next = compareLayoutNumbers(next, halfwayPoint) < 0 ? collapsedSize : minSize
    } else {
      next = minSize
    }
  }
  next = Math.min(maxSize, next)
  return formatLayoutNumber(next)
}

/** Sizes panels without an explicit `defaultSize` so the layout sums to 100. */
export const calculateDefaultLayout = (
  panels: ReadonlyArray<Readonly<{ defaultSize?: number }>>,
): ReadonlyArray<number> => {
  let explicitCount = 0
  let total = 0
  const sizes: Array<number | undefined> = panels.map((panel) => {
    if (panel.defaultSize === undefined) return undefined
    explicitCount += 1
    const size = formatLayoutNumber(panel.defaultSize)
    total += size
    return size
  })
  const remainingCount = panels.length - explicitCount
  if (remainingCount !== 0) {
    const size = formatLayoutNumber((100 - total) / remainingCount)
    for (let index = 0; index < sizes.length; index += 1) {
      if (sizes[index] === undefined) sizes[index] = size
    }
  }
  return sizes.map((size) => size ?? 0)
}

const constraintAt = (
  panelConstraints: ReadonlyArray<PanelConstraint>,
  index: number,
): PanelConstraint =>
  panelConstraints[index] ?? {
    id: '',
    minSize: 0,
    maxSize: 100,
    collapsible: false,
    collapsedSize: 0,
  }

/** Normalizes a layout to the constraints: rescales to 100, clamps each panel,
 *  then hands leftover space to whichever panel can take it. */
export const validatePanelGroupLayout = (
  layout: ReadonlyArray<number>,
  panelConstraints: ReadonlyArray<PanelConstraint>,
): ReadonlyArray<number> => {
  if (layout.length !== panelConstraints.length) {
    throw new Error(`Invalid ${String(panelConstraints.length)} panel layout: ${layout.join(', ')}`)
  }
  const nextLayout = [...layout]
  const totalSize = nextLayout.reduce((total, size) => total + size, 0)
  if (!layoutNumbersEqual(totalSize, 100) && nextLayout.length > 0) {
    for (let index = 0; index < panelConstraints.length; index += 1) {
      nextLayout[index] = (100 / totalSize) * at(nextLayout, index)
    }
  }

  let remainingSize = 0
  for (let index = 0; index < panelConstraints.length; index += 1) {
    const unsafeSize = at(nextLayout, index)
    const safeSize = validatePanelSize(constraintAt(panelConstraints, index), unsafeSize)
    if (unsafeSize !== safeSize) {
      remainingSize += unsafeSize - safeSize
      nextLayout[index] = safeSize
    }
  }

  if (!layoutNumbersEqual(remainingSize, 0)) {
    for (let index = 0; index < panelConstraints.length; index += 1) {
      const prevSize = at(nextLayout, index)
      const safeSize = validatePanelSize(
        constraintAt(panelConstraints, index),
        prevSize + remainingSize,
      )
      if (prevSize !== safeSize) {
        remainingSize -= safeSize - prevSize
        nextLayout[index] = safeSize
        if (layoutNumbersEqual(remainingSize, 0)) break
      }
    }
  }

  return nextLayout
}

export type LayoutTrigger = 'keyboard' | 'mouse-or-touch'

export type AdjustLayoutConfig = Readonly<{
  delta: number
  initialLayout: ReadonlyArray<number>
  prevLayout: ReadonlyArray<number>
  panelConstraints: ReadonlyArray<PanelConstraint>
  pivotIndices: Readonly<{ first: number; second: number }>
  trigger?: LayoutTrigger
}>

/** Redistributes a percentage delta around one separator, cascading into
 *  neighbours when a panel is clamped and snapping collapsible panels at the
 *  halfway threshold. Returns `prevLayout` when the delta cannot be applied. */
export const adjustLayoutByDelta = (config: AdjustLayoutConfig): ReadonlyArray<number> => {
  const { panelConstraints, initialLayout: initialLayoutProp, pivotIndices, trigger } = config
  const initialLayout = [...initialLayoutProp]
  const prevLayout = [...config.prevLayout]
  const nextLayout = [...initialLayout]
  const { first, second } = pivotIndices
  let delta = config.delta

  if (layoutNumbersEqual(delta, 0)) return initialLayoutProp

  let deltaApplied = 0

  if (trigger === 'keyboard') {
    // A collapsed panel expands fully once its pivot is nudged; a panel at its
    // minimum collapses fully rather than inching below min.
    const expandIndex = delta < 0 ? second : first
    const expandConstraint = constraintAt(panelConstraints, expandIndex)
    if (expandConstraint.collapsible) {
      const prevSize = at(initialLayout, expandIndex)
      if (layoutNumbersEqual(prevSize, expandConstraint.collapsedSize)) {
        const localDelta = expandConstraint.minSize - prevSize
        if (compareLayoutNumbers(localDelta, Math.abs(delta)) > 0) {
          delta = delta < 0 ? 0 - localDelta : localDelta
        }
      }
    }

    const collapseIndex = delta < 0 ? first : second
    const collapseConstraint = constraintAt(panelConstraints, collapseIndex)
    if (collapseConstraint.collapsible) {
      const prevSize = at(initialLayout, collapseIndex)
      if (layoutNumbersEqual(prevSize, collapseConstraint.minSize)) {
        const localDelta = prevSize - collapseConstraint.collapsedSize
        if (compareLayoutNumbers(localDelta, Math.abs(delta)) > 0) {
          delta = delta < 0 ? 0 - localDelta : localDelta
        }
      }
    }
  } else {
    // Dragging a collapsed panel past the halfway point expands it to min.
    const index = delta < 0 ? second : first
    const constraints = constraintAt(panelConstraints, index)
    const prevSize = at(initialLayout, index)
    if (constraints.collapsible && compareLayoutNumbers(prevSize, constraints.minSize) < 0) {
      const gapSize = constraints.minSize - constraints.collapsedSize
      if (delta > 0) {
        const halfwayDelta = gapSize / 2
        if (compareLayoutNumbers(prevSize + delta, constraints.minSize) < 0) {
          delta = compareLayoutNumbers(delta, halfwayDelta) <= 0 ? 0 : gapSize
        }
      } else {
        const halfwayDelta = 100 - gapSize / 2
        if (compareLayoutNumbers(prevSize - delta, constraints.minSize) < 0) {
          delta = compareLayoutNumbers(100 + delta, halfwayDelta) > 0 ? 0 : -gapSize
        }
      }
    }
  }

  {
    // Cap the delta at what the panels on the far side can give up.
    const increment = delta < 0 ? 1 : -1
    let index = delta < 0 ? second : first
    let maxAvailableDelta = 0
    while (index >= 0 && index < panelConstraints.length) {
      const prevSize = at(initialLayout, index)
      maxAvailableDelta += validatePanelSize(constraintAt(panelConstraints, index), 100) - prevSize
      index += increment
    }
    const minAbsDelta = Math.min(Math.abs(delta), Math.abs(maxAvailableDelta))
    delta = delta < 0 ? 0 - minAbsDelta : minAbsDelta
  }

  {
    // Shrink the panels the separator pushes into.
    const pivotIndex = delta < 0 ? first : second
    let index = pivotIndex
    while (index >= 0 && index < panelConstraints.length) {
      const deltaRemaining = Math.abs(delta) - Math.abs(deltaApplied)
      const prevSize = at(initialLayout, index)
      const safeSize = validatePanelSize(
        constraintAt(panelConstraints, index),
        prevSize - deltaRemaining,
      )
      if (!layoutNumbersEqual(prevSize, safeSize)) {
        deltaApplied += prevSize - safeSize
        nextLayout[index] = safeSize
        if (
          deltaApplied.toFixed(3).localeCompare(Math.abs(delta).toFixed(3), undefined, {
            numeric: true,
          }) >= 0
        ) {
          break
        }
      }
      index += delta < 0 ? -1 : 1
    }
  }

  if (arraysEqual(prevLayout, nextLayout)) return config.prevLayout

  {
    // Grow the pivot panel by exactly what the others gave up.
    const pivotIndex = delta < 0 ? second : first
    const prevSize = at(initialLayout, pivotIndex)
    const unsafeSize = prevSize + deltaApplied
    const safeSize = validatePanelSize(constraintAt(panelConstraints, pivotIndex), unsafeSize)
    nextLayout[pivotIndex] = safeSize
    if (!layoutNumbersEqual(safeSize, unsafeSize)) {
      let deltaRemaining = unsafeSize - safeSize
      let index = pivotIndex
      while (index >= 0 && index < panelConstraints.length) {
        const current = at(nextLayout, index)
        const safe = validatePanelSize(
          constraintAt(panelConstraints, index),
          current + deltaRemaining,
        )
        if (!layoutNumbersEqual(current, safe)) {
          deltaRemaining -= safe - current
          nextLayout[index] = safe
        }
        if (layoutNumbersEqual(deltaRemaining, 0)) break
        index += delta > 0 ? -1 : 1
      }
    }
  }

  const totalSize = nextLayout.reduce((total, size) => total + size, 0)
  if (!layoutNumbersEqual(totalSize, 100, 0.1)) return config.prevLayout
  return nextLayout
}

// MODEL

export const PanelState = S.Struct({
  id: S.String,
  size: S.Number,
  /** The `defaultSize` this panel was initialized with, used by the
   *  double-click-to-reset gesture. */
  defaultSize: S.Option(S.Number),
  /** The size this collapsible panel had before it snapped collapsed, restored
   *  by Enter (upstream `expandedPanelSizes`). */
  expandedSize: S.Option(S.Number),
  minSize: S.Number,
  maxSize: S.Number,
  collapsible: S.Boolean,
  collapsedSize: S.Number,
})
export type PanelState = typeof PanelState.Type

const Orientation = S.Literals(['horizontal', 'vertical'])
export type Orientation = typeof Orientation.Type

const DragState = defineTaggedUnion({
  Idle: {},
  Dragging: {
    handleIndex: S.Number,
    pointer: S.Number,
    initialLayout: S.Array(S.Number),
    pixelSize: S.Option(S.Number),
  },
})
export type DragState = typeof DragState.Type

export const Model = S.Struct({
  id: S.String,
  orientation: Orientation,
  panels: S.Array(PanelState),
  dragState: DragState,
})
export type Model = typeof Model.Type

// MESSAGES

export const Message = defineMessageUnion({
  PressedHandle: { handleIndex: S.Number, clientX: S.Number, clientY: S.Number },
  MeasuredContainer: { handleIndex: S.Number, pixelSize: S.Number },
  MovedHandle: { clientX: S.Number, clientY: S.Number },
  ReleasedHandle: {},
  KeyedHandle: { handleIndex: S.Number, key: S.String },
  DoubleClickedHandle: { handleIndex: S.Number },
})
export type Message = typeof Message.Type

/** The layout as panel id → percentage. */
export type Layout = Readonly<Record<string, number>>

export const OutMessage = defineMessageUnion({
  LayoutChanged: { layout: S.Record(S.String, S.Number) },
})
export type OutMessage = typeof OutMessage.Type

// COMMANDS

/** Reads the container's panels and sums their pixel size along the
 *  orientation axis, so pointer deltas convert to percentages against the same
 *  available space react-resizable-panels uses (excluding borders and
 *  separators). Mirrors the silent no-op when the element is gone (scroll-area
 *  precedent). */
export const MeasureContainer = Command.define('MeasureContainer', {
  args: { id: S.String, handleIndex: S.Number, orientation: Orientation },
  messages: [Message.MeasuredContainer],
  execute: ({ id, handleIndex, orientation }) =>
    Effect.sync(() => {
      const container = document.getElementById(id)
      const panels =
        container === null
          ? []
          : Array.from(container.children).filter(
              (child) => child.getAttribute('data-slot') === 'resizable-panel',
            )
      const pixelSize = panels.reduce((total, panel) => {
        const rect = panel.getBoundingClientRect()
        return total + (orientation === 'horizontal' ? rect.width : rect.height)
      }, 0)
      return Message.MeasuredContainer({ handleIndex, pixelSize })
    }),
})

// INIT / UPDATE

export type PanelConfig = Readonly<{
  id: string
  /** Starting size as a percentage (0–100). Panels without one share the
   *  remainder equally. */
  defaultSize?: number
  minSize?: number
  maxSize?: number
  collapsible?: boolean
  collapsedSize?: number
}>

export type InitConfig = Readonly<{
  id: string
  orientation?: Orientation
  panels: ReadonlyArray<PanelConfig>
  /** Initial sizes by panel id, overriding each panel's `defaultSize`. */
  defaultLayout?: Layout
}>

const constraintOf = (panel: PanelConfig | PanelState): PanelConstraint => ({
  id: panel.id,
  minSize: panel.minSize ?? 0,
  maxSize: panel.maxSize ?? 100,
  collapsible: panel.collapsible ?? false,
  collapsedSize: panel.collapsedSize ?? 0,
})

/** Creates an initial resizable-box model. Sizes are normalized to 100 and
 *  clamped to each panel's constraints. */
export const init = (config: InitConfig): Model => {
  const panelIds = new Set<string>()
  for (const panel of config.panels) {
    if (panelIds.has(panel.id)) {
      throw new Error(`ResizableBox: duplicate panel id "${panel.id}"`)
    }
    panelIds.add(panel.id)
  }
  const defaultSizes = config.panels.map((panel) => ({
    defaultSize: config.defaultLayout?.[panel.id] ?? panel.defaultSize,
  }))
  const constraints = config.panels.map(constraintOf)
  const sizes = validatePanelGroupLayout(calculateDefaultLayout(defaultSizes), constraints)
  return {
    id: config.id,
    orientation: config.orientation ?? 'horizontal',
    panels: config.panels.map((panel, index) => ({
      id: panel.id,
      size: at(sizes, index),
      defaultSize: Option.fromNullishOr(defaultSizes[index]?.defaultSize),
      expandedSize: Option.none(),
      minSize: panel.minSize ?? 0,
      maxSize: panel.maxSize ?? 100,
      collapsible: panel.collapsible ?? false,
      collapsedSize: panel.collapsedSize ?? 0,
    })),
    dragState: DragState.Idle(),
  }
}

export const sizesFromModel = (model: Model): ReadonlyArray<number> =>
  model.panels.map((panel) => panel.size)

export const layoutFromModel = (model: Model): Layout =>
  Object.fromEntries(model.panels.map((panel) => [panel.id, panel.size]))

export const constraintsFromModel = (model: Model): ReadonlyArray<PanelConstraint> =>
  model.panels.map(constraintOf)

export const panelDomId = (modelId: string, panelId: string): string =>
  `${modelId}-panel-${panelId}`

export type SeparatorAria = Readonly<{
  valueNow: number
  valueMin: number
  valueMax: number
  valueControls: string
}>

/** The separator's ARIA range: the primary panel's size bounds, computed by
 *  asking the engine for the layouts at its min and max (upstream
 *  `calculateSeparatorAriaValues`). */
export const separatorAria = (model: Model, handleIndex: number): SeparatorAria => {
  const primary = model.panels[handleIndex]
  const constraints = constraintsFromModel(model)
  const current = sizesFromModel(model)
  const pivotIndices = { first: handleIndex, second: handleIndex + 1 }
  if (primary === undefined) {
    return { valueNow: 0, valueMin: 0, valueMax: 0, valueControls: '' }
  }
  const minSize = primary.collapsible ? primary.collapsedSize : primary.minSize
  const bounds = (target: number): number =>
    at(
      validatePanelGroupLayout(
        adjustLayoutByDelta({
          delta: target - primary.size,
          initialLayout: current,
          prevLayout: current,
          panelConstraints: constraints,
          pivotIndices,
        }),
        constraints,
      ),
      handleIndex,
    )
  return {
    valueNow: primary.size,
    valueMin: bounds(minSize),
    valueMax: bounds(primary.maxSize),
    valueControls: panelDomId(model.id, primary.id),
  }
}

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const writeLayout = (model: Model, sizes: ReadonlyArray<number>): Model =>
  evo(model, {
    panels: () =>
      model.panels.map((panel, index) => {
        const size = at(sizes, index)
        const collapsed = panel.collapsible && layoutNumbersEqual(size, panel.collapsedSize)
        const wasCollapsed =
          panel.collapsible && layoutNumbersEqual(panel.size, panel.collapsedSize)
        return {
          ...panel,
          size,
          expandedSize: collapsed && !wasCollapsed ? Option.some(panel.size) : panel.expandedSize,
        }
      }),
  })

const commit = (
  model: Model,
  handleIndex: number,
  delta: number,
  initialLayout: ReadonlyArray<number>,
  trigger: LayoutTrigger,
): UpdateReturn => {
  const constraints = constraintsFromModel(model)
  const prevLayout = sizesFromModel(model)
  const nextLayout = validatePanelGroupLayout(
    adjustLayoutByDelta({
      delta,
      initialLayout,
      prevLayout,
      panelConstraints: constraints,
      pivotIndices: { first: handleIndex, second: handleIndex + 1 },
      trigger,
    }),
    constraints,
  )
  if (arraysEqual(prevLayout, nextLayout)) return { model }
  const next = writeLayout(model, nextLayout)
  return { model: next, outMessage: OutMessage.LayoutChanged({ layout: layoutFromModel(next) }) }
}

const STEP = 5

/** Keyboard deltas per the WAI-ARIA window-splitter pattern, matching upstream:
 *  arrow keys step 5% on the group's axis, Home/End drive the primary panel to
 *  its small/large bound, and Enter toggles a collapsible primary panel. */
const keyboardDelta = (model: Model, handleIndex: number, key: string): Option.Option<number> => {
  const horizontal = model.orientation === 'horizontal'
  switch (key) {
    case 'ArrowLeft':
      return horizontal ? Option.some(-STEP) : Option.none()
    case 'ArrowRight':
      return horizontal ? Option.some(STEP) : Option.none()
    case 'ArrowUp':
      return horizontal ? Option.none() : Option.some(-STEP)
    case 'ArrowDown':
      return horizontal ? Option.none() : Option.some(STEP)
    case 'Home':
      return Option.some(-100)
    case 'End':
      return Option.some(100)
    case 'Enter': {
      const primary = model.panels[handleIndex]
      if (primary === undefined || !primary.collapsible) return Option.none()
      const target = layoutNumbersEqual(primary.size, primary.collapsedSize)
        ? Option.getOrElse(primary.expandedSize, () => primary.minSize)
        : primary.collapsedSize
      return Option.some(target - primary.size)
    }
    default:
      return Option.none()
  }
}

/** Processes a resizable-box message and returns the next model, commands, and
 *  an optional layout out-message. */
export const update = (model: Model, message: Message): UpdateReturn =>
  Message.match<UpdateReturn>(message, {
    PressedHandle: ({ handleIndex, clientX, clientY }) =>
      handleIndex < 0 || handleIndex >= model.panels.length - 1
        ? { model }
        : {
            model: evo(model, {
              dragState: () =>
                DragState.Dragging({
                  handleIndex,
                  pointer: model.orientation === 'horizontal' ? clientX : clientY,
                  initialLayout: sizesFromModel(model),
                  pixelSize: Option.none(),
                }),
            }),
            commands: [
              MeasureContainer({ id: model.id, handleIndex, orientation: model.orientation }),
            ],
          },
    MeasuredContainer: ({ handleIndex, pixelSize }) => {
      const { dragState } = model
      if (dragState._tag !== 'Dragging') return { model }
      if (dragState.handleIndex !== handleIndex) return { model }
      if (Option.isSome(dragState.pixelSize)) return { model }
      if (pixelSize <= 0) return { model }
      return {
        model: evo(model, {
          dragState: () => DragState.Dragging({ ...dragState, pixelSize: Option.some(pixelSize) }),
        }),
      }
    },
    MovedHandle: ({ clientX, clientY }) => {
      if (model.dragState._tag !== 'Dragging') return { model }
      const { handleIndex, pointer, initialLayout, pixelSize } = model.dragState
      if (Option.isNone(pixelSize) || pixelSize.value <= 0) return { model }
      const current = model.orientation === 'horizontal' ? clientX : clientY
      const delta = ((current - pointer) / pixelSize.value) * 100
      return commit(model, handleIndex, delta, initialLayout, 'mouse-or-touch')
    },
    ReleasedHandle: () =>
      model.dragState._tag === 'Idle'
        ? { model }
        : { model: evo(model, { dragState: () => DragState.Idle() }) },
    KeyedHandle: ({ handleIndex, key }) => {
      if (handleIndex < 0 || handleIndex >= model.panels.length - 1) return { model }
      return Option.match(keyboardDelta(model, handleIndex, key), {
        onNone: () => ({ model }),
        onSome: (delta) => commit(model, handleIndex, delta, sizesFromModel(model), 'keyboard'),
      })
    },
    DoubleClickedHandle: ({ handleIndex }) => {
      if (handleIndex < 0 || handleIndex >= model.panels.length - 1) return { model }
      const primary = model.panels[handleIndex]
      const secondary = model.panels[handleIndex + 1]
      // The delta always grows the primary panel: a defaultSize on the primary
      // moves it directly, one on the secondary is reached by the opposite sign.
      const delta =
        primary !== undefined && Option.isSome(primary.defaultSize)
          ? primary.defaultSize.value - primary.size
          : secondary !== undefined && Option.isSome(secondary.defaultSize)
            ? secondary.size - secondary.defaultSize.value
            : undefined
      if (delta === undefined) return { model }
      return commit(model, handleIndex, delta, sizesFromModel(model), 'mouse-or-touch')
    },
  })

/** Conforms an externally-driven layout onto the model without emitting an
 *  OutMessage (the world is the source of truth). Requested sizes are honored;
 *  panels missing from `layout` share the remainder, and the result is then
 *  normalized to 100 and clamped to each panel's constraints. */
export const reflect: Reflect<Model, Layout> = Function.dual(
  2,
  (model: Model, layout: Layout): Model => {
    const provided = model.panels.map((panel) => layout[panel.id])
    const providedTotal = provided.reduce<number>((total, size) => total + (size ?? 0), 0)
    const missingCount = provided.filter((size) => size === undefined).length
    const share = missingCount > 0 ? (100 - providedTotal) / missingCount : 0
    return writeLayout(
      model,
      validatePanelGroupLayout(
        model.panels.map((_panel, index) => provided[index] ?? share),
        constraintsFromModel(model),
      ),
    )
  },
)

// SUBSCRIPTIONS

const DragActivity = S.Literals(['Idle', 'Active'])

const dragActivityFromModel = (model: Model): 'Idle' | 'Active' =>
  model.dragState._tag === 'Dragging' ? 'Active' : 'Idle'

/** Document pointer stream that drives the separator drag, with the matching
 *  resize cursor and a selection lock (slider/scroll-area precedent). */
const dragPointerStream = (
  orientation: Orientation,
  dragActivity: 'Idle' | 'Active',
): Stream.Stream<Message> => {
  const endEvents = Stream.merge(
    Stream.fromEventListener(document, 'pointerup'),
    Stream.merge(
      Stream.fromEventListener(document, 'pointercancel'),
      Stream.fromEventListener(document, 'contextmenu'),
    ),
  ).pipe(Stream.map(() => Message.ReleasedHandle()))
  const pointerEvents = Stream.merge(
    Stream.fromEventListener(document, 'pointermove').pipe(
      Stream.mapEffect((event) =>
        Effect.sync(() =>
          event instanceof PointerEvent
            ? Option.some(
                // A missed pointerup (released over an iframe, or the button came
                // up off-window) surfaces here as a move with no buttons held.
                event.buttons === 0
                  ? Message.ReleasedHandle()
                  : Message.MovedHandle({ clientX: event.clientX, clientY: event.clientY }),
              )
            : Option.none(),
        ),
      ),
      Stream.filter(Option.isSome),
      Stream.map((option) => option.value),
    ),
    endEvents,
  )
  const dragStyles = Stream.callback(() =>
    Effect.acquireRelease(
      Effect.sync(() => {
        document.documentElement.style.setProperty('user-select', 'none')
        document.documentElement.style.setProperty('-webkit-user-select', 'none')
        const cursorStyle = document.createElement('style')
        cursorStyle.textContent =
          orientation === 'horizontal'
            ? '* { cursor: col-resize !important; }'
            : '* { cursor: row-resize !important; }'
        document.head.appendChild(cursorStyle)
        return cursorStyle
      }),
      (cursorStyle) =>
        Effect.sync(() => {
          document.documentElement.style.removeProperty('user-select')
          document.documentElement.style.removeProperty('-webkit-user-select')
          cursorStyle.remove()
        }),
    ).pipe(Effect.flatMap(() => Effect.never)),
  )
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Stream.when widens the element type
  return Stream.when(
    Stream.merge(pointerEvents, dragStyles),
    Effect.sync(() => dragActivity === 'Active'),
  ) as Stream.Stream<Message>
}

/** Document pointer tracking for the separator drag. Lift these into the app's
 *  subscriptions for every resizable-box instance. */
export const subscriptions = Subscription.make<Model, Message>()((entry) => ({
  dragPointer: entry(
    { dragActivity: DragActivity, orientation: Orientation },
    {
      modelToDependencies: (model) => ({
        dragActivity: dragActivityFromModel(model),
        orientation: model.orientation,
      }),
      dependenciesToStream: ({ dragActivity, orientation }) =>
        dragPointerStream(orientation, dragActivity),
    },
  ),
}))
