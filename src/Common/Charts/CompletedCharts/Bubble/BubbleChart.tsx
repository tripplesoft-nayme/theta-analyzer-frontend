/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect } from "react";
import Chart from "react-apexcharts";

// Common Imports
import { BaseChartProps, LegendValue, ChartData } from "../Common/chartTypes";
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

const deterministicRandom = (seed: number, min: number, max: number): number => {
  const x = Math.sin(seed) * 10000;
  const random = x - Math.floor(x);
  return Math.floor(random * (max - min + 1)) + min;
};

const generateBubbleSampleData = (
  xAxisValues: string[],
  legends: LegendValue[],
  _numOfLegendDataSet: number,
  start: number,
  end: number
): ChartData[] => {
  return xAxisValues.map((name, i) => {
    const item: ChartData = { name };
    legends.forEach((l, legendIndex) => {
      const seed = simpleHash(`${name}-${i}-${legendIndex}`);
      // For bubble charts, we can store a value or just a generic number.
      // ApexCharts bubble needs [x, y, z]. We'll use the value as y and a fixed size as z for sample data.
      item[l.field] = deterministicRandom(seed, start, end);
    });
    return item;
  });
};

/* ---------- BUBBLE VISUAL ---------- */

function BubbleVisual({
  chartData,
  effectiveLegendValues,
  startingRange,
  endingRange,
}: {
  chartData: ChartData[];
  effectiveLegendValues: LegendValue[];
  startingRange: number;
  endingRange: number;
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
  const apexSeries = useMemo(() => {
    return effectiveLegendValues.map((l) => ({
      name: l.label,
      data: chartData.map((item) => {
        const x = item.name || "";
        const y = Number(item[l.field] || 0);
        // Map bubble size (z) to the value (y)
        const z = Math.abs(y);
        return { x, y, z };
      }),
    }));
  }, [chartData, effectiveLegendValues]);

  const chartOptions: any = useMemo(() => {
    const colors = effectiveLegendValues.map((l) => l.color);

    // Calculate absolute highest value dynamically
    let highestValue = 0;
    chartData.forEach((item) => {
      effectiveLegendValues.forEach((l) => {
        const val = Number(item[l.field]) || 0;
        if (val > highestValue) highestValue = val;
      });
    });

    let computedMax = endingRange;
    if (highestValue >= 100) {
      computedMax = highestValue + 50;
    } else if (highestValue > endingRange) {
      computedMax = highestValue + 20; // safety ceiling for unconfigured bounds
    }

    return {
      chart: {
        type: "bubble" as const,
        height: "100%",
        parentHeightOffset: 0,
        toolbar: { show: false },
      },
      dataLabels: { enabled: false },
      fill: { opacity: 0.8 },
      grid: {
        borderColor: isDarkMode ? "#334155" : "#e5e7eb",
        padding: {
          top: 30,
          right: 20,
          bottom: 20,
          left: 20,
        },
      },
      plotOptions: {
        bubble: {
          minBubbleRadius: 10,
          maxBubbleRadius: 60,
        },
      },
      xaxis: {
        type: "category",
        tickPlacement: "between", // Adds horizontal spacing for category strings
        labels: {
          style: {
            fontSize: "12px",
            colors: isDarkMode ? "#cbd5e1" : "#64748b",
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: startingRange || 0,
        max: (() => {
          const minVal = startingRange || 0;
          const range = computedMax - minVal;
          const rawStep = range / 10 || 1;
          const stepVal = rawStep > 1 ? Math.ceil(rawStep) : rawStep;
          return minVal + stepVal * 10;
        })(),
        tickAmount: 10,
        labels: {
          style: {
            fontSize: "12px",
            colors: isDarkMode ? "#cbd5e1" : "#64748b",
          },
          formatter: (num: number) => {
            if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
            if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
            if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
            return num.toString();
          },
        },
      },
      tooltip: {
        theme: isDarkMode ? "dark" : "light",
      },
      legend: { show: false },
      colors,
    };
  }, [effectiveLegendValues, startingRange, endingRange, chartData]);

  return (
    <div className="w-full relative h-full min-h-[150px]">
      <Chart
        options={chartOptions as any}
        series={apexSeries}
        type="bubble"
        height="100%"
      />
    </div>
  );
}

/* ---------- COMPONENT ---------- */

export default function BubbleChart(props: BaseChartProps) {
  const getTierLegends = (tier: any): LegendValue[] => {
    return (tier?.bauble?.widgets || tier?.widgets || []).map((w: any) => ({
      label: w.legendName || w.label,
      field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
      color: w.color,
    }));
  };

  const parseTierDataWrapper = (
    xAxis: any,
    legends: LegendValue[],
    title: string
  ) => {
    const parsedXAxis = typeof xAxis === "string" ? JSON.parse(xAxis) : xAxis;
    if (!Array.isArray(parsedXAxis) || parsedXAxis.length === 0) {
      return { labels: [], data: { [title]: [] } };
    }

    const headers = parsedXAxis[0];
    const rows = parsedXAxis.slice(1);

    const labels = rows.map((row: any) => row[0]);

    // Accurately map dynamic API data
    const dataList = rows.map((row: any) => {
      const obj: ChartData = { name: row[0] };
      legends.forEach((l) => {
        const colIndex = headers.findIndex(
          (h: string) => h.toLowerCase().trim() === l.label.toLowerCase().trim()
        );
        obj[l.field] = colIndex !== -1 ? Number(row[colIndex]) || 0 : 0;
      });
      return obj;
    });

    return { labels, data: { [title]: dataList } };
  };

  return (
    <BaseChartContainer
      {...props}
      category="BUBBLE"
      excelType="barChart"
      generatorFunc={generateBubbleSampleData}
      getTierLegends={getTierLegends}
      parseTierData={parseTierDataWrapper}
      showLegend={props.showLegend}
      renderChildChart={(tier, childProps) => (
        <BubbleChart
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({ chartData, safeStartingRange, safeEndingRange, effectiveLegendValues }) => (
        <BubbleVisual
          chartData={chartData}
          effectiveLegendValues={effectiveLegendValues}
          startingRange={safeStartingRange}
          endingRange={safeEndingRange}
        />
      )}
    </BaseChartContainer>
  );
}
