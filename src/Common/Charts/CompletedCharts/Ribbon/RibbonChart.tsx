/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import BaseChartContainer from "../Common/BaseChartContainer";
import { BaseChartProps, LegendValue, ChartData } from "../Common/chartTypes";
import {
  parseCommonChartData,
  extractLegendsFromXAxis,
} from "../Common/chartUtils";

// Generator matches AreaChart pattern for basic multi-legend values
const generateRibbonSampleData = (
  xAxis: string[],
  legends: LegendValue[],
  numSets: number,
  start: number,
  end: number,
): ChartData[] => {
  const observations: ChartData[] = [];
  xAxis.forEach((xValue) => {
    const obs: ChartData = { name: xValue };
    legends.forEach((legend) => {
      // Scale the range and individual legend values down so their stacked sum
      // fits beautifully between the start and end constraints without overflow
      const effectiveStart = start / Math.max(numSets, 1);
      const effectiveEnd = end / Math.max(numSets, 1);
      const base = Math.random() * (effectiveEnd - effectiveStart) + effectiveStart;
      const variation = (Math.random() - 0.5) * 5;
      obs[legend.field] = Math.max(Math.floor(effectiveStart), Math.min(Math.floor(effectiveEnd), Math.floor(base + variation)));
    });
    observations.push(obs);
  });
  return observations;
};

const getRibbonTierLegends = (tier: any): LegendValue[] => {
  const ribbonConfig = tier?.ribbonChart || tier;
  const widgets = ribbonConfig?.widgets || tier?.widgets || [];

  if (widgets && widgets.length > 0) {
    return widgets.map((w: any) => ({
      label: w.legendName || w.label || "Legend",
      field: (w.legendName || w.label || "Legend")
        .toLowerCase()
        .replace(/\s+/g, ""),
      color: w.color || "#8D79F6",
    }));
  }

  const extracted = extractLegendsFromXAxis(
    tier.xAxis || tier.chartData?.xAxis,
  );
  if (extracted.length > 0) {
    return extracted.map((label: string, idx: number) => ({
      label,
      field: label.toLowerCase().replace(/\s+/g, ""),
      color: ["#5d29bd", "#8e44ad", "#3498db", "#13A490"][idx % 4],
    }));
  }

  return [];
};

export default function RibbonChart(props: BaseChartProps) {
  return (
    <BaseChartContainer
      {...props}
      category="RIBBON"
      excelType="areaChart"
      generatorFunc={generateRibbonSampleData}
      getTierLegends={getRibbonTierLegends}
      parseTierData={parseCommonChartData}
      showLegend={true}
      renderChildChart={(tier, childProps) => (
        <RibbonChart {...childProps} key={tier.id} />
      )}
    >
      {({ chartData, effectiveLegendValues, safeStartingRange, safeEndingRange }) => {
        if (!chartData.length || !effectiveLegendValues.length) return null;

        return (
          <RibbonChartRenderer
            chartData={chartData}
            effectiveLegendValues={effectiveLegendValues}
            yMin={safeStartingRange}
            yMax={safeEndingRange}
          />
        );
      }}
    </BaseChartContainer>
  );
}

// Inner logic component extracted for cleaner scope
const RibbonChartRenderer = ({
  chartData,
  effectiveLegendValues,
  yMin = 0,
  yMax,
}: {
  chartData: any[];
  effectiveLegendValues: LegendValue[];
  yMin?: number;
  yMax?: number;
}) => {
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
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

  const [tooltip, setTooltip] = useState<{
    active: boolean;
    x: number;
    y: number;
    content: string;
    color: string;
    category?: string;
    flipped?: boolean;
  }>({ active: false, x: 0, y: 0, content: "", color: "" });

  // Map standardized chartData to the exact format the ribbon renderer expects
  // Ribbon expects categoryData = [{category, total, nodes: [{id, name, color, value, yStart, yEnd, height }]}]
  const transformedData = React.useMemo(() => {
    const categoryData = chartData.map((dataRow) => {
      const categoryName = dataRow.name;

      const currentValues = effectiveLegendValues.map((legend) => ({
        id: legend.field,
        name: legend.label,
        color: legend.color,
        value: Number(dataRow[legend.field] || 0),
      }));

      // Sort by value descending to determine stack order
      const sorted = [...currentValues].sort((a, b) => b.value - a.value);

      // Calculate Y positions stacked starting at 0, then clamp to yMin
      let currentY = 0;
      const nodes = sorted.map((s) => {
        const yStartRaw = currentY;
        const yEndRaw = currentY + s.value;
        currentY += s.value;

        const yStart = Math.max(yStartRaw, yMin ?? 0);
        const yEnd = Math.max(yEndRaw, yMin ?? 0);
        const height = Math.max(yEnd - yStart, 0);

        return {
          id: s.id,
          name: s.name,
          color: s.color,
          value: s.value,
          yStart,
          yEnd,
          height,
        };
      });

      return {
        category: categoryName,
        total: currentY,
        nodes, // Sorted nodes for this category
      };
    });

    // Scale Y-axis to user-configured safeStartingRange and safeEndingRange (yMin and yMax) if specified,
    // otherwise fallback to actual stacked column maximum
    const maxTotal = yMax !== undefined ? yMax : Math.max(...categoryData.map((c) => c.total), 1);
    return { categoryData, maxTotal, yMin: yMin ?? 0 };
  }, [chartData, effectiveLegendValues, yMin, yMax]);

  const categoriesCount = chartData.length;
  const VW = 600;
  const padding = { top: 40, right: 30, bottom: 40, left: 55 };
  const effectiveWidth = VW - padding.left - padding.right;
  const xStep = categoriesCount > 1 ? effectiveWidth / (categoriesCount - 1) : effectiveWidth;
  const barWidth = Math.max(8, Math.min(40, xStep * 0.8));

  return (
    <div className="h-full min-h-[150px] w-full min-w-0 relative group">
      <SVGChartRenderer
        data={transformedData}
        categories={chartData.map((d) => d.name)}
        series={effectiveLegendValues.map((l) => ({
          id: l.field,
          name: l.label,
          color: l.color,
        }))}
        barWidth={barWidth}
        padding={padding}
        hoveredSeries={hoveredSeries}
        setHoveredSeries={setHoveredSeries}
        setTooltip={setTooltip}
        isDarkMode={isDarkMode}
      />

      {tooltip.active && (
        <div
          className="absolute pointer-events-none bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded shadow-md p-2 z-50 transition-all duration-75 text-xs whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y - 40,
            transform: tooltip.flipped
              ? "translateX(calc(-100% - 10px))"
              : "translateX(10px)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: tooltip.color }}
            />
            <span className="font-bold text-gray-800 dark:text-slate-100">{tooltip.content}</span>
          </div>
          {tooltip.category && (
            <div className="text-gray-500 dark:text-slate-300">{tooltip.category}</div>
          )}
        </div>
      )}
    </div>
  );
};

