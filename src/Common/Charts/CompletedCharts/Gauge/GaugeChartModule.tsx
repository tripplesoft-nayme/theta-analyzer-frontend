import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, Suspense } from "react";
const GaugeChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Gauge/GaugeChart"));
const GaugeConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/GaugeConfiguration"));

import GaugeChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Gauge/GaugeChartSkeleton";
import GaugeConfigurationSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Gauge/GaugeConfigurationSkeleton";
import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

export type LegendValue = {
  label: string;
  field: string;
  color: string;
};

const GaugeChartModule = ({
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
  const [widgetTitle, setWidgetTitle] = useState("Performance Gauge");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Performance", field: "performance", color: "#8D79F6" },
  ]);

  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);
  const [showLegend, setShowLegend] = useState(true);

  // Aggregation States (Moved up for preview sync)
  const [isValueDetectOn, setIsValueDetectOn] = useState(false);
  const [selectedSourceCharts, setSelectedSourceCharts] = useState<any[]>([]);

  // Sync with redux for preview consistency
  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: "gauge-chart",
        config: {
          widgetTitle,
          legendValues,
          startingRange,
          endingRange,
          showLegend,
        },
      })
    );
  }, [widgetTitle, legendValues, startingRange, endingRange, showLegend, dispatch]);



  return (
    <div className="flex gap-3 h-full w-full min-h-0">
      <div className="flex-1 min-w-0 h-full sticky top-5" style={{ height: height ? `${height}px` : "100%" }}>
        <Suspense fallback={<GaugeChartSkeleton />}>
          <GaugeChart
            widgetTitle={widgetTitle}
            legendValues={legendValues}
            numOfLegendDataSet={1}
            startingRange={startingRange}
            endingRange={endingRange}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isCreationMode={true}
            isPreview={isPreview}
            height={height}
            isValueDetectOn={isValueDetectOn}
            selectedSourceCharts={selectedSourceCharts}
            showLegend={showLegend}
          />
        </Suspense>
      </div>
      {showWidget && (
        <div className="">
          <Suspense fallback={<GaugeConfigurationSkeleton />}>
            <GaugeConfiguration
              widgetTitle={widgetTitle}
              setWidgetTitle={setWidgetTitle}
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
        </div>
      )}
    </div>
  );
};

export default GaugeChartModule;