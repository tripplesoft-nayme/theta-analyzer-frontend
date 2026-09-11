import { lazyWithRetry } from "@/utils/lazyWithRetry";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";

const ProjectConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleOne"));
const MultiAxisLineChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/LineChart/LineChart"));

import LineChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/LineChart/LineChartSkeleton";
import WidgetForChartModuleOneSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleOneSkeleton";
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetCommon";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const LineChartModule = ({
  onDelete,
  isPreview = false,
  height,
  chartName,
  layoutW,
  layoutH,
  orderIndex,
}: {
  onDelete?: () => void;
  isPreview?: boolean;
  height?: number;
  chartName?: string;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
}) => {
  const dispatch = useAppDispatch();
  const isMultiAxis = chartName?.startsWith("multi-axis-line-chart");
  const [widgetTitle, setWidgetTitle] = useState(
    isMultiAxis ? "Multiaxis Line Chart Analysis" : "Line Chart Analysis",
  );
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false); // Widget hidden by default

  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState<number>(1);
  const [xAxisValues, setXAxisValues] = useState<string[]>([]);

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(
    isMultiAxis ? 3 : 1,
  );

  const [legendValues, setLegendValues] = useState<LegendValue[]>(
    isMultiAxis
      ? [
        { label: "Project A", field: "projecta", color: "#13A490" },
        { label: "Project B", field: "projectb", color: "#35B6EE" },
        { label: "Project C", field: "projectc", color: "#6F78F9" },
      ]
      : [{ label: "Progress", field: "progress", color: "#13A490" }],
  );
  const [startingRange, setStartingRange] = useState<number>(0); //for y axis
  const [endingRange, setEndingRange] = useState<number>(100); // for y axis

  useEffect(() => {
    if (!isMultiAxis && (numOfLegendDataSet !== 1 || legendValues.length !== 1)) {
      setNumOfLegendDataSet(1);
      setLegendValues((prev) => {
        const first = prev[0] || { label: "Progress", field: "progress", color: "#13A490" };
        return [{ ...first, label: first.label || "Progress", field: first.field || "progress" }];
      });
    }
  }, [isMultiAxis, numOfLegendDataSet, legendValues]);

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: chartName || "line-chart",
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
    widgetTitle,
    xAxisValues,
    legendValues,
    numOfLegendDataSet,
    startingRange,
    endingRange,
    dispatch,
    chartName,
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
      while (updated.length < value) {
        updated.push("");
      }
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



  const [showLegend, setShowLegend] = useState(true);

  return (
    <div className="flex gap-3 h-full w-full">
      <div
        className="flex-1 min-0 min-w-0 sticky top-5 h-full"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<LineChartSkeleton />}>
          <MultiAxisLineChart
            widgetTitle={widgetTitle}
            xAxisValues={xAxisValues}
            legendValues={legendValues}
            numOfLegendDataSet={numOfLegendDataSet}
            startingRange={startingRange}
            endingRange={endingRange}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isPreview={isPreview}
            isCreationMode={true}
            isMultiAxis={isMultiAxis}
            showLegend={showLegend}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<WidgetForChartModuleOneSkeleton />}>
          <ProjectConfiguration
            widgedName={isMultiAxis ? "Multi Axis Line Chart" : "Line Chart"}
            widgetTitle={widgetTitle}
            widgetCategory="LINE"
            isRestricted={!isMultiAxis}
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
            onClose={handleCloseWidget}
            onDelete={onDelete}
            showLegend={showLegend}
            setShowLegend={setShowLegend}
            layoutW={layoutW}
            layoutH={layoutH}
            orderIndex={orderIndex}
          />
        </Suspense>
      )}
    </div>
  );
};

export default LineChartModule;
