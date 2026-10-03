/** Foldkit adaptation of the Recharts Candlestick example. */
import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Message } from '../../../message'
import type { Model } from '../../../model'

type Candle = Readonly<{
  time: number
  open: number
  close: number
  low: number
  high: number
}>

// Matches the seeded generator used by the upstream @recharts/devtools example.
const generateMockMarketData = (
  length: number,
  seed: number,
  startPrice: number,
  startTime: number,
): ReadonlyArray<Candle> => {
  const candles: Candle[] = []
  let random = seed
  let lastClose = startPrice
  const between = (min: number, max: number): number => {
    random = (75 * random + 74) % 65537
    return (Math.round(random) % (max - min)) + min
  }
  for (let i = 0; i < length; i++) {
    const time = startTime + i * 15 * 60 * 1000
    const open = lastClose
    const close = Math.max(0.01, +(open + between(-200, 200) / 100))
    const high = +(Math.max(open, close) + between(0, 100) / 100)
    const low = Math.max(0.01, +(Math.min(open, close) - between(0, 100) / 100))
    candles.push({ time, open, close, low, high })
    lastClose = close
  }
  return candles
}

const data = generateMockMarketData(100, 1337, 100, 1768145757834)
const width = 700
const height = 433
const left = 65
const right = 695
const top = 6
const bottom = 397
const band = (right - left) / data.length
const low = Math.min(...data.map((row) => row.low)) - 1
const high = Math.max(...data.map((row) => row.high)) + 1
const y = (value: number): number => bottom - ((value - low) / (high - low)) * (bottom - top)
const time = (value: number): string => {
  const date = new Date(value)
  return `${date.getUTCHours()}:${String(date.getUTCMinutes()).padStart(2, '0')}`
}
const dollars = (value: number): string => `$${value.toFixed(2)}`
const attribute = (h: HtmlBuilder<Message>, values: Record<string, string>) =>
  Object.entries(values).map(([name, value]) => h.Attribute(name, value))

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const activeIndex = Option.match(model.chartHover, {
    onNone: () => null,
    onSome: (hover) => (hover.example === 'bar-chart/Candlestick' ? hover.index : null),
  })
  const active = activeIndex === null ? undefined : data[activeIndex]
  const ticks = [low, low + 5, low + 10, low + 15, high]
  return h.div(
    [h.Class('cn-chart-root'), h.DataAttribute('slot', 'candlestick-chart')],
    [
      h.svg(
        [
          h.ViewBox(`0 0 ${width} ${height}`),
          h.Attribute('width', '100%'),
          h.Attribute('height', String(height)),
          h.Style({ height: 'auto', maxWidth: '700px' }),
          h.Role('img'),
          h.AriaLabel('Candlestick chart'),
          h.OnMouseLeave(Message.ChartHovered({ example: 'bar-chart/Candlestick', index: null })),
        ],
        [
          ...ticks.map((value) =>
            h.line(
              attribute(h, {
                x1: String(left),
                x2: String(right),
                y1: String(y(value)),
                y2: String(y(value)),
                stroke: '#e5e5e5',
              }),
            ),
          ),
          h.line(
            attribute(h, {
              x1: String(left),
              x2: String(right),
              y1: String(bottom),
              y2: String(bottom),
              stroke: '#666',
            }),
          ),
          ...ticks.map((value) =>
            h.text(
              attribute(h, {
                x: String(left - 5),
                y: String(y(value) + 4),
                'text-anchor': 'end',
                fill: '#666',
                'font-size': '12',
              }),
              [dollars(value)],
            ),
          ),
          ...data.flatMap((row, index) =>
            index % 7 === 0 || index === data.length - 1
              ? [
                  h.text(
                    attribute(h, {
                      x: String(left + (index + 0.5) * band),
                      y: String(bottom + 21),
                      'text-anchor': 'middle',
                      fill: '#666',
                      'font-size': '12',
                    }),
                    [time(row.time)],
                  ),
                ]
              : [],
          ),
          ...data.flatMap((row, index) => {
            const x = left + (index + 0.5) * band
            const bodyTop = y(Math.max(row.open, row.close))
            const bodyBottom = y(Math.min(row.open, row.close))
            return [
              h.line(
                attribute(h, {
                  x1: String(x),
                  x2: String(x),
                  y1: String(y(row.high)),
                  y2: String(y(row.low)),
                  stroke: '#000',
                  'stroke-width': '1',
                }),
              ),
              h.rect(
                attribute(h, {
                  x: String(x - 2),
                  y: String(bodyTop),
                  width: '4',
                  height: String(Math.max(1, bodyBottom - bodyTop)),
                  fill: row.open < row.close ? 'green' : 'red',
                }),
              ),
              h.rect([
                ...attribute(h, {
                  x: String(x - band / 2),
                  y: String(top),
                  width: String(band),
                  height: String(bottom - top),
                  fill: 'transparent',
                }),
                h.OnMouseEnter(Message.ChartHovered({ example: 'bar-chart/Candlestick', index })),
              ]),
            ]
          }),
        ],
      ),
      ...(active === undefined
        ? []
        : [
            h.div(
              [
                h.Class('cn-chart-tooltip cn-chart-tooltip-position'),
                h.Style({
                  left: `${((activeIndex ?? 0) + 0.5) * (100 / data.length)}%`,
                  top: '12px',
                }),
              ],
              [
                `Time: ${time(active.time)}`,
                h.br([]),
                `Open: ${dollars(active.open)}`,
                h.br([]),
                `Close: ${dollars(active.close)}`,
                h.br([]),
                `Low: ${dollars(active.low)}`,
                h.br([]),
                `High: ${dollars(active.high)}`,
              ],
            ),
          ]),
    ],
  )
}
