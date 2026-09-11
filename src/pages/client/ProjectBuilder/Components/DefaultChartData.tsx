import { lazyWithRetry } from "@/utils/lazyWithRetry";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
const StackedBarChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/StackedBarChart/StackedBarChart"));
const HorizontalBarChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/HorizontalBarChart/HorizontalBarChart"));
const LineChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/LineChart/LineChart"));
const HeatmapChartNew = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/HeatMap/HeatmapChartNew"));
const PieChartWidget = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/PieChart/PieChart"));
const ProgressRing = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/ProgressRing/ProgressRing"));
const RagChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Rag/RagChart"));
const ColumnBarChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/ColumnChart/ColumnBarChart"));
const RadarChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Radar/RadarChart"));
const DoughnutChart = lazyWithRetry(() => import("@/Common/Charts/DoughnutChart"));
const AreaChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/AreaChart/AreaChart"));
const ParetoChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Pareto/ParetoChart"));
const HistogramChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Histogram/HistogramChart"));
const ScatterChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Scatter/ScatterChart"));
const GaugeChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Gauge/GaugeChart"));
const FunnelChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Funnel/FunnelChart"));
const WaterfallChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Waterfall/WaterfallChart"));
const ComboChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Combo/ComboChart"));
const LogarithmicChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Logarithmic/LogarithmicChart"));
const CandleChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Candle/CandleChart"));
const BubbleChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Bubble/BubbleChart"));
const CalendarHeatmapChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/CalendarHeatMap/CalendarHeatmapChart"));
const TreemapChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/TreeMap/TreemapChart"));
const BulletChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Bullet/BulletChart"));
const CohortAnalysisChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Cohort/CohortAnalysisChart"));
const BoxPlotChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/BoxWhiskerplot/BoxPlotChart"));
const PolarAreaChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/PolarArea/PolarAreaChart"));
const GeographicMapChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/GeographicMap/GeographicMapChart"));
const DecompositionTreeChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/DecompositionTree/DecompositionTreeChart"));
import { chartTypes } from "@/Common/Charts/CompletedCharts/Common/ChartCategory";

import SplineAreaChart from "@/Common/Charts/CompletedCharts/SplineAreaChart/SplineAreaChart";
import SparkLinesChart from "@/Common/Charts/CompletedCharts/Sparkline/SparkLinesChart";
const MediaWidgetModule = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/MediaWidget/MediaWidgetModule"));
const FilesPreview = lazyWithRetry(() => import("../../../../Common/Charts/CompletedCharts/MediaWidget/FilesPreview"));

import {
  parseCommonChartData,
  getEffectiveLegendValues,
  getSafeRanges,
  sanitizeSheetName,
  parseBulletChartData,
  parseGeographicMapData,
} from "@/Common/Charts/CompletedCharts/Common/chartUtils";
import { parsePieChartData } from "@/utils/parsePieChartData";
import MatrixTableChart from "@/Common/Charts/CompletedCharts/MatrixTable/MatrixTableChart";
import RibbonChart from "@/Common/Charts/CompletedCharts/Ribbon/RibbonChart";
const MarimekkoChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Marimekko/MarimekkoChart"));
import DataTableChart from "@/Common/Charts/CompletedCharts/DataTable/DataTableChart";

const PIE_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#6366f1", // Indigo
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#64748b", // Slate
];

const isXAxisHeaderRow = (row: any[]): boolean => {
  if (!Array.isArray(row) || row.length < 2) return false;
  const dataCols = row.slice(1);
  return dataCols.every(
    (v) => typeof v === "string" && v.trim() !== "" && isNaN(Number(v)),
  );
};

const extractLegendsFromXAxis = (xAxisData: any) => {
  if (!xAxisData) return [];
  try {
    const parsed =
      typeof xAxisData === "string" ? JSON.parse(xAxisData) : xAxisData;
    const dataArr = Array.isArray(parsed) ? parsed : parsed?.labels || [];
    if (
      dataArr.length > 0 &&
      Array.isArray(dataArr[0]) &&
      dataArr[0].length > 1 &&
      (typeof dataArr[0][1] === "string" || isXAxisHeaderRow(dataArr[0]))
    ) {
      return dataArr[0].slice(1);
    }
  } catch {
    /* ignore */
  }
  return [];
};

