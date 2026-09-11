/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect } from "react";
import {
  ScatterChart as ReScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

// Common Imports
import { BaseChartProps, LegendValue, ChartData } from "../Common/chartTypes";
import { parseCommonChartData } from "../Common/chartUtils";
import BaseChartContainer from "../Common/BaseChartContainer";

/* ---------- HELPERS ---------- */

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

/**
 * Generator function compatible with BaseChartContainer.
 * Scatter uses xAxisValues as "series labels" and produces {name, x, y, z} per legend per label.
 * We output a flat ChartData[] where each entry stores x/y/z fields per legend.
 */
export const generateScatterSampleData = (
  xAxisValues: string[],
  legends: LegendValue[],
  _numOfLegendDataSet: number,
  start: number,
  end: number,
): ChartData[] => {
  return xAxisValues.map((name, i) => {
    const item: ChartData = { name };
    legends.forEach((l, legendIndex) => {
      const seed = simpleHash(`scatter-stable-seed-${i}-${legendIndex}`);
      item[l.field] = deterministicRandom(seed, start, end);
    });
    return item;
  });
};

/* ---------- SCATTER VISUAL ---------- */

const CustomTooltip = ({ active, payload, xLabel, yLabel }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-white dark:bg-slate-900 p-3 border dark:border-slate-800 rounded shadow-md text-sm">
      <p className="font-semibold text-gray-800 dark:text-slate-100 border-b dark:border-slate-800 pb-1 mb-2">
        {data.name}
      </p>
      <p className="text-gray-600 dark:text-slate-300">
        <span className="font-medium">{xLabel}:</span>{" "}
        {data.tooltipXValue ?? data.x}
      </p>
      <p className="text-gray-600 dark:text-slate-300">
        <span className="font-medium">{yLabel}:</span>{" "}
        {data.tooltipYValue ?? data.y}
      </p>
    </div>
  );
};

