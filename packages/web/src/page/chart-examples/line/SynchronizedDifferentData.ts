/** Foldkit adaptation of Recharts' Synchronized Charts With Different Data.
 * Each chart keeps its own series, and the weekly hover snaps to a date within two days. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Option } from 'effect'
import { Message as ChartMessage } from '../../../message'
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/line-chart'

const isoDate = (dayOffset: number): string =>
  new Date(Date.UTC(2024, 0, 1 + dayOffset)).toISOString().slice(0, 10)
const dailyData = Array.from({ length: 30 }, (_, i) => ({
  date: isoDate(i),
  value: Math.round(50 + 30 * Math.sin(i / 3) + (i % 7) * 2),
}))
const weeklyData = dailyData.filter((_, i) => i % 5 === 0)
const margin = { top: 10, right: 30, left: 0, bottom: 0 }

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('space-y-6')],
    [
      LineChart(
        {
          data: dailyData,
          responsive: true,
          height: 180,
          margin,
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'date' }),
            YAxis(),
            Tooltip(),
            Line({ dataKey: 'value', name: 'Daily reading', type: 'monotone', dot: false }),
          ],
          activeIndex: Option.match(model.chartHover, {
            onNone: () => null,
            onSome: (hover) =>
              hover.example === 'line/SynchronizedDifferentData/daily'
                ? hover.index
                : hover.example === 'line/SynchronizedDifferentData/weekly' && hover.index !== null
                  ? hover.index * 5
                  : null,
          }),
          onActiveIndexChange: (index) =>
            ChartMessage.ChartHovered({ example: 'line/SynchronizedDifferentData/daily', index }),
          title: 'Daily readings',
        },
        h,
      ),
      LineChart(
        {
          data: weeklyData,
          responsive: true,
          height: 180,
          margin,
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'date' }),
            YAxis(),
            Tooltip(),
            Line({ dataKey: 'value', name: 'Every fifth day', type: 'monotone' }),
          ],
          activeIndex: Option.match(model.chartHover, {
            onNone: () => null,
            onSome: (hover) => {
              if (hover.index === null) return null
              if (hover.example === 'line/SynchronizedDifferentData/weekly') return hover.index
              if (hover.example !== 'line/SynchronizedDifferentData/daily') return null
              const nearest = Math.round(hover.index / 5)
              return Math.abs(nearest * 5 - hover.index) <= 2 && nearest < weeklyData.length
                ? nearest
                : null
            },
          }),
          onActiveIndexChange: (index) =>
            ChartMessage.ChartHovered({ example: 'line/SynchronizedDifferentData/weekly', index }),
          title: 'Every fifth day',
        },
        h,
      ),
    ],
  )
