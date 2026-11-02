/** Foldkit adaptation of Simple Bar Chart (Recharts SimpleBarChart). */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import { Message } from '../../../message'
import { Option } from 'effect'
import { simpleBarData } from '../shared'
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from '../../../generated/registry/ui/bar-chart'

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  BarChart(
    {
      data: simpleBarData,
      responsive: true,
      margin: { top: 5, right: 0, left: 0, bottom: 5 },
      title: 'Simple Bar Chart',
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'label', height: 30 }),
        YAxis({ width: 'auto' }),
        Tooltip(),
        Legend(),
        Bar({ dataKey: 'x', fill: '#000', radius: [10, 10, 0, 0] }),
        Bar({ dataKey: 'y', fill: '#000', radius: [10, 10, 0, 0] }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) => (hover.example === 'bar-chart/SimpleBarChart' ? hover.index : null),
      }),
      onActiveIndexChange: (index) =>
        Message.ChartHovered({ example: 'bar-chart/SimpleBarChart', index }),
    },
    h,
  )
