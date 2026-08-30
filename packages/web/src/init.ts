import { Option } from 'effect'
import { Command } from 'foldkit'
import type { Url } from 'foldkit'
import type * as Update from 'foldkit/update'
import * as Tabs from '@foldkit/ui/tabs'

import * as ToggleGroup from './generated/registry/ui/toggle-group'

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
  const { model: demo, commands: demoCommands = [] } = Demo.init()
  const installTabs = Tabs.init({ id: 'install-tabs' })

  return {
    model: {
      route: parseRoute(url),
      maybeThemePreference: Option.none(),
      resolvedTheme: 'Light',
      maybeCopiedValue: Option.none(),
      demo,
      installTabs,
      themeToggleGroup: ToggleGroup.init({ id: 'theme-toggle-group', type: 'single' }),
      selectedPackageManager: 'pnpm',
      selectedStyle: 'default',
      expandedCodeBlocks: new Set<string>(),
    },
    commands: [
      LoadBrowserEnvironment(),
      ...Command.mapMessages(demoCommands, (message) => Message.GotDemoMessage({ message })),
    ],
  }
}
