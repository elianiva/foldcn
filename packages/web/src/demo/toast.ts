import { Schema as S } from 'effect'

import * as ToastModule from '@foldcn/registry/styles/default/ui/toast'

/** Payload for the showcase's toast stack. */
export const ToastPayload = S.Struct({
  title: S.String,
  maybeDescription: S.Option(S.String),
})
export type ToastPayload = typeof ToastPayload.Type

export const Toast = ToastModule.make(ToastPayload)
