/** Recharts' split-color area, with the source data and a zero-aligned SVG gradient. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/area-chart'

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
    uv: -1000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 500,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: -2000,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: -250,
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
const zeroRatio = (396 - (2000 / 8000) * (396 - 10)) / 433

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  AreaChart(
    {
      data,
      responsive: true,
      margin: { top: 10, right: 0, left: 0, bottom: 0 },
      defs: [
        h.defs(
          [],
          [
            h.linearGradient(
              [
                h.Attribute('id', 'splitColor'),
                h.Attribute('x1', '0'),
                h.Attribute('x2', '0'),
                h.Attribute('y1', '0'),
                h.Attribute('y2', '433'),
                h.Attribute('gradientUnits', 'userSpaceOnUse'),
              ],
              [
                h.stop([
                  h.Attribute('offset', '0'),
                  h.Attribute('stop-color', 'green'),
                  h.Attribute('stop-opacity', '1'),
                ]),
                h.stop([
                  h.Attribute('offset', String(zeroRatio)),
                  h.Attribute('stop-color', 'green'),
                  h.Attribute('stop-opacity', '0.1'),
                ]),
                h.stop([
                  h.Attribute('offset', String(zeroRatio)),
                  h.Attribute('stop-color', 'red'),
                  h.Attribute('stop-opacity', '0.1'),
                ]),
                h.stop([
                  h.Attribute('offset', '1'),
                  h.Attribute('stop-color', 'red'),
                  h.Attribute('stop-opacity', '1'),
                ]),
              ],
            ),
          ],
        ),
      ],
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'name' }),
        YAxis({ domain: [-2000, 6000] }),
        Tooltip(),
        Area({ dataKey: 'uv', type: 'monotone', stroke: '#000', fill: 'url(#splitColor)' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'area-chart/AreaChartFillByValue' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'area-chart/AreaChartFillByValue', index }),
      title: 'Area Chart Fill By Value',
    },
    h,
  )
