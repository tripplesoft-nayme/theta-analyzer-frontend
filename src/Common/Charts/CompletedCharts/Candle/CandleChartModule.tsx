import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, Suspense } from "react";
const CandleChartConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/CandleChartConfiguration"));
const CandleChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Candle/CandleChart"));

import CandleChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Candle/CandleChartSkeleton";
import CandleChartConfigurationSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Candle/CandleChartConfigurationSkeleton";
import type { LegendValue } from "../Common/chartTypes";
import { toast } from "sonner";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

type CandleChartModuleProps = {
  onDelete?: () => void;
  chartName?: string;
  isPreview?: boolean;
  height?: number;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
};

const CandleChartModule = ({
  onDelete,
  chartName,
  isPreview = false,
  height,
  layoutW,
  layoutH,
  orderIndex,
}: CandleChartModuleProps) => {
  const [widgetTitle, setWidgetTitle] = useState("Candle Chart Analysis");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false); // Widget hidden by default

  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState<number>(1);
  const [xAxisValues, setXAxisValues] = useState<string[]>([]);

  const numOfLegendDataSet = 4;

  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Open", field: "open", color: "#169E7B" },
    { label: "High", field: "high", color: "#169E7B" },
    { label: "Low", field: "low", color: "#DA4352" },
    { label: "Close", field: "close", color: "#DA4352" },
  ]);
  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);

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
      toast.error(
        `Please enter a number greater than or equal to ${minXaxisField}`,
      );
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

  // Aggregation States
  const [isValueDetectOn, setIsValueDetectOn] = useState(false);
  const [selectedSourceCharts, setSelectedSourceCharts] = useState<any[]>([]);

  // Toggle widget visibility

  // Close widget (for X button)

  return (
    <div className="flex gap-3 h-full w-full min-h-0">
      <div
        className="flex-1 min-w-0 sticky top-5"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<CandleChartSkeleton />}>
          <CandleChart
            widgetTitle={widgetTitle}
            xAxisValues={xAxisValues}
            legendValues={legendValues}
            numOfLegendDataSet={numOfLegendDataSet}
            startingRange={startingRange}
            endingRange={endingRange}
            onToggleWidget={handleToggleWidget}
            isPreview={isPreview}
            onDelete={onDelete}
            isCreationMode={true}
            height={height}
            isValueDetection={isValueDetectOn}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<CandleChartConfigurationSkeleton />}>
          <CandleChartConfiguration
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
          />
        </Suspense>
      )}
    </div>
  );
};

export default CandleChartModule;