const transformProgramBuilderData = (
  rawData: any,
  legendValues: any[],
  category?: string,
) => {
  if (!rawData || !legendValues || legendValues.length === 0) return rawData;

  let parsed = rawData;
  if (typeof rawData === "string") {
    try {
      parsed = JSON.parse(rawData);
    } catch {
      return rawData;
    }
  }

  if (!Array.isArray(parsed) || parsed.length < 2) return rawData;

  const header = parsed[0];
  // If it's already a multi-column format (more than 2 columns), it's likely already in standard format
  if (Array.isArray(header) && header.length > 2) return rawData;

  // Pie/Ring/Treemap should NOT be pivoted into a single row if they are already multi-row
  if (category === "PIE" || category === "RING" || category === "TREEMAP") {
    if (parsed.length > 1) return rawData;
  }

  // If it's the 2-column format (Label, Value), we pivot it to match the widgets
  // This is common for aggregated program builder metrics
  if (Array.isArray(header) && header.length === 2) {
    const dataRows = parsed.slice(1);
    const labelsInSource = dataRows.map((row) =>
      String(row[0] || "")
        .trim()
        .toLowerCase(),
    );
    const widgetLabels = legendValues.map((l) =>
      String(l.label || "")
        .trim()
        .toLowerCase(),
    );

    // If any data labels match our widget legends, we pivot everything into a single row
    // so that parseCommonChartData can map columns to legends correctly.
    const hasMatch = widgetLabels.some((wl) => labelsInSource.includes(wl));
    if (hasMatch) {
      const pivotedHeader = ["Label", ...legendValues.map((l) => l.label)];

      // For Bar/Horizontal Bar, we want each legend to be its own entry on the X/Y axis
      const isBarChart =
        category === "BAR" ||
        category === "SAMPLECHART" ||
        category === "HORIZONTAL_BAR" ||
        category === "SIMPLE_HORIZONTAL_BAR" ||
        category === "STACKED_BAR_HORIZONTAL" ||
        category === "STACK_BAR_HORIZONTAL" ||
        category === "COLUMN" ||
        category === "LINE" ||
        category === "AREA" ||
        category === "SPLINE";

      if (isBarChart) {
        const resultRows = legendValues.map((legend, idx) => {
          const legendLabel = String(legend.label || "")
            .trim()
            .toLowerCase();
          const match = dataRows.find(
            (row) =>
              String(row[0] || "")
                .trim()
                .toLowerCase() === legendLabel,
          );
          const value = match ? Number(match[1]) || 0 : 0;

          // Create a row where ONLY this legend's column has the value
          const row: (string | number)[] = [legend.label];
          legendValues.forEach((_, lIdx) => {
            row.push(lIdx === idx ? value : 0);
          });
          return row;
        });

        return [pivotedHeader, ...resultRows];
      }

      // Default: single row Total (original behavior)
      const pivotedDataRow: (string | number)[] = ["Total"];

      legendValues.forEach((legend) => {
        const legendLabel = String(legend.label || "")
          .trim()
          .toLowerCase();

        const sum = dataRows.reduce((acc, row) => {
          if (
            String(row[0] || "")
              .trim()
              .toLowerCase() === legendLabel
          ) {
            return acc + (Number(row[1]) || 0);
          }
          return acc;
        }, 0);

        pivotedDataRow.push(sum);
      });

      return [pivotedHeader, pivotedDataRow];
    }
  }

  return rawData;
};

