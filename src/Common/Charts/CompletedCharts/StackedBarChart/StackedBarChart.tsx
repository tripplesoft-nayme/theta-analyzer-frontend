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
import { generateChartData, generateSampleBarChartData } from "@/utils/clientPannelHelpers/programBuilderHelpers";

// Common Imports
import { BaseChartProps, ChartType } from "../Common/chartTypes";
import { parseCommonChartData, getNiceStep } from "../Common/chartUtils";
import BaseChartContainer from "../Common/BaseChartContainer";

/**
 * Parse xAxis 2D array format from API for Stacked Bar
 */
export const parseXAxisData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  return parseCommonChartData(xAxis, legendValues, widgetTitle);
};

/*      COMPONENT      */

interface CustomStackedBarChartProps extends BaseChartProps {
  category?: "BAR" | "SAMPLECHART";
}

export default function StackedBarChart({ category = "BAR", ...props }: CustomStackedBarChartProps) {
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

  const isSample = category === "SAMPLECHART";

  const getTierLegends = (tier: any) => {
    const widgetsList = isSample
      ? (tier?.sampleChart?.widgets || tier?.sampleBarChart?.widgets || tier?.widgets || [])
      : (tier?.barChart?.widgets || tier?.widgets || []);

    return widgetsList.map((w: any) => ({
      label: w.legendName || w.label,
      field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
      color: w.color,
    }));
  };
  return (
    <BaseChartContainer
      {...props}
      category={category as ChartType}
      excelType="barChart"
      generatorFunc={isSample ? generateSampleBarChartData : generateChartData}
      getTierLegends={getTierLegends}
      parseTierData={parseXAxisData}
      renderChildChart={(tier, childProps) => (
        <StackedBarChart
          {...childProps}
          category={category}
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
        const isStackedChart = !isSample && props.isStacked !== false;

        let calculatedEndingRange = safeEndingRange || 100;
        if (isStackedChart && chartData?.length > 0) {
          const maxStackedValue = chartData.reduce((max: number, row: any) => {
            const sum = effectiveLegendValues.reduce((s: number, l: any) => s + (Number(row[l.field]) || 0), 0);
            return Math.max(max, sum);
          }, 0);
          calculatedEndingRange = Math.max(safeEndingRange || 0, Math.ceil(maxStackedValue / 10) * 10);
        } else {
          calculatedEndingRange = Math.ceil((safeEndingRange || 100) / 10) * 10;
        }

        const minVal = safeStartingRange || 0;
        const range = calculatedEndingRange - minVal;
        const rawStep = range / 10 || 1;
        const stepVal = getNiceStep(rawStep);

        const ticksArray: number[] = [];
        for (let i = 0; i <= 10; i++) {
          ticksArray.push(Number((minVal + i * stepVal).toFixed(1)));
        }

        return (
          <div className="w-full relative h-full min-h-[150px] flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: chartData?.length > 10 ? 20 : 5 }}
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
                  tick={{ fontSize: 10, fill: isDarkMode ? "#cbd5e1" : "#9ca3af" }}
                  interval={0}
                  angle={chartData?.length > 5 ? -45 : 0}
                  textAnchor={chartData?.length > 5 ? "end" : "middle"}
                  height={chartData?.length > 5 ? 70 : 30}
                />
                <YAxis
                  type="number"
                  domain={[ticksArray[0], ticksArray[ticksArray.length - 1]]}
                  allowDataOverflow={true}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={{ fontSize: 12, fill: isDarkMode ? "#cbd5e1" : "#9ca3af" }}
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
                      <div className="bg-white dark:bg-slate-900 p-3 border border-gray-200 dark:border-slate-800 rounded shadow-lg">
                        <p className="font-semibold text-gray-900 dark:text-slate-100 mb-2">{row.name}</p>
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

                {effectiveLegendValues.map((l, index) => (
                  <Bar
                    key={l.field}
                    dataKey={l.field}
                    stackId={isSample ? undefined : (props.isStacked === false ? undefined : "a")}
                    fill={l.color}
                    radius={
                      isSample || props.isStacked === false || index === effectiveLegendValues.length - 1
                        ? [4, 4, 0, 0]
                        : 0
                    }
                    label={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      }

      }
    </BaseChartContainer>
  );
}
