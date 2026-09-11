/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChartData, LegendValue } from "./chartTypes";

export const DEFAULT_LEGEND_VALUES: LegendValue[] = [
  { label: "Project A", field: "field1", color: "#13A490" },
  { label: "Project B", field: "field2", color: "#35B6EE" },
  { label: "Project C", field: "field3", color: "#6F78F9" },
];

export const DEFAULT_X_AXIS_VALUES = ["Jan", "Feb", "Mar", "Apr", "May"];

/**
 * Returns effective legend values, falling back to samples if invalid.
 */
export const getEffectiveLegendValues = (
  legendValues: LegendValue[],
  defaultLegends = DEFAULT_LEGEND_VALUES,
) => {
  const validLegends = legendValues?.filter(
    (l) => l.label && typeof l.label === "string" && l.label.trim() !== "",
  );

  if (validLegends && validLegends.length > 0) {
    const usedFields = new Set<string>();
    return validLegends.map((l, index) => {
      let field = l.field || l.label.toLowerCase().replace(/\s+/g, "");
      // Ensure uniqueness to avoid data collisions (e.g. "Project A" vs "Project a")
      if (usedFields.has(field)) {
        field = `${field}_${index}`;
      }
      usedFields.add(field);
      return {
        ...l,
        field,
      };
    });
  }
  return defaultLegends;
};

/**
 * Returns effective X-Axis values, falling back to samples if invalid.
 */
export const getEffectiveXAxisValues = (
  xAxisValues: string[],
  defaultValues: any = DEFAULT_X_AXIS_VALUES,
) => {
  const validValues = xAxisValues?.filter(
    (v) => v && typeof v === "string" && v.trim() !== "",
  );
  if (validValues && validValues.length > 0) {
    return validValues;
  }
  // Ensure defaultValues is an array to prevent crash
  const fallback = Array.isArray(defaultValues)
    ? defaultValues
    : DEFAULT_X_AXIS_VALUES;
  return fallback;
};

/**
 * Standardizes the starting and ending ranges.
 */
export const getSafeRanges = (
  startingRange: number | string | undefined | null,
  endingRange: number | string | undefined | null,
  defaultEnd = 100,
) => {
  const hasExplicitStart =
    startingRange !== undefined &&
    startingRange !== null &&
    String(startingRange).trim() !== "";

  let start = hasExplicitStart ? Number(startingRange) : undefined;
  if (start !== undefined && isNaN(start)) {
    start = undefined;
  }

  let end =
    endingRange !== undefined && endingRange !== null && String(endingRange).trim() !== ""
      ? Number(endingRange)
      : defaultEnd;
  if (isNaN(end)) {
    end = defaultEnd;
  }

  if (start !== undefined && start === end) {
    start = 0;
    end = defaultEnd;
  }

  return { safeStartingRange: start, safeEndingRange: end };
};

/**
 * Sanitizes the widget title to create a valid Excel sheet name.
 */
export const sanitizeSheetName = (
  title: string,
  maxLength = 31,
  defaultName = "Sheet",
) => {
  const safeName = (title || defaultName).replace(/[:/?*[\]\\]/g, " ").trim();
  return safeName.length > maxLength
    ? safeName.substring(0, maxLength)
    : safeName;
};

/**
 * Checks if a row is a header row.
 * A header row has all columns from index 1 onward as non-numeric strings
 * (i.e. legend names like "Site 1", "Site 2") rather than numeric data values.
 */
const isXAxisHeaderRow = (row: any[]): boolean => {
  if (!Array.isArray(row) || row.length < 2) return false;
  const dataCols = row.slice(1);
  return dataCols.every(
    (v) => typeof v === "string" && v.trim() !== "" && isNaN(Number(v)),
  );
};

/**
 * Parse xAxis 2D array format from API.
 * Format:
 *   Row 0 (header): ["Chart Title" | "Labels", "Legend 1", "Legend 2", ...]
 *   Row 1+  (data):  ["Jan", 10, 20, ...]  ← numeric values
 */
