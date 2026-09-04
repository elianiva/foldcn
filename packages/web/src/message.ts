import { Schema as S } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import { Url } from 'foldkit'
import { UrlRequest } from 'foldkit/navigation'

import { Message as DemoMessage } from './demo'
import { Message as InstallTabsMessage } from '@foldkit/ui/tabs'
import { Message as ToggleGroupMessage } from './generated/registry/ui/toggle-group'
import { Message as SheetMessage } from './generated/registry/ui/sheet'
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
