import { Schema as S } from 'effect'
import { m } from 'foldkit/message'
import { Url } from 'foldkit'
import { UrlRequest } from 'foldkit/navigation'

import { Message as DemoMessage } from './demo/message'
import { Message as InstallTabsMessage } from '@foldkit/ui/tabs'
import { PackageManager, ResolvedTheme, ThemePreference } from './model'

// routing
export const ClickedLink = m('ClickedLink', { request: UrlRequest })
export const ChangedUrl = m('ChangedUrl', { url: Url.Url })

// demo harness
export const GotDemoMessage = m('GotDemoMessage', { message: DemoMessage })

// theme
export const SelectedThemePreference = m('SelectedThemePreference', {
  preference: ThemePreference,
})
export const ChangedSystemTheme = m('ChangedSystemTheme', {
  theme: ResolvedTheme,
})
export const CompletedApplyTheme = m('CompletedApplyTheme')
export const CompletedSaveThemePreference = m('CompletedSaveThemePreference')

// browser environment boot load
export const LoadedBrowserEnvironment = m('LoadedBrowserEnvironment', {
  maybePreference: S.Option(ThemePreference),
  systemTheme: ResolvedTheme,
  packageManager: PackageManager,
})

// clipboard
export const ClickedCopy = m('ClickedCopy', { value: S.String })
export const CompletedCopy = m('CompletedCopy', { value: S.String })

// collapsible code blocks
export const ToggledCodeBlock = m('ToggledCodeBlock', { id: S.String })

// install tabs
export const GotInstallTabsMessage = m('GotInstallTabsMessage', {
  message: InstallTabsMessage,
})
export const CompletedSavePackageManager = m('CompletedSavePackageManager')

// navigation completions
export const CompletedNavigateInternal = m('CompletedNavigateInternal')
export const CompletedLoadExternal = m('CompletedLoadExternal')
export const CompletedScrollToTop = m('CompletedScrollToTop')

export const Message = S.Union([
  ClickedLink,
  ChangedUrl,
  GotDemoMessage,
  SelectedThemePreference,
  ChangedSystemTheme,
  LoadedBrowserEnvironment,
  CompletedApplyTheme,
  CompletedSaveThemePreference,
  ClickedCopy,
  CompletedCopy,
  ToggledCodeBlock,
  GotInstallTabsMessage,
  CompletedSavePackageManager,
  CompletedNavigateInternal,
  CompletedLoadExternal,
  CompletedScrollToTop,
])
export type Message = typeof Message.Type
