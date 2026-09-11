/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, MouseEvent, useEffect } from "react";


// Common Imports
import { BaseChartProps, LegendValue, ChartData } from "../Common/chartTypes";
import BaseChartContainer from "../Common/BaseChartContainer";
import CalendarHeatMapSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/CalendarHeatMap/CalendarHeatMapSkeleton";

/* ---------- CONSTANTS ---------- */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/* ---------- HELPERS ---------- */

/**
 * Deterministic count based on day index — avoids random flickering on re-renders.
 * Uses a simple integer hash (bit manipulation) so the same day always has the same value.
 */
const getDeterministicCount = (dayIndex: number): number => {
  let h = dayIndex + 1;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) | 0;
  h = h ^ (h >>> 16);
  return Math.abs(h) % 21; // 0–20, same range as before
};

/**
 * Generates STABLE sample data for a full year.
 * Values are deterministic — no random flickering when config changes.
 */
const generateFullYearSampleData = (
  _xAxisValues: string[],
  _legends: LegendValue[],
  _numOfLegendDataSet: number,
  _start: number,
  _end: number,
): ChartData[] => {
  const data: any[] = [];
  const year = new Date().getFullYear();
  const startDate = new Date(year, 0, 1);

  for (let i = 0; i < 365; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    data.push({
      date: `${yy}-${mm}-${dd}`,
      value: getDeterministicCount(i), // stable — no Math.random()
    });
  }
  return data;
};

/* ---------- CALENDAR VISUAL ---------- */