export const parseCommonChartData = (
  xAxis: any[][] | string | { labels: any[][] },
  legendValues: LegendValue[],
  widgetTitle: string,
) => {
  let parsedXAxis: any = xAxis;

  if (typeof xAxis === "string") {
    try {
      parsedXAxis = JSON.parse(xAxis);
    } catch {
      parsedXAxis = [];
    }
  }

  // Normalize to raw array (direct or nested in {labels: [...]})
  const rawData =
    parsedXAxis && !Array.isArray(parsedXAxis) && parsedXAxis.labels
      ? parsedXAxis.labels
      : parsedXAxis;

  if (!Array.isArray(rawData) || rawData.length === 0) {
    return { labels: [], data: {} as { [key: string]: ChartData[] } };
  }

  // Row 0 is ALWAYS the header (chart name / "Labels" / legend names).
  // Skip it unconditionally, then also drop any remaining blank rows.
  // We limit to 15 rows maximum for performance and readability.
  const filteredRows = rawData.slice(1).filter((row: any) => {
    if (!Array.isArray(row) || row.length === 0) return false;
    const firstCol = String(row[0] || "").trim();
    // Keep row if first col has text, OR if any other col has a numeric value
    return (
      firstCol !== "" ||
      row
        .slice(1)
        .some((val: any) => !isNaN(Number(val)) && val !== null && val !== "")
    );
  });

  const effectiveLegends = getEffectiveLegendValues(legendValues);

  const labels = filteredRows.map((row: any) => String(row[0] || ""));

  const chartData: ChartData[] = filteredRows.map((row: any) => {
    const dataPoint: ChartData = { name: String(row[0] || "") };
    effectiveLegends.forEach((legend, index) => {
      const columnIndex = index + 1;
      dataPoint[legend.field] = Number(row[columnIndex]) || 0;
    });
    return dataPoint;
  });

  const sheetName = sanitizeSheetName(widgetTitle);
  const categoryTitle =
    rawData.length > 0 && Array.isArray(rawData[0])
      ? String(rawData[0][0] || "Category")
      : "Category";

  return { labels, data: { [sheetName]: chartData }, categoryTitle };
};

/**
 * Generate random data for Heatmap (similar to generateChartData)
 */
export const generateHeatmapChartData = (
  xAxisValues: string[],
  legendValues: LegendValue[],
  _numOfLegendDataSet: number,
  startingRange: number,
  endingRange: number,
): ChartData[] => {
  return xAxisValues.map((xName) => {
    const item: any = { name: xName };
    legendValues.forEach((leg) => {
      const min = startingRange || 0;
      const max = endingRange || 100;
      item[leg.field] = Math.floor(Math.random() * (max - min + 1)) + min;
    });
    return item;
  });
};

/**
 * Tries to extract legend values from an unparsed xAxis JSON string or Array,
 * mainly used for finding implicit labels when no widgets exist.
 * Works with both "Label"/"Labels" headers and descriptive headers (like chart names).
 */
export const extractLegendsFromXAxis = (xAxisRaw: any): string[] => {
  try {
    const parsed =
      typeof xAxisRaw === "string" ? JSON.parse(xAxisRaw) : xAxisRaw;
    const dataArr = Array.isArray(parsed) ? parsed : parsed?.labels || [];

    if (dataArr.length === 0) return [];

    // DETECT BULLET CHART: If headers are ["Metric", "Current", "Target"] or similar
    if (
      Array.isArray(dataArr[0]) &&
      dataArr[0].length >= 3 &&
      ["current", "target"].includes(String(dataArr[0][1] || "").toLowerCase())
    ) {
      // Metrics are in the first column of each row (skipping Row 0)
      return dataArr
        .slice(1)
        .map((row: any) => String(row[0] || "").trim())
        .filter((lbl: any) => lbl !== "");
    }

    // Standard chart (Pie/Bar/etc.): Row 0 has legend headers
    if (
      Array.isArray(dataArr[0]) &&
      dataArr[0].length > 1 &&
      (typeof dataArr[0][1] === "string" || isXAxisHeaderRow(dataArr[0]))
    ) {
      return dataArr[0].slice(1).map((lbl: any) => String(lbl));
    }
  } catch {
    // ignore
  }
  return [];
};

