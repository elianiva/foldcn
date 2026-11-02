/** Foldkit adaptation of Line Chart With Reference Lines from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/LineChart/LineChartWithReferenceLines.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Line,
} from '../../../generated/registry/ui/line-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 984)

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  LineChart(
    {
      data: data,
      responsive: true,
      margin: { top: 20, right: 0, left: 0, bottom: 5 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'label' }),
        YAxis({ width: 'auto' }),
        Tooltip(),
        Legend(),
        ReferenceLine({
          x: 'Iter: 2',
          stroke: 'red',
          label: {
            value: 'Example label',
            fill: 'red',
            position: 'insideBottomRight',
            angle: 90,
            dx: 20,
          },
        }),
        ReferenceLine({
          y: 500,
          stroke: 'red',
          label: { value: '500', fill: 'red', position: 'insideTopLeft' },
        }),
        Line({ dataKey: 'x', type: 'monotone' }),
        Line({ dataKey: 'y', type: 'monotone' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) => (hover.example === 'line/reference-lines' ? hover.index : null),
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'line/reference-lines', index }),
      title: 'Line Chart With Reference Lines',
    },
    h,
  )
