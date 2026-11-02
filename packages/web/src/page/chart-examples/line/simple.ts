import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  CartesianGrid,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/line-chart'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { renderExample, simpleLineData } from '../shared'

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  renderExample('simple', model, h, {
    data: simpleLineData,
    margin: { top: 5, right: 0, left: 0, bottom: 5 },
    children: [
      CartesianGrid(),
      XAxis({ dataKey: 'label' }),
      YAxis({ width: 'auto' }),
      Tooltip(),
      Legend(),
      Line({ dataKey: 'x', stroke: '#8884d8' }),
      Line({ dataKey: 'y', stroke: '#82ca9d' }),
    ],
  })
