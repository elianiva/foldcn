import { Effect, Match as M, Option, pipe, Schema as S } from 'effect'
import { Command, Url } from 'foldkit'
import { load, pushUrl } from 'foldkit/navigation'
import { modifyFields } from 'foldkit/struct'
import type * as Update from 'foldkit/update'
import * as Tabs from '@foldkit/ui/tabs'

import * as Demo from './demo'
import { readStoredStyle, setActiveStyle } from './active-style'
import { parseRoute } from './route'
import { Message } from './message'
import type { Message as AppMessage } from './message'
import { Model, PackageManager, ResolvedTheme, ThemePreference } from './model'
import * as ToggleGroup from './generated/registry/ui/toggle-group'
import * as Sheet from './generated/registry/ui/sheet'
import * as Accordion from './generated/registry/ui/accordion'
import * as Collapsible from './generated/registry/ui/collapsible'
import { examplesFor } from './page/chart-examples/catalog'
import { chartItemNames } from './catalog/charts'
import { loadExample } from './page/chart-examples/loader'

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

const LoadChartExample = Command.define('LoadChartExample', {
  args: { id: S.String },
  messages: [Message.LoadedChartExample, Message.FailedChartExample],
  execute: ({ id }) =>
    Effect.tryPromise(() => loadExample(id)).pipe(
      Effect.match({
        onSuccess: () => Message.LoadedChartExample({ id }),
        onFailure: () => Message.FailedChartExample({ id }),
      }),
    ),
})

