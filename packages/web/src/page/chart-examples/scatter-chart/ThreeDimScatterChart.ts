// Recharts shape and activeShape names are part of the compatible API and example source.
/* oxlint-disable anti-slop/no-shape-in-symbol-names */
/** Foldkit adaptation of Three Dim Scatter Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/ScatterChart/ThreeDimScatterChart.tsx. */
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
  ZAxis,
  Tooltip,
  Legend,
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
    x: 200,
    y: 260,
    z: 240,
  },
  {
    x: 240,
    y: 290,
    z: 220,
  },
  {
    x: 190,
    y: 290,
    z: 250,
  },
  {
    x: 198,
    y: 250,
    z: 210,
  },
  {
    x: 180,
    y: 280,
    z: 260,
  },
  {
    x: 210,
    y: 220,
    z: 230,
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
        YAxis({ dataKey: 'y', type: 'number', width: 'auto', unit: 'kg' }),
        ZAxis({ dataKey: 'z', range: [60, 400] }),
        Tooltip(),
        Legend(),
        Scatter({ dataKey: 'x', data: data01, name: 'A school', shape: 'star' }),
        Scatter({ dataKey: 'y', data: data02, name: 'B school', shape: 'triangle' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'scatter-chart/ThreeDimScatterChart' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'scatter-chart/ThreeDimScatterChart', index }),
      title: 'Three Dim Scatter Chart',
    },
    h,
  )
