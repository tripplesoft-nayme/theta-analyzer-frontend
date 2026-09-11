/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  ComposedChart,
  Line,
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
import { parseCommonChartData, getNiceStep } from "../Common/chartUtils";
import BaseChartContainer from "../Common/BaseChartContainer";

/**
 * Parse xAxis 2D array format from API for Combo Chart
 */
export const parseComboChartData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  return parseCommonChartData(xAxis, legendValues, widgetTitle);
};

/*      COMPONENT      */

export default function ComboChart(props: BaseChartProps) {
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
    return (tier?.comboChart?.widgets || tier?.widgets || []).map((w: any, index: number) => ({
      label: w.legendName || w.label || `Legend ${index + 1}`,
      field: (w.legendName || w.label || `field_${index}`)?.toLowerCase().replace(/\s+/g, ""),
      color: w.color || "#000000",
      // For Combo Chart, we assume 1st is Bar, rest are Line if index > 0
      type: index === 0 ? "bar" : "line",
    }));
  };

  return (
    <BaseChartContainer
      {...props}
      category="COMBO"
      excelType="comboChart"
      generatorFunc={generateChartData}
      getTierLegends={getTierLegends}
      parseTierData={parseComboChartData}
      renderChildChart={(tier, childProps) => (
        <ComboChart
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
        const hasData = chartData && chartData.length > 0;

        const minVal = safeStartingRange || 0;
        const maxEnding = safeEndingRange || 100;
        const range = maxEnding - minVal;
        const rawStep = range / 10 || 1;
        const stepVal = getNiceStep(rawStep);

        const ticksArray: number[] = [];
        for (let i = 0; i <= 10; i++) {
          ticksArray.push(Number((minVal + i * stepVal).toFixed(1)));
        }

        return (
          <div className="w-full h-full min-h-[150px] relative flex flex-col">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 35, bottom: 20, left: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDarkMode ? "#334155" : "#f3f4f6"}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: isDarkMode ? "#cbd5e1" : "#9ca3af", fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    width={35}
                    type="number"
                    domain={[ticksArray[0], ticksArray[ticksArray.length - 1]]}
                    allowDataOverflow={true}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: isDarkMode ? "#cbd5e1" : "#9ca3af", fontWeight: 500 }}
                    dx={-10}
                    ticks={ticksArray}
                    tickFormatter={(num: number) => {
                      if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
                      if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
                      if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
                      return num.toString();
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0].payload;
                      return (
                        <div className="bg-white/98 dark:bg-slate-900/98 backdrop-blur-md p-3 border border-border dark:border-slate-800 rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 min-w-[150px]">
                          <p className="font-bold text-gray-900 dark:text-slate-100 border-b border-gray-50 dark:border-slate-800 pb-2 mb-2 text-[10px] uppercase tracking-widest">{row.name}</p>
                          <div className="space-y-2">
                            {effectiveLegendValues.map((l, idx) => (
                              <div key={l.field} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 ${idx === 0 ? 'rounded-sm' : 'rounded-full'}`}
                                    style={{ backgroundColor: l.color }}
                                  />
                                  <span className="text-[10px] text-gray-500 dark:text-slate-300 font-medium">{l.label}</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-900 dark:text-slate-100 uppercase">{row[l.field] ?? 0}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }}
                    cursor={{ fill: isDarkMode ? "#1e293b" : "#f9fafb", radius: 4 }}
                  />

                  {/* Render 1st as Bar, 2nd as Line */}
                  {effectiveLegendValues.map((l, index) => {
                    if (index === 0) {
                      return (
                        <Bar
                          key={l.field}
                          dataKey={l.field}
                          fill={l.color}
                          barSize={32}
                          radius={[4, 4, 0, 0]}
                          animationDuration={1500}
                        />
                      )
                    } else {
                      return (
                        <Line
                          key={l.field}
                          type="monotone"
                          dataKey={l.field}
                          stroke={l.color}
                          strokeWidth={3}
                          dot={{ r: 4, fill: l.color, strokeWidth: 2, stroke: "#fff" }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          animationDuration={2000}
                        />
                      )
                    }
                  })}
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <span className="text-gray-400 dark:text-slate-500 text-xl font-bold">!</span>
                </div>
                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">No Data Available</p>
                <p className="text-[10px] text-gray-300 dark:text-slate-600 mt-1 italic uppercase">Configure legends to see visualization</p>
              </div>
            )}
          </div>
        );
      }}
    </BaseChartContainer>
  );
}
