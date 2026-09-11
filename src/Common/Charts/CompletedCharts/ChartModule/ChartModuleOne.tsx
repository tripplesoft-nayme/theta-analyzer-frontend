import { lazyWithRetry } from "@/utils/lazyWithRetry";
// this module i created for Stacked Bar Chart, Line Chart and Area Chart
// means this this a common widget which will work for these 3 charts
import React, { useState, useEffect, Suspense } from "react";
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetForChartModuleOne";

const StackedBarChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/StackedBarChart/StackedBarChart"));
const AreaChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/AreaChart/AreaChart"));
const MultiAxisLineChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/LineChart/LineChart"));
const WidgetForChartModuleOne = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleOne"));

import StackedBarChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/StackedBarChart/StackedBarChartSkeleton";
import AreaChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/AreaChart/AreaChartSkeleton";
import LineChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/LineChart/LineChartSkeleton";
import WidgetForChartModuleOneSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleOneSkeleton";

import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";

const ChartModuleOne = ({
  chartName,
  onDelete,
  isPreview = false,
  layoutW,
  layoutH,
  orderIndex,
}: {
  chartName: string;
  onDelete?: () => void;
  isPreview?: boolean;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
}) => {
  const dispatch = useAppDispatch();
  const [widgetTitle, setWidgetTitle] = useState("My-CSV");
  const [showWidget, setShowWidget] = useState(false);
  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState<number>(1);
  const [xAxisValues, setXAxisValues] = useState<string[]>([]);
  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(3);

  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "", field: "", color: "#13A490" },
    { label: "", field: "", color: "#35B6EE" },
    { label: "", field: "#", color: "#6F78F9" },
  ]);
  const [startingRange, setStartingRange] = useState<number>(0); //for y axis
  const [endingRange, setEndingRange] = useState<number>(100); // for y axis

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: chartName,
        config: {
          widgetTitle,
          xAxisValues,
          legendValues,
          numOfLegendDataSet,
          startingRange,
          endingRange,
        },
      }),
    );
  }, [
    chartName,
    widgetTitle,
    xAxisValues,
    legendValues,
    numOfLegendDataSet,
    startingRange,
    endingRange,
    dispatch,
  ]);

  const minXaxisField = 1;
  const handleSetNumOfXAxisDataSet = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      setNumOfXAxisDataSet(1);
    } else if (value >= minXaxisField) {
      setNumOfXAxisDataSet(value);
    } else {
      setNumOfXAxisDataSet(1);
    }

    setXAxisValues((prev) => {
      const updated = [...prev];
      // Adding empty values if increased
      while (updated.length < value) {
        updated.push("");
      }
      // Removing extra values if decreased
      return updated.slice(0, value);
    });
  };

  const handleXAxisValueChange = (index: number, value: string) => {
    setXAxisValues((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleToggleWidget = () => {
    if (isPreview) return;
    setShowWidget(!showWidget);
  };
  return (
    <div className="flex gap-3 h-full">
      <div className="flex-1 h-full sticky top-5">
        {(() => {
          if (chartName === "bar-chart") {
            return (
              <Suspense fallback={<StackedBarChartSkeleton />}>
                <StackedBarChart
                  widgetTitle={widgetTitle}
                  xAxisValues={xAxisValues}
                  legendValues={legendValues}
                  numOfLegendDataSet={numOfLegendDataSet}
                  startingRange={startingRange}
                  endingRange={endingRange}
                  onDelete={onDelete}
                  isPreview={isPreview}
                  onToggleWidget={handleToggleWidget}
                  isCreationMode={true}
                />
              </Suspense>
            );
          } else if (chartName === "area-chart") {
            return (
              <Suspense fallback={<AreaChartSkeleton />}>
                <AreaChart
                  widgetTitle={widgetTitle}
                  xAxisValues={xAxisValues}
                  legendValues={legendValues}
                  startingRange={startingRange}
                  endingRange={endingRange}
                  onToggleWidget={handleToggleWidget}
                  onDelete={onDelete}
                  isPreview={isPreview}
                  isCreationMode={true}
                />
              </Suspense>
            );

          } else if (chartName === "line-chart" || chartName === "multi-axis-line-chart") {
            return (
              <Suspense fallback={<LineChartSkeleton />}>
                <MultiAxisLineChart
                  widgetTitle={widgetTitle}
                  xAxisValues={xAxisValues}
                  legendValues={legendValues}
                  startingRange={startingRange}
                  endingRange={endingRange}
                  onDelete={onDelete}
                  isPreview={isPreview}
                  onToggleWidget={handleToggleWidget}
                  isCreationMode={true}
                  isMultiAxis={chartName === "multi-axis-line-chart"}
                />
              </Suspense>
            );
          }
          return null;
        })()}
      </div>

      {!isPreview && showWidget && (
        <Suspense fallback={<WidgetForChartModuleOneSkeleton />}>
          <WidgetForChartModuleOne
            widgedName={
              chartName === "bar-chart"
                ? "Stacked Bar Chart"
                : chartName === "area-chart"
                  ? "Area Chart"
                  : chartName === "line-chart"
                    ? "Line Chart"
                    : chartName === "multi-axis-line-chart"
                      ? "Multiaxis Line Chart"
                      : ""
            }
            widgetTitle={widgetTitle}
            widgetCategory={
              chartName === "bar-chart"
                ? "BAR"
                : chartName === "area-chart"
                  ? "AREA"
                  : chartName === "line-chart" || chartName === "multi-axis-line-chart"
                    ? "LINE"
                    : "BAR"
            }
            setWidgetTitle={setWidgetTitle}
            numOfXAxisDataSet={numOfXAxisDataSet}
            handleSetNumOfXAxisDataSet={handleSetNumOfXAxisDataSet}
            xAxisValues={xAxisValues}
            handleXAxisValueChange={handleXAxisValueChange}
            numOfLegendDataSet={numOfLegendDataSet}
            setNumOfLegendDataSet={setNumOfLegendDataSet}
            legendValues={legendValues}
            setLegendValues={setLegendValues}
            startingRange={startingRange}
            setStartingRange={setStartingRange}
            endingRange={endingRange}
            setEndingRange={setEndingRange}
            onClose={() => setShowWidget(false)}
            onDelete={onDelete}
            layoutW={layoutW}
            layoutH={layoutH}
            orderIndex={orderIndex}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ChartModuleOne;
