import { lazyWithRetry } from "@/utils/lazyWithRetry";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";

const ProjectConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleOne"));
const ColumnBarChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/ColumnChart/ColumnBarChart"));

import ColumnBarChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/ColumnChart/ColumnBarChartSkeleton";
import WidgetForChartModuleOneSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleOneSkeleton";
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetCommon";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const ColumnBarChartModule = ({
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
  const [widgetTitle, setWidgetTitle] = useState("Column Chart Analysis");

  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);

  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);
  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState<number>(3);
  const [xAxisValues, setXAxisValues] = useState<string[]>([]);
  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(1);
  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Project", field: "project", color: "#13A490" },
  ]);

  useEffect(() => {
    if (numOfLegendDataSet !== 1 || legendValues.length !== 1) {
      setNumOfLegendDataSet(1);
      setLegendValues((prev) => {
        const first = prev[0] || { label: "Project", field: "project", color: "#13A490" };
        return [{ ...first, label: first.label || "Project", field: first.field || "project" }];
      });
    }
  }, [numOfLegendDataSet, legendValues]);

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: "column-chart",
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
    <div className="flex gap-3 h-full w-full">
      <div
        className="flex-1 min-w-0 h-full sticky top-5"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<ColumnBarChartSkeleton />}>
          <ColumnBarChart
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
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<WidgetForChartModuleOneSkeleton />}>
          <ProjectConfiguration
            widgedName="Column Chart"
            widgetTitle={widgetTitle}
            widgetCategory="COLUMN"
            isRestricted={true}
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
          />
        </Suspense>
      )}
    </div>
  );
};

export default ColumnBarChartModule;
