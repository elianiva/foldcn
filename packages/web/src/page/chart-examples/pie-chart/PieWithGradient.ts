/** Recharts Pie Gradient data, four colors, and radial sector fills. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Option } from 'effect'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Message as ChartMessage } from '../../../message'
import { Pie, PieChart, Tooltip } from '../../../generated/registry/ui/pie-chart'
import { gradientPieData } from '../shared'

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const activeIndex =
    Option.match(model.chartHover, {
      onNone: () => 0,
      onSome: (hover) => (hover.example === 'pie-chart/PieWithGradient' ? hover.index : 0),
    }) ?? 0
  const values = gradientPieData.map((row) => Number(row.x) || 0)
  const total = values.reduce((sum, value) => sum + value, 0)
  const before = values.slice(0, activeIndex).reduce((sum, value) => sum + value, 0)
  const angle = ((before + (values[activeIndex] ?? 0) / 2) / total) * 2 * Math.PI
  return h.div(
    [h.Style({ position: 'relative', maxWidth: '500px' })],
    [
      PieChart(
        {
          data: gradientPieData,
          width: 500,
          height: 500,
          responsive: true,
          activeIndex,
          onActiveIndexChange: (index) =>
            ChartMessage.ChartHovered({ example: 'pie-chart/PieWithGradient', index }),
          children: [
            Pie({
              dataKey: 'x',
              innerRadius: '20%',
              gradientColors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
            }),
            Tooltip({ defaultIndex: 0 }),
          ],
          title: 'Pie Chart with Gradient',
        },
        h,
      ),
      h.div(
        [
          h.Style({
            position: 'absolute',
            left: `${50 + Math.cos(angle) * 24}%`,
            top: `${50 - Math.sin(angle) * 24}%`,
            padding: '6px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#fff',
            fontSize: '12px',
            color: '#666',
            pointerEvents: 'none',
          }),
          h.Role('status'),
        ],
        [`${activeIndex}: ${values[activeIndex] ?? 0}`],
      ),
    ],
  )
}