export const renderChartContent = (item: any) => {
  const categoryKey = item.category?.toUpperCase();
  const chartProperty = chartTypes[categoryKey];

  const chartData =
    item.chartData ||
    (chartProperty && item[chartProperty] && (item[chartProperty].firstFieldDataset !== undefined || item[chartProperty].firstFiledDataset !== undefined)
      ? item[chartProperty]
      : (item.sampleChart || item.sampleBarChart || item));
  let xAxisData = item.valueDetection?.matching || item.xAxis;

  const isProgramBuilder = !!item.isProgramBuilder;

  // For Program Builder, handle specifically formatted valueDetection strings
  if (isProgramBuilder && typeof item.valueDetection === "string") {
    if (item.valueDetection.trim().startsWith("[")) {
      xAxisData = item.valueDetection;
    }
  }

  const extractVal = (obj: any, keys: string[]) => {
    if (!obj) return undefined;
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null) return Number(obj[k]);
    }
    return undefined;
  };

  const firstFieldKeys = ["firstFieldDataset", "firstFiledDataset"];
  const lastFieldKeys = ["lastFieldDataset", "lastFiledDAtaset"];

  const firstField =
    extractVal(item?.sampleChart, firstFieldKeys) ??
    extractVal(item?.sampleBarChart, firstFieldKeys) ??
    extractVal(item?.barChart, firstFieldKeys) ??
    extractVal(chartData, firstFieldKeys) ??
    extractVal(item, firstFieldKeys);

  const lastField =
    extractVal(item?.sampleChart, lastFieldKeys) ??
    extractVal(item?.sampleBarChart, lastFieldKeys) ??
    extractVal(item?.barChart, lastFieldKeys) ??
    extractVal(chartData, lastFieldKeys) ??
    extractVal(item, lastFieldKeys) ??
    100;

  const numDatasets = chartData?.numberOfDataset ?? item?.numberOfDataset ?? 1;
  const { safeStartingRange, safeEndingRange } = getSafeRanges(
    firstField,
    lastField,
  );
  let apiWidgets = chartData?.widgets;
  if (!apiWidgets || apiWidgets.length === 0) {
    apiWidgets = item?.widgets;
  }

  const extractedLegends = extractLegendsFromXAxis(xAxisData);
  let legendValues: any[] = [];

  if (
    extractedLegends.length > 0 &&
    [
      "AREA",
      "SPLINE",
      "HEATMAP",
      "BAR",
      "SAMPLECHART",
      "COLUMN",
      "LINE",
      "HORIZONTAL_BAR",
      "SIMPLE_HORIZONTAL_BAR",
      "HISTOGRAM",
      "RIBBON",
      "MATRIXTABLE",
      "SPARKLINE",
      "CANDLESTICK",
      "PARETO",
      "FUNNEL",
      "TREEMAP",
      "POLAR_AREA",
    ].includes(categoryKey)
  ) {
    legendValues = extractedLegends.map((label: string, idx: number) => {
      const field = label.toLowerCase().replace(/\s+/g, "");
      const matchedWidget = apiWidgets?.find(
        (w: any) => (w.legendName || w.label)?.trim().toLowerCase() === label.trim().toLowerCase()
      );
      return {
        label,
        field,
        color: matchedWidget?.color || ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
      };
    });
  } else {
    const rawLegendValues =
      apiWidgets?.map((w: any) => ({
        label: w.legendName || w.label,
        color: w.color,
        field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
      })) || [];
    legendValues = getEffectiveLegendValues(rawLegendValues, []);
  }

  if (
    legendValues.length === 0 &&
    (categoryKey === "PIE" || categoryKey === "RING")
  ) {
    try {
      const parsed =
        typeof xAxisData === "string" ? JSON.parse(xAxisData) : xAxisData;
      const dataArr = Array.isArray(parsed) ? parsed : parsed?.labels || [];

      if (dataArr.length > 0) {
        const header = dataArr[0];
        const dataRows = dataArr.slice(1);

        if (categoryKey === "RING" && header.length > 1) {
          legendValues = header.slice(1).map((lbl: any, idx: number) => ({
            label: String(lbl),
            color: PIE_COLORS[idx % PIE_COLORS.length],
            field: String(lbl || `slice${idx}`)
              .toLowerCase()
              .replace(/\s+/g, ""),
          }));
        } else if (dataRows.length > 0) {
          legendValues = dataRows.map((row: any, idx: number) => ({
            label: String(row[0] || `Slice ${idx + 1}`),
            color: PIE_COLORS[idx % PIE_COLORS.length],
            field: String(row[0] || `slice${idx}`)
              .toLowerCase()
              .replace(/\s+/g, ""),
          }));
        }
      }
    } catch {
      /* ignore */
    }
  }

  if (legendValues.length === 0) {
    legendValues = getEffectiveLegendValues([]);
  }

  // Final transformation for Program Builder to ensure data matches legends
  if (isProgramBuilder && xAxisData) {
    xAxisData = transformProgramBuilderData(
      xAxisData,
      legendValues,
      categoryKey,
    );
  }

  if (categoryKey === "PARETO" && legendValues.length === 0) {
    legendValues = getEffectiveLegendValues([
      { label: "Pareto", field: "pareto", color: "#4F81BC" },
    ]);
  }

  const { labels, data, categoryTitle } = parseCommonChartData(
    xAxisData,
    legendValues,
    item?.title || item?.name,
  );

  const commonProps = {
    widgetTitle: item?.title || item?.name,
    groupTitle: item?.grouptitle || item?.groupTitle,
    xAxisValues: labels,
    legendValues: legendValues,
    yAxis: item?.yAxis,
    startingRange: safeStartingRange,
    endingRange: safeEndingRange,
    chartId: item?.id,
    allUploadedData: data,
    categoryTitle: categoryTitle,
    projectId: item?.projectId,
    numOfLegendDataSet: numDatasets,
    xAxis: xAxisData,
    width: item?.width,
    height: item?.height,
    order: item?.order,
    chartHeight: item?.height || item?.chartHeight,
    isPreview: !!item?.isPreview,
    showLegend: item?.showWidget ?? true,
    isProgramBuilder: !!item?.isProgramBuilder,
    isValueDetectOn: !!chartData?.isValueDetectOn,
    isValueDetection: !!item?.valueDetection,
    preFetchedChildren: item?.children,
    // Derive binCount (bin width) from saved xAxis first data-row label, e.g. "0-50" → 50
    binCount: (() => {
      if (categoryKey !== "HISTOGRAM") return undefined;
      try {
        const parsed = typeof xAxisData === "string" ? JSON.parse(xAxisData) : xAxisData;
        const dataArr = Array.isArray(parsed) ? parsed : parsed?.labels || [];
        const firstDataRow = dataArr.length > 1 ? dataArr[1] : null;
        if (firstDataRow && typeof firstDataRow[0] === "string" && firstDataRow[0].includes("-")) {
          const parts = firstDataRow[0].split("-").map((v: string) => parseInt(v.trim(), 10));
          if (!isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] > parts[0]) {
            return parts[1] - parts[0];
          }
        }
      } catch {
        // fallback
      }
      return 10;
    })(),
  };

  const pieSheetName = sanitizeSheetName(item?.title || item?.name || "Sheet");
  const pieData =
    categoryKey === "PIE" ||
      categoryKey === "RING" ||
      categoryKey === "TREEMAP" ||
      categoryKey === "POLAR_AREA"
      ? parsePieChartData(xAxisData, legendValues)
      : [];
  const pieUploadedData =
    pieData.length > 0 ? { [pieSheetName]: pieData } : undefined;

  switch (categoryKey) {
    case "BAR":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <StackedBarChart {...commonProps} widgets={chartData?.widgets} />
        </Suspense>
      );
    case "SAMPLECHART":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <StackedBarChart {...commonProps} category="SAMPLECHART" widgets={chartData?.widgets} />
        </Suspense>
      );
    case "HORIZONTAL_BAR":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <HorizontalBarChart {...commonProps} widgets={chartData?.widgets} />
        </Suspense>
      );
    case "SIMPLE_HORIZONTAL_BAR":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <HorizontalBarChart
            {...commonProps}
            category="SIMPLE_HORIZONTAL_BAR"
            widgets={chartData?.widgets}
            isStacked={
              item?.isStacked !== undefined
                ? item.isStacked
                : (String(item?.id || "").toLowerCase().startsWith("horizontal-stacked-bar-chart") ||
                  String(item?.title || item?.name || "").toLowerCase().includes("stacked"))
            }
          />
        </Suspense>
      );
    case "LINE":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <LineChart {...commonProps} widgets={chartData?.widgets} />
        </Suspense>
      );
    case "HEATMAP":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <HeatmapChartNew {...commonProps} />
        </Suspense>
      );
    case "PIE":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <PieChartWidget {...commonProps} allUploadedData={pieUploadedData} />
        </Suspense>
      );
    case "RING":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <ProgressRing {...commonProps} allUploadedData={pieUploadedData} />
        </Suspense>
      );
    case "RAG":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <RagChart {...commonProps} />
        </Suspense>
      );
    case "COLUMN":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <ColumnBarChart {...commonProps} />
        </Suspense>
      );
    case "RADAR":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <RadarChart {...commonProps} />
        </Suspense>
      );
    case "TREEMAP":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <TreemapChart {...commonProps} allUploadedData={pieUploadedData} />
        </Suspense>
      );
    case "BULLET":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <BulletChart
            {...commonProps}
            allUploadedData={parseBulletChartData(xAxisData, legendValues)}
          />
        </Suspense>
      );
    case "DOUGHNUT":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <DoughnutChart
            title={item?.title || item?.name}
            data={legendValues.map((l: any) => ({
              name: l.label,
              color: l.color,
              value: 0,
              count: 0,
            }))}
            centerLabel="Total"
            allUploadedData={data}
          />
        </Suspense>
      );
    case "AREA":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <AreaChart {...commonProps} />
        </Suspense>
      );
    case "SPLINE":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <SplineAreaChart {...commonProps} />
        </Suspense>
      );
    case "PARETO":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <ParetoChart {...commonProps} />
        </Suspense>
      );
    case "HISTOGRAM":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <HistogramChart {...commonProps} />
        </Suspense>
      );
    case "SCATTER":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <ScatterChart {...commonProps} />
        </Suspense>
      );
    case "SOLID_GAUGE":
    case "GAUGE":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <GaugeChart {...commonProps} />
        </Suspense>
      );
    case "FUNNEL":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <FunnelChart {...commonProps} />
        </Suspense>
      );
    case "WATERFALL":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <WaterfallChart {...commonProps} />
        </Suspense>
      );
    case "STACKED_BAR_HORIZONTAL":
    case "STACK_BAR_HORIZONTAL":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <HorizontalBarChart {...commonProps} isStacked={true} />
        </Suspense>
      );
    case "MIXED":
    case "COMBO":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <ComboChart {...commonProps} />
        </Suspense>
      );
    case "CANDLESTICK":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <CandleChart {...commonProps} />
        </Suspense>
      );
    case "SPARKLINE":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <SparkLinesChart {...commonProps} />
        </Suspense>
      );
    case "RIBBON":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <RibbonChart {...commonProps} />
        </Suspense>
      );
    case "MATRIXTABLE":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <MatrixTableChart {...commonProps} />
        </Suspense>
      );
    case "MARIMEKKO":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <MarimekkoChart {...commonProps} />
        </Suspense>
      );
    case "BUBBLE":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <BubbleChart {...commonProps} />
        </Suspense>
      );
    case "CALENDAR_HEATMAP":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <CalendarHeatmapChart {...commonProps} />
        </Suspense>
      );
    case "LOGARITHM":
    case "LOGARITHMIC":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <LogarithmicChart {...commonProps} />
        </Suspense>
      );
    case "RETENTION":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <CohortAnalysisChart {...commonProps} />
        </Suspense>
      );
    case "BOX_WHISKER":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <BoxPlotChart {...commonProps} />
        </Suspense>
      );
    case "POLAR_AREA":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <PolarAreaChart {...commonProps} allUploadedData={pieUploadedData} />
        </Suspense>
      );
    case "GEOGRAPHY":
    case "GEOGRAPHY_GRAPH": {
      const { points, overlayType, center, zoom } =
        parseGeographicMapData(item);
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <GeographicMapChart
            {...commonProps}
            allUploadedData={points}
            overlayType={overlayType}
            center={center}
            startingZoom={zoom}
          />
        </Suspense>
      );
    }
    case "DECOMPOSITION_TREE":
      try {
        const treeData =
          typeof xAxisData === "string" ? JSON.parse(xAxisData) : xAxisData;
        return (
          <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
            <DecompositionTreeChart {...commonProps} data={treeData} />
          </Suspense>
        );
      } catch {
        return (
          <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
            <DecompositionTreeChart {...commonProps} />
          </Suspense>
        );
      }
    case "TABLE":
      return (
        <Suspense fallback={<div className="h-[450px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <DataTableChart {...commonProps} />
        </Suspense>
      );
    case "MEDIA_WIDGET":
      return (
        <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <MediaWidgetModule
            projectId={item.projectId}
            programId={item.programId}
            isProgramBuilder={item.isProgramBuilder}
            isPreview={item.isPreview}
            height={item.height}
            className={item.className}
          />
        </Suspense>
      );
    case "FILES_PREVIEW":
      return (
        <Suspense fallback={<div className="h-[200px] w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <FilesPreview
            projectId={item.projectId}
            programId={item.programId}
            isProgramBuilder={item.isProgramBuilder}
            height={item.height}
          />
        </Suspense>
      );
    default:
      return null;
  }
};

const DefaultChartData = ({ projectsChartsData }: any) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-wrap gap-6 w-full">
        {projectsChartsData?.map((item: any) => {
          const chartElement = renderChartContent(item);
          if (!chartElement) return null;

          return (
            <div key={item.id} className="w-full">
              {chartElement}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DefaultChartData;

