import type { Html, HtmlBuilder } from 'foldkit/html'

import { loginForm } from '@foldcn/registry/styles/default/blocks/login-form/login-form'

import {
  SubmittedLogin,
  UpdatedLoginEmail,
  UpdatedLoginPassword,
  type Message,
} from '../message'
import type { Model } from '../model'

export const loginFormView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('w-full overflow-hidden rounded-xl border border-border')],
    [
      loginForm<Message>(
        {
          email: model.loginEmail,
          onEmailInput: (value) => UpdatedLoginEmail({ value }),
          password: model.loginPassword,
          onPasswordInput: (value) => UpdatedLoginPassword({ value }),
          onSubmit: SubmittedLogin(),
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
