// User-facing caveats for registry items whose behavior differs from their
// shadcn/ui counterpart. Most of these stem from foldkit primitive ceilings
// (no submenu kinds, no pointer-position anchoring) that are
// documented in depth in docs/shadcn-base-parity-audit.md; this map surfaces
// the short version on the item pages themselves so adopters learn the limits
// before installing.
//
// Keep entries short and behavioral. If a caveat becomes false — because a
// @foldkit/ui primitive lands or the component gains the behavior — delete the
// entry in the same change that adds the behavior.

export const gapsByItem = {
  command: [
    'Presentational surface only — no filtering, arrow-key navigation, or selection. Compose with listbox or wire your own behavior.',
  ],
  menubar: [
    'Renders independent menus in a bar — no cross-menu keyboard traversal or open-on-hover of the next trigger.',
  ],
  'context-menu': [
    'Right-click opens the menu anchored to the trigger region — foldkit has no pointer-position anchoring primitive yet.',
  ],
  toast: [
    'No swipe-to-dismiss — foldkit has no pointer-move gesture primitive yet. Auto-dismiss, hover-pause, hover-to-expand and manual close work as expected.',
  ],
  drawer: ['Bottom-docked modal with handle visuals — no drag/snap gestures.'],
  resizable: [
    'Two-pane percentage splitter — no min/max constraints, collapsible panes, or N-pane layouts.',
  ],
  'navigation-menu': [
    'Each dropdown is its own independently-anchored Popover panel — no shared/morphing Viewport panel or slide-direction indicator like upstream.',
  ],
  calendar: ['Single-date selection — no ranges or week numbers.'],
  slider: ['Single thumb, horizontal orientation only.'],
  combobox: ['Filtering is owned by your model — no built-in chips UI for multi-select.'],
  'input-group': [
    'Addons do not focus the input on click — foldkit has no scoped click-to-focus primitive yet.',
  ],
  menu: [
    'No submenu, checkbox-item, or radio-item kinds — submenus render as labelled groups and checkbox/radio rows run off demo state; toggling one closes the panel.',
  ],
  progress: [
    'Indeterminate state renders an empty track — animated indeterminacy awaits primitive support.',
  ],
} as const

const isGapItem = (name: string): name is keyof typeof gapsByItem => name in gapsByItem

export const gapsForItem = (name: string): ReadonlyArray<string> | undefined =>
  isGapItem(name) ? gapsByItem[name] : undefined
