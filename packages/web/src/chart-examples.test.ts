import { Effect, Option } from 'effect'
import { Url } from 'foldkit'
import { Server } from 'foldkit/experimental'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, expect, it } from 'vitest'

import { AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis } from '@/components/ui/chart-core'
import { init } from './init'
import { Message } from './message'
import type { Model } from './model'
import { update } from './update'
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

const renderView = async (
  view: (model: Model, h: HtmlBuilder<Message>) => Html,
): Promise<string> => {
  const rendered = await Effect.runPromise(
    Server.renderToString(
      { routing: {}, init, view: (model, h) => ({ title: 'chart', body: view(model, h) }) },
      { url: 'http://localhost/docs/line', buildId: 'chart-test' },
    ),
  )
  return rendered.html
}

describe('chart domains', () => {
  it('stays finite for a scatter chart with no values', async () => {
    const html = await renderView((_, h) =>
      ScatterChart(
        {
          data: [],
          children: [
            XAxis({ dataKey: 'x', domain: ['dataMin', 'dataMax'] }),
            YAxis({ dataKey: 'y', domain: ['dataMin - 5', 'dataMax + 5'] }),
            Scatter({ dataKey: 'y' }),
          ],
        },
        h,
      ),
    )
    expect(html).not.toMatch(/Infinity|NaN/)
  })

  it.each(['left', 'right'])('stays finite with an empty %s axis', async (orientation) => {
    const html = await renderView((_model, h) =>
      AreaChart(
        {
          data: [],
          children: [
            XAxis({ dataKey: 'x', type: 'number', domain: ['dataMin', 'dataMax'] }),
            YAxis({ yAxisId: 'left', domain: ['dataMin - 5', 'dataMax + 5'], width: 'auto' }),
            YAxis({
              yAxisId: 'right',
              orientation: 'right',
              domain: ['dataMin', 'dataMax'],
            }),
            Area({ dataKey: 'y', yAxisId: orientation, baseValue: 'dataMax' }),
          ],
        },
        h,
      ),
    )
    expect(html).not.toMatch(/Infinity|NaN/)
  })
})

describe('chart streaming', () => {
  const id = 'line/AnimatedTimeSeriesExample'
  const family = chartFamilies.find(([, examples]) => examples.some((item) => item.id === id))
  const index = family?.[1].findIndex((item) => item.id === id) ?? -1
  const start = (): Model => {
    const url = Option.getOrThrow(Url.fromString(`http://localhost/docs/${family?.[0]}`))
    return update(init(url).model, Message.ChartWindowStreamToggled({ id })).model
  }
  const expectTickDelay = (result: ReturnType<typeof update>, delayMs: number): void => {
    const command = result.commands?.find((item) => item.name === 'TickChartWindow')
    expect(command?.args).toMatchObject({ delayMs })
  }

  it('stops the stream when its example collapses', () => {
    const model = start()
    const token = model.chartStreamTokens[id]
    const { model: closed } = update(
      model,
      Message.GotChartExamplesAccordionMessage({
        message: { _tag: 'ToggledItem', index, isOpen: false },
      }),
    )
    expect(closed.chartStreaming.has(id)).toBe(false)
    expect(closed.chartStreamTokens[id]).not.toBe(token)
    expect(update(closed, Message.ChartWindowTicked({ id, token: token ?? 0 })).commands).toEqual(
      undefined,
    )
  })

  it.each(['0', ''])('keeps a safe tick delay for duration %j', (value) => {
    const changed = update(start(), Message.ChartAnimationDurationChanged({ id, value }))
    expectTickDelay(changed, 100)
    const ticked = update(
      changed.model,
      Message.ChartWindowTicked({ id, token: changed.model.chartStreamTokens[id] ?? 0 }),
    )
    expectTickDelay(ticked, 100)
  })

  it('scales the tick delay from a real duration', () => {
    const changed = update(start(), Message.ChartAnimationDurationChanged({ id, value: '1000' }))
    expectTickDelay(changed, 1000 * 1.1)
  })
})
