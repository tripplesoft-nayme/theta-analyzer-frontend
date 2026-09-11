import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, Suspense } from "react";
const ComboChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Combo/ComboChart"));
const ComboChartConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/ComboChartConfiguration"));

import ComboChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Combo/ComboChartSkeleton";
import ComboChartConfigurationSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Combo/ComboChartConfigurationSkeleton";
import type { LegendValue } from "../Common/chartTypes";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

type ComboChartModuleProps = {
  onDelete?: () => void;
  chartName?: string;
  isPreview?: boolean;
  height?: number;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
};

const ComboChartModule = ({
  onDelete,
  chartName,
  isPreview = false,
  height,
  layoutW,
  layoutH,
  orderIndex,
}: ComboChartModuleProps) => {
  const [widgetTitle, setWidgetTitle] = useState("Combo Performance");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState<number>(3);
  const [xAxisValues, setXAxisValues] = useState<string[]>(["Jan", "Feb", "Mar"]);

  // Combo Chart is Fixed 1 Bar, 1 Line = 2 Legend Sets
  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Revenue", field: "revenue", color: "#3b82f6", type: "bar" },
    { label: "Target", field: "target", color: "#ec4899", type: "line" },
  ]);

  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);
  const [showLegend, setShowLegend] = useState(true);

  // Aggregation States
  const [isValueDetectOn, setIsValueDetectOn] = useState(false);
  const [selectedSourceCharts, setSelectedSourceCharts] = useState<any[]>([]);

  const handleSetNumOfXAxisDataSet = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(e.target.value, 10);
    const minXaxisField = 1;

    if (isNaN(value)) {
      setNumOfXAxisDataSet(1);
    } else if (value >= minXaxisField) {
      setNumOfXAxisDataSet(value);
    } else {
      setNumOfXAxisDataSet(1);
    }

    setXAxisValues((prev) => {
      const updated = [...prev];
      while (updated.length < value) updated.push("");
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
    <div className="flex gap-3 h-full w-full min-h-0">
      <div className="flex-1 min-w-0 min-h-0 h-full min-h-[400px] sticky top-5" style={{ height: height ? `${height}px` : "100%" }}>
        <Suspense fallback={<ComboChartSkeleton />}>
          <ComboChart
            widgetTitle={widgetTitle}
            xAxisValues={xAxisValues}
            legendValues={legendValues}
            numOfLegendDataSet={2}
            startingRange={startingRange}
            endingRange={endingRange}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isPreview={isPreview}
            isCreationMode={true}
            height={height}
            showLegend={showLegend}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<ComboChartConfigurationSkeleton />}>
          <ComboChartConfiguration
            widgetTitle={widgetTitle}
            setWidgetTitle={setWidgetTitle}
            numOfXAxisDataSet={numOfXAxisDataSet}
            handleSetNumOfXAxisDataSet={handleSetNumOfXAxisDataSet}
            xAxisValues={xAxisValues}
            handleXAxisValueChange={handleXAxisValueChange}
            legendValues={legendValues}
            setLegendValues={setLegendValues}
            startingRange={startingRange}
            setStartingRange={setStartingRange}
            endingRange={endingRange}
            setEndingRange={setEndingRange}
            onClose={handleCloseWidget}
            onDelete={onDelete}
            isValueDetectOn={isValueDetectOn}
            setIsValueDetectOn={setIsValueDetectOn}
            selectedSourceCharts={selectedSourceCharts}
            setSelectedSourceCharts={setSelectedSourceCharts}
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

export default ComboChartModule;
