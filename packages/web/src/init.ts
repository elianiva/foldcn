import { Option } from 'effect'
import { Command } from 'foldkit'
import type { Url } from 'foldkit'
import * as Tabs from '@foldkit/ui/tabs'

import * as Demo from './demo'
import { parseRoute } from './route'
import { GotDemoMessage, type Message } from './message'
import { Model } from './model'
import { LoadBrowserEnvironment } from './update'

export type InitReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

/**
 * Builds the same first Model on the server and in the browser: every field
 * here is deterministic, so hydration adopts the prerendered DOM instead of
 * rebuilding it. Browser-only facts (stored theme, package manager, the
 * system color scheme) are loaded afterwards by the LoadBrowserEnvironment
 * boot Command, which the runtime runs once hydration has completed.
 */
export const init = (url: Url.Url): InitReturn => {
  const [demo, demoCommands] = Demo.init()
  const installTabs = Tabs.init({ id: 'install-tabs' })

  return [
    {
      route: parseRoute(url),
      maybeThemePreference: Option.none(),
      resolvedTheme: 'Light',
      maybeCopiedValue: Option.none(),
      demo,
      installTabs,
      selectedPackageManager: 'pnpm',
      expandedCodeBlocks: new Set<string>(),
    },
    [LoadBrowserEnvironment(), ...Command.mapMessages(demoCommands, (message) => GotDemoMessage({ message }))],
  ]
}