const TickChartWindow = Command.define('TickChartWindow', {
  args: { id: S.String, token: S.Number, delayMs: S.Number },
  messages: [Message.ChartWindowTicked],
  execute: ({ id, token, delayMs }) =>
    Effect.sleep(delayMs).pipe(Effect.as(Message.ChartWindowTicked({ id, token }))),
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

const systemPrefersDark = (): ResolvedTheme => {
  if (globalThis.window === undefined) return 'Light'
  const matchMedia = globalThis.window.matchMedia
  if (matchMedia === undefined) return 'Light'
  return matchMedia.call(globalThis.window, '(prefers-color-scheme: dark)').matches
    ? 'Dark'
    : 'Light'
}

const resolveTheme = (model: Model, preference: ThemePreference): ResolvedTheme =>
  preference === 'System' ? systemPrefersDark() : preference

/** Stores a theme preference, resolves it against the system scheme, applies
 *  it, persists it, and mirrors the selection onto the header's ToggleGroup
 *  submodel. Shared by the direct SelectedThemePreference message and the
 *  ToggleGroup's ChangedValue out-message. */
const applyThemePreference = (model: Model, preference: ThemePreference): UpdateReturn => ({
  model: modifyFields(model, {
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
    return {
      model: modifyFields(model, { themeToggleGroup: () => next }),
      commands: mappedCommands,
    }
  }

  return M.value(outMessage).pipe(
    M.tagsExhaustive({
      ChangedValue: (outMessage) => {
        {
          const raw = outMessage.value[0]
          const preference =
            raw === 'Light' || raw === 'Dark' || raw === 'System'
              ? raw
              : // Ignore deselect (single toggle clears on re-click) — keep current preference.
                (Option.getOrUndefined(model.maybeThemePreference) ?? 'System')
          return applyThemePreference(model, preference)
        }
      },
    }),
  )
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
    model: modifyFields(model, { demo: () => nextDemo }),
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
    return { model: modifyFields(model, { installTabs: () => next }), commands: mappedCommands }
  }

  return M.value(outMessage).pipe(
    M.tagsExhaustive({
      Selected: (outMessage) => {
        return {
          model: modifyFields(model, {
            installTabs: () => next,
            selectedPackageManager: () => outMessage.value satisfies PackageManager,
          }),
          commands: [
            ...mappedCommands,
            SavePackageManager({ packageManager: outMessage.value satisfies PackageManager }),
          ],
        }
      },
    }),
  )
}

const foldNavSheet = (model: Model, message: Sheet.Message): UpdateReturn => {
  const { model: next, commands = [] } = Sheet.update(model.navSheet, message)
  return {
    model: modifyFields(model, { navSheet: () => next }),
    commands: Command.mapMessages(commands, (m) => Message.GotNavSheetMessage({ message: m })),
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
      ChangedUrl: ({ url }) => {
        const { model: nextNavSheet, commands: navCommands = [] } = Sheet.close(model.navSheet)
        const route = parseRoute(url)
        const chartsActive =
          route._tag === 'ChartGuide' || (route._tag === 'Item' && chartItemNames.has(route.name))
        const examples = route._tag === 'Item' ? examplesFor(route.name) : []
        const navValue = [!chartsActive, chartsActive]
        return {
          model: modifyFields(model, {
            route: () => route,
            chartStreaming: () => new Set(),
            navSheet: () => nextNavSheet,
            docsNavDesktop: () => Accordion.reflect(model.docsNavDesktop, navValue),
            docsNavMobile: () => Accordion.reflect(model.docsNavMobile, navValue),
            chartExamples: () =>
              Accordion.init({
                id: 'chart-examples',
                type: 'multiple',
                value: examples.map((_, index) => index === 0),
              }),
            chartExampleSources: () =>
              examples.map((example) =>
                Collapsible.init({ id: `chart-example-source-${example.id}` }),
              ),
          }),
          commands: [
            ScrollToTop(),
            ...Command.mapMessages(navCommands, (m) => Message.GotNavSheetMessage({ message: m })),
          ],
        }
      },
      GotDemoMessage: ({ message }) => foldDemo(model, message),
      GotInstallTabsMessage: ({ message }) => foldInstallTabs(model, message),
      GotThemeToggleGroupMessage: ({ message }) => foldThemeToggleGroup(model, message),
      ClickedOpenNavSheet: () => {
        const { model: next, commands = [] } = Sheet.open(model.navSheet)
        return {
          model: modifyFields(model, { navSheet: () => next }),
          commands: Command.mapMessages(commands, (m) =>
            Message.GotNavSheetMessage({ message: m }),
          ),
        }
      },
      GotNavSheetMessage: ({ message }) => foldNavSheet(model, message),

      SelectedThemePreference: ({ preference }) => applyThemePreference(model, preference),
      ChangedSystemTheme: ({ theme }) =>
        Option.exists(model.maybeThemePreference, (p) => p === 'System')
          ? {
              model: modifyFields(model, { resolvedTheme: () => theme }),
              commands: [ApplyTheme({ theme })],
            }
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
          model: modifyFields(model, {
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
              model: modifyFields(model, { maybeCopiedValue: () => Option.some(value) }),
              commands: [CopyText({ value })],
            },
      CompletedCopy: () => ({
        model: modifyFields(model, { maybeCopiedValue: () => Option.none() }),
      }),
      ToggledCodeBlock: ({ id }) => ({
        model: modifyFields(model, {
          expandedCodeBlocks: () =>
            model.expandedCodeBlocks.has(id)
              ? new Set([...model.expandedCodeBlocks].filter((v) => v !== id))
              : new Set([...model.expandedCodeBlocks, id]),
        }),
      }),
      GotDocsNavAccordionMessage: ({ surface, message }) => {
        if (surface === 'desktop') {
          const { model: next } = Accordion.update(model.docsNavDesktop, message)
          return { model: modifyFields(model, { docsNavDesktop: () => next }) }
        }
        const { model: next } = Accordion.update(model.docsNavMobile, message)
        return { model: modifyFields(model, { docsNavMobile: () => next }) }
      },
      GotChartExamplesAccordionMessage: ({ message }) => {
        const example =
          model.route._tag === 'Item' ? examplesFor(model.route.name)[message.index] : undefined
        if (message.index === 0 || example === undefined) return { model }
        const { model: next } = Accordion.update(model.chartExamples, message)
        return {
          model: modifyFields(model, {
            chartExamples: () => next,
            failedChartExamples: () =>
              message.isOpen
                ? new Set([...model.failedChartExamples].filter((id) => id !== example.id))
                : model.failedChartExamples,
          }),
          commands:
            message.isOpen && !model.loadedChartExamples.has(example.id)
              ? [LoadChartExample({ id: example.id })]
              : [],
        }
      },
      GotChartExampleSourceMessage: ({ index, message }) => {
        const source = model.chartExampleSources[index]
        if (source === undefined) return { model }
        const { model: next } = Collapsible.update(source, message)
        return {
          model: modifyFields(model, {
            chartExampleSources: () =>
              model.chartExampleSources.map((item, itemIndex) =>
                itemIndex === index ? next : item,
              ),
          }),
        }
      },
      LoadedChartExample: ({ id }) => ({
        model: modifyFields(model, {
          loadedChartExamples: () => new Set([...model.loadedChartExamples, id]),
        }),
      }),
      FailedChartExample: ({ id }) => ({
        model: modifyFields(model, {
          failedChartExamples: () => new Set([...model.failedChartExamples, id]),
        }),
      }),
      ChartHovered: ({ example, index }) => ({
        model: modifyFields(model, {
          chartHover: () => (index === null ? Option.none() : Option.some({ example, index })),
        }),
      }),
      ChartLegendHovered: ({ example, key }) => ({
        model: modifyFields(model, {
          chartLegendHover: () =>
            model.chartLockedLegends.has(example)
              ? model.chartLegendHover
              : key === null
                ? Option.none()
                : Option.some({ example, key }),
        }),
      }),
      ChartLegendClicked: ({ example, key }) => {
        const focused = Option.match(model.chartLegendHover, {
          onNone: () => null,
          onSome: (hover) => (hover.example === example ? hover.key : null),
        })
        const locked = new Set(model.chartLockedLegends)
        if (locked.has(example) && focused === key) locked.delete(example)
        else locked.add(example)
        return {
          model: modifyFields(model, {
            chartLockedLegends: () => locked,
            chartLegendHover: () =>
              locked.has(example) ? Option.some({ example, key }) : Option.none(),
          }),
        }
      },
      ChartWindowShifted: ({ id, offset }) => ({
        model: modifyFields(model, {
          chartWindowStarts: () => ({
            ...model.chartWindowStarts,
            [id]: ((model.chartWindowStarts[id] ?? 0) + offset + 30) % 30,
          }),
        }),
      }),
      ChartWindowStreamToggled: ({ id }) => {
        const streaming = new Set(model.chartStreaming)
        const token = (model.chartStreamTokens[id] ?? 0) + 1
        if (streaming.has(id)) streaming.delete(id)
        else streaming.add(id)
        return {
          model: modifyFields(model, {
            chartStreaming: () => streaming,
            chartStreamTokens: () => ({ ...model.chartStreamTokens, [id]: token }),
          }),
          commands: streaming.has(id)
            ? [
                TickChartWindow({
                  id,
                  token,
                  delayMs: Math.max(
                    1,
                    (model.chartAnimationDurations[id] ??
                      (id.startsWith('bar-chart/') ? 1200 : 800)) * 1.1,
                  ),
                }),
              ]
            : [],
        }
      },
      ChartWindowTicked: ({ id, token }) =>
        model.chartStreaming.has(id) && model.chartStreamTokens[id] === token
          ? {
              model: modifyFields(model, {
                chartWindowStarts: () => ({
                  ...model.chartWindowStarts,
                  [id]: ((model.chartWindowStarts[id] ?? 0) + 1) % 30,
                }),
              }),
              commands: [
                TickChartWindow({
                  id,
                  token,
                  delayMs: Math.max(
                    1,
                    (model.chartAnimationDurations[id] ??
                      (id.startsWith('bar-chart/') ? 1200 : 800)) * 1.1,
                  ),
                }),
              ],
            }
          : { model },
      ChartZoomStarted: ({ id, index }) => ({
        model: modifyFields(model, {
          chartSelectionStarts: () => ({ ...model.chartSelectionStarts, [id]: index }),
        }),
      }),
      ChartZoomEnded: ({ id, index }) => {
        const start = model.chartSelectionStarts[id]
        const starts = { ...model.chartSelectionStarts }
        delete starts[id]
        if (start === undefined || start === index)
          return {
            model: modifyFields(model, { chartSelectionStarts: () => starts }),
          }
        return {
          model: modifyFields(model, {
            chartSelectionStarts: () => starts,
            chartZoomRanges: () => ({
              ...model.chartZoomRanges,
              [id]: [Math.min(start, index), Math.max(start, index)] as const,
            }),
          }),
        }
      },
      ChartZoomReset: ({ id }) => {
        const ranges = { ...model.chartZoomRanges }
        delete ranges[id]
        return { model: modifyFields(model, { chartZoomRanges: () => ranges }) }
      },
      TreemapFocused: ({ path }) => ({
        model: modifyFields(model, { treemapPath: () => path }),
      }),
      ChartTreemapFocused: ({ id, path }) => ({
        model: modifyFields(model, {
          chartTreemapPaths: () => ({ ...model.chartTreemapPaths, [id]: path }),
          chartTreemapHover: () => Option.none(),
        }),
      }),
      ChartTreemapHovered: ({ id, node }) => ({
        model: modifyFields(model, {
          chartTreemapHover: () => (node === null ? Option.none() : Option.some({ id, ...node })),
        }),
      }),
      ChartTreemapMoved: ({ id, x, y }) => ({
        model: modifyFields(model, {
          chartTreemapHover: (hover) =>
            Option.map(hover, (value) => (value.id === id ? { ...value, x, y } : value)),
        }),
      }),
      ChartDatasetSwapped: ({ id }) => ({
        model: modifyFields(model, {
          chartDatasetB: () => {
            const selected = new Set(model.chartDatasetB)
            if (selected.has(id)) selected.delete(id)
            else selected.add(id)
            return selected
          },
        }),
      }),
      ChartBarToggled: ({ id, index }) => ({
        model: modifyFields(model, {
          chartActiveBars: () => {
            const key = `${id}:${index}`
            const selected = new Set(model.chartActiveBars)
            if (selected.has(key)) selected.delete(key)
            else selected.add(key)
            return selected
          },
        }),
      }),
      ChartResized: ({ id, width, height }) => ({
        model: modifyFields(model, {
          chartSizes: () => ({ ...model.chartSizes, [id]: { width, height } }),
        }),
      }),
      ChartAnimationDurationChanged: ({ id, value }) => {
        const duration = Number(value)
        if (!Number.isFinite(duration) || duration < 0) return { model }
        const streaming = model.chartStreaming.has(id)
        const token = (model.chartStreamTokens[id] ?? 0) + 1
        return {
          model: modifyFields(model, {
            chartAnimationDurations: () => ({ ...model.chartAnimationDurations, [id]: duration }),
            chartStreamTokens: () =>
              streaming ? { ...model.chartStreamTokens, [id]: token } : model.chartStreamTokens,
          }),
          commands: streaming
            ? [TickChartWindow({ id, token, delayMs: Math.max(1, duration * 1.1) })]
            : [],
        }
      },
      ChartAnimationReplayed: ({ id }) => ({
        model: modifyFields(model, {
          chartReplayCounts: () => ({
            ...model.chartReplayCounts,
            [id]: (model.chartReplayCounts[id] ?? 0) + 1,
          }),
        }),
      }),
      ChartAnimationModeChanged: ({ id, value }) => ({
        model: modifyFields(model, {
          chartAnimationModes: () => ({ ...model.chartAnimationModes, [id]: value }),
        }),
      }),
      ChartAnimationToggled: ({ id }) => ({
        model: modifyFields(model, {
          chartAnimationDisabled: () => {
            const disabled = new Set(model.chartAnimationDisabled)
            if (disabled.has(id)) disabled.delete(id)
            else disabled.add(id)
            return disabled
          },
        }),
      }),
      SelectedRegistryStyle: ({ style }) => {
        // Synchronous side effect before returning: the runtime re-renders the
        // view right after update, and the re-render must observe the shim
        // exports rebound to the new tree. Persistence lives inside
        // setActiveStyle — no reload, so demo state survives the switch.
        setActiveStyle(style)
        return { model: modifyFields(model, { selectedStyle: () => style }) }
      },
      CompletedNavigateInternal: () => ({ model }),
      CompletedLoadExternal: () => ({ model }),
      CompletedScrollToTop: () => ({ model }),
    }),
  )
