import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, Suspense } from "react";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";
import BoxPlotChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/BoxWhiskerplot/BoxPlotChartSkeleton";
import BoxPlotChartConfigurationSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/BoxWhiskerplot/BoxPlotChartConfigurationSkeleton";

const BoxPlotChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/BoxWhiskerplot/BoxPlotChart"));
const BoxPlotChartConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/BoxPlotChartConfiguration"));

export type BoxPlotData = {
  x: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
};

type BoxPlotChartModuleProps = {
  onDelete?: () => void;
  chartName?: string;
  onSaveSuccess?: () => void;
  isPreview?: boolean;
  height?: number;
  isProgramBuilder?: boolean;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
};

const BoxPlotChartModule = ({
  onDelete,
  chartName,
  onSaveSuccess,
  isPreview = false,
  height,
  isProgramBuilder = false,
  layoutW,
  layoutH,
  orderIndex,
}: BoxPlotChartModuleProps) => {
  const [widgetTitle, setWidgetTitle] = useState("Box & Whisker Plot");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  // Initial dummy data for the creation placeholder
  // Initial dummy data for the creation placeholder
  const [data, setData] = useState<BoxPlotData[]>([
    {
      x: "Group A",
      min: 10,
      q1: 20,
      median: 35,
      q3: 50,
      max: 70,
      outliers: [5, 85],
    },
    {
      x: "Group B",
      min: 15,
      q1: 25,
      median: 40,
      q3: 55,
      max: 75,
      outliers: [8, 90],
    },
  ]);

  const handleSaveSuccess = () => {
    handleCloseWidget();
    onSaveSuccess?.();
  };

  const colors = [
    "#8D79F6",
    "#35B6EE",
    "#13A490",
    "#F26419",
    "#6F78F9",
    "#E63946",
  ];
  const xAxis = JSON.stringify([
    ["Label", "min", "q1", "median", "q3", "max", "outliers", "color"],
    ...data.map((d, idx) => [
      d.x,
      d.min,
      d.q1,
      d.median,
      d.q3,
      d.max,
      d.outliers || [],
      colors[idx % colors.length],
    ]),
  ]);

  const legendValues = ["min", "q1", "median", "q3", "max", "outliers"].map((lbl, idx) => ({
    label: lbl,
    field: lbl,
    color: colors[idx % colors.length],
  }));

  return (
    <div className="flex gap-4 h-full w-full">
      <div
        className="flex-1 min-w-0 h-full min-h-0 sticky top-5"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<BoxPlotChartSkeleton />}>
          <BoxPlotChart
            widgetTitle={widgetTitle}
            xAxis={xAxis}
            xAxisValues={data.map((d) => d.x)}
            legendValues={legendValues}
            height={height}
            onToggleWidget={handleToggleWidget}
            isPreview={isPreview}
            onDelete={onDelete}
            isCreationMode={true}
          />
        </Suspense>
      </div>

      {!isPreview && showWidget && (
        <Suspense fallback={<BoxPlotChartConfigurationSkeleton />}>
          <BoxPlotChartConfiguration
            widgetTitle={widgetTitle}
            setWidgetTitle={setWidgetTitle}
            data={data}
            setData={setData}
            onClose={handleCloseWidget}
            onDelete={handleSaveSuccess}
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

export default BoxPlotChartModule;
