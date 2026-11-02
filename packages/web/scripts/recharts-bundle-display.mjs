// Optional chart attributes are omitted to preserve the rendered Recharts example output.
/* oxlint-disable anti-slop/no-conditional-empty-object-spread */
/** Reproduce the Recharts bundle-size example's display-tree transformation. */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const asset = JSON.parse(
  readFileSync(resolve(web, 'scripts/recharts-bundle-size-data.json'), 'utf8'),
)
const colorSeeds = {
  recharts: { hue: 145, saturation: 46, lightness: 40 },
  d3: { hue: 210, saturation: 66, lightness: 45 },
  redux: { hue: 270, saturation: 46, lightness: 50 },
  react: { hue: 194, saturation: 70, lightness: 47 },
  example: { hue: 32, saturation: 78, lightness: 52 },
  'es-toolkit': { hue: 18, saturation: 70, lightness: 49 },
}
const hashString = (value) => {
  let hash = 0
  for (let index = 0; index < value.length; index++) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value))
const seedFor = (name) =>
  colorSeeds[name] ?? {
    hue: hashString(name) % 360,
    saturation: 44 + (hashString(`${name}-s`) % 18),
    lightness: 42 + (hashString(`${name}-l`) % 8),
  }
const fillFor = (family, fullPath, depth, siblingIndex, siblingCount) => {
  const seed = seedFor(family)
  const position = siblingCount > 1 ? siblingIndex / (siblingCount - 1) - 0.5 : 0
  const lightnessOffset = position * 16 + depth * 6 + ((hashString(fullPath) % 5) - 2)
  const saturationOffset = -depth * 4 + ((hashString(`${fullPath}-sat`) % 5) - 2)
  return `hsl(${seed.hue} ${clamp(seed.saturation + saturationOffset, 28, 82)}% ${clamp(seed.lightness + lightnessOffset, 24, 78)}%)`
}
const leaves = (node) => (node.children?.length ? node.children.flatMap(leaves) : [node])
const packageName = (segments) =>
  segments[1]?.startsWith('@') && segments[2] !== undefined
    ? { name: `${segments[1]}/${segments[2]}`, count: 2 }
    : { name: segments[1] ?? 'unknown-package', count: 1 }
const libraryFamily = (name) =>
  name.startsWith('d3-')
    ? 'd3'
    : ['@reduxjs/toolkit', 'react-redux', 'redux'].includes(name)
      ? 'redux'
      : ['react', 'react-dom', 'scheduler', 'use-sync-external-store'].includes(name)
        ? 'react'
        : name
const displaySegments = (fullPath) => {
  const segments = fullPath.split('/')
  if (segments[0] === 'src') return ['recharts', ...segments.slice(1)]
  if (segments[0] === 'entry') return ['example', ...segments.slice(1)]
  if (segments[0] !== 'node_modules') return segments
  const pkg = packageName(segments)
  const family = libraryFamily(pkg.name)
  const rest = segments.slice(1 + pkg.count)
  return family === pkg.name ? [family, ...rest] : [family, pkg.name, ...rest]
}
const makeNode = (name, fullPath) => ({ name, fullPath, value: 0, children: new Map() })
const insertLeaf = (root, segments, value) => {
  root.value += value
  let node = root
  const path = []
  for (const segment of segments) {
    path.push(segment)
    const child = node.children.get(segment) ?? makeNode(segment, path.join('/'))
    child.value += value
    node.children.set(segment, child)
    node = child
  }
}
const finalize = (node, family, depth, index, count) => {
  const children = [...node.children.values()].sort((left, right) => right.value - left.value)
  return {
    name: node.name,
    fullPath: node.fullPath,
    value: node.value,
    fill: fillFor(family, node.fullPath, depth, index, count),
    ...(children.length
      ? {
          children: children.map((child, i) =>
            finalize(child, family, depth + 1, i, children.length),
          ),
        }
      : {}),
  }
}
export const bundleDisplay = (kind) => {
  const entry = asset[kind]
  const root = makeNode('bundle', 'bundle')
  for (const leaf of leaves(entry.tree))
    insertLeaf(root, displaySegments(leaf.fullPath), leaf.value)
  const libraries = [...root.children.values()].sort((left, right) => right.value - left.value)
  const children = libraries.map((node, index) =>
    finalize(node, node.name, 0, index, libraries.length),
  )
  return {
    entry,
    data:
      kind === 'treemap'
        ? children
        : {
            name: 'bundle',
            fullPath: 'bundle',
            value: entry.tree.value,
            fill: 'hsl(210 20% 92%)',
            children,
          },
  }
}