function ScatterVisual({
  chartData,
  effectiveLegendValues,
  safeStartingRange,
  safeEndingRange,
}: {
  chartData: ChartData[];
  effectiveLegendValues: LegendValue[];
  safeStartingRange: number;
  safeEndingRange: number;
  chartHeight?: number;
}) {
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
  // Scatter plots strictly map 1st legend to X, 2nd legend to Y.
  const legends = effectiveLegendValues.slice(0, 2);
  const legendX = legends[0];
  const legendY = legends[1];

  const scatterData = useMemo(() => {
    if (!legendX || !legendY) return [];
    return chartData.map((item) => ({
      name: item.name,
      x: Number(item[legendX.field] ?? 0),
      y: Number(item[legendY.field] ?? 0),
      z: 100, // Uniform bubble size
      tooltipXValue: item[legendX.field],
      tooltipYValue: item[legendY.field],
    }));
  }, [chartData, legendX, legendY]);

  if (!scatterData.length || !legendX || !legendY) {
    return (
      <div className="h-full min-h-[300px] flex items-center justify-center text-gray-400 font-medium border-2 border-dashed border-border rounded-xl">
        Need at least 2 legends configured (X and Y parameters).
      </div>
    );
  }

  // Remove customLegendPayload since we render HTML labels now

  // Custom label renderer to prevent wrapping and reduce overlap dynamically
  const renderScatterLabel = (props: any) => {
    const { x, y, value } = props;

    // Safety check and data-space coordinate retrieval
    const myData = scatterData.find((d) => d.name === value);
    if (!myData) return null;

    // Simple dynamic collision avoidance: find nearest neighbor in data space
    let closestDist = Infinity;
    let closestNeighbor: any = null;

    scatterData.forEach((d) => {
      if (d.name === myData.name) return;
      // Rough distance in data space (aspect ratio might warp this visually but directional logic holds)
      const dx = d.x - myData.x;
      const dy = d.y - myData.y;
      const dist = dx * dx + dy * dy;
      if (dist < closestDist) {
        closestDist = dist;
        closestNeighbor = d;
      }
    });

    let textAnchor: "start" | "middle" | "end" | "inherit" = "start";
    let xOffset = 12;
    let yOffset = 4;

    // Reactively repel the label away from the nearest neighbor point
    if (closestNeighbor) {
      if (closestNeighbor.x > myData.x) {
        textAnchor = "end";
        xOffset = -12;
      } else if (closestNeighbor.x < myData.x) {
        textAnchor = "start";
        xOffset = 12;
      } else {
        // Same X coordinate, push based on Y
        textAnchor = "middle";
        xOffset = 0;
        // In Recharts, smaller pixel Y is higher.
        // If neighbor data Y > myData data Y, neighbor is physically HIGHER on screen.
        // So we push our label physically DOWN (positive yOffset).
        yOffset = closestNeighbor.y > myData.y ? 16 : -10;
      }

      // Edge case: EXACT identical coordinates
      if (closestNeighbor.x === myData.x && closestNeighbor.y === myData.y) {
        textAnchor = myData.name > closestNeighbor.name ? "start" : "end";
        xOffset = myData.name > closestNeighbor.name ? 12 : -12;
        yOffset = 4;
      }
    }

    // Boundary enforcement: Override collisions if the dot is physically too close to the chart edges
    const range = safeEndingRange - safeStartingRange;
    const isNearLeftEdge = myData.x - safeStartingRange < range * 0.15;
    const isNearRightEdge = safeEndingRange - myData.x < range * 0.15;

    if (isNearLeftEdge) {
      textAnchor = "start";
      xOffset = 12;
    } else if (isNearRightEdge) {
      textAnchor = "end";
      xOffset = -12;
    }

    return (
      <g>
        {/* Halo for guaranteed readability even when intersecting grid lines or other dots */}
        <text
          x={x + xOffset}
          y={y}
          dy={yOffset}
          fill="none"
          stroke={isDarkMode ? "#0f172a" : "white"}
          strokeWidth={3}
          strokeLinejoin="round"
          fontSize={12}
          fontWeight={500}
          textAnchor={textAnchor}
          pointerEvents="none"
        >
          {value}
        </text>
        <text
          x={x + xOffset}
          y={y}
          dy={yOffset}
          fill={isDarkMode ? "#cbd5e1" : "#666"}
          fontSize={12}
          fontWeight={500}
          textAnchor={textAnchor}
          pointerEvents="none"
        >
          {value}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-full min-w-0 min-h-[150px] relative">
      <div className="absolute inset-0">
        {/* Y Axis Legend Label */}
        <div
          className="absolute flex items-center gap-1.5 whitespace-nowrap z-10 pointer-events-none"
          style={{
            left: "20px",
            top: "50%",
            transform: "translate(-50%, -50%) rotate(-90deg)",
          }}
        >
          <div
            className="w-5 h-1.5"
            style={{ backgroundColor: legendY.color }}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {legendY.label}
          </span>
        </div>

        {/* X Axis Legend Label */}
        <div className="absolute bottom-1 left-[55%] -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap z-10 pointer-events-none">
          <div
            className="w-5 h-1.5"
            style={{ backgroundColor: legendX.color }}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {legendX.label}
          </span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ReScatterChart margin={{ top: 20, right: 60, bottom: 25, left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e5e7eb"} />
            <XAxis
              type="number"
              dataKey="x"
              domain={(() => {
                const minVal = safeStartingRange || 0;
                const maxEnding = safeEndingRange || 100;
                const range = maxEnding - minVal;
                const rawStep = range / 10 || 1;
                const stepVal = rawStep > 1 ? Math.ceil(rawStep) : rawStep;
                return [minVal, minVal + stepVal * 10];
              })()}
              allowDataOverflow={true}
              tick={{ fontSize: 12, fill: isDarkMode ? "#cbd5e1" : "#666" }}
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
            <YAxis
              type="number"
              dataKey="y"
              domain={(() => {
                const minVal = safeStartingRange || 0;
                const maxEnding = safeEndingRange || 100;
                const range = maxEnding - minVal;
                const rawStep = range / 10 || 1;
                const stepVal = rawStep > 1 ? Math.ceil(rawStep) : rawStep;
                return [minVal, minVal + stepVal * 10];
              })()}
              allowDataOverflow={true}
              tick={{ fontSize: 12, fill: isDarkMode ? "#cbd5e1" : "#666" }}
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
            <ZAxis type="number" dataKey="z" range={[60, 60]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={
                <CustomTooltip xLabel={legendX.label} yLabel={legendY.label} />
              }
            />
            <Scatter
              name="Data"
              data={scatterData}
              fill={legendX.color || "#8884d8"}
              shape="circle"
            >
              <LabelList dataKey="name" content={renderScatterLabel} />
              {scatterData.map((entry, index) => {
                // Dynamic color based on condition: if legend 1 >= legend 2 then show legend 1 color
                const dotColor =
                  entry.x >= entry.y ? legendX.color : legendY.color;
                return <Cell key={`cell-${index}`} fill={dotColor} />;
              })}
            </Scatter>
          </ReScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------- COMPONENT ---------- */

export const parseScatterData = (
  xAxis: any,
  legendValues: LegendValue[],
  widgetTitle: string,
) => {
  return parseCommonChartData(xAxis, legendValues, widgetTitle);
};

export default function ScatterChart(props: BaseChartProps) {
  const getTierLegends = (tier: any): LegendValue[] => {
    return (tier?.scatterChart?.widgets || tier?.widgets || []).map(
      (w: any) => ({
        label: w.legendName || w.label,
        field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        color: w.color,
      }),
    );
  };

  return (
    <BaseChartContainer
      {...props}
      category="SCATTER"
      excelType="barChart"
      generatorFunc={generateScatterSampleData}
      getTierLegends={getTierLegends}
      parseTierData={parseScatterData}
      showLegend={props.showLegend}
      renderChildChart={(tier, childProps) => (
        <ScatterChart
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
      }) => (
        <ScatterVisual
          chartData={chartData}
          effectiveLegendValues={effectiveLegendValues}
          safeStartingRange={safeStartingRange}
          safeEndingRange={safeEndingRange}
          chartHeight={props.chartHeight}
        />
      )}
    </BaseChartContainer>
  );
}
