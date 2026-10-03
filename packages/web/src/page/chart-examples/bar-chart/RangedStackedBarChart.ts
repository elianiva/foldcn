/** Foldkit adaptation of the Recharts Ranged Stacked Bar Chart example. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Bar, BarChart, Tooltip, XAxis, YAxis } from '../../../generated/registry/ui/bar-chart'

const rangedStackedBarData = [
  {
    name: 'A',
    value1: [100, 200],
    value2: [200, 250],
    value3: [250, 300],
  },
  {
    name: 'B',
    value1: [120, 180],
    value2: [130, 230],
    value3: [170, 270],
  },
  {
    name: 'C',
    value1: [90, 160],
    value2: [210, 310],
    value3: [340, 440],
  },
  {
    name: 'D',
    value1: [80, 140],
    value2: [140, 200],
    value3: [200, 220],
  },
]

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  BarChart(
    {
      data: rangedStackedBarData,
      responsive: true,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      children: [
        XAxis({ dataKey: 'name' }),
        YAxis({ domain: [0, 600], ticks: [0, 150, 300, 450, 600] }),
        Tooltip(),
        Bar({
          dataKey: 'value1',
          stackId: 'range',
          fill: '#8884d8',
          barSize: 50,
          radius: [0, 0, 25, 25],
        }),
        Bar({ dataKey: 'value2', stackId: 'range', fill: '#82ca9d', barSize: 50 }),
        Bar({
          dataKey: 'value3',
          stackId: 'range',
          fill: '#ffc658',
          barSize: 50,
          radius: [25, 25, 0, 0],
        }),
      ],
      title: 'Ranged Stacked Bar Chart',
    },
    h,
  )
