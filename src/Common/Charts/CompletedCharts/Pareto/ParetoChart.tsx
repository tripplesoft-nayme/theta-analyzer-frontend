/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from "recharts";
import { generateAreaChartData } from "@/utils/clientPannelHelpers/programBuilderHelpers";

// Common Imports
import { BaseChartProps } from "../Common/chartTypes";
import {
  parseCommonChartData,
  extractLegendsFromXAxis,
} from "../Common/chartUtils";
import BaseChartContainer from "../Common/BaseChartContainer";

/**
 * Parse xAxis for Pareto Chart (Pie-style format)
 */
export const parseParetoChartData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  return parseCommonChartData(xAxis, legendValues, widgetTitle);
};

/**
 * Flatten the Pareto API format:
 *   [["Label", "Cat A", "Cat B", ...], ["Value", 10, 20, ...]]
 * into per-category rows:
 *   [{ name: "Cat A", value: 10, color }, { name: "Cat B", value: 20, color }, ...]
 */
const flattenParetoApiData = (chartData: any[], effectiveLegendValues: any[]): any[] => {
  // Standard format after parseCommonChartData:
  // chartData = [{ name: "Value", projecta: 10, projectb: 20, ... }]
  // where effectiveLegendValues = [{label:"Project A", field:"projecta", color}, ...]
  if (chartData.length === 1 && effectiveLegendValues.length > 1) {
    const valueRow = chartData[0];
    return effectiveLegendValues.map((l) => ({
      name: l.label,
      value: Number(valueRow[l.field] ?? 0),
      color: l.color,
    }));
  }
  // Already row-per-category format
  return [];
};

/*      COMPONENT      */

