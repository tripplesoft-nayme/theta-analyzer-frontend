import Chart from "react-apexcharts";
import { useMemo, useState, useEffect } from "react";

// Common Imports
import { BaseChartProps, LegendValue, ChartData } from "../Common/chartTypes";
import BaseChartContainer from "../Common/BaseChartContainer";
import { parseCommonChartData } from "../Common/chartUtils";

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

/**
 * Generates a single sample ChartData entry for the gauge (uses the legend label as the field).
 */
const generateGaugeSampleData = (
  _xAxis: string[],
  legends: LegendValue[],
  _numOfLegendDataSet: number,
  start: number,
  end: number,
  seedStr?: string,
): ChartData[] => {
  const seed = simpleHash(seedStr || `gauge-${start}-${end}`);
  const value = deterministicRandom(seed, start, end);
  if (legends.length === 0) return [{ name: "value", value }];
  return [{ name: legends[0].field || "value", value }];
};

/* ---------- GAUGE VISUAL ---------- */

function GaugeVisual({
  legendValues,
  startingRange = 0,
  endingRange = 100,
  isSampleData,
  isValueDetectOn,
  selectedSourceCharts = [],
  chartData = [],
  showLegend = true,
}: {
  legendValues: LegendValue[];
  widgetTitle?: string;
  startingRange?: number;
  endingRange?: number;
  isSampleData: boolean;
  height?: number;
  isValueDetectOn?: boolean;
  selectedSourceCharts?: any[];
  chartData?: ChartData[];
  showLegend?: boolean;
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
  // Logic to determine values (multiple if aggregated, single if not)
  const results = useMemo(() => {
    // 1. Real Data (Production)
    if (!isSampleData) {
      if (chartData && chartData.length > 0) {
        const primaryField = legendValues[0]?.field || legendValues[0]?.label?.toLowerCase().replace(/\s+/g, "") || "field1";
        return chartData.map((row, i) => ({
          value: Number(row[primaryField] ?? row.value) || 0,
          label: row.name || legendValues[0]?.label || `Source ${i + 1}`,
        }));
      }
      return [{ value: 0, label: legendValues[0]?.label || "No Data" }];
    }

    // 2. Sample Data with Aggregation (Creation Mode Preview)
    if (isValueDetectOn && selectedSourceCharts.length > 0) {
      return selectedSourceCharts.map((c, i) => {
        const seedStr = `gauge-aggregated-${c.id}-${i}`;
        const seed = simpleHash(seedStr);
        const val = deterministicRandom(seed, startingRange, endingRange);
        return {
          value: val,
          label: c.projectName || `Source ${i + 1}`,
        };
      });
    }

    // 3. Simple Sample Data
    const seed = simpleHash("gauge-simple-stable");
    const gaugeValue = deterministicRandom(seed, startingRange, endingRange);
    return [{ value: gaugeValue, label: legendValues[0]?.label || "Performance" }];
  }, [isSampleData, isValueDetectOn, selectedSourceCharts, startingRange, endingRange, legendValues, chartData]);

  const series = useMemo(() => {
    return results.map(r => {
      if (endingRange > startingRange) {
        return Math.min(
          100,
          Math.max(0, ((r.value - startingRange) / (endingRange - startingRange)) * 100),
        );
      }
      return 0;
    });
  }, [results, startingRange, endingRange]);

  const mainColor =
    legendValues.length > 0 && legendValues[0].color
      ? legendValues[0].color
      : "#8D79F6";

  const chartOptions: any = useMemo(() => {
    // Generate colors for multiple sources if needed
    const colors = results.length > 1
      ? results.map((_, i) => i === 0 ? mainColor : shadeColor(mainColor, i * -15))
      : [mainColor];

    return {
      chart: {
        type: "gauge" as const,
        height: "100%",
        offsetY: 0,
        sparkline: { enabled: true },
        toolbar: { show: false },
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: isDarkMode ? "#1e293b" : "#e7e7e7",
            strokeWidth: "97%",
            margin: 5,
          },
          dataLabels: {
            name: { show: false },
            value: {
              offsetY: -2,
              fontSize: "32px",
              fontWeight: 600,
              color: isDarkMode ? "#cbd5e1" : undefined,
              formatter: function (val: number) {
                const absVal = Math.round((val / 100) * (endingRange - startingRange) + startingRange);
                return `${absVal}`;
              },
            },
          },
        },
      },
      grid: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          shadeIntensity: 0.4,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 53, 91],
        },
      },
      stroke: {
        lineCap: results.length > 1 ? "round" : "butt",
      },
      colors: colors,
      labels: results.map(r => r.label),
    };
  }, [legendValues, results, startingRange, endingRange]);

  const hasLegend = legendValues.length > 0;

  return (
    <div className="w-full relative h-full flex flex-col items-center justify-center">
      {hasLegend ? (
        <>
          <div className="w-full flex-1 flex items-center justify-center min-h-0 pt-2">
            <Chart
              options={chartOptions as any}
              series={series}
              type="radialBar"
              width="100%"
              height={500}
            />
          </div>

          {/* New Compact Custom Legend */}
          {showLegend && (
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mt-2 pb-3 px-4">
              {results.map((res, i) => {
                const color = results.length > 1
                  ? (i === 0 ? mainColor : shadeColor(mainColor, i * -15))
                  : mainColor;

                return (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex items-baseline gap-1.5 line-height-none">
                      <span className="text-[13px] font-semibold text-gray-600 dark:text-slate-300 whitespace-nowrap">
                        {res.label}:
                      </span>
                      <span className="text-[13px] font-bold text-gray-900 dark:text-slate-100">
                        {res.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="h-[300px] w-full flex items-center justify-center text-gray-400 dark:text-slate-500 font-medium border-2 border-dashed border-border dark:border-slate-800 rounded-xl">
          {isSampleData ? "Configure the gauge to preview" : "No data available."}
        </div>
      )}
    </div>
  );
}

// Utility to shade colors for multiple sources
function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.round((R * (100 + percent)) / 100);
  G = Math.round((G * (100 + percent)) / 100);
  B = Math.round((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  const RR = R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16);
  const GG = G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16);
  const BB = B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
}

/* ---------- COMPONENT ---------- */

export default function GaugeChart(props: BaseChartProps & { isValueDetectOn?: boolean, selectedSourceCharts?: any[] }) {
  const {
    legendValues = [],
    startingRange = 0,
    endingRange = 100,
    widgetTitle = "Performance Gauge",
    isValueDetectOn = false,
    selectedSourceCharts = [],
  } = props;

  const getTierLegends = (tier: any): LegendValue[] => {
    const widgetsList = tier?.solidGaugeChart?.widgets || tier?.widgets || [];
    const baseLegends = widgetsList.map(
      (w: any) => ({
        label: w.legendName || w.label,
        field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
        color: w.color,
      }),
    );
    return baseLegends;
  };

  const parseTierDataWrapper = (xAxis: any, legends: LegendValue[], title: string) => {
    return parseCommonChartData(xAxis, legends, title);
  };

  const sampleGenerator = (
    xAxis: string[],
    legends: LegendValue[],
    numOfLegendDataSet: number,
    start: number,
    end: number,
  ) => generateGaugeSampleData(xAxis, legends, numOfLegendDataSet, start, end);

  return (
    <BaseChartContainer
      {...props}
      category="GAUGE"
      excelType="barChart"
      generatorFunc={sampleGenerator}
      getTierLegends={getTierLegends}
      parseTierData={parseTierDataWrapper}
      showLegend={props.showLegend}
      renderChildChart={(tier, childProps) => (
        <GaugeChart
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({ isSampleData, safeStartingRange, safeEndingRange, effectiveLegendValues, chartData }) => (
        <div className="w-full relative h-full min-h-[150px]">
          <GaugeVisual
            legendValues={
              effectiveLegendValues.length > 0 ? effectiveLegendValues : legendValues
            }
            widgetTitle={widgetTitle}
            startingRange={safeStartingRange ?? startingRange}
            endingRange={safeEndingRange ?? endingRange}
            isSampleData={isSampleData}
            height={props.height}
            isValueDetectOn={isValueDetectOn}
            selectedSourceCharts={selectedSourceCharts}
            chartData={chartData}
            showLegend={props.showLegend}
          />
        </div>
      )}
    </BaseChartContainer>
  );
}
