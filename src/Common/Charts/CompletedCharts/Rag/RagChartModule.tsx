import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, Suspense } from "react";
const RagChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Rag/RagChart"));
const WidgetForChartModuleOne = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleOne"));

import RagChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Rag/RagChartSkeleton";
import WidgetForChartModuleOneSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleOneSkeleton";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const RagChartModule = ({
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
  const projectId = useAppSelector((state) => state.chartSlice.projectId);

  // Configuration state mirroring WidgetForChartModuleOne requirements
  const [widgetTitle, setWidgetTitle] = useState("Performance Trend");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState(5);
  const [xAxisValues, setXAxisValues] = useState<string[]>([
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
  ]);

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState(1);
  const [legendValues, setLegendValues] = useState([
    { label: "Performance", field: "performance", color: "#6366f1" },
  ]);

  const [startingRange, setStartingRange] = useState(0); // Poor threshold
  const [endingRange, setEndingRange] = useState(100); // Good threshold
  const [showLegend, setShowLegend] = useState(true);

  // const sampleGenerator = (xAxis: string[], legends: LegendValue[]): any[] => {
  //   return xAxis.map((name) => {
  //     const row: any = { name };
  //     legends.forEach((l) => {
  //       row[l.field] = Math.floor(Math.random() * 100);
  //     });
  //     return row;
  //   });
  // };

  const handleXAxisValueChange = (index: number, value: string) => {
    setXAxisValues((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSetNumOfXAxisDataSet = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = parseInt(e.target.value) || 1;
    setNumOfXAxisDataSet(val);
    setXAxisValues((prev) => {
      const updated = [...prev];
      while (updated.length < val) updated.push("");
      return updated.slice(0, val);
    });
  };

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: "rag-chart",
        config: {
          widgetTitle,
          xAxisValues,
          legendValues,
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
    startingRange,
    endingRange,
    showLegend,
    dispatch,
  ]);

  return (
    <div className="flex gap-3 h-full w-full min-h-0">
      <div
        className="flex-1 min-w-0 sticky top-5"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<RagChartSkeleton />}>
          <RagChart
            widgetTitle={widgetTitle}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isPreview={isPreview}
            projectId={projectId}
            isCreationMode={true}
            // The component will use these from props or BaseChartContainer context
            xAxisValues={xAxisValues}
            legendValues={legendValues}
            startingRange={startingRange}
            endingRange={endingRange}
            showLegend={showLegend}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<WidgetForChartModuleOneSkeleton />}>
          <WidgetForChartModuleOne
            widgedName="RAG Chart"
            widgetTitle={widgetTitle}
            widgetCategory="RAG"
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

export default RagChartModule;
