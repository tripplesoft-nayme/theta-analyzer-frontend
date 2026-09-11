import { useState, useEffect } from "react";
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
import {
  parsePieChartData,
  parseNestedPieData,
  PieData,
} from "@/utils/parsePieChartData";

/* ---------- HELPERS ---------- */

const PIE_COLORS = [
  "#13A490",
  "#35B6EE",
  "#6F78F9",
  "#F26419",
  "#F6AE2D",
  "#862BB0",
  "#D72638",
  "#3F88C5",
  "#44BBA4",
  "#FF9505",
];

const getRandomValue = (min = 10, max = 100) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Generates sample pie data from legend values (for preview / creation mode).
 * Shape: { name, value, color }[]
 */
const generatePieSampleData = (
  _xAxis: string[],
  legends: LegendValue[],
): any[] => {
  return legends
    .filter((l) => l.label)
    .map((l, i) => ({
      name: l.label,
      value: getRandomValue(),
      color: l.color || PIE_COLORS[i % PIE_COLORS.length],
    }));
};

/**
 * Resolves the actual pie data to render.
 *
 * Priority:
 *  1. Uploaded API data (already parsed as PieData[])
 *  2. Sample data from configured legends
 *  3. Default fallback sample data
 */
const resolvePieData = (
  allUploadedData: any,
  xAxisRaw: any,
  legendValues: LegendValue[],
  widgetTitle: string,
  isProgramBuilder?: boolean,
): {
  pieData: PieData[];
  nestedPieData?: PieData[][];
  isSampleData: boolean;
  isNested: boolean;
} => {
  // --- Priority 1: Program Builder Aggregation (Nested) ---
  if (isProgramBuilder && xAxisRaw) {
    const nested = parseNestedPieData(xAxisRaw, legendValues);
    if (nested.length > 1) {
      // Return a flatten sum for the legend, but the full set for chart
      const flattened = legendValues.map((l) => {
        const totalValue = nested.reduce((sum, ring) => {
          const match = ring.find((d) => d.name === l.label);
          return sum + (match?.value || 0);
        }, 0);
        return { name: l.label, value: totalValue, color: l.color };
      });
      return {
        pieData: flattened,
        nestedPieData: nested,
        isSampleData: false,
        isNested: true,
      };
    }
  }

  // --- Priority 2: API uploaded data ---
  if (allUploadedData) {
    // allUploadedData may be a keyed object { [sheetName]: PieData[] }
    // or a raw PieData[] array (when passed directly from parseTierDataWrapper)
    if (Array.isArray(allUploadedData) && allUploadedData.length > 0) {
      return {
        pieData: allUploadedData as PieData[],
        isSampleData: false,
        isNested: false,
      };
    }

    const safeName = (widgetTitle || "Sheet")
      .replace(/[:/?*[\]\\]/g, " ")
      .trim()
      .substring(0, 31);
    const keyed = allUploadedData[safeName];
    if (Array.isArray(keyed) && keyed.length > 0) {
      return {
        pieData: keyed as PieData[],
        isSampleData: false,
        isNested: false,
      };
    }

    // Try parsing from raw xAxis if allUploadedData is a nested structure
    if (xAxisRaw) {
      const parsed = parsePieChartData(xAxisRaw, legendValues);
      if (parsed.length > 0) {
        return { pieData: parsed, isSampleData: false, isNested: false };
      }
    }
  }

  // --- Priority 2: Sample data from configured legends ---
  const effectiveLegends = getEffectiveLegendValues(legendValues);
  if (effectiveLegends.some((l) => l.label)) {
    return {
      pieData: generatePieSampleData([], effectiveLegends),
      isSampleData: true,
      isNested: false,
    };
  }

  // --- Priority 3: Default fallback ---
  return {
    pieData: generatePieSampleData(
      [],
      [
        { label: "Category A", field: "categorya", color: PIE_COLORS[0] },
        { label: "Category B", field: "categoryb", color: PIE_COLORS[1] },
        { label: "Category C", field: "categoryc", color: PIE_COLORS[2] },
      ],
    ),
    isSampleData: true,
    isNested: false,
  };
};

