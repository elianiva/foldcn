import type { Document, HtmlBuilder } from 'foldkit/html'

import { itemTitle } from './catalog'
import { footerView, headerView } from './page/chrome'
import { componentsIndexView } from './page/components'
import { homeView, notFoundView } from './page/home'
import { itemPage } from './page/item'
import type { AppRoute } from './route'
import type { Message } from './message'
import type { Model } from './model'
import { Match } from 'effect'

const titleOf = (route: AppRoute) =>
  Match.value(route).pipe(
    Match.tag('Home', () => 'foldcn · Copy-paste components for Foldkit'),
    Match.tag('Components', () => 'Docs · foldcn'),
    Match.tag('Item', (itemRoute) => `${itemTitle(itemRoute.name)} · foldcn`),
    Match.orElse(() => 'Not found · foldcn'),
  )

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: titleOf(model.route),
  body: h.div(
    [h.Class('flex min-h-svh flex-col bg-background text-foreground')],
    [
      headerView(model, h),
      h.main(
        [h.Class('flex-1')],
        [
          Match.value(model.route).pipe(
            Match.tag('Home', () => homeView(model, h)),
            Match.tag('Components', () => componentsIndexView(model, h)),
            Match.tag('Item', (itemRoute) => itemPage(model, itemRoute.name, h)),
            Match.orElse(() => notFoundView(h)),
          ),
        ],
      ),
      footerView(h),
    ],
  ),
})
