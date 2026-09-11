import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, Suspense } from "react";
const ProgressRingConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/ProgressRingConfiguration"));
const ProgressRing = lazyWithRetry(() => import("./ProgressRing"));

import ProgressRingSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/ProgressRing/ProgressRingSkeleton";
import ProgressRingConfigurationSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/ProgressRing/ProgressRingConfigurationSkeleton";
import type { LegendValue } from "../Common/WidgetsConfiguration/ProgressRingConfiguration";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const ProgressRingModule = ({
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
  const projectId = useAppSelector((state) => state.chartSlice.projectId);
  const [widgetTitle, setWidgetTitle] = useState("Activity Progress");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);
  const [showLegend, setShowLegend] = useState(true);

  // Aggregation States (Moved up for preview sync)
  const [isValueDetectOn, setIsValueDetectOn] = useState(false);
  const [selectedSourceCharts, setSelectedSourceCharts] = useState<any[]>([]);

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(1);
  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    {
      label: "Completed",
      field: "completed",
      color: "#3b82f6",
    },
  ]);

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: "progress-ring",
        config: {
          widgetTitle,
          legendValues,
          startingRange,
          endingRange,
          showLegend,
        },
      }),
    );
  }, [widgetTitle, legendValues, startingRange, endingRange, showLegend, dispatch]);



  return (
    <div className="flex gap-3 h-full w-full">
      <div className="flex-1 min-w-0 h-full sticky top-5" style={{ height: height ? `${height}px` : "100%" }}>
        <Suspense fallback={<ProgressRingSkeleton />}>
          <ProgressRing
            widgetTitle={widgetTitle}
            legendValues={legendValues}
            startingRange={startingRange}
            endingRange={endingRange}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isPreview={isPreview}
            projectId={projectId}
            isCreationMode={true}
            selectedSourceCharts={selectedSourceCharts}
            isValueDetectOn={isValueDetectOn}
            showLegend={showLegend}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<ProgressRingConfigurationSkeleton />}>
          <ProgressRingConfiguration
            widgetTitle={widgetTitle}
            setWidgetTitle={setWidgetTitle}
            startingRange={startingRange}
            setStartingRange={setStartingRange}
            endingRange={endingRange}
            setEndingRange={setEndingRange}
            numOfLegendDataSet={numOfLegendDataSet}
            setNumOfLegendDataSet={setNumOfLegendDataSet}
            legendValues={legendValues}
            setLegendValues={setLegendValues}
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

export default ProgressRingModule;
