import { useState, useEffect } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { generateLineChartData } from "@/utils/clientPannelHelpers/programBuilderHelpers";

// Common Imports
import { BaseChartProps } from "../Common/chartTypes";
import { parseCommonChartData, getNiceStep } from "../Common/chartUtils";
import BaseChartContainer from "../Common/BaseChartContainer";

/**
 * Parse xAxis 2D array format from API for Line/Multi-Axis
 */
export const parseLineChartData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  return parseCommonChartData(xAxis, legendValues, widgetTitle);
};

/*      COMPONENT      */

export default function MultiAxisLineChart(props: BaseChartProps) {
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
    return (
      tier?.multiAxisChart?.widgets ||
      tier?.lineChart?.widgets ||
      tier?.widgets ||
      []
    ).map((w: any) => ({
      label: w.legendName || w.label,
      field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
      color: w.color,
    }));
  };

  return (
    <BaseChartContainer
      {...props}
      category="LINE"
      excelType="lineChart"
      generatorFunc={generateLineChartData}
      getTierLegends={getTierLegends}
      parseTierData={parseLineChartData}
      renderChildChart={(tier, childProps) => (
        <MultiAxisLineChart
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({
        chartData,
        safeStartingRange,
        safeEndingRange,
        effectiveLegendValues,
      }) => (
        <div
          className="w-full relative h-full min-h-[150px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: chartData.length > 5 ? 40 : 10 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDarkMode ? "#334155" : "#f0f0f0"}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: isDarkMode ? "#cbd5e1" : "#9ca3af" }}
                interval={0}
                angle={chartData.length > 5 ? -45 : 0}
                textAnchor={chartData.length > 5 ? "end" : "middle"}
                height={chartData.length > 5 ? 70 : 30}
              />
              <YAxis
                yAxisId="left"
                type="number"
                domain={(() => {
                  const minVal = safeStartingRange || 0;
                  const maxEnding = safeEndingRange || 100;
                  const range = maxEnding - minVal;
                  const rawStep = range / 10 || 1;
                  const stepVal = getNiceStep(rawStep);
                  return [minVal, minVal + stepVal * 10];
                })()}
                allowDataOverflow={true}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: isDarkMode ? "#cbd5e1" : "#9ca3af" }}
                ticks={(() => {
                  const minVal = safeStartingRange || 0;
                  const maxEnding = safeEndingRange || 100;
                  const range = maxEnding - minVal;
                  const rawStep = range / 10 || 1;
                  const stepVal = getNiceStep(rawStep);
                  const ticksArray = [];
                  for (let i = 0; i <= 10; i++) {
                    ticksArray.push(Number((minVal + i * stepVal).toFixed(1)));
                  }
                  return ticksArray;
                })()}
                tickFormatter={(num: number) => {
                  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
                  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
                  if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
                  return num.toString();
                }}
              />
              {props.isMultiAxis && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  type="number"
                  domain={(() => {
                    const minVal = safeStartingRange || 0;
                    const maxEnding = safeEndingRange || 100;
                    const range = maxEnding - minVal;
                    const rawStep = range / 10 || 1;
                    const stepVal = getNiceStep(rawStep);
                    return [minVal, minVal + stepVal * 10];
                  })()}
                  allowDataOverflow={true}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: isDarkMode ? "#cbd5e1" : "#9ca3af" }}
                  ticks={(() => {
                    const minVal = safeStartingRange || 0;
                    const maxEnding = safeEndingRange || 100;
                    const range = maxEnding - minVal;
                    const rawStep = range / 10 || 1;
                    const stepVal = getNiceStep(rawStep);
                    const ticksArray = [];
                    for (let i = 0; i <= 10; i++) {
                      ticksArray.push(Number((minVal + i * stepVal).toFixed(1)));
                    }
                    return ticksArray;
                  })()}
                  tickFormatter={(num: number) => {
                    if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
                    if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
                    if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
                    return num.toString();
                  }}
                />
              )}
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-slate-900 p-3 border border-gray-200 dark:border-slate-800 rounded shadow-lg">
                      <p className="font-semibold text-gray-900 dark:text-slate-100 mb-2">{row.name}</p>
                      {effectiveLegendValues.map((l) => (
                        <p
                          key={l.field}
                          style={{ color: l.color }}
                          className="text-sm font-medium"
                        >
                          {l.label}: {row[l.field]}
                        </p>
                      ))}
                    </div>
                  );
                }}
              />

              {effectiveLegendValues.map((l, index) => (
                <Line
                  key={l.field}
                  yAxisId={props.isMultiAxis ? (index % 2 === 0 ? "left" : "right") : "left"}
                  type="monotone"
                  dataKey={l.field}
                  stroke={l.color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: l.color, strokeWidth: 2, stroke: isDarkMode ? "#0f172a" : "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  label={
                    props.isProgramBuilder
                      ? {
                        position: "top",
                        fill: isDarkMode ? "#cbd5e1" : "#666",
                        fontSize: 10,
                        fontWeight: 600,
                        formatter: (val: number) => (val === 0 ? "" : val),
                      }
                      : false
                  }
                />
              ))}
              {/* <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ color: isDarkMode ? "#cbd5e1" : "#6b7280" }}
              /> */}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      )}
    </BaseChartContainer>
  );
}
