/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell as RechartsCell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Common Imports
import { BaseChartProps, LegendValue } from "../Common/chartTypes";
import { getEffectiveLegendValues } from "../Common/chartUtils";
import BaseChartContainer from "../Common/BaseChartContainer";

// Specific parser
import { parsePieChartData, parseNestedPieData, PieData } from "@/utils/parsePieChartData";


/* ---------- HELPERS ---------- */

const PIE_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#6366f1", // Indigo
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#64748b", // Slate
];

const getSeededRandom = (seedStr: string) => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  let seed = Math.abs(hash) || 1;
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x80000000;
  };
};

const generatePieSampleData = (
  _xAxis: string[],
  legends: LegendValue[],
  startingRange: number,
  endingRange: number,
  seedPrefix: string = "progress-ring-seed",
): any[] => {
  return legends
    .filter((l) => l.label)
    .map((l, i) => {
      const rand = getSeededRandom(`${seedPrefix}-${i}`);
      const val = Math.floor(rand() * (endingRange - startingRange + 1)) + startingRange;
      return {
        name: l.label,
        value: val,
        color: l.color || PIE_COLORS[i % PIE_COLORS.length],
      };
    });
};

/* ---------- COMPONENT ---------- */

export default function ProgressRing(props: BaseChartProps & {
  selectedSourceCharts?: any[],
  isValueDetectOn?: boolean
}) {
  const {
    legendValues = [],
    xAxisValues = [],
    allUploadedData,
    widgetTitle = "Chart",
    startingRange = 0,
    endingRange = 100,
    isCreationMode = false,
    selectedSourceCharts = [],
    isValueDetectOn = false,
  } = props;

  const valueDetection = (props as any).valueDetection;

  const resolveDataLocally = (
    allUploadedData: any,
    xAxisRaw: any,
    legendValues: LegendValue[],
    widgetTitle: string,
    isCreationMode?: boolean,
    selectedSourceCharts?: any[],
    isValueDetectOn?: boolean,
    valueDetection?: any,
  ): { rings: PieData[][]; isSampleData: boolean } => {
    // 0. Creation Mode Preview Handling for Aggregation
    if (isCreationMode && isValueDetectOn && selectedSourceCharts && selectedSourceCharts.length > 0) {
      const effectiveLegends = getEffectiveLegendValues(legendValues);
      return {
        rings: selectedSourceCharts.map((c) =>
          generatePieSampleData([], effectiveLegends, startingRange, endingRange).map(d => ({
            ...d,
            ringLabel: c.projectName
          }))
        ),
        isSampleData: true,
      };
    }

    // 1. Try valueDetection or raw xAxis first as it contains multi-row aggregate data in Program Builder
    const targetSource = valueDetection || xAxisRaw;
    if (targetSource) {
      const nested = parseNestedPieData(targetSource, legendValues);
      if (nested.length > 1) {
        return { rings: nested, isSampleData: false };
      }
    }

    // 2. Fallback to allUploadedData if it's already structured correctly
    if (allUploadedData) {
      if (Array.isArray(allUploadedData) && allUploadedData.length > 0) {
        if (Array.isArray(allUploadedData[0])) {
          return { rings: allUploadedData as PieData[][], isSampleData: false };
        }
        return { rings: [allUploadedData as PieData[]], isSampleData: false };
      }

      const safeName = (widgetTitle || "Sheet").replace(/[:/?*[\]\\]/g, " ").trim().substring(0, 31);
      const keyed = allUploadedData[safeName];
      if (Array.isArray(keyed) && keyed.length > 0) {
        return { rings: [keyed as PieData[]], isSampleData: false };
      }
    }

    // 3. Fallback to single-row nested parse if multi-row wasn't found above
    if (targetSource) {
      const nested = parseNestedPieData(targetSource, legendValues);
      if (nested.length > 0) {
        return { rings: nested, isSampleData: false };
      }
    }

    const effectiveLegends = getEffectiveLegendValues(legendValues);
    if (effectiveLegends.some((l) => l.label)) {
      return {
        rings: [generatePieSampleData([], effectiveLegends, startingRange, endingRange)],
        isSampleData: true,
      };
    }

    const rand = getSeededRandom("progress-ring-fallback-completed");
    return {
      rings: [[
        {
          name: "Completed",
          value: Math.floor(rand() * (endingRange - startingRange + 1)) + startingRange,
          color: PIE_COLORS[0]
        },
      ]],
      isSampleData: true,
    };
  };

  const getTierLegends = (tier: any): LegendValue[] => {
    const baseLegends = (tier?.ring?.widgets || tier?.widgets || []).map(
      (w: any) => ({
        label: w.legendName || w.label,
        field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        color: w.color,
      }),
    );
    if (baseLegends.length > 0) return baseLegends;

    let xAxis = tier?.xAxis;
    if (typeof xAxis === "string") {
      try { xAxis = JSON.parse(xAxis); } catch { /* ignore */ }
    }

    if (Array.isArray(xAxis) && xAxis.length > 0 && Array.isArray(xAxis[0])) {
      const header = xAxis[0];
      if (header.length > 1) {
        return header.slice(1).map((lbl: string, idx: number) => ({
          label: lbl,
          field: String(lbl || `slice${idx}`).toLowerCase().replace(/\s+/g, ""),
          color: PIE_COLORS[idx % PIE_COLORS.length],
        }));
      }
    }
    return [];
  };

  const parseTierDataWrapper = (xAxis: any, legends: LegendValue[], title: string) => {
    const pieData = parsePieChartData(xAxis, legends);
    const safeName = (title || "Sheet").replace(/[:/?*[\]\\]/g, " ").trim().substring(0, 31);
    return { labels: pieData.map((d) => d.name), data: { [safeName]: pieData } };
  };

  const sampleGenerator = (xAxis: string[], legends: LegendValue[]): any[] =>
    generatePieSampleData(xAxis, legends, startingRange, endingRange);

  return (
    <BaseChartContainer
      {...props}
      category="RING"
      excelType="pie"
      generatorFunc={sampleGenerator}
      getTierLegends={getTierLegends}
      parseTierData={parseTierDataWrapper}
      renderChildChart={(tier, childProps) => (
        <ProgressRing
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({ effectiveLegendValues }) => {
        const { rings } = resolveDataLocally(
          allUploadedData,
          xAxisValues,
          effectiveLegendValues,
          widgetTitle,
          isCreationMode,
          selectedSourceCharts,
          isValueDetectOn,
          valueDetection
        );

        const targetVal = endingRange || 100;
        const totalRings = rings.length;

        // Calculate radii for nested rings
        const maxOuterRadius = 95;
        const minInnerRadius = 35;
        const totalBreadth = maxOuterRadius - minInnerRadius;

        // Dynamic breadth calculation to keep rings substantial even with many sources
        const ringBreadth = totalRings > 1
          ? Math.max(12, totalBreadth / (totalRings * 1.6))
          : 18;
        const gap = 6;

        return (
          <div className="w-full h-full relative flex flex-col items-center justify-center">
            {/* ── Chart ── */}
            <div className="flex-1 w-full min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  {rings.map((pieData, ringIdx) => {
                    const outer = maxOuterRadius - (ringIdx * (ringBreadth + gap));
                    const inner = outer - ringBreadth;

                    const isSingleValue = pieData.length === 1;
                    const ringSegments = isSingleValue
                      ? [
                        { ...pieData[0], name: pieData[0].name || "Progress" },
                        {
                          name: "Remainder",
                          value: Math.max(0, targetVal - pieData[0].value),
                          color: "#eff1f5" // Subtle background color
                        }
                      ]
                      : pieData;

                    return (
                      <Pie
                        key={`ring-${ringIdx}`}
                        data={ringSegments}
                        cx="50%"
                        cy="50%"
                        innerRadius={`${inner}%`}
                        outerRadius={`${outer}%`}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={20} // High value for fully rounded caps
                        paddingAngle={ringSegments.length > 1 ? 2 : 0}
                        animationBegin={ringIdx * 150}
                        animationDuration={1200}
                      >
                        {ringSegments.map((entry: any, index: number) => (
                          <RechartsCell
                            key={`cell-${ringIdx}-${index}`}
                            fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                            className="transition-all duration-300 hover:opacity-90 active:scale-95"
                          />
                        ))}
                      </Pie>
                    );
                  })}
                  <Tooltip
                    content={<CustomTooltip targetVal={targetVal} widgetTitle={widgetTitle} />}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>

              {/* Center Label - Stylized like the image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] text-center pointer-events-none flex flex-col items-center select-none">
                {rings.length > 0 && rings[0].length > 0 ? (
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-gray-400/80 uppercase tracking-widest leading-none">
                      {rings[0][0].ringLabel || (legendValues.length > 0 ? legendValues[0].label : "Progress")}
                    </p>
                    <p className="text-3xl font-black tracking-tighter" style={{ color: rings[0][0].color || PIE_COLORS[0] }}>
                      {Math.round((rings[0][0].value / targetVal) * 100)}%
                    </p>
                    {rings.length > 1 && (
                      <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tight mt-1">
                        + {rings.length - 1} more sources
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-gray-200 animate-pulse">0%</p>
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">No Data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }}
    </BaseChartContainer>
  );
}

// Add Custom Tooltip for cleaner look
const CustomTooltip = ({ active, payload, targetVal, widgetTitle }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.name === "Remainder") return null;

    const value = data.value;
    const percentage = ((value / targetVal) * 100).toFixed(1);
    const ringLabel = data.ringLabel || widgetTitle;

    return (
      <div className="bg-white/95 backdrop-blur-sm border border-border p-3 shadow-xl rounded-xl animate-in zoom-in-95 duration-200">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 border-b border-gray-50 pb-1">
          {ringLabel}
        </p>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          <p className="text-xs font-bold text-gray-700">
            {data.name}: <span className="text-blue-600">{percentage}%</span>
          </p>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 font-medium pl-5">
          Value: {value.toLocaleString()} / {targetVal.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};
