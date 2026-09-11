/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, LineChart as LineIcon, Grid3X3 } from "lucide-react";
import BaseChartContainer from "../Common/BaseChartContainer";
import { BaseChartProps } from "../Common/chartTypes";
import { parseCommonChartData } from "../Common/chartUtils";

const generateCohortData = (xAxis: string[], legendValues: any[]) => {
  return xAxis.map((period, pIdx) => {
    const entry: any = { name: period };
    legendValues.forEach((cohort) => {
      const decay = Math.max(0, 100 - pIdx * (10 + Math.random() * 15));
      entry[cohort.field] = Math.round(decay);
    });
    return entry;
  });
};

export const parseCohortData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  return parseCommonChartData(xAxis, legendValues, widgetTitle);
};

export default function CohortAnalysisChart(
  props: BaseChartProps & { chartType?: "line" | "bar" | "heatmap" },
) {
  const [type, setType] = useState<"line" | "bar" | "heatmap">(
    props.chartType || "heatmap",
  );

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

  const getTierLegends = (tier: any) => {
    return (tier?.barChart?.widgets || tier?.widgets || []).map((w: any) => ({
      label: w.legendName || w.label,
      field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
      color: w.color || "#6366f1",
      users: w.users || 100,
    }));
  };

  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(
      shorthandRegex,
      (_m, r, g, b) => r + r + g + g + b + b,
    );
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : "99, 102, 241";
  };

  return (
    <BaseChartContainer
      {...props}
      category="RETENTION"
      excelType="barChart"
      generatorFunc={(_count, legends) =>
        generateCohortData(props.xAxisValues || [], legends)
      }
      getTierLegends={getTierLegends}
      parseTierData={parseCohortData}
      renderChildChart={(tier, childProps) => (
        <CohortAnalysisChart
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({
        chartData,
        effectiveLegendValues,
        effectiveXAxisValues,
        isSampleData,
        safeStartingRange,
        safeEndingRange,
      }) => {
        const minVal = safeStartingRange || 0;
        const maxEnding = safeEndingRange || 100;
        const range = maxEnding - minVal;
        const rawStep = range / 10 || 1;
        const stepVal = rawStep > 1 ? Math.ceil(rawStep) : rawStep;

        const ticksArray: number[] = [];
        for (let i = 0; i <= 10; i++) {
          ticksArray.push(Number((minVal + i * stepVal).toFixed(1)));
        }

        // Prepare table data for heatmap from chartData logic
        const isHeatmap = type === "heatmap";

        const cohortsTableData = effectiveLegendValues.map((cohort) => {
          const values = effectiveXAxisValues.map((period, _pIdx) => {
            const match = chartData?.find((d: any) => d.name === period);
            return match ? Number(match[cohort.field]) : 0;
          });
          const rowSum = values.reduce((acc, val) => acc + (val || 0), 0);
          return {
            cohortName: cohort.label,
            color: cohort.color,
            totalUsers: rowSum,
            values,
          };
        });


        return (
          <div
            className="w-full h-full relative flex flex-col mt-4"
            style={{ minHeight: 0 }}
          >
            {/* Chart type toggle buttons */}
            <div className="flex justify-end gap-2 mb-2 absolute top-[-30px] right-2 z-10 py-2">
              <button
                onClick={() => setType("heatmap")}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] sm:text-xs transition-colors border ${type === "heatmap"
                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                  : "text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 border-transparent"
                  }`}
              >
                <Grid3X3 size={14} /> Heatmap
              </button>
              <button
                onClick={() => setType("line")}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] sm:text-xs transition-colors border ${type === "line"
                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                  : "text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 border-transparent"
                  }`}
              >
                <LineIcon size={14} /> Line
              </button>
              <button
                onClick={() => setType("bar")}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] sm:text-xs transition-colors border ${type === "bar"
                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                  : "text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 border-transparent"
                  }`}
              >
                <BarChart3 size={14} /> Bar
              </button>
            </div>

            {isHeatmap ? (
              <div
                className="w-full h-full min-h-0 rounded-md border border-border dark:border-slate-800 overflow-hidden mt-2"
                style={{ overflowX: "auto", overflowY: "auto" }}
              >
                <table
                  className="text-xs text-left border-collapse text-slate-800 dark:text-slate-300"
                  style={{ width: "max-content", minWidth: "100%" }}
                >
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 sticky top-0 z-30 shadow-[0_1px_0_rgba(0,0,0,0.05)] dark:shadow-none">
                    <tr>
                      <th className="py-3 px-4 font-semibold w-28 sticky left-0 bg-slate-50 dark:bg-slate-900 z-20 border-r border-gray-200 dark:border-slate-700 shadow-[1px_0_0_rgba(0,0,0,0.05)] dark:shadow-none whitespace-nowrap text-indigo-900 dark:text-indigo-400">
                        Cohort
                      </th>
                      <th className="py-3 px-4 font-semibold text-center border-r border-gray-200 dark:border-slate-700 whitespace-nowrap bg-indigo-50/50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                        Total
                      </th>
                      {effectiveXAxisValues.map((period, i) => (
                        <th
                          key={i}
                          className="py-3 px-3 font-semibold text-center border-r border-gray-200 dark:border-slate-700 whitespace-nowrap"
                        >
                          {period}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cohortsTableData.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-50 dark:border-slate-800 hover:bg-slate-50/30 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-2.5 px-4 font-medium sticky left-0 bg-white dark:bg-slate-900 z-20 border-r border-gray-200 dark:border-slate-700 shadow-[1px_0_0_rgba(0,0,0,0.05)] dark:shadow-none whitespace-nowrap">
                          {row.cohortName}
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400 border-r border-indigo-100 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-900/20 whitespace-nowrap">
                          {row.totalUsers}
                        </td>
                        {row.values.map((val, vIdx) => {
                          if (
                            vIdx > cohortsTableData.length - i - 1 &&
                            isSampleData
                          ) {
                            return (
                              <td
                                key={vIdx}
                                className="bg-gray-50/30 dark:bg-slate-800/30 border-r border-border dark:border-slate-800 px-3 py-2.5"
                              ></td>
                            );
                          }

                          const displayValue =
                            val !== null && val !== undefined ? `${val}` : "-";
                          const alpha =
                            val !== null && val !== undefined
                              ? Math.max(0.05, val / 100)
                              : 0;
                          const bgColor =
                            val !== null && val !== undefined
                              ? `rgba(${hexToRgb(row.color)}, ${alpha})`
                              : "transparent";
                          const isBgDark =
                            val !== null && val !== undefined && val >= 60;

                          const styleOpts: React.CSSProperties = {
                            backgroundColor: bgColor,
                          };
                          if (isBgDark) {
                            styleOpts.color = "#ffffff";
                          }

                          return (
                            <td
                              key={vIdx}
                              className={`py-2.5 px-3 text-center border-r border-white dark:border-slate-900 border-b border-white dark:border-slate-900 font-medium transition-colors whitespace-nowrap ${!isBgDark ? "text-slate-800 dark:text-slate-200" : ""}`}
                              style={styleOpts}
                            >
                              {displayValue}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="w-full h-full min-h-[150px] pt-4" style={{ overflow: 'visible' }}>
                <ResponsiveContainer width="100%" height="100%">
                  {type === "line" ? (
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      style={{ overflow: 'visible' }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={isDarkMode ? "rgba(203, 213, 225, 0.1)" : "rgba(156, 163, 175, 0.2)"}
                      />
                      <XAxis
                        dataKey="name"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: isDarkMode ? "#cbd5e1" : "#9ca3af" }}
                      />
                      <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: isDarkMode ? "#cbd5e1" : "#9ca3af" }}
                        domain={[ticksArray[0], ticksArray[ticksArray.length - 1]]}
                        ticks={ticksArray}
                        tickFormatter={(num: number) => {
                          if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
                          if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
                          if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
                          return num.toString();
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? "#0f172a" : "#fff",
                          borderRadius: "8px",
                          border: isDarkMode ? "1px solid #334155" : "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          color: isDarkMode ? "#f1f5f9" : "#1e293b",
                        }}
                        itemStyle={{
                          color: isDarkMode ? "#f1f5f9" : undefined,
                        }}
                        wrapperStyle={{ zIndex: 9999, overflow: 'visible' }}
                      />
                      {effectiveLegendValues.map((l) => (
                        <Line
                          key={l.field}
                          type="monotone"
                          dataKey={l.field}
                          name={l.label}
                          stroke={l.color}
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2, fill: isDarkMode ? "#0f172a" : "#fff" }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  ) : (
                    <RechartsBarChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      style={{ overflow: 'visible' }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={isDarkMode ? "rgba(203, 213, 225, 0.1)" : "rgba(156, 163, 175, 0.2)"}
                      />
                      <XAxis
                        dataKey="name"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: isDarkMode ? "#cbd5e1" : "#9ca3af" }}
                      />
                      <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: isDarkMode ? "#cbd5e1" : "#9ca3af" }}
                        domain={[ticksArray[0], ticksArray[ticksArray.length - 1]]}
                        ticks={ticksArray}
                        tickFormatter={(num: number) => {
                          if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
                          if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
                          if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
                          return num.toString();
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? "#0f172a" : "#fff",
                          borderRadius: "8px",
                          border: isDarkMode ? "1px solid #334155" : "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          color: isDarkMode ? "#f1f5f9" : "#1e293b",
                        }}
                        itemStyle={{
                          color: isDarkMode ? "#f1f5f9" : undefined,
                        }}
                        wrapperStyle={{ zIndex: 9999, overflow: 'visible' }}
                      />
                      {effectiveLegendValues.map((l) => (
                        <Bar
                          key={l.field}
                          dataKey={l.field}
                          name={l.label}
                          fill={l.color}
                          radius={[4, 4, 0, 0]}
                          barSize={30}
                        />
                      ))}
                    </RechartsBarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      }}
    </BaseChartContainer>
  );
}
