/** Three synchronized Recharts area previews in the source grid. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/area-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 298905)
const margin = { top: 10, right: 0, left: 0, bottom: 0 }

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const activeIndex = Option.match(model.chartHover, {
    onNone: () => null,
    onSome: (hover) => (hover.example === 'area-chart/SynchronizedAreaChart' ? hover.index : null),
  })
  const onActiveIndexChange = (index: number | null): Message =>
    ChartMessage.ChartHovered({ example: 'area-chart/SynchronizedAreaChart', index })
  const common = [CartesianGrid(), XAxis({ dataKey: 'label' }), Tooltip()]
  return h.div(
    [
      h.Style({
        display: 'grid',
        gridTemplateColumns: '30% 70%',
        gridTemplateRows: '143px 143px',
        width: '100%',
      }),
    ],
    [
      AreaChart(
        {
          data,
          width: 210,
          height: 143,
          responsive: true,
          margin,
          children: [
            ...common,
            YAxis({ width: 'auto', domain: [0, 280], ticks: [0, 70, 140, 210, 280] }),
            Area({ dataKey: 'x', type: 'monotone' }),
          ],
          activeIndex,
          onActiveIndexChange,
          title: 'Synchronized Area Chart: x',
        },
        h,
      ),
      AreaChart(
        {
          data,
          width: 490,
          height: 143,
          responsive: true,
          margin,
          children: [
            ...common,
            YAxis({ width: 'auto', domain: [0, 800], ticks: [0, 200, 400, 600, 800] }),
            Area({ dataKey: 'y', type: 'monotone' }),
          ],
          activeIndex,
          onActiveIndexChange,
          title: 'Synchronized Area Chart: y',
        },
        h,
      ),
      h.div(
        [h.Style({ gridColumn: '1 / span 2' })],
        [
          AreaChart(
            {
              data,
              width: 700,
              height: 143,
              responsive: true,
              margin,
              children: [
                ...common,
                YAxis({ width: 'auto', domain: [0, 1800], ticks: [0, 450, 900, 1350, 1800] }),
                Area({ dataKey: 'z', type: 'monotone', strokeWidth: 4, strokeDasharray: '16 16' }),
              ],
              activeIndex,
              onActiveIndexChange,
              title: 'Synchronized Area Chart: z',
            },
            h,
          ),
        ],
      ),
    ],
  )
}
