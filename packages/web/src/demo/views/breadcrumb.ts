import type { Html, HtmlBuilder } from 'foldkit/html'

import { Breadcrumb } from '@foldcn/registry/styles/default/ui/breadcrumb'

import type { Message } from '../message'
import type { Model } from '../model'

export const breadcrumbView = (model: Model, h: HtmlBuilder<Message>): Html =>
  Breadcrumb(
    {},
    [
      Breadcrumb.list(
        {},
        [
          Breadcrumb.item({}, [Breadcrumb.link({}, ['Home'], h)], h),
          Breadcrumb.separator({}, [], h),
          Breadcrumb.item({}, [Breadcrumb.link({}, ['Components'], h)], h),
          Breadcrumb.separator({}, [], h),
          Breadcrumb.item({}, [Breadcrumb.page({}, ['Breadcrumb'], h)], h),
        ],
        h,
      ),
    ],
    h,
  )
