import type { Document, HtmlBuilder } from 'foldkit/html'

import { pageUrlFor, seoForPath } from './seo'
import { footerView, headerView } from './page/chrome'
import { componentsIndexView } from './page/components'
import { homeView, notFoundView } from './page/home'
import { itemPage } from './page/item'
import type { AppRoute } from './route'
import type { Message } from './message'
import type { Model } from './model'
import { Match } from 'effect'

const pathOf = (route: AppRoute): string =>
  Match.value(route).pipe(
    Match.tag('Home', () => '/'),
    Match.tag('Components', () => '/docs'),
    Match.tag('Item', (itemRoute) => `/docs/${itemRoute.name}`),
    Match.orElse((notFound) => notFound.path),
  )

export const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  const path = pathOf(model.route)
  return {
    title: seoForPath(path).title,
    canonical: pageUrlFor(path),
    ogUrl: pageUrlFor(path),
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
  }
}
