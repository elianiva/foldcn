/** Foldkit adaptation of Vertical Composed Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/ComposedChart/VerticalComposedChart.tsx. */
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
  Tooltip,
  Legend,
  Area,
  Bar,
  Line,
} from '../../../generated/registry/ui/composed-chart'

const data = [
  {
    name: 'Page A',
    uv: 590,
    pv: 800,
    amt: 1400,
  },
  {
    name: 'Page B',
    uv: 868,
    pv: 967,
    amt: 1506,
  },
  {
    name: 'Page C',
    uv: 1397,
    pv: 1098,
    amt: 989,
  },
  {
    name: 'Page D',
    uv: 1480,
    pv: 1200,
    amt: 1228,
  },
  {
    name: 'Page E',
    uv: 1520,
    pv: 1108,
    amt: 1100,
  },
  {
    name: 'Page F',
    uv: 1400,
    pv: 680,
    amt: 1700,
  },
]

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  ComposedChart(
    {
      data: data,
      responsive: true,
      layout: 'vertical',
      margin: { top: 20, right: 0, bottom: 0, left: 0 },
      width: 300,
      height: 485,
      children: [
        CartesianGrid(),
        XAxis({ type: 'number' }),
        YAxis({ dataKey: 'name', type: 'category', width: 'auto' }),
        Tooltip(),
        Legend(),
        Area({ dataKey: 'amt', stroke: '#8884d8', fill: '#8884d8' }),
        Bar({ dataKey: 'pv', fill: '#413ea0', barSize: 20 }),
        Line({ dataKey: 'uv', stroke: '#ff7300' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'composed-chart/VerticalComposedChart' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'composed-chart/VerticalComposedChart', index }),
      title: 'Vertical Composed Chart',
    },
    h,
  )
