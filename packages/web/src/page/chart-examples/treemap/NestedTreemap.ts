/** Recharts nested treemap hierarchy and drill-down. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Message as ChartMessage } from '../../../message'
import { Option } from 'effect'
import { Treemap } from '../../../generated/registry/ui/treemap'
import { ObserveTreemapPointer } from '../observe-treemap-pointer'

const data = [
  {
    name: 'axis',
    children: [
      {
        name: 'Axes',
        size: 1302,
      },
      {
        name: 'Axis',
        size: 24593,
      },
      {
        name: 'AxisGridLine',
        size: 652,
      },
      {
        name: 'AxisLabel',
        size: 636,
      },
      {
        name: 'CartesianAxes',
        size: 6703,
      },
    ],
  },
  {
    name: 'controls',
    children: [
      {
        name: 'AnchorControl',
        size: 2138,
      },
      {
        name: 'ClickControl',
        size: 3824,
      },
      {
        name: 'Control',
        size: 1353,
      },
      {
        name: 'ControlList',
        size: 4665,
      },
      {
        name: 'DragControl',
        size: 2649,
      },
      {
        name: 'ExpandControl',
        size: 2832,
      },
      {
        name: 'HoverControl',
        size: 4896,
      },
      {
        name: 'IControl',
        size: 763,
      },
      {
        name: 'PanZoomControl',
        size: 5222,
      },
      {
        name: 'SelectionControl',
        size: 7862,
      },
      {
        name: 'TooltipControl',
        size: 8435,
      },
    ],
  },
  {
    name: 'data',
    children: [
      {
        name: 'Data',
        size: 20544,
      },
      {
        name: 'DataList',
        size: 19788,
      },
      {
        name: 'DataSprite',
        size: 10349,
      },
      {
        name: 'EdgeSprite',
        size: 3301,
      },
      {
        name: 'NodeSprite',
        size: 19382,
      },
      {
        name: 'render',
        children: [
          {
            name: 'ArrowType',
            size: 698,
          },
          {
            name: 'EdgeRenderer',
            size: 5569,
          },
          {
            name: 'IRenderer',
            size: 353,
          },
          {
            name: 'ShapeRenderer',
            size: 2247,
          },
        ],
      },
      {
        name: 'ScaleBinding',
        size: 11275,
      },
      {
        name: 'Tree',
        size: 7147,
      },
      {
        name: 'TreeBuilder',
        size: 9930,
      },
    ],
  },
  {
    name: 'events',
    children: [
      {
        name: 'DataEvent',
        size: 7313,
      },
      {
        name: 'SelectionEvent',
        size: 6880,
      },
      {
        name: 'TooltipEvent',
        size: 3701,
      },
      {
        name: 'VisualizationEvent',
        size: 2117,
      },
    ],
  },
  {
    name: 'legend',
    children: [
      {
        name: 'Legend',
        size: 20859,
      },
      {
        name: 'LegendItem',
        size: 4614,
      },
      {
        name: 'LegendRange',
        size: 10530,
      },
    ],
  },
]
const id = 'treemap/NestedTreemap'

export default (model: Model, h: HtmlBuilder<Message>): Html => {
  const focusPath = model.chartTreemapPaths[id] ?? []
  const activeTooltip = Option.match(model.chartTreemapHover, {
    onNone: () => null,
    onSome: (hover) => (hover.id === id ? hover : null),
  })
  return h.div(
    [
      h.Style({ maxWidth: '500px', minHeight: '375px' }),
      h.OnMount(ObserveTreemapPointer({ id, width: 500, height: 345 })),
    ],
    [
      Treemap(
        {
          data,
          dataKey: 'size',
          nameKey: 'name',
          width: 500,
          height: 345,
          responsive: true,
          aspectRatio: 4 / 3,
          type: 'nest',
          focusPath,
          onNodeClick: (path) => ChartMessage.ChartTreemapFocused({ id, path: [...path] }),
          onNodeHover: (node) => ChartMessage.ChartTreemapHovered({ id, node }),
          activeTooltip,
          title: 'Nested Treemap',
        },
        h,
      ),
      ...(focusPath.length > 0
        ? [
            h.button(
              [
                h.Class('mt-2 rounded border px-3 py-1'),
                h.OnClick(ChartMessage.ChartTreemapFocused({ id, path: focusPath.slice(0, -1) })),
              ],
              ['← Back'],
            ),
          ]
        : []),
    ],
  )
}
