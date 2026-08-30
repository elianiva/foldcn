import { Effect, Match as M, Option, pipe, Schema as S } from 'effect'
import { Command, Url } from 'foldkit'
import { load, pushUrl } from 'foldkit/navigation'
import { evo } from 'foldkit/struct'
import type * as Update from 'foldkit/update'
import * as Tabs from '@foldkit/ui/tabs'

import * as Demo from './demo'
import { readStoredStyle, setActiveStyle } from './active-style'
import { parseRoute } from './route'
import { Message } from './message'
import type { Message as AppMessage } from './message'
import { Model, PackageManager, ResolvedTheme, ThemePreference } from './model'
import * as ToggleGroup from './generated/registry/ui/toggle-group'

export const THEME_STORAGE_KEY = 'foldcn-theme'
export const PACKAGE_MANAGER_STORAGE_KEY = 'foldcn-package-manager'

// Create a tabs bundle for package manager selection
const PackageManagerTabs = Tabs.create<PackageManager>()

type UpdateReturn = Update.Return<Model, AppMessage>
const withUpdateReturn = M.withReturnType<UpdateReturn>()

const ApplyTheme = Command.define('ApplyTheme', {
  args: { theme: ResolvedTheme },
  messages: [Message.CompletedApplyTheme],
  execute: ({ theme }) =>
    Effect.sync(() => {
      if (typeof document !== 'undefined') {
        const root = document.documentElement
        if (theme === 'Dark') {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
        const meta = document.querySelector('meta[name="theme-color"]')
        meta?.setAttribute('content', theme === 'Dark' ? '#09090b' : '#ffffff')
      }
      return Message.CompletedApplyTheme()
    }),
})

const SaveThemePreference = Command.define('SaveThemePreference', {
  args: { preference: ThemePreference },
  messages: [Message.CompletedSaveThemePreference],
  execute: ({ preference }) =>
    Effect.sync(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, preference.toLowerCase())
      }
      return Message.CompletedSaveThemePreference()
    }),
})

const CopyText = Command.define('CopyText', {
  args: { value: S.String },
  messages: [Message.CompletedCopy],
  execute: ({ value }) =>
    Effect.gen(function* () {
      yield* Effect.promise(() =>
        typeof navigator !== 'undefined' && navigator.clipboard !== undefined
          ? navigator.clipboard.writeText(value)
          : Promise.resolve(),
      )
      // Leave the "Copied" affordance visible for a beat before clearing.
      yield* Effect.sleep('1500 millis')
      return Message.CompletedCopy({ value })
    }),
})

const NavigateInternal = Command.define('NavigateInternal', {
  args: { url: S.String },
  messages: [Message.CompletedNavigateInternal],
  execute: ({ url }) => pushUrl(url).pipe(Effect.as(Message.CompletedNavigateInternal())),
})

const ScrollToTop = Command.define('ScrollToTop', {
  messages: [Message.CompletedScrollToTop],
  execute: Effect.sync(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    return Message.CompletedScrollToTop()
  }),
})

const LoadExternal = Command.define('LoadExternal', {
  args: { href: S.String },
  messages: [Message.CompletedLoadExternal],
  execute: ({ href }) => load(href).pipe(Effect.as(Message.CompletedLoadExternal())),
})

const SavePackageManager = Command.define('SavePackageManager', {
  args: { packageManager: PackageManager },
  messages: [Message.CompletedSavePackageManager],
  execute: ({ packageManager }) =>
    Effect.sync(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(PACKAGE_MANAGER_STORAGE_KEY, packageManager)
      }
      return Message.CompletedSavePackageManager()
    }),
})

const fromStored = (raw: string): ThemePreference | undefined =>
  raw === 'dark' ? 'Dark' : raw === 'light' ? 'Light' : raw === 'system' ? 'System' : undefined

const readStoredPreference = (): Option.Option<ThemePreference> =>
  typeof localStorage === 'undefined'
    ? Option.none()
    : pipe(
        Option.some(localStorage.getItem(THEME_STORAGE_KEY)),
        Option.flatMap((raw) => (raw === null ? Option.none() : Option.some(fromStored(raw)))),
        Option.flatMap((parsed) => (parsed === undefined ? Option.none() : Option.some(parsed))),
      )

