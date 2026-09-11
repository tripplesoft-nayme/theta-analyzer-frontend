/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import StackedBarChart, {
  parseXAxisData,
} from "@/Common/Charts/CompletedCharts/StackedBarChart/StackedBarChart";
// SampleBarChart is bypassed in favor of StackedBarChart with category="SAMPLECHART"
import MultiAxisLineChart from "@/Common/Charts/CompletedCharts/LineChart/LineChart";
import { parseLineChartData } from "@/utils/parseLineChartData";
import { parsePieChartData } from "@/utils/parsePieChartData";
import {
  sanitizeSheetName,
  extractLegendsFromXAxis,
  parseCommonChartData,
} from "@/Common/Charts/CompletedCharts/Common/chartUtils";
import HorizontalBarChart, {
  parseHorizontalBarData,
} from "@/Common/Charts/CompletedCharts/HorizontalBarChart/HorizontalBarChart";
import { chartTypes } from "@/Common/Charts/CompletedCharts/Common/ChartCategory";
import HeatmapChartNew, {
  parseHeatmapChartData,
} from "@/Common/Charts/CompletedCharts/HeatMap/HeatmapChartNew";
import PieChartWidget from "@/Common/Charts/CompletedCharts/PieChart/PieChart";
import ColumnBarChart from "@/Common/Charts/CompletedCharts/ColumnChart/ColumnBarChart";
import AreaChart from "@/Common/Charts/CompletedCharts/AreaChart/AreaChart";
import SplineAreaChart from "@/Common/Charts/CompletedCharts/SplineAreaChart/SplineAreaChart";
import SparkLinesChart from "@/Common/Charts/CompletedCharts/Sparkline/SparkLinesChart";
import ComboChart from "@/Common/Charts/CompletedCharts/Combo/ComboChart";

import DoughnutChart from "@/Common/Charts/DoughnutChart";
import ParetoChart from "@/Common/Charts/CompletedCharts/Pareto/ParetoChart";
import HistogramChart from "@/Common/Charts/CompletedCharts/Histogram/HistogramChart";
import ScatterChart from "@/Common/Charts/CompletedCharts/Scatter/ScatterChart";
import GaugeChart from "@/Common/Charts/CompletedCharts/Gauge/GaugeChart";
import FunnelChart from "@/Common/Charts/CompletedCharts/Funnel/FunnelChart";
import WaterfallChart from "@/Common/Charts/CompletedCharts/Waterfall/WaterfallChart";
import HorizontalStackedBarChart from "@/Common/Charts/HorizontalStackedBarChart";
import CandleChart from "@/Common/Charts/CompletedCharts/Candle/CandleChart";
import RibbonChart from "@/Common/Charts/CompletedCharts/Ribbon/RibbonChart";
import MatrixTableChart from "@/Common/Charts/CompletedCharts/MatrixTable/MatrixTableChart";
import MarimekkoChart from "@/Common/Charts/CompletedCharts/Marimekko/MarimekkoChart";
import RadarChart from "@/Common/Charts/CompletedCharts/Radar/RadarChart";
import LogarithmicChart from "@/Common/Charts/CompletedCharts/Logarithmic/LogarithmicChart";
import BoxPlotChart from "@/Common/Charts/CompletedCharts/BoxWhiskerplot/BoxPlotChart";
import CohortAnalysisChart from "@/Common/Charts/CompletedCharts/Cohort/CohortAnalysisChart";
import PolarAreaChart from "@/Common/Charts/CompletedCharts/PolarArea/PolarAreaChart";

interface ReviewDetailsProps {
  groups: any[];
  projectId: string;
}

