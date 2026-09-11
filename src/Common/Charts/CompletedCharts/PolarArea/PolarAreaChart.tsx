import Chart from "react-apexcharts";
import BaseChartContainer from "../Common/BaseChartContainer";
import { BaseChartProps, LegendValue } from "../Common/chartTypes";
import { getEffectiveLegendValues } from "../Common/chartUtils";
import { parsePieChartData, PieData } from "@/utils/parsePieChartData";

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

const generatePolarAreaSampleData = (
  _xAxis: string[],
  legends: LegendValue[],
  start: number = 0,
  end: number = 100,
): any[] => {
  const range = Math.max(1, end - start);
  return legends
    .filter((l) => l.label)
    .map((l, i) => ({
      name: l.label,
      value: Math.floor(Math.random() * range) + start,
      color: l.color || PIE_COLORS[i % PIE_COLORS.length],
    }));
};

const resolvePolarAreaData = (
  allUploadedData: any,
  xAxisRaw: any,
  legendValues: LegendValue[],
  widgetTitle: string,
  start: number = 0,
  end: number = 100,
): { polarData: PieData[] } => {
  if (allUploadedData) {
    if (Array.isArray(allUploadedData) && allUploadedData.length > 0) {
      return { polarData: allUploadedData as PieData[] };
    }

    const safeName = (widgetTitle || "Sheet")
      .replace(/[:/?*[\]\\]/g, " ")
      .trim()
      .substring(0, 31);
    const keyed = allUploadedData[safeName];
    if (Array.isArray(keyed) && keyed.length > 0) {
      return { polarData: keyed as PieData[] };
    }

    if (xAxisRaw) {
      const parsed = parsePieChartData(xAxisRaw, legendValues);
      if (parsed.length > 0) {
        return { polarData: parsed };
      }
    }
  }

  const effectiveLegends = getEffectiveLegendValues(legendValues);
  if (effectiveLegends.some((l) => l.label)) {
    return {
      polarData: generatePolarAreaSampleData([], effectiveLegends, start, end),
    };
  }

  return {
    polarData: generatePolarAreaSampleData(
      [],
      [
        { label: "Category A", field: "categorya", color: PIE_COLORS[0] },
        { label: "Category B", field: "categoryb", color: PIE_COLORS[1] },
        { label: "Category C", field: "categoryc", color: PIE_COLORS[2] },
      ],
      start,
      end,
    ),
  };
};

export default function PolarAreaChart(props: BaseChartProps) {
  const {
    legendValues = [],
    xAxisValues = [], // this is the 'xAxis' prop from BaseChartProps
    allUploadedData,
    widgetTitle = "Chart",
  } = props;

  const getTierLegends = (tier: any): LegendValue[] => {
    const baseLegends = (
      tier?.polarAreaChart?.widgets ||
      tier?.widgets ||
      []
    ).map((w: any) => ({
      label: w.legendName || w.label,
      field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
      color: w.color,
    }));
    if (baseLegends.length > 0) return baseLegends;
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

  const polarAreaSampleGenerator = (
    _xAxis: string[],
    legends: LegendValue[],
    _num: number,
    start: number,
    end: number,
  ): any[] => generatePolarAreaSampleData(_xAxis, legends, start, end);

  return (
    <BaseChartContainer
      {...props}
      category="POLAR_AREA"
      excelType="pie"
      generatorFunc={polarAreaSampleGenerator as any}
      getTierLegends={getTierLegends}
      parseTierData={parseTierDataWrapper as any}
      renderChildChart={(tier, childProps) => (
        <PolarAreaChart
          {...childProps}
          key={tier.id}
          preFetchedChildren={tier.children}
        />
      )}
    >
      {({ safeStartingRange, safeEndingRange }) => {
        const { polarData } = resolvePolarAreaData(
          allUploadedData,
          xAxisValues,
          legendValues,
          widgetTitle,
          safeStartingRange,
          safeEndingRange,
        );

        const series = polarData.map((d) => d.value);
        const labels = polarData.map((d) => d.name);
        const colors = polarData.map((d) => d.color);

        // Auto-expand the ceiling: if any value exceeds lastFieldDataset,
        // keep adding 100 until the ceiling is >= the max data value.
        const maxDataValue = series.length > 0 ? Math.max(...series) : 0;
        let effectiveEndingRange = safeEndingRange;
        while (effectiveEndingRange < maxDataValue) {
          effectiveEndingRange += 120;
        }

        const options = {
          chart: {
            type: "polarArea" as const,
            toolbar: { show: false },
          },
          stroke: {
            show: true,
            width: 2,
            colors: ["transparent"],
          },
          fill: {
            opacity: 0.85,
          },
          labels: labels,
          colors: colors,
          yaxis: {
            min: safeStartingRange || 0,
            max: (() => {
              const minVal = safeStartingRange || 0;
              const range = effectiveEndingRange - minVal;
              const rawStep = range / 10 || 1;
              const stepVal = rawStep > 1 ? Math.ceil(rawStep) : rawStep;
              return minVal + stepVal * 10;
            })(),
            tickAmount: 10,
            labels: {
              show: true,
              style: { fontSize: "10px", colors: "#9ca3af" },
              formatter: (val: number) => Math.round(val).toString(),
            },
          },
          plotOptions: {
            polarArea: {
              rings: { strokeWidth: 1, strokeColor: "#9ca3af" },
              spokes: { strokeWidth: 1, connectorColors: "#9ca3af" },
            },
          },
          legend: {
            show: true,
            position: "bottom" as const,
            horizontalAlign: "center" as const,
            fontSize: "11px",
            itemMargin: { horizontal: 10, vertical: 4 },
            labels: {
              colors: "#9ca3af",
            },
            formatter: function (val: string, opts: any) {
              return val + ": " + opts.w.globals.series[opts.seriesIndex];
            },
          },
          dataLabels: {
            enabled: false,
          },
          tooltip: {
            y: {
              formatter: (val: number) => val.toString(),
            },
          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                legend: {
                  position: "bottom",
                  horizontalAlign: "center",
                  fontSize: "10px",
                },
              },
            },
          ],
        };

        return (
          <div className="w-full h-full min-h-0 flex flex-col">
            {series.length > 0 ? (
              <Chart
                options={options as any}
                series={series}
                type="polarArea"
                height="100%"
                width="100%"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                <span className="text-2xl">📊</span>
                <p className="text-sm font-medium">No data available</p>
              </div>
            )}
          </div>
        );
      }}
    </BaseChartContainer>
  );
}
