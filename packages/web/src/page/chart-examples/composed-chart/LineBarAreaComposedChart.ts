/** Foldkit adaptation of Line Bar Area Composed Chart (Recharts LineBarAreaComposedChart). */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import { Message } from '../../../message'
import { Option } from 'effect'
import { simpleComposedData } from '../shared'
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from '../../../generated/registry/ui/composed-chart'

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  ComposedChart(
    {
      data: simpleComposedData,
      responsive: true,
      margin: { top: 20, right: 0, left: 0, bottom: 0 },
      title: 'Line Bar Area Composed Chart',
      children: [
        CartesianGrid({ stroke: '#f5f5f5' }),
        XAxis({ dataKey: 'name' }),
        YAxis({ width: 'auto', niceTicks: 'snap125' }),
        Tooltip(),
        Legend(),
        Area({
          dataKey: 'amt',
          type: 'monotone',
          stroke: '#8884d8',
          fill: '#8884d8',
        }),
        Bar({ dataKey: 'pv', fill: '#413ea0', barSize: 20 }),
        Line({ dataKey: 'uv', type: 'monotone', stroke: '#ff7300' }),
        Scatter({ dataKey: 'cnt', fill: 'red' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'composed-chart/LineBarAreaComposedChart' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        Message.ChartHovered({ example: 'composed-chart/LineBarAreaComposedChart', index }),
    },
    h,
  )
