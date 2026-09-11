import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useEffect, useRef, Suspense } from "react";
const CalendarHeatmapChart = lazyWithRetry(() => import("./CalendarHeatmapChart"));
const CalendarHeatmapConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/CalendarHeatmapConfiguration"));

import CalendarHeatMapSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/CalendarHeatMap/CalendarHeatMapSkeleton";
import CalendarHeatmapConfigurationSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/CalendarHeatMap/CalendarHeatmapConfigurationSkeleton";
import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

export type LegendValue = {
  label: string;
  field: string;
  color: string;
};

const CalendarHeatmapChartModule = ({
  onDelete,
  chartName,
  isPreview = false,
  isProgramBuilder = false,
  height,
  layoutW,
  layoutH,
  orderIndex,
}: {
  onDelete?: () => void;
  chartName?: string;
  isPreview?: boolean;
  isProgramBuilder?: boolean;
  height?: number;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
}) => {
  const dispatch = useAppDispatch();
  const [widgetTitle, setWidgetTitle] = useState("Activity Calendar");
  const [localTitle, setLocalTitle] = useState("Activity Calendar"); // draft — no rerender on each keystroke
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);
  const [yAxis, setYAxis] = useState(
    JSON.stringify({ year: new Date().getFullYear().toString() }),
  );

  const [legendValues, setLegendValues] = useState<any[]>([
    { label: "Activity", field: "activity", color: "#216e39" },
  ]);

  // Debounce: only commit the title (triggering dispatch) after user pauses 400ms
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTitleChange = (val: string) => {
    setLocalTitle(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setWidgetTitle(val), 400);
  };

  // Debounce Redux dispatch so rapid changes (e.g. color picker dragging) don't flood the store
  const dispatchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (dispatchDebounceRef.current) clearTimeout(dispatchDebounceRef.current);
    dispatchDebounceRef.current = setTimeout(() => {
      dispatch(
        setWidgetConfig({
          id: "calendar-heatmap",
          config: {
            widgetTitle,
            legendValues,
            numOfLegendDataSet: 1,
            startingRange: 0,
            endingRange: 100,
            yAxis,
          },
        }),
      );
    }, 200);

    return () => {
      if (dispatchDebounceRef.current) clearTimeout(dispatchDebounceRef.current);
    };
  }, [widgetTitle, legendValues, yAxis, dispatch]);



  return (
    <div className="flex gap-3 h-full w-full">
      <div
        className="flex-1 h-full sticky top-5"
        style={{ height: height ? `${height}px` : "100%" }}
      >
        <Suspense fallback={<CalendarHeatMapSkeleton />}>
          <CalendarHeatmapChart
            widgetTitle={widgetTitle}
            legendValues={legendValues}
            yAxis={yAxis}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isPreview={isPreview}
            isProgramBuilder={isProgramBuilder}
            isCreationMode={true}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<CalendarHeatmapConfigurationSkeleton />}>
          <CalendarHeatmapConfiguration
            widgedName="Calendar Heatmap"
            widgetTitle={localTitle}
            setWidgetTitle={handleTitleChange}
            legendValues={legendValues}
            setLegendValues={setLegendValues}
            yAxis={yAxis}
            setYAxis={setYAxis}
            isProgramBuilder={isProgramBuilder}
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

export default CalendarHeatmapChartModule;
