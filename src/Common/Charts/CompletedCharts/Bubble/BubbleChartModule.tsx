import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, Suspense } from "react";
const BubbleChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Bubble/BubbleChart"));
const WidgetForChartModuleOne = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleOne"));

import BubbleChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Bubble/BubbleChartSkeleton";
import WidgetForChartModuleOneSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleOneSkeleton";
import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

export type LegendValue = {
  label: string;
  field: string;
  color: string;
};

const BubbleChartModule = ({
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
  const [widgetTitle, setWidgetTitle] = useState("Bubble Chart");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState<number>(1);
  const [xAxisValues, setXAxisValues] = useState<string[]>([""]);

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(3);
  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Category A", field: "categorya", color: "#8D79F6" },
    { label: "Category B", field: "categoryb", color: "#169E7B" },
    { label: "Category C", field: "categoryc", color: "#DA4352" },
  ]);

  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: "bubble-chart",
        config: {
          widgetTitle,
          xAxisValues,
          legendValues,
          numOfLegendDataSet,
          startingRange,
          endingRange,
          showLegend,
        },
      }),
    );
  }, [
    widgetTitle,
    xAxisValues,
    legendValues,
    numOfLegendDataSet,
    startingRange,
    endingRange,
    showLegend,
    dispatch,
  ]);

  const handleSetNumOfXAxisDataSet = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(e.target.value, 10);
    const minXaxisField = 1;

    if (!isNaN(value) && value >= minXaxisField) {
      setNumOfXAxisDataSet(value);
      setXAxisValues((prev) => {
        const updated = [...prev];
        while (updated.length < value) updated.push("");
        return updated.slice(0, value);
      });
    } else {
      setNumOfXAxisDataSet(1);
    }
  };

  const handleXAxisValueChange = (index: number, value: string) => {
    setXAxisValues((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };



  return (
    <div className="flex gap-4 h-full w-full">
      <div
        className="flex-1 min-w-0 h-full min-h-0 sticky top-5"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<BubbleChartSkeleton />}>
          <BubbleChart
            widgetTitle={widgetTitle}
            xAxisValues={xAxisValues}
            legendValues={legendValues}
            numOfLegendDataSet={numOfLegendDataSet}
            startingRange={startingRange}
            endingRange={endingRange}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isPreview={isPreview}
            isCreationMode={true}
            showLegend={showLegend}
          />
        </Suspense>
      </div>
      {showWidget && (
        <div className="">
          <Suspense fallback={<WidgetForChartModuleOneSkeleton />}>
            <WidgetForChartModuleOne
              widgedName="Bubble Chart"
              widgetTitle={widgetTitle}
              widgetCategory="BUBBLE"
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
        </div>
      )}
    </div>
  );
};

export default BubbleChartModule;
