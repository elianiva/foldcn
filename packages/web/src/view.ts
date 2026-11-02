import type { Document, Html, HtmlBuilder } from 'foldkit/html'
import { createLazy } from 'foldkit/html'

import { pageUrlFor, seoForPath } from './seo'
import { footerView, headerView, navSheetView } from './page/chrome'
import { activeRegistryStyle } from './active-style'
import type { RegistryStyle } from './active-style'
import { componentsIndexView } from './page/components'
import { homeView, notFoundView } from './page/home'
import { itemPage } from './page/item'
import { chartGuidePage, chartApiPage } from './page/charts'
import { chartItemNames } from './catalog/charts'
import type { AppRoute } from './route'
import type { Message } from './message'
import type { Model } from './model'
import { Match } from 'effect'

const pathOf = (route: AppRoute): string =>
  Match.value(route).pipe(
    Match.tag('Home', () => '/'),
    Match.tag('Components', () => '/docs'),
    Match.tag('ChartGuide', () => '/docs/charts'),
    Match.tag('Item', (itemRoute) => `/docs/${itemRoute.name}`),
    Match.orElse((notFound) => notFound.path),
  )

/** Memo slots for the site shell. Args are the frame builder plus values that
 *  change only on their own interactions (theme child, active style), so
 *  scroll ticks and demo updates reuse the cached VNodes. One slot per
 *  position. */
const siteHeaderLazy = createLazy()
const siteFooterLazy = createLazy()

const siteHeader = (
  h: HtmlBuilder<Message>,
  style: RegistryStyle,
  themeToggle: Model['themeToggleGroup'],
  routeTag: string,
): Html => headerView(h, themeToggle, style, routeTag)

export const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  const path = pathOf(model.route)
  const routeTag = model.route._tag
  const routeName = routeTag === 'Item' ? model.route.name : undefined
  return {
    title: seoForPath(path).title,
    canonical: pageUrlFor(path),
    ogUrl: pageUrlFor(path),
    body: h.div(
      [h.Class('flex min-h-svh flex-col bg-background text-foreground')],
      [
        siteHeaderLazy(siteHeader, [h, activeRegistryStyle(), model.themeToggleGroup, routeTag]),
        h.main(
          [h.Class('flex-1')],
          [
            Match.value(model.route).pipe(
              Match.tag('Home', () => homeView(model, h)),
              Match.tag('Components', () => componentsIndexView(model, h)),
              Match.tag('ChartGuide', () => chartGuidePage(model, h)),
              Match.tag('Item', (itemRoute) =>
                chartItemNames.has(itemRoute.name)
                  ? chartApiPage(model, itemRoute.name, h)
                  : itemPage(model, itemRoute.name, h),
              ),
              Match.orElse(() => notFoundView(h)),
            ),
          ],
        ),
        siteFooterLazy(footerView, [h, activeRegistryStyle()]),
        navSheetView(h, model.navSheet, model.docsNavMobile, routeTag, routeName),
      ],
    ),
  }
}
