import { Schema as S } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import { Url } from 'foldkit'
import { UrlRequest } from 'foldkit/navigation'

import { Message as DemoMessage } from './demo'
import { Message as InstallTabsMessage } from '@foldkit/ui/tabs'
import { Message as ToggleGroupMessage } from './generated/registry/ui/toggle-group'
import { Message as SheetMessage } from './generated/registry/ui/sheet'
import { Message as AccordionMessage } from './generated/registry/ui/accordion'
import { Message as CollapsibleMessage } from './generated/registry/ui/collapsible'
import { PackageManager, ResolvedTheme, ThemePreference } from './model'
import { RegistryStyle } from './active-style'

export const Message = defineMessageUnion({
  ClickedLink: { request: UrlRequest },
  ChangedUrl: { url: Url.Url },
  GotDemoMessage: { message: DemoMessage },
  SelectedThemePreference: { preference: ThemePreference },
  ChangedSystemTheme: { theme: ResolvedTheme },
  CompletedApplyTheme: {},
  CompletedSaveThemePreference: {},
  LoadedBrowserEnvironment: {
    maybePreference: S.Option(ThemePreference),
    systemTheme: ResolvedTheme,
    packageManager: PackageManager,
    style: RegistryStyle,
  },
  ClickedCopy: { value: S.String },
  CompletedCopy: { value: S.String },
  ToggledCodeBlock: { id: S.String },
  GotDocsNavAccordionMessage: {
    surface: S.Literals(['desktop', 'mobile']),
    message: AccordionMessage,
  },
  GotChartExamplesAccordionMessage: { message: AccordionMessage },
  GotChartExampleSourceMessage: { index: S.Number, message: CollapsibleMessage },
  LoadedChartExample: { id: S.String },
  FailedChartExample: { id: S.String },
  ChartHovered: { example: S.String, index: S.NullOr(S.Number) },
  ChartLegendHovered: { example: S.String, key: S.NullOr(S.String) },
  ChartLegendClicked: { example: S.String, key: S.String },
  ChartWindowShifted: { id: S.String, offset: S.Number },
  ChartWindowStreamToggled: { id: S.String },
  ChartWindowTicked: { id: S.String, token: S.Number },
  ChartZoomStarted: { id: S.String, index: S.Number },
  ChartZoomEnded: { id: S.String, index: S.Number },
  ChartZoomReset: { id: S.String },
  TreemapFocused: { path: S.Array(S.Number) },
  ChartTreemapFocused: { id: S.String, path: S.Array(S.Number) },
  ChartTreemapHovered: {
    id: S.String,
    node: S.NullOr(
      S.Struct({ name: S.String, value: S.Number, x: S.Number, y: S.Number, color: S.String }),
    ),
  },
  ChartTreemapMoved: { id: S.String, x: S.Number, y: S.Number },
  ChartDatasetSwapped: { id: S.String },
  ChartBarToggled: { id: S.String, index: S.Number },
  ChartResized: { id: S.String, width: S.Number, height: S.Number },
  ChartAnimationDurationChanged: { id: S.String, value: S.String },
  ChartAnimationReplayed: { id: S.String },
  ChartAnimationModeChanged: { id: S.String, value: S.String },
  ChartAnimationToggled: { id: S.String },
  GotInstallTabsMessage: { message: InstallTabsMessage },
  SelectedRegistryStyle: { style: RegistryStyle },
  GotThemeToggleGroupMessage: { message: ToggleGroupMessage },
  ClickedOpenNavSheet: {},
  GotNavSheetMessage: { message: SheetMessage },
  CompletedSavePackageManager: {},
  CompletedNavigateInternal: {},
  CompletedLoadExternal: {},
  CompletedScrollToTop: {},
})
export type Message = typeof Message.Type
