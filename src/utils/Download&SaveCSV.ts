/* eslint-disable @typescript-eslint/no-explicit-any */
const buildCsvTemplate = (xAxisValues: any, legendValues: any) => {
  const header = ["Label", ...legendValues.map((l: any) => l.label)].join(",");

  const rows = xAxisValues.map(
    (label: any) => `${label}${",".repeat(legendValues.length)}`
  );

  return [header, ...rows].join("\n");
};
const downloadCsvFile = (csv: string, fileName: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};
export const DownloadAndSaveCSVforModuleOneWidget = async (
  payload: any,
  getChartTitleId: any,
  widgetTitle: string,
  legendValues: any,
  xAxisValues: any
) => {
  // Attempt to create/get an ID from the backend, but always proceed
  // to generate and download the CSV even if the backend call fails
  let uniqueId: string | undefined;
  try {
    const result = await getChartTitleId(payload).unwrap();
    uniqueId = result?.data?.id;
  } catch (err) {
    console.warn("Could not get widget id from server, continuing without id:", err);
  }

  try {
    const csvTemplate = buildCsvTemplate(legendValues, xAxisValues);
    const fileName = uniqueId ? `${widgetTitle}_${uniqueId}.csv` : `${widgetTitle}.csv`;
    downloadCsvFile(csvTemplate, fileName);
  } catch (error) {
    console.error("Download failed", error);
    alert("Failed to download CSV");
  }
}

const buildCsvTemplateForModuleTwo = (legendValues: any[]) => {
  const header = ["Legend","Value"].join(",");

  const rows = legendValues
    .filter((l) => l?.label)
    .map((l) => l.label);

  return [header, ...rows].join("\n");
};


export const DownloadAndSaveCSVforModuleTwoWidget = async (
  payload: any,
  getChartTitleId: any,
  widgetTitle: string,
  legendValues: any[]
) => {
  // Try to get an ID but still download even if server doesn't return one
  let uniqueId: string | undefined;
  try {
    const result = await getChartTitleId(payload).unwrap();
    uniqueId = result?.data?.id;
  } catch (err) {
    console.warn("Module Two: could not get widget id, continuing without id:", err);
  }

  try {
    const csvTemplate = buildCsvTemplateForModuleTwo(legendValues);
    const fileName = uniqueId ? `${widgetTitle}_${uniqueId}.csv` : `${widgetTitle}.csv`;
    downloadCsvFile(csvTemplate, fileName);
  } catch (error) {
    console.error("Module Two CSV download failed:", error);
    alert("Failed to download CSV");
  }
};
