import { blocksGroup, libGroup, styleGroup, uiGroup } from './catalog/manifest'
import type { RegistryGroupJson } from './catalog/types'

export const SITE_ORIGIN = 'https://foldcn.elianiva.com'
export const SITE_NAME = 'foldcn'

export type SeoMeta = Readonly<{
  title: string
  description: string
  section: string
}>

const HOME_META: SeoMeta = {
  title: 'foldcn · Copy-paste components for Foldkit',
  description:
    'Copy-paste components for Foldkit, styled with Tailwind CSS and installed through the shadcn CLI.',
  section: '',
}

const DOCS_META: SeoMeta = {
  title: 'Docs · foldcn',
  description:
    'Browse every foldcn registry item: base styles, utilities, components, and blocks for Foldkit apps.',
  section: 'Docs',
}

const NOT_FOUND_META: SeoMeta = {
  title: 'Not found · foldcn',
  description: 'That page does not exist. Head back to the foldcn registry.',
  section: '',
}

const groups: ReadonlyArray<{ category: string; group: RegistryGroupJson }> = [
  { category: 'Base', group: styleGroup },
  { category: 'Lib', group: libGroup },
  { category: 'Components', group: uiGroup },
  { category: 'Blocks', group: blocksGroup },
]

const entries: ReadonlyArray<readonly [string, SeoMeta]> = [
  ['/', HOME_META],
  ['/docs', DOCS_META],
  ...groups.flatMap(({ category, group }) =>
    (group.items ?? [])
      .filter((item) => item.name !== undefined && item.name !== '')
      .map((item): readonly [string, SeoMeta] => {
        const name = item.name ?? ''
        const title = item.title ?? name
        return [
          `/docs/${name}`,
          {
            title: `${title} · foldcn`,
            description: (item.description ?? '').trim() || DOCS_META.description,
            section: category,
          },
        ]
      }),
  ),
]

const META_BY_PATH = new Map(entries)

export const seoForPath = (path: string): SeoMeta => META_BY_PATH.get(path) ?? NOT_FOUND_META

export const pageUrlFor = (path: string): string => `${SITE_ORIGIN}${path}`

const DESCRIPTION_LIMIT = 155

export const metaDescriptionFor = (path: string): string => {
  const description = seoForPath(path).description
  if (description.length <= DESCRIPTION_LIMIT) return description
  return `${description.slice(0, DESCRIPTION_LIMIT - 1).trimEnd()}…`
}
