import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
const ParetoChart = lazyWithRetry(() => import("./ParetoChart"));
const WidgetForChartModuleThree = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleThree"));

import ParetoChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Pareto/ParetoChartSkeleton";
import WidgetForChartModuleThreeSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleThreeSkeleton";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetForChartModuleThree";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const ParetoChartModule = ({
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
  const { programId } = useAppSelector((state) => state.chartSlice);
  const location = useLocation();
  const isProgramBuilder =
    !!programId && location.pathname.includes("/program-builder");

  const [widgetTitle, setWidgetTitle] = useState("Pareto Chart");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);


  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    {
      label: "Value",
      field: "value",
      color: "#4F81BC",
    },
  ]);

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(1);

  // Aggregation State
  const [isValueDetectOn] = useState(false);
  const [selectedSourceCharts] = useState<any[]>([]);

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: "pareto-chart",
        config: {
          widgetTitle,
          xAxisValues: legendValues.map((l) => l.label),
          legendValues,
          numOfLegendDataSet,
          isValueDetectOn,
          selectedSourceCharts,
        },
      }),
    );
  }, [
    widgetTitle,
    legendValues,
    numOfLegendDataSet,
    isValueDetectOn,
    selectedSourceCharts,
    dispatch,
  ]);



  return (
    <div className="flex gap-3 h-full w-full min-h-0">
      <div className="flex-1 min-w-0 sticky top-5 min-h-[150px]" style={{ height: height ? `${height}px` : "100%" }}>
        <Suspense fallback={<ParetoChartSkeleton />}>
          <ParetoChart
            widgetTitle={widgetTitle}
            xAxisValues={legendValues.map((l) => l.label)}
            legendValues={legendValues}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isCreationMode={true}
            isPreview={isPreview}
            height={height}
            isValueDetection={isValueDetectOn}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<WidgetForChartModuleThreeSkeleton />}>
          <WidgetForChartModuleThree
            widgetTitle={widgetTitle}
            setWidgetTitle={setWidgetTitle}
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
            widgetCategory="PARETO"
          />
        </Suspense>
      )}
    </div>
  );
};

export default ParetoChartModule;