import { updateDecompositionTreeWithValues } from "./treeDataUpdates";

/**
 * Converts numeric strings to actual numbers for interior data cells.
 * Skips headers (row 0) and labels (col 0).
 */
export const normalizeNumericCells = (rows: any[][]): any[][] => {
  return rows.map((row, rIdx) =>
    row.map((cell, cIdx) => {
      if (rIdx === 0 || cIdx === 0) return cell;
      if (
        typeof cell === "string" &&
        cell.trim() !== "" &&
        !isNaN(Number(cell))
      ) {
        return Number(cell);
      }
      return cell;
    })
  );
};

export interface ProcessedSheetData {
  id: string; // The identifier found in sheet name or suffix
  xAxis: string; // JSON string of data
  yAxis: string; // Empty JSON string
  zAxis: string; // Empty JSON string
  datasettime: string; // ISO string
}

export interface ProcessFileOptions {
  file: File;
  datasetDate: Date;
  resolveId?: (suffix: string) => string;
  existingCharts?: any[]; // For merging tree structures
}

/**
 * Common logic to read an Excel file and format it for project submissions/uploads.
 */
export const processExcelFile = (
  options: ProcessFileOptions
): Promise<ProcessedSheetData[]> => {
  const { file, datasetDate, resolveId, existingCharts } = options;

  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const XLSX = await import("xlsx/dist/xlsx.mini.min.js");
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          reject(new Error("No sheets found in the file."));
          return;
        }

        const payload: ProcessedSheetData[] = [];

        workbook.SheetNames.forEach((sheetName: string) => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
          });

          // 1. Extract ID/Suffix from sheet name (part after the last underscore)
          let idSuffix = sheetName;
          const lastUnderscoreIndex = sheetName.lastIndexOf("_");
          if (lastUnderscoreIndex !== -1) {
            idSuffix = sheetName.substring(lastUnderscoreIndex + 1).trim();
          }

          // 1.1 Robust fallback: If sheet name is likely truncated (31 chars) or ID is short,
          // try to recover the full ID from the filename.
          const fileName = file.name;
          const fileNameIdMatch = fileName.match(/_ID_([A-Za-z0-9_]+)/i);
          if (fileNameIdMatch) {
            const fileNameIds = fileNameIdMatch[1]
              .split("_")
              .filter((id) => id.toLowerCase() !== "more");

            // If there's only one sheet and one ID in filename, it's a direct match
            if (workbook.SheetNames.length === 1 && fileNameIds.length === 1) {
              idSuffix = fileNameIds[0];
            } else {
              // Otherwise, find the filename ID that starts with our (potentially truncated) suffix
              const matchingId = fileNameIds.find((fid) =>
                fid.toLowerCase().startsWith(idSuffix.toLowerCase())
              );
              if (matchingId) idSuffix = matchingId;
            }
          }

          if (!idSuffix) idSuffix = sheetName;

          // Optional resolution (e.g. matching UUIDs in project builder)
          const finalId = resolveId ? resolveId(idSuffix) : idSuffix;
          console.log("finalId", finalId);
          // 2. Filter empty or invalid rows
          const rawRows = jsonData.filter(
            (row) =>
              Array.isArray(row) &&
              row.length > 0 &&
              String(row[0] || "").trim() !== ""
          );

          if (rawRows.length === 0) return;

          // 3. Check for specific chart categories (e.g. DECOMPOSITION_TREE)
          // Tree charts need their nested structure preserved; only values are updated by name/label.
          const existingChart = existingCharts?.find((c) => c.id === finalId);

          if (existingChart?.category === "DECOMPOSITION_TREE") {
            try {
              let treeRoot = existingChart.xAxis;
              if (typeof treeRoot === "string") treeRoot = JSON.parse(treeRoot);

              if (treeRoot) {
                // Create maps for Dual Values from the CSV
                // Row 0 is often a header, but we process labels normally.
                const v1Map = new Map<string, number>();
                const v2Map = new Map<string, number>();
                
                rawRows.forEach((row) => {
                  if (row.length >= 2) {
                    const val1 = Number(row[1]);
                    if (!isNaN(val1)) v1Map.set(String(row[0]), val1);
                    
                    // If a third column (index 2) exists, use it for value2 (Achieved)
                    if (row.length >= 3) {
                      const val2 = Number(row[2]);
                      if (!isNaN(val2)) v2Map.set(String(row[0]), val2);
                    }
                  }
                });

                const updatedTree = updateDecompositionTreeWithValues(treeRoot, v1Map, v2Map);
                
                payload.push({
                  id: finalId,
                  xAxis: JSON.stringify(updatedTree),
                  yAxis: JSON.stringify({}),
                  zAxis: JSON.stringify({}),
                  datasettime: datasetDate.toISOString(),
                });
                return; // Skip standard processing for this sheet
              }
            } catch (err) {
              console.error("Failed to merge tree data", err);
              // Fallback to standard processing if tree merge fails
            }
          }

          // --- Standard Processing (2D Array) ---

          // 4. Header detection logic
          const firstRow = rawRows[0];
          const firstCellStr = String(firstRow[0] || "").trim().toLowerCase();
          const isHeader =
            ["label", "x-axis", "series", "category"].includes(firstCellStr) ||
            firstRow.every((cell: any, idx: number) => {
              if (idx === 0) return true;
              if (
                cell === null ||
                cell === undefined ||
                String(cell).trim() === ""
              )
                return true;
              return typeof cell === "string" && isNaN(Number(cell));
            });

          let finalData: any[][];
          if (isHeader) {
            const normalizedHeader = [...rawRows[0]];
            normalizedHeader[0] = "Label";
            finalData = [normalizedHeader, ...rawRows.slice(1)];
          } else {
            const colCount = Math.max(...rawRows.map((r) => r.length));
            const syntheticHeader = ["Label"];
            for (let i = 1; i < colCount; i++) syntheticHeader.push(`Legend ${i}`);
            finalData = [syntheticHeader, ...rawRows];
          }

          // 5. Normalize numeric strings and stringify
          const processedContent = normalizeNumericCells(finalData);

          payload.push({
            id: finalId,
            xAxis: JSON.stringify(processedContent),
            yAxis: JSON.stringify([]),
            zAxis: JSON.stringify([]),
            datasettime: datasetDate.toISOString(),
          });
        });

        resolve(payload);
      };

      reader.onerror = () => reject(new Error("Error reading file."));
      reader.readAsBinaryString(file);
    } catch (error) {
      reject(error);
    }
  });
};
