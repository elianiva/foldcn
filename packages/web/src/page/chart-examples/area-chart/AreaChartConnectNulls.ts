/** Foldkit adaptation of Area Chart Connect Nulls from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/AreaChart/AreaChartConnectNulls.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from '../../../generated/registry/ui/area-chart'

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
]

const dataWithGaps = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
  },
  {
    name: 'Page D',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    pv: 4300,
    amt: 2100,
  },
]

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('space-y-6')],
    [
      AreaChart(
        {
          data: data,
          responsive: true,
          margin: { top: 20, right: 0, left: 0, bottom: 0 },
          height: 216,
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'name' }),
            YAxis({ width: 'auto' }),
            Tooltip(),
            Area({ dataKey: 'uv', type: 'monotone' }),
          ],
          activeIndex: Option.match(model.chartHover, {
            onNone: () => null,
            onSome: (hover) =>
              hover.example === 'area-chart/AreaChartConnectNulls' ? hover.index : null,
          }),
          onActiveIndexChange: (index) =>
            ChartMessage.ChartHovered({ example: 'area-chart/AreaChartConnectNulls', index }),
          title: 'Area Chart Connect Nulls',
        },
        h,
      ),
      AreaChart(
        {
          data: data,
          responsive: true,
          margin: { top: 20, right: 0, left: 0, bottom: 0 },
          height: 216,
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'name' }),
            YAxis({ width: 'auto' }),
            Tooltip(),
            Area({ dataKey: 'uv', type: 'monotone', connectNulls: true }),
          ],
          activeIndex: Option.match(model.chartHover, {
            onNone: () => null,
            onSome: (hover) =>
              hover.example === 'area-chart/AreaChartConnectNulls' ? hover.index : null,
          }),
          onActiveIndexChange: (index) =>
            ChartMessage.ChartHovered({ example: 'area-chart/AreaChartConnectNulls', index }),
          title: 'Area Chart Connect Nulls',
        },
        h,
      ),
      AreaChart(
        {
          data: data,
          responsive: true,
          margin: { top: 10, right: 30, left: 0, bottom: 0 },
          height: 216,
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'name' }),
            YAxis(),
            Tooltip(),
            Area({ dataKey: 'uv', type: 'monotone', stackId: '1' }),
            Area({ dataKey: 'pv', type: 'monotone', stackId: '1' }),
            Area({ dataKey: 'amt', type: 'monotone', stackId: '1' }),
          ],
          activeIndex: Option.match(model.chartHover, {
            onNone: () => null,
            onSome: (hover) =>
              hover.example === 'area-chart/AreaChartConnectNulls' ? hover.index : null,
          }),
          onActiveIndexChange: (index) =>
            ChartMessage.ChartHovered({ example: 'area-chart/AreaChartConnectNulls', index }),
          title: 'Area Chart Connect Nulls',
        },
        h,
      ),
      AreaChart(
        {
          data: data,
          responsive: true,
          margin: { top: 10, right: 30, left: 0, bottom: 0 },
          height: 216,
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'name' }),
            YAxis(),
            Tooltip(),
            Area({ dataKey: 'uv', type: 'monotone', connectNulls: true, stackId: '1' }),
            Area({ dataKey: 'pv', type: 'monotone', connectNulls: true, stackId: '1' }),
            Area({ dataKey: 'amt', type: 'monotone', connectNulls: true, stackId: '1' }),
          ],
          activeIndex: Option.match(model.chartHover, {
            onNone: () => null,
            onSome: (hover) =>
              hover.example === 'area-chart/AreaChartConnectNulls' ? hover.index : null,
          }),
          onActiveIndexChange: (index) =>
            ChartMessage.ChartHovered({ example: 'area-chart/AreaChartConnectNulls', index }),
          title: 'Area Chart Connect Nulls',
        },
        h,
      ),
      AreaChart(
        {
          data: dataWithGaps,
          responsive: true,
          margin: { top: 10, right: 30, left: 0, bottom: 0 },
          height: 216,
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'name' }),
            YAxis(),
            Tooltip(),
            Area({ dataKey: 'uv', type: 'monotone', stackId: '1' }),
            Area({ dataKey: 'pv', type: 'monotone', stackId: '1' }),
            Area({ dataKey: 'amt', type: 'monotone', stackId: '1' }),
          ],
          activeIndex: Option.match(model.chartHover, {
            onNone: () => null,
            onSome: (hover) =>
              hover.example === 'area-chart/AreaChartConnectNulls' ? hover.index : null,
          }),
          onActiveIndexChange: (index) =>
            ChartMessage.ChartHovered({ example: 'area-chart/AreaChartConnectNulls', index }),
          title: 'Area Chart Connect Nulls',
        },
        h,
      ),
      AreaChart(
        {
          data: dataWithGaps,
          responsive: true,
          margin: { top: 10, right: 30, left: 0, bottom: 0 },
          height: 216,
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'name' }),
            YAxis(),
            Tooltip(),
            Area({ dataKey: 'uv', type: 'monotone', connectNulls: true, stackId: '1' }),
            Area({ dataKey: 'pv', type: 'monotone', connectNulls: true, stackId: '1' }),
            Area({ dataKey: 'amt', type: 'monotone', connectNulls: true, stackId: '1' }),
          ],
          activeIndex: Option.match(model.chartHover, {
            onNone: () => null,
            onSome: (hover) =>
              hover.example === 'area-chart/AreaChartConnectNulls' ? hover.index : null,
          }),
          onActiveIndexChange: (index) =>
            ChartMessage.ChartHovered({ example: 'area-chart/AreaChartConnectNulls', index }),
          title: 'Area Chart Connect Nulls',
        },
        h,
      ),
    ],
  )
