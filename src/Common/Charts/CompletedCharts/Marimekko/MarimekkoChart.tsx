
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import BaseChartContainer from "../Common/BaseChartContainer";
import { useTheme } from "@/Common/theme-provider";
import { BaseChartProps, LegendValue, ChartData } from "../Common/chartTypes";
import {
  parseCommonChartData,
  extractLegendsFromXAxis,
  getNiceStep,
} from "../Common/chartUtils";

/**
 * Generator for Marimekko sample data.
 */
const generateMarimekkoSampleData = (
  xAxis: string[],
  legends: LegendValue[],
  _numSets: number,
  start: number,
  end: number,
): ChartData[] => {
  return xAxis.map((xValue) => {
    const obs: ChartData = { name: xValue };
    legends.forEach((legend) => {
      obs[legend.field] = Math.floor(Math.random() * (end - start + 1)) + start;
    });
    return obs;
  });
};

/**
 * Extract legends for Marimekko tiers.
 */
const getMarimekkoTierLegends = (tier: any): LegendValue[] => {
  const config = tier?.marimekkoChart || tier;
  const widgets = config?.widgets || tier?.widgets || [];

  if (widgets && widgets.length > 0) {
    return widgets.map((w: any) => ({
      label: w.legendName || w.label || "Legend",
      field: (w.legendName || w.label || "Legend")
        .toLowerCase()
        .replace(/\s+/g, ""),
      color: w.color || "#3B93A5",
    }));
  }

  const extracted = extractLegendsFromXAxis(
    tier.xAxis || tier.chartData?.xAxis,
  );
  if (extracted.length > 0) {
    return extracted.map((label: string, idx: number) => ({
      label,
      field: label.toLowerCase().replace(/\s+/g, ""),
      color: ["#8D79F6", "#10B981", "#F7B844", "#F26419"][idx % 4],
    }));
  }

  return [];
};

export default function MarimekkoChart(props: BaseChartProps) {
  return (
    <BaseChartContainer
      {...props}
      category="MARIMEKKO"
      excelType="barChart" // Generic bar-like export
      generatorFunc={generateMarimekkoSampleData}
      getTierLegends={getMarimekkoTierLegends}
      parseTierData={parseCommonChartData}
      renderChildChart={(tier: { id: string }, childProps: BaseChartProps) => (
        <MarimekkoChart {...childProps} key={tier.id} />
      )}
    >
      {({ chartData, effectiveLegendValues, safeStartingRange, safeEndingRange }) => (
        <MarimekkoRenderer
          chartData={chartData}
          effectiveLegendValues={effectiveLegendValues}
          safeStartingRange={safeStartingRange}
          safeEndingRange={safeEndingRange}
          chartHeight={props.chartHeight || 450}
        />
      )}
    </BaseChartContainer>
  );
}

const MAX_TICK_CHARS = 20;

/**
 * Custom XAxis tick that truncates long labels and shows full text via SVG <title> (native browser tooltip).
 */
const CustomXAxisTick = (props: any) => {
  const { x, y, payload, angle, fill, fontSize } = props;
  const full: string = payload?.value ?? "";
  const truncated =
    full.length > MAX_TICK_CHARS ? full.slice(0, MAX_TICK_CHARS) + "…" : full;
  const isVertical = angle === 90 || angle === -90;
  const isDiagonal = angle === 45 || angle === -45;

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{full}</title>
      <text
        textAnchor={isVertical ? "start" : isDiagonal ? "end" : "middle"}
        // rotate(90°): first char anchors at tick, text flows into bottom margin.
        // rotate(-45°): diagonal — textAnchor end keeps text to the left of tick.
        transform={
          isVertical ? "rotate(90)" : isDiagonal ? "rotate(-45)" : undefined
        }
        dx={isVertical ? 4 : isDiagonal ? -4 : 0}
        dy={isVertical ? 4 : isDiagonal ? 0 : 12}
        fill={fill ?? "#64748b"}
        fontSize={fontSize ?? 12}
      >
        {truncated}
      </text>
    </g>
  );
};

/**
 * Premium custom tooltip for the Marimekko chart.
 */
