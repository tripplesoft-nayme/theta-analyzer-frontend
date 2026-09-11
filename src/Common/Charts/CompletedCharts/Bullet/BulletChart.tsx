/* eslint-disable @typescript-eslint/no-explicit-any */

// Common Imports
import { BaseChartProps, LegendValue } from "../Common/chartTypes";
import {
  getEffectiveLegendValues,
  sanitizeSheetName,
  generateBulletChartData,
  parseBulletChartData,
} from "../Common/chartUtils";
import BaseChartContainer from "../Common/BaseChartContainer";

/*       TYPES       */

type PlotBand = {
  from: number;
  to: number;
  color: string;
  opacity: number;
};

/* ---------- HELPERS ---------- */

const BulletChartItem = ({
  title,
  value,
  target,
  min,
  max,
  color,
  currentColor,
  targetColor,
  plotBands,
}: {
  title: string;
  value: number;
  target: number;
  min: number;
  max: number;
  color: string;
  currentColor?: string;
  targetColor?: string;
  plotBands: PlotBand[];
}) => {
  const range = max - min || 100;
  const getPercentage = (val: number) => {
    const p = ((val - min) / range) * 100;
    return Math.min(Math.max(p, 0), 100);
  };

  const finalCurrentColor = currentColor || color;

  return (
    <div className="flex flex-col gap-1 mb-4 w-full group">
      <div className="flex justify-between items-center text-[13px] mb-1">
        <span className="font-semibold text-slate-700 dark:text-slate-300 tracking-tight">
          {title}
        </span>
        <div className="flex gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-1.5 rounded-full"
              style={{ backgroundColor: finalCurrentColor }}
            />
            Current: <span className="text-slate-900 dark:text-slate-100">{value}</span>
          </span>
          <span className="flex items-center gap-1.5">
            {targetColor ? (
              <span
                className="w-2.5 h-1.5 rounded-full"
                style={{ backgroundColor: targetColor }}
              />
            ) : (
              <span className="w-0.5 h-3 bg-slate-900 dark:bg-slate-300 rounded-full" />
            )}
            Target: <span className="text-slate-900 dark:text-slate-100">{target}</span>
          </span>
        </div>
      </div>

      <div className="relative h-6 w-full bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-800">
        {/* Plot Bands */}
        {plotBands.map((band, idx) => (
          <div
            key={idx}
            className="absolute h-full transition-all duration-500"
            style={{
              left: `${getPercentage(band.from)}%`,
              width: `${getPercentage(band.to) - getPercentage(band.from)}%`,
              backgroundColor: band.color,
              opacity: 0.15,
            }}
          />
        ))}

        {/* Feature Measure (The performance bar) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 rounded-r-sm transition-all duration-1000 ease-in-out shadow-sm"
          style={{
            left: "0%",
            width: `${getPercentage(value)}%`,
            backgroundColor: finalCurrentColor,
            zIndex: 10,
          }}
        />

        {/* Comparative Measure (The target marker) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-5 rounded-full transition-all duration-1000 ease-in-out border-x border-white/20"
          style={{
            left: `${getPercentage(target)}%`,
            transform: "translate(-50%, -50%)",
            backgroundColor: targetColor || "rgb(15 23 42)",
            zIndex: 20,
          }}
        />

        {/* Interaction/Tooltip Trigger Placeholder */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity"
          title={`${title} | Current: ${value} | Target: ${target}`}
        />
      </div>

      {/* Axis markers for simple reference */}
      <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-300 font-bold px-1 mt-0.5 uppercase tracking-tighter">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

/* ---------- COMPONENT ---------- */

export default function BulletChart(props: BaseChartProps) {
  const {
    legendValues = [],
    allUploadedData,
    widgetTitle = "Bullet Chart",
  } = props;

  const getTierLegends = (tier: any): LegendValue[] => {
    return (tier?.bulletChart?.widgets || tier?.widgets || []).map(
      (w: any) => ({
        label: w.legendName || w.label,
        field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        color: w.color,
      }),
    );
  };

  const parseTierDataWrapper = (
    rawXAxis: any,
    legends: LegendValue[],
    title: string,
  ) => {
    const bulletData = parseBulletChartData(rawXAxis, legends);
    const sheetName = sanitizeSheetName(title);
    return {
      labels: Object.keys(bulletData),
      data: { [sheetName]: bulletData },
    };
  };

  return (
    <BaseChartContainer
      {...props}
      category="BULLET"
      excelType="bullet" // Uses Bullet-style template (Metric, Current, Target)
      generatorFunc={(_xAxis, legends, _n, start, end) =>
        generateBulletChartData(legends, start, end)
      }
      getTierLegends={getTierLegends}
      parseTierData={parseTierDataWrapper}
      renderChildChart={(tier, childProps) => (
        <BulletChart
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({ safeStartingRange, safeEndingRange }) => {
        const effectiveLegends = getEffectiveLegendValues(legendValues, []);

        const sheetName = sanitizeSheetName(widgetTitle);
        // dataToUse is directly the mapping { "Metric": [curr, target] }
        let dataToUse = allUploadedData?.[sheetName];

        if (
          !dataToUse &&
          !Array.isArray(allUploadedData) &&
          typeof allUploadedData === "object" &&
          allUploadedData !== null
        ) {
          // Fallback if the data is not keyed by sheet name but passed directly
          dataToUse = allUploadedData;
        }

        const headerRow = (() => {
          if (!props.xAxis) return [];
          try {
            const parsed = typeof props.xAxis === "string" ? JSON.parse(props.xAxis) : props.xAxis;
            return Array.isArray(parsed) ? parsed[0] : [];
          } catch {
            return [];
          }
        })();
        const hasCurrentOrTargetInHeader = Array.isArray(headerRow) && headerRow.some((h: any) => {
          const s = String(h || "").toLowerCase();
          return s === "current" || s === "target";
        });

        const isColumnLegendStyle = hasCurrentOrTargetInHeader || effectiveLegends.some(
          (l) =>
            l.label &&
            (l.label.toLowerCase() === "current" ||
              l.label.toLowerCase() === "target")
        );

        // Generate sample data if no real data
        let bulletDataMapping = dataToUse;
        if (!bulletDataMapping || Object.keys(bulletDataMapping).length === 0) {
          if (isColumnLegendStyle) {
            bulletDataMapping = generateBulletChartData(
              [
                { label: "Revenue", field: "revenue", color: "" },
                { label: "Expansion", field: "expansion", color: "" },
                { label: "Support", field: "support", color: "" },
                { label: "ROI", field: "roi", color: "" },
                { label: "Sales", field: "sales", color: "" },
              ],
              safeStartingRange,
              safeEndingRange,
            );
          } else {
            bulletDataMapping = generateBulletChartData(
              effectiveLegends,
              safeStartingRange,
              safeEndingRange,
            );
          }
        }

        let bulletCharts: {
          title: string;
          color: string;
          currentColor?: string;
          targetColor?: string;
          data: [number, number];
        }[] = [];

        if (isColumnLegendStyle) {
          const currentLegend = effectiveLegends.find(
            (l) => l.label && l.label.toLowerCase() === "current"
          );
          const targetLegend = effectiveLegends.find(
            (l) => l.label && l.label.toLowerCase() === "target"
          );
          const currentColor = currentLegend?.color || "#3b82f6";
          const targetColor = targetLegend?.color || "#10b981";

          bulletCharts = Object.keys(bulletDataMapping).map((metricName) => ({
            title: metricName,
            color: currentColor,
            currentColor,
            targetColor,
            data: bulletDataMapping?.[metricName] || [0, 0],
          }));
        } else {
          bulletCharts = effectiveLegends
            .filter((l) => l.label)
            .map((l) => ({
              title: l.label,
              color: l.color,
              data: bulletDataMapping?.[l.label] || [0, 0],
            }));
        }

        const range = safeEndingRange - safeStartingRange;
        const segment = range / 4;
        const plotBands: PlotBand[] = [
          {
            from: safeStartingRange,
            to: safeStartingRange + segment,
            color: "#cbd5e1",
            opacity: 0.2,
          },
          {
            from: safeStartingRange + segment,
            to: safeStartingRange + segment * 2,
            color: "#94a3b8",
            opacity: 0.2,
          },
          {
            from: safeStartingRange + segment * 2,
            to: safeStartingRange + segment * 3,
            color: "#64748b",
            opacity: 0.2,
          },
          {
            from: safeStartingRange + segment * 3,
            to: safeEndingRange,
            color: "#475569",
            opacity: 0.2,
          },
        ];

        return (
          <div className="space-y-6 w-full h-full min-h-[150px] overflow-y-auto px-1 custom-scrollbar">
            {bulletCharts.map((chart, index) => (
              <BulletChartItem
                key={`${props.chartId || "bullet"}-${index}`}
                title={chart.title}
                value={chart.data[0]}
                target={chart.data[1]}
                min={safeStartingRange}
                max={safeEndingRange}
                color={chart.color}
                currentColor={chart.currentColor}
                targetColor={chart.targetColor}
                plotBands={plotBands}
              />
            ))}


            {bulletCharts.length === 0 && (
              <div className="h-[200px] flex flex-col items-center justify-center text-gray-400 gap-2 border-2 border-dashed border-border rounded-xl">
                <div className="size-12 rounded-full bg-gray-50 flex items-center justify-center">
                  <span className="text-2xl">📉</span>
                </div>
                <p className="text-sm font-medium">No metrics configured</p>
              </div>
            )}
          </div>
        );
      }}
    </BaseChartContainer>
  );
}
