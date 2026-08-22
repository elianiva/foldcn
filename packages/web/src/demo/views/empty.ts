import type { Html, HtmlBuilder } from 'foldkit/html'

import { Empty } from '@foldcn/registry/styles/default/ui/empty'
import { icon } from '@foldcn/registry/styles/default/lib/icons'
import { Cloud } from 'lucide'

import type { Message } from '../message'
import type { Model } from '../model'

export const emptyView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('w-full max-w-md')],
    [
      Empty<Message>(
        {},
        [
          Empty.header<Message>(
            {},
            [
              Empty.media<Message>({ variant: 'icon' }, [icon(h, Cloud)], h),
              Empty.title<Message>({}, ['No results'], h),
              Empty.description<Message>(
                {},
                ['Try adjusting your search or filters to find what you’re looking for.'],
                h,
              ),
            ],
            h,
          ),
          Empty.content<Message>(
            {},
            [
              h.button(
                [h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground')],
                ['Clear filters'],
              ),
            ],
            h,
          ),
        ],
        h,
      ),
    ],
  )