export default function ParetoChart(props: BaseChartProps) {
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
    const widgets = tier?.paretoChart?.widgets || tier?.widgets || [];
    if (widgets.length > 0) {
      return widgets.map((w: any) => ({
        label: w.legendName || w.label,
        field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        color: w.color,
      }));
    }
    // Fallback if no widgets/metadata
    const derived = extractLegendsFromXAxis(tier.xAxis);
    return derived.map((lbl, idx) => ({
      label: lbl,
      field: lbl.toLowerCase().replace(/\s+/g, ""),
      color: ["#4F81BC", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
    }));
  };

  return (
    <BaseChartContainer
      {...props}
      category={"PARETO" as any}
      excelType="areaChart" // Using areaChart as template for data generation if needed
      generatorFunc={generateAreaChartData}
      getTierLegends={getTierLegends}
      parseTierData={parseParetoChartData}
      renderChildChart={(tier, childProps) => (
        <ParetoChart
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({ chartData, effectiveLegendValues, safeStartingRange, safeEndingRange }) => {
        // Find all data points. Pareto can be:
        // 1. One row per category (name: "Jan", value: 10)
        // 2. One row total, categories are legends (name: "Value", Jan: 10, Feb: 5)

        const sourceKeys: { key: string, label: string }[] = [];
        let processedData: any[] = [];
        if (Array.isArray(chartData) && chartData.length > 0) {
          chartData.forEach((row, idx) => {
            sourceKeys.push({
              key: `${row.name || "Unknown"}_${idx}`,
              label: row.name || "Unknown"
            });
          });
        }

        if (Array.isArray(chartData) && chartData.length > 0) {
          // Pareto aggregation logic:
          // a) Program Builder value-detection aggregation (multiple sources → stack)
          if (props.isProgramBuilder && props.isValueDetection) {
            processedData = effectiveLegendValues.map(l => {
              const dataPoint: any = {
                name: l.label,
                color: l.color,
                value: 0
              };
              chartData.forEach((row, idx) => {
                const val = Number(row[l.field] || 0);
                const sourceKey = `${row.name || "Unknown"}_${idx}`;
                dataPoint[sourceKey] = val;
                dataPoint.value += val;
              });
              return dataPoint;
            });
          } else if (chartData.length === 1 && effectiveLegendValues.length > 1) {
            // b) API column-per-category format:
            //    chartData = [{name:"Value", projecta:10, projectb:20, ...}]
            //    → flatten into one row per category
            processedData = flattenParetoApiData(chartData, effectiveLegendValues);
          } else {
            // c) Standard row-per-category format
            const primaryField = effectiveLegendValues[0]?.field || "value";
            const mergedMap: Record<string, any> = {};
            chartData.forEach(item => {
              const name = item.name || "Unknown";
              const matchingLegend = effectiveLegendValues.find(
                l => l.label === name || l.field === name
              );
              const color = matchingLegend?.color || effectiveLegendValues[0]?.color || "#4F81BC";
              if (!mergedMap[name]) {
                mergedMap[name] = { name, value: Number(item[primaryField] || 0), color };
              } else {
                mergedMap[name].value += Number(item[primaryField] || 0);
              }
            });
            processedData = Object.values(mergedMap);
          }
        }

        // Sort data descending by value
        const sortedData = [...processedData].sort((a, b) => b.value - a.value);

        // Calculate cumulative percentages
        const totalCount = sortedData.reduce((sum, item) => sum + item.value, 0);
        let cumulative = 0;
        const paretoData = sortedData.map((item) => {
          cumulative += item.value;
          const percentage = totalCount > 0 ? (cumulative / totalCount) * 100 : 0;
          return {
            ...item,
            cumulativePercentage: Number(percentage.toFixed(2)),
          };
        });

        return (
          <div
            className="w-full relative h-full"
            style={{ minHeight: 200 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={paretoData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
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
                  angle={paretoData.length > 10 ? -90 : 0}
                  textAnchor={paretoData.length > 10 ? "end" : "middle"}
                  height={paretoData.length > 10 ? 90 : 60}
                />
                <YAxis
                  yAxisId="left"
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
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: isDarkMode ? "#cbd5e1" : "#9ca3af" }}
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
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: isDarkMode ? "#cbd5e1" : "#9ca3af" }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload;
                    const isAggregated = (props.isProgramBuilder && props.isValueDetection);

                    return (
                      <div className="bg-white dark:bg-slate-900 p-3 border border-border dark:border-slate-800 rounded-xl shadow-xl space-y-2">
                        <p className="font-bold text-gray-900 dark:text-slate-100 border-b border-gray-50 dark:border-slate-800 pb-1.5 mb-1.5">{row.name}</p>

                        {isAggregated ? (
                          <div className="space-y-1.5 mb-2">
                            {sourceKeys.map(source => (
                              (row[source.key] > 0) && (
                                <div key={source.key} className="flex items-center justify-between gap-6">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">{source.label}</span>
                                  </div>
                                  <span className="text-xs font-bold text-gray-900 dark:text-slate-100">{row[source.key]}</span>
                                </div>
                              )
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                              <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">Value</span>
                            </div>
                            <span className="text-xs font-bold text-gray-900 dark:text-slate-100">{row.value}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-6 pt-1.5 border-t border-gray-50 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#C0504E]" />
                            <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">Cumulative</span>
                          </div>
                          <span className="text-xs font-bold text-[#C0504E]">{row.cumulativePercentage}%</span>
                        </div>
                      </div>
                    );
                  }}
                />

                {/* Chart Bars */}
                {(() => {
                  const isAggregated = !!(props.isProgramBuilder && props.isValueDetection);
                  const STACK_COLORS = ["#4F81BC", "#C0504E", "#9BBB59", "#8064A2", "#4BACC6", "#F79646"];

                  if (isAggregated) {
                    return sourceKeys.map((source, sIdx) => (
                      <Bar
                        key={source.key}
                        yAxisId="left"
                        dataKey={source.key}
                        stackId="a"
                        fill={STACK_COLORS[sIdx % STACK_COLORS.length]}
                        maxBarSize={60}
                      >
                        <LabelList
                          dataKey={source.key}
                          content={(labelProps: any) => {
                            const { x, y, width, height, value } = labelProps;
                            if (!value || height < 20) return null;
                            return (
                              <g className="pointer-events-none">
                                <text
                                  x={x + width / 2}
                                  y={y + height / 2 - 2}
                                  fill="#fff"
                                  textAnchor="middle"
                                  fontSize={9}
                                  fontWeight="bold"
                                >
                                  {source.label}
                                </text>
                                <text
                                  x={x + width / 2}
                                  y={y + height / 2 + 10}
                                  fill="#fff"
                                  textAnchor="middle"
                                  fontSize={10}
                                >
                                  ({value})
                                </text>
                              </g>
                            );
                          }}
                        />
                      </Bar>
                    ));
                  }

                  return (
                    <Bar
                      yAxisId="left"
                      dataKey="value"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    >
                      {paretoData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || "#4F81BC"} />
                      ))}
                    </Bar>
                  );
                })()}

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulativePercentage"
                  name="Cumulative %"
                  stroke="#C0504E"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#C0504E', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );
      }}
    </BaseChartContainer>
  );
}
