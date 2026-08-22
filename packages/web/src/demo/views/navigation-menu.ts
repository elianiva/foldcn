import type { Html, HtmlBuilder } from 'foldkit/html'

import { NavigationMenu } from '@foldcn/registry/styles/default/ui/navigation-menu'

import type { Message } from '../message'
import type { Model } from '../model'

export const navigationMenuView = (model: Model, h: HtmlBuilder<Message>): Html =>
  NavigationMenu(
    {},
    [
      NavigationMenu.list(
        {},
        [
          NavigationMenu.item({}, [NavigationMenu.link({}, ['Home'], h)], h),
          NavigationMenu.item({}, [NavigationMenu.link({}, ['Docs'], h)], h),
          NavigationMenu.item(
            {},
            [
              NavigationMenu.trigger({}, ['Components'], h),
              NavigationMenu.content(
                {},
                [
                  h.div(
                    [h.Class('flex flex-col gap-1 text-sm')],
                    [
                      h.div([h.Class('font-medium')], ['Forms']),
                      h.div([h.Class('text-muted-foreground')], ['Buttons']),
                      h.div([h.Class('text-muted-foreground')], ['Dialogs']),
                    ],
                  ),
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
    h,
  )
