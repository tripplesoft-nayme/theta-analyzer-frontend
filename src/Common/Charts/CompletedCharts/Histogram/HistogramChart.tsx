/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { parseCommonChartData } from "../Common/chartUtils";
import { BaseChartProps, LegendValue, ChartData } from "../Common/chartTypes";
import BaseChartContainer from "../Common/BaseChartContainer";

/*       HELPER FUNCTIONS       */

const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const deterministicRandom = (
  seed: number,
  min: number,
  max: number,
): number => {
  const x = Math.sin(seed) * 10000;
  const random = x - Math.floor(x);
  return Math.floor(random * (max - min + 1)) + min;
};

const generateHistogramSampleData = (
  _xAxis: string[],
  legends: LegendValue[],
  _numSets: number,
  start: number,
  end: number,
): ChartData[] => {
  const observations: ChartData[] = [];
  legends.forEach((legend, idx) => {
    for (let i = 0; i < 50; i++) {
      const seed = simpleHash(`${legend.field}-${i}-${start}-${end}`);
      const baseValue = deterministicRandom(seed, start, end);
      const variation = idx * 10;
      const value = Math.max(start, Math.min(end, baseValue + variation));

      observations.push({
        name: `obs_${i}`,
        [legend.field]: value,
        series: `series_${idx}`,
      });
    }
  });
  return observations;
};

const getHistogramTierLegends = (tier: any): LegendValue[] => {
  const usedFields = new Set<string>();
  return (tier.widgets || tier.histogramChart?.widgets || []).map(
    (w: any, idx: number) => {
      let field = (w.legendName || w.label || "Legend")
        .toLowerCase()
        .replace(/\s+/g, "");

      if (usedFields.has(field)) {
        field = `${field}_${idx}`;
      }
      usedFields.add(field);

      return {
        label: w.legendName || w.label || "Legend",
        field,
        color: w.color || "#8D79F6",
      };
    }
  );
};

/*       COMPONENT       */

