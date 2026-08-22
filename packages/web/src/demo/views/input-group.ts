import type { Html, HtmlBuilder } from 'foldkit/html'

import { inputGroup, inputGroupText, inputGroupInput } from '@foldcn/registry/styles/default/ui/input-group'
import { icon } from '@foldcn/registry/styles/default/lib/icons'
import { Mail, Lock } from 'lucide'

import type { Message } from '../message'
import type { Model } from '../model'

export const inputGroupView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-sm flex-col gap-4')],
    [
      inputGroup(
        {},
        [
          inputGroupText({}, ['@'], h),
          inputGroupInput({ id: 'ig-email', placeholder: 'email@example.com' }, h),
        ],
        h,
      ),
      inputGroup(
        {},
        [
          inputGroupInput({ id: 'ig-password', type: 'password', placeholder: 'Password' }, h),
          inputGroupText({}, [icon(h, Lock)], h),
        ],
        h,
      ),
      inputGroup(
        {},
        [
          inputGroupText({}, [icon(h, Mail)], h),
          inputGroupInput({ id: 'ig-search', placeholder: 'Search…' }, h),
          inputGroupText({}, ['.com'], h),
        ],
        h,
      ),
    ],
  )
