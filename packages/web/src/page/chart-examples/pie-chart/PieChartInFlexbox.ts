/** Foldkit adaptation of the Recharts Pie Chart in Flexbox layout example. */
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
      [h.Style({ ...style, minWidth: '0', minHeight: '0' }), h.OnMount(ObserveChartSize({ id }))],
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
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        minHeight: '300px',
        border: '1px solid #ddd',
        padding: '10px',
        justifyContent: 'space-around',
        alignItems: 'stretch',
      }),
    ],
    [
      cell('pie-flex-1', 'Flex: 1 1 200px', {
        height: 'calc(100% - 20px)',
        width: '33%',
        flex: '1 1 200px',
        aspectRatio: '1',
      }),
      cell('pie-flex-2', "maxWidth: '300px'", {
        height: 'calc(100% - 20px)',
        width: '33%',
        maxWidth: '300px',
        aspectRatio: '1',
      }),
      cell('pie-flex-3', "maxHeight: '20vh'", {
        height: 'calc(100% - 20px)',
        width: '33%',
        maxHeight: '20vh',
        aspectRatio: '1',
      }),
    ],
  )
}
