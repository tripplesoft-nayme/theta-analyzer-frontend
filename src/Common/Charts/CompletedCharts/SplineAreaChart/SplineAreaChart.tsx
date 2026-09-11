import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
 * Parse xAxis 2D array format from API
 */
export const parseSplineChartData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  return parseCommonChartData(xAxis, legendValues, widgetTitle);
};

/* ---------- COMPONENT ---------- */

export default function SplineAreaChart(props: BaseChartProps) {
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
    const widgets = tier?.splineChart?.widgets || tier?.widgets || [];
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
      color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419"][idx % 4],
    }));
  };

  return (
    <BaseChartContainer
      {...props}
      category="SPLINE"
      excelType="splineChart"
      generatorFunc={generateAreaChartData}
      getTierLegends={getTierLegends}
      parseTierData={parseSplineChartData}
      renderChildChart={(tier, childProps) => (
        <SplineAreaChart
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
        <div className="w-full h-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ bottom: chartData.length > 5 ? 40 : 10, right:20 }}>
              <defs>
                {effectiveLegendValues.map((l, index) => (
                  <linearGradient
                    key={`grad-${index}`}
                    id={`color-${l.field}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={l.color} stopOpacity={0.75} />
                    <stop offset="95%" stopColor={l.color} stopOpacity={0.25} />
                  </linearGradient>
                ))}
              </defs>
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
                tick={{ fontSize: 12, fill: isDarkMode ? "#cbd5e1" : "#9ca3af" }}
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
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-slate-900 p-3 border dark:border-slate-800 rounded shadow-lg">
                      <p className="font-semibold mb-2 dark:text-slate-100">{row.name}</p>
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
              {effectiveLegendValues.map((l) => (
                <Area
                  key={l.field}
                  type="monotone"
                  dataKey={l.field}
                  stroke={l.color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#color-${l.field})`}
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
              <Legend verticalAlign="bottom" height={36} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </BaseChartContainer>
  );
}
