/** Recharts custom treemap hierarchy, palette, and node content. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Treemap } from '../../../generated/registry/ui/treemap'

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
  {
    name: 'operator',
    children: [
      {
        name: 'distortion',
        children: [
          {
            name: 'BifocalDistortion',
            size: 4461,
          },
          {
            name: 'Distortion',
            size: 6314,
          },
          {
            name: 'FisheyeDistortion',
            size: 3444,
          },
        ],
      },
      {
        name: 'encoder',
        children: [
          {
            name: 'ColorEncoder',
            size: 3179,
          },
          {
            name: 'Encoder',
            size: 4060,
          },
          {
            name: 'PropertyEncoder',
            size: 4138,
          },
          {
            name: 'ShapeEncoder',
            size: 1690,
          },
          {
            name: 'SizeEncoder',
            size: 1830,
          },
        ],
      },
      {
        name: 'filter',
        children: [
          {
            name: 'FisheyeTreeFilter',
            size: 5219,
          },
          {
            name: 'GraphDistanceFilter',
            size: 3165,
          },
          {
            name: 'VisibilityFilter',
            size: 3509,
          },
        ],
      },
      {
        name: 'IOperator',
        size: 1286,
      },
      {
        name: 'label',
        children: [
          {
            name: 'Labeler',
            size: 9956,
          },
          {
            name: 'RadialLabeler',
            size: 3899,
          },
          {
            name: 'StackedAreaLabeler',
            size: 3202,
          },
        ],
      },
      {
        name: 'layout',
        children: [
          {
            name: 'AxisLayout',
            size: 6725,
          },
          {
            name: 'BundledEdgeRouter',
            size: 3727,
          },
          {
            name: 'CircleLayout',
            size: 9317,
          },
          {
            name: 'CirclePackingLayout',
            size: 12003,
          },
          {
            name: 'DendrogramLayout',
            size: 4853,
          },
          {
            name: 'ForceDirectedLayout',
            size: 8411,
          },
          {
            name: 'IcicleTreeLayout',
            size: 4864,
          },
          {
            name: 'IndentedTreeLayout',
            size: 3174,
          },
          {
            name: 'Layout',
            size: 7881,
          },
          {
            name: 'NodeLinkTreeLayout',
            size: 12870,
          },
          {
            name: 'PieLayout',
            size: 2728,
          },
          {
            name: 'RadialTreeLayout',
            size: 12348,
          },
          {
            name: 'RandomLayout',
            size: 870,
          },
          {
            name: 'StackedAreaLayout',
            size: 9121,
          },
          {
            name: 'TreeMapLayout',
            size: 9191,
          },
        ],
      },
      {
        name: 'Operator',
        size: 2490,
      },
      {
        name: 'OperatorList',
        size: 5248,
      },
      {
        name: 'OperatorSequence',
        size: 4190,
      },
      {
        name: 'OperatorSwitch',
        size: 2581,
      },
      {
        name: 'SortOperator',
        size: 2023,
      },
    ],
  },
]
const colors = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D']

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  Treemap(
    {
      data,
      dataKey: 'size',
      width: 500,
      height: 375,
      responsive: true,
      content: ({ x, y, width, height, depth, name }) => {
        const top = depth === 0
        const index = data.findIndex((node) => node.name === name)
        const fill = top ? (colors[index] ?? '#8889DD') : 'transparent'
        return h.g(
          [],
          [
            h.rect([
              h.Attribute('x', String(x)),
              h.Attribute('y', String(y)),
              h.Attribute('width', String(width)),
              h.Attribute('height', String(height)),
              h.Attribute('fill', fill),
              h.Attribute('stroke', 'white'),
              h.Attribute('stroke-width', top ? '2' : '1'),
            ]),
            ...(top
              ? [
                  h.text(
                    [
                      h.Attribute('x', String(x + width / 2)),
                      h.Attribute('y', String(y + height / 2 + 7)),
                      h.Attribute('text-anchor', 'middle'),
                      h.Attribute('fill', 'white'),
                      h.Attribute('font-size', '14'),
                    ],
                    [name],
                  ),
                  h.text(
                    [
                      h.Attribute('x', String(x + 4)),
                      h.Attribute('y', String(y + 18)),
                      h.Attribute('fill', 'white'),
                      h.Attribute('font-size', '16'),
                    ],
                    [String(index + 1)],
                  ),
                ]
              : []),
          ],
        )
      },
      title: 'Custom Content Treemap',
    },
    h,
  )
