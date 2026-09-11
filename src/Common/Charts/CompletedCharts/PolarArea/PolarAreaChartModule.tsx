import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";

// Components
const PolarAreaChart = lazyWithRetry(() => import("./PolarAreaChart"));
const WidgetForChartModuleThree = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleThree"));

import PolarAreaChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/PolarArea/PolarAreaChartSkeleton";
import WidgetForChartModuleThreeSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleThreeSkeleton";
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetForChartModuleThree";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const PolarAreaChartModule = ({
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

  const [widgetTitle, setWidgetTitle] = useState("Marketing Performance");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  // Scale Range State
  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);

  // Slices Configuration
  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(5);
  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Awareness", field: "awareness", color: "#13A490" },
    { label: "Interest", field: "interest", color: "#35B6EE" },
    { label: "Decision", field: "decision", color: "#6F78F9" },
    { label: "Purchase", field: "purchase", color: "#F26419" },
    { label: "Loyalty", field: "loyalty", color: "#F6AE2D" },
  ]);

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: "polar-area-chart",
        config: {
          widgetTitle,
          legendValues,
          numOfLegendDataSet,
          startingRange,
          endingRange,
        },
      }),
    );
  }, [
    widgetTitle,
    legendValues,
    numOfLegendDataSet,
    startingRange,
    endingRange,
    dispatch,
  ]);



  return (
    <div className="flex gap-3 h-full w-full min-h-0">
      <div
        className="flex-1 min-w-0 sticky top-5"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<PolarAreaChartSkeleton />}>
          <PolarAreaChart
            widgetTitle={widgetTitle}
            legendValues={legendValues}
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
        <Suspense fallback={<WidgetForChartModuleThreeSkeleton />}>
          <WidgetForChartModuleThree
            widgetTitle={widgetTitle}
            setWidgetTitle={setWidgetTitle}
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
            isProgramBuilder={isProgramBuilder}
              layoutW={layoutW}
              layoutH={layoutH}
              orderIndex={orderIndex}
            widgetCategory="POLAR_AREA"
          />
        </Suspense>
      )}
    </div>
  );
};

export default PolarAreaChartModule;