/**
 * Centralized logic to resolve chart data between uploaded data, configured samples, or default samples.
 */
export const resolveChartData = (
  allUploadedData: any,
  parsedLabels: string[],
  effectiveXAxisValues: string[],
  effectiveLegendValues: LegendValue[],
  _safeStartingRange: number | undefined,
  _safeEndingRange: number,
  numOfLegendDataSet: number,
  widgetTitle: string,
  generatorFunc: (
    xAxis: string[],
    legends: LegendValue[],
    numOfLegendDataSet: number,
    start: number,
    end: number,
  ) => ChartData[],
) => {
  // Use sanitizeSheetName directly — calling parseCommonChartData([], ...) would
  // return an empty object, making Object.keys()[0] === undefined, which means
  // allUploadedData lookup would always fail.
  const sheetName = sanitizeSheetName(widgetTitle);
  let dataToUse = allUploadedData?.[sheetName];

  // Fallback: If allUploadedData is already the data array (bypass keyed lookup)
  if (
    !dataToUse &&
    Array.isArray(allUploadedData) &&
    allUploadedData.length > 0
  ) {
    dataToUse = allUploadedData;
  }

  // Priority 1: Real Uploaded Data
  const hasUploadedData = Array.isArray(dataToUse) && dataToUse.length > 0;

  if (hasUploadedData) {
    return { chartData: dataToUse as ChartData[], isSampleData: false };
  }

  // Priority 2: Sample Data based on Configuration
  const hasConfig =
    parsedLabels.length > 0 &&
    parsedLabels.some((v) => v !== "") &&
    effectiveLegendValues.length > 0;

  if (hasConfig) {
    return {
      chartData: generatorFunc(
        parsedLabels.filter(
          (v) => v && typeof v === "string" && v.trim() !== "",
        ),
        effectiveLegendValues,
        numOfLegendDataSet,
        0,
        100,
      ),
      isSampleData: true,
    };
  }

  // Priority 3: Default Sample Data
  return {
    chartData: generatorFunc(
      effectiveXAxisValues,
      effectiveLegendValues,
      numOfLegendDataSet,
      0,
      100,
    ),
    isSampleData: true,
  };
};
/**
 * Generate random sample data for Bullet charts.
 */
export const generateBulletChartData = (
  legends: LegendValue[],
  startingRange: number,
  endingRange: number,
): { [key: string]: [number, number] } => {
  const range = (endingRange || 100) - (startingRange || 0);
  const result: { [key: string]: [number, number] } = {};
  legends.forEach((l) => {
    if (l.label) {
      const current =
        (startingRange || 0) + Math.floor(Math.random() * range * 0.7);
      const target =
        (startingRange || 0) + Math.floor(Math.random() * range * 0.9);
      result[l.label] = [current, target];
    }
  });
  return result;
};

/**
 * Parses a 2D array (xAxis) for Bullet Chart metrics.
 * Structure: Column 0 = Metric Name, Column 1 = Current Value, Column 2 = Target Value.
 * Returns a mapping: { "Metric Name": [current, target] }
 */
