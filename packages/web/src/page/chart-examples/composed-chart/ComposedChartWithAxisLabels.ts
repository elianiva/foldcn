/** Foldkit adaptation of Composed Chart With Axis Labels from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/ComposedChart/ComposedChartWithAxisLabels.tsx. */
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
      margin: { top: 20, right: 0, bottom: 0, left: 0 },
      children: [
        CartesianGrid(),
        XAxis({
          dataKey: 'name',
          scale: 'band',
          label: { value: 'Pages', position: 'insideBottomRight', offset: 0 },
        }),
        YAxis({
          width: 'auto',
          label: { value: 'Index', angle: -90, position: 'insideLeft' },
          domain: [0, 1800],
        }),
        Tooltip(),
        Legend(),
        Area({ dataKey: 'amt', type: 'monotone' }),
        Bar({ dataKey: 'pv', barSize: 20 }),
        Line({ dataKey: 'uv', type: 'monotone' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'composed-chart/ComposedChartWithAxisLabels' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'composed-chart/ComposedChartWithAxisLabels', index }),
      title: 'Composed Chart With Axis Labels',
    },
    h,
  )
