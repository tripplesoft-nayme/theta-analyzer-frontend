/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useGetChartTitleIdMutation } from "@/store/Api/ProgramApi/ProgramApi";
import { DownloadAndSaveCSVforModuleOneWidget } from "@/utils/Download&SaveCSV";
import AddTierModal from "../CompletedCharts/Common/Modal/AddTierModal";
import TierChartModal from "../CompletedCharts/Common/Modal/TierChartModal";
import ChartCardWrapper from "../CompletedCharts/Common/ChartCardWrapper";

/*       TYPES       */

type GanttDataPoint = {
  x: string;
  y: [number, number];
  fillColor: string;
};

type LegendValue = {
  label: string;
  field: string;
  color: string;
};

export type TierChart = {
  id: string;
  name: string;
  legendValues: LegendValue[];
  children: TierChart[];
};

type Props = {
  widgetTitle?: string;
  legendValues?: LegendValue[];
  numOfLegendDataSet?: number;
  onToggleWidget?: () => void;
  onDelete?: () => void;
  tierLevel?: number;
  chartId?: string;
  isPreview?: boolean;
};

/*       HELPER FUNCTIONS       */

const generateId = () =>
  crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 10);

const generateRandomDateRange = (
  baseDate: Date,
  index: number,
): [number, number] => {
  const startDaysOffset = index * 3; // Each task starts 3 days after previous
  const durationDays = Math.floor(Math.random() * 5) + 2; // 2-6 days duration

  const startDate = new Date(baseDate);
  startDate.setDate(startDate.getDate() + startDaysOffset);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);

  return [startDate.getTime(), endDate.getTime()];
};

const calculateDaysDiff = (start: number, end: number): number => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end - start) / msPerDay);
};

/*       COMPONENT       */

