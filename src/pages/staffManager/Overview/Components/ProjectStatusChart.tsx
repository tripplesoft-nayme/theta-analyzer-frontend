import { DonutChartSkeleton } from "@/Common/Skeleton/DonutChartSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetSubmissionStatusQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";
import { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@/Common/theme-provider";

export interface ProjectStatus {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

const STATUS_COLOR_MAP: Record<string, string> = {
  submitted: "#8B5CF6",
  live: "#10B981",
  returned: "#F59E0B",
  overdue: "#EF4444",
};

const STATUS_LABEL_MAP: Record<string, string> = {
  submitted: "Submitted",
  live: "Live",
  returned: "Returned",
  overdue: "Overdue",
};

const PERIOD_OPTIONS = [
  { value: "1", label: "This Month" },
  { value: "3", label: "This Quarter" },
  { value: "12", label: "This Year" },
];

export default function ProjectStatusChart() {
  const { theme } = useTheme();
  const [sortBy, setSortBy] = useState("12");

  const { data: submissionData, isLoading: submissionLoading } =
    useGetSubmissionStatusQuery({ month: Number(sortBy) });

  const submissionChartData = useMemo(() => {
    if (!submissionData?.data) {
      return {
        total: 0,
        statuses: [],
      };
    }

    const { total, counts, percentages } = submissionData.data;
    const orderedKeys = ["submitted", "live", "returned", "overdue"];

    const statuses: ProjectStatus[] = orderedKeys.map((key) => ({
      name: STATUS_LABEL_MAP[key],
      value: counts[key as keyof typeof counts] || 0,
      percentage: percentages[key as keyof typeof percentages] || 0,
      color: STATUS_COLOR_MAP[key],
    }));

    return {
      total,
      statuses,
    };
  }, [submissionData]);

  const series = submissionChartData.statuses.map((status) => status.value);

  const options = {
    chart: {
      type: "donut" as const,
      background: "transparent",
    },
    theme: {
      mode: theme as "light" | "dark",
    },
    labels: submissionChartData.statuses.map((d) => d.name),
    colors: submissionChartData.statuses.map((d) => d.color),
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: {
      width: 4,
      colors: [theme === "dark" ? "#0f172a" : "#ffffff"],
    },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: 700,
              formatter: () => submissionChartData.total.toString(),
            },
            label: {
              show: true,
              label: "Total Projects",
              fontSize: "13px",
              color: theme === "dark" ? "#94a3b8" : "#64748b",
              formatter: () => submissionChartData.total.toString(),
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number, ctx: any) =>
          `${val} (${submissionChartData.statuses[ctx.seriesIndex]?.percentage}%)`,
      },
    },
  };

  return (
    <div className="w-full h-full">
      {submissionLoading ? (
        <DonutChartSkeleton />
      ) : (
        <div className="rounded-xl w-full h-full flex flex-col border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-xl text-gray-900 dark:text-slate-100">
              Project Status
            </h3>

            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="capitalize min-w-[120px] dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 hover:dark:border-slate-800 text-primary-text">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
                {PERIOD_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value} className="capitalize">
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chart */}
          <div className="flex-1 flex justify-center items-center min-h-[280px]">
            {submissionChartData.total > 0 ? (
              <Chart
                options={options}
                series={series}
                type="donut"
                height={280}
                className="w-full"
              />
            ) : (
              <div className="text-gray-500 dark:text-slate-400">
                No project data available
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {submissionChartData.statuses.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600 dark:text-slate-400">
                  {item.name}
                </span>
                <span className="ml-auto font-medium text-gray-900 dark:text-slate-100">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
