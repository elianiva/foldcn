import { Schema as S } from 'effect'
import { Model as InstallTabsModel } from '@foldkit/ui/tabs'

import { Model as ToggleGroupModel } from './generated/registry/ui/toggle-group'
import { Model as SheetModel } from './generated/registry/ui/sheet'

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
  selectedPackageManager: PackageManager,
  /** The registry style applied to the live demo previews (see active-style.ts). */
  selectedStyle: RegistryStyle,
  /** Ids of collapsible code blocks that are currently expanded. */
  expandedCodeBlocks: S.ReadonlySet(S.String),
})
export type Model = typeof Model.Type
