/** Data and top-level chart composition come from Recharts; ring colors and click focus follow its custom sector. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import { Legend, RadialBar, RadialBarChart } from '../../../generated/registry/ui/radial-bar-chart'
import { generateMockData } from '../shared'

const data = generateMockData(6, 134)
const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658']

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  RadialBarChart(
    {
      data,
      width: 500,
      height: 250,
      responsive: true,
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) =>
          hover.example === 'radial-bar-chart/RadialBarChartClickToFocusLegendExample'
            ? hover.index
            : null,
      }),
      onActiveIndexChange: (index) =>
        ChartMessage.ChartHovered({
          example: 'radial-bar-chart/RadialBarChartClickToFocusLegendExample',
          index,
        }),
      children: [
        RadialBar({
          dataKey: 'x',
          name: 'foo',
          background: true,
          cornerRadius: 10,
          stroke: 'none',
          colors,
        }),
        Legend({ content: 'text' }),
      ],
      title: 'Radial Bar Chart with Click to Focus Legend',
    },
    h,
  )
