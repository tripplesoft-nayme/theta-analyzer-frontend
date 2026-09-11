import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, Suspense } from "react";
const ProjectConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleOne"));
const WaterfallChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Waterfall/WaterfallChart"));

import WaterfallChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Waterfall/WaterfallChartSkeleton";
import WidgetForChartModuleOneSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleOneSkeleton";
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetForChartModuleOne";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

type WaterfallChartModuleProps = {
  onDelete?: () => void;
  chartName?: string;
  isPreview?: boolean;
  height?: number;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
};

const WaterfallChartModule = ({
  onDelete,
    chartName,
  isPreview = false,
  height,
  layoutW,
  layoutH,
  orderIndex,
}: WaterfallChartModuleProps) => {
  const [widgetTitle, setWidgetTitle] = useState("Waterfall Chart");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState<number>(3);
  const [xAxisValues, setXAxisValues] = useState<string[]>([]);

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(1);

  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "", field: "", color: "#008FFB" },
    { label: "", field: "", color: "#00E396" },
  ]);
  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);
  const [showLegend, setShowLegend] = useState(true);

  const minXaxisField = 1;

  const handleSetNumOfXAxisDataSet = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      setNumOfXAxisDataSet(1);
    } else if (value >= minXaxisField) {
      setNumOfXAxisDataSet(value);
    } else {
      setNumOfXAxisDataSet(1);
    }

    setXAxisValues((prev) => {
      const updated = [...prev];
      while (updated.length < value) {
        updated.push("");
      }
      return updated.slice(0, value);
    });
  };

  const handleXAxisValueChange = (index: number, value: string) => {
    setXAxisValues((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };



  return (
    <div className="flex gap-3 h-full w-full">
      <div className="flex-1 min-w-0 h-full sticky top-5" style={{ height: height ? `${height}px` : "100%" }}>
        <Suspense fallback={<WaterfallChartSkeleton />}>
          <WaterfallChart
            widgetTitle={widgetTitle}
            xAxisValues={xAxisValues}
            legendValues={legendValues}
            numOfLegendDataSet={numOfLegendDataSet}
            startingRange={startingRange}
            endingRange={endingRange}
            onToggleWidget={handleToggleWidget}
            isPreview={isPreview}
            onDelete={onDelete}
            isCreationMode={true}
            showLegend={showLegend}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<WidgetForChartModuleOneSkeleton />}>
          <ProjectConfiguration
            widgedName="Waterfall Chart"
            widgetTitle={widgetTitle}
            widgetCategory="WATERFALL"
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

export default WaterfallChartModule;
