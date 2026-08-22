import type { Html, HtmlBuilder } from 'foldkit/html'

import { Item } from '@foldcn/registry/styles/default/ui/item'
import { icon } from '@foldcn/registry/styles/default/lib/icons'
import { User } from 'lucide'

import type { Message } from '../message'
import type { Model } from '../model'

export const itemView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('w-full max-w-md flex flex-col gap-3')],
    [
      Item.group<Message>(
        {},
        [
          Item<Message>(
            {},
            [
              Item.media<Message>({ variant: 'icon' }, [icon(h, User)], h),
              Item.content<Message>(
                {},
                [
                  Item.title<Message>({}, ['Ada Lovelace'], h),
                  Item.description<Message>({}, ['ada@example.com'], h),
                ],
                h,
              ),
              Item.actions<Message>(
                {},
                [h.button([h.Class('rounded-md border px-3 py-1 text-sm')], ['Edit'])],
                h,
              ),
            ],
            h,
          ),
          Item.separator<Message>({}, h),
          Item<Message>(
            { variant: 'muted' },
            [
              Item.media<Message>({ variant: 'icon' }, [icon(h, User)], h),
              Item.content<Message>(
                {},
                [
                  Item.title<Message>({}, ['Grace Hopper'], h),
                  Item.description<Message>({}, ['grace@example.com'], h),
                ],
                h,
              ),
            ],
            h,
          ),
        ],
        h,
      ),
    ],
  )