export default function GanttChartNew({
  widgetTitle = "Project Timeline",
  legendValues = [],
  numOfLegendDataSet = 1,
  onToggleWidget,
  onDelete,
  tierLevel = 0,
  chartId = "root",
  isPreview = false,
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Tier management states
  const [showAddTierModal, setShowAddTierModal] = useState(false);
  const [childTiers, setChildTiers] = useState<TierChart[]>([]);
  const [showChildrenModal, setShowChildrenModal] = useState(false);

  const [getChartTitleId] = useGetChartTitleIdMutation();

  /*   DATA GENERATION   */
  const ganttData: GanttDataPoint[] = useMemo(() => {
    if (!legendValues.length) return [];

    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    return legendValues
      .filter((l) => l.label)
      .map((l, index) => {
        const [start, end] = generateRandomDateRange(baseDate, index);
        return {
          x: l.label,
          y: [start, end],
          fillColor: l.color,
        };
      });
  }, [legendValues]);

  /*   CHART OPTIONS   */
  const chartOptions: any = useMemo(
    () => ({
      chart: {
        height: 350,
        type: "rangeBar",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
          dataLabels: {
            hideOverflowingLabels: false,
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: any, opts: any) {
          const label = opts.w.globals.labels[opts.dataPointIndex];
          const diff = calculateDaysDiff(val[0], val[1]);
          return label + ": " + diff + (diff > 1 ? " days" : " day");
        },
        style: {
          colors: ["#f3f4f5", "#fff"],
        },
      },
      xaxis: {
        type: "datetime",
      },
      yaxis: {
        show: false,
      },
      grid: {
        row: {
          colors: ["#f3f4f5", "#fff"],
          opacity: 1,
        },
      },
      legend: {
        show: false,
      },
    }),
    [],
  );

  const series = useMemo(
    () => [
      {
        data: ganttData,
      },
    ],
    [ganttData],
  );

  /*   ACTIONS   */

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(ganttData, null, 2));
  };

  const handleDownload = () => {
    const csvId = generateId();

    const payload = {
      numberOfDataset: numOfLegendDataSet,
      firstFieldDataset: 0,
      lastFieldDataset: 100,
      showWidgets: legendValues.map((l) => ({
        legend_name: l.label,
        color: l.color,
      })),
      title: widgetTitle,
      status: "ACTIVE",
      category: "GANTT",
      xAxis: JSON.stringify({
        labels: [],
        values: [],
      }),
      yAxis: JSON.stringify({}),
      zAxis: JSON.stringify({}),
    };
    setIsDownloading(true);

    // For CSV export with labels and date ranges
    const header = "Task,Start Date,End Date,Duration (days)";
    const rows = ganttData.map((item) => {
      const startDate = new Date(item.y[0]).toISOString().split("T")[0];
      const endDate = new Date(item.y[1]).toISOString().split("T")[0];
      const duration = calculateDaysDiff(item.y[0], item.y[1]);
      return `${item.x},${startDate},${endDate},${duration}`;
    });

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${widgetTitle}-${csvId}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    // Also save to backend
    DownloadAndSaveCSVforModuleOneWidget(
      payload,
      getChartTitleId,
      widgetTitle,
      [],
      legendValues,
    );

    setIsDownloading(false);
  };

  const handleAddTierClick = () => {
    setShowAddTierModal(true);
  };

  const handleSaveTier = (tierName: string) => {
    const newTier: TierChart = {
      id: `${chartId}-tier-${Date.now()}`,
      name: tierName,
      legendValues: legendValues,
      children: [],
    };
    setChildTiers([...childTiers, newTier]);
    setShowAddTierModal(false);
  };

  const handleChartClick = () => {
    if (childTiers.length > 0) {
      setShowChildrenModal(true);
    }
  };

  /*   RENDER   */

  return (
    <>
      <ChartCardWrapper
        title={widgetTitle}
        tierLevel={tierLevel}
        onHeaderClick={handleChartClick}
        menuActions={{
          onCopy: handleCopy,
          onDownload: handleDownload,
          onDelete: onDelete,
          onAddTier: handleAddTierClick,
          onToggleWidget: onToggleWidget,
        }}
        isDownloading={isDownloading}
        isPreview={isPreview}
        footer={
          childTiers.length > 0 ? (
            <p className="text-sm text-blue-600 font-medium text-center">
              Click chart to view {childTiers.length} child tier
              {childTiers.length > 1 ? "s" : ""}
            </p>
          ) : undefined
        }
      >
        {/* Task Timeline Legend */}
        <div className="flex gap-8 mb-6 flex-wrap">
          {ganttData.map((item) => {
            const duration = calculateDaysDiff(item.y[0], item.y[1]);
            return (
              <div key={item.x} className="flex items-baseline gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: item.fillColor }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">{item.x}</p>
                  <p className="text-xs text-gray-500">
                    {duration} {duration > 1 ? "days" : "day"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gantt Chart */}
        {ganttData.length > 0 ? (
          <div style={{ height: "400px", width: "100%" }}>
            <ReactApexChart
              options={chartOptions as any}
              series={series}
              type="rangeBar"
              height={350}
            />
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-gray-400">
            No data available.
          </div>
        )}
      </ChartCardWrapper>

      {/* Add Tier Modal */}
      <AddTierModal
        isOpen={showAddTierModal}
        onClose={() => setShowAddTierModal(false)}
        onSave={handleSaveTier}
        parentChartName={widgetTitle}
      />

      {/* Children Grid Modal */}
      {showChildrenModal && (
        <TierChartModal
          isOpen={showChildrenModal}
          onClose={() => setShowChildrenModal(false)}
          tierLevel={tierLevel + 1}
          title={widgetTitle}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {childTiers.map((tier) => (
              <GanttChartNew
                key={tier.id}
                widgetTitle={tier.name}
                legendValues={tier.legendValues}
                numOfLegendDataSet={tier.legendValues.length}
                tierLevel={tierLevel + 1}
                chartId={tier.id}
                isPreview={isPreview}
                onDelete={onDelete}
              />
            ))}
          </div>
        </TierChartModal>
      )}
    </>
  );
}
