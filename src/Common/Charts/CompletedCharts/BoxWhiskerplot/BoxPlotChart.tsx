/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import BaseChartContainer from "../Common/BaseChartContainer";
import { BaseChartProps } from "../Common/chartTypes";

/**
 * Parses raw Box Plot data into a format suitable for our dashboard.
 */
const parseBoxPlotData = (xAxis: any, _legends: any) => {
  if (!xAxis) return { labels: [], data: [] };
  try {
    const parsed = typeof xAxis === "string" ? JSON.parse(xAxis) : xAxis;
    const dataArr = Array.isArray(parsed) ? parsed : [];
    if (dataArr.length < 2) return { labels: [], data: [] };

    const rows = dataArr.slice(1);
    const result: any[] = [];
    const labels: string[] = [];

    rows.forEach((row: any[]) => {
      if (!row || row.length < 6) return;
      labels.push(String(row[0]));
      result.push({
        x: String(row[0]),
        min: Number(row[1]) || 0,
        q1: Number(row[2]) || 0,
        median: Number(row[3]) || 0,
        q3: Number(row[4]) || 0,
        max: Number(row[5]) || 0,
        outliers: Array.isArray(row[6]) ? row[6] : [],
        color: String(row[7] || ""),
      });
    });

    return { labels, data: result };
  } catch {
    return { labels: [], data: [] };
  }
};

/**
 * Generates sample/fallback data when no data is provided.
 */
const generateBoxPlotSample = (xAxis: string[]) => {
  const colors = [
    "#8D79F6",
    "#35B6EE",
    "#13A490",
    "#F26419",
    "#6F78F9",
    "#E63946",
  ];
  return xAxis.map((label, idx) => ({
    x: label,
    min: 10 + idx * 5,
    q1: 20 + idx * 5,
    median: 35 + idx * 5,
    q3: 50 + idx * 5,
    max: 70 + idx * 5,
    outliers: [5, 85],
    color: colors[idx % colors.length],
  }));
};

/**
 * Box & Whisker Plot Component implemented via react-apexcharts
 */
export default function BoxPlotChart(props: BaseChartProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <BaseChartContainer
      {...props}
      category="BOX_WHISKER"
      excelType="boxWhisker"
      generatorFunc={generateBoxPlotSample}
      getTierLegends={() => {
        const headers = ["min", "q1", "median", "q3", "max", "outliers"];
        const colors = ["#8D79F6", "#35B6EE", "#13A490", "#F26419", "#6F78F9", "#E63946"];
        return headers.map((lbl, idx) => ({
          label: lbl,
          field: lbl.toLowerCase().replace(/\s+/g, ""),
          color: colors[idx % colors.length],
        }));
      }}
      parseTierData={parseBoxPlotData}
      renderChildChart={(tier, childProps) => (
        <BoxPlotChart
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({ chartData, safeStartingRange, safeEndingRange }) => {
        const usedLabels = new Map<string, number>();

        const seriesData = chartData.map((d: any) => {
          const rawLabel = d.x || d.name || d.label || "Data";
          const count = usedLabels.get(rawLabel) || 0;
          usedLabels.set(rawLabel, count + 1);
          const uniqueLabel = rawLabel + "\u200B".repeat(count);

          return {
            x: uniqueLabel,
            y: [d.min, d.q1, d.median, d.q3, d.max],
          };
        });

        const themeOutlineColor = isDarkMode ? "#818CF8" : "#4F46E5";

        const start = safeStartingRange || 0;
        const maxEnding = safeEndingRange || 100;
        const range = maxEnding - start;
        const rawStep = range / 10 || 1;
        const stepVal = rawStep > 1 ? Math.ceil(rawStep) : rawStep;
        const end = start + stepVal * 10;
        const tickAmount = 10;

        const chartOptions = {
          chart: {
            type: "boxPlot" as const,
            toolbar: { show: false },
            zoom: { enabled: false },
            background: "transparent",
            fontFamily: "Inter, system-ui, sans-serif",
            parentHeightOffset: 0,
            redrawOnParentResize: true,
            redrawOnWindowResize: true,
          },
          // Disable inner chart title to avoid duplicate title rendering
          title: {
            text: undefined,
          },
          colors: [themeOutlineColor],
          plotOptions: {
            boxPlot: {
              colors: {
                upper: isDarkMode ? "#312E81" : "#E0E7FF",
                lower: isDarkMode ? "#1E1B4B" : "#EEF2FF",
              },
            },
          },
          stroke: {
            colors: [themeOutlineColor],
            width: 1.5,
          },
          xaxis: {
            type: "category",
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
              style: {
                fontSize: "11px",
                colors: isDarkMode ? "#cbd5e1" : "#64748b",
              },
            },
          },
          yaxis: {
            min: start,
            max: end,
            tickAmount: tickAmount,
            tooltip: { enabled: true },
            labels: {
              style: {
                fontSize: "11px",
                colors: isDarkMode ? "#cbd5e1" : "#64748b",
              },
              formatter: (num: number) => {
                if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
                if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
                if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
                return num.toFixed(0);
              },
            },
          },
          grid: {
            borderColor: isDarkMode ? "#1e293b" : "#f1f5f9",
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
          },
          tooltip: {
            theme: isDarkMode ? "dark" : "light",
            shared: false,
            intersect: true,
          },
        };

        return (
          <div className="w-full h-full min-h-[150px] min-w-0 overflow-hidden relative">
            {seriesData.length > 0 ? (
              <Chart
                options={chartOptions as any}
                series={[{ data: seriesData }]}
                type="boxPlot"
                height="100%"
                width="100%"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-text italic text-sm">
                No data available.
              </div>
            )}
          </div>
        );
      }}
    </BaseChartContainer>
  );
}
