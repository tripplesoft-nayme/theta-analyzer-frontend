import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, Suspense } from "react";
const ProjectConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleOne"));
const SparkLinesChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Sparkline/SparkLinesChart"));

import SparklineChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Sparkline/SparklineChartSkeleton";
import WidgetForChartModuleOneSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleOneSkeleton";
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetForChartModuleOne";
import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import { toast } from "sonner";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const SparkLineChartModule = ({
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
  const [widgetTitle, setWidgetTitle] = useState("Sparkline Trend");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false); // Widget hidden by default

  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState<number>(1);
  const [xAxisValues, setXAxisValues] = useState<string[]>([]);

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(1);

  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Series 1", field: "series1", color: "#35B6EE" },
  ]);
  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: "sparklines-chart",
        config: {
          widgetTitle,
          xAxisValues,
          legendValues,
          startingRange,
          endingRange,
        },
      }),
    );
  }, [
    widgetTitle,
    xAxisValues,
    legendValues,
    startingRange,
    endingRange,
    dispatch,
  ]);

  const handleSetNumOfXAxisDataSet = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(e.target.value, 10);
    const minVal = 1;
    const maxVal = 99;

    let safeValue = value;
    if (isNaN(value) || value < minVal) {
      safeValue = 1;
    } else if (value > maxVal) {
      safeValue = maxVal;
      toast.info(`Maximum ${maxVal} data sets allowed`);
    }

    setNumOfXAxisDataSet(safeValue);

    setXAxisValues((prev) => {
      const updated = [...prev];
      while (updated.length < safeValue) {
        updated.push("");
      }
      return updated.slice(0, safeValue);
    });
  };

  const handleXAxisValueChange = (index: number, value: string) => {
    setXAxisValues((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Toggle widget visibility

  // Close widget (for X button)

  const [showLegend, setShowLegend] = useState(true);

  // Dynamic height calculation to automatically expand the container on adding new legends
  const dynamicHeight = height
    ? Math.max(height, legendValues.length * 180 + 80)
    : undefined;

  return (
    <div className="flex gap-3 h-full">
      <div className="flex-1 h-full sticky top-5" style={{ height: dynamicHeight ? `${dynamicHeight}px` : "100%" }}>
        <Suspense fallback={<SparklineChartSkeleton />}>
          <SparkLinesChart
            widgetTitle={widgetTitle}
            xAxisValues={xAxisValues}
            legendValues={legendValues}
            startingRange={startingRange}
            endingRange={endingRange}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isCreationMode={true}
            isPreview={isPreview}
            showLegend={showLegend}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<WidgetForChartModuleOneSkeleton />}>
          <ProjectConfiguration
            widgedName="Sparkline Chart"
            widgetTitle={widgetTitle}
            widgetCategory="SPARKLINE"
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

export default SparkLineChartModule;
