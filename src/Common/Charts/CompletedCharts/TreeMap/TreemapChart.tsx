import ReactApexChart from "react-apexcharts";

// Common Imports
import { BaseChartProps, LegendValue } from "../Common/chartTypes";
import BaseChartContainer from "../Common/BaseChartContainer";

// Specific parser
import { parsePieChartData, PieData } from "@/utils/parsePieChartData";

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

const getRandomValue = (min = 15, max = 220) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Generates sample treemap data from legend values.
 */
const generateTreemapSampleData = (
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

/* ---------- COMPONENT ---------- */

export default function TreemapChart(props: BaseChartProps) {
  const {
    legendValues = [],
    xAxis,
  } = props;


  let parsedXAxis = xAxis;
  if (typeof xAxis === "string") {
    try {
      parsedXAxis = JSON.parse(xAxis);
    } catch {
      parsedXAxis = null;
    }
  }

  const isAggregated =
    Array.isArray(parsedXAxis) &&
    parsedXAxis.length > 2 && // Header + At least 2 Data rows
    (props.isProgramBuilder ||
      props.isValueDetectOn ||
      props.isValueDetection);

  // Derive Legends for the Header (Top Right)
  let headerLegends = legendValues;
  if (isAggregated && Array.isArray(parsedXAxis)) {
    const dataRows = parsedXAxis.slice(1);
    headerLegends = dataRows.map((row: any, i: number) => ({
      label: row[0],
      field: String(row[0]).toLowerCase().replace(/\s+/g, ""),
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }

  const getTierLegends = (tier: any): LegendValue[] => {
    const baseLegends = (
      tier?.treeMapChart?.widgets ||
      tier?.widgets ||
      []
    ).map((w: any) => ({
      label: w.legendName || w.label,
      field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
      color: w.color,
    }));

    if (baseLegends.length > 0) return baseLegends;

    let xAxisLocal = tier?.xAxis;
    if (typeof xAxisLocal === "string") {
      try {
        xAxisLocal = JSON.parse(xAxisLocal);
      } catch {
        /* ignore */
      }
    }

    if (
      Array.isArray(xAxisLocal) &&
      xAxisLocal.length > 0 &&
      Array.isArray(xAxisLocal[0])
    ) {
      const header = xAxisLocal[0];
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

  const treemapSampleGenerator = (
    xAxisNames: string[],
    legends: LegendValue[],
  ): any[] => generateTreemapSampleData(xAxisNames, legends);

  return (
    <BaseChartContainer
      {...props}
      category="TREEMAP"
      legendValues={headerLegends} // Inject derived chart labels for top legend
      excelType="pie"
      generatorFunc={treemapSampleGenerator}
      getTierLegends={getTierLegends}
      parseTierData={parseTierDataWrapper}
      renderChildChart={(tier, childProps) => (
        <TreemapChart
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({ chartData, effectiveLegendValues }) => {
        let finalSeries: any[] = [];
        let finalColors: string[] = [];

        if (isAggregated && Array.isArray(parsedXAxis)) {
          const header = parsedXAxis[0] || [];
          const dataRows = parsedXAxis.slice(1);
          const sliceLabels = header.slice(1);

          finalSeries = dataRows.map((row: any) => ({
            name: row[0],
            data: sliceLabels.map((sl: any) => {
              const headerIdx = header.indexOf(sl);
              return {
                x: sl,
                y: headerIdx !== -1 ? Number(row[headerIdx] || 0) : 0,
              };
            }),
          }));

          finalColors = effectiveLegendValues.map((l) => l.color);
        } else {
          const treemapData = (chartData || []) as PieData[];

          finalSeries = [
            {
              data: treemapData.map((d) => ({
                x: d.name,
                y: d.value,
              })),
            },
          ];

          finalColors = treemapData.map(
            (d, i) => d.color || PIE_COLORS[i % PIE_COLORS.length],
          );
        }

        const totalValue = finalSeries.reduce((acc, s) => {
          const rowSum = s.data.reduce((sum: number, d: any) => sum + (Number(d.y) || 0), 0);
          return acc + rowSum;
        }, 0);

        const isEmpty = totalValue === 0;

        if (isEmpty) {
          return (
            <div className="h-full w-full min-h-[200px] flex flex-col justify-between gap-2 p-2 opacity-50 select-none pointer-events-none">
              <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2">
                <div className="col-span-2 row-span-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50">
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/80 rounded-lg  border border-slate-200/50 dark:border-slate-700/50" />
                <div className="bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200/50 dark:border-slate-700/50" />
              </div>
            </div>
          );
        }

        const chartOptions: any = {
          legend: { show: false },
          chart: {
            type: "treemap" as const,
            toolbar: { show: false },
          },
          colors: finalColors,
          plotOptions: {
            treemap: {
              distributed: !isAggregated,
              enableShades: isAggregated,
              shadeIntensity: 0.5,
            },
          },
          stroke: {
            width: isAggregated ? 2 : 0,
            colors: ["#fff"],
          },
          dataLabels: {
            enabled: true,
            style: {
              fontSize: isAggregated ? "12px" : "15px",
              fontWeight: "600",
            },
            formatter: (text: string, op: any) => {
              if (isAggregated) {
                return text + ": " + op.value;
              }
              return [text, op.value];
            },
          },
          states: {
            hover: {
              filter: {
                type: "darken",
                value: 0.1,
              },
            },
          },
          tooltip: {
            theme: "light",
            y: {
              formatter: (val: number) => val.toLocaleString(),
            },
          },
        };

        return (
          <div className="h-full w-full min-h-[150px]">
            {finalSeries.length > 0 && finalSeries[0].data.length > 0 ? (
              <ReactApexChart
                options={chartOptions as any}
                series={finalSeries}
                type="treemap"
                height="100%"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic font-medium">
                No data available. Configure chart steps to see visualization.
              </div>
            )}
          </div>
        );
      }}
    </BaseChartContainer>
  );
}

