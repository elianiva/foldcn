import type { Html, HtmlBuilder } from 'foldkit/html'

import { Alert } from '@foldcn/registry/styles/default/ui/alert'

import type { Message } from '../message'
import type { Model } from '../model'

export const alertView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-md flex-col gap-4')],
    [
      Alert<Message>(
        {},
        [
          Alert.title<Message>({}, ['Heads up!'], h),
          Alert.description<Message>(
            {},
            ['You can add components to your app using the cli.'],
            h,
          ),
        ],
        h,
      ),
      Alert<Message>(
        { variant: 'destructive' },
        [
          Alert.title<Message>({}, ['Error'], h),
          Alert.description<Message>(
            {},
            ['Your session has expired. Please log in again.'],
            h,
          ),
        ],
        h,
      ),
    ],
  )