export default function HistogramChart(props: BaseChartProps) {
  const { binCount = 10, showLegend = true } = props;
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <BaseChartContainer
      {...props}
      category="HISTOGRAM"
      excelType="areaChart"
      generatorFunc={generateHistogramSampleData}
      getTierLegends={getHistogramTierLegends}
      parseTierData={parseCommonChartData}
      showLegend={showLegend}
      renderChildChart={(tier, childProps) => (
        <HistogramChart {...childProps} key={tier.id} />
      )}
    >
      {({
        chartData,
        effectiveLegendValues,
        safeStartingRange,
        safeEndingRange,
      }) => {
        if (!chartData.length) return null;

        // 1. DETECT MODE
        let isPreAggregated = false;
        if (chartData.length > 0) {
          const firstRowName = String(chartData[0].name || "");
          isPreAggregated = firstRowName.includes("-");
        }

        // 2. PARSE BINS AND WIDTH
        let derivedBinWidth = Math.max(1, Math.round(binCount || 10));
        const customBins: [number, number][] = [];

        // 2a. Determine Actual Data Range (important for raw data)
        let actualDataMin = safeStartingRange;
        let actualDataMax = safeEndingRange;

        if (!isPreAggregated && chartData.length > 0) {
          effectiveLegendValues.forEach((legend) => {
            chartData.forEach((row: any) => {
              const val = Number(row[legend.field]);
              if (!isNaN(val)) {
                actualDataMin = Math.min(actualDataMin, val);
                actualDataMax = Math.max(actualDataMax, val);
              }
            });
          });
          // Ensure min/max don't overlap too tightly and handle single-point cases
          if (actualDataMin === actualDataMax) {
            actualDataMin -= 10;
            actualDataMax += 10;
          }
        }

        if (isPreAggregated) {
          // Parse bins from names like "0-10"
          chartData.forEach((row: any) => {
            const name = String(row.name);
            if (name.includes("-")) {
              const parts = name.split("-").map((v) => parseInt(v.trim()));
              if (!isNaN(parts[0]) && !isNaN(parts[1])) {
                customBins.push([parts[0], parts[1]]);
              }
            }
          });
          if (customBins.length > 0) {
            derivedBinWidth = Math.abs(customBins[0][1] - customBins[0][0]);
          }
        } else {
          // For raw data, if the spread is massive, we might need a larger bin width
          // to keep the number of ticks reasonable.
          const spread = actualDataMax - actualDataMin;
          if (spread > 0 && spread > derivedBinWidth * 50) {
            // Cap at 50 bins by default if spread is huge
            derivedBinWidth = Math.ceil(spread / (binCount || 20));
          }
        }

        const binWidth = derivedBinWidth;

        // 3. TRANSFORM DATA IF PRE-AGGREGATED
        let dataToRender: any[] = [];
        if (isPreAggregated) {
          const syntheticData: any[] = [];
          chartData.forEach((row: any) => {
            const name = String(row.name);
            if (name.includes("-")) {
              const parts = name.split("-").map((v) => parseInt(v.trim()));
              if (!isNaN(parts[0]) && !isNaN(parts[1])) {
                const midpoint = (parts[0] + parts[1]) / 2;
                const dataPoint: any = { name: `${parts[0]}-${parts[1]}`, midpoint };
                effectiveLegendValues.forEach((legend) => {
                  dataPoint[legend.field] = midpoint;
                  const freq = Number(row[legend.field] || 0);
                  dataPoint[`${legend.field}_freq`] = freq;
                });
                syntheticData.push(dataPoint);
              }
            }
          });
          dataToRender = syntheticData;
        } else {
          // Manually bin raw data
          const start = Math.floor(actualDataMin / binWidth) * binWidth;
          const end = Math.ceil(actualDataMax / binWidth) * binWidth;

          for (
            let current = start;
            current <= end;
            current += binWidth
          ) {
            customBins.push([
              current,
              current + binWidth,
            ]);
          }

          const bins = customBins.map(b => {
            const base: any = { name: `${b[0]}-${b[1]}`, min: b[0], max: b[1] };
            effectiveLegendValues.forEach(leg => { base[`${leg.field}_freq`] = 0; });
            return base;
          });

          chartData.forEach((row: any) => {
            effectiveLegendValues.forEach(leg => {
              const val = Number(row[leg.field]);
              if (!isNaN(val)) {
                const bin = bins.find(b => val >= b.min && val < b.max) || bins[bins.length - 1];
                if (bin) {
                  bin[`${leg.field}_freq`] += 1;
                }
              }
            });
          });
          dataToRender = bins;
        }

        return (
          <div className="w-full h-full min-h-[150px]" style={{ height: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataToRender} barCategoryGap={0} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f0f0f0"} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: isDarkMode ? "#cbd5e1" : "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: isDarkMode ? "#334155" : "#cbd5e1" }}
                  tickLine={{ stroke: isDarkMode ? "#334155" : "#cbd5e1" }}
                />
                <YAxis
                  width={35}
                  domain={(() => {
                    const minVal = safeStartingRange || 0;
                    const maxEnding = safeEndingRange || 100;
                    const range = maxEnding - minVal;
                    const rawStep = range / 10 || 1;
                    const stepVal = rawStep > 1 ? Math.ceil(rawStep) : rawStep;
                    return [minVal, minVal + stepVal * 10];
                  })()}
                  allowDataOverflow={true}
                  tick={{ fill: isDarkMode ? "#cbd5e1" : "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: isDarkMode ? "#334155" : "#cbd5e1" }}
                  tickLine={{ stroke: isDarkMode ? "#334155" : "#cbd5e1" }}
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
                <RechartsTooltip
                  cursor={{ fill: isDarkMode ? "#1e293b" : "#f1f5f9" }}
                  contentStyle={{ backgroundColor: isDarkMode ? "#0f172a" : "#fff", borderColor: isDarkMode ? "#334155" : "#e2e8f0" }}
                  itemStyle={{ color: isDarkMode ? "#e2e8f0" : "#0f172a" }}
                  formatter={(value: number, name: string) => {
                    const originalName = name.replace("_freq", "");
                    const legend = effectiveLegendValues.find(l => l.field === originalName);
                    return [value, legend ? legend.label : name];
                  }}
                />
                {showLegend && <Legend wrapperStyle={{ paddingTop: "20px" }} />}
                {effectiveLegendValues.map((legend, index) => (
                  <Bar
                    key={legend.field}
                    dataKey={`${legend.field}_freq`}
                    name={legend.label}
                    fill={legend.color}
                    fillOpacity={0.8 - index * 0.1}
                    stroke={isDarkMode ? "#1e293b" : "#ffffff"}
                    strokeWidth={1}
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
