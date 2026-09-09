import { describe, expect, it } from 'vitest'
import { Scene } from 'foldkit/test'
import * as FoldkitCombobox from '@foldkit/ui/combobox'
import * as Combobox from '../../registry/registry/default/ui/combobox'
import { AlignMultiComboboxGroup, comboboxView } from './demo/views/combobox'
import * as Demo from './demo/assemble'

const items = ['Next.js', 'SvelteKit', 'Nuxt.js'] as const
const bundle = Combobox.Multi.create<(typeof items)[number]>()

describe('combobox rendered contract', () => {
  it('clicking a multi option emits the selected value', () => {
    const openModel = {
      ...Combobox.Multi.init({ id: 'test-combobox', isAnimated: false }),
      isOpen: true,
    }
    Scene.scene(
      {
        update: bundle.update,
        view: (model, h) =>
          bundle.view(
            model,
            Combobox.multiViewInputs({
              items,
              selectedValues: [],
              restingInputValue: '',
              itemToValue: (item) => item,
              itemToDisplayText: (item) => item,
              itemToConfig: (item, context) => ({
                className: context.isActive ? 'font-medium' : '',
                content: h.span([], [item]),
              }),
            }),
            h,
          ),
      },
      Scene.given(openModel),
      Scene.Mount.resolve(
        FoldkitCombobox.PortalComboboxBackdrop,
        FoldkitCombobox.Message.CompletedPortalComboboxBackdrop(),
      ),
      Scene.Mount.resolve(
        FoldkitCombobox.AnchorCombobox,
        FoldkitCombobox.Message.CompletedAnchorCombobox(),
      ),
      Scene.click(Scene.role('option', { name: 'Next.js' })),
      Scene.expectOutMessage(Combobox.OutMessage.Selected({ value: 'Next.js' })),
    )
  })

  it('folds the selected value into the demo chip state', () => {
    const result = Demo.update(Demo.init().model, {
      _tag: 'GotMultiComboboxMessage',
      message: Combobox.Message.SelectedItem({
        item: 'Next.js',
        displayText: 'Next.js',
        wasSelected: false,
      }),
    })

    expect(result.model.multiComboboxValues).toEqual(['Next.js'])
  })

  it('selects through the mounted demo popup instead of dismissing on backdrop click', () => {
    const initial = Demo.init().model
    const openModel = {
      ...initial,
      multiCombobox: { ...initial.multiCombobox, isOpen: true },
    }

    Scene.scene(
      { update: Demo.update, view: (model, h) => comboboxView(model, h) },
      Scene.given(openModel),
      Scene.Mount.resolve(
        FoldkitCombobox.PortalComboboxBackdrop,
        FoldkitCombobox.Message.CompletedPortalComboboxBackdrop(),
      ),
      Scene.Mount.resolve(
        FoldkitCombobox.AnchorCombobox,
        FoldkitCombobox.Message.CompletedAnchorCombobox(),
      ),
      Scene.Mount.resolve(
        // The demo mount only aligns the popup; its completion is a regular
        // multi-combobox message and must not consume option selection.
        AlignMultiComboboxGroup,
        {
          _tag: 'GotMultiComboboxMessage',
          message: Combobox.Message.CompletedAnchorCombobox(),
        },
      ),
      Scene.Mount.resolve(
        FoldkitCombobox.AttachComboboxPreventBlur,
        FoldkitCombobox.Message.CompletedAttachComboboxPreventBlur(),
      ),
      Scene.Mount.resolve(
        FoldkitCombobox.AttachComboboxPreventBlur,
        FoldkitCombobox.Message.CompletedAttachComboboxPreventBlur(),
      ),
      Scene.click(Scene.role('option', { name: 'Next.js' })),
      Scene.expect(Scene.selector('[aria-label^="Remove"]')).toExist(),
      Scene.expect(Scene.role('option', { name: 'Next.js' })).toExist(),
    )
  })
})
