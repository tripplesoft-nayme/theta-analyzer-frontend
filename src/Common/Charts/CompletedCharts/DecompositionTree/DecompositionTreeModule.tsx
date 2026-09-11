import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, Suspense } from "react";
const DecompositionTreeChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/DecompositionTree/DecompositionTreeChart"));
const TreeConfiguration = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Common/WidgetsConfiguration/TreeConfiguration"));

import DecompositionTreeSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/DecompositionTree/DecompositionTreeSkeleton";
import DecompositionTreeConfigurationSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/DecompositionTree/DecompositionTreeConfigurationSkeleton";
import { TreeDataNode } from "@/Common/Charts/CompletedCharts/DecompositionTree/DecompositionTreeChart";
import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

/** Clean sample tree — no legacy `value` field. Only value1 + value2. */
const buildSampleTree = (): TreeDataNode => ({
  id: "root",
  name: "Total Sales",
  value1: 1000000,
  value2: 700000,
  color: "#8b5cf6",
  children: [
    {
      id: "region-na",
      name: "North America",
      value1: 600000,
      value2: 400000,
      color: "#3b82f6",
      children: [
        {
          id: "usa",
          name: "USA",
          value1: 450000,
          value2: 300000,
          color: "#10b981",
        },
        {
          id: "canada",
          name: "Canada",
          value1: 150000,
          value2: 100000,
          color: "#06b6d4",
        },
      ],
    },
    {
      id: "region-eu",
      name: "Europe",
      value1: 300000,
      value2: 150000,
      color: "#f59e0b",
      children: [
        {
          id: "uk",
          name: "UK",
          value1: 120000,
          value2: 60000,
          color: "#ef4444",
        },
        {
          id: "germany",
          name: "Germany",
          value1: 100000,
          value2: 50000,
          color: "#ec4899",
        },
        {
          id: "france",
          name: "France",
          value1: 80000,
          value2: 40000,
          color: "#8b5cf6",
        },
      ],
    },
    {
      id: "region-asia",
      name: "Asia",
      value1: 100000,
      value2: 50000,
      color: "#14b8a6",
    },
  ],
});

const DecompositionTreeModule = ({
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
  const [widgetTitle, setWidgetTitle] = useState("Sales Decomposition");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);
  const [treeData, setTreeData] = useState<TreeDataNode>(buildSampleTree());

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: "decomposition-tree",
        config: {
          widgetTitle,
          treeData,
        },
      }),
    );
  }, [widgetTitle, treeData, dispatch]);

  return (
    <div className="flex gap-3 h-full w-full">
      <div
        className="flex-1 h-fit min-w-0 sticky top-5 self-start"
        style={{ height: height ? `${height}px` : "auto" }}
      >
        <Suspense fallback={<DecompositionTreeSkeleton />}>
          <DecompositionTreeChart
            widgetTitle={widgetTitle}
            data={treeData}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isPreview={isPreview}
            isCreationMode={true}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<DecompositionTreeConfigurationSkeleton />}>
          <TreeConfiguration
            widgetTitle={widgetTitle}
            setWidgetTitle={setWidgetTitle}
            treeData={treeData}
            onTreeDataChange={setTreeData}
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

export default DecompositionTreeModule;
