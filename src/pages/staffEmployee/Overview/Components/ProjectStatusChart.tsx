import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DropdownSelect from "@/Common/DropdownSelect";
import Chart from "react-apexcharts";

import { useMemo, useState } from "react";
import { useGetStaffEmployeeSubmissionStatusQuery } from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";
import ContentLoader from "react-content-loader";
import { ApexOptions } from "apexcharts";
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

export default function ProjectStatusChart() {
  const { theme } = useTheme();
  const [, setSortBy] = useState("");

  const { data: submissionData, isLoading: submissionLoading } =
    useGetStaffEmployeeSubmissionStatusQuery({});

  const submissionChartData = useMemo(() => {
    if (!submissionData?.data) {
      return {
        total: 0,
        statuses: [],
      };
    }

    const { total, counts, percentages } = submissionData.data;

    const statuses: ProjectStatus[] = Object.keys(counts).map((key) => ({
      name: STATUS_LABEL_MAP[key],
      value: counts[key as keyof typeof counts],
      percentage: percentages[key as keyof typeof percentages],
      color: STATUS_COLOR_MAP[key],
    }));

    return {
      total,
      statuses,
    };
  }, [submissionData]);

  const chartOptions: ApexOptions = {
    chart: {
      type: "donut" as const,
      height: 280,
      toolbar: { show: false },
      background: "transparent",
    },
    theme: {
      mode: theme as "light" | "dark",
    },
    colors: submissionChartData.statuses.map((status) => status.color),
    labels: submissionChartData.statuses.map((status) => status.name),
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: { show: false },
            value: {
              show: true,
              fontSize: "32px",
              fontWeight: "bold",
              color: theme === "dark" ? "#f1f5f9" : "#1f2937",
              formatter: () => submissionChartData.total.toString(),
            },
            total: {
              show: true,
              label: "Total Project",
              fontSize: "14px",
              color: theme === "dark" ? "#94a3b8" : "#6b7280",
              formatter: () => submissionChartData.total.toString(),
            },
          },
        },
      },
    },
    stroke: {
      width: 5,
      colors: [theme === "dark" ? "#1e293b" : "#fff"],
    },
    tooltip: {
      theme: theme as "light" | "dark",
      y: {
        formatter: (value: number, opts?: any) => {
          const seriesIndex = opts?.seriesIndex;
          const status =
            seriesIndex !== undefined
              ? submissionChartData.statuses[seriesIndex]
              : null;
          return status ? `${value} (${status.percentage}%)` : value.toString();
        },
      },
    },
  };

  const series = submissionChartData.statuses.map((status) => status.value);

  const dropdownItem = [
    { value: "this-week", title: "This Week" },
    { value: "this-month", title: "This Month" },
    { value: "this-quarter", title: "This Quarter" },
    { value: "this-year", title: "This Year" },
  ];

  const handleChange = (e: string) => {
    setSortBy(e);
  };

  if (submissionLoading) {
    return (
      <ContentLoader
        viewBox="0 0 400 160"
        height={160}
        width={400}
        backgroundColor={theme === "dark" ? "#1e293b" : "#f3f4f6"}
        foregroundColor={theme === "dark" ? "#334155" : "#e5e7eb"}
      >
        <circle cx="64" cy="64" r="64" />
      </ContentLoader>
    );
  }

  return (
    <Card className="w-full h-full border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 mb-7">
        <h4 className="font-semibold text-xl text-gray-900 dark:text-slate-100 w-full">Project Status</h4>
        <DropdownSelect
          placeholderText="Sort By"
          dropdownItem={dropdownItem}
          onChange={handleChange}
        />
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {submissionChartData.statuses.map((status, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: status.color,
                  }}
                />
                <span className="text-gray-600 dark:text-slate-400">{status.name}</span>
                <span className="font-medium ml-auto text-gray-900 dark:text-slate-100">
                  {status.percentage}%
                </span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="relative">
            {!submissionLoading && (
              <Chart
                options={chartOptions as any}
                series={series}
                type="donut"
                height={280}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
