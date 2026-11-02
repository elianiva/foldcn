import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { LineChart } from '../../generated/registry/ui/line-chart'
import type { ChartChild, Datum, LineChartProps } from '../../generated/registry/ui/line-chart'
import type { HierarchyNode } from '../../generated/registry/ui/treemap'
import { Message } from '../../message'
import type { Model } from '../../model'

export const sampleData: ReadonlyArray<Datum> = [
  { name: 'Jan', desktop: 400, mobile: 240 },
  { name: 'Feb', desktop: 300, mobile: 139 },
  { name: 'Mar', desktop: 520, mobile: 280 },
  { name: 'Apr', desktop: 440, mobile: 390 },
  { name: 'May', desktop: 610, mobile: 430 },
  { name: 'Jun', desktop: 560, mobile: 380 },
]

export const sampleDataWithNulls: ReadonlyArray<Datum> = sampleData.map((row, index) =>
  index === 2 ? { ...row, desktop: null } : row,
)
export const sampleNegativeData: ReadonlyArray<Datum> = sampleData.map((row) => ({
  ...row,
  mobile: -Number(row.mobile ?? 0),
}))
export const sampleSmallData: ReadonlyArray<Datum> = sampleData.map((row, index) => ({
  ...row,
  desktop: index === 1 ? 2 : row.desktop,
}))

export const samplePolarData: ReadonlyArray<Datum> = [
  { name: 'Search', value: 36 },
  { name: 'Direct', value: 24 },
  { name: 'Social', value: 18 },
  { name: 'Email', value: 12 },
  { name: 'Other', value: 10 },
]

// Mirrors @recharts/devtools generateMockData, including its seeded LCG.
export const generateMockData = (length: number, seed: number): ReadonlyArray<Datum> => {
  const result: Datum[] = []
  let random = seed
  const between = (min: number, max: number): number => {
    random = (75 * random + 74) % 65537
    return (Math.round(random) % (max - min)) + min
  }
  for (let i = 0; i < length; i++)
    result.push({
      label: `Iter: ${i}`,
      x: between(100, 300),
      y: between(400, 800),
      z: between(1000, 2000),
    })
  return result
}

export const simpleLineData: ReadonlyArray<Datum> = generateMockData(6, 26213)
export const simpleBarData: ReadonlyArray<Datum> = generateMockData(6, 823)
export const simpleAreaData: ReadonlyArray<Datum> = generateMockData(6, 598905)
export const preventRightClickData: ReadonlyArray<Datum> = generateMockData(6, 4390435)
export const tinyLineData: ReadonlyArray<Datum> = generateMockData(6, 22123)
export const tinyAreaData: ReadonlyArray<Datum> = generateMockData(6, 905)
export const gradientPieData: ReadonlyArray<Datum> = generateMockData(4, 1000)
export const tinyBarData: ReadonlyArray<Datum> = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
]
export const simpleRadarData: ReadonlyArray<Datum> = [
  { subject: 'Math', A: 120 },
  { subject: 'Chinese', A: 98 },
  { subject: 'English', A: 86 },
  { subject: 'Geography', A: 99 },
  { subject: 'Physics', A: 85 },
  { subject: 'History', A: 65 },
]
export const simpleRadialBarData: ReadonlyArray<Datum> = [
  { name: '18-24', uv: 31.47 },
  { name: '25-29', uv: 26.69 },
  { name: '30-34', uv: 15.69 },
  { name: '35-39', uv: 8.22 },
  { name: '40-49', uv: 8.63 },
  { name: '50+', uv: 2.63 },
  { name: 'unknown', uv: 6.67 },
]
export const pieInnerData: ReadonlyArray<Datum> = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
]
export const pieOuterData: ReadonlyArray<Datum> = [
  { name: 'A1', value: 100 },
  { name: 'A2', value: 300 },
  { name: 'B1', value: 100 },
  { name: 'B2', value: 80 },
  { name: 'B3', value: 40 },
  { name: 'B4', value: 30 },
  { name: 'B5', value: 50 },
  { name: 'C1', value: 100 },
  { name: 'C2', value: 200 },
  { name: 'D1', value: 150 },
  { name: 'D2', value: 50 },
]
export const scatterDataA: ReadonlyArray<Datum> = [
  { x: 100, y: 200, z: 200 },
  { x: 120, y: 100, z: 260 },
  { x: 170, y: 300, z: 400 },
  { x: 140, y: 250, z: 280 },
  { x: 150, y: 400, z: 500 },
  { x: 110, y: 280, z: 200 },
]
export const scatterDataB: ReadonlyArray<Datum> = [
  { x: 200, y: 260, z: 240 },
  { x: 240, y: 290, z: 220 },
  { x: 190, y: 290, z: 250 },
  { x: 198, y: 250, z: 210 },
  { x: 180, y: 280, z: 260 },
  { x: 210, y: 220, z: 230 },
]
export const simpleComposedData: ReadonlyArray<Datum> = [
  { name: 'Page A', uv: 590, pv: 800, amt: 1400, cnt: 490 },
  { name: 'Page B', uv: 868, pv: 967, amt: 1506, cnt: 590 },
  { name: 'Page C', uv: 1397, pv: 1098, amt: 989, cnt: 350 },
  { name: 'Page D', uv: 1480, pv: 1200, amt: 1228, cnt: 480 },
  { name: 'Page E', uv: 1520, pv: 1108, amt: 1100, cnt: 460 },
  { name: 'Page F', uv: 1400, pv: 680, amt: 1700, cnt: 380 },
]

