import type { Html, HtmlBuilder } from 'foldkit/html'

import { buttonGroup, buttonGroupItem } from '@foldcn/registry/styles/default/ui/button-group'
import { button } from '@foldcn/registry/styles/default/ui/button'

import type { Message } from '../message'
import type { Model } from '../model'

export const buttonGroupView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-sm flex-col gap-4')],
    [
      buttonGroup(
        {},
        [
          buttonGroupItem({}, 'One', h),
          buttonGroupItem({}, 'Two', h),
          buttonGroupItem({}, 'Three', h),
        ],
        h,
      ),
      buttonGroup(
        {},
        [
          buttonGroupItem({ variant: 'default' }, 'Left', h),
          buttonGroupItem({ variant: 'default' }, 'Middle', h),
          buttonGroupItem({ variant: 'default' }, 'Right', h),
        ],
        h,
      ),
      buttonGroup(
        {},
        [
          buttonGroupItem({ size: 'sm' }, 'A', h),
          buttonGroupItem({ size: 'sm' }, 'B', h),
          button<Message>({ size: 'sm', variant: 'outline' }, 'Standalone', h),
        ],
        h,
      ),
    ],
  )
