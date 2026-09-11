/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import BoxContainer from "@/Common/BoxContainer";
import { useGetOverdueQuery } from "@/store/Api/ClientDashboardApi/ClientDashboardApi";
import { useTheme } from "@/Common/theme-provider";

const ProjectOverdueBarChart = () => {
  const { theme } = useTheme();
  const { data, isLoading } = useGetOverdueQuery({});
  const [chartData, setChartData] = useState<any>({
    series: [],
    options: {},
  });

  useEffect(() => {
    if (!data?.data?.projects) return;

    // Map API data
    const projects = data.data.projects;
    const categories = projects.map((p: any) => p.name);
    const values = projects.map((p: any) => Number(p.overdueDays));

    const colors = projects.map((p: any) => {
      if (p.overdueDays > 90) return "#DA4352"; // Critical
      if (p.overdueDays > 30) return "#FF974B"; // Medium
      return "#F5B31A"; // Low
    });

    setChartData({
      series: [{ data: values }],

      options: {
        chart: {
          type: "bar" as const,
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
        dataLabels: {
          enabled: true,
          formatter: (val: number) => `${val}d`,
          style: { colors: [theme === "dark" ? "#f8fafc" : "#FFF"], fontSize: "13px", fontWeight: "500" },
          textAnchor: "start",
          offsetX: 0,
        },
        xaxis: {
          categories,
          labels: { style: { colors: theme === "dark" ? "#94a3b8" : "#64748b", fontSize: "13px" } },
        },
        yaxis: {
          labels: {
            style: {
              colors: theme === "dark" ? "#94a3b8" : "#64748b",
              fontSize: "13px",
              fontWeight: 500,
            },
          },
        },
        legend: {
          show: true,
          markers: {
            shape: "circle",
            fillColors: ["#F5B31A", "#FF974B", "#DA4352"],
          },
          position: "top",
          horizontalAlign: "left",
          customLegendItems: ["Low", "Medium", "Critical"],
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} days overdue`,
          },
        },
      },
    });
  }, [data]);

  return (
    <BoxContainer className="h-full flex flex-col">
      <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-slate-100">Top Overdue Projects</h2>

      {isLoading || chartData.series.length === 0 ? (
        <div className="flex-1 bg-gray-100 dark:bg-slate-900 animate-pulse rounded-md" />
      ) : (
        <div className="flex-1">
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height="100%"
          />
        </div>
      )}
    </BoxContainer>
  );
};

export default ProjectOverdueBarChart;
