/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Radar,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// Common Imports
import { BaseChartProps } from "../Common/chartTypes";
import {
  parseCommonChartData,
  extractLegendsFromXAxis,
} from "../Common/chartUtils";
import { generateChartData } from "@/utils/clientPannelHelpers/programBuilderHelpers";
import BaseChartContainer from "../Common/BaseChartContainer";

/**
 * Custom parser for Radar Chart data.
 */
export const parseRadarData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  return parseCommonChartData(xAxis, legendValues, widgetTitle);
};

/* ---------- COMPONENT ---------- */

export default function RadarChart(props: BaseChartProps) {
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
    const radarConfig = tier?.radarChart || tier;
    const widgets = radarConfig?.widgets || tier?.widgets || [];

    if (widgets.length > 0) {
      return widgets.map((w: any) => ({
        label: w.legendName || w.label,
        field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        color: w.color,
      }));
    }

    // Fallback: derive from xAxis if no widgets
    const derived = extractLegendsFromXAxis(tier.xAxis || tier.labels);
    return derived.map((lbl, idx) => ({
      label: lbl,
      field: lbl.toLowerCase().replace(/\s+/g, ""),
      color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
    }));
  };

  return (
    <BaseChartContainer
      {...props}
      category="RADAR"
      excelType="barChart" // Follows multi-series Excel export
      generatorFunc={generateChartData}
      getTierLegends={getTierLegends}
      parseTierData={parseRadarData}
      renderChildChart={(tier, childProps) => (
        <RadarChart
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({ chartData, effectiveLegendValues, effectiveXAxisValues }) => {
        // Prepare data: Ensure each row is a unique axis point even if names are duplicate
        const processedData = (() => {
          if (!Array.isArray(chartData) || chartData.length === 0) return [];

          return chartData.map((item, idx) => ({
            ...item,
            uniqueId: `${item.name || "Unknown"}_${idx}`
          }));
        })();

        // Calculate dynamic domain to prevent clipping
        const maxValue = processedData.reduce((max, row) => {
          let rowMax = 0;
          effectiveLegendValues.forEach(l => {
            rowMax = Math.max(rowMax, Number(row[l.field]) || 0);
          });
          return Math.max(max, rowMax);
        }, 0);

        const safeEndingRange = Math.max(Number(props.endingRange) || 100, maxValue);

        /* ========= CENTER METRIC LOGIC ========= */
        const centerMetric = (() => {
          if (!processedData.length || !effectiveLegendValues.length) return null;

          // Calculate average of first legend's values across all axis points
          const firstLegend = effectiveLegendValues[0];
          if (!firstLegend) return null;

          const sum = processedData.reduce(
            (acc: number, dp: any) => acc + Number(dp[firstLegend.field] || 0),
            0,
          );
          const avg = sum / processedData.length;

          return {
            label: effectiveXAxisValues[0] || "Average",
            value: avg.toFixed(0),
          };
        })();

        const CustomTooltip = ({ active, payload }: any) => {
          if (!active || !payload?.length) return null;
          const row = payload[0].payload;

          return (
            <div className="bg-white dark:bg-slate-900 p-3 border dark:border-slate-800 rounded-xl shadow-xl space-y-1.5 min-w-[120px]">
              <p className="font-bold text-gray-900 dark:text-slate-100 border-b border-gray-50 dark:border-slate-800 pb-1 mb-1">{row.name}</p>
              {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke }} />
                    <span className="text-[10px] font-bold text-gray-500 dark:text-slate-300 uppercase">{p.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-slate-100">{p.value}</span>
                </div>
              ))}
            </div>
          );
        };

        return (
          <div className="relative w-full h-full min-h-[50px]">
            <ResponsiveContainer width="100%" height="100%">
              <ReRadarChart data={processedData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <PolarGrid stroke={isDarkMode ? "#334155" : "#e5e7eb"} />
                <PolarAngleAxis
                  dataKey="uniqueId"
                  tickFormatter={(val) => {
                    const item = processedData.find(d => d.uniqueId === val);
                    return item?.name || "";
                  }}
                  tick={{ fill: isDarkMode ? "#cbd5e1" : "#6b7280", fontSize: 10, fontWeight: 500 }}
                />
                 <PolarRadiusAxis
                   angle={90}
                   domain={(() => {
                     const minVal = Number(props.startingRange) || 0;
                     const maxEnding = safeEndingRange || 100;
                     const range = maxEnding - minVal;
                     const rawStep = range / 10 || 1;
                     const stepVal = rawStep > 1 ? Math.ceil(rawStep) : rawStep;
                     return [minVal, minVal + stepVal * 10];
                   })()}
                   tick={{ fill: isDarkMode ? "#cbd5e1" : "#9ca3af", fontSize: 9 }}
                   axisLine={false}
                   tickCount={11}
                   tickFormatter={(num: number) => {
                     if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
                     if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
                     if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
                     return num.toString();
                   }}
                 />
                <Tooltip content={<CustomTooltip />} />

                {effectiveLegendValues.map((l) =>
                  l.label ? (
                    <Radar
                      key={l.field}
                      name={l.label}
                      dataKey={l.field}
                      stroke={l.color}
                      fill={l.color}
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                  ) : null,
                )}
              </ReRadarChart>
            </ResponsiveContainer>

            {/* CENTER METRIC OVERLAY */}
            {centerMetric && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mb-6">
                <div className="text-[9px] text-gray-400 dark:text-slate-300 font-bold uppercase tracking-tighter leading-none mb-1">
                  {centerMetric.label}
                </div>
                <div className="text-xl font-bold text-gray-800 dark:text-slate-100 leading-none">
                  {centerMetric.value}
                </div>
              </div>
            )}
          </div>
        );
      }}
    </BaseChartContainer>
  );
}
