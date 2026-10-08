import { Schema as S } from 'effect'
import { Model as InstallTabsModel } from '@foldkit/ui/tabs'

import { Model as ToggleGroupModel } from './generated/registry/ui/toggle-group'
import { Model as SheetModel } from './generated/registry/ui/sheet'
import { Model as AccordionModel } from './generated/registry/ui/accordion'
import { Model as CollapsibleModel } from './generated/registry/ui/collapsible'

import { Model as DemoModelSchema } from './demo'
import { RegistryStyle } from './active-style'
import { AppRoute } from './route'

export const ThemePreference = S.Literals(['Dark', 'Light', 'System'])
export type ThemePreference = typeof ThemePreference.Type

export const ResolvedTheme = S.Literals(['Dark', 'Light'])
export type ResolvedTheme = typeof ResolvedTheme.Type

export const PackageManager = S.Literals(['npm', 'pnpm', 'bun'])
export type PackageManager = typeof PackageManager.Type

export const Model = S.Struct({
  route: AppRoute,
  maybeThemePreference: S.Option(ThemePreference),
  resolvedTheme: ResolvedTheme,
  /** The last install/external string copied, briefly shown as "Copied". */
  maybeCopiedValue: S.Option(S.String),
  demo: DemoModelSchema,
  installTabs: InstallTabsModel,
  /** The header's theme selector: a stateful ToggleGroup submodel whose
   *  selection mirrors `maybeThemePreference`. */
  themeToggleGroup: ToggleGroupModel,
  /** The mobile docs nav drawer: a Sheet submodel (a Dialog state machine
   *  owned by @foldkit/ui via the Sheet re-export), not scattered booleans. */
  navSheet: SheetModel,
  docsNavDesktop: AccordionModel,
  docsNavMobile: AccordionModel,
  chartExamples: AccordionModel,
  chartExampleSources: S.Array(CollapsibleModel),
  selectedPackageManager: PackageManager,
  /** The registry style applied to the live demo previews (see active-style.ts). */
  selectedStyle: RegistryStyle,
  /** Ids of collapsible code blocks that are currently expanded. */
  expandedCodeBlocks: S.ReadonlySet(S.String),
  loadedChartExamples: S.ReadonlySet(S.String),
  failedChartExamples: S.ReadonlySet(S.String),
  chartHover: S.Option(S.Struct({ example: S.String, index: S.Number })),
  chartLegendHover: S.Option(S.Struct({ example: S.String, key: S.String })),
  chartLockedLegends: S.ReadonlySet(S.String),
  chartWindowStarts: S.Record(S.String, S.Number),
  chartStreaming: S.ReadonlySet(S.String),
  chartStreamTokens: S.Record(S.String, S.Number),
  chartSelectionStarts: S.Record(S.String, S.Number),
  chartZoomRanges: S.Record(S.String, S.Tuple([S.Number, S.Number])),
  treemapPath: S.Array(S.Number),
  chartTreemapPaths: S.Record(S.String, S.Array(S.Number)),
  chartTreemapHover: S.Option(
    S.Struct({
      id: S.String,
      name: S.String,
      value: S.Number,
      x: S.Number,
      y: S.Number,
      color: S.String,
    }),
  ),
  chartDatasetB: S.ReadonlySet(S.String),
  chartActiveBars: S.ReadonlySet(S.String),
  chartSizes: S.Record(S.String, S.Struct({ width: S.Number, height: S.Number })),
  chartAnimationDurations: S.Record(S.String, S.Number),
  chartReplayCounts: S.Record(S.String, S.Number),
  chartAnimationModes: S.Record(S.String, S.String),
  chartAnimationDisabled: S.ReadonlySet(S.String),
})
export type Model = typeof Model.Type
