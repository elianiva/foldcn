/** Recharts treemap palette, inset and gap geometry, and leaf labels. */
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
]
const colors = ['#8889DD', '#3a6bd6', '#ce6d1d', '#45b622', '#E2CF45']

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  Treemap(
    {
      data,
      dataKey: 'size',
      nameKey: 'name',
      width: 500,
      height: 375,
      responsive: true,
      aspectRatio: 4 / 3,
      nodeInset: 6,
      nodeGap: 6,
      content: ({ x, y, width, height, depth, topIndex, name, payload }) => {
        const isLeaf = !payload.children || payload.children.length === 0
        return h.g(
          [],
          [
            h.rect([
              h.Attribute('x', String(x)),
              h.Attribute('y', String(y)),
              h.Attribute('width', String(width)),
              h.Attribute('height', String(height)),
              h.Attribute('fill', depth === 0 ? (colors[topIndex] ?? '#8889DD') : 'transparent'),
              h.Attribute('stroke', 'white'),
              h.Attribute('stroke-width', '1'),
            ]),
            ...(isLeaf && width > 36 && height > 18
              ? [
                  h.text(
                    [
                      h.Attribute('x', String(x + width / 2)),
                      h.Attribute('y', String(y + height / 2 + 4)),
                      h.Attribute('text-anchor', 'middle'),
                      h.Attribute('fill', 'white'),
                      h.Attribute('font-size', '12'),
                    ],
                    [name],
                  ),
                ]
              : []),
          ],
        )
      },
      title: 'Treemap with Padding and Gaps',
    },
    h,
  )
