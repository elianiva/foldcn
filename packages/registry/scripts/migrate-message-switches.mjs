// One-time, rerunnable migration for the Foldkit no-switch-on-message-tag rule.
// Refuses nonempty fallthrough/default/break cases rather than guessing their semantics.
import { Project, Node, SyntaxKind } from 'ts-morph'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../../', import.meta.url))
const project = new Project({ skipAddingFilesFromTsConfig: true })
project.addSourceFilesAtPaths([
  `${root}/packages/registry/registry/default/ui/*.ts`,
  `${root}/packages/web/src/update.ts`,
])
for (const source of project.getSourceFiles()) {
  const switches = source.getDescendantsOfKind(SyntaxKind.SwitchStatement).filter((node) => {
    const expression = node.getExpression()
    return Node.isPropertyAccessExpression(expression) && expression.getName() === '_tag'
  })
  if (!switches.length) continue
  const effectImport = source
    .getImportDeclarations()
    .find((node) => node.getModuleSpecifierValue() === 'effect')
  const existing = effectImport?.getNamedImports().find((node) => node.getName() === 'Match')
  const matchName = existing?.getAliasNode()?.getText() ?? existing?.getName() ?? 'Match'
  if (!existing) {
    if (effectImport) effectImport.addNamedImport('Match')
    else source.addImportDeclaration({ moduleSpecifier: 'effect', namedImports: ['Match'] })
  }
  for (const node of switches.reverse()) {
    const subject = node.getExpression().getExpression().getText()
    const handlers = node.getClauses().map((clause, index, clauses) => {
      const bodyClause = clauses.slice(index).find((candidate) => candidate.getStatements().length)
      if (
        !Node.isCaseClause(clause) ||
        !bodyClause ||
        clause.getDescendantsOfKind(SyntaxKind.BreakStatement).length
      ) {
        throw new Error(
          `Manual migration required: ${source.getBaseName()}:${node.getStartLineNumber()}`,
        )
      }
      const statements = bodyClause.getStatements()
      const last = statements.at(-1)
      const terminal = last && Node.isBlock(last) ? last.getStatements().at(-1) : last
      if (!terminal || (!Node.isReturnStatement(terminal) && !Node.isThrowStatement(terminal))) {
        throw new Error(`Nonterminal case requires manual migration: ${source.getBaseName()}`)
      }
      const body = (
        statements.length === 1 && Node.isBlock(statements[0])
          ? statements[0].getStatements()
          : statements
      )
        .map((statement) => statement.getText())
        .join('\n')
      const parameter = body.split(/[^A-Za-z0-9_$]+/).includes(subject) ? subject : ''
      return `${clause.getExpression().getText()}: (${parameter}) => { ${body} }`
    })
    node.replaceWithText(
      `return ${matchName}.value(${subject}).pipe(${matchName}.tagsExhaustive({${handlers.join(',\n')}}))`,
    )
  }
  source.saveSync()
}
