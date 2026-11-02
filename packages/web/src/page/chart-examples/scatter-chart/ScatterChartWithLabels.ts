// Recharts shape and activeShape names are part of the compatible API and example source.
/* oxlint-disable anti-slop/no-shape-in-symbol-names */
/** Data and top-level chart composition come from Recharts; bubble area and labels use its source props. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from '../../../generated/registry/ui/scatter-chart'

const data = [
  {
    x: 100,
    y: 200,
    z: 200,
  },
  {
    x: 120,
    y: 100,
    z: 260,
  },
  {
    x: 170,
    y: 300,
    z: 400,
  },
  {
    x: 140,
    y: 250,
    z: 280,
  },
  {
    x: 150,
    y: 400,
    z: 500,
  },
  {
    x: 110,
    y: 280,
    z: 200,
  },
]

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  ScatterChart(
    {
      responsive: true,
      margin: { top: 20, right: 0, bottom: 0, left: 0 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'x', type: 'number', unit: 'cm' }),
        YAxis({ dataKey: 'y', type: 'number', unit: 'kg' }),
        Tooltip(),
        Scatter({
          dataKey: 'x',
          data,
          name: 'A school',
          labelDataKey: 'x',
          activeShape: { fill: 'green' },
        }),
        ZAxis({ dataKey: 'z', range: [900, 4000] }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'scatter-chart/ScatterChartWithLabels' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'scatter-chart/ScatterChartWithLabels', index }),
      title: 'Scatter Chart With Labels',
    },
    h,
  )
