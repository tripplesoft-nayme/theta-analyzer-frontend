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
  getNiceStep,
} from "../Common/chartUtils";
import BaseChartContainer from "../Common/BaseChartContainer";

/**
 * Parse xAxis 2D array format from API for Column Chart
 */
export const parseColumnChartData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  return parseCommonChartData(xAxis, legendValues, widgetTitle);
};

/*      COMPONENT      */

export default function ColumnBarChart(props: BaseChartProps) {
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
    const columnChartConfig = tier?.columnChart || tier;
    const widgets = columnChartConfig?.widgets || tier?.widgets || [];

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
      category="COLUMN"
      excelType="barChart"
      generatorFunc={generateChartData}
      getTierLegends={getTierLegends}
      parseTierData={parseColumnChartData}
      renderChildChart={(tier, childProps) => (
        <ColumnBarChart
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
          <div
            className="w-full relative h-full min-h-[150px]"
          // style={{ height: props.chartHeight ? `${props.chartHeight}px` : undefined }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ bottom: chartData.length > 5 ? 40 : 10 }}>
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
                  width={35}
                  type="number"
                  domain={[ticksArray[0], ticksArray[ticksArray.length - 1]]}
                  allowDataOverflow={true}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: isDarkMode ? "#cbd5e1" : "#9ca3af" }}
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
                cursor={{ fill: "transparent" }}
              />

              {effectiveLegendValues.map((l) => (
                <Bar
                  key={l.field}
                  dataKey={l.field}
                  fill={l.color}
                  radius={[4, 4, 0, 0]}
                  barSize={40}
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
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }}
  </BaseChartContainer>
  );
}
