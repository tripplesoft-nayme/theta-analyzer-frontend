/* eslint-disable @typescript-eslint/no-explicit-any */
import { DonutChartSkeleton } from "@/Common/Skeleton/DonutChartSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetStatusQuery } from "@/store/Api/ClientDashboardApi/ClientDashboardApi";
import { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@/Common/theme-provider";

type Period = "week" | "month" | "year";

interface DonutItem {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

const PERIOD_OPTIONS: Period[] = ["week", "month", "year"];

const STATUS_CONFIG = [
  { key: "inProgress", label: "In Progress", color: "#6366F1" },
  { key: "completed", label: "Completed", color: "#10B981" },
  { key: "overdue", label: "Overdue", color: "#EF4444" },
  { key: "notStarted", label: "Not Started", color: "#9CA3AF" },
] as const;

const ProjectStatusDonutChart = () => {
  const { theme } = useTheme();
  const [period, setPeriod] = useState<Period>("month");
  const { data, isLoading } = useGetStatusQuery({ period });
  const response = data?.data;
  const donutData: DonutItem[] = useMemo(() => {
    return STATUS_CONFIG.map((cfg) => ({
      label: cfg.label,
      value: response?.stack[cfg.key]?.count ?? 0,
      percentage: response?.stack[cfg.key]?.percentage ?? 0,
      color: cfg.color,
    }));
  }, [response]);

  const series = donutData.map((d) => d.value);

  const options = {
    chart: {
      type: "donut" as const,
      background: "transparent",
    },
    theme: {
      mode: theme as "light" | "dark",
    },
    labels: donutData.map((d) => d.label),
    colors: donutData.map((d) => d.color),
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
              formatter: () => response.data?.totalProjects?.toString(),
            },
            label: {
              show: true,
              label: "Total Projects",
              fontSize: "13px",
              color: theme === "dark" ? "#94a3b8" : "#64748b",
              formatter: () => response?.data?.totalProjects?.toString(),
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number, ctx: any) =>
          `${val} (${donutData[ctx.seriesIndex]?.percentage}%)`,
      },
    },
  };

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
  };

  return (
    <div className="w-full h-full">
      {isLoading ? (
        <DonutChartSkeleton />
      ) : (
        <div className="rounded-xl w-full h-full grid border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-xl text-gray-900 dark:text-slate-100">Project Status</h3>

            <Select
              value={period}
              onValueChange={(p) => handlePeriodChange(p as Period)}
            >
              <SelectTrigger className="capitalize min-w-[120px] dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 hover:dark:border-slate-800 text-primary-text">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
                {PERIOD_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chart */}
          <div className="place-self-center">
            <Chart
              options={options}
              series={series}
              type="donut"
              height={280}
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {donutData.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600 dark:text-slate-400">{item.label}</span>
                <span className="ml-auto font-medium text-gray-900 dark:text-slate-100">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStatusDonutChart;
