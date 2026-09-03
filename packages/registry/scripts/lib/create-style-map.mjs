/**
 * createStyleMap — extract `{ "cn-*": "tailwind classes" }` from a style CSS.
 *
 * Vendored (MIT) from shadcn-ui/ui packages/shadcn/src/styles/create-style-map.ts
 * and ported to plain ESM JavaScript for foldcn's registry build. Upstream
 * parses one `style-<name>.css`; foldcn concatenates its hand-written foldkit
 * deltas (`registry/default/style/cn-compat.css`) with the vendored style CSS
 * (`registry/styles/style-nova.css`, byte-identical to upstream — see ADR-015)
 * before calling this, so both contribute to the same map. Deltas are
 * concatenated FIRST: createStyleMap prepends later duplicate selectors, so
 * processing compat first leaves it last in the merged string — and under
 * cn's last-wins conflict resolution the delta wins.
 *
 * Only `.selector { @apply … }` rules whose subject class starts with `cn-`
 * are collected. Nested selectors are flattened by stripping `&`.
 */
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'

const CN_PREFIX = 'cn-'

/** @returns {Record<string, string>} */
export function createStyleMap(input) {
  const root = postcss.parse(input)

  /** @type {Record<string, string>} */
  const result = {}

  root.walkRules((rule) => {
    const selectors = rule.selectors ?? []

    if (selectors.length === 0) return

    const tailwindClasses = extractTailwindClasses(rule)
    if (!tailwindClasses) return

    for (const selector of selectors) {
      const normalizedSelector = normalizeSelector(selector)

      selectorParser((selectorsRoot) => {
        selectorsRoot.each((sel) => {
          const targetClass = findSubjectClass(sel)
          if (!targetClass) return

          const className = targetClass.value
          if (!className.startsWith(CN_PREFIX)) return

          result[className] = result[className]
            ? `${tailwindClasses} ${result[className]}`
            : tailwindClasses
        })
      }).processSync(normalizedSelector)
    }
  })

  return result
}

function normalizeSelector(selector) {
  return selector.replace(/\s*&\s*/g, '').trim()
}

function extractTailwindClasses(rule) {
  const classes = []

  for (const node of rule.nodes || []) {
    if (node.type === 'atrule' && node.name === 'apply') {
      const value = node.params.trim()
      if (value) classes.push(value)
    }
  }

  if (classes.length === 0) return null

  return classes.join(' ')
}

function findSubjectClass(selector) {
  let last = null

  selector.walkClasses((classNode) => {
    if (classNode.value.startsWith(CN_PREFIX)) {
      last = classNode
    }
  })

  return last
}
