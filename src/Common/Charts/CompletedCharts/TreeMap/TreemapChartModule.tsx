import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import TreeMapSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/TreeMap/TreeMapSkeleton";
import WidgetForChartModuleThreeSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleThreeSkeleton";

// Components
const TreemapChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/TreeMap/TreemapChart"));
const WidgetForChartModuleThree = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleThree"));
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetForChartModuleThree";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const TreemapChartModule = ({
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

  const [widgetTitle, setWidgetTitle] = useState("Portfolio Distribution");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(3);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Category A", field: "categorya", color: "#3B93A5" },
    { label: "Category B", field: "categoryb", color: "#F7B844" },
    { label: "Category C", field: "categoryc", color: "#ADD8C7" },
  ]);

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: "treemap-chart",
        config: {
          widgetTitle,
          legendValues,
          numOfLegendDataSet,
          showLegend,
        },
      }),
    );
  }, [widgetTitle, legendValues, numOfLegendDataSet, showLegend, dispatch]);



  return (
    <div className="flex gap-3 h-full w-full">
      <div
        className="flex-1 h-full sticky top-5"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<TreeMapSkeleton />}>
          <TreemapChart
            widgetTitle={widgetTitle}
            legendValues={legendValues}
            numOfLegendDataSet={numOfLegendDataSet}
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
            widgetCategory="TREEMAP"
            showLegend={showLegend}
            setShowLegend={setShowLegend}
          />
        </Suspense>
      )}
    </div>
  );
};

export default TreemapChartModule;
