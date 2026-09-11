import { ElementType } from "react";
import { lazyWithRetry } from "@/utils/lazyWithRetry";

export interface ChartRegistryItem {
  name: string;
  component: ElementType;
  /** Override the default creation-mode height (default: 450) */
  defaultHeight?: number;
  className?: string;
}

// Lazy components
export const DoughnutChart = lazyWithRetry(
  () => import("@/Common/Charts/DoughnutChart"),
);
export const HeatmapChart = lazyWithRetry(() => import("@/Common/Charts/HeatmapChart"));
export const RadarCharts = lazyWithRetry(
  () => import("@/Common/Charts/CompletedCharts/Radar/RadarChart"),
);
export const ProjectStats = lazyWithRetry(
  () => import("./ProjectStats"),
);
export const DefaultChartData = lazyWithRetry(() => import("./DefaultChartData"));
export const KpiModule = lazyWithRetry(
  () => import("./KpiModule"),
);
export const TreemapChart = lazyWithRetry(
  () => import("@/Common/Charts/CompletedCharts/TreeMap/TreemapChart"),
);
export const FilesPreview = lazyWithRetry(() => import("../../../../Common/Charts/CompletedCharts/MediaWidget/FilesPreview"));

export const CHART_REGISTRY: Record<string, ChartRegistryItem> = {
  kpi: {
    name: "KPI",
    component: lazyWithRetry(
      () => import("./KpiModule"),
    ),
  },
  "bar-chart": {
    name: "Bar Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/SampleBarChart/SampleBarChartModule"),
    ),
  },
  "sample-bar-chart": {
    name: "Samplebar Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/SampleBarChart/SampleBarChartModule"),
    ),
  },
  "stacked-bar-chart": {
    name: "Stacked Bar Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/StackedBarChart/StackedBarChartModule"),
    ),
  },
  "progress-ring": {
    name: "Progress Ring",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/ProgressRing/ProgressRingModule"),
    ),
  },
  "pie-chart": {
    name: "Pie Chart",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/PieChart/PieChartModule"),
    ),
  },
  "line-chart": {
    name: "Line Chart",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/LineChart/LineChartModule"),
    ),
  },
  "multi-axis-line-chart": {
    name: "Multiaxis Line Chart",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/LineChart/LineChartModule"),
    ),
  },
  "horizontal-bar-chart": {
    name: "Horizontal Bar Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/HorizontalBarChart/HorizontalBarChartModule"),
    ),
    defaultHeight: 500,
  },
  "horizontal-stacked-bar-chart": {
    name: "Horizontal Stacked Bar Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/HorizontalBarChart/HorizontalBarChartModule"),
    ),
    defaultHeight: 500,
  },
  "area-chart": {
    name: "Area Chart",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/AreaChart/AreaChartModule"),
    ),
  },
  "heat-map-chart": {
    name: "Heat Map Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/HeatMap/HeatmapChartModule"),
    ),
  },
  "spline-area-chart": {
    name: "Spline Area Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/SplineAreaChart/SplineAreaChartModule"),
    ),
    defaultHeight: 500,
  },
  "column-chart": {
    name: "Column Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/ColumnChart/ColumnBarChartModule"),
    ),
  },
  "sparklines-chart": {
    name: "Sparklines Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/Sparkline/SparkLineChartModule"),
    ),
  },
  "logarithmic-chart": {
    name: "Logarithmic Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/Logarithmic/LogarithmicChartModule"),
    ),
  },
  "decomposition-tree": {
    name: "Decomposition Tree",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/DecompositionTree/DecompositionTreeModule"),
    ),
    defaultHeight: 700,
  },
  "gauge-chart": {
    name: "Gauge Chart",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/Gauge/GaugeChartModule"),
    ),
  },
  "histogram-chart": {
    name: "Histogram Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/Histogram/HistogramChartModule"),
    ),
  },
  "bubble-chart": {
    name: "Bubble Chart",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/Bubble/BubbleChartModule"),
    ),
  },

  "funnel-chart": {
    name: "Funnel Chart",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/Funnel/FunnelChartModule"),
    ),
    defaultHeight: 500,
  },
  "scatter-chart": {
    name: "Scatter Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/Scatter/ScatterChartModule"),
    ),
  },
  "pareto-chart": {
    name: "Pareto Chart",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/Pareto/ParetoChartModule"),
    ),
  },
  "waterfall-chart": {
    name: "Waterfall Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/Waterfall/WaterfallChartModule"),
    ),
  },
  "radar-chart": {
    name: "Radar Chart",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/Radar/RadarChartModule"),
    ),
  },
  "candle-chart": {
    name: "Candle Chart",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/Candle/CandleChartModule"),
    ),
  },
  "treemap-chart": {
    name: "Treemap Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/TreeMap/TreemapChartModule"),
    ),
  },
  "calendar-heatmap-chart": {
    name: "Calendar Heatmap",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/CalendarHeatMap/CalendarHeatmapModule"),
    ),
  },
  "gantt-new-chart": {
    name: "Gantt Chart",
    component: lazyWithRetry(
      () =>
        import("./GanttChartNewModule"),
    ),
  },
  "matrix-table-chart": {
    name: "Matrix Table",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/MatrixTable/MatrixTableChartModule"),
    ),
  },
  "combo-chart": {
    name: "Combo Chart",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/Combo/ComboChartModule"),
    ),
  },
  "bullet-chart": {
    name: "Bullet Chart",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/Bullet/BulletChartModule"),
    ),
  },
  "marimekko-chart": {
    name: "Marimekko Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/Marimekko/MarimekkoChartModule"),
    ),
  },
  "box-plot": {
    name: "Box Plot",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/BoxWhiskerplot/BoxPlotChartModule"),
    ),
  },
  "cohort-analysis": {
    name: "Cohort Analysis",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/Cohort/CohortAnalysisModule"),
    ),
  },
  "geographic-map": {
    name: "Geographic Map",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/GeographicMap/GeographicMapModule"),
    ),
    defaultHeight: 650,
  },
  "rag-chart": {
    name: "RAG Chart",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/Rag/RagChartModule"),
    ),
    defaultHeight: 550,
  },
  "ribbon-chart": {
    name: "Ribbon Chart",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/Ribbon/RibbonChartModule"),
    ),
  },
  "project-information": {
    name: "Project Information",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/ProjectInformation/ProjectInformationModule"),
    ),
    className: "border! border-gray-200! dark:border-slate-800!",
  },
  "data-table": {
    name: "Data Table",
    component: lazyWithRetry(
      () => import("@/Common/Charts/CompletedCharts/DataTable/DataTableModule"),
    ),
  },
  "polar-area-chart": {
    name: "Polar Area Chart",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/PolarArea/PolarAreaChartModule"),
    ),
  },
  "media-widget": {
    name: "Photo and Video",
    component: lazyWithRetry(
      () =>
        import("@/Common/Charts/CompletedCharts/MediaWidget/MediaWidgetModule"),
    ),
    defaultHeight: 760,
  },
  "files-preview": {
    name: "Files Preview",
    component: FilesPreview,
    defaultHeight: 400,
  },
};

