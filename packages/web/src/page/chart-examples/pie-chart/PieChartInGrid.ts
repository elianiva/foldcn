/** Foldkit adaptation of the Recharts Pie Chart in Grid layout example. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Label, Pie, PieChart } from '../../../generated/registry/ui/pie-chart'
import { ObserveChartSize } from '../observe-size'

const data = [
  {
    name: 'Group A',
    value: 400,
  },
  {
    name: 'Group B',
    value: 300,
  },
  {
    name: 'Group C',
    value: 300,
  },
  {
    name: 'Group D',
    value: 200,
  },
]

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const cell = (id: string, label: string, style: Record<string, string>): Html => {
    const size = model.chartSizes[id]
    return h.div(
      [
        h.Style({
          ...style,
          border: '1px solid #ddd',
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: '1',
          minWidth: '0',
          minHeight: '0',
        }),
        h.OnMount(ObserveChartSize({ id })),
      ],
      [
        PieChart(
          {
            data,
            width: size?.width ?? 300,
            height: size?.height ?? 300,
            responsive: size === undefined,
            children: [
              Pie({ dataKey: 'value', nameKey: 'name', innerRadius: '60%', outerRadius: '80%' }),
              Label({ value: label, position: 'center' }),
            ],
            title: label,
          },
          h,
        ),
      ],
    )
  }
  return h.div(
    [
      h.Style({
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '10px',
        width: '100%',
        minHeight: '400px',
        border: '1px solid #ddd',
        padding: '10px',
      }),
    ],
    [
      cell('pie-grid-1', '2x2 cell', { gridColumn: '1 / 3', gridRow: '1 / 3' }),
      cell('pie-grid-2', '1x1 cell', { gridColumn: '3 / 4', gridRow: '1 / 2' }),
      cell('pie-grid-3', '1x1 cell', { gridColumn: '3 / 4', gridRow: '2 / 3' }),
      cell('pie-grid-4', '3x1 cell', {
        gridColumn: '1 / 4',
        gridRow: '3 / 4',
        width: '33%',
        margin: '0 auto',
      }),
    ],
  )
}
