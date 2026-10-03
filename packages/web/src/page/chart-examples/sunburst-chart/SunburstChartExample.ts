/** Foldkit adaptation of Sunburst Chart Example from the pinned Recharts example source.
 * Data and top-level chart composition come from www/src/docs/exampleComponents/SunburstChart/SunburstChartExample.tsx. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { SunburstChart } from '../../../generated/registry/ui/sunburst-chart'

const hierarchy = {
  name: 'Root',
  value: 100,
  children: [
    {
      name: 'Child1',
      fill: '#264653',
      value: 30,
      children: [
        {
          name: 'third child',
          value: 10,
        },
        {
          name: 'another child',
          value: 5,
        },
        {
          name: 'next child',
          value: 15,
          children: [
            {
              name: 'third level child',
              value: 5,
            },
            {
              name: 'third level child',
              value: 5,
            },
            {
              name: 'third level child',
              value: 5,
              children: [
                {
                  name: 'level 4',
                  value: 2,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Child2',
      fill: '#2a9d8f',
      value: 20,
      children: [
        {
          name: 'another child',
          value: 10,
        },
        {
          name: 'next child',
          value: 10,
          children: [
            {
              name: 'level 3 of child 2',
              value: 5,
            },
            {
              name: 'level 3 of child 2',
              value: 3,
            },
            {
              name: 'level 3 of child 2',
              value: 2,
            },
          ],
        },
      ],
    },
    {
      name: 'Child3',
      fill: '#e9c46a',
      value: 20,
    },
    {
      name: 'Child4',
      fill: '#F4A261',
      value: 10,
      children: [
        {
          name: 'child4 child',
          value: 5,
        },
        {
          name: 'child4 child',
          value: 5,
        },
      ],
    },
    {
      name: 'Child5',
      fill: '#e76f51',
      value: 20,
    },
  ],
}

export default (model: Model, h: HtmlBuilder<Message>): Html =>
  SunburstChart(
    {
      data: hierarchy,
      startAngle: 90,
      endAngle: 270,
      width: 700,
      height: 450,
      responsive: true,
      title: 'Sunburst Chart Example',
    },
    h,
  )
