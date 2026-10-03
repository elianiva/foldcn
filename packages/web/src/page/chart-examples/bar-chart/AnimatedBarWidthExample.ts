// Recharts shape and activeShape names are part of the compatible API and example source.
/* oxlint-disable anti-slop/no-shape-in-symbol-names */
/** Source seeded data and monochrome expanding bar shape. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { Bar, BarChart, XAxis, YAxis } from '../../../generated/registry/ui/bar-chart'
import { generateMockData } from '../shared'

const data = generateMockData(15, 5)

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  BarChart(
    {
      data,
      responsive: true,
      barCategoryGap: 4,
      children: [
        XAxis({ dataKey: 'label', mirror: true, interval: 1, padding: { right: 30 } }),
        YAxis({
          mirror: true,
          orientation: 'right',
          padding: { bottom: 30 },
          tick: ({ x, y, value }) =>
            h.text(
              [
                h.Attribute('x', String(x)),
                h.Attribute('y', String(y)),
                h.Attribute('fill', '#666'),
                h.Attribute('font-size', '12'),
                h.Attribute('text-anchor', 'start'),
                h.Attribute('transform', 'rotate(90 ' + x + ' ' + y + ')'),
              ],
              [String(value)],
            ),
        }),
        Bar({
          dataKey: 'y',
          fill: '#000',
          activeBar: true,
          shape: ({ x, y, width, height, isActive }) =>
            h.rect([
              h.Attribute('x', String(x)),
              h.Attribute('y', String(y)),
              h.Attribute('width', String(isActive ? width : width * 0.2)),
              h.Attribute('height', String(height)),
              h.Attribute('fill', '#000'),
              h.Style({ transition: 'width 0.2s ease-out' }),
            ]),
        }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'bar-chart/AnimatedBarWidthExample' ? hover.index : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({ example: 'bar-chart/AnimatedBarWidthExample', index }),
      title: 'Animated Bar Width',
    },
    h,
  )
