// Recharts shape and activeShape names are part of the compatible API and example source.
/* oxlint-disable anti-slop/no-shape-in-symbol-names */
/** Data and top-level chart composition come from Recharts; joined scatter lines and symbols follow its source. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import {
  CartesianGrid,
  Legend,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from '../../../generated/registry/ui/scatter-chart'

const data01 = [
  {
    x: 10,
    y: 30,
  },
  {
    x: 30,
    y: 200,
  },
  {
    x: 45,
    y: 100,
  },
  {
    x: 50,
    y: 400,
  },
  {
    x: 70,
    y: 150,
  },
  {
    x: 100,
    y: 250,
  },
]
const data02 = [
  {
    x: 30,
    y: 20,
  },
  {
    x: 50,
    y: 180,
  },
  {
    x: 75,
    y: 240,
  },
  {
    x: 100,
    y: 100,
  },
  {
    x: 120,
    y: 190,
  },
]

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  ScatterChart(
    {
      responsive: true,
      margin: { top: 20, right: 0, bottom: 0, left: 0 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'x', type: 'number', unit: 'cm' }),
        YAxis({ dataKey: 'y', type: 'number', unit: 'kg' }),
        ZAxis({ range: [100, 100] }),
        Tooltip(),
        Legend(),
        Scatter({ dataKey: 'x', data: data01, name: 'A school', line: true, shape: 'cross' }),
        Scatter({
          dataKey: 'y',
          data: data02,
          name: 'B school',
          line: true,
          lineJointType: 'monotone',
          shape: 'diamond',
        }),
      ],
      title: 'Joint Line Scatter Chart',
    },
    h,
  )
