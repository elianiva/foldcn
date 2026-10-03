/** Foldkit adaptation of Simple Scatter Chart (Recharts SimpleScatterChart). */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import { Message } from '../../../message'
import { Option } from 'effect'
import { scatterDataA, scatterDataB } from '../shared'
import {
  ScatterChart,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
} from '../../../generated/registry/ui/scatter-chart'

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  ScatterChart(
    {
      data: [],
      responsive: true,
      title: 'Simple Scatter Chart',
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'x', type: 'number', tickFormatter: (value) => `${value}cm` }),
        YAxis({ dataKey: 'y', type: 'number', tickFormatter: (value) => `${value}kg` }),
        ZAxis({ dataKey: 'z', range: [64, 144] }),
        Tooltip(),
        Legend(),
        Scatter({
          dataKey: 'x',
          name: 'A school',
          data: scatterDataA,
          fill: '#8884d8',
        }),
        Scatter({
          dataKey: 'y',
          name: 'B school',
          data: scatterDataB,
          fill: '#82ca9d',
        }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'scatter-chart/SimpleScatterChart' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        Message.ChartHovered({ example: 'scatter-chart/SimpleScatterChart', index }),
    },
    h,
  )
