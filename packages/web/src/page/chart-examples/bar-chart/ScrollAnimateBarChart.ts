/** Scroll demonstration layout and seeded series from Recharts. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/bar-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 10)

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Style({ paddingTop: '50vh' })],
    [
      BarChart(
        {
          data,
          width: 700,
          responsive: true,
          margin: { top: 5, right: 0, left: 0, bottom: 5 },
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'label' }),
            YAxis({ width: 'auto' }),
            Tooltip(),
            Legend(),
            Bar({ dataKey: 'y', activeBar: true, radius: [10, 10, 0, 0], scrollAnimate: true }),
            Bar({ dataKey: 'x', activeBar: true, radius: [10, 10, 0, 0], scrollAnimate: true }),
          ],
          activeIndex: Option.match(model.chartHover, {
            onNone: () => null,
            onSome: (hover) =>
              hover.example === 'bar-chart/ScrollAnimateBarChart' ? hover.index : null,
          }),
          onActiveIndexChange: (index) =>
            ChartMessage.ChartHovered({ example: 'bar-chart/ScrollAnimateBarChart', index }),
          title: 'Animate by Scroll',
        },
        h,
      ),
    ],
  )
