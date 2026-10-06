import { Effect } from 'effect'
import { Server } from 'foldkit/experimental'
import { describe, expect, it } from 'vitest'

import { init } from './init'
import { EXAMPLES_BY_CHART } from './page/chart-examples/catalog'
import { loadExample, loadedExample } from './page/chart-examples/loader'

const chartFamilies = [...EXAMPLES_BY_CHART]
const allExamples = chartFamilies.flatMap(([, examples]) => examples)
const chartCases = chartFamilies.map(([family, examples]) => {
  const example = examples.at(0)
  if (example === undefined) throw new Error(`Missing ${family} chart example`)
  return { family, example }
})

describe('chart examples', () => {
  it('loads every gallery preview and its source', async () => {
    expect(allExamples).toHaveLength(97)
    for (const example of allExamples) {
      await loadExample(example.id)
      const loaded = loadedExample(example.id)
      expect(loaded?.view, example.id).toBeTypeOf('function')
      expect(loaded?.code, example.id).toContain('export default')
    }
  })

  it.each(chartCases)(
    'renders the first $family example as a chart',
    async ({ family, example }) => {
      await loadExample(example.id)
      const loaded = loadedExample(example.id)
      if (loaded === undefined) throw new Error(`Failed to load ${example.id}`)

      const rendered = await Effect.runPromise(
        Server.renderToString(
          {
            routing: {},
            init,
            view: (model, h) => ({
              title: example.title,
              body: h.div([], [loaded.view(model, h)]),
            }),
          },
          { url: `http://localhost/docs/${family}`, buildId: 'chart-test' },
        ),
      )
      const document = new DOMParser().parseFromString(rendered.html, 'text/html')
      const chart = document.querySelector('svg[role="img"]')
      expect(chart, example.id).not.toBeNull()
      expect(
        chart?.querySelector('path, rect, circle, polygon, polyline, line, ellipse'),
        example.id,
      ).not.toBeNull()
      if (family === 'sankey') {
        const ribbons = chart?.querySelectorAll('path')
        expect(ribbons).toHaveLength(4)
        for (const ribbon of ribbons ?? []) {
          expect(ribbon.getAttribute('d')).toMatch(/Z$/)
          expect(ribbon.getAttribute('fill')).not.toBe('none')
        }
      }
    },
  )
})
