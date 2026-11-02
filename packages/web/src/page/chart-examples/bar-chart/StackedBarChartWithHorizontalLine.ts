// Recharts shape and activeShape names are part of the compatible API and example source.
/* oxlint-disable anti-slop/no-shape-in-symbol-names */
/** Foldkit adaptation of Stacked Bar Chart with Horizontal Line from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/BarChart/StackedBarChartWithHorizontalLine.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Bar,
} from '../../../generated/registry/ui/bar-chart'

const data = [
  {
    name: 'Page A',
    data1: 4000,
    data2: 2400,
    data3: 1500,
    amt: 2400,
  },
  {
    name: 'Page B',
    data1: 9000,
    data2: 1398,
    data3: 2500,
    amt: 2210,
  },
  {
    name: 'Page C',
    data1: 2000,
    data2: 9800,
    data3: 4200,
    amt: 2290,
  },
  {
    name: 'Page D',
    data1: 2780,
    data2: 3908,
    data3: 1300,
    amt: 2000,
  },
  {
    name: 'Page E',
    data1: 1890,
    data2: 4800,
    data3: 5400,
    amt: 2181,
  },
  {
    name: 'Page F',
    data1: 2390,
    data2: 8800,
    data3: 1500,
    amt: 3000,
  },
  {
    name: 'Page G',
    data1: 3490,
    data2: 4300,
    data3: 2600,
    amt: 2100,
  },
]

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  BarChart(
    {
      data: data,
      responsive: true,
      margin: { top: 40, right: 0, left: 30, bottom: 5 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'name' }),
        YAxis({ niceTicks: 'snap125', width: 'auto' }),
        Tooltip(),
        Legend(),
        ReferenceLine({
          stroke: 'red',
          strokeWidth: 2,
          label: { value: 'Threshold', fill: 'red', position: 'left' },
          y: 18000,
        }),
        Bar({ dataKey: 'data1', stackId: 'a' }),
        Bar({ dataKey: 'data2', stackId: 'a' }),
        Bar({
          dataKey: 'data3',
          stackId: 'a',
          shape: ({ x, y, width, height, fill, payload }) => {
            const label = (
              Number(payload.data1) +
              Number(payload.data2) +
              Number(payload.data3)
            ).toLocaleString()
            const cx = x + width / 2
            const cy = y - 18
            const boxWidth = label.length * 8 + 16
            return h.g(
              [],
              [
                h.rect([
                  h.Attribute('x', String(x)),
                  h.Attribute('y', String(y)),
                  h.Attribute('width', String(width)),
                  h.Attribute('height', String(height)),
                  h.Attribute('fill', fill),
                  h.Attribute('fill-opacity', '0.8'),
                ]),
                h.rect([
                  h.Attribute('x', String(cx - boxWidth / 2)),
                  h.Attribute('y', String(cy - 11)),
                  h.Attribute('width', String(boxWidth)),
                  h.Attribute('height', '22'),
                  h.Attribute('rx', '6'),
                  h.Attribute('fill', '#fff'),
                  h.Attribute('stroke', '#E2F0CB'),
                  h.Attribute('stroke-width', '1.5'),
                ]),
                h.text(
                  [
                    h.Attribute('x', String(cx)),
                    h.Attribute('y', String(cy)),
                    h.Attribute('text-anchor', 'middle'),
                    h.Attribute('dominant-baseline', 'middle'),
                    h.Attribute('font-size', '12'),
                    h.Attribute('fill', '#333'),
                  ],
                  [label],
                ),
              ],
            )
          },
        }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'bar-chart/StackedBarChartWithHorizontalLine' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({
          example: 'bar-chart/StackedBarChartWithHorizontalLine',
          index,
        }),
      title: 'Stacked Bar Chart with Horizontal Line',
    },
    h,
  )
