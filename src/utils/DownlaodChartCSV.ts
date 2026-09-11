/* eslint-disable @typescript-eslint/no-explicit-any */

// Helper to download the Blob
const downloadCsvFile = (csv: string, fileName: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};

/* -------------------------------------------------------------------------- */
/*                                MODULE ONE                                  */
/* -------------------------------------------------------------------------- */
// Used for: Stacked Bar, Line, Area, etc.
// Structure: X-Axis column + One column per Legend
// Currently generates a Template (structure only)

const buildCsvTemplateModuleOne = (xAxisValues: any[], legendValues: any[]) => {
  // Headers: "X-Axis", "Legend 1", "Legend 2", ...

  console.log(legendValues, "legendValues");
  const header = ["", ...legendValues.map((l: any) => l.label)].join(",");
    console.log(header, "header");
  // Rows: "Label", empty, empty, ...
  const rows = xAxisValues.map(
    (label: any) => `${label}${",".repeat(legendValues.length)}`
  );
    console.log(rows, "rows");
  return [header, ...rows].join("\n");
};

export const downloadCSVForModuleOne = (
  widgetTitle: string,
  xAxisValues: any[],
  legendValues: any[]
) => {
  try {
    const csvTemplate = buildCsvTemplateModuleOne(xAxisValues, legendValues);
    console.log(csvTemplate, "csvTemplate");
    downloadCsvFile(csvTemplate, `${widgetTitle}_template.csv`);
  } catch (error) {
    console.error("Module One CSV download failed:", error);
    alert("Failed to download CSV");
  }
};

/* -------------------------------------------------------------------------- */
/*                                MODULE TWO                                  */
/* -------------------------------------------------------------------------- */
// Used for: Pie, Funnel, Spline Area, Scatter, etc.
// Structure: "Legend,Value"

/* -------------------------------------------------------------------------- */
/*                                MODULE TWO                                  */
/* -------------------------------------------------------------------------- */
// Used for: Pie, Funnel, Spline Area, Scatter, etc.
// Structure: "Legend,Value"
// Generates a Template (empty values)

const buildCsvTemplateModuleTwo = (legendValues: any[]) => {
  const header = ["Legend", "Value"].join(",");

  const rows = legendValues
    .filter((l) => l?.label || typeof l === "string")
    .map((l) => {
      const label = l?.label || l;
      // Empty value for template
      return `${label},`;
    });

  return [header, ...rows].join("\n");
};

export const downloadCSVForModuleTwo = (
  widgetTitle: string,
  legendValues: any[]
) => {
  try {
    const csvTemplate = buildCsvTemplateModuleTwo(legendValues);
    downloadCsvFile(csvTemplate, `${widgetTitle}_template.csv`);
  } catch (error) {
    console.error("Module Two CSV download failed:", error);
    alert("Failed to download CSV");
  }
};
