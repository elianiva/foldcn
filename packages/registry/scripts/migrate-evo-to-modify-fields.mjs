// Rerunnable migration to the Foldkit 0.163 struct API: evo -> modifyFields,
// makeConstrainedEvo -> makeModifyFieldsFor. Only whole identifiers are touched,
// so substrings (evolve) and prose/strings are left alone.
import { execFileSync } from 'node:child_process'
import { Project, SyntaxKind } from 'ts-morph'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../../', import.meta.url))
const renames = new Map([
  ['evo', 'modifyFields'],
  ['makeConstrainedEvo', 'makeModifyFieldsFor'],
])
const structModule = 'foldkit/struct'
const tracked = execFileSync('git', ['ls-files', '*.ts'], { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .map((path) => `${root}/${path}`)
const project = new Project({ skipAddingFilesFromTsConfig: true })
for (const path of tracked) project.addSourceFileAtPath(path)
let filesChanged = 0
const counts = new Map([...renames.keys()].map((name) => [name, 0]))
for (const source of project.getSourceFiles()) {
  const targets = new Map()
  const collect = (node) => {
    const next = renames.get(node.getText())
    if (next) targets.set(node, next)
  }
  for (const declaration of source.getImportDeclarations()) {
    if (declaration.getModuleSpecifierValue() !== structModule) continue
    for (const specifier of declaration.getNamedImports()) {
      collect(specifier.getAliasNode() ?? specifier.getNameNode())
    }
  }
  for (const identifier of source.getDescendantsOfKind(SyntaxKind.Identifier)) collect(identifier)
  if (!targets.size) continue
  const ordered = [...targets].sort((a, b) => b[0].getStart() - a[0].getStart())
  for (const [node, next] of ordered) {
    const name = node.getText()
    counts.set(name, counts.get(name) + 1)
    node.replaceWithText(next)
  }
  source.saveSync()
  filesChanged += 1
}
const summary = [...counts]
  .map(([from, count]) => `${from} -> ${renames.get(from)}: ${count}`)
  .join(', ')
console.log(`${summary} (${filesChanged}/${tracked.length} files changed)`)
