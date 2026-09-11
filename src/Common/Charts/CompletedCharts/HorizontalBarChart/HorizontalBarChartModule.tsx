import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, Suspense } from "react";
const ProjectConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/WidgetForChartModuleOne"));
const HorizontalBarChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/HorizontalBarChart/HorizontalBarChart"));

import HorizontalBarChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/HorizontalBarChart/HorizontalBarChartSkeleton";
import WidgetForChartModuleOneSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Widgets/WidgetForChartModuleOneSkeleton";
import type { LegendValue } from "../Common/WidgetsConfiguration/WidgetForChartModuleOne";
import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

const HorizontalBarChartModule = ({
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
  const isSimpleBar = chartName?.startsWith("horizontal-bar-chart");
  const [widgetTitle, setWidgetTitle] = useState(
    isSimpleBar ? "Horizontal Bar Chart" : "Horizontal Stacked Bar Chart",
  );
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState<number>(1);
  const [xAxisValues, setXAxisValues] = useState<string[]>([]);

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(3);

  const [legendValues, setLegendValues] = useState<LegendValue[]>(
    isSimpleBar
      ? [
        { label: "1", field: "1", color: "#13A490" },
        { label: "2", field: "2", color: "#35B6EE" },
        { label: "3", field: "3", color: "#6F78F9" },
      ]
      : [
        { label: "Project A", field: "projecta", color: "#13A490" },
        { label: "Project B", field: "projectb", color: "#35B6EE" },
        { label: "Project C", field: "projectc", color: "#6F78F9" },
      ],
  );
  const [startingRange, setStartingRange] = useState<number>(0);
  const [endingRange, setEndingRange] = useState<number>(100);

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: chartName || "horizontal-bar-chart",
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
    chartName,
  ]);

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
      // Adding empty values if increased
      while (updated.length < value) {
        updated.push("");
      }
      // Removing extra values if decreased
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

  // Toggle widget visibility

  // Close widget (for X button)

  return (
    <div className="flex gap-3 h-full">
      <div
        className="flex-1 h-full sticky top-5"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<HorizontalBarChartSkeleton />}>
          <HorizontalBarChart
            widgetTitle={widgetTitle}
            xAxisValues={xAxisValues}
            legendValues={legendValues}
            startingRange={startingRange}
            endingRange={endingRange}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isPreview={isPreview}
            isCreationMode={true}
            isStacked={!isSimpleBar}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<WidgetForChartModuleOneSkeleton />}>
          <ProjectConfiguration
            widgedName={isSimpleBar ? "Horizontal Bar" : "Horizontal Stacked Bar"}
            widgetTitle={widgetTitle}
            widgetCategory="SIMPLE_HORIZONTAL_BAR"
            isRestricted={false}
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
          />
        </Suspense>
      )}
    </div>
  );
};

export default HorizontalBarChartModule;
