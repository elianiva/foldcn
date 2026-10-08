// Recharts shape and activeShape names are part of the compatible API and example source.
/* oxlint-disable anti-slop/no-shape-in-symbol-names */
/** Data and top-level chart composition come from Recharts; triangle path and per-bar colors follow the source. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import type { BarShapeProps } from '../../../generated/registry/ui/bar-chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
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
const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'pink', 'black']

export default (_model: Model, h: HtmlBuilder<Message>): Html => {
  const triangle = ({ x, y, width, height, index, isActive }: BarShapeProps): Html => {
    const color = colors[index % colors.length] ?? '#0088FE'
    const d =
      'M' +
      x +
      ',' +
      (y + height) +
      'C' +
      (x + width / 3) +
      ',' +
      (y + height) +
      ' ' +
      (x + width / 2) +
      ',' +
      (y + height / 3) +
      ' ' +
      (x + width / 2) +
      ',' +
      y +
      ' C' +
      (x + width / 2) +
      ',' +
      (y + height / 3) +
      ' ' +
      (x + (2 * width) / 3) +
      ',' +
      (y + height) +
      ' ' +
      (x + width) +
      ',' +
      (y + height) +
      ' Z'
    return h.path([
      h.Attribute('d', d),
      h.Attribute('fill', color),
      h.Attribute('stroke', color),
      h.Attribute('stroke-width', isActive ? '5' : '0'),
    ])
  }
  return BarChart(
    {
      data,
      responsive: true,
      margin: { top: 20, right: 0, left: 0, bottom: 5 },
      children: [
        CartesianGrid(),
        Tooltip(),
        XAxis({ dataKey: 'name' }),
        YAxis({ width: 'auto' }),
        Bar({ dataKey: 'uv', shape: triangle, activeBar: true }),
      ],
      title: 'Custom Shape Bar Chart',
    },
    h,
  )
}
