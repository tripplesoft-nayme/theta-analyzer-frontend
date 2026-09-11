import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, useMemo, Suspense } from "react";

const HistogramChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Histogram/HistogramChart"));
const HistogramChartConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/HistogramChartConfiguration"));
import type { LegendValue } from "../Common/WidgetsConfiguration/HistogramChartConfiguration";
import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import HistogramChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Histogram/HistogramChartSkeleton";
import HistogramChartConfigurationSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Histogram/HistogramChartConfigurationSkeleton";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const HistogramChartModule = ({
  onDelete,
  chartName,
  isPreview = false,
  isProgramBuilder = false,
  height,
  layoutW,
  layoutH,
  orderIndex,
}: {
  onDelete?: () => void;
  chartName?: string;
  isPreview?: boolean;
  isProgramBuilder?: boolean;
  height?: number;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
}) => {
  const dispatch = useAppDispatch();
  const [widgetTitle, setWidgetTitle] = useState("Histogram Analysis");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(1);
  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "", field: "", color: "#8D79F6" },
  ]);

  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);
  const [binCount, setBinCount] = useState<number>(10);

  const generatedXAxisLabels = useMemo(() => {
    const labels: string[] = [];
    const step = Math.max(1, Math.round(binCount || 10));
    for (let cur = startingRange; cur < endingRange; cur += step) {
      labels.push(`${cur}-${Math.min(cur + step, endingRange)}`);
    }
    return labels;
  }, [startingRange, endingRange, binCount]);
  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: chartName || "histogram-chart",
        config: {
          widgetTitle,
          xAxisValues: generatedXAxisLabels,
          legendValues,
          numOfLegendDataSet,
          startingRange,
          endingRange,
          binCount,
          showLegend: true,
        },
      }),
    );
  }, [
    widgetTitle,
    generatedXAxisLabels,
    legendValues,
    numOfLegendDataSet,
    startingRange,
    endingRange,
    binCount,
    dispatch,
  ]);



  return (
    <div className="flex gap-3 h-full w-full min-h-0">
      <div className="flex-1 min-w-0 sticky top-5" style={{ height: height ? `${height}px` : "100%" }}>
        <Suspense fallback={<HistogramChartSkeleton />}>
          <HistogramChart
            widgetTitle={widgetTitle}
            xAxisValues={generatedXAxisLabels}
            legendValues={legendValues}
            numOfLegendDataSet={numOfLegendDataSet}
            startingRange={startingRange}
            endingRange={endingRange}
            binCount={binCount}
            showLegend={true}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isCreationMode={true}
            isPreview={isPreview}
            isProgramBuilder={isProgramBuilder}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<HistogramChartConfigurationSkeleton />}>
          <HistogramChartConfiguration
            widgetTitle={widgetTitle}
            setWidgetTitle={setWidgetTitle}
            binCount={binCount}
            setBinCount={setBinCount}
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
            isProgramBuilder={isProgramBuilder}
            layoutW={layoutW}
            layoutH={layoutH}
            orderIndex={orderIndex}
          />
        </Suspense>
      )}
    </div>
  );
};

export default HistogramChartModule;
