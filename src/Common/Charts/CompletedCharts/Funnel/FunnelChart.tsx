/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

// Common Imports
import { BaseChartProps, LegendValue, ChartData } from "../Common/chartTypes";
import { parseCommonChartData } from "../Common/chartUtils";
import BaseChartContainer from "../Common/BaseChartContainer";

/**
 * Generates descending sample data for the funnel based on legend count.
 */
export const generateFunnelSampleData = (
  _xAxis: string[],
  legends: LegendValue[],
  _num: number,
  _start: number,
  _end: number,
): ChartData[] => {
  const row: any = { name: "Value" };
  legends.forEach((l, index) => {
    row[l.field] = 100 - index * 10; // Simple descending progression
  });
  return [row];
};

/**
 * Custom parser for Funnel Chart data.
 * Funnel charts expect a series of values, one for each stage (legend).
 */
export const parseFunnelChartData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  // Use the standard common parser which returns { labels, data }
  return parseCommonChartData(xAxis, legendValues, widgetTitle);
};

/* ---------- COMPONENT ---------- */

export default function FunnelChart(props: BaseChartProps) {
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
    const funnelConfig = tier?.funnelChart || tier;
    const widgets = funnelConfig?.widgets || tier?.widgets || [];

    if (widgets.length > 0) {
      return widgets.map((w: any) => ({
        label: w.legendName || w.label,
        field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        color: w.color,
      }));
    }
    return [];
  };

  return (
    <BaseChartContainer
      {...props}
      category="FUNNEL"
      excelType="barChart"
      generatorFunc={generateFunnelSampleData}
      getTierLegends={getTierLegends}
      parseTierData={parseFunnelChartData}
      renderChildChart={(tier, childProps) => (
        <FunnelChart
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({ chartData, effectiveLegendValues }) => {
        const isAggregated =
          chartData.length > 1 &&
          (props.isProgramBuilder || props.isValueDetectOn || props.isValueDetection);

        // Pre-process rows based on mode
        let rows: { name: string; segments: { value: number; color: string; label: string }[] }[] = [];

        if (isAggregated) {
          // Aggregated mode: Each source chart is a row
          rows = (chartData as any[]).map((row) => ({
            name: row.name,
            segments: effectiveLegendValues.map((l) => ({
              value: Number(row[l.field] || 0),
              color: l.color,
              label: l.label,
            })),
          }));
        } else {
          // Standard mode: Each legend is a row
          const row = (chartData[0] || {}) as any;
          rows = effectiveLegendValues.map((l) => ({
            name: l.label,
            segments: [
              {
                value: Number(row[l.field] || 0),
                color: l.color,
                label: l.label,
              },
            ],
          }));
        }

        if (rows.length === 0) {
          return (
            <div className="flex-1 flex items-center justify-center text-gray-400 italic">
              Please configure funnel stages to see visualization.
            </div>
          );
        }

        // Calculate Totals and Scale
        const rowTotals = rows.map((r) => r.segments.reduce((s, seg) => s + seg.value, 0));
        const maxTotal = Math.max(...rowTotals, 1);

        // Geometry Constants - Fixed base for viewBox calculation
        const baseWidth = 800; // Total logical width
        const labelAreaWidth = 150; // Area for left labels
        const totalAreaWidth = 60; // Area for right totals
        const chartAreaWidth = baseWidth - labelAreaWidth - totalAreaWidth;

        const barHeight = 90;
        const gap = 20;
        const totalHeight = rows.length * (barHeight + gap) - gap + 40; // +40 for some padding
        const scale = chartAreaWidth / maxTotal;

        return (
          <div className="w-full h-full min-h-[150px] flex flex-col items-center">
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${baseWidth} ${totalHeight}`}
              preserveAspectRatio="xMidYMid meet"
              className="overflow-visible"
            >
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                  <feOffset dx="0" dy="1" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.2" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {rows.map((row, i) => {
                const currentY = i * (barHeight + gap) + 10; // +10 top padding
                const currentTotal = rowTotals[i];
                const currentOffset = labelAreaWidth + ((chartAreaWidth - currentTotal * scale) / 2);

                let accumulatedX = currentOffset;

                // Segments and Connectors
                const segments = row.segments.map((seg, j) => {
                  const segWidth = seg.value * scale;
                  const x = accumulatedX;
                  accumulatedX += segWidth;

                  // Calculate connector to next row
                  let connector = null;
                  if (i < rows.length - 1) {
                    const nextTotal = rowTotals[i + 1];
                    const nextOffset = labelAreaWidth + ((chartAreaWidth - nextTotal * scale) / 2);

                    // Sum up values in next row to find same segment's position
                    let nextAccumulatedX = nextOffset;
                    for (let k = 0; k < j; k++) {
                      nextAccumulatedX += (rows[i + 1].segments[k]?.value || 0) * scale;
                    }
                    const nextSegWidth = (rows[i + 1].segments[j]?.value || 0) * scale;

                    const points = [
                      `${x},${currentY + barHeight}`,
                      `${x + segWidth},${currentY + barHeight}`,
                      `${nextAccumulatedX + nextSegWidth},${currentY + barHeight + gap}`,
                      `${nextAccumulatedX},${currentY + barHeight + gap}`,
                    ].join(" ");

                    connector = (
                      <polygon
                        key={`conn-${i}-${j}`}
                        points={points}
                        fill={seg.color}
                        opacity="0.25"
                      />
                    );
                  }

                  return (
                    <g key={`seg-${i}-${j}`}>
                      {connector}
                      <rect
                        x={x}
                        y={currentY}
                        width={segWidth}
                        height={barHeight}
                        fill={seg.color}
                        rx={3}
                        filter="url(#shadow)"
                      />
                      {segWidth > 25 && (
                        <text
                          x={x + segWidth / 2}
                          y={currentY + barHeight / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="10"
                          fontWeight="700"
                          style={{ pointerEvents: 'none' }}
                        >
                          {seg.value}
                        </text>
                      )}
                    </g>
                  );
                });

                return (
                  <g key={`row-${i}`}>
                    {/* Row Label (Chart Name or Stage Name) */}
                    <text
                      x={labelAreaWidth - 20}
                      y={currentY + barHeight / 2}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill={isDarkMode ? "#cbd5e1" : "#6b7280"}
                    >
                      {row.name.length > 20 ? row.name.substring(0, 17) + "..." : row.name}
                    </text>

                    {/* Bars and Connectors */}
                    {segments}

                    {/* Total Value on the right */}
                    <text
                      x={currentOffset + currentTotal * scale + 15}
                      y={currentY + barHeight / 2}
                      textAnchor="start"
                      dominantBaseline="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill={isDarkMode ? "#cbd5e1" : "#111827"}
                    >
                      {currentTotal}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Manual Legend */}
            {/* <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-auto pb-4">
              {effectiveLegendValues.map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {l.label}
                  </span>
                </div>
              ))}
            </div> */}
          </div>
        );
      }}
    </BaseChartContainer>
  );
}