function CalendarVisual({
  chartData,
  effectiveLegendValues,
  legendColor,
}: {
  chartData: any[];
  effectiveLegendValues: LegendValue[];
  legendColor?: string;
}) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

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

  // Use the explicitly passed legendColor first (live prop), then fallback
  const primaryColor =
    legendColor || effectiveLegendValues[0]?.color || "#216e39";

  // Get selected year — prefer the year embedded in the actual data entries
  // (most reliable source), then fall back to metadata (yAxis / xAxis wrappers).
  const yearFromYAxis = (() => {
    try {
      // 0. Derive year directly from the first data entry's date string
      //    e.g. { date: "1994-01-01", value: 0 } → 1994
      if (Array.isArray(chartData) && chartData.length > 0) {
        const firstDate = chartData[0]?.date;
        if (firstDate && typeof firstDate === 'string') {
          // Format is YYYY-MM-DD (already normalized by parseTierData)
          const y = parseInt(firstDate.substring(0, 4), 10);
          if (!isNaN(y) && y > 1000) return y;
        }
      }

      // 1. Try yAxis metadata (Project Builder default)
      const fromYAxis = (effectiveLegendValues as any).yAxis;
      if (fromYAxis) {
        const parsed = typeof fromYAxis === 'string' ? JSON.parse(fromYAxis) : fromYAxis;
        if (parsed?.year) return Number(parsed.year);
      }

      // 2. Try xAxis metadata (Program Builder fallback)
      const fromXAxis = (effectiveLegendValues as any).xAxis;
      if (fromXAxis) {
        // The xAxis prop itself may be the raw array-of-rows; try wrapper object first
        const parsedXAxis = typeof fromXAxis === 'string' ? JSON.parse(fromXAxis) : fromXAxis;
        if (parsedXAxis?.year) return Number(parsedXAxis.year);
        // Fallback: inspect the first data row for a date string
        const rows = parsedXAxis?.data || parsedXAxis;
        if (Array.isArray(rows) && rows.length > 1) {
          const firstRow = rows[1]; // skip header row
          if (Array.isArray(firstRow) && typeof firstRow[0] === 'string') {
            const m = firstRow[0].match(/(\d{4})/);
            if (m) return Number(m[1]);
          }
        }
      }

      return new Date().getFullYear();
    } catch {
      return new Date().getFullYear();
    }
  })();

  const year = yearFromYAxis;
  const startDate = new Date(year, 0, 1);
  const startDayIndex = startDate.getDay(); // 0=Sun, 1=Mon ...

  // Day labels sequence starting from Jan 1st of that year
  const DAYS_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const shiftedDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    shiftedDays.push(DAYS_FULL[(startDayIndex + i) % 7]);
  }

  // Organize data by week (starting exactly from Jan 1st at the top-left)
  const weeks = React.useMemo(() => {
    const dataMap = new Map<string, number>();
    chartData.forEach(cd => {
      if (cd && cd.date) {
        dataMap.set(cd.date, cd.value);
      }
    });

    const w: any[][] = [];
    for (let wIdx = 0; wIdx < 54; wIdx++) {
      // 54 weeks to ensure we cover the end of year
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const dayOffset = wIdx * 7 + d;
        const currentDate = new Date(year, 0, 1 + dayOffset);

        if (currentDate.getFullYear() === year) {
          const yy = currentDate.getFullYear();
          const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
          const dd = String(currentDate.getDate()).padStart(2, "0");
          const dateStr = `${yy}-${mm}-${dd}`;

          weekDays.push({
            date: dateStr,
            value: dataMap.get(dateStr) || 0,
            label: currentDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          });
        } else {
          weekDays.push(null);
        }
      }
      if (weekDays.some((day) => day !== null)) {
        w.push(weekDays);
      }
    }
    return w;
  }, [year, chartData]);

  const getIntensityColor = React.useCallback((value: number) => {
    if (value === 0) return isDarkMode ? "#1e293b" : "#f3f4f6";
    const hex = primaryColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 33;
    const g = parseInt(hex.substring(2, 4), 16) || 110;
    const b = parseInt(hex.substring(4, 6), 16) || 57;
    if (value < 5) return `rgba(${r},${g},${b},0.2)`;
    if (value < 10) return `rgba(${r},${g},${b},0.45)`;
    if (value < 15) return `rgba(${r},${g},${b},0.7)`;
    return primaryColor;
  }, [isDarkMode, primaryColor]);

  const gridJSX = React.useMemo(() => {
    const handleHover = (
      dateLabel: string,
      val: number,
      e: MouseEvent<HTMLDivElement>,
    ) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        date: dateLabel,
        value: val,
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    };

    return (
      <div
        className="grid px-2 min-w-max md:min-w-0 gap-[2px] md:gap-[4px]"
        style={{
          gridTemplateColumns: `32px repeat(${weeks.length}, 1fr)`,
        }}
      >
        {/* Month Labels Row (Grid Row 1) */}
        <div className="h-6" /> {/* Empty top-left cell */}
        {weeks.map((week, wIdx) => {
          const firstDay = week.find((d) => d !== null);
          const showMonth = firstDay && new Date(firstDay.date).getDate() <= 7;
          const monthLabel = showMonth
            ? MONTHS[new Date(firstDay.date).getMonth()]
            : "";

          return (
            <div
              key={`month-${wIdx}`}
              className="relative h-6 flex items-end"
              style={{ gridColumn: wIdx + 2, gridRow: 1 }}
            >
              {showMonth && (
                <div className="absolute bottom-1 left-0 text-[10px] font-black text-gray-400 dark:text-slate-300 uppercase tracking-tighter whitespace-nowrap z-10 transition-colors">
                  {monthLabel}
                </div>
              )}
            </div>
          );
        })}
        {/* Day Rows (Grid Rows 2-8) */}
        {shiftedDays.map((d, dIdx) => (
          <div
            key={`day-label-${dIdx}`}
            className="flex items-center justify-end pr-2 text-[8px] font-bold text-gray-400 dark:text-slate-300 uppercase tracking-tighter"
            style={{ gridColumn: 1, gridRow: dIdx + 2 }}
          >
            {d}
          </div>
        ))}
        {/* Data Cells */}
        {weeks.flatMap((week, wIdx) =>
          week.map((day, dIdx) => (
            <div
              key={`cell-${wIdx}-${dIdx}`}
              className={`aspect-square w-full rounded-[1px] transition-all relative ${day ? "cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-400/50" : "opacity-0 pointer-events-none"}`}
              style={{
                gridColumn: wIdx + 2,
                gridRow: dIdx + 2,
                backgroundColor: day
                  ? getIntensityColor(day.value)
                  : "transparent",
                minWidth: "8px",
              }}
              onMouseEnter={(e) => day && handleHover(day.label, day.value, e)}
              onMouseLeave={() => setTooltip(null)}
            />
          )),
        )}
      </div>
    );
  }, [weeks, isDarkMode, getIntensityColor]);

  return (
    <div className="w-full relative py-8 flex flex-col overflow-x-auto custom-scrollbar scroll-smooth">
      {gridJSX}

      {/* Legend */}
      <div className="flex items-center justify-end gap-3 mt-8">
        <span className="text-[10px] font-black text-gray-400 dark:text-slate-300 uppercase tracking-[0.1em]">
          Less
        </span>
        <div className="flex gap-1.5 p-1 bg-gray-50 dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 shadow-sm">
          {[0, 5, 10, 15, 20].map((v, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-[2px] shadow-inner"
              style={{ backgroundColor: getIntensityColor(v) }}
            />
          ))}
        </div>
        <span className="text-[10px] font-black text-gray-400 dark:text-slate-300 uppercase tracking-[0.1em]">
          More
        </span>
      </div>

      {/* Custom Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-background backdrop-blur-md text-white text-[10px] rounded-lg shadow-2xl px-3 py-2 pointer-events-none border border-white/10 animate-in fade-in zoom-in duration-150"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="font-semibold text-xs border-b border-gray-200/40 pb-1 mb-1 uppercase tracking-wider whitespace-nowrap text-brand-primary">
            {tooltip.date}
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-400">Total:</span>
            <span className="font-semibold text-sm tracking-tight text-brand-primary">
              {tooltip.value}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- COMPONENT ---------- */

export default function CalendarHeatmapChart(props: BaseChartProps) {
  // ── Color fix ──────────────────────────────────────────────────────────────
  // In dashboard mode the parent may NOT forward a `legendValues` prop; the
  // widget color lives in `props.calendarHeatmapChart.widgets` or `props.widgets`.
  // We mirror the exact lookup that getTierLegends uses so BaseChartContainer
  // always receives the correct legendValues (and therefore effectiveLegendValues).
  const resolvedLegendValues: LegendValue[] = (() => {
    if (props.legendValues && props.legendValues.length > 0) {
      return props.legendValues;
    }
    const rawWidgets =
      (props as any).calendarHeatmap?.widgets ||
      (props as any).widgets ||
      [];
    return rawWidgets.map((w: any) => ({
      label: w.legendName || w.label || "Legend",
      field: (w.legendName || w.label || "legend")
        .toLowerCase()
        .replace(/\s+/g, ""),
      color: w.color,
    }));
  })();

  const getTierLegends = (tier: any): LegendValue[] => {
    return (tier?.calendarHeatmap?.widgets || tier?.widgets || []).map(
      (w: any) => ({
        label: w.legendName || w.label,
        field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        color: w.color,
      }),
    );
  };

  const parseTierDataWrapper = (
    xAxis: any,
    _legends: LegendValue[],
    title: string,
  ) => {
    const parsedXAxis = typeof xAxis === "string" ? JSON.parse(xAxis) : xAxis;

    // Handle the wrapper object { data, year } used by Program Builder
    const rawDataArr = parsedXAxis?.data || parsedXAxis;
    const yearString = (() => {
      try {
        if (parsedXAxis?.year) return String(parsedXAxis.year);
        const parsed = typeof props.yAxis === 'string' ? JSON.parse(props.yAxis || "{}") : (props.yAxis || {});
        return parsed?.year || new Date().getFullYear().toString();
      } catch {
        return new Date().getFullYear().toString();
      }
    })();
    const year = Number(yearString);

    // Helper: parse a date cell that may be "DD-MM-YYYY,Day" or "YYYY-MM-DD" or a JS Date string
    const parseDateCell = (raw: string): string | null => {
      if (!raw) return null;
      // Format: "DD-MM-YYYY,Day" e.g. "01-01-2026,Fri"
      const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})/);
      if (ddmmyyyy) {
        const [, dd, mm, yyyy] = ddmmyyyy;
        return `${yyyy}-${mm}-${dd}`;
      }
      // Format: "YYYY-MM-DD"
      const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (ymd) return raw.substring(0, 10);
      return null;
    };

    let chartDataRows: any[] = [];

    if (Array.isArray(rawDataArr) && rawDataArr.length > 1) {
      const header = rawDataArr[0];
      const isHeaderRow =
        Array.isArray(header) &&
        header.length >= 2 &&
        typeof header[0] === "string" &&
        isNaN(Number(header[1]));

      const dataRows = isHeaderRow ? rawDataArr.slice(1) : rawDataArr;

      chartDataRows = dataRows
        .map((row: any[]) => {
          const dateStr = parseDateCell(String(row[0] || ""));
          return dateStr ? { date: dateStr, value: Number(row[1] || 0) } : null;
        })
        .filter(Boolean);
    }

    // Build full-year CSV template labels in new format: "DD-MM-YYYY,Day"
    const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const xAxisLabels: string[] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      const dayName = DAYS_SHORT[d.getDay()];
      xAxisLabels.push(`${dd}-${mm}-${yyyy},${dayName}`);
    }

    return {
      labels: xAxisLabels,
      data: { [title || props.widgetTitle || "Default"]: chartDataRows },
    };
  };

  return (
    <BaseChartContainer
      {...props}
      legendValues={resolvedLegendValues}
      category="CALENDAR_HEATMAP"
      excelType="heatmap"
      generatorFunc={generateFullYearSampleData}
      getTierLegends={getTierLegends}
      parseTierData={parseTierDataWrapper}
      showLegend={props.showLegend ?? true}
      renderChildChart={(tier, childProps) => (
        <CalendarHeatmapChart
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({ chartData: rawChartData, effectiveLegendValues, isSampleData }) => {
        // Show skeleton only when:
        // - data is sample (not real/parsed)
        // - we are NOT in creation mode or preview
        // - there is no saved xAxis config yet (no real data configured)
        // - the config panel is NOT currently open (editing always produces isSampleData=true
        //   because BaseChartContainer replaces real data with a simulated preview)
        const hasRealConfig = !!props.xAxis;
        if (isSampleData && !props.isCreationMode && !props.isPreview && !hasRealConfig) {
          return <div className="w-full h-full min-h-[300px]"><CalendarHeatMapSkeleton /></div>;
        }

        // When the config panel is open (isSampleData=true but real config exists),
        // BaseChartContainer feeds generator output instead of the saved data.
        // Re-parse from props.xAxis so the visual always shows the real saved chart data.
        let chartData = rawChartData;
        if (isSampleData && hasRealConfig) {
          try {
            const { data: reparsed } = parseTierDataWrapper(props.xAxis, effectiveLegendValues, props.widgetTitle || "Default");
            const firstKey = Object.keys(reparsed)[0];
            if (firstKey && Array.isArray(reparsed[firstKey]) && reparsed[firstKey].length > 0) {
              chartData = reparsed[firstKey];
            }
          } catch {
            // fallback to rawChartData
          }
        }

        // effectiveLegendValues now always has the correct API color because
        // resolvedLegendValues (passed above) extracts it from widgets as a fallback.
        const legendColor = effectiveLegendValues[0]?.color || "#216e39";
        // Inject metadata into effectiveLegendValues for the visual
        (effectiveLegendValues as any).yAxis = props.yAxis;
        (effectiveLegendValues as any).xAxis = props.xAxis;
        return (
          <CalendarVisual
            chartData={chartData}
            effectiveLegendValues={effectiveLegendValues}
            legendColor={legendColor}
          />
        );
      }}
    </BaseChartContainer>
  );
}
