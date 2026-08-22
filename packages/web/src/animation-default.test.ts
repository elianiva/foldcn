import { describe, expect, it } from 'vitest'

import * as Combobox from '@foldcn/registry/styles/default/ui/combobox'
import * as Dialog from '@foldcn/registry/styles/default/ui/dialog'
import * as Menu from '@foldcn/registry/styles/default/ui/menu'
import * as Popover from '@foldcn/registry/styles/default/ui/popover'

// Regression guard: foldcn's overlay components must animate by default to
// match the shadcn reference. The @foldkit/ui Animation submodel only emits
// `data-enter`/`data-leave` (and its lifecycle commands) when the model's
// `isAnimated` flag is true — so a default `init` MUST set it. Before this
// guard, `init` re-exported the submodel directly and defaulted to
// `isAnimated: false`, leaving every overlay's animation classes inert.

describe('animation is enabled by default', () => {
  it('Dialog.init defaults isAnimated to true', () => {
    expect(Dialog.init({ id: 'test-dialog' }).isAnimated).toBe(true)
  })

  it('Popover.init defaults isAnimated to true', () => {
    expect(Popover.init({ id: 'test-popover' }).isAnimated).toBe(true)
  })

  it('Menu.init defaults isAnimated to true', () => {
    expect(Menu.init({ id: 'test-menu' }).isAnimated).toBe(true)
  })

  it('Combobox.init defaults isAnimated to true', () => {
    expect(Combobox.init({ id: 'test-combobox' }).isAnimated).toBe(true)
  })
})
