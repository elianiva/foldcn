/** Foldkit adaptation of Multiple Y Axes Scatter Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/ScatterChart/MultipleYAxesScatterChart.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
} from '../../../generated/registry/ui/scatter-chart'

const data01 = [
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

const data02 = [
  {
    x: 300,
    y: 300,
    z: 200,
  },
  {
    x: 400,
    y: 500,
    z: 260,
  },
  {
    x: 200,
    y: 700,
    z: 400,
  },
  {
    x: 340,
    y: 350,
    z: 280,
  },
  {
    x: 560,
    y: 500,
    z: 500,
  },
  {
    x: 230,
    y: 780,
    z: 200,
  },
  {
    x: 500,
    y: 400,
    z: 200,
  },
  {
    x: 300,
    y: 500,
    z: 260,
  },
  {
    x: 240,
    y: 300,
    z: 400,
  },
  {
    x: 320,
    y: 550,
    z: 280,
  },
  {
    x: 500,
    y: 400,
    z: 500,
  },
  {
    x: 420,
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
        YAxis({ dataKey: 'y', type: 'number', width: 'auto', unit: 'kg', yAxisId: 'left' }),
        YAxis({
          dataKey: 'y',
          type: 'number',
          width: 'auto',
          unit: 'kg',
          yAxisId: 'right',
          orientation: 'right',
        }),
        Tooltip(),
        Scatter({ dataKey: 'x', data: data01, name: 'A school', yAxisId: 'left' }),
        Scatter({ dataKey: 'y', data: data02, name: 'A school', yAxisId: 'right' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'scatter-chart/MultipleYAxesScatterChart' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'scatter-chart/MultipleYAxesScatterChart', index }),
      title: 'Multiple Y Axes Scatter Chart',
    },
    h,
  )