export const parseBulletChartData = (
  xAxis: any[][] | string,
  legendValues: LegendValue[],
): { [key: string]: [number, number] } => {
  let raw: any[][] = [];
  try {
    raw = typeof xAxis === "string" ? JSON.parse(xAxis) : xAxis;
  } catch {
    return {};
  }

  if (!Array.isArray(raw) || raw.length < 2) return {};

  const result: { [key: string]: [number, number] } = {};

  // Detect if Row 0 contains "Current" or "Target" keywords
  const header = raw[0].map((h: any) => String(h || "").toLowerCase());
  const isRowBased = header.includes("current") || header.includes("target");

  if (isRowBased) {
    // Case 1: Row-based handling:
    // Column 0 = Metric Name, Column 1 = Current, Column 2 = Target
    raw.slice(1).forEach((row) => {
      if (Array.isArray(row) && row.length >= 2) {
        const metricName = String(row[0] || "").trim();
        const currentIdx =
          header.indexOf("current") !== -1 ? header.indexOf("current") : 1;
        const targetIdx =
          header.indexOf("target") !== -1 ? header.indexOf("target") : 2;

        const current = Number(row[currentIdx]) || 0;
        const target = Number(row[targetIdx]) || 0;

        if (metricName) {
          result[metricName] = [current, target];
        }
      }
    });
  } else {
    // Case 2: Column-based handling (Standard chart format):
    // Row 0 = ["Label", "Metric 1", "Metric 2", ...]
    // Row 1 = ["Current", val1, val2, ...]
    // Row 2 = ["Target", val1, val2, ...] (optional)

    // We can also use legendValues to identify the metrics if headers are empty
    const metrics = raw[0].slice(1).map((m: any) => String(m || "").trim());
    const currentRow =
      raw.find(
        (r) =>
          Array.isArray(r) &&
          String(r[0] || "")
            .toLowerCase()
            .includes("current"),
      ) || raw[1];
    const targetRow = raw.find(
      (r) =>
        Array.isArray(r) &&
        String(r[0] || "")
          .toLowerCase()
          .includes("target"),
    );

    metrics.forEach((metricName, idx) => {
      if (!metricName) {
        // Fallback to legend label if header column is empty
        metricName = legendValues[idx]?.label || `Metric ${idx + 1}`;
      }

      const current = currentRow ? Number(currentRow[idx + 1]) || 0 : 0;
      const target = targetRow ? Number(targetRow[idx + 1]) || 0 : 0;

      result[metricName] = [current, target];
    });

    // Special fallback for empty headers but many columns in Row 1
    if (metrics.length === 0 && currentRow && currentRow.length > 1) {
      currentRow.slice(1).forEach((val, idx) => {
        const l = legendValues[idx];
        const name = l?.label || `Metric ${idx + 1}`;
        const current = Number(val) || 0;
        const target = targetRow ? Number(targetRow[idx + 1]) || 0 : 0;
        result[name] = [current, target];
      });
    }
  }

  return result;
};

/**
 * Simple geocoding lookup for common countries.
 */
const COUNTRY_COORDS: Record<string, [number, number]> = {
  USA: [37.0902, -95.7129],
  Canada: [56.1304, -106.3468],
  UK: [55.3781, -3.436],
  "United Kingdom": [55.3781, -3.436],
  France: [46.2276, 2.2137],
  Germany: [51.1657, 10.4515],
  China: [35.8617, 104.1954],
  Japan: [36.2048, 138.2529],
  India: [20.5937, 78.9629],
  Brazil: [-14.235, -51.9253],
  Australia: [-25.2744, 133.7751],
  Mexico: [23.6345, -102.5528],
  Italy: [41.8719, 12.5674],
  Spain: [40.4637, -3.7492],
  Russia: [61.524, 105.3188],
  "South Africa": [-30.5595, 22.9375],
  Nigeria: [9.082, 8.6753],
  Egypt: [26.8206, 30.8025],
  Turkey: [38.9637, 35.2433],
  Argentina: [-38.4161, -63.6167],
  Colombia: [4.5709, -74.2973],
  Indonesia: [-0.7893, 113.9213],
  Pakistan: [30.3753, 69.3451],
  Bangladesh: [23.685, 90.3563],
  Vietnam: [14.0583, 108.2772],
  Thailand: [15.87, 100.9925],
  Netherlands: [52.1326, 5.2913],
  Switzerland: [46.8182, 8.2275],
  Sweden: [60.1282, 18.6435],
  Norway: [60.472, 8.4689],
};

/**
 * Parses geographic map data from various formats.
 * 1. Old format: JSON in xAxis/yAxis `{ points: [...], overlayType: '...' }`
 * 2. New format: 2D table in xAxis `[["Country", "Value"], ["USA", 100]]`
 *    and map settings at the root of the object.
 */
