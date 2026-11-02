/** Foldkit adaptation of the Recharts Timeline example.
 * Range positions and outcome colors match the source data and shape. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/bar-chart'

const data = [
  {
    name: 'TEST 1',
    type: 'TR',
    outcome: 'success',
    firstCycle: [0, 3],
    secondCycle: [4.11, 14.11],
  },
  {
    name: 'TEST 2',
    type: 'MT',
    outcome: 'error',
    firstCycle: [0, 1.5],
    secondCycle: [9.11, 12.11],
  },
  {
    name: 'TEST 3',
    type: 'MT',
    outcome: 'success',
    firstCycle: [3, 5.37],
    secondCycle: [8.74, 14.48],
  },
  {
    name: 'TEST 4',
    type: 'MT',
    outcome: 'error',
    firstCycle: [5.37, 7.87],
    secondCycle: [9.61, 16.98],
  },
  {
    name: 'TEST 5',
    type: 'MT',
    outcome: 'success',
    firstCycle: [4.87, 8.24],
    secondCycle: [10.74, 17.35],
  },
  {
    name: 'TEST 6',
    type: 'MT',
    outcome: 'success',
    firstCycle: [3.24, 5.74],
    secondCycle: [8.61, 17.85],
  },
  {
    name: 'TEST 7',
    type: 'MT',
    outcome: 'success',
    firstCycle: [2.74, 9.11],
    secondCycle: [9.74, 18.22],
  },
  {
    name: 'TEST 8',
    type: 'MT',
    outcome: 'pending',
    firstCycle: [9.11, 10.61],
    secondCycle: [12.11, 19.72],
  },
]
const outcomeColor = (outcome: string): string =>
  outcome === 'success' ? 'blue' : outcome === 'error' ? 'red' : 'grey'
const cells = data.map((row) => ({
  fill: outcomeColor(row.outcome),
  stroke: outcomeColor(row.outcome),
}))

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  BarChart(
    {
      data,
      layout: 'vertical',
      responsive: true,
      margin: { top: 5, right: 5, bottom: 20, left: 18 },
      children: [
        CartesianGrid({ strokeDasharray: '2 2' }),
        Tooltip(),
        XAxis({
          type: 'number',
          height: 50,
          label: { value: 'Time (s)', position: 'insideBottomRight' },
        }),
        YAxis({
          type: 'category',
          dataKey: 'name',
          label: { value: 'Test run', angle: -90, position: 'insideTopLeft', textAnchor: 'end' },
        }),
        Bar({
          dataKey: 'firstCycle',
          stackId: 'a',
          radius: 25,
          cells,
          activeBar: { stroke: 'orange', strokeWidth: 3 },
        }),
        Bar({
          dataKey: 'secondCycle',
          stackId: 'a',
          radius: 25,
          cells,
          activeBar: { stroke: 'orange', strokeWidth: 3 },
        }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) => (hover.example === 'bar-chart/TimelineExample' ? hover.index : null),
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'bar-chart/TimelineExample', index }),
      title: 'Timeline',
    },
    h,
  )
