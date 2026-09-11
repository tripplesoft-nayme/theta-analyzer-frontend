import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, Suspense } from "react";
import MarimekkoChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Marimekko/MarimekkoChartSkeleton";
import WidgetForChartModuleOneSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleOneSkeleton";

const MarimekkoChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Marimekko/MarimekkoChart"));
const ProjectConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleOne"));
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetForChartModuleOne";
import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

type MarimekkoChartModuleProps = {
  onDelete?: () => void;
  chartName?: string;
  isPreview?: boolean;
  height?: number;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
};

const MarimekkoChartModule = ({
  onDelete,
  chartName,
  isPreview = false,
  height,
  layoutW,
  layoutH,
  orderIndex,
}: MarimekkoChartModuleProps) => {
  const dispatch = useAppDispatch();
  const [widgetTitle, setWidgetTitle] = useState("Marimekko Chart");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState<number>(3);
  const [xAxisValues, setXAxisValues] = useState<string[]>([
    "APAC",
    "EMEA",
    "Americas",
  ]);

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(2);
  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Product A", field: "p_a", color: "#8D79F6" },
    { label: "Product B", field: "p_b", color: "#10B981" },
  ]);

  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);

  // Prevent negative starting range values
  const handleSetStartingRange = (value: number) => {
    setStartingRange(Math.max(0, value));
  };
  const [showLegend, setShowLegend] = useState(true);

  // Sync with Redux for preview/creation
  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: "marimekko-chart",
        config: {
          widgetTitle,
          xAxisValues,
          legendValues,
          numOfLegendDataSet,
          startingRange,
          endingRange,
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
    dispatch,
  ]);

  // Initialize xAxisValues
  useEffect(() => {
    setXAxisValues((prev) => {
      if (prev.length < numOfXAxisDataSet) {
        const updated = [...prev];
        while (updated.length < numOfXAxisDataSet) {
          updated.push(`Category ${updated.length + 1}`);
        }
        return updated;
      } else if (prev.length > numOfXAxisDataSet) {
        return prev.slice(0, numOfXAxisDataSet);
      }
      return prev;
    });
  }, [numOfXAxisDataSet]);

  const handleSetNumOfXAxisDataSet = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 99) {
      setNumOfXAxisDataSet(value);
    }
  };

  const handleXAxisValueChange = (index: number, value: string) => {
    setXAxisValues((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };


  useEffect(() => {
    const handleCreated = (e: Event) => {
      if ((e as CustomEvent).detail === "marimekko-chart") {
        onDelete?.();
      }
    };
    window.addEventListener("chart-created", handleCreated);
    return () => window.removeEventListener("chart-created", handleCreated);
  }, [onDelete]);

  return (
    <div className="flex gap-3 h-full w-full min-h-0">
      <div
        className="flex-1 min-w-0 sticky top-5"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<MarimekkoChartSkeleton />}>
          <MarimekkoChart
            widgetTitle={widgetTitle}
            xAxisValues={xAxisValues}
            legendValues={legendValues}
            startingRange={startingRange}
            endingRange={endingRange}
            chartHeight={450}
            onToggleWidget={handleToggleWidget}
            isPreview={isPreview}
            onDelete={onDelete}
            isCreationMode={true}
          />
        </Suspense>
      </div>

      {showWidget && (
        <Suspense fallback={<WidgetForChartModuleOneSkeleton />}>
          <ProjectConfiguration
            widgedName="Marimekko Chart"
            widgetTitle={widgetTitle}
            widgetCategory="MARIMEKKO"
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
            setStartingRange={handleSetStartingRange}
            endingRange={endingRange}
            setEndingRange={setEndingRange}
            showLegend={showLegend}
            setShowLegend={setShowLegend}
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

export default MarimekkoChartModule;
