/** Recharts SimpleAreaChart data and context-menu behavior. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import { Message as ChartMessage } from '../../../message'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/area-chart'
import { preventRightClickData } from '../shared'

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.OnContextMenu(
        ChartMessage.ChartHovered({ example: 'area-chart/PreventRightClickExample', index: null }),
      ),
    ],
    [
      AreaChart(
        {
          data: preventRightClickData,
          responsive: true,
          margin: { top: 20, right: 0, left: 0, bottom: 0 },
          children: [
            CartesianGrid(),
            XAxis({ dataKey: 'label' }),
            YAxis(),
            Tooltip(),
            Area({ dataKey: 'y', type: 'monotone' }),
          ],
          title: 'Prevent right click menu',
        },
        h,
      ),
    ],
  )
