// Recharts shape and activeShape names are part of the compatible API and example source.
/* oxlint-disable anti-slop/no-shape-in-symbol-names */
/** Recharts' per-rectangle click example with independent opacity state. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Message as ChartMessage } from '../../../message'
import type { BarShapeProps } from '../../../generated/registry/ui/bar-chart'
import { Bar, BarChart } from '../../../generated/registry/ui/bar-chart'

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
    pv: 9800,
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
    uv: 1890,
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

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const shape = ({ x, y, width, height, index, fill }: BarShapeProps): Html =>
    h.rect([
      h.Attribute('x', String(x)),
      h.Attribute('y', String(y)),
      h.Attribute('width', String(width)),
      h.Attribute('height', String(height)),
      h.Attribute('fill', fill),
      h.Attribute(
        'fill-opacity',
        model.chartActiveBars.has('bar-chart/BarChartWithCustomizedEvent:' + index) ? '1' : '0.5',
      ),
      h.Style({ cursor: 'pointer' }),
      h.OnClick(
        ChartMessage.ChartBarToggled({ id: 'bar-chart/BarChartWithCustomizedEvent', index }),
      ),
    ])
  return h.div(
    [],
    [
      h.p([], ['Click each rectangle']),
      BarChart(
        {
          data,
          width: 700,
          height: 216,
          responsive: true,
          children: [Bar({ dataKey: 'uv', barSize: 80, shape })],
          title: 'Bar Chart With Customized Event',
        },
        h,
      ),
    ],
  )
}
