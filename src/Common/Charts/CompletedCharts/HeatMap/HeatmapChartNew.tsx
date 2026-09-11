/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, MouseEvent } from "react";

// Common Imports
import { BaseChartProps } from "../Common/chartTypes";
import {
  parseCommonChartData,
  generateHeatmapChartData,
  extractLegendsFromXAxis,
} from "../Common/chartUtils";
import BaseChartContainer from "../Common/BaseChartContainer";

/**
 * Parse xAxis 2D array format from API
 */
export const parseHeatmapChartData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  return parseCommonChartData(xAxis, legendValues, widgetTitle);
};

/* ---------- COMPONENT ---------- */

export default function HeatmapChartNew(props: BaseChartProps) {
  const [tooltip, setTooltip] = useState<{
    row: string;
    column: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const getTierLegends = (tier: any) => {
    const heatmapConfig = tier?.heatmap || tier;
    const widgets = heatmapConfig?.widgets || tier?.widgets || [];

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

  // Program builder style: uses the legend's own color with opacity for intensity
  const getCellStyle = (
    value: number,
    start: number,
    end: number,
    color: string,
  ): React.CSSProperties => {
    if (value === 0) return { backgroundColor: "#f3f4f6" };
    const percent = Math.min(1, Math.max(0, (value - start) / (end - start || 1)));
    const opacity = 0.2 + percent * 0.8;
    return { backgroundColor: color, opacity };
  };

  const handleHover = (
    rowLabel: string,
    columnLabel: string,
    val: number,
    e: MouseEvent<HTMLDivElement>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      row: rowLabel,
      column: columnLabel,
      value: val,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  return (
    <BaseChartContainer
      {...props}
      category="HEATMAP"
      excelType="heatmap"
      generatorFunc={generateHeatmapChartData}
      getTierLegends={getTierLegends}
      parseTierData={parseHeatmapChartData}
      renderChildChart={(tier, childProps) => (
        <HeatmapChartNew 
          {...childProps} 
          key={tier.id} 
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({ chartData, safeStartingRange, safeEndingRange, effectiveLegendValues, effectiveXAxisValues }) => {
        const heatmapDisplayData = effectiveLegendValues
          .filter((l) => l.label)
          .map((legend) => ({
            label: legend.label,
            color: legend.color || "#13A490",
            values: effectiveXAxisValues.map((xName) => {
              const row = (chartData as any[]).find((d) => d.name === xName);
              return Number(row?.[legend.field] || 0);
            }),
          }));

        return (
          <div className="w-full relative py-6">
            <div className="overflow-x-auto overflow-y-auto max-h-[350px]">
              <div className="w-full flex flex-col p-2">
                {heatmapDisplayData.map((row, rIdx) => (
                  <div key={rIdx} className="flex mb-3 w-full group/row">
                    <div className="w-24 shrink-0 pr-3 text-right text-sm text-gray-700 dark:text-slate-300 font-medium flex items-center justify-end wrap-break-word">
                      {row.label}
                    </div>

                    <div className="flex-1 flex px-2 gap-2">
                      {row.values.map((value, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex-1 min-w-10 h-12 rounded cursor-pointer transition hover:ring-2 hover:ring-offset-1"
                          style={getCellStyle(
                            value,
                            safeStartingRange,
                            safeEndingRange,
                            row.color,
                          )}
                          onMouseEnter={(e) =>
                            handleHover(
                              row.label,
                              effectiveXAxisValues[cIdx],
                              value,
                              e,
                            )
                          }
                          onMouseLeave={() => setTooltip(null)}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* X Axis */}
                <div className="flex mt-2 w-full">
                  <div className="w-24 shrink-0" />
                  <div className="flex-1 flex px-2 gap-2">
                    {effectiveXAxisValues.map((x, i) => (
                      <div
                        key={i}
                        className="flex-1 min-w-10 text-xs text-center wrap-break-word text-gray-500 dark:text-slate-300 font-medium"
                      >
                        {x}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tooltip */}
            {tooltip && (
              <div
                className="fixed z-50 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl px-3 py-2 pointer-events-none ring-1 ring-white/10"
                style={{
                  left: tooltip.x,
                  top: tooltip.y - 12,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div className="font-bold border-b border-white/10 pb-1 mb-1">
                  {tooltip.row}
                </div>
                <div className="text-gray-400 mb-0.5">{tooltip.column}</div>
                <div className="font-black text-teal-400 text-sm">
                  {tooltip.value}
                </div>
              </div>
            )}
          </div>
        );
      }}
    </BaseChartContainer>
  );
}
