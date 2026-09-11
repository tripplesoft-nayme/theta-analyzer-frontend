import { useState, useEffect } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import BaseChartContainer from "../Common/BaseChartContainer";
import { BaseChartProps, LegendValue } from "../Common/chartTypes";
import { parseCommonChartData } from "../Common/chartUtils";

// Custom DOT to show colors based on value zonings
const ZoneDot = (props: any) => {
  const { cx, cy, value, poorThreshold, goodThreshold } = props;

  let dotColor = "#95de64"; // Good (Green)
  if (value <= poorThreshold) {
    dotColor = "#ff7875"; // Poor (Red)
  } else if (value < goodThreshold) {
    dotColor = "#ffd666"; // Average (Amber)
  }

  return (
    <svg
      x={cx - 6}
      y={cy - 6}
      width={12}
      height={12}
      fill="white"
      viewBox="0 0 12 12"
    >
      <circle
        cx="6"
        cy="6"
        r="5"
        fill={dotColor}
        stroke="#fff"
        strokeWidth="2"
      />
    </svg>
  );
};

export default function RagChart(props: BaseChartProps) {
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

  // Use BaseChartContainer's data handling logic
  const getTierLegends = (tier: any): LegendValue[] => {
    return (
      tier?.ragChart?.widgets ||
      tier?.widgets || [{ label: "Value", color: "#6366f1" }]
    ).map((w: any) => ({
      label: w.legendName || w.label || "Value",
      field: (w.legendName || w.label || "Value")
        ?.toLowerCase()
        .replace(/\s+/g, ""),
      color: w.color || "#6366f1",
    }));
  };

  const parseTierData = (xAxis: any, legends: LegendValue[], title: string) => {
    return parseCommonChartData(xAxis, legends, title);
  };

  const sampleGenerator = (xAxis: string[], legends: LegendValue[]): any[] => {
    return xAxis.map((name) => {
      const row: any = { name };
      legends.forEach((l) => {
        row[l.field] = Math.floor(Math.random() * 100);
      });
      return row;
    });
  };

  return (
    <BaseChartContainer
      {...props}
      category="RAG"
      excelType="barChart"
      generatorFunc={sampleGenerator}
      getTierLegends={getTierLegends}
      parseTierData={parseTierData}
      renderChildChart={(tier, childProps) => (
        <RagChart
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({
        chartData,
        safeStartingRange,
        safeEndingRange,
        effectiveLegendValues,
      }) => (
        <RagRenderer
          chartData={chartData}
          safeStartingRange={safeStartingRange}
          safeEndingRange={safeEndingRange}
          effectiveLegendValues={effectiveLegendValues}
          isDarkMode={isDarkMode}
        />
      )}
    </BaseChartContainer>
  );
}

const RagRenderer = ({
  chartData,
  safeStartingRange,
  safeEndingRange,
  effectiveLegendValues,
  isDarkMode,
}: {
  chartData: any[];
  safeStartingRange: number;
  safeEndingRange: number;
  effectiveLegendValues: any[];
  isDarkMode: boolean;
}) => {
  const ticks = (() => {
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
  })();

  const yDomain = [ticks[0], ticks[ticks.length - 1]];

  const range = safeEndingRange - safeStartingRange;
  const poor = safeStartingRange + range / 3;
  const good = safeStartingRange + (range * 2) / 3;

  const yAxisMin = yDomain[0];
  const yAxisMax = yDomain[yDomain.length - 1];

  // Helper to calculate offsets for a specific field/dataKey
  const getOffsetsForField = (field: string) => {
    const validData = chartData.filter((d: any) => d != null && !isNaN(Number(d[field])));
    const lineValues = validData.map((d: any) => Number(d[field]));
    const lineMin = lineValues.length > 0 ? Math.min(...lineValues) : 0;
    const lineMax = lineValues.length > 0 ? Math.max(...lineValues) : 0;
    const lineRange = lineMax - lineMin;

    let poorOffset = 0;
    let goodOffset = 0;
    if (lineRange === 0) {
      poorOffset = lineMin <= poor ? 200 : -100;
      goodOffset = lineMin <= good ? 200 : -100;
    } else {
      poorOffset = ((poor - lineMin) / lineRange) * 100;
      goodOffset = ((good - lineMin) / lineRange) * 100;
    }
    return { poorOffset, goodOffset };
  };

  return (
    <div className="h-full min-h-[150px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            {effectiveLegendValues.map((l) => {
              const { poorOffset, goodOffset } = getOffsetsForField(l.field);
              return (
                <linearGradient key={l.field} id={`ragLineGradient-${l.field}`} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#ff7875" />
                  <stop offset={`${poorOffset}%`} stopColor="#ff7875" />
                  <stop offset={`${poorOffset}%`} stopColor="#ffd666" />
                  <stop offset={`${goodOffset}%`} stopColor="#ffd666" />
                  <stop offset={`${goodOffset}%`} stopColor="#95de64" />
                  <stop offset="100%" stopColor="#95de64" />
                </linearGradient>
              );
            })}
          </defs>

          <ReferenceArea
            y1={yAxisMin}
            y2={poor}
            fill={isDarkMode ? "#451a1a" : "#fff1f0"}
            fillOpacity={isDarkMode ? 0.6 : 1}
          />
          <ReferenceArea
            y1={poor}
            y2={good}
            fill={isDarkMode ? "#3e3b1f" : "#feffe6"}
            fillOpacity={isDarkMode ? 0.6 : 1}
          />
          <ReferenceArea
            y1={good}
            y2={yAxisMax}
            fill={isDarkMode ? "#1b2e1b" : "#f6ffed"}
            fillOpacity={isDarkMode ? 0.6 : 1}
          />

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={isDarkMode ? "#334155" : "#e5e7eb"}
          />
          <XAxis
            dataKey="name"
            stroke={isDarkMode ? "#475569" : "#9ca3af"}
            tick={{ fill: isDarkMode ? "#cbd5e1" : "#6b7280", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: isDarkMode ? "#334155" : "#e5e7eb" }}
            dy={10}
          />
          <YAxis
            type="number"
            domain={yDomain}
            allowDataOverflow={true}
            stroke={isDarkMode ? "#475569" : "#9ca3af"}
            tick={{ fill: isDarkMode ? "#cbd5e1" : "#6b7280", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: isDarkMode ? "#334155" : "#e5e7eb" }}
            width={40}
            ticks={ticks}
            tickFormatter={(num: number) => {
              if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
              if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
              if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
              return num.toString();
            }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? "#0f172a" : "rgba(255, 255, 255, 0.95)",
              borderRadius: "12px",
              border: isDarkMode ? "1px solid #334155" : "1px solid #e5e7eb",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              color: isDarkMode ? "#f8fafc" : "#1e293b",
            }}
            itemStyle={{
              fontSize: "12px",
              fontWeight: "600",
              color: isDarkMode ? "#f1f5f9" : undefined,
            }}
          />

          <ReferenceArea
            y1={good}
            y2={good}
            label={{
              value: "Good",
              position: "insideBottomRight",
              fill: "#52c41a",
              fontSize: 11,
              fontWeight: "bold",
              dy: -10,
            }}
          />
          <ReferenceArea
            y1={poor}
            y2={poor}
            label={{
              value: "Poor",
              position: "insideBottomRight",
              fill: "#ff4d4f",
              fontSize: 11,
              fontWeight: "bold",
              dy: -10,
            }}
          />

          {effectiveLegendValues.map((l) => (
            <Line
              key={l.field}
              type="monotone"
              dataKey={l.field}
              name={l.label}
              stroke={`url(#ragLineGradient-${l.field})`}
              strokeWidth={4}
              dot={<ZoneDot poorThreshold={poor} goodThreshold={good} />}
              activeDot={{ r: 7, strokeWidth: 0 }}
              isAnimationActive={true}
              animationDuration={1500}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
