import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, Suspense } from "react";
const WidgetForChartModuleOne = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleOne"));
const ScatterChart = lazyWithRetry(() => import("./ScatterChart"));

import ScatterChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Scatter/ScatterChartSkeleton";
import WidgetForChartModuleOneSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleOneSkeleton";
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetForChartModuleOne";
import { toast } from "sonner";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const ScatterChartModule = ({
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
  const [widgetTitle, setWidgetTitle] = useState("Scatter Chart");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  /* ---- X-Axis state ---- */
  const minXaxisField = 1;

  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState<number>(3);
  const [xAxisValues, setXAxisValues] = useState<string[]>(["", "", ""]);

  /* ---- Legend state ---- */
  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(2);
  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "", field: "", color: "#8884d8" },
    { label: "", field: "", color: "#82ca9d" },
  ]);

  /* ---- Range state ---- */
  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);
  const [showLegend, setShowLegend] = useState(true);

  /* ---- X-Axis count handler ---- */
  const handleSetNumOfXAxisDataSet = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) return;

    if (value < minXaxisField) {
      toast.error(
        `Please enter a number greater than or equal to ${minXaxisField}`,
      );
      return;
    }

    setNumOfXAxisDataSet(value);
    setXAxisValues((prev) => {
      const updated = [...prev];
      while (updated.length < value) {
        updated.push("");
      }
      return updated.slice(0, value);
    });
  };

  /* ---- X-Axis value change handler ---- */
  const handleXAxisValueChange = (index: number, value: string) => {
    setXAxisValues((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  /* ---- Widget toggle ---- */


  return (
    <div className="flex gap-3 h-full w-full">
      <div
        className="flex-1 min-w-0 h-full sticky top-5"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<ScatterChartSkeleton />}>
          <ScatterChart
            widgetTitle={widgetTitle}
            xAxisValues={xAxisValues}
            legendValues={legendValues}
            numOfLegendDataSet={numOfLegendDataSet}
            startingRange={startingRange}
            endingRange={endingRange}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isCreationMode={true}
            isPreview={isPreview}
            showLegend={showLegend}
          />
        </Suspense>
      </div>

      {showWidget && (
        <Suspense fallback={<WidgetForChartModuleOneSkeleton />}>
          <WidgetForChartModuleOne
            widgedName="Scatter Chart"
            widgetTitle={widgetTitle}
            widgetCategory="SCATTER"
            setWidgetTitle={setWidgetTitle}
            numOfXAxisDataSet={numOfXAxisDataSet}
            handleSetNumOfXAxisDataSet={handleSetNumOfXAxisDataSet}
            xAxisValues={xAxisValues}
            handleXAxisValueChange={handleXAxisValueChange}
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

export default ScatterChartModule;
