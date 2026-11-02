/** Source impressions data with drag selection and reset. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/line-chart'

const impressionsData = [
  {
    name: 1,
    cost: 4.11,
    impression: 100,
  },
  {
    name: 2,
    cost: 2.39,
    impression: 120,
  },
  {
    name: 3,
    cost: 1.37,
    impression: 150,
  },
  {
    name: 4,
    cost: 1.16,
    impression: 180,
  },
  {
    name: 5,
    cost: 2.29,
    impression: 200,
  },
  {
    name: 6,
    cost: 3,
    impression: 499,
  },
  {
    name: 7,
    cost: 0.53,
    impression: 50,
  },
  {
    name: 8,
    cost: 2.52,
    impression: 100,
  },
  {
    name: 9,
    cost: 1.79,
    impression: 200,
  },
  {
    name: 10,
    cost: 2.94,
    impression: 222,
  },
  {
    name: 11,
    cost: 4.3,
    impression: 210,
  },
  {
    name: 12,
    cost: 4.41,
    impression: 300,
  },
  {
    name: 13,
    cost: 2.1,
    impression: 50,
  },
  {
    name: 14,
    cost: 8,
    impression: 190,
  },
  {
    name: 15,
    cost: 0,
    impression: 300,
  },
  {
    name: 16,
    cost: 9,
    impression: 400,
  },
  {
    name: 17,
    cost: 3,
    impression: 200,
  },
  {
    name: 18,
    cost: 2,
    impression: 50,
  },
  {
    name: 19,
    cost: 3,
    impression: 100,
  },
  {
    name: 20,
    cost: 7,
    impression: 100,
  },
]
const data = impressionsData
const id = 'line/HighlightAndZoomLineChart'
const yDomain = (
  rows: ReadonlyArray<(typeof data)[number]>,
  key: 'cost' | 'impression',
  offset: number,
): [number, number] => {
  const values = rows.map((row) => row[key])
  return [(Math.min(...values) | 0) - offset, (Math.max(...values) | 0) + offset]
}

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const range = model.chartZoomRanges[id] ?? [0, data.length - 1]
  const rows = data.slice(range[0], range[1] + 1)
  const hovering = Option.match(model.chartHover, {
    onNone: () => null,
    onSome: (hover) => (hover.example === id ? hover.index : null),
  })
  const selecting = model.chartSelectionStarts[id]
  const selection =
    selecting === undefined || hovering === null
      ? undefined
      : { fromIndex: selecting - range[0], toIndex: hovering }
  const costDomain =
    range[0] === 0 && range[1] === data.length - 1 ? ([-1, 10] as const) : yDomain(rows, 'cost', 1)
  const impressionDomain =
    range[0] === 0 && range[1] === data.length - 1
      ? ([30, 519] as const)
      : yDomain(rows, 'impression', 50)
  const xTicks =
    range[0] === 0 && range[1] === data.length - 1
      ? [1, 6, 11, 16, 20]
      : Array.from(new Set([range[0] + 1, Math.round((range[0] + range[1]) / 2) + 1, range[1] + 1]))
  return h.div(
    [h.Style({ userSelect: 'none' })],
    [
      h.button(
        [
          h.Class('mb-1 rounded border px-2 py-0.5 text-xs'),
          h.OnClick(ChartMessage.ChartZoomReset({ id })),
        ],
        ['Zoom Out'],
      ),
      LineChart(
        {
          data: rows,
          responsive: true,
          width: 700,
          margin: { top: 5, right: 0, left: 0, bottom: 5 },
          children: [
            CartesianGrid(),
            XAxis({
              allowDataOverflow: true,
              dataKey: 'name',
              type: 'number',
              domain: [range[0] + 1, range[1] + 1],
              ticks: xTicks,
            }),
            YAxis({
              yAxisId: '1',
              type: 'number',
              domain: costDomain,
              ticks: range[0] === 0 && range[1] === data.length - 1 ? [-1, 2, 5, 8, 10] : undefined,
            }),
            YAxis({
              yAxisId: '2',
              type: 'number',
              orientation: 'right',
              domain: impressionDomain,
              ticks:
                range[0] === 0 && range[1] === data.length - 1
                  ? [30, 180, 330, 480, 519]
                  : undefined,
            }),
            Tooltip(),
            Line({ yAxisId: '1', type: 'natural', dataKey: 'cost' }),
            Line({ yAxisId: '2', type: 'natural', dataKey: 'impression' }),
          ],
          activeIndex: hovering,
          onActiveIndexChange: (index) => ChartMessage.ChartHovered({ example: id, index }),
          onSelectionStart: (index) =>
            ChartMessage.ChartZoomStarted({ id, index: range[0] + index }),
          onSelectionEnd: (index) => ChartMessage.ChartZoomEnded({ id, index: range[0] + index }),
          selection,
          title: 'Highlight And Zoom Line Chart',
        },
        h,
      ),
    ],
  )
}
