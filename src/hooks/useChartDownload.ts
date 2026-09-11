import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useLazyGetAllTheLeafChartQuery, useLazyGetProgramBuilderChartQuery } from "@/store/Api/ChartApi/ChartApi";

interface UseChartDownloadProps {
  projectId?: string;
  targetProgramId?: string;
  projectName?: string;
  programName?: string;
}

export const useChartDownload = ({
  projectId,
  targetProgramId,
  projectName,
  programName,
}: UseChartDownloadProps) => {
  const location = useLocation();
  const [getAllTheLeafChart] = useLazyGetAllTheLeafChartQuery();
  const [getProgramBuilderChartsLazy] = useLazyGetProgramBuilderChartQuery();

  const handleDownloadCharts = async () => {
    const isProgram =
      (location.pathname.includes("/program-builder") ||
        location.pathname.includes("/program-details") ||
        location.pathname.includes("/program-overview")) &&
      !location.pathname.includes("/project-details") &&
      !location.pathname.includes("/project-builder") &&
      !location.pathname.includes("/project-review");
    const activeId = isProgram ? targetProgramId : projectId;

    if (!activeId) {
      toast.error(`${isProgram ? "Program" : "Project"} ID is missing`);
      return;
    }

    const toastId = toast.loading("Downloading data...");
    try {
      let allCharts: any[] = [];
      if (isProgram) {
        const res = await getProgramBuilderChartsLazy(activeId as string).unwrap();
        const apiData = res?.data?.charts || res?.data || [];
        // Filter out value detect charts and ensure xAxis exists
        allCharts = apiData.filter((c: any) => {
          const chartData = c.chartData || c;
          return !c.valueDetection && !chartData?.isValueDetectOn && c.xAxis;
        });
      } else {
        const res = await getAllTheLeafChart(activeId as string).unwrap();
        const groups = res?.data || [];
        // Flatten charts from all groups
        allCharts = groups.flatMap((group: any) => group.charts || []);
      }

      if (allCharts.length === 0) {
        toast.error("No valid data found to download", { id: toastId });
        return;
      }

      const XLSX = await import("xlsx/dist/xlsx.mini.min.js");
      const wb = XLSX.utils.book_new();
      const ids: string[] = [];
      const usedNames = new Set<string>();

      const getUniqueSheetName = (name: string, id: string) => {
        let baseName = (name || "Sheet").replace(/[:/?*[\]\\]/g, " ").trim();
        const idSuffix = id ? `_${id.slice(-8)}` : "";
        if (baseName.length + idSuffix.length > 31)
          baseName = baseName.substring(0, 31 - idSuffix.length);
        const combinedName = baseName + idSuffix;
        let uniqueName = combinedName;
        let counter = 1;
        while (usedNames.has(uniqueName.toLowerCase())) {
          const suffix = `_${counter}`;
          uniqueName =
            combinedName.substring(
              0,
              Math.min(combinedName.length, 31 - suffix.length),
            ) + suffix;
          counter++;
        }
        usedNames.add(uniqueName.toLowerCase());
        return uniqueName;
      };

      allCharts.forEach((node: any) => {
        ids.push(node.id);
        let currentAOA: any[][] = [];

        // 1. Normalize xAxis data
        let xAxis = node.xAxis;
        if (typeof xAxis === "string") {
          try {
            xAxis = JSON.parse(xAxis);
          } catch {
            /* ignore */
          }
        }

        const rawData =
          xAxis && !Array.isArray(xAxis) && xAxis.labels ? xAxis.labels : xAxis;

        // 2. Extract Data Structure
        const isTree =
          rawData &&
          !Array.isArray(rawData) &&
          (rawData.children ||
            rawData.value1 !== undefined ||
            node.category === "DECOMPOSITION_TREE");

        if (isTree) {
          const v1Label = rawData.value1Label || "Target";
          const v2Label = rawData.value2Label || "Achieved";
          const headers = ["Node Name", v1Label, v2Label];

          const flattenFullTree = (tNode: any): any[][] => {
            if (!tNode) return [];
            const currentRow = [
              tNode.name || "Unnamed",
              tNode.value1 ?? 0,
              tNode.value2 ?? 0,
            ];
            const children = tNode.children || [];
            const childrenRows = children.flatMap((c: any) => flattenFullTree(c));
            return [currentRow, ...childrenRows];
          };

          currentAOA = [headers, ...flattenFullTree(rawData)];
        } else if (Array.isArray(rawData) && rawData.length > 0) {
          if (Array.isArray(rawData[0])) {
            const isHeader = rawData[0].every((item: any) => typeof item === "string");
            const headerRow = isHeader ? [...rawData[0]] : [];
            if (isHeader) {
              headerRow[0] = "Label";
            } else {
              const legends = (
                node.widgets ||
                node.barChart?.widgets ||
                node.splineChart?.widgets ||
                node.areaChart?.widgets ||
                node.multiAxisChart?.widgets ||
                []
              ).map((w: any) => w.legendName || "Legend");
              headerRow.push(
                "Label",
                ...(legends.length > 0
                  ? legends
                  : Array(rawData[0].length - 1).fill("Legend")),
              );
            }

            const dataRows = isHeader ? rawData.slice(1) : rawData;
            const rows = dataRows.map((row: any[]) =>
              row.map((cell: any, cIdx: number) => {
                if (cIdx === 0) return cell;
                return cell !== undefined && cell !== null ? cell : 0;
              }),
            );

            currentAOA = [headerRow, ...rows];
          } else {
            const isHeader = typeof rawData[0] === "string" && isNaN(Number(rawData[0]));
            const legends = (
              node.widgets ||
              node.barChart?.widgets ||
              node.splineChart?.widgets ||
              node.areaChart?.widgets ||
              node.multiAxisChart?.widgets ||
              []
            ).map((w: any) => w.legendName || "Legend");
            if (legends.length === 0) legends.push("Value");

            const headers = ["Label", ...legends];
            const dataLabels = isHeader ? rawData.slice(1) : rawData;

            const rows = dataLabels
              .filter((lbl: any) => String(lbl || "").trim() !== "")
              .map((lbl: any) => [String(lbl || ""), ...legends.map(() => 0)]);

            currentAOA = [headers, ...rows];
          }
        } else {
          const nodeWidgets =
            node.widgets ||
            node.barChart?.widgets ||
            node.splineChart?.widgets ||
            node.areaChart?.widgets ||
            [];
          const legends = nodeWidgets.map((w: any) => w.legendName || "Legend");
          if (legends.length > 0) {
            const headers = ["Label", ...legends];
            currentAOA = [headers, ["Sample Entry", ...legends.map(() => 0)]];
          }
        }

        if (currentAOA.length > 0) {
          const ws = XLSX.utils.aoa_to_sheet(currentAOA);
          XLSX.utils.book_append_sheet(
            wb,
            ws,
            getUniqueSheetName(node.title || node.name || "Tier", node.id),
          );
        }
      });

      if (wb.SheetNames.length === 0) {
        toast.error("No valid chart structure found to generate Excel", { id: toastId });
        return;
      }

      XLSX.writeFile(
        wb,
        `${isProgram ? (programName || "Program") : (projectName || "Project")}.xlsx`,
      );
      toast.success("Excel downloaded successfully", { id: toastId });
    } catch (error) {
      console.error("Excel download failed", error);
      toast.error("Failed to download Excel", { id: toastId });
    } finally {
      toast.dismiss(toastId);
    }
  };

  return { handleDownloadCharts };
};
