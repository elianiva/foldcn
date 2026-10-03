/** Foldkit adaptation of Simple Area Chart (Recharts AreaChartExample). */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import { Message } from '../../../message'
import { Option } from 'effect'
import { simpleAreaData } from '../shared'
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from '../../../generated/registry/ui/area-chart'

const gradient = (h: HtmlBuilder<Message>, id: string, color: string): Html =>
  h.linearGradient(
    [
      h.Attribute('id', id),
      h.Attribute('x1', '0'),
      h.Attribute('y1', '0'),
      h.Attribute('x2', '0'),
      h.Attribute('y2', '1'),
    ],
    [
      h.stop([
        h.Attribute('offset', '5%'),
        h.Attribute('stop-color', color),
        h.Attribute('stop-opacity', '0.8'),
      ]),
      h.stop([
        h.Attribute('offset', '95%'),
        h.Attribute('stop-color', color),
        h.Attribute('stop-opacity', '0'),
      ]),
    ],
  )

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  AreaChart(
    {
      data: simpleAreaData,
      defs: [
        h.defs(
          [],
          [
            gradient(h, 'area-simple-color-x', '#8884d8'),
            gradient(h, 'area-simple-color-y', '#82ca9d'),
          ],
        ),
      ],
      responsive: true,
      margin: { top: 10, right: 0, left: 0, bottom: 0 },
      title: 'Simple Area Chart',
      children: [
        CartesianGrid(),
        XAxis({ dataKey: 'label' }),
        YAxis({ width: 'auto' }),
        Tooltip(),
        Area({
          dataKey: 'x',
          type: 'monotone',
          stroke: '#8884d8',
          fill: 'url(#area-simple-color-x)',
          fillOpacity: 1,
        }),
        Area({
          dataKey: 'y',
          type: 'monotone',
          stroke: '#82ca9d',
          fill: 'url(#area-simple-color-y)',
          fillOpacity: 1,
        }),
      ],
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) => (hover.example === 'area-chart/AreaChartExample' ? hover.index : null),
      }),
      onActiveIndexChange: (index) =>
        Message.ChartHovered({ example: 'area-chart/AreaChartExample', index }),
    },
    h,
  )
