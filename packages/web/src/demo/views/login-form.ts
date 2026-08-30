import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { loginForm } from '../../generated/registry/blocks/login-form/login-form'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  UpdatedLoginEmail: { value: S.String },
  UpdatedLoginPassword: { value: S.String },
  SubmittedLogin: {},
})

export const loginFormView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('w-full overflow-hidden rounded-xl border border-border')],
    [
      loginForm<AppMessage>(
        {
          email: model.loginEmail,
          onEmailInput: (value) => Message.UpdatedLoginEmail({ value }),
          password: model.loginPassword,
          onPasswordInput: (value) => Message.UpdatedLoginPassword({ value }),
          onSubmit: Message.SubmittedLogin(),
        },
        h,
      ),
      ...(model.loginSubmitted
        ? [
            h.p(
              [h.Class('mb-4 px-6 text-center text-sm text-emerald-600 dark:text-emerald-400')],
              ['Signed in (demo).'],
            ),
          ]
        : []),
    ],
  )

const fields = {
  loginEmail: S.String,
  loginPassword: S.String,
  loginSubmitted: S.Boolean,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    loginEmail: '',
    loginPassword: '',
    loginSubmitted: false,
  },
  messages: [Message.UpdatedLoginEmail, Message.UpdatedLoginPassword, Message.SubmittedLogin],
  handlers: (model: State) => ({
    UpdatedLoginEmail: ({ value }: typeof Message.UpdatedLoginEmail.Type): UpdateReturn => ({
      model: evo(model, { loginEmail: () => value }),
    }),
    UpdatedLoginPassword: ({ value }: typeof Message.UpdatedLoginPassword.Type): UpdateReturn => ({
      model: evo(model, { loginPassword: () => value }),
    }),
    SubmittedLogin: (): UpdateReturn => ({ model: evo(model, { loginSubmitted: () => true }) }),
  }),
  samples: [Message.UpdatedLoginEmail({ value: 'ada@example.com' }), Message.SubmittedLogin()],
})
