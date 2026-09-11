import { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip } from "recharts";
import { generateAreaChartData } from "@/utils/clientPannelHelpers/programBuilderHelpers";
import BaseChartContainer from "../Common/BaseChartContainer";
import { BaseChartProps, LegendValue } from "../Common/chartTypes";
import {
  parseCommonChartData,
  extractLegendsFromXAxis,
} from "../Common/chartUtils";

export default function SparkLinesChart(props: BaseChartProps) {
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

  const getTierLegends = (tier: any): LegendValue[] => {
    const widgets = tier.widgets || [];
    if (widgets.length > 0) {
      return widgets.map((w: any) => ({
        label: w.legendName || w.label,
        color: w.color || "#35B6EE",
        field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
      }));
    }
    // Fallback if no widgets/metadata
    const derived = extractLegendsFromXAxis(tier.xAxis);
    return derived.map((lbl, idx) => ({
      label: lbl,
      field: lbl.toLowerCase().replace(/\s+/g, ""),
      color: ["#35B6EE", "#13A490", "#6F78F9", "#F26419"][idx % 4],
    }));
  };

  const parseTierData = (xAxis: any, legends: LegendValue[], title: string) => {
    return parseCommonChartData(xAxis, legends, title);
  };

  const renderChildChart = (tier: any, childProps: any) => (
    <SparkLinesChart
      {...childProps}
      key={tier.id}
      preFetchedChildren={tier.children}
    />
  );

  return (
    <BaseChartContainer
      {...props}
      category="SPARKLINE"
      excelType="sparklineChart"
      generatorFunc={generateAreaChartData}
      getTierLegends={getTierLegends}
      parseTierData={parseTierData}
      renderChildChart={renderChildChart}
    >
      {({ chartData, effectiveLegendValues }) => {
        return (
          <div className="w-full flex-1 min-h-0 flex flex-col gap-2 py-1 overflow-y-auto scrollbar-thin pr-1">
            {effectiveLegendValues.map((legend) => {
              // Transform data for Recharts
              const data = chartData.map((d: any) => ({
                name: d.name,
                value: Number(d[legend.field]) || 0,
              }));

              const currentPoint = data.length > 0 ? data[data.length - 1] : null;
              const currentValue = currentPoint ? currentPoint.value : 0;

              return (
                <div key={legend.field} className="flex flex-col flex-1 min-h-[60px] group py-2 border-b border-gray-100 dark:border-slate-800 last:border-b-0">
                  <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1 h-6 rounded-full"
                        style={{ backgroundColor: legend.color }}
                      />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-400 dark:text-slate-300 uppercase tracking-widest leading-none mb-0.5">
                          Dataset
                        </span>
                        <span className="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">
                          {legend.label}
                        </span>
                      </div>
                    </div>

                    {data.length > 0 && (
                      <div className="flex items-center gap-4 text-right">
                        <div className="flex flex-col items-end min-w-[50px]">
                          <span className="text-[8px] font-bold text-gray-400 dark:text-slate-300 uppercase">
                            Value
                          </span>
                          <span
                            className="text-lg font-mono font-black leading-tight"
                            style={{ color: legend.color }}
                          >
                            {currentValue}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-h-[40px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data}
                        margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
                        style={{ overflow: 'visible' }}
                      >
                        <defs>
                          <linearGradient id={`gradient-${legend.field}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={legend.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={legend.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-slate-800 px-2 py-1 border border-border dark:border-slate-700 rounded shadow-sm text-[10px] font-bold" style={{ color: legend.color }}>
                                  {payload[0].value}
                                </div>
                              );
                            }
                            return null;
                          }}
                          cursor={{ stroke: legend.color, strokeWidth: 1, strokeDasharray: '3 3' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={legend.color}
                          strokeWidth={2.5}
                          fill={`url(#gradient-${legend.field})`}
                          dot={false}
                          activeDot={{ r: 4, strokeWidth: 0, fill: legend.color }}
                          animationDuration={1500}
                          label={
                            props.isProgramBuilder
                              ? {
                                position: "top",
                                fill: legend.color,
                                fontSize: 10,
                                fontWeight: 700,
                                formatter: (val: number) => (val === 0 ? "" : val),
                              }
                              : false
                          }
                        />
                        <YAxis hide domain={["auto", "auto"]} />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 8, fontWeight: 800, fill: isDarkMode ? '#cbd5e1' : '#9ca3af' }}
                          height={25}
                          interval="preserveStartEnd"
                          padding={{ left: 10, right: 10 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
            {chartData.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-300 dark:text-slate-500 italic py-12 text-sm">
                No data available for sparklines
              </div>
            )}
          </div>
        );
      }}
    </BaseChartContainer>
  );
}