export const sampleHierarchy: ReadonlyArray<HierarchyNode> = [
  {
    name: 'Product',
    children: [
      { name: 'Web', value: 34 },
      { name: 'Mobile', value: 22 },
    ],
  },
  {
    name: 'Sales',
    children: [
      { name: 'North', value: 18 },
      { name: 'South', value: 12 },
    ],
  },
  { name: 'Support', value: 14 },
]
export const bundleHierarchy: ReadonlyArray<HierarchyNode> = [
  {
    name: 'node_modules',
    children: [
      { name: 'react-redux', children: [{ name: 'es', value: 2304 }] },
      { name: 'victory-vendor', children: [{ name: 'es', value: 1792 }] },
    ],
  },
  {
    name: 'src',
    children: [
      {
        name: 'chart',
        children: [
          { name: 'Treemap.tsx', value: 1536 },
          { name: 'SunburstChart.tsx', value: 1280 },
        ],
      },
      { name: 'component', children: [{ name: 'Tooltip.tsx', value: 1152 }] },
      { name: 'util', children: [{ name: 'ChartUtils.ts', value: 640 }] },
    ],
  },
  { name: 'entry', children: [{ name: 'www/src/docs', value: 1024 }] },
]

export const renderExample = (
  id: string,
  model: Model,
  h: HtmlBuilder<Message>,
  config: Readonly<{
    data?: ReadonlyArray<Datum>
    children: ReadonlyArray<ChartChild>
    layout?: LineChartProps<Message>['layout']
    width?: number
    height?: number
    responsive?: boolean
    margin?: LineChartProps<Message>['margin']
  }>,
): Html =>
  LineChart<Message>(
    {
      data: config.data ?? sampleData,
      children: config.children,
      layout: config.layout,
      width: config.width ?? 700,
      height: config.height ?? 433,
      responsive: config.responsive ?? true,
      margin: config.margin,
      accessibilityLayer: true,
      title: id.replaceAll('-', ' '),
      activeIndex: Option.match(model.chartHover, {
        onNone: () => null,
        onSome: (hover) => (hover.example === id ? hover.index : null),
      }),
      onActiveIndexChange: (index) => Message.ChartHovered({ example: id, index }),
    },
    h,
  )
