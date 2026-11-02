import { blocksGroup, libGroup, styleGroup, uiGroup } from './manifest'
import { sourceByItem } from './sources'
import type { Category, CategoryGroup, Item, RegistryGroupJson } from './types'
import { chartItemNames } from './charts'

const INSTALL_PREFIX = 'npx shadcn@latest add @foldcn/'

const buildItems = (group: RegistryGroupJson, category: Category): ReadonlyArray<Item> =>
  (group.items ?? [])
    .map((item) => {
      const name = item.name ?? ''
      const files = (item.files ?? []).map((file) => ({
        path: file.path ?? '',
        type: file.type ?? '',
      }))
      return {
        name,
        title: item.title ?? name,
        description: item.description ?? '',
        type: item.type ?? '',
        category,
        install: `${INSTALL_PREFIX}${name}`,
        maybeDependencies: item.dependencies,
        maybeRegistryDependencies: item.registryDependencies,
        files,
        maybeSource: sourceByItem[name],
        maybeTheme: item.cssVars,
      } satisfies Item
    })
    .filter((item) => item.name !== '')

export const items: ReadonlyArray<Item> = [
  ...buildItems(styleGroup, 'Base'),
  ...buildItems(libGroup, 'Lib'),
  ...buildItems(uiGroup, 'Components').map((item): Item =>
    chartItemNames.has(item.name) ? { ...item, category: 'Charts' } : item,
  ),
  ...buildItems(blocksGroup, 'Blocks'),
]

export const itemByName: Readonly<Record<string, Item>> = Object.fromEntries(
  items.map((item) => [item.name, item]),
)

export const categoryGroups: ReadonlyArray<CategoryGroup> = [
  {
    category: 'Components',
    label: 'Components',
    description: 'The styled primitives: stateless helpers and stateful submodels.',
    items: items.filter((item) => item.category === 'Components'),
  },
  {
    category: 'Charts',
    label: 'Charts',
    description: 'Data visualization components with Recharts-shaped APIs.',
    items: items.filter((item) => item.category === 'Charts'),
  },
  {
    category: 'Blocks',
    label: 'Blocks',
    description: 'Composed pages that combine primitives into ready-to-use sections.',
    items: items.filter((item) => item.category === 'Blocks'),
  },
]

export const componentCount = items.length

export const itemTitle = (name: string): string => itemByName[name]?.title ?? name