const SVGChartRenderer = ({
  data,
  categories,
  series,
  barWidth,
  padding,
  hoveredSeries,
  setHoveredSeries,
  setTooltip,
  isDarkMode,
}: any) => {
  // Fixed virtual canvas — SVG scales this to whatever space it gets
  const VW = 600;
  const VH = 300;

  const { categoryData, maxTotal, yMin = 0 } = data;
  const maxTotalWithStep = React.useMemo(() => {
    const range = maxTotal - yMin;
    const rawStep = range / 10 || 1;
    const stepVal = rawStep > 1 ? Math.ceil(rawStep) : rawStep;
    return yMin + stepVal * 10;
  }, [yMin, maxTotal]);

  // Y-axis range: from yMin up to maxTotalWithStep
  const yRange = Math.max(maxTotalWithStep - yMin, 1);

  const getCoordinates = (catIndex: number, yValue: number) => {
    const labelSpacing = 15;
    const effectiveWidth =
      VW - padding.left - padding.right - barWidth - labelSpacing;
    const effectiveHeight = VH - padding.top - padding.bottom;

    const xStep = effectiveWidth / Math.max(categories.length - 1, 1);
    const x =
      padding.left +
      labelSpacing +
      barWidth / 2 +
      (categories.length > 1 ? catIndex * xStep : effectiveWidth / 2);

    // Scale relative to [yMin, maxTotalWithStep] range
    const scaleY = effectiveHeight / yRange;
    const y = VH - padding.bottom - (yValue - yMin) * scaleY;

    return { x, y };
  };

  const generateRibbonPath = (
    x1: number,
    y1Start: number,
    y1End: number,
    x2: number,
    y2Start: number,
    y2End: number,
  ) => {
    const cp1x = x1 + (x2 - x1) * 0.5;
    const cp2x = x2 - (x2 - x1) * 0.5;

    return `M ${x1} ${y1Start} C ${cp1x} ${y1Start}, ${cp2x} ${y2Start}, ${x2} ${y2Start} L ${x2} ${y2End} C ${cp2x} ${y2End}, ${cp1x} ${y1End}, ${x1} ${y1End} Z`;
  };

  // Dynamically calculate ticks with exactly 10 equal segments
  const ticks = React.useMemo(() => {
    const range = maxTotal - yMin;
    const rawStep = range / 10 || 1;
    const stepVal = rawStep > 1 ? Math.ceil(rawStep) : rawStep;

    const ticksArray = [];
    for (let i = 0; i <= 10; i++) {
      ticksArray.push(Number((yMin + i * stepVal).toFixed(1)));
    }
    return ticksArray;
  }, [yMin, maxTotal]);

  return (
    <div className="relative w-full h-full min-h-[150px]">
      {ticks.map((val) => {
        const y = getCoordinates(0, val).y;
        const yPercent = (y / VH) * 100;
        const leftPercent = (padding.left / VW) * 100;

        const formatValue = (num: number) => {
          if (num >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
          if (num >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
          if (num >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
          return num.toString();
        };

        return (
          <div
            key={`y-label-${val}`}
            className="absolute text-right text-[11px] font-medium pointer-events-none select-none"
            style={{
              left: 0,
              width: `calc(${leftPercent}% - 12px)`,
              top: `calc(${yPercent}% - 8px)`,
              color: isDarkMode ? "#cbd5e1" : "#6b7280",
            }}
          >
            {formatValue(Math.round(val))}
          </div>
        );
      })}

      {categoryData.map((cat: any, i: number) => {
        const { x: centerX } = getCoordinates(i, 0);
        const xPercent = (centerX / VW) * 100;
        const yPercent = ((VH - padding.bottom + 12) / VH) * 100;
        const displayLabel =
          cat.category.length > 15
            ? cat.category.substring(0, 12) + "..."
            : cat.category;

        return (
          <div
            key={`x-label-${i}`}
            className="absolute text-center text-[11px] font-medium pointer-events-none select-none whitespace-nowrap"
            style={{
              left: `calc(${xPercent}% - 50px)`,
              width: "100px",
              top: `${yPercent}%`,
              color: isDarkMode ? "#94a3b8" : "#64748b",
            }}
          >
            {displayLabel}
          </div>
        );
      })}

      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        className="block"
      >
        {ticks.map((val) => {
          const y = getCoordinates(0, val).y;
          return (
            <g key={val}>
              <line
                x1={padding.left}
                y1={y}
                x2={VW - padding.right}
                y2={y}
                stroke={isDarkMode ? "#334155" : "#e5e7eb"}
                strokeDasharray="3 3"
              />
            </g>
          );
        })}

      {categoryData.map((cat: any, i: number) => {
        if (i === categoryData.length - 1) return null;
        const nextCat = categoryData[i + 1];

        const col1Center = getCoordinates(i, 0).x;
        const x1 = Math.round(col1Center + barWidth / 2);

        const col2Center = getCoordinates(i + 1, 0).x;
        const x2 = Math.round(col2Center - barWidth / 2);

        return series.map((s: any) => {
          const node1 = cat.nodes.find((n: any) => n.id === s.id);
          const node2 = nextCat.nodes.find((n: any) => n.id === s.id);

          if (!node1 || !node2) return null;

          const y1Top = getCoordinates(i, node1.yEnd).y;
          const y1Bottom = getCoordinates(i, node1.yStart).y;

          const y2Top = getCoordinates(i + 1, node2.yEnd).y;
          const y2Bottom = getCoordinates(i + 1, node2.yStart).y;

          const isHovered = hoveredSeries === s.id;
          const isAnyHovered = hoveredSeries !== null;

          return (
            <path
              key={`ribbon-${i}-${s.id}`}
              d={generateRibbonPath(x1, y1Top, y1Bottom, x2, y2Top, y2Bottom)}
              fill={s.color}
              fillOpacity={isHovered ? 0.8 : isAnyHovered ? 0.1 : 0.4}
              stroke={isHovered ? "rgba(255,255,255,0.5)" : "none"}
              strokeWidth={1}
              className="transition-all duration-300 ease-in-out cursor-pointer"
              onMouseEnter={() => setHoveredSeries(s.id)}
              onMouseLeave={() => {
                setHoveredSeries(null);
                setTooltip((prev: any) => ({ ...prev, active: false }));
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget
                  .closest("svg")
                  ?.getBoundingClientRect();
                if (rect) {
                  const x = e.clientX - rect.left;
                  setTooltip({
                    active: true,
                    x,
                    y: e.clientY - rect.top,
                    content: s.name,
                    color: s.color,
                    category: `${cat.category} → ${nextCat.category}`,
                    flipped: x > rect.width * 0.55,
                  });
                }
              }}
            />
          );
        });
      })}

      {categoryData.map((cat: any, i: number) => {
        const centerX = getCoordinates(i, 0).x;
        const leftX = centerX - barWidth / 2;

        return (
          <g key={`col-nodes-${i}`}>
            {cat.nodes.map((node: any) => {
              const yTop = getCoordinates(i, node.yEnd).y;
              const yBottom = getCoordinates(i, node.yStart).y;
              const h = Math.abs(yBottom - yTop);

              const isHovered = hoveredSeries === node.id;
              const isAnyHovered = hoveredSeries !== null;

              return (
                <rect
                  key={node.id}
                  x={leftX}
                  y={yTop}
                  width={barWidth}
                  height={Math.max(h, 0)}
                  fill={node.color}
                  fillOpacity={isHovered || !isAnyHovered ? 1 : 0.3}
                  className="transition-opacity duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSeries(node.id)}
                  onMouseLeave={() => {
                    setHoveredSeries(null);
                    setTooltip((prev: any) => ({ ...prev, active: false }));
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget
                      .closest("svg")
                      ?.getBoundingClientRect();
                    if (rect) {
                      const x = e.clientX - rect.left;
                      setTooltip({
                        active: true,
                        x,
                        y: e.clientY - rect.top,
                        content: `${node.name}: ${node.value}`,
                        color: node.color,
                        category: cat.category,
                        flipped: x > rect.width * 0.55,
                      });
                    }
                  }}
                />
              );
            })}
          </g>
        );
      })}

      </svg>
    </div>
  );
};
