import { Effect, Match as M, Option, pipe, Schema as S } from 'effect'
import { Command, Url } from 'foldkit'
import { load, pushUrl } from 'foldkit/navigation'
import { evo } from 'foldkit/struct'
import * as Tabs from '@foldkit/ui/tabs'

import * as Demo from './demo'
import { parseRoute } from './route'
import {
  CompletedApplyTheme,
  CompletedCopy,
  CompletedLoadExternal,
  CompletedNavigateInternal,
  CompletedSavePackageManager,
  CompletedSaveThemePreference,
  CompletedScrollToTop,
  GotDemoMessage,
  GotInstallTabsMessage,
  LoadedBrowserEnvironment,
  type Message,
} from './message'
import { Model, PackageManager, ResolvedTheme, ThemePreference } from './model'

export const THEME_STORAGE_KEY = 'foldcn-theme'
export const PACKAGE_MANAGER_STORAGE_KEY = 'foldcn-package-manager'

// Create a tabs bundle for package manager selection
const PackageManagerTabs = Tabs.create<PackageManager>()

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]
const withUpdateReturn = M.withReturnType<UpdateReturn>()

const ApplyTheme = Command.define('ApplyTheme', {
  args: { theme: ResolvedTheme },
  messages: [CompletedApplyTheme],
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
      return CompletedApplyTheme()
    }),
})

const SaveThemePreference = Command.define('SaveThemePreference', {
  args: { preference: ThemePreference },
  messages: [CompletedSaveThemePreference],
  execute: ({ preference }) =>
    Effect.sync(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, preference.toLowerCase())
      }
      return CompletedSaveThemePreference()
    }),
})

const CopyText = Command.define('CopyText', {
  args: { value: S.String },
  messages: [CompletedCopy],
  execute: ({ value }) =>
    Effect.gen(function* () {
      yield* Effect.promise(() =>
        typeof navigator !== 'undefined' && navigator.clipboard !== undefined
          ? navigator.clipboard.writeText(value)
          : Promise.resolve(),
      )
      // Leave the "Copied" affordance visible for a beat before clearing.
      yield* Effect.sleep('1500 millis')
      return CompletedCopy({ value })
    }),
})

const NavigateInternal = Command.define('NavigateInternal', {
  args: { url: S.String },
  messages: [CompletedNavigateInternal],
  execute: ({ url }) => pushUrl(url).pipe(Effect.as(CompletedNavigateInternal())),
})

const ScrollToTop = Command.define('ScrollToTop', {
  messages: [CompletedScrollToTop],
  execute: Effect.sync(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    return CompletedScrollToTop()
  }),
})

const LoadExternal = Command.define('LoadExternal', {
  args: { href: S.String },
  messages: [CompletedLoadExternal],
  execute: ({ href }) => load(href).pipe(Effect.as(CompletedLoadExternal())),
})

