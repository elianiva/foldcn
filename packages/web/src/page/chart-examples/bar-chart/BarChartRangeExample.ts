/** Foldkit adaptation of Ranged Bar Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/BarChart/BarChartRangeExample.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { BarChart, XAxis, YAxis, Tooltip, Bar } from '../../../generated/registry/ui/bar-chart'

const rangeData = [
  {
    day: '05-01',
    temperature: [-1, 10],
  },
  {
    day: '05-02',
    temperature: [2, 15],
  },
  {
    day: '05-03',
    temperature: [3, 12],
  },
  {
    day: '05-04',
    temperature: [4, 12],
  },
  {
    day: '05-05',
    temperature: [12, 16],
  },
  {
    day: '05-06',
    temperature: [5, 16],
  },
  {
    day: '05-07',
    temperature: [3, 12],
  },
  {
    day: '05-08',
    temperature: [0, 8],
  },
  {
    day: '05-09',
    temperature: [-3, 5],
  },
]

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  BarChart(
    {
      data: rangeData,
      responsive: true,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      children: [
        XAxis({ dataKey: 'day' }),
        YAxis({ width: 'auto', domain: [-6, 18], ticks: [-6, 0, 6, 12, 18] }),
        Tooltip(),
        Bar({ dataKey: 'temperature' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'bar-chart/BarChartRangeExample' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'bar-chart/BarChartRangeExample', index }),
      title: 'Ranged Bar Chart',
    },
    h,
  )
