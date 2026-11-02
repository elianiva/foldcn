import { Option } from 'effect'
import type { Url } from 'foldkit'
import * as Update from 'foldkit/update'
import * as Tabs from '@foldkit/ui/tabs'

import * as ToggleGroup from './generated/registry/ui/toggle-group'
import * as Sheet from './generated/registry/ui/sheet'
import * as Accordion from './generated/registry/ui/accordion'
import * as Collapsible from './generated/registry/ui/collapsible'
import { examplesFor } from './page/chart-examples/catalog'
import { chartItemNames } from './catalog/charts'

import * as Demo from './demo'
import { parseRoute } from './route'
import { Message } from './message'
import type { Message as MessageType } from './message'
import { Model } from './model'
import { LoadBrowserEnvironment } from './update'

export type InitReturn = Update.Return<Model, MessageType>

/**
 * Builds the same first Model on the server and in the browser: every field
 * here is deterministic, so hydration adopts the prerendered DOM instead of
 * rebuilding it. Browser-only facts (stored theme, package manager, the
 * system color scheme) are loaded afterwards by the LoadBrowserEnvironment
 * boot Command, which the runtime runs once hydration has completed.
 */
export const init = (url: Url.Url): InitReturn => {
  const route = parseRoute(url)
  const chartsActive =
    route._tag === 'ChartGuide' || (route._tag === 'Item' && chartItemNames.has(route.name))
  const examples = route._tag === 'Item' ? examplesFor(route.name) : []
  const initialized = Update.foldChildInit(Demo.init(), {
    toParentModel: (demo): Model => ({
      route,
      maybeThemePreference: Option.none(),
      resolvedTheme: 'Light',
      maybeCopiedValue: Option.none(),
      demo,
      installTabs: Tabs.init({ id: 'install-tabs' }),
      themeToggleGroup: ToggleGroup.init({ id: 'theme-toggle-group', type: 'single' }),
      navSheet: Sheet.init({ id: 'nav-sheet' }),
      docsNavDesktop: Accordion.init({
        id: 'docs-nav-desktop',
        type: 'single',
        value: [!chartsActive, chartsActive],
      }),
      docsNavMobile: Accordion.init({
        id: 'docs-nav-mobile',
        type: 'single',
        value: [!chartsActive, chartsActive],
      }),
      chartExamples: Accordion.init({
        id: 'chart-examples',
        type: 'multiple',
        value: examples.map((_, index) => index === 0),
      }),
      chartExampleSources: examples.map((example) =>
        Collapsible.init({ id: `chart-example-source-${example.id}` }),
      ),
      selectedPackageManager: 'pnpm',
      selectedStyle: 'default',
      expandedCodeBlocks: new Set<string>(),
      loadedChartExamples: new Set<string>(),
      failedChartExamples: new Set<string>(),
      chartHover: Option.none(),
      chartLegendHover: Option.none(),
      chartLockedLegends: new Set(),
      chartWindowStarts: {},
      chartStreaming: new Set(),
      chartStreamTokens: {},
      chartSelectionStarts: {},
      chartZoomRanges: {},
      treemapPath: [],
      chartTreemapPaths: {},
      chartTreemapHover: Option.none(),
      chartDatasetB: new Set<string>(),
      chartActiveBars: new Set<string>(),
      chartSizes: {},
      chartAnimationDurations: {},
      chartReplayCounts: {},
      chartAnimationModes: {},
      chartAnimationDisabled: new Set<string>(),
    }),
    toParentMessage: (message) => Message.GotDemoMessage({ message }),
  })
  return {
    ...initialized,
    commands: [LoadBrowserEnvironment(), ...(initialized.commands ?? [])],
  }
}
