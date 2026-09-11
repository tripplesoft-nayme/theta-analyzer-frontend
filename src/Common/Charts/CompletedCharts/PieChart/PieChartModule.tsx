import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useEffect, Suspense } from "react";
const PieChartConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/PieChartConfiguration"));
const PieChartWidget = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/PieChart/PieChart"));

import PieChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/PieChart/PieChartSkeleton";
import PieChartConfigurationSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/PieChart/PieChartConfigurationSkeleton";
import type { LegendValue } from "../Common/WidgetsConfiguration/PieChartConfiguration";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const PieChartModule = ({
  onDelete,
  isPreview = false,
  height,
  chartName,
  layoutW,
  layoutH,
  orderIndex,
}: {
  onDelete?: () => void;
  isPreview?: boolean;
  height?: number;
  chartName?: string;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
}) => {
  const dispatch = useAppDispatch();
  const projectId = useAppSelector((state) => state.chartSlice.projectId);
  const [widgetTitle, setWidgetTitle] = useState("My-Pie-Chart");
  const widgetId = chartName || "pie-chart";

  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview);

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(3);

  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Category A", field: "categorya", color: "#13A490" },
    { label: "Category B", field: "categoryb", color: "#35B6EE" },
    { label: "Category C", field: "categoryc", color: "#6F78F9" },
  ]);

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: widgetId,
        config: {
          widgetTitle,
          legendValues,
          numOfLegendDataSet,
        },
      }),
    );
  }, [widgetTitle, legendValues, numOfLegendDataSet, dispatch, widgetId]);

  return (
    <div className="flex gap-3 h-full w-full">
      <div className="flex-1 min-w-0 sticky top-5 h-full" style={{ height: height ? `${height}px` : "100%" }}>
        <Suspense fallback={<PieChartSkeleton />}>
          <PieChartWidget
            widgetTitle={widgetTitle}
            legendValues={legendValues}
            numOfLegendDataSet={numOfLegendDataSet}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isPreview={isPreview}
            projectId={projectId}
            isCreationMode={true}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<PieChartConfigurationSkeleton />}>
          <PieChartConfiguration
            widgetTitle={widgetTitle}
            setWidgetTitle={setWidgetTitle}
            numOfLegendDataSet={numOfLegendDataSet}
            setNumOfLegendDataSet={setNumOfLegendDataSet}
            legendValues={legendValues}
            setLegendValues={setLegendValues}
            onClose={handleCloseWidget}
            onDelete={onDelete}
            layoutW={layoutW}
            layoutH={layoutH}
            orderIndex={orderIndex}
          />
        </Suspense>
      )}
    </div>
  );
};

export default PieChartModule;

