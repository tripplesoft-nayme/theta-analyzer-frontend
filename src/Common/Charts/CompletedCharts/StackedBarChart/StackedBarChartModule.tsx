import { lazyWithRetry } from "@/utils/lazyWithRetry";
import React, { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";

const ProjectConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleOne"));
const StackedBarChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/StackedBarChart/StackedBarChart"));

import StackedBarChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/StackedBarChart/StackedBarChartSkeleton";
import WidgetForChartModuleOneSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleOneSkeleton";
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetCommon";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const StackedBarChartModule = ({
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
  const isSimpleBar = chartName?.startsWith("bar-chart");
  const [widgetTitle, setWidgetTitle] = useState(
    isSimpleBar ? "Bar Chart Analysis" : "Stacked Bar Chart Analysis",
  );
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);
  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState<number>(1);
  const [xAxisValues, setXAxisValues] = useState<string[]>([]);
  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(3);
  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Project A", field: "projecta", color: "#13A490" },
    { label: "Project B", field: "projectb", color: "#35B6EE" },
    { label: "Project C", field: "projectc", color: "#6F78F9" },
  ]);
  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: chartName || "bar-chart",
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

  const handleSetNumOfXAxisDataSet = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(e.target.value, 10);
    const targetValue = isNaN(value) ? 1 : Math.max(value, minXaxisField);

    setNumOfXAxisDataSet(targetValue);
    setXAxisValues((prev) => {
      const updated = [...prev];
      while (updated.length < targetValue) {
        updated.push("");
      }
      return updated.slice(0, targetValue);
    });
  }, [minXaxisField]);

  const handleXAxisValueChange = useCallback((index: number, value: string) => {
    setXAxisValues((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);


  return (
    <div className="flex gap-3 h-full w-full min-h-0">
      <div
        className="flex-1 min-w-0 sticky top-5"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<StackedBarChartSkeleton />}>
          <StackedBarChart
            widgetTitle={widgetTitle}
            xAxisValues={xAxisValues}
            legendValues={legendValues}
            numOfLegendDataSet={numOfLegendDataSet}
            startingRange={startingRange}
            endingRange={endingRange}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isCreationMode={true}
            isPreview={isPreview}
            showLegend={showLegend}
            isStacked={!isSimpleBar}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<WidgetForChartModuleOneSkeleton />}>
          <ProjectConfiguration
            widgedName={isSimpleBar ? "Bar Chart" : "Stack Bar Chart"}
            widgetTitle={widgetTitle}
            widgetCategory="BAR"
            isRestricted={false}
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

export default StackedBarChartModule;
