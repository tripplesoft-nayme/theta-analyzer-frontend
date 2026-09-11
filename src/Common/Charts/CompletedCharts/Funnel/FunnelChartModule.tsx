import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";

const FunnelChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Funnel/FunnelChart"));
const WidgetForChartModuleThree = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleThree"));

import FunnelChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Funnel/FunnelChartSkeleton";
import WidgetForChartModuleThreeSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleThreeSkeleton";
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetForChartModuleThree";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const FunnelChartModule = ({
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

  const [widgetTitle, setWidgetTitle] = useState("Marketing Funnel");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  // Unified State for Funnel (Matching Pie Chart Pattern)
  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(3);
  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Impression", field: "impression", color: "#13A490" },
    { label: "Click", field: "click", color: "#35B6EE" },
    { label: "Convert", field: "convert", color: "#6F78F9" },
  ]);

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: "funnel-chart",
        config: {
          widgetTitle,
          legendValues,
          numOfLegendDataSet,
        },
      }),
    );
  }, [widgetTitle, legendValues, numOfLegendDataSet, dispatch]);



  return (
    <div className="flex gap-3 h-full w-full min-h-0">
      <div
        className="flex-1 min-w-0 sticky top-5"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<FunnelChartSkeleton />}>
          <FunnelChart
            widgetTitle={widgetTitle}
            legendValues={legendValues}
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
            onClose={handleCloseWidget}
            onDelete={onDelete}
            isProgramBuilder={isProgramBuilder}
              layoutW={layoutW}
              layoutH={layoutH}
              orderIndex={orderIndex}
            widgetCategory="FUNNEL"
          />
        </Suspense>
      )}
    </div>
  );
};

export default FunnelChartModule;
