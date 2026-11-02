// Chart values and snapshot data cross an external input boundary and require runtime narrowing.
/* oxlint-disable anti-slop/no-runtime-typeof */
/** Capture source data and JSX composition from the Recharts examples site revision.
 * Run with `node packages/registry/scripts/snapshot-recharts-examples.mjs`.
 * `--source-dir /path` reuses downloaded source files while developing offline.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { Project, SyntaxKind } from 'ts-morph'

const registry = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const root = resolve(registry, '../..')
const revision = 'a5c9b0c8ccb84c1ea08d1c46617d12fbee9adf6e'
const groups = JSON.parse(
  readFileSync(resolve(root, 'packages/web/scripts/recharts-examples.json'), 'utf8'),
)
const output = resolve(root, 'packages/web/scripts/recharts-source-snapshot.json')
const sourceDirIndex = process.argv.indexOf('--source-dir')
const sourceDir = sourceDirIndex < 0 ? undefined : process.argv[sourceDirIndex + 1]
const existingSnapshot =
  sourceDir === undefined ? {} : JSON.parse(readFileSync(output, 'utf8')).examples
const aliases = {
  'ScatterChart/SimpleScatterChart': 'ScatterChart/ScatterChartExample.tsx',
  'AreaChart/PreventRightClickExample': 'AreaChart/SimpleAreaChart.tsx',
}
const chartFamilies = new Set([
  'LineChart',
  'AreaChart',
  'BarChart',
  'ComposedChart',
  'ScatterChart',
  'PieChart',
  'RadarChart',
  'RadialBarChart',
  'TreeMap',
  'SunburstChart',
])
const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { jsx: 2 } })
const sourcePaths =
  sourceDir === undefined
    ? (
        await (
          await fetch(
            `https://api.github.com/repos/recharts/recharts/git/trees/${revision}?recursive=1`,
          )
        ).json()
      ).tree.map((entry) => entry.path)
    : []
const findSourcePath = (family, upstream) => {
  const prefix = `www/src/docs/exampleComponents/${family}/`
  const candidates = [
    aliases[`${family}/${upstream}`] === undefined
      ? undefined
      : `www/src/docs/exampleComponents/${aliases[`${family}/${upstream}`]}`,
    `${prefix}${upstream}.tsx`,
    `${prefix}${upstream}Example.tsx`,
    `${prefix}${upstream}/index.tsx`,
    `${prefix}${upstream}Example/index.tsx`,
  ].filter(Boolean)
  return sourceDir === undefined
    ? candidates.find((path) => sourcePaths.includes(path))
    : (existingSnapshot[`${family}/${upstream}`]?.source ?? candidates[0])
}
const sourceFor = async (family, upstream) => {
  if (sourceDir !== undefined) {
    const path = resolve(sourceDir, `${family}__${upstream}.tsx`)
    try {
      return readFileSync(path, 'utf8')
    } catch {
      return undefined
    }
  }
  const path = findSourcePath(family, upstream)
  if (path === undefined) return undefined
  const response = await fetch(
    `https://raw.githubusercontent.com/recharts/recharts/${revision}/${path}`,
  )
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`)
  return response.text()
}
const serializable = (value) => {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return true
  if (Array.isArray(value)) return value.every(serializable)
  return typeof value === 'object' && Object.values(value).every(serializable)
}
const literalValue = (expression) => {
  try {
    const value = vm.runInNewContext(`(${expression})`, {}, { timeout: 50 })
    return serializable(value) ? JSON.parse(JSON.stringify(value)) : undefined
  } catch {
    return undefined
  }
}
const tagName = (node) => node.getTagNameNode().getText().split('.').at(-1)
const attributes = (node) =>
  Object.fromEntries(
    node.getAttributes().flatMap((attribute) => {
      if (attribute.getKind() !== SyntaxKind.JsxAttribute) return []
      const initializer = attribute.getInitializer()
      if (initializer === undefined) return [[attribute.getNameNode().getText(), true]]
      if (initializer.getKind() === SyntaxKind.StringLiteral)
        return [[attribute.getNameNode().getText(), initializer.getLiteralText()]]
      const expression = initializer.getExpression?.()
      if (expression === undefined) return []
      const literal = literalValue(expression.getText())
      return [
        [
          attribute.getNameNode().getText(),
          literal === undefined ? { expression: expression.getText() } : literal,
        ],
      ]
    }),
  )
const descendants = (node) =>
  node.getJsxChildren().flatMap((child) => {
    if (child.getKind() === SyntaxKind.JsxSelfClosingElement)
      return [{ tag: tagName(child), props: attributes(child), children: [] }]
    if (child.getKind() === SyntaxKind.JsxElement)
      return [
        {
          tag: tagName(child.getOpeningElement()),
          props: attributes(child.getOpeningElement()),
          children: descendants(child),
        },
      ]
    return []
  })
const entries = groups.flatMap((group) =>
  chartFamilies.has(group.name)
    ? group.items.map((item) => ({ family: group.name, upstream: item.upstream }))
    : [],
)
const snapshot = {}
for (const { family, upstream } of entries) {
  const source = await sourceFor(family, upstream)
  if (source === undefined) continue
  const file = project.createSourceFile(`${family}__${upstream}.tsx`, source, { overwrite: true })
  const datasets = {}
  for (const declaration of file.getVariableDeclarations()) {
    const name = declaration.getName()
    const initializer = declaration.getInitializer()
    if (initializer === undefined) continue
    if (
      initializer.getKind() === SyntaxKind.ArrayLiteralExpression ||
      initializer.getKind() === SyntaxKind.ObjectLiteralExpression
    ) {
      const value = literalValue(initializer.getText())
      if (value !== undefined) datasets[name] = { kind: 'literal', value }
    } else if (
      initializer.getKind() === SyntaxKind.CallExpression &&
      initializer.getExpression().getText() === 'generateMockData'
    ) {
      const args = initializer.getArguments().map((argument) => Number(argument.getText()))
      if (args.length === 2 && args.every(Number.isFinite))
        datasets[name] = { kind: 'mock', length: args[0], seed: args[1] }
    } else if (family === 'BarChart' && upstream === 'PopulationPyramid' && name === 'rawData') {
      const value = literalValue(initializer.getText())
      if (value !== undefined) datasets[name] = { kind: 'literal', value }
    }
  }
  const charts = file
    .getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
    .filter(
      (node) =>
        tagName(node).toLowerCase() === family.toLowerCase() ||
        (family === 'TreeMap' && tagName(node) === 'Treemap'),
    )
    .map((node) => ({
      tag: tagName(node),
      props: attributes(node),
      children: descendants(node.getParent()),
    }))
  const selfClosing = file
    .getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
    .filter(
      (node) =>
        tagName(node).toLowerCase() === family.toLowerCase() ||
        (family === 'TreeMap' && tagName(node) === 'Treemap'),
    )
    .map((node) => ({ tag: tagName(node), props: attributes(node), children: [] }))
  snapshot[`${family}/${upstream}`] = {
    source: findSourcePath(family, upstream),
    datasets,
    charts: [...charts, ...selfClosing],
  }
}
writeFileSync(output, `${JSON.stringify({ revision, examples: snapshot }, null, 2)}\n`)
if (sourceDir === undefined) {
  const bundleResponse = await fetch(
    'https://recharts.github.io/generated/bundleSizeData.generated.json',
  )
  if (!bundleResponse.ok)
    throw new Error(`Could not read Recharts bundle-size data: ${bundleResponse.status}`)
  writeFileSync(
    resolve(root, 'packages/web/scripts/recharts-bundle-size-data.json'),
    `${JSON.stringify(await bundleResponse.json(), null, 2)}\n`,
  )
}
console.log(`Captured ${Object.keys(snapshot).length} examples in ${output}`)
