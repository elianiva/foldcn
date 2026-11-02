// Recharts shape and activeShape names are part of the compatible API and example source.
/* oxlint-disable anti-slop/no-shape-in-symbol-names */
/** Foldkit adaptation of Bar Chart With Min Height from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/BarChart/BarChartWithMinHeight.tsx. */
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
  Bar,
} from '../../../generated/registry/ui/bar-chart'

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 8,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 18,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
]

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  BarChart(
    {
      data: data,
      responsive: true,
      margin: { top: 25, right: 0, left: 0, bottom: 5 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'name' }),
        YAxis({ width: 'auto', domain: [0, 6000], ticks: [0, 1500, 3000, 4500, 6000] }),
        Tooltip(),
        Legend(),
        Bar({
          dataKey: 'pv',
          minPointSize: 5,
          shape: ({ x, y, width, height, fill, payload }) =>
            h.g(
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
                h.circle([
                  h.Attribute('cx', String(x + width / 2)),
                  h.Attribute('cy', String(y - 10)),
                  h.Attribute('r', '10'),
                  h.Attribute('fill', fill),
                ]),
                h.text(
                  [
                    h.Attribute('x', String(x + width / 2)),
                    h.Attribute('y', String(y - 10)),
                    h.Attribute('fill', '#fff'),
                    h.Attribute('text-anchor', 'middle'),
                    h.Attribute('dominant-baseline', 'middle'),
                    h.Attribute('font-size', '12'),
                  ],
                  [String(payload.name ?? '').split(' ')[1] ?? ''],
                ),
              ],
            ),
        }),
        Bar({ dataKey: 'uv', minPointSize: 10 }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'bar-chart/BarChartWithMinHeight' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'bar-chart/BarChartWithMinHeight', index }),
      title: 'Bar Chart With Min Height',
    },
    h,
  )
