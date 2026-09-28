import { describe, expect, it, vi } from 'vitest'
import { Effect, Schema as S } from 'effect'
import { Scene } from 'foldkit/test'

import * as Dialog from '../../registry/registry/default/ui/dialog'
import * as Drawer from '../../registry/registry/default/ui/drawer'
import { input } from '../../registry/registry/default/ui/input'
import * as ToastModule from '../../registry/registry/default/ui/toast'

const Toast = ToastModule.make(S.Struct({ title: S.String }))

describe('Foldkit upgrade compatibility', () => {
  it('associates a rendered input description with its control', () => {
    Scene.scene(
      {
        update: (model: boolean) => ({ model }),
        view: (_model, h) =>
          input({ id: 'email', label: 'Email', description: 'Use your work address' }, h),
      },
      Scene.given(false),
      Scene.expect(Scene.role('textbox')).toHaveAccessibleDescription('Use your work address'),
    )
  })

  it('boots dialogs and drawers with their opening commands and OutMessage', () => {
    const dialog = Dialog.boot({ id: 'open-dialog' })
    const drawer = Drawer.boot({ id: 'open-drawer', swipeDirection: 'left' })
    expect(Dialog.init({ id: 'closed-dialog' }).isOpen).toBe(false)
    expect(dialog.model.isOpen).toBe(true)
    expect(drawer.model.dialog.isOpen).toBe(true)
    expect(drawer.model.swipeDirection).toBe('left')
    expect(dialog.commands?.length).toBeGreaterThan(0)
    expect(drawer.commands?.length).toBeGreaterThan(0)
    expect(drawer.outMessage).toEqual(dialog.outMessage)
    expect(drawer.outMessage?._tag).toBe('Opened')
  })

  it('measures neutral div toast entries through the scheduled command', async () => {
    const result = Toast.show(Toast.init({ id: 'toast-measure' }), { payload: { title: 'Saved' } })
    const entry = result.model.toast.entries[0]
    if (!entry) throw new Error('Expected toast entry')
    const container = document.createElement('div')
    container.id = result.model.toast.id
    const wrapper = document.createElement('div')
    wrapper.id = entry.id
    const card = document.createElement('div')
    card.dataset.slot = 'toast'
    wrapper.append(card)
    container.append(wrapper)
    document.body.append(container)
    const measure = vi
      .spyOn(card, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 200, 72))
    try {
      const command = result.commands?.find((command) => command.name === 'MeasureToastHeights')
      if (!command) throw new Error('Expected measurement command')
      const message = await Effect.runPromise(command.effect)
      const measured = Toast.update(result.model, message)
      expect(measure).toHaveBeenCalled()
      expect(measured.model.heights[entry.id]).toBe(72)
    } finally {
      measure.mockRestore()
      container.remove()
    }
  })
})