const SavePackageManager = Command.define('SavePackageManager', {
  args: { packageManager: PackageManager },
  messages: [CompletedSavePackageManager],
  execute: ({ packageManager }) =>
    Effect.sync(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(PACKAGE_MANAGER_STORAGE_KEY, packageManager)
      }
      return CompletedSavePackageManager()
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

/** Boot-time load of everything only the browser knows: the stored theme
 *  preference and package manager plus the live system color scheme. init
 *  stays deterministic so hydration adopts the prerendered DOM; the runtime
 *  runs this Command once hydration has completed and never during SSR. */
export const LoadBrowserEnvironment = Command.define('LoadBrowserEnvironment', {
  messages: [LoadedBrowserEnvironment],
  execute: Effect.sync(() =>
    LoadedBrowserEnvironment({
      maybePreference: readStoredPreference(),
      systemTheme: systemPrefersDark(),
      packageManager: readStoredPackageManager(),
    }),
  ),
})

const foldDemo = (model: Model, message: Demo.DemoMessage): UpdateReturn => {
  const [nextDemo, demoCommands] = Demo.update(model.demo, message)
  return [
    evo(model, { demo: () => nextDemo }),
    Command.mapMessages(demoCommands, (m) => GotDemoMessage({ message: m })),
  ]
}

const foldInstallTabs = (model: Model, message: Tabs.Message): UpdateReturn => {
  const [next, commands, maybeOutMessage] = PackageManagerTabs.update(model.installTabs, message)
  const mappedCommands = Command.mapMessages(commands, (m) => GotInstallTabsMessage({ message: m }))

  return Option.match(maybeOutMessage, {
    onNone: () => [evo(model, { installTabs: () => next }), mappedCommands],
    onSome: (outMessage) => {
      switch (outMessage._tag) {
        case 'Selected':
          return [
            evo(model, {
              installTabs: () => next,
              selectedPackageManager: () => outMessage.value satisfies PackageManager,
            }),
            [
              ...mappedCommands,
              SavePackageManager({ packageManager: outMessage.value satisfies PackageManager }),
            ],
          ]
      }
    },
  })
}

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    withUpdateReturn,
    M.tagsExhaustive({
      ClickedLink: ({ request }) =>
        M.value(request).pipe(
          withUpdateReturn,
          M.tagsExhaustive({
            Internal: ({ url }) => [model, [NavigateInternal({ url: Url.toString(url) })]],
            External: ({ href }) => [model, [LoadExternal({ href })]],
          }),
        ),
      ChangedUrl: ({ url }) => [evo(model, { route: () => parseRoute(url) }), [ScrollToTop()]],
      GotDemoMessage: ({ message }) => foldDemo(model, message),
      GotInstallTabsMessage: ({ message }) => foldInstallTabs(model, message),

      SelectedThemePreference: ({ preference }) => [
        evo(model, {
          maybeThemePreference: () => Option.some(preference),
          resolvedTheme: () => resolveTheme(model, preference),
        }),
        [
          ApplyTheme({ theme: resolveTheme(model, preference) }),
          SaveThemePreference({ preference }),
        ],
      ],
      ChangedSystemTheme: ({ theme }) =>
        Option.exists(model.maybeThemePreference, (p) => p === 'System')
          ? [evo(model, { resolvedTheme: () => theme }), [ApplyTheme({ theme })]]
          : [model, []],
      CompletedApplyTheme: () => [model, []],
      CompletedSaveThemePreference: () => [model, []],
      CompletedSavePackageManager: () => [model, []],

      LoadedBrowserEnvironment: ({ maybePreference, systemTheme, packageManager }) => {
        const resolvedTheme = Option.match(maybePreference, {
          onNone: () => systemTheme,
          onSome: (preference) => (preference === 'System' ? systemTheme : preference),
        })
        return [
          evo(model, {
            maybeThemePreference: () => maybePreference,
            resolvedTheme: () => resolvedTheme,
            selectedPackageManager: () => packageManager,
          }),
          // Re-applies the class the inline head script already set pre-paint,
          // keeping documentElement and the meta theme-color on one code path.
          [ApplyTheme({ theme: resolvedTheme })],
        ]
      },

      ClickedCopy: ({ value }) =>
        // Guard: ignore clicks while already in the copied state (prevents spam).
        Option.isSome(model.maybeCopiedValue)
          ? [model, []]
          : [evo(model, { maybeCopiedValue: () => Option.some(value) }), [CopyText({ value })]],
      CompletedCopy: () => [evo(model, { maybeCopiedValue: () => Option.none() }), []],
      ToggledCodeBlock: ({ id }) => [
        evo(model, {
          expandedCodeBlocks: () =>
            model.expandedCodeBlocks.has(id)
              ? new Set([...model.expandedCodeBlocks].filter((v) => v !== id))
              : new Set([...model.expandedCodeBlocks, id]),
        }),
        [],
      ],
      CompletedNavigateInternal: () => [model, []],
      CompletedLoadExternal: () => [model, []],
      CompletedScrollToTop: () => [model, []],
    }),
  )
