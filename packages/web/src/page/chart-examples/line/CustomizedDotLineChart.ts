/** Foldkit adaptation of Customized Dot Line Chart from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/LineChart/CustomizedDotLineChart.tsx. */
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
  Line,
} from '../../../generated/registry/ui/line-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 22213)

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  LineChart(
    {
      data: data,
      responsive: true,
      margin: { top: 5, right: 10, left: 0, bottom: 5 },
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'label' }),
        YAxis({ width: 'auto' }),
        Tooltip(),
        Legend(),
        Line({
          dataKey: 'x',
          type: 'monotone',
          dot: ({ cx, cy }) =>
            h.g(
              [h.Attribute('transform', `translate(${cx} ${cy})`)],
              [
                h.circle([h.Attribute('r', '9'), h.Attribute('fill', 'red')]),
                h.circle([
                  h.Attribute('cx', '-3'),
                  h.Attribute('cy', '-2'),
                  h.Attribute('r', '1.5'),
                  h.Attribute('fill', 'white'),
                ]),
                h.circle([
                  h.Attribute('cx', '3'),
                  h.Attribute('cy', '-2'),
                  h.Attribute('r', '1.5'),
                  h.Attribute('fill', 'white'),
                ]),
                h.path([
                  h.Attribute('d', 'M -5 5 Q 0 0 5 5'),
                  h.Attribute('fill', 'none'),
                  h.Attribute('stroke', 'white'),
                  h.Attribute('stroke-width', '1.5'),
                ]),
              ],
            ),
        }),
        Line({ dataKey: 'y', type: 'monotone' }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) => (hover.example === 'line/CustomizedDotLineChart' ? hover.index : null),
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'line/CustomizedDotLineChart', index }),
      title: 'Customized Dot Line Chart',
    },
    h,
  )
