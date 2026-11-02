/** Foldkit adaptation of the Recharts Population Pyramid example.
 * Age groups, counts, and signed percentages follow the source CSV. */
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Model } from '../../../model'
import type { Message } from '../../../message'
import {
  Bar,
  BarChart,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from '../../../generated/registry/ui/bar-chart'

const rawData = [
  {
    age: '100+',
    male: 110838,
    female: 476160,
  },
  {
    age: '95-99',
    male: 1141691,
    female: 3389124,
  },
  {
    age: '90-94',
    male: 6038458,
    female: 13078242,
  },
  {
    age: '85-89',
    male: 18342182,
    female: 31348041,
  },
  {
    age: '80-84',
    male: 37166893,
    female: 53013079,
  },
  {
    age: '75-79',
    male: 65570812,
    female: 83217973,
  },
  {
    age: '70-74',
    male: 103998992,
    female: 124048996,
  },
  {
    age: '65-69',
    male: 138182244,
    female: 154357035,
  },
  {
    age: '60-64',
    male: 170525048,
    female: 180992721,
  },
  {
    age: '55-59',
    male: 206686596,
    female: 212285997,
  },
  {
    age: '50-54',
    male: 231342779,
    female: 232097236,
  },
  {
    age: '45-49',
    male: 240153677,
    female: 236696232,
  },
  {
    age: '40-44',
    male: 270991534,
    female: 263180352,
  },
  {
    age: '35-39',
    male: 301744799,
    female: 289424003,
  },
  {
    age: '30-34',
    male: 310384416,
    female: 294303405,
  },
  {
    age: '25-29',
    male: 308889349,
    female: 291429439,
  },
  {
    age: '20-24',
    male: 318912554,
    female: 300510028,
  },
  {
    age: '15-19',
    male: 335882343,
    female: 315258559,
  },
  {
    age: '10-14',
    male: 353666705,
    female: 331681954,
  },
  {
    age: '5-9',
    male: 351991008,
    female: 332121131,
  },
  {
    age: '0-4',
    male: 331889289,
    female: 315450649,
  },
]
const totalPopulation = rawData.reduce((sum, entry) => sum + entry.male + entry.female, 0)
const percentageData = rawData.map((entry) => ({
  age: entry.age,
  male: (entry.male / totalPopulation) * -100,
  female: (entry.female / totalPopulation) * 100,
}))
const formatPercent = (value: number | string): string => `${Math.abs(Number(value)).toFixed(1)}%`

export default (_model: Model, h: HtmlBuilder<Message>): Html =>
  BarChart(
    {
      data: percentageData,
      layout: 'vertical',
      width: 700,
      height: 504,
      responsive: true,
      barCategoryGap: 1,
      children: [
        XAxis({
          type: 'number',
          domain: [-10, 10],
          tickFormatter: formatPercent,
          label: { value: '% of total population', position: 'insideBottom' },
        }),
        YAxis({
          type: 'category',
          dataKey: 'age',
          interval: 1,
          label: { value: 'Age group', angle: -90, position: 'insideLeft', offset: 10 },
        }),
        Bar({
          dataKey: 'female',
          name: 'Female',
          stackId: 'age',
          fill: '#ed7485',
          radius: [0, 5, 5, 0],
          label: 'right',
          labelFormatter: formatPercent,
        }),
        Bar({
          dataKey: 'male',
          name: 'Male',
          stackId: 'age',
          fill: '#6ea1c7',
          radius: [0, 5, 5, 0],
          label: 'right',
          labelFormatter: formatPercent,
        }),
        Tooltip(),
        Legend({
          position: 'insideTopRight',
          itemSorter: (a, b) => (a === 'Male' ? -1 : b === 'Male' ? 1 : 0),
        }),
      ],
      title: 'Population Pyramid',
    },
    h,
  )
