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

import { BaseChartProps, ChartData, LegendValue } from "../Common/chartTypes";
import { parseCommonChartData, sanitizeSheetName } from "../Common/chartUtils";
import BaseChartContainer from "../Common/BaseChartContainer";

export const generateWaterfallData = (
  xAxis: string[],
  legend: LegendValue[],
  _numOfLegendDataSet: number,
  min: number,
  max: number,
): ChartData[] => {
  const range = (max || 100) - (min || 0);
  const rangeWidth = Math.floor(range / 4);

  return xAxis.filter(Boolean).map((label, index) => {
    const item: any = { name: label };

    legend.forEach((l, lIndex) => {
      const seed = lIndex * 37;
      const baseValue = (min || 0) + ((seed * 17 + index * 23) % Math.max(range, 1));
      const lowerBound = Math.max(min || 0, baseValue - rangeWidth / 2);
      const upperBound = Math.min(max || 100, baseValue + rangeWidth / 2);

      item[l.field] = [Math.round(lowerBound), Math.round(upperBound)];
    });

    return item;
  });
};

export const parseXAxisData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  const result = parseCommonChartData(xAxis, legendValues, widgetTitle);
  const sheetName = sanitizeSheetName(widgetTitle || "Sheet");
  const rawRows = result.data[sheetName] || [];

  if (rawRows.length === 0) return result;

  // Track running totals for each legend field to create the "waterfall" effect
  const runningTotals: Record<string, number> = {};
  legendValues.forEach((l) => {
    runningTotals[l.field] = 0;
  });

  const waterfallRows = rawRows.map((row: any) => {
    const newRow = { ...row };
    legendValues.forEach((l) => {
      const val = Number(row[l.field]) || 0;
      const start = runningTotals[l.field];
      const end = start + val;

      // Waterfall bars are represented as [start, end] arrays in Recharts
      newRow[l.field] = [start, end];

      // Update the running total so the next bar starts where this one ended
      runningTotals[l.field] = end;
    });
    return newRow;
  });

  return {
    ...result,
    data: {
      [sheetName]: waterfallRows,
    },
  };
};

export default function WaterfallChart(props: BaseChartProps) {
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
      tier?.waterFallChart?.widgets ||
      tier?.waterfallChart?.widgets ||
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
      category="WATERFALL"
      excelType="barChart"
      generatorFunc={generateWaterfallData}
      getTierLegends={getTierLegends}
      parseTierData={parseXAxisData}
      renderChildChart={(tier, childProps) => (
        <WaterfallChart
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
        <div className="w-full relative h-full min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDarkMode ? "#334155" : "#f0f0f0"}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: isDarkMode ? "#cbd5e1" : "#9ca3af" }}
              />
              <YAxis
                width={35}
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
                    <div className="bg-white dark:bg-slate-900 p-3 border dark:border-slate-800 rounded shadow-lg z-50">
                      <p className="font-semibold mb-2 dark:text-slate-100">{row.name}</p>
                      {effectiveLegendValues.map((l) => {
                        const val = row[l.field];
                        const displayVal = Array.isArray(val)
                          ? `${val[0]} - ${val[1]}`
                          : val;
                        return (
                          <p
                            key={l.field}
                            style={{ color: l.color }}
                            className="text-sm font-medium"
                          >
                            {l.label}: {displayVal}
                          </p>
                        );
                      })}
                    </div>
                  );
                }}
                cursor={{ fill: "transparent" }}
              />

              {effectiveLegendValues.map((l) => (
                <Bar
                  key={l.field}
                  dataKey={l.field}
                  fill={l.color}
                  radius={4}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </BaseChartContainer>
  );
}