export const parseGeographicMapData = (item: any) => {
  let points: any[] = [];
  let overlayType: "bubble" | "choropleth" = "bubble";
  const center: [number, number] = [
    Number(item.lati) || 20,
    Number(item.lng) || 0,
  ];
  const zoom = Number(item.zoom || item.firstFieldDataset || 2);

  // Parse root-level overlay
  if (item.overlay) {
    overlayType =
      String(item.overlay).toLowerCase() === "choropleth"
        ? "choropleth"
        : "bubble";
  }

  try {
    const xAxisParsed =
      typeof item.xAxis === "string" ? JSON.parse(item.xAxis) : item.xAxis;
    const yAxisParsed =
      typeof item.yAxis === "string" ? JSON.parse(item.yAxis) : item.yAxis;

    // Case 1: Standardized points format in xAxis
    if (xAxisParsed?.points) {
      points = xAxisParsed.points;
      if (yAxisParsed?.overlayType) {
        overlayType = yAxisParsed.overlayType;
      }
      // Program Builder fallback (where yAxis is excluded)
      if (xAxisParsed?.overlayType) {
        overlayType = xAxisParsed.overlayType;
      }
    }
    // Case 2: 2D table format in xAxis
    else if (Array.isArray(xAxisParsed) && xAxisParsed.length > 1) {
      const dataRows = xAxisParsed.slice(1);
      points = dataRows.map((row: any, idx: number) => {
        const name = String(row[0] || "Unknown");
        const value = Number(row[1]) || 0;
        const coords = COUNTRY_COORDS[name] || [0, 0];

        // Find legend color from widgets if available
        let color = "#3B82F6";
        if (item.widgets && item.widgets[0]) {
          color = item.widgets[0].color || color;
        }

        return {
          id: String(idx + 1),
          name,
          lat: coords[0],
          lng: coords[1],
          value,
          color,
        };
      });
    }
  } catch (err) {
    console.error("Error parsing geographic data:", err);
  }

  return { points, overlayType, center, zoom };
};

/**
 * Flattens a Decomposition Tree hierarchy into a 2D array of leaf nodes.
 * Used for Excel templates when representing the tree as a flat table of metrics.
 */
export const flattenDecompositionTree = (node: any): any[][] => {
  if (!node) return [];
  // Important: if it's the 2D array format already, just skip
  if (Array.isArray(node)) return [];

  const children = Array.isArray(node.children) ? node.children : [];

  if (children.length === 0) {
    // Return only LEAF nodes (no children)
    return [
      [node.name || "Unnamed", node.value1 ?? 0, node.value2 ?? 0],
    ];
  }

  // Recurse into children and skip the current parent node entirely
  return children.flatMap((c: any) => flattenDecompositionTree(c));
};

/**
 * Calculates a nice, round step size for partitioning a range into exactly 10 segments.
 */
export const getNiceStep = (rawStep: number): number => {
  if (rawStep <= 0.1) return 0.1;
  if (rawStep <= 0.2) return 0.2;
  if (rawStep <= 0.5) return 0.5;
  if (rawStep <= 1) return 1;
  if (rawStep <= 2) return 2;
  if (rawStep <= 5) return 5;
  if (rawStep <= 10) return 10;

  const power = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / power;

  let roundedNormalized = 10;
  if (normalized <= 1.2) roundedNormalized = 1;
  else if (normalized <= 1.5) roundedNormalized = 1.5;
  else if (normalized <= 2) roundedNormalized = 2;
  else if (normalized <= 2.5) roundedNormalized = 2.5;
  else if (normalized <= 3) roundedNormalized = 3;
  else if (normalized <= 4) roundedNormalized = 4;
  else if (normalized <= 5) roundedNormalized = 5;
  else if (normalized <= 6) roundedNormalized = 6;
  else if (normalized <= 8) roundedNormalized = 8;

  return roundedNormalized * power;
};
