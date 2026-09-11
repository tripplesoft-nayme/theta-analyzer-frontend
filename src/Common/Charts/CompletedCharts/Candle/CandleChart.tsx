/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import BaseChartContainer from "../Common/BaseChartContainer";
import { BaseChartProps } from "../Common/chartTypes";
import {
  parseCommonChartData,
  extractLegendsFromXAxis,
} from "../Common/chartUtils";
import CandlestickBar from "./CandlestickBar";

const generateCandlestickData = (
  xAxis: string[],
  _legendValues: any[],
  _numOfLegendDataSet: number,
  startingRange: number,
  endingRange: number,
) => {
  const seriesData = [];
  const min = startingRange;
  const max = endingRange;

  for (let i = 0; i < xAxis.length; i++) {
    const label = xAxis[i] || `Data ${i + 1}`;
    const open = Math.random() * (max - min) + min;
    const variance = (max - min) * 0.05;

    const high = open + Math.random() * variance;
    const low = open - Math.random() * variance;
    const close = low + Math.random() * (high - low);

    seriesData.push({
      x: label,
      y: [
        Math.round(open * 100) / 100,
        Math.round(high * 100) / 100,
        Math.round(low * 100) / 100,
        Math.round(close * 100) / 100,
      ],
    });
  }

  return seriesData;
};

export const parseXAxisData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  return parseCommonChartData(xAxis, legendValues, widgetTitle);
};

