/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Parse xAxis data from LINE chart API response
 * Format: [["Jan", 10, 20], ["Feb", 15, 25], ...]
 * All rows are data rows — no header row in the new format.
 * Returns: { labels: ["Jan", "Feb", ...], data: { [sheetName]: [...] } }
 */

export type LineChartData = {
  name: string;
  [key: string]: number | string;
};

export const parseLineChartData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: any[],
  widgetTitle: string,
) => {
  let parsedXAxis: any = xAxis;

  // Parse JSON string if needed
  if (typeof xAxis === "string") {
    try {
      parsedXAxis = JSON.parse(xAxis);
    } catch (error) {
      console.error("Error parsing xAxis JSON:", error);
      parsedXAxis = [];
    }
  }

  // Handle case where API returns { labels: [...] }
  if (
    parsedXAxis &&
    !Array.isArray(parsedXAxis) &&
    typeof parsedXAxis === "object" &&
    "labels" in parsedXAxis
  ) {
    parsedXAxis = parsedXAxis.labels;
  }

  if (!parsedXAxis || !Array.isArray(parsedXAxis) || parsedXAxis.length === 0) {
    return { labels: [], data: {} as { [key: string]: LineChartData[] } };
  }

  // Smart header detection: a header row has legend labels (strings) in data columns,
  // whereas data rows have numbers (0 by default in creation mode).
  const hasHeader =
    parsedXAxis.length > 0 &&
    Array.isArray(parsedXAxis[0]) &&
    parsedXAxis[0].length > 1 &&
    typeof parsedXAxis[0][1] === "string";

  const dataRows = hasHeader ? parsedXAxis.slice(1) : parsedXAxis;

  // Extract labels from the first column of every data row
  const labels = dataRows.map((row: any) => String(row[0] || ""));

  // Transform data: first element is the label, subsequent elements are dataset values
  const chartData: LineChartData[] = dataRows.map((row: any) => {
    const dataPoint: LineChartData = { name: String(row[0] || "") };

    // Map each legend to its corresponding column value
    legendValues.forEach((legend, index) => {
      const columnIndex = index + 1; // values start at index 1
      dataPoint[legend.field] = Number(row[columnIndex]) || 0;
    });

    return dataPoint;
  });

  // Create data object keyed by sheet name (sanitized widget title)
  const sheetName = (widgetTitle || "Sheet")
    .replace(/[:/?*[\]\\]/g, " ")
    .trim()
    .substring(0, 31);

  return { labels, data: { [sheetName]: chartData } };
};