const MarimekkoTooltip = ({
  active,
  payload,
  label,
  legendValues,
  isDarkMode,
  coordinate,
  containerRef,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  legendValues: any[];
  isDarkMode: boolean;
  coordinate?: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (active && coordinate && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Position the tooltip relative to the page viewport (position: fixed)
      // offset it slightly to the right (x + 15) and slightly down (y)
      setPosition({
        top: window.scrollY + rect.top + coordinate.y,
        left: window.scrollX + rect.left + coordinate.x + 15,
      });
    }
  }, [active, coordinate, containerRef]);

  if (!active || !payload || payload.length === 0) return null;

  const bg = isDarkMode ? "#0f172a" : "#ffffff";
  const border = isDarkMode ? "#334155" : "#e2e8f0";
  const textPrimary = isDarkMode ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDarkMode ? "#94a3b8" : "#64748b";

  const tooltipElement = (
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 10,
        padding: "10px 14px",
        minWidth: 180,
        boxShadow: isDarkMode
          ? "0 8px 32px rgba(0,0,0,0.55)"
          : "0 8px 24px rgba(0,0,0,0.12)",
        pointerEvents: "none",
        zIndex: 99999,
      }}
    >
      {/* Category header */}
      <p
        style={{
          margin: "0 0 8px 0",
          fontSize: 12,
          fontWeight: 700,
          color: textPrimary,
          letterSpacing: "0.02em",
          borderBottom: `1px solid ${border}`,
          paddingBottom: 6,
        }}
      >
        {label}
      </p>

      {/* Series rows */}
      {(() => {
        const total = payload.reduce((sum: number, e: any) => sum + (Number(e.value) || 0), 0);

        return payload.map((entry: any) => {
          const legend = legendValues.find((l) => l.field === entry.dataKey);
          const displayLabel = legend?.label ?? entry.name ?? entry.dataKey;
          const color = legend?.color ?? entry.fill ?? "#8D79F6";
          const rawValue = entry.value ?? 0;
          const pct = total > 0 ? Math.round((rawValue / total) * 100) : 0;

          return (
            <div
              key={entry.dataKey}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 5,
                zIndex: 209,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 12, color: textSecondary }}>
                  {displayLabel}
                </span>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: textPrimary,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {rawValue} ({pct}%)
              </span>
            </div>
          );
        });
      })()}
    </div>
  );

  return createPortal(tooltipElement, document.body);
};

const MarimekkoRenderer = ({
  chartData,
  effectiveLegendValues,
  safeStartingRange,
  safeEndingRange,
}: {
  chartData: any[];
  effectiveLegendValues: any[];
  safeStartingRange?: number;
  safeEndingRange?: number;
  chartHeight?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const n = chartData.length;
  // 3-tier label mode to prevent overlap
  const labelMode: "flat" | "diagonal" | "vertical" =
    n <= 5 ? "flat" : n <= 15 ? "diagonal" : "vertical";

  const tickAngle = labelMode === "flat" ? 0 : labelMode === "diagonal" ? -45 : 90;
  const axisHeight = labelMode === "flat" ? 30 : labelMode === "diagonal" ? 60 : 90;
  const bottomMargin = labelMode === "flat" ? 10 : labelMode === "diagonal" ? 20 : 20;

  // ── Y-axis domain (same pattern as StackedBarChart) ──────────────────────
  // const maxStackedValue = chartData.length > 0
  //   ? chartData.reduce((max: number, row: any) => {
  //     const sum = effectiveLegendValues.reduce(
  //       (s: number, l: any) => s + (Number(row[l.field]) || 0),
  //       0,
  //     );
  //     return Math.max(max, sum);
  //   }, 0)
  //   : 0;

  const minVal = safeStartingRange ?? 0;
  const calculatedEndingRange = safeEndingRange ?? 100;
  const range = calculatedEndingRange - minVal;
  const rawStep = range / 10 || 1;
  const stepVal = getNiceStep(rawStep);
  const ticksArray: number[] = [];
  for (let i = 0; i <= 10; i++) {
    ticksArray.push(Number((minVal + i * stepVal).toFixed(1)));
  }

  return (
    <div ref={containerRef} style={{ height: "100%" }} className="w-full relative h-full min-h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          stackOffset="expand"
          margin={{ top: 20, right: 30, left: 0, bottom: bottomMargin }}
          barCategoryGap={0}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f0f0f0"} />
          <XAxis
            dataKey="name"
            angle={tickAngle}
            interval={0}
            height={axisHeight}
            tick={(tickProps) => (
              <CustomXAxisTick
                {...tickProps}
                angle={tickAngle}
                fill={isDarkMode ? "#cbd5e1" : "#64748b"}
                fontSize={12}
              />
            )}
            axisLine={{ stroke: isDarkMode ? "#334155" : "#cbd5e1" }}
            tickLine={{ stroke: isDarkMode ? "#334155" : "#cbd5e1" }}
          />
          <YAxis
            domain={[0, 1]}
            allowDataOverflow={true}
            ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]}
            tickFormatter={(val) => `${Math.round(val * 100)}%`}
            tick={{ fill: isDarkMode ? "#cbd5e1" : "#64748b", fontSize: 12 }}
            axisLine={{ stroke: isDarkMode ? "#334155" : "#cbd5e1" }}
            tickLine={{ stroke: isDarkMode ? "#334155" : "#cbd5e1" }}
          />
          <RechartsTooltip
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ zIndex: 9999 }}
            cursor={{ fill: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
            content={
              <MarimekkoTooltip
                legendValues={effectiveLegendValues}
                isDarkMode={isDarkMode}
                containerRef={containerRef}
              />
            }
          />
          {effectiveLegendValues.map((l, _index) => (
            <Bar
              key={l.field}
              dataKey={l.field}
              name={l.label}
              stackId="a"
              fill={l.color}
              fillOpacity={1}
              stroke={isDarkMode ? "#0f172a" : "#fff"}
              strokeWidth={2}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
