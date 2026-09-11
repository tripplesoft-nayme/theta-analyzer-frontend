import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useRef, useEffect, Suspense } from "react";
const CohortAnalysisChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/Cohort/CohortAnalysisChart"));
const CohortAnalysisConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/CohortAnalysisConfiguration"));

import CohortChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Cohort/CohortChartSkeleton";
import CohortAnalysisConfigurationSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/Cohort/CohortAnalysisConfigurationSkeleton";
import type { LegendValue } from "../Common/WidgetsConfiguration/CohortAnalysisConfiguration";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

type CohortAnalysisModuleProps = {
  onDelete?: () => void;
  onSaveSuccess?: () => void;
  chartName?: string;
  isPreview?: boolean;
  height?: number;
  programId?: string;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
};

const CohortAnalysisModule = ({
  onDelete,
  onSaveSuccess,
  chartName,
  isPreview = false,
  height,
  programId,
  layoutW,
  layoutH,
  orderIndex,
}: CohortAnalysisModuleProps) => {
  const isProgramBuilder = !!programId;
  const [widgetTitle, setWidgetTitle] = useState("Retention Cohort Survival");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  const [numOfXAxisDataSet, setNumOfXAxisDataSet] = useState<number>(5);
  const [xAxisValues, setXAxisValues] = useState<string[]>([
    "Total",
    "Month 0",
    "Month 1",
    "Month 2",
    "Month 3",
  ]);

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(3);
  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "Jan", field: "jan", color: "#6366f1", users: 600 },
    { label: "Mon", field: "mon", color: "#10b981", users: 400 },
    { label: "Tue", field: "tue", color: "#f59e0b", users: 100 },
  ]);

  const [showLegend, setShowLegend] = useState(true);

  // Sync xAxisValues array length when numOfXAxisDataSet changes
  useEffect(() => {
    setXAxisValues((prev) => {
      const next = [...prev];
      while (next.length < numOfXAxisDataSet) {
        next.push(`Month ${next.length - 1}`);
      }
      return next.slice(0, numOfXAxisDataSet);
    });
  }, [numOfXAxisDataSet]);

  const handleXAxisValueChange = (index: number, value: string) => {
    setXAxisValues((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };


  // Called by the config panel after a successful save — removes the temp canvas widget
  const handleSaveSuccess = () => {
    handleCloseWidget();
    onSaveSuccess?.();
  };

  return (
    <div className="flex gap-3 w-full">
      <div
        className="flex-1 min-w-0 min-h-[300px] sticky top-24 self-start"
        style={{ height: height ? `${height}px` : "auto" }}
      >
        <Suspense fallback={<CohortChartSkeleton />}>
          <CohortAnalysisChart
            widgetTitle={widgetTitle}
            xAxisValues={xAxisValues}
            legendValues={legendValues}
            numOfLegendDataSet={numOfLegendDataSet}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            isPreview={isPreview}
            isCreationMode={true}
            showLegend={showLegend}
          />
        </Suspense>
      </div>
      {showWidget && (
        <div className="flex-shrink-0 overflow-hidden" style={{ maxHeight: '100%' }}>
          <Suspense fallback={<CohortAnalysisConfigurationSkeleton />}>
            <CohortAnalysisConfiguration
              widgetTitle={widgetTitle}
              setWidgetTitle={setWidgetTitle}
              xAxisValues={xAxisValues}
              handleXAxisValueChange={handleXAxisValueChange}
              numOfXAxisDataSet={numOfXAxisDataSet}
              setNumOfXAxisDataSet={setNumOfXAxisDataSet}
              numOfLegendDataSet={numOfLegendDataSet}
              setNumOfLegendDataSet={setNumOfLegendDataSet}
              legendValues={legendValues}
              setLegendValues={setLegendValues}
              onDelete={handleSaveSuccess}
              onClose={handleCloseWidget}
              isProgramBuilder={isProgramBuilder}
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

export default CohortAnalysisModule;
