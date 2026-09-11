import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";

const BulletChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Bullet/BulletChart"));
const WidgetForChartModuleThree = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleThree"));

import BulletChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Bullet/BulletChartSkeleton";
import WidgetForChartModuleThreeSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleThreeSkeleton";
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetForChartModuleThree";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const BulletChartModule = ({
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

  const [widgetTitle, setWidgetTitle] = useState("Bullet Performance");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  // Initial set of legend values (metrics)
  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Revenue", field: "revenue", color: "#3b82f6" },
    { label: "Expansion", field: "expansion", color: "#10b981" },
    { label: "Support", field: "support", color: "#f59e0b" },
  ]);

  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);
  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(3);

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: "bullet-chart",
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
        <Suspense fallback={<BulletChartSkeleton />}>
          <BulletChart
            widgetTitle={widgetTitle}
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
        <Suspense fallback={<WidgetForChartModuleThreeSkeleton />}>
          <WidgetForChartModuleThree
            widgetTitle={widgetTitle}
            setWidgetTitle={setWidgetTitle}
            legendValues={legendValues}
            setLegendValues={setLegendValues}
            numOfLegendDataSet={numOfLegendDataSet}
            setNumOfLegendDataSet={setNumOfLegendDataSet}
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
            widgetCategory="BULLET"
          />
        </Suspense>
      )}
    </div>
  );
};

export default BulletChartModule;
