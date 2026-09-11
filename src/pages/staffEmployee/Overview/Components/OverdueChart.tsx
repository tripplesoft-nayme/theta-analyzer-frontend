/* eslint-disable @typescript-eslint/no-explicit-any */
import Chart from "react-apexcharts";
import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import { useGetStaffEmployeeTopOverDueQuery } from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";
import ContentLoader from "react-content-loader";
import { useTheme } from "@/Common/theme-provider";

const OverDueChart = () => {
  const { theme } = useTheme();
  const { overdueList, isLoading, error } = useGetStaffEmployeeTopOverDueQuery(
    {},
    {
      selectFromResult: ({ data, isLoading, error }) => ({
        overdueList: data?.data?.projects ?? [],
        isLoading,
        error,
      }),
    },
  );

  const chartData = useMemo<{
    series: { name: string; data: number[] }[];
    options: ApexOptions;
  } | null>(() => {
    if (!Array.isArray(overdueList) || overdueList.length === 0) {
      return null;
    }

    const normalized = overdueList.map((item: any) => ({
      name: item.projectName ?? item.name ?? "Unnamed",
      days: Number(item.overdueDays ?? item.overdue_days ?? 0),
      priority: String(
        item.priority ?? item.priority_level ?? "",
      ).toLowerCase(),
    }));

    const categories = normalized.map((i) => i.name);
    const values = normalized.map((i) => i.days);
    const colors = normalized.map((i) => {
      if (i.priority === "high") return "#DA4352";
      if (i.priority === "medium") return "#FF974B";
      if (i.priority === "low") return "#F5B31A";
      return "#888";
    });

    return {
      series: [{ name: "Overdue Days", data: values }],
      options: {
        chart: {
          type: "bar",
          height: 350,
          toolbar: { show: false },
          background: "transparent",
        },
        theme: {
          mode: theme as "light" | "dark",
        },
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 4,
            borderRadiusApplication: "end",
            distributed: true,
          },
        },
        colors,
        xaxis: {
          categories,
          labels: {
            style: {
              colors: theme === "dark" ? "#94a3b8" : "#64748b",
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: theme === "dark" ? "#94a3b8" : "#64748b",
            },
          },
        },
        grid: {
          borderColor: theme === "dark" ? "#1e293b" : "#e2e8f0",
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number) => `${val}d`,
          style: {
            colors: [theme === "dark" ? "#f1f5f9" : "#1f2937"],
          },
        },
        legend: {
          show: true,
          position: "top",
          horizontalAlign: "left",
          fontSize: "13px",
          fontWeight: 500,
          labels: {
            colors: theme === "dark" ? "#cbd5e1" : "#475569",
          },
          customLegendItems: ["Low", "Medium", "High"],
          markers: {
            width: 10,
            height: 10,
            radius: 12,
            fillColors: ["#F5B31A", "#FF974B", "#DA4352"],
          },
        },
        tooltip: {
          theme: theme as "light" | "dark",
        },
      },
    };
  }, [overdueList, theme]);

  const getErrorMessage = (err: any) => {
    if (!err) return "Unknown error";
    if (typeof err === "string") return err;
    if (err?.data?.message) return err.data.message;
    if (err?.error) return err.error;
    return "Failed to load overdue projects";
  };

  if (isLoading) {
    return (
      <ContentLoader
        width={200}
        height={200}
        viewBox="0 0 200 200"
        backgroundColor={theme === "dark" ? "#1e293b" : "#f3f4f6"}
        foregroundColor={theme === "dark" ? "#334155" : "#e5e7eb"}
      >
        <rect x="0" y="160" rx="0" ry="0" width="25" height="40" />
        <rect x="30" y="145" rx="0" ry="0" width="25" height="55" />
        <rect x="60" y="126" rx="0" ry="0" width="25" height="74" />
        <rect x="90" y="80" rx="0" ry="0" width="25" height="120" />
        <rect x="120" y="142" rx="0" ry="0" width="25" height="58" />
      </ContentLoader>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg p-4 min-w-full md:min-w-88 min-h-[400px] overflow-hidden">
      {error && (
        <div className="text-center text-sm text-red-600 dark:text-rose-400 py-6">
          {getErrorMessage(error)}
        </div>
      )}

      {!isLoading && !error && !chartData && (
        <div className="text-center text-sm text-gray-500 dark:text-slate-500 py-6">
          Yet no overdue projects.
        </div>
      )}

      {!isLoading && !error && chartData && (
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="bar"
          height={350}
        />
      )}
    </div>
  );
};

export default OverDueChart;
