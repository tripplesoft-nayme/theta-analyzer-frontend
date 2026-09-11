import { useState, useEffect } from "react";
import { LegendValue } from "@/Common/Charts/CompletedCharts/Common/WidgetsConfiguration/WidgetForChartModuleOne";
import WidgetForChartModuleTwo from "@/Common/Charts/CompletedCharts/Common/WidgetsConfiguration/WidgetForChartModuleTwo";
import PieChart from "@/Common/Charts/CompletedCharts/PieChart/PieChart";
import ProgressRingNew from "@/Common/Charts/CompletedCharts/ProgressRing/ProgressRing";
import HorizontalBarChartNew from "@/Common/Charts/HorizontalBarChartNew";
import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";

const ChartModuleTwo = ({
  chartName,
  onDelete,
  isPreview = false,
}: {
  chartName: string;
  onDelete?: () => void;
  isPreview?: boolean;
}) => {
  const dispatch = useAppDispatch();
  const [widgetTitle, setWidgetTitle] = useState("My-CSV");

  const [numOfLegendDataSet, setNumOfLegendDataSet] = useState<number>(3);

  const [legendValues, setLegendValues] = useState<LegendValue[]>([
    { label: "", field: "", color: "#13A490" },
    { label: "", field: "", color: "#35B6EE" },
    { label: "", field: "", color: "#6F78F9" },
  ]);
  const [startingRange, setStartingRange] = useState<number>(0); //this is not for pic chart means it is optional
  const [endingRange, setEndingRange] = useState<number>(100); //this is not for pic chart means it is optional

  useEffect(() => {
    dispatch(
      setWidgetConfig({
        id: chartName,
        config: {
          widgetTitle,
          legendValues,
          numOfLegendDataSet,
          startingRange,
          endingRange,
        },
      }),
    );
  }, [
    chartName,
    widgetTitle,
    legendValues,
    numOfLegendDataSet,
    startingRange,
    endingRange,
    dispatch,
  ]);

  return (
    <div className="flex justify-between gap-3">
      <div className="flex-1">
        {(() => {
          if (chartName === "pie-chart") {
            return (
              <PieChart
                widgetTitle={widgetTitle}
                legendValues={legendValues}
                onDelete={onDelete}
                isPreview={isPreview}
              />
            );
          } else if (chartName === "progress-ring-chart") {
            return (
              <ProgressRingNew
                widgetTitle={widgetTitle}
                legendValues={legendValues}
                startingRange={startingRange}
                endingRange={endingRange}
                onDelete={onDelete}
                isPreview={isPreview}
              />
            );
          } else if (chartName === "horizontal-bar-chart") {
            return (
              <HorizontalBarChartNew
                widgetTitle={widgetTitle}
                legendValues={legendValues}
                startingRange={startingRange}
                endingRange={endingRange}
                onDelete={onDelete}
                isPreview={isPreview}
              />
            );
          }
          return null;
        })()}
      </div>

      {!isPreview && (
        <WidgetForChartModuleTwo
          widgedName={
            chartName === "pie-chart"
              ? "Pie Chart"
              : chartName === "progress-ring-chart"
                ? "Progress Ring Chart"
                : ""
          }
          widgetTitle={widgetTitle}
          widgetCategory={
            chartName === "stacked-bar-chart"
              ? "BAR"
              : chartName === "area-chart"
                ? "AREA"
                : chartName === "line-chart"
                  ? "LINE"
                  : chartName === "heat-map-chart"
                    ? "HEATMAP"
                    : "BAR"
          }
          setWidgetTitle={setWidgetTitle}
          numOfLegendDataSet={numOfLegendDataSet}
          setNumOfLegendDataSet={setNumOfLegendDataSet}
          legendValues={legendValues}
          setLegendValues={setLegendValues}
          startingRange={startingRange}
          setStartingRange={setStartingRange}
          endingRange={endingRange}
          setEndingRange={setEndingRange}
        />
      )}
    </div>
  );
};

export default ChartModuleTwo;