const fromStoredPackageManager = (raw: string): PackageManager | undefined =>
  raw === 'npm' ? 'npm' : raw === 'pnpm' ? 'pnpm' : raw === 'bun' ? 'bun' : undefined

const readStoredPackageManager = (): PackageManager =>
  typeof localStorage === 'undefined'
    ? 'pnpm'
    : pipe(
        Option.some(localStorage.getItem(PACKAGE_MANAGER_STORAGE_KEY)),
        Option.flatMap((raw) =>
          raw === null ? Option.none() : Option.some(fromStoredPackageManager(raw)),
        ),
        Option.match({
          onNone: () => 'pnpm' satisfies PackageManager,
          onSome: (parsed) => (parsed === undefined ? 'pnpm' : parsed),
        }),
      )

const systemPrefersDark = (): ResolvedTheme =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'Dark'
    : 'Light'

const resolveTheme = (model: Model, preference: ThemePreference): ResolvedTheme =>
  preference === 'System' ? systemPrefersDark() : preference

/** Stores a theme preference, resolves it against the system scheme, applies
 *  it, persists it, and mirrors the selection onto the header's ToggleGroup
 *  submodel. Shared by the direct SelectedThemePreference message and the
 *  ToggleGroup's ChangedValue out-message. */
const applyThemePreference = (model: Model, preference: ThemePreference): UpdateReturn => ({
  model: evo(model, {
    maybeThemePreference: () => Option.some(preference),
    resolvedTheme: () => resolveTheme(model, preference),
    themeToggleGroup: () => ToggleGroup.reflect(model.themeToggleGroup, [preference]),
  }),
  commands: [
    ApplyTheme({ theme: resolveTheme(model, preference) }),
    SaveThemePreference({ preference }),
  ],
})

const foldThemeToggleGroup = (model: Model, message: ToggleGroup.Message): UpdateReturn => {
  const {
    model: next,
    commands = [],
    outMessage,
  } = ToggleGroup.update(model.themeToggleGroup, message)
  const mappedCommands = Command.mapMessages(commands, (m) =>
    Message.GotThemeToggleGroupMessage({ message: m }),
  )

  if (outMessage === undefined) {
    return { model: evo(model, { themeToggleGroup: () => next }), commands: mappedCommands }
  }

  switch (outMessage._tag) {
    case 'ChangedValue': {
      const raw = outMessage.value[0]
      const preference =
        raw === 'Light' || raw === 'Dark' || raw === 'System'
          ? raw
          : // Ignore deselect (single toggle clears on re-click) — keep current preference.
            (Option.getOrUndefined(model.maybeThemePreference) ?? 'System')
      return applyThemePreference(model, preference)
    }
  }
}

/** Boot-time load of everything only the browser knows: the stored theme
 *  preference and package manager plus the live system color scheme. init
 *  stays deterministic so hydration adopts the prerendered DOM; the runtime
 *  runs this Command once hydration has completed and never during SSR. */
export const LoadBrowserEnvironment = Command.define('LoadBrowserEnvironment', {
  messages: [Message.LoadedBrowserEnvironment],
  execute: Effect.sync(() =>
    Message.LoadedBrowserEnvironment({
      maybePreference: readStoredPreference(),
      systemTheme: systemPrefersDark(),
      packageManager: readStoredPackageManager(),
      style: readStoredStyle(),
    }),
  ),
})

const foldDemo = (model: Model, message: Demo.DemoMessage): UpdateReturn => {
  const { model: nextDemo, commands: demoCommands = [] } = Demo.update(model.demo, message)
  return {
    model: evo(model, { demo: () => nextDemo }),
    commands: Command.mapMessages(demoCommands, (m) => Message.GotDemoMessage({ message: m })),
  }
}

