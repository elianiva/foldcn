export type Category = 'Base' | 'Lib' | 'Components' | 'Charts' | 'Blocks'

/** Light/dark color maps from the registry style's `cssVars`. */
export type ThemeColorMap = Readonly<Record<string, string>>

export type MaybeTheme = Readonly<{
  light?: ThemeColorMap
  dark?: ThemeColorMap
  /** Tailwind theme mappings (e.g. the font-heading utility wiring). */
  theme?: ThemeColorMap
}>

/** A loose structural type for a sub-registry manifest group. */
export type RegistryGroupJson = Readonly<{
  items?: ReadonlyArray<{
    name?: string
    title?: string
    description?: string
    type?: string
    dependencies?: ReadonlyArray<string>
    devDependencies?: ReadonlyArray<string>
    registryDependencies?: ReadonlyArray<string>
    files?: ReadonlyArray<{ path?: string; type?: string }>
    cssVars?: MaybeTheme
    css?: unknown
  }>
}>

export type ItemFile = Readonly<{ path: string; type: string }>

export type Item = Readonly<{
  name: string
  title: string
  description: string
  type: string
  category: Category
  /** Install command copied by the user. */
  install: string
  maybeDependencies?: ReadonlyArray<string>
  maybeRegistryDependencies?: ReadonlyArray<string>
  files: ReadonlyArray<ItemFile>
  /** Primary source shown on the item page under "Source". */
  maybeSource: Readonly<{ path: string; code: string }> | undefined
  /** The base-style item carries theme tokens we render as swatches. */
  maybeTheme: MaybeTheme | undefined
}>

export type CategoryGroup = Readonly<{
  category: Category
  label: string
  description: string
  items: ReadonlyArray<Item>
}>
