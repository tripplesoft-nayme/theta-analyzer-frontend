import { lazyWithRetry } from "@/utils/lazyWithRetry";
import React, { useState, useEffect, Suspense, useRef } from "react";
const ProjectConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleOne"));
const LogarithmicChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Logarithmic/LogarithmicChart"));

import LogarithmicChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Logarithmic/LogarithmicChartSkeleton";
import WidgetForChartModuleOneSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleOneSkeleton";
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetForChartModuleOne";
import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const LogarithmicChartModule = ({
  onDelete,
    chartName,
  isPreview = false,
  height,
  layoutW,
  layoutH,
  orderIndex,
}: {
  onDelete?: () => void;
  chartName?: string;
  isPreview?: boolean;
  height?: number;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
}) => {
  const dispatch = useAppDispatch();
  const [widgetTitle, setWidgetTitle] = useState("Logarithmic Analysis");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState<number>(3);
  const [xAxisValues, setXAxisValues] = useState<string[]>([
    "Jan",
    "Feb",
    "Mar",
  ]);

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(2);

  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Growth", field: "growth", color: "#13A490" },
    { label: "Revenue", field: "revenue", color: "#35B6EE" },
  ]);
  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(10000);
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: "logarithmic-chart",
        config: {
          widgetTitle,
          xAxisValues,
          legendValues,
          startingRange,
          endingRange,
          showLegend,
        },
      }),
    );
  }, [
    widgetTitle,
    xAxisValues,
    legendValues,
    startingRange,
    endingRange,
    showLegend,
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

  return (
    <div className="flex gap-3 w-full h-full">
      <div
        className="flex-1 min-w-0 h-full min-h-[150px] sticky top-5"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<LogarithmicChartSkeleton />}>
          <LogarithmicChart
            widgetTitle={widgetTitle}
            xAxisValues={xAxisValues}
            legendValues={legendValues}
            startingRange={startingRange}
            endingRange={endingRange}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isPreview={isPreview}
            isCreationMode={true}
            showLegend={showLegend}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<WidgetForChartModuleOneSkeleton />}>
          <ProjectConfiguration
            widgedName="Logarithmic Chart"
            widgetTitle={widgetTitle}
            widgetCategory="LOGARITHM"
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
            layoutW={layoutW}
            layoutH={layoutH}
            orderIndex={orderIndex}
            showLegend={showLegend}
            setShowLegend={setShowLegend}
          />
        </Suspense>
      )}
    </div>
  );
};

export default LogarithmicChartModule;
