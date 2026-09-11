/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import BaseChartContainer from "../Common/BaseChartContainer";
import { BaseChartProps } from "../Common/chartTypes";
import { parseCommonChartData } from "../Common/chartUtils";
import { generateLineChartData } from "@/utils/clientPannelHelpers/programBuilderHelpers";

export const parseXAxisData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  return parseCommonChartData(xAxis, legendValues, widgetTitle);
};

export default function LogarithmicChart(props: BaseChartProps) {
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);
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
      color: w.color,
    }));
  };

  return (
    <BaseChartContainer
      {...props}
      category="LOGARITHM"
      excelType="lineChart"
      generatorFunc={generateLineChartData}
      getTierLegends={getTierLegends}
      parseTierData={parseXAxisData}
      renderChildChart={(tier, childProps) => (
        <LogarithmicChart
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({
        chartData,
        effectiveLegendValues,
        safeStartingRange,
        safeEndingRange,
      }) => {
        // Sanitize data for log scale (zero or out-of-range values break log scale)
        const sanitizedData = chartData.map((item: any) => {
          const newItem = { ...item };
          effectiveLegendValues.forEach((l) => {
            const val = Number(item[l.field]);
            // If value is 0 or less, or even less than the starting range,
            // set it to starting range so it appears on the baseline
            // Note: Log(0) is undefined, so we must use at least 1 if range is 0
            if (!val || val < safeStartingRange) {
              newItem[l.field] = safeStartingRange > 0 ? safeStartingRange : 1;
            }
          });
          return newItem;
        });

        return (
          <div className="w-full h-full min-h-[150px] p-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={sanitizedData}
                margin={{ top: 20, right: 20, left: -20, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDarkMode ? "#334155" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="name"
                  axisLine={{ stroke: isDarkMode ? "#334155" : "#e5e7eb" }}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: isDarkMode ? "#cbd5e1" : "#4b5563", fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  width={60}
                  type="number"
                  domain={(() => {
                    const minVal = safeStartingRange || 0;
                    const maxEnding = safeEndingRange || 100;
                    const range = maxEnding - minVal;
                    const rawStep = range / 10 || 1;
                    const stepVal = rawStep > 1 ? Math.ceil(rawStep) : rawStep;
                    return [minVal, minVal + stepVal * 10];
                  })()}
                  allowDataOverflow={true}
                  axisLine={{ stroke: isDarkMode ? "#334155" : "#e5e7eb" }}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: isDarkMode ? "#cbd5e1" : "#4b5563", fontWeight: 500 }}
                  dx={-10}
                  tickFormatter={(num: number) => {
                    if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
                    if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
                    if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
                    return num.toString();
                  }}
                  ticks={(() => {
                    const minVal = safeStartingRange || 0;
                    const maxEnding = safeEndingRange || 100;
                    const range = maxEnding - minVal;
                    const rawStep = range / 10 || 1;
                    const stepVal = rawStep > 1 ? Math.ceil(rawStep) : rawStep;
                    const ticksArray = [];
                    for (let i = 0; i <= 10; i++) {
                      ticksArray.push(Number((minVal + i * stepVal).toFixed(1)));
                    }
                    return ticksArray;
                  })()}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-900 p-4 border border-border dark:border-slate-800 rounded-xl shadow-xl">
                        <p className="font-bold text-gray-900 dark:text-slate-100 mb-2 border-b dark:border-slate-800 pb-2">
                          {props.widgetTitle}
                        </p>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">
                          Category: {row.name}
                        </p>
                        <div className="space-y-1.5">
                          {effectiveLegendValues.map((l) => (
                            <div
                              key={l.field}
                              className="flex items-center justify-between gap-8"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: l.color }}
                                />
                                <span className="text-sm text-gray-600 dark:text-slate-300">
                                  {l.label}
                                </span>
                              </div>
                              <span
                                className="text-sm font-bold"
                                style={{ color: l.color }}
                              >
                                {row[l.field] === 1 && safeStartingRange === 0
                                  ? 0
                                  : Number(row[l.field]).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                  cursor={{ stroke: isDarkMode ? "#334155" : "#e5e7eb", strokeWidth: 1 }}
                />

                {effectiveLegendValues.map((l) => (
                  <Line
                    key={l.field}
                    type="monotone"
                    dataKey={l.field}
                    stroke={l.color}
                    strokeWidth={2}
                    dot
                    opacity={
                      hoveredLine === null || hoveredLine === l.field ? 1 : 0.3
                    }
                    onMouseEnter={() => setHoveredLine(l.field)}
                    onMouseLeave={() => setHoveredLine(null)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      }}
    </BaseChartContainer>
  );
}
