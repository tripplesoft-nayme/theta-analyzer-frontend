/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseChartContainer from "../Common/BaseChartContainer";
import { BaseChartProps, LegendValue, ChartData } from "../Common/chartTypes";
import {
  parseCommonChartData,
  extractLegendsFromXAxis,
} from "../Common/chartUtils";

/**
 * Generator for Matrix Table sample data.
 */
const generateMatrixSampleData = (
  xAxis: string[],
  legends: LegendValue[],
  _numSets: number,
  start: number,
  end: number,
): ChartData[] => {
  return xAxis.map((xValue) => {
    const obs: ChartData = { name: xValue };
    legends.forEach((legend) => {
      obs[legend.field] = Math.floor(Math.random() * (end - start + 1)) + start;
    });
    return obs;
  });
};

/**
 * Extract legends for Matrix Table tiers.
 */
const getMatrixTierLegends = (tier: {
  matrixTableChart?: {
    widgets?: { legendName?: string; label?: string; color?: string }[];
  };
  widgets?: { legendName?: string; label?: string; color?: string }[];
  xAxis?: string | any[][];
  chartData?: { xAxis?: string | any[][] };
}): LegendValue[] => {
  const matrixConfig = tier?.matrixTableChart || tier;
  const widgets = matrixConfig?.widgets || tier?.widgets || [];

  if (widgets && widgets.length > 0) {
    return widgets.map((w) => ({
      label: w.legendName || w.label || "Legend",
      field: (w.legendName || w.label || "Legend")
        .toLowerCase()
        .replace(/\s+/g, ""),
      color: w.color || "#3B93A5",
    }));
  }

  const extracted = extractLegendsFromXAxis(
    tier.xAxis || tier.chartData?.xAxis,
  );
  if (extracted.length > 0) {
    return extracted.map((label: string, idx: number) => ({
      label,
      field: label.toLowerCase().replace(/\s+/g, ""),
      color: ["#3B93A5", "#F7B844", "#ADD8C7", "#13A490"][idx % 4],
    }));
  }

  return [];
};

export default function MatrixTableChart(props: BaseChartProps) {
  return (
    <BaseChartContainer
      {...props}
      category="MATRIXTABLE"
      excelType="grid"
      generatorFunc={generateMatrixSampleData}
      getTierLegends={getMatrixTierLegends}
      parseTierData={parseCommonChartData}
      showLegend={false} // Legend is built into the table
      renderChildChart={(tier: { id: string }, childProps: BaseChartProps) => (
        <MatrixTableChart {...childProps} key={tier.id} />
      )}
    >
      {({
        chartData,
        effectiveLegendValues,
        categoryTitle,
        safeStartingRange,
        safeEndingRange,
      }) => {
        if (!chartData.length || !effectiveLegendValues.length) {
          return (
            <div className="h-[300px] flex items-center justify-center text-gray-400 dark:text-slate-300 font-medium border-2 border-dashed border-border dark:border-slate-800 rounded-2xl">
              No data available. Please configure rows and columns.
            </div>
          );
        }

        return (
          <MatrixTableRenderer
            chartData={chartData}
            effectiveLegendValues={effectiveLegendValues}
            categoryTitle={categoryTitle}
            safeStartingRange={safeStartingRange}
            safeEndingRange={safeEndingRange}
          />
        );
      }}
    </BaseChartContainer>
  );
}

const MatrixTableRenderer = ({
  chartData,
  effectiveLegendValues,
  categoryTitle,
  safeStartingRange,
  safeEndingRange,
}: {
  chartData: ChartData[];
  effectiveLegendValues: LegendValue[];
  categoryTitle?: string;
  safeStartingRange: number;
  safeEndingRange: number;
}) => {
  /*   OPACITY SCALE   */
  const getOpacity = (value: number) => {
    if (safeEndingRange === safeStartingRange) return 1;
    const normalized =
      (value - safeStartingRange) / (safeEndingRange - safeStartingRange);
    const clamped = Math.max(0, Math.min(1, normalized));
    return 0.2 + clamped * 0.8;
  };

  /*   CELL COLOR FUNCTION   */
  const cellColorFunction = (value: number | string, legendColor: string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    const opacity = getOpacity(numValue);
    const primaryColor = legendColor || "#3B93A5";

    const hex = primaryColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div className="overflow-x-auto my-2">
      <div className="border border-border dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left text-gray-500 dark:text-slate-400 border-collapse table-fixed">
          {/* Table fixed to allow controlled column widths */}
          <thead className="text-[11px] text-gray-400 dark:text-slate-300 uppercase bg-gray-50/50 dark:bg-slate-900">
            <tr>
              {/* First column: Sticky and width-optimized */}
              <th
                className="px-3 py-3 border-b border-r border-border dark:border-slate-800 bg-gray-50 dark:bg-slate-900 sticky left-0 z-10 truncate dark:text-slate-300"
                style={{ width: "200px", minWidth: "200px" }}
                title={categoryTitle || "Category"}
              >
                {categoryTitle || "Category"}
              </th>
              {effectiveLegendValues.map((legend, i) => (
                <th
                  key={i}
                  className="px-4 py-3 border-r border-border dark:border-slate-800 last:border-r-0 text-center font-bold tracking-wider truncate"
                  style={{ color: legend.color }}
                  title={legend.label}
                >
                  {legend.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chartData.map((dataPoint, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-border dark:border-slate-800 last:border-0"
              >
                <td
                  className="px-3 py-3 font-semibold text-gray-700 dark:text-slate-300 border-r border-border dark:border-slate-800 bg-gray-50 dark:bg-slate-900 sticky left-0 z-10 truncate"
                  style={{ width: "200px", minWidth: "200px" }}
                  title={dataPoint.name}
                >
                  {dataPoint.name}
                </td>
                {effectiveLegendValues.map((legend, colIndex) => {
                  const cellValue = Number(dataPoint[legend.field]) || 0;
                  return (
                    <td
                      key={colIndex}
                      className="px-2 py-3 border-r border-border dark:border-slate-800 last:border-r-0 text-center font-medium transition-all duration-200"
                      style={{
                        backgroundColor: cellColorFunction(
                          cellValue,
                          legend.color,
                        ),
                        color: getOpacity(cellValue) > 0.6 ? "#fff" : "inherit",
                      }}
                    >
                      {cellValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
