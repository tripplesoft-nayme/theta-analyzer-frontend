import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { generateChartData } from "@/utils/clientPannelHelpers/programBuilderHelpers";

// Common Imports
import { BaseChartProps } from "../Common/chartTypes";
import {
  parseCommonChartData,
  extractLegendsFromXAxis,
} from "../Common/chartUtils";
import BaseChartContainer from "../Common/BaseChartContainer";

/**
 * Parse xAxis 2D array format from API for Horizontal Bar
 */
export const parseHorizontalBarData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  return parseCommonChartData(xAxis, legendValues, widgetTitle);
};


interface CustomHorizontalBarChartProps extends BaseChartProps {
  category?: "HORIZONTAL_BAR" | "SIMPLE_HORIZONTAL_BAR";
}

export default function HorizontalBarChart({ category = "SIMPLE_HORIZONTAL_BAR", ...props }: CustomHorizontalBarChartProps) {
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
    const widgets =
      tier?.widgets ||
      tier?.barChart?.widgets ||
      tier?.multiAxisChart?.widgets ||
      tier?.horizontalBarChart?.widgets ||
      tier?.areaChart?.widgets ||
      [];

    if (widgets.length > 0) {
      return widgets.map((w: any) => ({
        label: w.legendName || w.label || "Legend",
        field: (w.legendName || w.label || "field")
          .toLowerCase()
          .replace(/\s+/g, ""),
        color: w.color || "#000000",
      }));
    }

    // Fallback if no widgets/metadata
    const derived = extractLegendsFromXAxis(tier.xAxis);
    return derived.map((lbl, idx) => ({
      label: lbl,
      field: lbl.toLowerCase().replace(/\s+/g, ""),
      color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
    }));
  };

  return (
    <BaseChartContainer
      {...props}
      category={category}
      excelType="horizontalBarChart"
      generatorFunc={(xAxis, legends, numOfLegendDataSet, start, end) =>
        generateChartData(xAxis, legends as any, numOfLegendDataSet, start, end)
      }
      getTierLegends={getTierLegends}
      parseTierData={parseHorizontalBarData}
      renderChildChart={(tier, childProps) => (
        <HorizontalBarChart
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
      }) => {
        const truncateLabel = (val: string) => {
          const str = String(val || "");
          return str.length > 20 ? `${str.substring(0, 17)}...` : str;
        };

        const longestLabel = chartData?.reduce((max: number, item: any) => {
          const nameStr = truncateLabel(item.name || "");
          return nameStr.length > max ? nameStr.length : max;
        }, 0) || 0;
        const yAxisWidth = Math.max(30, longestLabel * 7 + 10);

        return (
          <div className="relative w-full h-full min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="0"
                  horizontal={false}
                  stroke={isDarkMode ? "#334155" : "#e5e7eb"}
                />
                <XAxis
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
                  tick={{ fontSize: 12, fill: isDarkMode ? "#cbd5e1" : "#6b7280" }}
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
                  tickFormatter={(num: number) => {
                    if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
                    if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
                    if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
                    return num.toString();
                  }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={{ stroke: isDarkMode ? "#334155" : "#e5e7eb" }}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: isDarkMode ? "#cbd5e1" : "#6b7280" }}
                  width={yAxisWidth}
                  interval={0}
                  tickFormatter={truncateLabel}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3 border border-border dark:border-slate-800 rounded-xl shadow-xl">
                        <p className="font-bold text-gray-700 dark:text-slate-100 mb-2 border-b border-gray-50 dark:border-slate-800 pb-1">
                          {label}
                        </p>
                        <div className="space-y-1.5">
                          {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-3">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-xs font-medium text-gray-600 dark:text-slate-300 min-w-[60px]">
                                {entry.name}:
                              </span>
                              <span className="text-xs font-bold text-gray-900 dark:text-slate-100 ml-auto">
                                {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                  cursor={{ fill: isDarkMode ? "#1e293b" : "#f3f4f6", opacity: 0.4 }}
                />

                {effectiveLegendValues.map((l) => (
                  <Bar
                    key={l.field}
                    name={l.label}
                    dataKey={l.field}
                    stackId={props.isStacked === false ? undefined : "a"}
                    fill={l.color}
                    radius={[0, 4, 4, 0]}
                    barSize={32}
                    label={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      }}
    </BaseChartContainer>
  );
}
