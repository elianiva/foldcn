/** Foldkit adaptation of Banded Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/ComposedChart/BandedChart.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  Line,
  Area,
} from '../../../generated/registry/ui/composed-chart'

const data = [
  {
    name: 'Page A',
    a: [0, 0],
    b: 0,
  },
  {
    name: 'Page B',
    a: [50, 300],
    b: 106,
  },
  {
    name: 'Page C',
    a: [150, 423],
    b: 229,
  },
  {
    name: 'Page D',
    b: 312,
  },
  {
    name: 'Page E',
    a: [367, 678],
    b: 451,
  },
  {
    name: 'Page F',
    a: [305, 821],
    b: 623,
  },
]

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  ComposedChart(
    {
      data: data,
      responsive: true,
      margin: { top: 20, right: 0, left: 0, bottom: 0 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'name' }),
        YAxis({ width: 'auto' }),
        Legend(),
        Tooltip(),
        Line({ dataKey: 'b', type: 'natural', stroke: '#ff00ff', connectNulls: true }),
        Area({
          dataKey: 'a',
          type: 'monotone',
          stroke: 'none',
          connectNulls: true,
          dot: false,
          fill: '#cccccc',
          legendType: 'none',
        }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) => (hover.example === 'composed-chart/BandedChart' ? hover.index : null),
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'composed-chart/BandedChart', index }),
      title: 'Banded Chart',
    },
    h,
  )