const foldInstallTabs = (model: Model, message: Tabs.Message): UpdateReturn => {
  const {
    model: next,
    commands = [],
    outMessage,
  } = PackageManagerTabs.update(model.installTabs, message)
  const mappedCommands = Command.mapMessages(commands, (m) =>
    Message.GotInstallTabsMessage({ message: m }),
  )

  if (outMessage === undefined) {
    return { model: evo(model, { installTabs: () => next }), commands: mappedCommands }
  }

  switch (outMessage._tag) {
    case 'Selected':
      return {
        model: evo(model, {
          installTabs: () => next,
          selectedPackageManager: () => outMessage.value satisfies PackageManager,
        }),
        commands: [
          ...mappedCommands,
          SavePackageManager({ packageManager: outMessage.value satisfies PackageManager }),
        ],
      }
  }
}

export const update = (model: Model, message: AppMessage): UpdateReturn =>
  M.value(message).pipe(
    withUpdateReturn,
    M.tagsExhaustive({
      ClickedLink: ({ request }) =>
        M.value(request).pipe(
          withUpdateReturn,
          M.tagsExhaustive({
            Internal: ({ url }) => ({
              model,
              commands: [NavigateInternal({ url: Url.toString(url) })],
            }),
            External: ({ href }) => ({ model, commands: [LoadExternal({ href })] }),
          }),
        ),
      ChangedUrl: ({ url }) => ({
        model: evo(model, { route: () => parseRoute(url) }),
        commands: [ScrollToTop()],
      }),
      GotDemoMessage: ({ message }) => foldDemo(model, message),
      GotInstallTabsMessage: ({ message }) => foldInstallTabs(model, message),
      GotThemeToggleGroupMessage: ({ message }) => foldThemeToggleGroup(model, message),

      SelectedThemePreference: ({ preference }) => applyThemePreference(model, preference),
      ChangedSystemTheme: ({ theme }) =>
        Option.exists(model.maybeThemePreference, (p) => p === 'System')
          ? { model: evo(model, { resolvedTheme: () => theme }), commands: [ApplyTheme({ theme })] }
          : { model },
      CompletedApplyTheme: () => ({ model }),
      CompletedSaveThemePreference: () => ({ model }),
      CompletedSavePackageManager: () => ({ model }),

      LoadedBrowserEnvironment: ({ maybePreference, systemTheme, packageManager, style }) => {
        const resolvedTheme = Option.match(maybePreference, {
          onNone: () => systemTheme,
          onSome: (preference) => (preference === 'System' ? systemTheme : preference),
        })
        return {
          model: evo(model, {
            maybeThemePreference: () => maybePreference,
            resolvedTheme: () => resolvedTheme,
            selectedPackageManager: () => packageManager,
            selectedStyle: () => style,
            themeToggleGroup: () =>
              ToggleGroup.reflect(
                model.themeToggleGroup,
                Option.match(maybePreference, {
                  onNone: () => [],
                  onSome: (preference) => [preference],
                }),
              ),
          }),
          // Re-applies the class the inline head script already set pre-paint,
          // keeping documentElement and the meta theme-color on one code path.
          commands: [ApplyTheme({ theme: resolvedTheme })],
        }
      },

      ClickedCopy: ({ value }) =>
        // Guard: ignore clicks while already in the copied state (prevents spam).
        Option.isSome(model.maybeCopiedValue)
          ? { model }
          : {
              model: evo(model, { maybeCopiedValue: () => Option.some(value) }),
              commands: [CopyText({ value })],
            },
      CompletedCopy: () => ({ model: evo(model, { maybeCopiedValue: () => Option.none() }) }),
      ToggledCodeBlock: ({ id }) => ({
        model: evo(model, {
          expandedCodeBlocks: () =>
            model.expandedCodeBlocks.has(id)
              ? new Set([...model.expandedCodeBlocks].filter((v) => v !== id))
              : new Set([...model.expandedCodeBlocks, id]),
        }),
      }),
      SelectedRegistryStyle: ({ style }) => {
        // Synchronous side effect before returning: the runtime re-renders the
        // view right after update, and the re-render must observe the shim
        // exports rebound to the new tree. Persistence lives inside
        // setActiveStyle — no reload, so demo state survives the switch.
        setActiveStyle(style)
        return { model: evo(model, { selectedStyle: () => style }) }
      },
      CompletedNavigateInternal: () => ({ model }),
      CompletedLoadExternal: () => ({ model }),
      CompletedScrollToTop: () => ({ model }),
    }),
  )
