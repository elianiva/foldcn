import { describe, expect, it } from 'vitest'
import { Schema as S } from 'effect'

import * as ToastModule from '@foldcn/registry/styles/default/ui/toast'

// Regression guard: every toast variant must flow from `show()` into the
// entry model (driving the per-variant icon, ARIA role, and `data-variant`
// the styled view renders) and only `Error` carries the destructive icon
// tint — matching upstream `toast.tsx` `ToastIcon`, where the error icon is
// the sole colored one. Before this guard, the demo's Variants section was
// inert tinted spans that never touched the variant API at all.

const Toast = ToastModule.make(S.Struct({ title: S.String }))

describe('toast variants', () => {
  it.each(['Info', 'Success', 'Warning', 'Error'] as const)(
    'show() stores variant %s on the entry',
    (variant) => {
      const model = Toast.init({ id: 'test-toast' })
      const { model: next } = Toast.show(model, { variant, payload: { title: 't' } })
      expect(next.toast.entries).toHaveLength(1)
      expect(next.toast.entries[0]?.variant).toBe(variant)
    },
  )

  it('show() without a variant defaults to Info', () => {
    const model = Toast.init({ id: 'test-toast' })
    const { model: next } = Toast.show(model, { payload: { title: 't' } })
    expect(next.toast.entries[0]?.variant).toBe('Info')
  })

  it('only the Error variant tints its icon destructive', () => {
    expect(ToastModule.toastVariantClass('Error')).toBe('text-destructive')
    expect(ToastModule.toastVariantClass('Info')).toBe('')
    expect(ToastModule.toastVariantClass('Success')).toBe('')
    expect(ToastModule.toastVariantClass('Warning')).toBe('')
  })

  it('dismiss button is positioned to anchor its close hit-slop', () => {
    // Upstream `ToastClose` is `relative ... after:-inset-2`; without
    // `relative` the invisible hit area anchors to the entry card instead
    // of the button.
    expect(ToastModule.toastDismissButtonClass).toMatch(/(^|\s)relative(\s|$)/)
  })
})