const useReviewDetailsHooks = ({ groups, projectId }: ReviewDetailsProps) => {
  const chartComponents = useMemo(() => {
    if (!groups || groups.length === 0) return [];

    const allCharts = (groups || [])
      .flatMap((group) => group.charts || [])
      .filter((chart: any) => {
        const categoryKey = chart.category?.toUpperCase();
        return !!chartTypes[categoryKey];
      })
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    return allCharts.map((chart: any, index: number) => {
      const categoryKey = chart.category?.toUpperCase();
      const chartProperty = chartTypes[categoryKey];
      const extractVal = (obj: any, keys: string[]) => {
        if (!obj) return undefined;
        for (const k of keys) {
          if (obj[k] !== undefined && obj[k] !== null) return Number(obj[k]);
        }
        return undefined;
      };

      const firstFieldKeys = ["firstFieldDataset", "firstFiledDataset"];
      const lastFieldKeys = ["lastFieldDataset", "lastFiledDAtaset"];

      let chartData =
        chartProperty && chart[chartProperty] && (chart[chartProperty].firstFieldDataset !== undefined || chart[chartProperty].firstFiledDataset !== undefined)
          ? chart[chartProperty]
          : (chart.sampleChart || chart.sampleBarChart || chart);

      // Mutate chartData directly with guaranteed bounds so downstream logic inherits it seamlessly
      if (chartData) {
        chartData = { ...chartData };
        chartData.firstFieldDataset =
          extractVal(chart?.sampleChart, firstFieldKeys) ??
          extractVal(chart?.sampleBarChart, firstFieldKeys) ??
          extractVal(chart?.barChart, firstFieldKeys) ??
          extractVal(chartData, firstFieldKeys) ??
          extractVal(chart, firstFieldKeys);
        
        chartData.lastFieldDataset =
          extractVal(chart?.sampleChart, lastFieldKeys) ??
          extractVal(chart?.sampleBarChart, lastFieldKeys) ??
          extractVal(chart?.barChart, lastFieldKeys) ??
          extractVal(chartData, lastFieldKeys) ??
          extractVal(chart, lastFieldKeys) ??
          100;
      }

      const chartTitle = chart?.name || chart?.title || "Chart";

      // Consistent height logic
      const defaultHeight =
        index === 0 ? 560 : categoryKey === "MARIMEKKO" ? 450 : 400;
      const chartHeight = chart.height || chartData?.displayHight || defaultHeight;
      const chartWidth = chart.width || 10; // Default to half-width if not specified

      let component = null;

      if (categoryKey === "LINE" || categoryKey === "MIXED") {
        const rawWidgets = chartData?.widgets || chart?.widgets || [];
        let legendValues = rawWidgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
          field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        }));

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data } = parseLineChartData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );
        const ChartComponent =
          categoryKey === "MIXED" ? ComboChart : MultiAxisLineChart;

        component = (
          <ChartComponent
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={labels}
            legendValues={legendValues}
            numOfLegendDataSet={
              chartData?.numberOfDataset || legendValues.length
            }
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            projectId={projectId}
            allUploadedData={data}
            tierLevel={chart.level || 0}
            isPreview={true}
            preFetchedChildren={chart.children}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "HORIZONTAL_BAR") {
        const rawWidgets = chartData?.widgets || chart?.widgets || [];
        let legendValues = rawWidgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
          field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        }));

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data } = parseHorizontalBarData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <HorizontalBarChart
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={labels}
            legendValues={legendValues}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            projectId={projectId}
            allUploadedData={data}
            tierLevel={chart.level || 0}
            isPreview={true}
            preFetchedChildren={chart.children}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "SIMPLE_HORIZONTAL_BAR") {
        const rawWidgets = chartData?.widgets || chart?.widgets || [];
        let legendValues = rawWidgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
          field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        }));

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data } = parseHorizontalBarData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <HorizontalBarChart
            category="SIMPLE_HORIZONTAL_BAR"
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={labels}
            legendValues={legendValues}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            projectId={projectId}
            allUploadedData={data}
            tierLevel={chart.level || 0}
            isPreview={true}
            preFetchedChildren={chart.children}
            chartHeight={chartHeight}
            isStacked={
              chart?.isStacked !== undefined
                ? chart.isStacked
                : (String(chart?.id || "").toLowerCase().startsWith("horizontal-stacked-bar-chart") ||
                  String(chart?.title || "").toLowerCase().includes("stacked"))
            }
          />
        );
      }

      if (categoryKey === "BAR") {
        const rawWidgets = chartData?.widgets || chart?.widgets || [];
        let legendValues = rawWidgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
          field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        }));

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data } = parseXAxisData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );
        component = (
          <StackedBarChart
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={labels}
            legendValues={legendValues}
            widgets={chartData?.widgets}
            numOfLegendDataSet={chartData?.numberOfDataset}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset}
            chartId={chart?.id}
            projectId={projectId}
            allUploadedData={data}
            tierLevel={chart.level || 0}
            isPreview={true}
            preFetchedChildren={chart.children}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "SAMPLECHART") {
        const rawWidgets = chartData?.widgets || chart?.widgets || [];
        let legendValues = rawWidgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
          field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        }));

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data } = parseXAxisData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );
        component = (
          <StackedBarChart
            category="SAMPLECHART"
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={labels}
            legendValues={legendValues}
            widgets={chartData?.widgets}
            numOfLegendDataSet={chartData?.numberOfDataset}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset}
            chartId={chart?.id}
            projectId={projectId}
            allUploadedData={data}
            tierLevel={chart.level || 0}
            isPreview={true}
            preFetchedChildren={chart.children}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "HEATMAP") {
        const heatmapConfig = chart?.heatmap || chartData;
        const rawWidgets = heatmapConfig?.widgets || [];
        let legendValues = rawWidgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
          field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        }));

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data } = parseHeatmapChartData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <HeatmapChartNew
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={labels}
            legendValues={legendValues}
            numOfLegendDataSet={heatmapConfig?.numberOfDataset}
            startingRange={heatmapConfig?.firstFieldDataset}
            endingRange={heatmapConfig?.lastFieldDataset}
            chartId={chart?.id}
            projectId={projectId}
            allUploadedData={data}
            tierLevel={chart.level || 0}
            isPreview={true}
            preFetchedChildren={chart.children}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "PIE") {
        const legendValues =
          (chartData?.widgets || chart?.widgets)?.map((w: any) => ({
            label: w.legendName || w.label,
            color: w.color,
            field: (w.legendName || w.label)
              ?.toLowerCase()
              .replace(/\s+/g, ""),
          })) || [];

        const pieData = parsePieChartData(chart?.xAxis, legendValues);
        const sheetName = sanitizeSheetName(chartTitle);
        const pieUploadedData =
          pieData.length > 0 ? { [sheetName]: pieData } : undefined;

        component = (
          <PieChartWidget
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            legendValues={legendValues}
            numOfLegendDataSet={chartData?.numberOfDataset}
            chartId={chart?.id}
            allUploadedData={pieUploadedData}
            projectId={projectId}
            tierLevel={chart.level || 0}
            isPreview={true}
            preFetchedChildren={chart.children}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "COLUMN") {
        const rawWidgets = chartData?.widgets || chart?.widgets || [];
        let legendValues = rawWidgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
          field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        }));

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data } = parseXAxisData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <ColumnBarChart
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={labels}
            legendValues={legendValues}
            numOfLegendDataSet={chartData?.numberOfDataset}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset}
            chartId={chart?.id}
            projectId={projectId}
            allUploadedData={data}
            isPreview={true}
            preFetchedChildren={chart.children}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "AREA") {
        const rawWidgets = chartData?.widgets || chart?.widgets || [];
        let legendValues = rawWidgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
          field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        }));

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data } = parseXAxisData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <AreaChart
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={labels}
            legendValues={legendValues}
            numOfLegendDataSet={
              chartData?.numberOfDataset || legendValues.length
            }
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            projectId={projectId}
            allUploadedData={data}
            isPreview={true}
            preFetchedChildren={chart.children}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "SPLINE") {
        const rawWidgets = chartData?.widgets || chart?.widgets || [];
        let legendValues = rawWidgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
          field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        }));

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data } = parseXAxisData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <SplineAreaChart
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={labels}
            legendValues={legendValues}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            projectId={projectId}
            allUploadedData={data}
            isPreview={true}
            preFetchedChildren={chart.children}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "SPARKLINE") {
        const rawWidgets = chartData?.widgets || chart?.widgets || [];
        let legendValues = rawWidgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
          field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        }));

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data } = parseXAxisData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <SparkLinesChart
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={labels}
            legendValues={legendValues}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            projectId={projectId}
            allUploadedData={data}
            isPreview={true}
            preFetchedChildren={chart.children}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "RADAR") {
        const legendValues =
          (chartData?.widgets || chart?.widgets)?.map((w: any) => ({
            label: w.legendName || w.label,
            color: w.color,
            field: (w.legendName || w.label)
              ?.toLowerCase()
              .replace(/\s+/g, ""),
          })) || [];

        const { labels } = parseXAxisData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <RadarChart
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={labels}
            legendValues={legendValues}
            numOfLegendDataSet={chartData?.numberOfDataset}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset}
            chartId={chart?.id}
            isPreview={true}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "DOUGHNUT") {
        const legendValues =
          (chartData?.widgets || chart?.widgets)?.map((w: any) => ({
            name: w.legendName || w.label,
            color: w.color,
            value: 0,
            count: 0,
          })) || [];

        component = (
          <DoughnutChart
            title={chartTitle}
            data={legendValues}
            centerLabel="Total"
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "PARETO") {
        let legendValues =
          (chartData?.widgets || chart?.widgets)?.map((w: any) => ({
            label: w.legendName || w.label,
            color: w.color,
            field: (w.legendName || w.label)
              ?.toLowerCase()
              .replace(/\s+/g, ""),
          })) || [];

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data } = parseXAxisData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <ParetoChart
            widgetTitle={chartTitle}
            xAxisValues={labels}
            legendValues={legendValues}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            allUploadedData={data}
            isPreview={true}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "HISTOGRAM") {
        let legendValues =
          (chartData?.widgets || chart?.widgets)?.map((w: any) => ({
            label: w.legendName || w.label,
            color: w.color,
            field: (w.legendName || w.label)
              ?.toLowerCase()
              .replace(/\s+/g, ""),
          })) || [];

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data } = parseCommonChartData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <HistogramChart
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={labels}
            legendValues={legendValues}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            allUploadedData={data}
            isPreview={true}
            preFetchedChildren={chart.children}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "SCATTER") {
        const legendValues =
          (chartData?.widgets || chart?.widgets)?.map((w: any) => ({
            label: w.legendName || w.label,
            color: w.color,
            field: (w.legendName || w.label)
              ?.toLowerCase()
              .replace(/\s+/g, ""),
          })) || [];

        component = (
          <ScatterChart
            widgetTitle={chartTitle}
            legendValues={legendValues}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            isPreview={true}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "GAUGE") {
        const legendValues =
          (chartData?.widgets || chart?.widgets)?.map((w: any) => ({
            label: w.legendName || w.label,
            color: w.color,
            field: (w.legendName || w.label)
              ?.toLowerCase()
              .replace(/\s+/g, ""),
          })) || [];

        component = (
          <GaugeChart
            widgetTitle={chartTitle}
            legendValues={legendValues}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            isPreview={true}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "FUNNEL") {
        const { labels } = parseXAxisData(chart?.xAxis, [], chartTitle);

        component = (
          <FunnelChart
            widgetTitle={chartTitle}
            xAxisValues={labels}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            isPreview={true}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "WATERFALL") {
        const legendValues =
          (chartData?.widgets || chart?.widgets)?.map((w: any) => ({
            label: w.legendName || w.label,
            color: w.color,
            field: (w.legendName || w.label)
              ?.toLowerCase()
              .replace(/\s+/g, ""),
          })) || [];

        const { labels } = parseXAxisData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <WaterfallChart
            widgetTitle={chartTitle}
            xAxisValues={labels}
            legendValues={legendValues}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            isPreview={true}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "STACK_BAR_HORIZONTAL") {
        const legendValues =
          (chartData?.widgets || chart?.widgets)?.map((w: any) => ({
            label: w.legendName || w.label,
            color: w.color,
            field: (w.legendName || w.label)
              ?.toLowerCase()
              .replace(/\s+/g, ""),
          })) || [];

        const { labels } = parseXAxisData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <HorizontalStackedBarChart
            widgetTitle={chartTitle}
            xAxisValues={labels}
            legendValues={legendValues}
            numOfLegendDataSet={
              chartData?.numberOfDataset || legendValues.length
            }
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            isPreview={true}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "CANDLESTICK") {
        const { labels } = parseXAxisData(chart?.xAxis, [], chartTitle);

        component = (
          <CandleChart
            widgetTitle={chartTitle}
            xAxisValues={labels}
            numOfLegendDataSet={chartData?.numberOfDataset || 1}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            isPreview={true}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "RIBBON") {
        const rawWidgets = chartData?.widgets || chart?.widgets || [];
        let legendValues = rawWidgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
          field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        }));

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data } = parseCommonChartData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <RibbonChart
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={labels}
            legendValues={legendValues}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            projectId={projectId}
            allUploadedData={data}
            tierLevel={chart.level || 0}
            isPreview={true}
            preFetchedChildren={chart.children}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "MATRIXTABLE") {
        const rawWidgets = chartData?.widgets || chart?.widgets || [];
        let legendValues = rawWidgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
          field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        }));

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data, categoryTitle } = parseCommonChartData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <MatrixTableChart
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            categoryTitle={categoryTitle}
            xAxisValues={labels}
            legendValues={legendValues}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            allUploadedData={data}
            projectId={projectId}
            isPreview={true}
          />
        );
      }

      if (categoryKey === "MARIMEKKO") {
        const rawWidgets = chartData?.widgets || chart?.widgets || [];
        let legendValues = rawWidgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
          field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        }));

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        const { labels, data } = parseCommonChartData(
          chart?.xAxis,
          legendValues,
          chartTitle,
        );

        component = (
          <MarimekkoChart
            key={chart.id}
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={labels}
            legendValues={legendValues}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            allUploadedData={data}
            projectId={projectId}
            isPreview={true}
            chartHeight={chartData?.displayHight || 450}
          />
        );
      }

      if (categoryKey === "LOGARITHM") {
        component = (
          <LogarithmicChart
            key={chart.id}
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxisValues={chart?.xAxis}
            startingRange={chartData?.firstFieldDataset}
            endingRange={chartData?.lastFieldDataset || 100}
            chartId={chart?.id}
            projectId={projectId}
            isPreview={true}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "BOX_WHISKER") {
        component = (
          <BoxPlotChart
            key={chart.id}
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxis={chart?.xAxis}
            chartId={chart?.id}
            projectId={projectId}
            isPreview={true}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "RETENTION") {
        component = (
          <CohortAnalysisChart
            key={chart.id}
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            xAxis={chart?.xAxis}
            chartId={chart?.id}
            projectId={projectId}
            isPreview={true}
            chartHeight={chartHeight}
          />
        );
      }

      if (categoryKey === "POLAR_AREA") {
        const rawWidgets = chartData?.widgets || chart?.widgets || [];
        let legendValues = rawWidgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
          field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        }));

        if (legendValues.length === 0) {
          const derived = extractLegendsFromXAxis(chart?.xAxis);
          legendValues = derived.map((lbl, idx) => ({
            label: lbl,
            color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
            field: lbl.toLowerCase().replace(/\s+/g, ""),
          }));
        }

        component = (
          <PolarAreaChart
            key={chart.id}
            widgetTitle={chartTitle}
            groupTitle={chart?.grouptitle}
            legendValues={legendValues}
            numOfLegendDataSet={
              chartData?.numberOfDataset || legendValues.length
            }
            chartId={chart?.id}
            projectId={projectId}
            isPreview={true}
            chartHeight={chartHeight}
          />
        );
      }

      return {
        id: chart.id,
        component,
        width: chartWidth,
        height: chartHeight,
      };
    });
  }, [groups, projectId]);

  const chartRows = useMemo(() => {
    // We no longer need row-capacity logic if we use a single 20-col grid.
    // But we'll keep the variable for compatibility if ReviewDetails still uses it,
    // although it's better to just use chartComponents.
    return [];
  }, [chartComponents]);

  return { chartComponents, chartRows };
};

export default useReviewDetailsHooks;
