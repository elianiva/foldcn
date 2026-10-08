/** Foldkit adaptation of Scatter And Line Of Best Fit from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/ComposedChart/ScatterAndLineOfBestFit.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  ComposedChart,
  CartesianGrid,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  Scatter,
  Line,
} from '../../../generated/registry/ui/composed-chart'

const data = [
  {
    index: 10000,
    red: 1643,
    blue: 790,
  },
  {
    index: 1666,
    red: 182,
    blue: 42,
  },
  {
    index: 625,
    red: 56,
    blue: 11,
  },
  {
    index: 300,
    redLine: 0,
  },
  {
    index: 10000,
    redLine: 1522,
  },
  {
    index: 600,
    blueLine: 0,
  },
  {
    index: 10000,
    blueLine: 678,
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
        Tooltip(),
        Legend(),
        XAxis({
          dataKey: 'index',
          type: 'number',
          label: { value: 'Index', position: 'insideBottomRight', offset: 0 },
        }),
        YAxis({
          type: 'number',
          niceTicks: 'snap125',
          width: 'auto',
          unit: 'ms',
          label: { value: 'Time', angle: -90, position: 'insideLeft' },
        }),
        Scatter({ dataKey: 'red', name: 'red', fill: 'red' }),
        Scatter({ dataKey: 'blue', name: 'blue', fill: 'blue' }),
        Line({ dataKey: 'blueLine', stroke: 'blue', dot: false, legendType: 'none' }),
        Line({ dataKey: 'redLine', stroke: 'red', dot: false, legendType: 'none' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'composed-chart/ScatterAndLineOfBestFit' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'composed-chart/ScatterAndLineOfBestFit', index }),
      title: 'Scatter And Line Of Best Fit',
    },
    h,
  )