/* ---------- COMPONENT ---------- */

export default function PieChartWidget(props: BaseChartProps) {
  const { legendValues = [], allUploadedData, widgetTitle = "Chart" } = props;

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
    // 1. Check for standard widgets metadata
    const baseLegends = (tier?.pi?.widgets || tier?.pieChart?.widgets || tier?.widgets || []).map(
      (w: any) => ({
        label: w.legendName || w.label,
        field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        color: w.color,
      }),
    );

    if (baseLegends.length > 0) return baseLegends;

    // 2. Fallback: Parse from Row 0 of xAxis if metadata is missing
    let xAxis = tier?.xAxis;
    if (typeof xAxis === "string") {
      try {
        xAxis = JSON.parse(xAxis);
      } catch {
        /* ignore */
      }
    }

    if (Array.isArray(xAxis) && xAxis.length > 0 && Array.isArray(xAxis[0])) {
      const header = xAxis[0];
      // Expecting standard format: ["Label", "Legend1", "Legend2", ...]
      if (header.length > 1) {
        return header.slice(1).map((lbl: string, idx: number) => ({
          label: lbl,
          field: String(lbl || `slice${idx}`)
            .toLowerCase()
            .replace(/\s+/g, ""),
          color: PIE_COLORS[idx % PIE_COLORS.length],
        }));
      }
    }

    return [];
  };

  /**
   * For Pie chart tiers: parse xAxis → PieData[] and return as keyed object
   * so BaseChartContainer can pass it correctly as allUploadedData.
   */
  const parseTierDataWrapper = (
    xAxis: any,
    legends: LegendValue[],
    title: string,
  ) => {
    const pieData = parsePieChartData(xAxis, legends);
    const safeName = (title || "Sheet")
      .replace(/[:/?*[\]\\]/g, " ")
      .trim()
      .substring(0, 31);
    return {
      labels: pieData.map((d) => d.name),
      data: { [safeName]: pieData },
    };
  };

  /**
   * Generator func adapter — BaseChartContainer calls this for sample data
   * but Pie resolves its own data; this is a no-op placeholder that satisfies
   * the required interface.
   */
  const pieSampleGenerator = (xAxis: string[], legends: LegendValue[]): any[] =>
    generatePieSampleData(xAxis, legends);

  return (
    <BaseChartContainer
      {...props}
      category="PIE"
      excelType="pie"
      generatorFunc={pieSampleGenerator}
      getTierLegends={getTierLegends}
      parseTierData={parseTierDataWrapper}
      renderChildChart={(tier, childProps) => (
        <PieChartWidget
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {() => {
        const { pieData, nestedPieData, isNested } = resolvePieData(
          allUploadedData,
          props.xAxis,
          legendValues,
          widgetTitle,
          props.isProgramBuilder,
        );

        const hasNoData = isNested && nestedPieData
          ? (!nestedPieData || nestedPieData.length === 0 || nestedPieData.every(ring => ring.every(d => !d.value || d.value === 0)))
          : (!pieData || pieData.length === 0 || pieData.every(d => !d.value || d.value === 0));

        return (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            {/* Legend Style: Source-Oriented Breakdown (Chart Name: Cat A: Val, Cat B: Val) */}
            <div className="w-full flex flex-col items-center gap-2 px-4 max-h-[120px] overflow-y-auto custom-scrollbar">
              {(isNested && nestedPieData ? nestedPieData : [pieData]).map(
                (ring, rIdx) => {
                  const ringLabel =
                    ring[0]?.ringLabel ||
                    (isNested ? `Source ${rIdx + 1}` : "");

                  return (
                    <div
                      key={`legend-row-${rIdx}`}
                      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-1 w-full"
                    >
                      {isNested && (
                        <span className="text-[11px] font-bold text-gray-800 dark:text-slate-200 uppercase tracking-tighter min-w-[120px] text-right">
                          {ringLabel + " :"}
                        </span>
                      )}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                        {ring.map((entry, index) => {
                          const color =
                            entry.color ||
                            PIE_COLORS[index % PIE_COLORS.length];
                          return (
                            <div
                              key={`entry-${index}`}
                              className="flex items-center gap-2"
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-[10px] font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                                {entry.name}:
                              </span>
                              <span className="text-sm font-bold text-gray-900 dark:text-slate-100">
                                {entry.value}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            {/* Concentric / Nested Pie Chart */}
            <div className="flex-1 w-full min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  {hasNoData ? (
                    <Pie
                      data={
                        pieData.length > 0
                          ? pieData.map((d) => ({ ...d, value: 1 }))
                          : [{ value: 1 }, { value: 1 }, { value: 1 }]
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius="85%"
                      dataKey="value"
                      stroke={isDarkMode ? "#0f172a" : "#fff"}
                      strokeWidth={2}
                      labelLine={false}
                      isAnimationActive={false}
                    >
                      {(pieData.length > 0
                        ? pieData
                        : [1, 2, 3]
                      ).map((_, index) => {
                        const lightColors = ["#f1f5f9", "#e2e8f0", "#cbd5e1"];
                        const darkColors = ["#1e293b", "#334155", "#475569"];
                        const color = isDarkMode
                          ? darkColors[index % darkColors.length]
                          : lightColors[index % lightColors.length];
                        return (
                          <RechartsCell
                            key={`placeholder-cell-${index}`}
                            fill={color}
                            className="pointer-events-none"
                          />
                        );
                      })}
                    </Pie>
                  ) : isNested && nestedPieData ? (
                    nestedPieData.map((ringData, ringIdx) => {
                      const ringCount = nestedPieData.length;

                      // Calculate radii for concentric rings
                      const gap = 1.5;
                      const totalPlotArea = 85;
                      const ringWidth =
                        (totalPlotArea - (ringCount - 1) * gap) / ringCount;
                      const outerRadiusNum = (ringIdx + 1) * (ringWidth + gap);
                      const innerRadiusNum = ringIdx * (ringWidth + gap);

                      return (
                        <Pie
                          key={`ring-${ringIdx}`}
                          data={ringData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={`${innerRadiusNum}%`}
                          outerRadius={`${outerRadiusNum}%`}
                          stroke={isDarkMode ? "#0f172a" : "#fff"}
                          strokeWidth={2}
                          minAngle={2}
                          labelLine={false}
                        >
                          {ringData.map((entry, i) => (
                            <RechartsCell
                              key={`cell-${ringIdx}-${i}`}
                              fill={entry.color}
                              className="hover:opacity-85 transition-opacity cursor-pointer"
                            />
                          ))}
                        </Pie>
                      );
                    })
                  ) : (
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius="85%"
                      dataKey="value"
                      stroke={isDarkMode ? "#0f172a" : "#fff"}
                      strokeWidth={2}
                      minAngle={5}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <RechartsCell
                          key={`cell-${index}`}
                          fill={
                            entry.color || PIE_COLORS[index % PIE_COLORS.length]
                          }
                          className="hover:opacity-85 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                  )}

                  {!hasNoData && (
                    <Tooltip
                      formatter={(value: any, name: any, tpProps: any) => {
                        const ringLabel = tpProps?.payload?.ringLabel
                          ? ` [${tpProps.payload.ringLabel}]`
                          : "";
                        return [`${value}`, `${name}${ringLabel}`];
                      }}
                      contentStyle={{
                        backgroundColor: isDarkMode ? "#0f172a" : "#fff",
                        borderRadius: "12px",
                        border: isDarkMode ? "1px solid #334155" : "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        fontSize: "12px",
                        padding: "8px 12px",
                        color: isDarkMode ? "#f1f5f9" : "#1e293b",
                      }}
                      itemStyle={{
                        color: isDarkMode ? "#f1f5f9" : undefined,
                      }}
                    />
                  )}
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }}
    </BaseChartContainer>
  );
}
