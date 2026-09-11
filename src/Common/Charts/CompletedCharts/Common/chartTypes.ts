/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Shared type definitions used across all chart components.
 */

export type ChartData = {
  name: string;
  [key: string]: number | string;
};

export type LegendValue = {
  label: string;
  field: string;
  color: string;
  type?: string;
  users?: number | string;
};

export type BreadcrumbItem = {
  id: string;
  name: string;
  level: number;
};

export type ChartType =
  | "BAR"
  | "SAMPLECHART"
  | "AREA"
  | "SIMPLE_HORIZONTAL_BAR"
  | "HORIZONTAL_BAR"
  | "PIE"
  | "RING"
  | "RAG"
  | "HEATMAP"
  | "LINE"
  | "SPLINE"
  | "SPARKLINE"
  | "HISTOGRAM"
  | "COLUMN"
  | "RIBBON"
  | "MATRIXTABLE"
  | "MARIMEKKO"
  | "GAUGE"
  | "BUBBLE"
  | "CALENDAR_HEATMAP"
  | "FUNNEL"
  | "RADAR"
  | "SCATTER"
  | "TREEMAP"
  | "PARETO"
  | "BULLET"
  | "COMBO"
  | "WATERFALL"
  | "LOGARITHM"
  | "CANDLESTICK"
  | "RETENTION"
  | "BOX_WHISKER"
  | "POLAR_AREA"
  | "TABLE"
  | "GEOGRAPHY_GRAPH"
  | "DECOMPOSITION_TREE";

/** Common prop shape shared by all chart components */
export type BaseChartProps = {
  widgetTitle?: string;
  groupTitle?: string;
  xAxisValues?: string[];
  yAxisValues?: string[];
  zAxisValues?: string[];
  legendValues?: LegendValue[];
  numOfLegendDataSet?: number;
  startingRange?: number;
  endingRange?: number;
  onToggleWidget?: () => void;
  onDelete?: () => void;
  tierLevel?: number;
  chartId?: string;
  projectId?: string;
  isCreationMode?: boolean;
  allUploadedData?: any;
  isPreview?: boolean;
  breadcrumbPath?: BreadcrumbItem[];
  onNavigate?: (level: number) => void;
  widgets?: any[];
  preFetchedChildren?: any[];
  binCount?: number;
  showLegend?: boolean;
  showWidget?: boolean;
  categoryTitle?: string;
  chartHeight?: number;
  height?: any;
  width?: any;
  order?: any;
  xAxis?: any;
  yAxis?: any;
  zAxis?: any;
  isProgramBuilder?: boolean;
  isValueDetectOn?: boolean;
  isValueDetection?: boolean;
  isStacked?: boolean;
  isMultiAxis?: boolean;
};

export type TierChart = {
  id: string;
  name: string;
  xAxisValues: string[];
  legendValues: LegendValue[];
  children: TierChart[];
};