export default function CandleChart(props: BaseChartProps) {
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
    // Check for candlestickChart property first as per the standard response structure
    const config = tier?.candlestickChart || tier?.barChart || tier;
    const widgets =
      config?.widgets || (Array.isArray(tier?.widgets) ? tier.widgets : []);

    // Candlestick ALWAYS needs 4 legends (Open, High, Low, Close).
    // If the widgets array is not exactly 4, it's likely using default samples (like Sample A, B, C).
    // In such cases, we prioritize extracting from the xAxis header row.
    if (widgets.length === 4) {
      return widgets.map((w: any) => ({
        label: w.legendName || w.label,
        field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        color: w.color,
      }));
    }

    // Try extracting from xAxis headers
    const extracted = extractLegendsFromXAxis(tier.xAxis);
    if (extracted.length === 4) {
      return extracted.map((label: string, idx: number) => ({
        label,
        field: label.toLowerCase().replace(/\s+/g, ""),
        color: idx < 2 ? "#169E7B" : "#DA4352", // Green for Open/High, Red for Low/Close
      }));
    }

    // Last resort: return whatever widgets we have or generic defaults
    return widgets.map((w: any) => ({
      label: w.legendName || w.label,
      field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
      color: w.color,
    }));
  };

  return (
    <BaseChartContainer
      {...props}
      category="CANDLESTICK"
      excelType="barChart"
      generatorFunc={generateCandlestickData}
      getTierLegends={getTierLegends}
      parseTierData={parseXAxisData}
      renderChildChart={(tier, childProps) => (
        <CandleChart
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
        let seriesData: any[] = [];

        if (chartData && chartData.length > 0) {
          const usedLabels = new Map<string, number>();

          seriesData = chartData.map((d: any) => {
            const rawLabel = d.x || d.name || d.label || "Data";
            const count = usedLabels.get(rawLabel) || 0;
            usedLabels.set(rawLabel, count + 1);

            // Create a unique key by adding invisible spaces if it's a duplicate
            const uniqueLabel = rawLabel + "\u200B".repeat(count);

            const fields =
              effectiveLegendValues.length >= 4
                ? effectiveLegendValues.map((l) => l.field)
                : ["open", "high", "low", "close"];

            const o = Number(d[fields[0]] ?? d.open ?? 0);
            const h = Number(d[fields[1]] ?? d.high ?? 0);
            const l = Number(d[fields[2]] ?? d.low ?? 0);
            const c = Number(d[fields[3]] ?? d.close ?? 0);

            // ApexCharts/Recharts requires High >= Low and High >= max(Open, Close)
            // We sanitize here to ensure messy data still renders.
            const realHigh = Math.max(o, h, l, c);
            const realLow = Math.min(o, h, l, c);

            // Color logic: GREEN (bullish), RED (bearish), NEUTRAL (doji/gray)
            let fillColor = "#169E7B"; // Green (bullish)
            if (c < o) {
              fillColor = "#DA4352"; // Red (bearish)
            } else if (Math.abs(c - o) < 0.0001) {
              fillColor = "#808080"; // Gray (neutral/doji)
            }

            return {
              name: uniqueLabel,
              open: o,
              high: realHigh,
              low: realLow,
              close: c,
              openClose: [o, c],
              fillColor,
            };
          });
        }

        // Determine effective Y-axis range
        const allYValues = seriesData.flatMap((d) => [d.open, d.high, d.low, d.close]);
        const dataMin = allYValues.length > 0 ? Math.min(...allYValues) : 0;
        const dataMax = allYValues.length > 0 ? Math.max(...allYValues) : 100;

        let ymin: number = safeStartingRange;
        let ymax: number = safeEndingRange;

        // Auto-scale if range is default 0-100 OR if data is outside the specified range
        const rangeIsDefault = safeStartingRange === 0 && safeEndingRange === 100;
        const outOfRange = dataMin < safeStartingRange || dataMax > safeEndingRange;

        if (rangeIsDefault || outOfRange) {
          const padding = (dataMax - dataMin) * 0.05 || 1;
          ymin = dataMin - padding;
          ymax = dataMax + padding;
        }

        const rangeVal = ymax - ymin;
        const rawStep = rangeVal / 10 || 1;
        const stepVal = rawStep > 1 ? Math.ceil(rawStep) : rawStep;

        const ticksArray: number[] = [];
        for (let i = 0; i <= 10; i++) {
          ticksArray.push(Number((ymin + i * stepVal).toFixed(1)));
        }

        return (
          <div className="w-full h-full relative min-h-[150px]">
            {seriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={seriesData}
                  margin={{ top: 10, right: 10, left: -20, bottom: seriesData.length > 5 ? 40 : 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDarkMode ? "#334155" : "#f0f0f0"}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: isDarkMode ? "#cbd5e1" : "#64748b" }}
                    interval={0}
                    angle={seriesData.length > 5 ? -45 : 0}
                    textAnchor={seriesData.length > 5 ? "end" : "middle"}
                    height={seriesData.length > 5 ? 70 : 30}
                  />
                  <YAxis
                    type="number"
                    domain={[ticksArray[0], ticksArray[ticksArray.length - 1]]}
                    allowDataOverflow={true}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: isDarkMode ? "#cbd5e1" : "#64748b" }}
                    tickFormatter={(num: number) => {
                      if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
                      if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
                      if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
                      return num.toFixed(0);
                    }}
                    ticks={ticksArray}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0].payload;

                      const fields =
                        effectiveLegendValues.length >= 4
                          ? effectiveLegendValues
                          : [
                            { label: "Open", field: "open", color: isDarkMode ? "#cbd5e1" : "#64748b" },
                            { label: "High", field: "high", color: "#169E7B" },
                            { label: "Low", field: "low", color: "#DA4352" },
                            { label: "Close", field: "close", color: isDarkMode ? "#cbd5e1" : "#64748b" },
                          ];

                      return (
                        <div className="bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 rounded shadow-lg">
                          <p className="font-semibold text-gray-900 dark:text-slate-100 mb-2">{row.name}</p>
                          {fields.map((l: any) => (
                            <p
                              key={l.field}
                              style={{ color: l.color }}
                              className="text-sm font-medium"
                            >
                              {l.label}: {Number(row[l.field] ?? 0).toFixed(2)}
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="openClose"
                    shape={<CandlestickBar />}
                    barSize={seriesData.length > 15 ? 8 : seriesData.length > 8 ? 14 : 20}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">
                No candlestick data available.
              </div>
            )}
          </div>
        );
      }}
    </BaseChartContainer>
  );
}
