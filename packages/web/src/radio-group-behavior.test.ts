import { describe, it } from 'vitest'
import { RadioGroup } from '@foldkit/ui'
import { Scene } from 'foldkit/test'
import * as Demo from './demo/assemble'
import { radioGroupView } from './demo/views/radio-group'

const focus = () =>
  Scene.Command.resolve(RadioGroup.FocusOption, RadioGroup.Message.CompletedFocusOption())

describe('RadioGroup documented examples', () => {
  it('renders the description example with field anatomy and accessible descriptions', () => {
    const comfortable = Scene.selector('[id="radio-description-demo-option-1"]')
    Scene.scene(
      { update: Demo.update, view: radioGroupView },
      Scene.given(Demo.init().model),
      Scene.expect(Scene.role('radiogroup', { name: 'Density with descriptions' })).toExist(),
      Scene.expect(
        Scene.selector('[data-slot="field"] [id="radio-description-demo-option-0"]'),
      ).toExist(),
      Scene.expect(
        Scene.selector('[data-slot="field-content"] [id="radio-description-demo-option-1-label"]'),
      ).toExist(),
      Scene.expect(
        Scene.selector('[id="radio-description-demo-option-0"]'),
      ).toHaveAccessibleDescription('Standard spacing for most use cases.'),
      Scene.expect(comfortable).toHaveAccessibleDescription('More space between elements.'),
      Scene.expect(
        Scene.selector('[id="radio-description-demo-option-2"]'),
      ).toHaveAccessibleDescription('Minimal spacing for dense layouts.'),
      Scene.expect(comfortable).toBeChecked(),
    )
  })

  it('renders a separate selectable choice-card example', () => {
    const plus = Scene.role('radio', { name: 'Plus' })
    const pro = Scene.role('radio', { name: 'Pro' })
    Scene.scene(
      { update: Demo.update, view: radioGroupView },
      Scene.given(Demo.init().model),
      Scene.expect(Scene.role('radiogroup', { name: 'Subscription plan choice card' })).toExist(),
      Scene.expect(
        Scene.selector(
          '[data-slot="field-label"] [data-slot="field"] [id="radio-choice-card-demo-option-0"]',
        ),
      ).toExist(),
      Scene.expect(plus).toHaveAccessibleDescription('For individuals and small teams.'),
      Scene.expect(pro).toHaveAccessibleDescription('For growing businesses.'),
      Scene.expect(plus).toBeChecked(),
      Scene.click(pro),
      focus(),
      Scene.expect(pro).toBeChecked(),
      Scene.expect(plus).not.toBeChecked(),
      Scene.expect(Scene.selector('[id="radio-description-demo-option-1"]')).toBeChecked(),
    )
  })

  it('renders the subscription fieldset and updates its form value', () => {
    const monthly = Scene.role('radio', { name: 'Monthly ($9.99/month)' })
    const yearly = Scene.role('radio', { name: 'Yearly ($99.99/year)' })
    const lifetime = Scene.role('radio', { name: 'Lifetime ($299.99)' })
    Scene.scene(
      { update: Demo.update, view: radioGroupView },
      Scene.given(Demo.init().model),
      Scene.expect(Scene.role('radiogroup', { name: 'Subscription Plan' })).toExist(),
      Scene.expect(Scene.selector('fieldset [data-variant="label"]')).toExist(),
      Scene.expect(monthly).toBeChecked(),
      Scene.expect(Scene.selector('input[name="subscription-plan"]')).toHaveValue('monthly'),
      Scene.click(yearly),
      focus(),
      Scene.expect(yearly).toBeChecked(),
      Scene.keydown(yearly, 'ArrowDown'),
      focus(),
      Scene.expect(lifetime).toBeChecked(),
      Scene.expect(Scene.selector('input[name="subscription-plan"]')).toHaveValue('lifetime'),
    )
  })

  it('disables only the first option while the remaining options stay selectable', () => {
    const disabled = Scene.role('radio', { name: 'Disabled' })
    const option2 = Scene.role('radio', { name: 'Option 2' })
    const option3 = Scene.role('radio', { name: 'Option 3' })
    Scene.scene(
      { update: Demo.update, view: radioGroupView },
      Scene.given(Demo.init().model),
      Scene.expect(disabled).toBeDisabled(),
      Scene.expect(option2).not.toBeDisabled(),
      Scene.expect(option3).not.toBeDisabled(),
      Scene.expect(Scene.selector('[id="radio-disabled-demo-option-0"][tabIndex="-1"]')).toExist(),
      Scene.expect(option2).toBeChecked(),
      Scene.click(option3),
      focus(),
      Scene.expect(option3).toBeChecked(),
      Scene.expect(option2).not.toBeChecked(),
    )
  })

  it('renders all invalid choices as selectable invalid fields', () => {
    const email = Scene.role('radio', { name: 'Email only' })
    const sms = Scene.role('radio', { name: 'SMS only' })
    const both = Scene.role('radio', { name: 'Both Email & SMS' })
    Scene.scene(
      { update: Demo.update, view: radioGroupView },
      Scene.given(Demo.init().model),
      Scene.expect(
        Scene.selector('[data-invalid="true"] [id="radio-invalid-demo-option-0"]'),
      ).toExist(),
      Scene.expect(
        Scene.selector('[data-invalid="true"] [id="radio-invalid-demo-option-1"]'),
      ).toExist(),
      Scene.expect(
        Scene.selector('[data-invalid="true"] [id="radio-invalid-demo-option-2"]'),
      ).toExist(),
      Scene.expect(
        Scene.selector('[id="radio-invalid-demo-option-0"][aria-invalid="true"]'),
      ).toExist(),
      Scene.expect(
        Scene.selector('[id="radio-invalid-demo-option-1"][aria-invalid="true"]'),
      ).toExist(),
      Scene.expect(
        Scene.selector('[id="radio-invalid-demo-option-2"][aria-invalid="true"]'),
      ).toExist(),
      Scene.expect(email).toBeChecked(),
      Scene.expect(sms).not.toBeChecked(),
      Scene.expect(both).not.toBeChecked(),
      Scene.click(both),
      focus(),
      Scene.expect(both).toBeChecked(),
      Scene.expect(Scene.selector('input[name="notification-preferences"]')).toHaveValue('both'),
    )
  })

  it('renders and operates the Arabic example in right-to-left direction', () => {
    const comfortable = Scene.role('radio', { name: 'مريح' })
    const compact = Scene.role('radio', { name: 'مضغوط' })
    Scene.scene(
      { update: Demo.update, view: radioGroupView },
      Scene.given(Demo.init().model),
      Scene.expect(Scene.selector('[dir="rtl"] [role="radiogroup"]')).toExist(),
      Scene.expect(comfortable).toHaveAccessibleDescription('مساحة أكبر بين العناصر.'),
      Scene.expect(compact).toHaveAccessibleDescription('تباعد أدنى للتخطيطات الكثيفة.'),
      Scene.expect(comfortable).toBeChecked(),
      Scene.click(compact),
      focus(),
      Scene.expect(compact).toBeChecked(),
      Scene.expect(Scene.selector('[id="radio-group-demo-option-1"]')).toBeChecked(),
    )
  })
})
