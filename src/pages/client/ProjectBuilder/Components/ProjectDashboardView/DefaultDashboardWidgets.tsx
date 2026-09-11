
import ApexColumnChart from "@/Common/Charts/ApexColumnChart";
import { DoughnutChart, HeatmapChart, KpiModule } from "../ChartRegistry";

export interface DefaultDashboardWidgetsProps {
  showDefaultCharts: boolean;
  hasTableData: boolean;
  hasFilesData: boolean;
  isReadOnly: boolean;
  isPreviewOrPublished: boolean;
  isContextEmpty: boolean;
  hiddenDefaultWidgets: string[];
  isProgramBuilder: boolean;
  resolvedProgramId?: string;
  resolvedProjectId?: string;
  handleDefaultDelete: (id: string) => void;
  handleDefaultCopy: (id: string) => void;
}

export const DefaultDashboardWidgets = ({
  showDefaultCharts,
  isReadOnly,
  isPreviewOrPublished,
  isContextEmpty,
  hiddenDefaultWidgets,
  isProgramBuilder,
  resolvedProgramId,
  resolvedProjectId,
  handleDefaultDelete,
  handleDefaultCopy,
}: DefaultDashboardWidgetsProps) => {
  if (
    !showDefaultCharts ||
    isReadOnly ||
    isPreviewOrPublished ||
    !isContextEmpty
  ) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-6 ">
      {!hiddenDefaultWidgets.includes("kpi") && (
        <KpiModule
          {...(isProgramBuilder
            ? { programId: resolvedProgramId }
            : { projectId: resolvedProjectId })}
          isPreview={isPreviewOrPublished || isReadOnly}
          onDelete={() => handleDefaultDelete("kpi")}
        />
      )}

      <div className="flex gap-4">
        {!hiddenDefaultWidgets.includes("column-chart") && (
          <div className="flex-1 min-w-0">
            <ApexColumnChart
              title="Project Timeline"
              onDelete={() => handleDefaultDelete("column-chart")}
            />
          </div>
        )}
        {!hiddenDefaultWidgets.includes("doughnut-chart") && (
          <div className="flex-1 min-w-0">
            <DoughnutChart
              title="Doughnut Pie"
              centerLabel="Total Visitor"
              onDelete={() => handleDefaultDelete("doughnut-chart")}
              data={[
                {
                  name: "Paid traffic",
                  value: 65,
                  count: 12,
                  color: "#19A1E9",
                },
                {
                  name: "Social traffic",
                  value: 21,
                  count: 30,
                  color: "#F7AF21",
                },
                {
                  name: "Organic traffic",
                  value: 14,
                  count: 8,
                  color: "#10A683",
                },
              ]}
            />
          </div>
        )}
      </div>
      {!hiddenDefaultWidgets.includes("heat-map-chart") && (
        <HeatmapChart
          onDelete={() => handleDefaultDelete("heat-map-chart")}
          onCopy={() => handleDefaultCopy("Heat Map Chart")}
        />
      )}
    </div>
  );
};
