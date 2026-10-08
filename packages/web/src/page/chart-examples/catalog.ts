/** Example index captured from https://recharts.github.io/en-US/examples/ .
 * Source modules are Foldkit adaptations, with unsupported upstream behavior labeled. */
export type ChartExample = Readonly<{
  id: string
  file: string
  title: string
  upstream?: string
  adaptation?: string
}>
const catalog = {
  'line-chart': [
    {
      id: 'line/simple',
      file: 'line/simple',
      title: 'Simple Line Chart',
      upstream: 'SimpleLineChart',
    },
    {
      id: 'line/dashed',
      file: 'line/dashed',
      title: 'Dashed Line Chart',
      upstream: 'DashedLineChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/vertical',
      file: 'line/vertical',
      title: 'Vertical Line Chart',
      upstream: 'VerticalLineChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/BiaxialLineChart',
      file: 'line/BiaxialLineChart',
      title: 'Biaxial Line Chart',
      upstream: 'BiaxialLineChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/VerticalLineChartWithSpecifiedDomain',
      file: 'line/VerticalLineChartWithSpecifiedDomain',
      title: 'Vertical Line Chart With Specified Domain',
      upstream: 'VerticalLineChartWithSpecifiedDomain',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/connect-nulls',
      file: 'line/connect-nulls',
      title: 'Line Chart Connect Nulls',
      upstream: 'LineChartConnectNulls',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/LineChartWithXAxisPadding',
      file: 'line/LineChartWithXAxisPadding',
      title: 'Line Chart With X Axis Padding',
      upstream: 'LineChartWithXAxisPadding',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/reference-lines',
      file: 'line/reference-lines',
      title: 'Line Chart With Reference Lines',
      upstream: 'LineChartWithReferenceLines',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/CustomizedDotLineChart',
      file: 'line/CustomizedDotLineChart',
      title: 'Customized Dot Line Chart',
      upstream: 'CustomizedDotLineChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/CustomizedLabelLineChart',
      file: 'line/CustomizedLabelLineChart',
      title: 'Customized Label Line Chart',
      upstream: 'CustomizedLabelLineChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/SynchronizedLineChart',
      file: 'line/SynchronizedLineChart',
      title: 'Synchronized Line Chart',
      upstream: 'SynchronizedLineChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/SynchronizedDifferentData',
      file: 'line/SynchronizedDifferentData',
      title: 'Synchronized Charts With Different Data',
      upstream: 'SynchronizedDifferentData',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/LineChartCustomShapeExample',
      file: 'line/LineChartCustomShapeExample',
      title: 'Line that animates opacity',
      upstream: 'LineChartCustomShapeExample',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/HighlightAndZoomLineChart',
      file: 'line/HighlightAndZoomLineChart',
      title: 'Highlight And Zoom Line Chart',
      upstream: 'HighlightAndZoomLineChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/multi-series',
      file: 'line/multi-series',
      title: 'Line Chart Has Multi Series',
      upstream: 'LineChartHasMultiSeries',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/LineChartAxisInterval',
      file: 'line/LineChartAxisInterval',
      title: 'Line Chart Axis Interval',
      upstream: 'LineChartAxisInterval',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/LineChartNegativeValuesWithReferenceLines',
      file: 'line/LineChartNegativeValuesWithReferenceLines',
      title: 'Line Chart Negative Values With Reference Lines',
      upstream: 'LineChartNegativeValuesWithReferenceLines',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/CompareTwoLines',
      file: 'line/CompareTwoLines',
      title: 'Compare Two Lines',
      upstream: 'CompareTwoLines',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/DynamicZIndexLineChart',
      file: 'line/DynamicZIndexLineChart',
      title: 'Dynamic Z-Index Line Chart',
      upstream: 'DynamicZIndexLineChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'line/TinyLineChart',
      file: 'line/TinyLineChart',
      title: 'Tiny Line Chart',
      upstream: 'TinyLineChart',
    },
    {
      id: 'line/AnimatedTimeSeriesExample',
      file: 'line/AnimatedTimeSeriesExample',
      title: 'Animated Time Series',
      upstream: 'AnimatedTimeSeriesExample',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
  ],
  'area-chart': [
    {
      id: 'area-chart/AreaChartExample',
      file: 'area-chart/AreaChartExample',
      title: 'Simple Area Chart',
      upstream: 'AreaChartExample',
    },
    {
      id: 'area-chart/StackedAreaChart',
      file: 'area-chart/StackedAreaChart',
      title: 'Stacked Area Chart',
      upstream: 'StackedAreaChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'area-chart/AreaChartRangeExample',
      file: 'area-chart/AreaChartRangeExample',
      title: 'Ranged Area Chart',
      upstream: 'AreaChartRangeExample',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'area-chart/AreaChartConnectNulls',
      file: 'area-chart/AreaChartConnectNulls',
      title: 'Area Chart Connect Nulls',
      upstream: 'AreaChartConnectNulls',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'area-chart/CardinalAreaChart',
      file: 'area-chart/CardinalAreaChart',
      title: 'Cardinal Area Chart',
      upstream: 'CardinalAreaChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'area-chart/PercentAreaChart',
      file: 'area-chart/PercentAreaChart',
      title: 'Percent Area Chart',
      upstream: 'PercentAreaChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'area-chart/SynchronizedAreaChart',
      file: 'area-chart/SynchronizedAreaChart',
      title: 'Synchronized Area Chart',
      upstream: 'SynchronizedAreaChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'area-chart/TinyAreaChart',
      file: 'area-chart/TinyAreaChart',
      title: 'Tiny Area Chart',
      upstream: 'TinyAreaChart',
    },
    {
      id: 'area-chart/AreaChartFillByValue',
      file: 'area-chart/AreaChartFillByValue',
      title: 'Area Chart Fill By Value',
      upstream: 'AreaChartFillByValue',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'area-chart/AreaChartCustomAnimation',
      file: 'area-chart/AreaChartCustomAnimation',
      title: 'Custom Animation Example',
      upstream: 'AreaChartCustomAnimation',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'area-chart/RangeAreaChartCustomAnimation',
      file: 'area-chart/RangeAreaChartCustomAnimation',
      title: 'Range Area Custom Animation',
      upstream: 'RangeAreaChartCustomAnimation',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'area-chart/AreaChartWithCustomEvents',
      file: 'area-chart/AreaChartWithCustomEvents',
      title: 'Area Chart With Custom Events',
      upstream: 'AreaChartWithCustomEvents',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'area-chart/PreventRightClickExample',
      file: 'area-chart/PreventRightClickExample',
      title: 'Prevent right click menu',
      upstream: 'PreventRightClickExample',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
  ],
  'bar-chart': [
    {
      id: 'bar-chart/SimpleBarChart',
      file: 'bar-chart/SimpleBarChart',
      title: 'Simple Bar Chart',
      upstream: 'SimpleBarChart',
    },
    {
      id: 'bar-chart/StackedBarChart',
      file: 'bar-chart/StackedBarChart',
      title: 'Stacked Bar Chart',
      upstream: 'StackedBarChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/PopulationPyramid',
      file: 'bar-chart/PopulationPyramid',
      title: 'Population Pyramid',
      upstream: 'PopulationPyramid',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/TimelineExample',
      file: 'bar-chart/TimelineExample',
      title: 'Timeline',
      upstream: 'TimelineExample',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/Candlestick',
      file: 'bar-chart/Candlestick',
      title: 'Candlestick',
      upstream: 'Candlestick',
    },
    {
      id: 'bar-chart/BoxPlot',
      file: 'bar-chart/BoxPlot',
      title: 'Box Plot',
      upstream: 'BoxPlot',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/AnimatedBarWidthExample',
      file: 'bar-chart/AnimatedBarWidthExample',
      title: 'Animated Bar Width',
      upstream: 'AnimatedBarWidthExample',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/Waterfall',
      file: 'bar-chart/Waterfall',
      title: 'Waterfall',
      upstream: 'Waterfall',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/AnimatedBarTimeSeriesExample',
      file: 'bar-chart/AnimatedBarTimeSeriesExample',
      title: 'Animated Bar series',
      upstream: 'AnimatedBarTimeSeriesExample',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/MixBarChart',
      file: 'bar-chart/MixBarChart',
      title: 'Mix Bar Chart',
      upstream: 'MixBarChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/CustomShapeBarChart',
      file: 'bar-chart/CustomShapeBarChart',
      title: 'Custom Shape Bar Chart',
      upstream: 'CustomShapeBarChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/PositiveAndNegativeBarChart',
      file: 'bar-chart/PositiveAndNegativeBarChart',
      title: 'Positive and Negative Bar Chart',
      upstream: 'PositiveAndNegativeBarChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/BrushBarChart',
      file: 'bar-chart/BrushBarChart',
      title: 'Brush Bar Chart',
      upstream: 'BrushBarChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/BarChartWithCustomizedEvent',
      file: 'bar-chart/BarChartWithCustomizedEvent',
      title: 'Bar Chart With Customized Event',
      upstream: 'BarChartWithCustomizedEvent',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/BarChartWithMinHeight',
      file: 'bar-chart/BarChartWithMinHeight',
      title: 'Bar Chart With Min Height',
      upstream: 'BarChartWithMinHeight',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/BarChartStackedBySign',
      file: 'bar-chart/BarChartStackedBySign',
      title: 'Bar Chart Stacked By Sign',
      upstream: 'BarChartStackedBySign',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/BiaxialBarChart',
      file: 'bar-chart/BiaxialBarChart',
      title: 'Biaxial Bar Chart',
      upstream: 'BiaxialBarChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/BarChartHasBackground',
      file: 'bar-chart/BarChartHasBackground',
      title: 'Bar Chart with background',
      upstream: 'BarChartHasBackground',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/BarChartWithMultiXAxis',
      file: 'bar-chart/BarChartWithMultiXAxis',
      title: 'Bar Chart With Multi X Axis',
      upstream: 'BarChartWithMultiXAxis',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/RangedStackedBarChart',
      file: 'bar-chart/RangedStackedBarChart',
      title: 'Ranged Stacked Bar Chart',
      upstream: 'RangedStackedBarChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/BarChartRangeExample',
      file: 'bar-chart/BarChartRangeExample',
      title: 'Ranged Bar Chart',
      upstream: 'BarChartRangeExample',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/TinyBarChart',
      file: 'bar-chart/TinyBarChart',
      title: 'Tiny Bar Chart',
      upstream: 'TinyBarChart',
    },
    {
      id: 'bar-chart/ScrollAnimateBarChart',
      file: 'bar-chart/ScrollAnimateBarChart',
      title: 'Animate by Scroll',
      upstream: 'ScrollAnimateBarChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'bar-chart/StackedBarChartWithHorizontalLine',
      file: 'bar-chart/StackedBarChartWithHorizontalLine',
      title: 'Stacked Bar Chart with Horizontal Line',
      upstream: 'StackedBarChartWithHorizontalLine',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
  ],
  'composed-chart': [
    {
      id: 'composed-chart/LineBarAreaComposedChart',
      file: 'composed-chart/LineBarAreaComposedChart',
      title: 'Line Bar Area Composed Chart',
      upstream: 'LineBarAreaComposedChart',
    },
    {
      id: 'composed-chart/SameDataComposedChart',
      file: 'composed-chart/SameDataComposedChart',
      title: 'Same Data Composed Chart',
      upstream: 'SameDataComposedChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'composed-chart/VerticalComposedChart',
      file: 'composed-chart/VerticalComposedChart',
      title: 'Vertical Composed Chart',
      upstream: 'VerticalComposedChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'composed-chart/ComposedChartWithAxisLabels',
      file: 'composed-chart/ComposedChartWithAxisLabels',
      title: 'Composed Chart With Axis Labels',
      upstream: 'ComposedChartWithAxisLabels',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'composed-chart/ScatterAndLineOfBestFit',
      file: 'composed-chart/ScatterAndLineOfBestFit',
      title: 'Scatter And Line Of Best Fit',
      upstream: 'ScatterAndLineOfBestFit',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'composed-chart/BandedChart',
      file: 'composed-chart/BandedChart',
      title: 'Banded Chart',
      upstream: 'BandedChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'composed-chart/TargetPriceChart',
      file: 'composed-chart/TargetPriceChart',
      title: 'Target Price Chart with active Label',
      upstream: 'TargetPriceChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
  ],
  'scatter-chart': [
    {
      id: 'scatter-chart/SimpleScatterChart',
      file: 'scatter-chart/SimpleScatterChart',
      title: 'Simple Scatter Chart',
      upstream: 'SimpleScatterChart',
    },
    {
      id: 'scatter-chart/ThreeDimScatterChart',
      file: 'scatter-chart/ThreeDimScatterChart',
      title: 'Three Dim Scatter Chart',
      upstream: 'ThreeDimScatterChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'scatter-chart/JointLineScatterChart',
      file: 'scatter-chart/JointLineScatterChart',
      title: 'Joint Line Scatter Chart',
      upstream: 'JointLineScatterChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'scatter-chart/BubbleChart',
      file: 'scatter-chart/BubbleChart',
      title: 'Bubble Chart',
      upstream: 'BubbleChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'scatter-chart/CustomAnimation',
      file: 'scatter-chart/CustomAnimation',
      title: 'Custom Animation',
      upstream: 'CustomAnimation',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'scatter-chart/ScatterChartWithLabels',
      file: 'scatter-chart/ScatterChartWithLabels',
      title: 'Scatter Chart With Labels',
      upstream: 'ScatterChartWithLabels',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'scatter-chart/MultipleYAxesScatterChart',
      file: 'scatter-chart/MultipleYAxesScatterChart',
      title: 'Multiple Y Axes Scatter Chart',
      upstream: 'MultipleYAxesScatterChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'scatter-chart/ScatterChartWithCells',
      file: 'scatter-chart/ScatterChartWithCells',
      title: 'Scatter Chart With Cells',
      upstream: 'ScatterChartWithCells',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'scatter-chart/ScatterChartPerformance',
      file: 'scatter-chart/ScatterChartPerformance',
      title: 'Scatter Chart with many points (performance test)',
      upstream: 'ScatterChartPerformance',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
  ],
  'pie-chart': [
    {
      id: 'pie-chart/TwoLevelPieChart',
      file: 'pie-chart/TwoLevelPieChart',
      title: 'Two Level Pie Chart',
      upstream: 'TwoLevelPieChart',
    },
    {
      id: 'pie-chart/StraightAnglePieChart',
      file: 'pie-chart/StraightAnglePieChart',
      title: 'Straight Angle Pie Chart',
      upstream: 'StraightAnglePieChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'pie-chart/CustomActiveShapePieChart',
      file: 'pie-chart/CustomActiveShapePieChart',
      title: 'Custom Active Shape Pie Chart',
      upstream: 'CustomActiveShapePieChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'pie-chart/PieChartWithCustomizedLabel',
      file: 'pie-chart/PieChartWithCustomizedLabel',
      title: 'Pie Chart With Customized Label',
      upstream: 'PieChartWithCustomizedLabel',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'pie-chart/PieChartWithPaddingAngle',
      file: 'pie-chart/PieChartWithPaddingAngle',
      title: 'Pie Chart with gap and rounded corners',
      upstream: 'PieChartWithPaddingAngle',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'pie-chart/PieChartWithNeedle',
      file: 'pie-chart/PieChartWithNeedle',
      title: 'Pie Chart With Needle',
      upstream: 'PieChartWithNeedle',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'pie-chart/PieChartInFlexbox',
      file: 'pie-chart/PieChartInFlexbox',
      title: 'Pie Chart in Flexbox',
      upstream: 'PieChartInFlexbox',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'pie-chart/PieChartInGrid',
      file: 'pie-chart/PieChartInGrid',
      title: 'Pie Chart in Grid',
      upstream: 'PieChartInGrid',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'pie-chart/PieWithGradient',
      file: 'pie-chart/PieWithGradient',
      title: 'Pie Chart with Gradient',
      upstream: 'PieWithGradient',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
  ],
  'radar-chart': [
    {
      id: 'radar-chart/SimpleRadarChart',
      file: 'radar-chart/SimpleRadarChart',
      title: 'Simple Radar Chart',
      upstream: 'SimpleRadarChart',
    },
    {
      id: 'radar-chart/SpecifiedDomainRadarChart',
      file: 'radar-chart/SpecifiedDomainRadarChart',
      title: 'Specified Domain Radar Chart',
      upstream: 'SpecifiedDomainRadarChart',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'radar-chart/RangeRadarChartCustomAnimation',
      file: 'radar-chart/RangeRadarChartCustomAnimation',
      title: 'Range Radar Custom Animation',
      upstream: 'RangeRadarChartCustomAnimation',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
  ],
  'radial-bar-chart': [
    {
      id: 'radial-bar-chart/SimpleRadialBarChart',
      file: 'radial-bar-chart/SimpleRadialBarChart',
      title: 'Simple Radial Bar Chart',
      upstream: 'SimpleRadialBarChart',
    },
    {
      id: 'radial-bar-chart/RadialBarChartClickToFocusLegendExample',
      file: 'radial-bar-chart/RadialBarChartClickToFocusLegendExample',
      title: 'Radial Bar Chart with Click to Focus Legend',
      upstream: 'RadialBarChartClickToFocusLegendExample',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
  ],
  treemap: [
    {
      id: 'treemap/BundleSizeTreemap',
      file: 'treemap/BundleSizeTreemap',
      title: 'Bundle Size Treemap',
      upstream: 'BundleSizeTreemap',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'treemap/SimpleTreemap',
      file: 'treemap/SimpleTreemap',
      title: 'Simple Treemap',
      upstream: 'SimpleTreemap',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'treemap/CustomContentTreemap',
      file: 'treemap/CustomContentTreemap',
      title: 'Custom Content Treemap',
      upstream: 'CustomContentTreemap',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'treemap/NestedTreemap',
      file: 'treemap/NestedTreemap',
      title: 'Nested Treemap',
      upstream: 'NestedTreemap',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'treemap/TreemapWithPaddingAndGaps',
      file: 'treemap/TreemapWithPaddingAndGaps',
      title: 'Treemap with Padding and Gaps',
      upstream: 'TreemapWithPaddingAndGaps',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
  ],
  'sunburst-chart': [
    {
      id: 'sunburst-chart/BundleSizeSunburst',
      file: 'sunburst-chart/BundleSizeSunburst',
      title: 'Bundle Size Sunburst',
      upstream: 'BundleSizeSunburst',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
    {
      id: 'sunburst-chart/SunburstChartExample',
      file: 'sunburst-chart/SunburstChartExample',
      title: 'Sunburst Chart Example',
      upstream: 'SunburstChartExample',
      adaptation:
        'Source data is ported. Visual details or interactions may still differ from Recharts.',
    },
  ],
  'funnel-chart': [
    {
      id: 'funnel-chart/simple',
      file: 'funnel-chart/simple',
      title: 'Simple Funnel Chart',
    },
  ],
  sankey: [
    {
      id: 'sankey/simple',
      file: 'sankey/simple',
      title: 'Simple Sankey Diagram',
    },
  ],
} as const satisfies Readonly<Record<string, ReadonlyArray<ChartExample>>>
export const EXAMPLES_BY_CHART: ReadonlyMap<string, ReadonlyArray<ChartExample>> = new Map(
  Object.entries(catalog),
)
export const examplesFor = (chart: string): ReadonlyArray<ChartExample> =>
  EXAMPLES_BY_CHART.get(chart) ?? []
export const firstExampleIds: ReadonlySet<string> = new Set(
  Object.values(catalog).map((examples) => examples[0].id),
)
