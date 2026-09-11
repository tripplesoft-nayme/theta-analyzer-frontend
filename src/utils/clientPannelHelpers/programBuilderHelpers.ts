/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChartData, LegendValue } from "@/Common/Charts/CompletedCharts/Common/chartTypes";

export const handleDownloadCSV = (csvTemplate: string, widgetTitle: string) => {
  const blob = new Blob([csvTemplate], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${widgetTitle}-template.csv`;
  link.click();

  URL.revokeObjectURL(url);
};

const getRandomValue = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// generating stacked bar chart random data
export const generateChartData = (
  xAxis: string[],
  legend: LegendValue[],
  numOfLegendDataSet: number,
  min: number,
  max: number,
): ChartData[] => {
  return xAxis.map((label) => {
    const item: ChartData = { name: label };

    legend.forEach((l) => {
      const r = Math.floor(getRandomValue(min, max) / numOfLegendDataSet);

      item[l.field] = r;
    });

    return item;
  });
};

export const generateLineChartData = (
  xAxis: string[],
  legend: LegendValue[],
  _numOfLegendDataSet: number,
  min = 0,
  max = 100,
) => {
  return xAxis.map((label) => {
    const row: any = { name: label };

    legend.forEach((l) => {
      row[l.field] = Math.floor(Math.random() * (max - min + 1) + min);
    });

    return row;
  });
};

export const generateAreaChartData = (
  xAxis: string[],
  legend: LegendValue[],
  _numOfLegendDataSet: number,
  min = 0,
  max = 100,
): ChartData[] => {
  return xAxis.map((label) => {
    const row: ChartData = { name: label };

    legend.forEach((l) => {
      row[l.field] = Math.floor(Math.random() * (max - min + 1) + min);
    });

    return row;
  });
};

export const generateSampleBarChartData = (
  xAxis: string[],
  legend: LegendValue[],
  _numOfLegendDataSet: number,
  min: number,
  max: number,
): ChartData[] => {
  const staticData: Record<string, Record<string, number>> = {
    Jan: { projecta: 30, projectb: 31, projectc: 12 },
    Feb: { projecta: 3, projectb: 10, projectc: 22 },
    Mar: { projecta: 32, projectb: 30, projectc: 29 },
    Apr: { projecta: 0, projectb: 20, projectc: 17 },
    May: { projecta: 20, projectb: 31, projectc: 11 },
  };

  // Scale the static sample values from [0, 32] dynamically to [min, max] range
  const scaleValue = (val: number) => {
    const originalMax = 32;
    const fraction = val / originalMax;
    return Math.floor(fraction * (max - min) + min);
  };

  return xAxis.map((label) => {
    const item: ChartData = { name: label };
    const monthData = staticData[label];

    legend.forEach((l) => {
      const field = l.field?.toLowerCase() || l.label?.toLowerCase().replace(/\s+/g, "");
      if (monthData && monthData[field] !== undefined) {
        item[field] = scaleValue(monthData[field]);
      } else {
        item[field] = Math.floor(Math.random() * (max - min + 1)) + min;
      }
    });

    return item;
  });
};


