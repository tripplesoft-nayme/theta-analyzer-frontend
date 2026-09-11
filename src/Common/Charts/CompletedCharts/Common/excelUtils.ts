/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";
import type { LegendValue } from "./chartTypes";
import { flattenDecompositionTree } from "./chartUtils";

export type ChartExcelType =
  | "barChart"
  | "areaChart"
  | "splineChart"
  | "lineChart"
  | "horizontalBarChart"
  | "heatmap"
  | "pie"
  | "bullet"
  | "sparklineChart"
  | "comboChart"
  | "boxWhisker"
  | "grid";

export const downloadChartDataAsExcel = async (
  _title: string,
  projectId: string,
  getAllTheLeafChart: any,
  widgetTitle: string,
  effectiveXAxisValues: string[],
  effectiveLegendValues: LegendValue[],
  setIsDownloading: (loading: boolean) => void,
  chartType: ChartExcelType = "areaChart",
  chartId?: string,
  categoryTitle?: string,
  initialTemplateData?: any[][],
) => {
  if (!projectId) {
    toast.error("Project ID is missing");
    return;
  }
  setIsDownloading(true);
  try {
    const rawRes = await getAllTheLeafChart(projectId).unwrap();
    const resData = rawRes?.data || rawRes;

    // Unified normalization:
    // 1. If resData is an array where the first item has a 'charts' key, it's grouped (Project Builder).
    // 2. If it's an array without 'charts' keys, it's a flat list of charts (Program Builder flat).
    // 3. If it's an object with a 'charts' key, it's a program object (Program Builder).
    let allGroups: any[] = [];
    if (Array.isArray(resData)) {
      if (resData.length > 0 && resData[0].charts) {
        allGroups = resData;
      } else {
        allGroups = [{ charts: resData }];
      }
    } else if (resData && typeof resData === "object" && resData.charts) {
      allGroups = [{ charts: resData.charts }];
    } else {
      allGroups = [];
    }

    // 1. Find the group that belongs to this root chart.
    // Try matching via ID first (robust)
    let targetGroup = allGroups.find((g: any) =>
      g.charts?.some((c: any) => c.id === chartId || c.parentId === chartId),
    );

    // 2. Fallback: match by the group title if no group found by ID
    if (!targetGroup && _title) {
      targetGroup = allGroups.find((item: any) => item.grouptitle === _title);
    }

    let targets: any[] = [];
    if (targetGroup) {
      const allCharts = targetGroup.charts || [];
      const isLeafChart = allCharts.some((c: any) => c.id === chartId);

      if (isLeafChart) {
        // If a specific leaf chart's ID is requested, download only that leaf chart
        targets = allCharts.filter((c: any) => c.id === chartId);
      } else {
        // If the root chart is being downloaded, download all leaf charts of this group (if any exist)
        targets = allCharts;
      }
    }

    const usedNames = new Set<string>();
    const getUniqueSheetNameInside = (name: string, id: string) => {
      const safeName = (name || "Sheet").replace(/[:/?*[\]\\]/g, " ").trim();
      const idStr = id || "0";
      const fullName = `${safeName}_${idStr}`;

      // Enforce Excel 31 character limit by truncating the name part, NOT the ID/Suffix
      let finalName = fullName;
      if (fullName.length > 31) {
        const idPart = `_${idStr}`;
        const maxNameLen = 31 - idPart.length;
        // Ensure name isn't negative
        const truncatedName = safeName.substring(0, Math.max(0, maxNameLen));
        finalName = truncatedName + idPart;
      }
      let counter = 1;

      while (usedNames.has(finalName.toLowerCase())) {
        const suffix = `_${counter}`;
        const base = fullName.substring(0, 31 - suffix.length);
        finalName = base + suffix;
        counter++;
      }

      usedNames.add(finalName.toLowerCase());
      return finalName;
    };

    // 3. Last Resort Fallback: If still nothing found, download current template
    if (targets.length === 0) {
      const XLSX = await import("xlsx/dist/xlsx.mini.min.js");
      const wb = XLSX.utils.book_new();
      let data: any[][];

      if (initialTemplateData && initialTemplateData.length > 0) {
        data = initialTemplateData;
      } else if (chartType === "grid") {
        // Grid Template: Category | Legend1 | Legend2 ...
        const headers = [
          categoryTitle || "Category",
          ...effectiveLegendValues.map((l) => l.label),
        ];
        const gridRows = effectiveXAxisValues.map((label) => [
          label,
          ...Array(effectiveLegendValues.length).fill(0),
        ]);
        data = [headers, ...gridRows];
      } else if (chartType === "heatmap") {
        const headers = [
          "Label",
          ...effectiveLegendValues.map((l) => l.label || "Legend"),
        ];
        const heatmapRows = effectiveXAxisValues.map((label) => [
          label,
          ...Array(effectiveLegendValues.length).fill(0),
        ]);
        data = [headers, ...heatmapRows];
      } else if (chartType === "boxWhisker") {
        const headers = [
          "Label",
          "min",
          "q1",
          "median",
          "q3",
          "max",
          "outliers",
        ];
        // Sample rows or empty if no data
        const boxRows = effectiveXAxisValues.map((label) => [
          label,
          ...Array(6).fill(0),
        ]);
        data = [headers, ...boxRows];
      } else {
        const headers =
          chartType === "bullet"
            ? ["Metric", "Current", "Target"]
            : ["Label", ...effectiveLegendValues.map((l) => l.label)];
        const rows =
          chartType === "bullet"
            ? effectiveLegendValues.map((l) => [l.label, "", ""])
            : effectiveXAxisValues.map((label) => [
              label,
              ...Array(effectiveLegendValues.length).fill(0),
            ]);
        data = [headers, ...rows];
      }
      const ws = XLSX.utils.aoa_to_sheet(data);

      const sheetName =
        chartId && chartId !== "root"
          ? getUniqueSheetNameInside(widgetTitle, chartId)
          : widgetTitle.substring(0, 31);

      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      const filenameSuffix =
        chartId && chartId !== "root" ? `ID_${chartId}` : "template";
      XLSX.writeFile(wb, `${widgetTitle}_${filenameSuffix}.xlsx`);

      toast.success("Chart data downloaded successfully");
      return;
    }

    const XLSX = await import("xlsx/dist/xlsx.mini.min.js");
    const wb = XLSX.utils.book_new();
    const ids: string[] = [];

    targets.forEach((node: any) => {
      ids.push(node.id);

      let xAxis: string[] = node.xAxisValues || [];
      let rawDataRows: any[][] = [];

      if (node.xAxis) {
        try {
          const parsed =
            typeof node.xAxis === "string"
              ? JSON.parse(node.xAxis)
              : node.xAxis;

          if (parsed && (parsed.value1 !== undefined || parsed.children)) {
            const fullTreeData = flattenDecompositionTree(parsed);
            xAxis = fullTreeData.map((row) => row[0]);
            rawDataRows = fullTreeData;
          } else if (parsed && typeof parsed === "object" && parsed.data && Array.isArray(parsed.data)) {
            // Handle Program Builder wrapper object { data: [], year: ... }
            const dataArr = parsed.data;
            if (dataArr.length > 0 && Array.isArray(dataArr[0])) {
              const hasHeader = dataArr[0].length > 1 && typeof dataArr[0][1] === "string";
              const dataRows = hasHeader ? dataArr.slice(1) : dataArr;
              xAxis = dataRows.map((row: any) => String(row[0] || ""));
              rawDataRows = dataRows;
            } else {
              xAxis = dataArr;
            }
          } else if (Array.isArray(parsed)) {
            if (parsed.length > 0 && Array.isArray(parsed[0])) {
              // Smart header detection
              const hasHeader =
                parsed[0].length > 1 && typeof parsed[0][1] === "string";
              const dataRows = hasHeader ? parsed.slice(1) : parsed;
              xAxis = dataRows.map((row: any) => String(row[0] || ""));
              rawDataRows = dataRows;
            } else {
              xAxis = parsed;
            }
          } else if (parsed && Array.isArray(parsed.points)) {
            // Handle Geographic Map format: { points: [{name, value, lat, lng}, ...] }
            // We export name and value as columns for the Excel sheet
            xAxis = parsed.points.map((p: any) => String(p.name || ""));
            rawDataRows = parsed.points.map((p: any) => [p.name, p.value]);
          } else {
            xAxis = parsed.labels || [];
          }
        } catch {
          // ignore
        }
      }

      // Fallback to current chart's xAxis if node has none
      const xAxisItems = xAxis.length > 0 ? xAxis : effectiveXAxisValues;

      let legends = node.legendValues || [];
      const nodeWidgets =
        node.widgets ||
        node.barChart?.widgets ||
        node.matrixTableChart?.widgets ||
        node[chartType]?.widgets;

      if (!legends.length && nodeWidgets) {
        legends = nodeWidgets.map((w: any) => ({
          label: w.legendName || w.label || "Legend",
          field: (w.legendName || w.label || "field")
            .toLowerCase()
            .replace(/\s+/g, ""),
          color: w.color || "#000000",
        }));
      }

      const finalLegends = legends.length > 0 ? legends : effectiveLegendValues;

      let data: any[][];

      if (chartType === "heatmap") {
        // Structure: Label (x-axis) | LegendName1 | LegendName2 | ...
        // Each row is an x-axis item; each column is a legend (the chart's rows/series)
        const headers = ["Label", ...finalLegends.map((l: any) => l.label || "Legend")];
        const heatmapRows = xAxisItems.map(
          (label: string, rowIndex: number) => {
            const apiRow = rawDataRows[rowIndex] || [];
            return [
              label,
              ...finalLegends.map((_: any, colIndex: number) => {
                const val = apiRow[colIndex + 1];
                return val !== undefined && val !== null ? val : 0;
              }),
            ];
          },
        );
        data = [headers, ...heatmapRows];
      } else if (chartType === "grid") {
        // Matrix Table Style: Headers = [Category, ...Legends], Rows = [xAxisItem, ...Values]
        const headers = [
          categoryTitle || "Category",
          ...finalLegends.map((l: any) => l.label),
        ];
        const gridRows = xAxisItems.map((label: string, rowIndex: number) => {
          const apiRow = rawDataRows[rowIndex] || [];
          return [
            label,
            ...finalLegends.map((_: any, colIndex: number) => {
              const val = apiRow[colIndex + 1];
              return val !== undefined && val !== null ? val : 0;
            }),
          ];
        });
        data = [headers, ...gridRows];
      } else if (
        node.category === "DECOMPOSITION_TREE" ||
        node.category === "DECOM_TREE" ||
        chartType === "bullet"
      ) {
        // Special case for Decomposition tree (3 columns) or Bullet chart (3 columns)
        const isTree = node.category === "DECOMPOSITION_TREE";
        let headers: string[];
        if (isTree) {
          try {
            const parsed =
              typeof node.xAxis === "string"
                ? JSON.parse(node.xAxis)
                : node.xAxis;
            const v1Label = parsed?.value1Label || "Target";
            const v2Label = parsed?.value2Label || "Achieved";
            headers = ["Node Name", v1Label, v2Label];
          } catch {
            headers = ["Node Name", "Target", "Achieved"];
          }
        } else {
          headers = ["Metric", "Current", "Target"];
        }

        const standardRows = isTree
          ? rawDataRows // Already [Name, Parent, Val1, Val2]
          : finalLegends.map((l: any, rowIndex: number) => {
            const apiRow = rawDataRows[rowIndex] || [];
            return [
              l.label,
              apiRow[1] !== undefined ? apiRow[1] : 0,
              apiRow[2] !== undefined ? apiRow[2] : 0,
            ];
          });
        data = [headers, ...standardRows];
      } else if (chartType === "boxWhisker") {
        const headers = [
          "Label",
          "min",
          "q1",
          "median",
          "q3",
          "max",
          "outliers",
        ];
        // rawDataRows already contains [label, min, q1, median, q3, max, outliers, color...]
        // We ensure outliers (index 6) are formatted cleanly for Excel if they are arrays.
        const boxRows = rawDataRows.map((row) => {
          const processedRow = [...row];
          if (Array.isArray(processedRow[6])) {
            processedRow[6] = processedRow[6].join(", ");
          }
          // We take only the first 7 columns to match the standard BoxWhisker format
          return processedRow.slice(0, 7);
        });
        data = [headers, ...boxRows];
      } else {
        // Standard Chart Style: Headers = [Label, ...Legends], Rows = [XAxis, ...Values]
        const headers = ["Label", ...finalLegends.map((l: any) => l.label)];
        const standardRows = xAxisItems.map(
          (label: string, rowIndex: number) => {
            const apiRow = rawDataRows[rowIndex] || [];
            return [
              label,
              ...finalLegends.map((_: any, colIndex: number) => {
                const val = apiRow[colIndex + 1];
                return val !== undefined && val !== null ? val : 0;
              }),
            ];
          },
        );
        data = [headers, ...standardRows];
      }

      const ws = XLSX.utils.aoa_to_sheet(data);
      const sheetName = getUniqueSheetNameInside(
        node.title || node.name || "Tier",
        node.id,
      );
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const idString =
      ids.length > 3 ? `${ids.slice(0, 3).join("_")}_more` : ids.join("_");
    const filename = `${widgetTitle}_ID_${idString}.xlsx`.substring(0, 250);
    XLSX.writeFile(wb, filename);
    toast.success("Excel downloaded successfully");
  } catch (error) {
    console.error("Excel download failed", error);
    toast.error("Failed to download Excel");
  } finally {
    setIsDownloading(false);
  }
};
