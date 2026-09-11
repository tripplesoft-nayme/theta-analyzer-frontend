/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { generateChartData } from "@/utils";
import AddTierModal from "./CompletedCharts/Common/Modal/AddTierModal";
import TierChartModal from "./CompletedCharts/Common/Modal/TierChartModal";
import useChartData from "./useChartData";
import ChartCardWrapper from "./CompletedCharts/Common/ChartCardWrapper";
/*       TYPES       */

export type ChartData = {
  name: string;
  [key: string]: number | string;
};

type LegendValue = {
  label: string;
  field: string;
  color: string;
};

export type TierChart = {
  id?: string;
  name: string;
  xAxisValues: string[];
  legendValues: LegendValue[];
  children: TierChart[];
};

type Props = {
  newData?: any[];
  widgetTitle?: string;
  xAxisValues?: string[];
  legendValues?: LegendValue[];
  numOfLegendDataSet?: number;
  startingRange: number;
  endingRange: number;
  onToggleWidget?: () => void;
  onDelete?: () => void;
  tierLevel?: number;
  chartId?: string;
  isCreationMode?: boolean;
  allUploadedData?: { [key: string]: ChartData[] };
  isPreview?: boolean;
  chartHeight?: number;
};

export default function HorizontalStackedBarChart({
  newData,
  widgetTitle = "Horizontal Stacked Bar",
  xAxisValues = [],
  legendValues = [],
  numOfLegendDataSet = 1,
  startingRange,
  endingRange,
  onToggleWidget,
  onDelete,
  tierLevel = 0,
  chartId,
  isCreationMode = false,
  allUploadedData,
  isPreview = false,
  chartHeight,
}: Props) {
  const [localUploadedData, setLocalUploadedData] = useState<
    { [key: string]: ChartData[] } | undefined
  >(allUploadedData);
  const { childTiers } = useChartData({
    newData,
    isCreationMode,
    chartId,
    xAxisValues,
    legendValues,
    numOfLegendDataSet,
    startingRange,
    endingRange,
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAddTierModal, setShowAddTierModal] = useState(false);
  const [showChildrenModal, setShowChildrenModal] = useState(false);

  /*   CHART DATA   */
  const chartData: ChartData[] = useMemo(() => {
    const sheetName = (widgetTitle || "Sheet")
      .replace(/[:\/?*\[\]\\]/g, " ")
      .trim()
      .substring(0, 31);
    const dataToUse =
      localUploadedData?.[sheetName] || allUploadedData?.[sheetName];

    if (dataToUse && dataToUse.length > 0) {
      return dataToUse;
    }

    if (!xAxisValues.length || !legendValues.length) return [];
    return generateChartData(
      xAxisValues,
      legendValues,
      numOfLegendDataSet,
      startingRange,
      endingRange,
    );
  }, [
    xAxisValues,
    legendValues,
    numOfLegendDataSet,
    startingRange,
    endingRange,
    widgetTitle,
    localUploadedData,
    allUploadedData,
  ]);

  /*   APEX CHART DATA   */
  const { series, categories } = useMemo(() => {
    const categories = chartData.map((d) => d.name);
    const series = legendValues.map((legend) => ({
      name: legend.label,
      data: chartData.map((d) => Number(d[legend.field]) || 0),
    }));

    return { series, categories };
  }, [chartData, legendValues]);

  /*   APEX CHART OPTIONS   */
  const options: any = useMemo(
    () => ({
      chart: {
        type: "bar",
        height: chartHeight || 350,
        width: "100%",
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          dataLabels: {
            total: {
              enabled: true,
              offsetX: 0,
              style: {
                fontSize: "13px",
                fontWeight: 900,
              },
            },
          },
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      title: {
        text: widgetTitle,
        style: {
          fontSize: "18px",
          fontWeight: 600,
        },
      },
      xaxis: {
        categories: categories,
        labels: {
          formatter: function (val: any) {
            return val;
          },
        },
        min: startingRange,
        max: endingRange,
      },
      yaxis: {
        title: {
          text: undefined,
        },
        labels: {
          show: true,
          minWidth: 0,
          maxWidth: 200,
          style: {
            fontSize: "12px",
          },
        },
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val;
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
        offsetX: 40,
      },
      colors: legendValues.map((l) => l.color),
    }),
    [widgetTitle, categories, startingRange, endingRange, legendValues],
  );

  /*   ACTIONS   */

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(chartData, null, 2));
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const XLSX = await import("xlsx/dist/xlsx.mini.min.js");
      const wb = XLSX.utils.book_new();
      const usedNames = new Set<string>();

      const getUniqueSheetName = (name: string) => {
        let baseName = (name || "Sheet").replace(/[:/?*[\]\\]/g, " ").trim();
        // let baseName = (name || "Sheet").replace(/[:\/?*\[\]\\]/g, " ").trim();
        if (baseName.length > 25) baseName = baseName.substring(0, 25);
        if (!baseName) baseName = "Sheet";

        let uniqueName = baseName;
        let counter = 1;
        while (usedNames.has(uniqueName.toLowerCase())) {
          uniqueName = `${baseName}_${counter}`;
          counter++;
        }
        usedNames.add(uniqueName.toLowerCase());
        return uniqueName;
      };

      const processNodeData = (
        name: string,
        xAxis: string[],
        legends: LegendValue[],
      ) => {
        const headers = ["Label", ...legends.map((l) => l.label)];
        const rows = xAxis.map((label) => [label, ...legends.map(() => "")]);
        const data = [headers, ...rows];

        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, getUniqueSheetName(name));
      };

      if (xAxisValues && legendValues) {
        processNodeData(widgetTitle, xAxisValues, legendValues);
      }

      const processChildren = (nodes: any[]) => {
        nodes.forEach((node) => {
          if (node.xAxisValues && node.legendValues) {
            processNodeData(
              node.name || node.taskName,
              node.xAxisValues,
              node.legendValues,
            );
          }

          if (node.children && node.children.length > 0) {
            processChildren(node.children);
          }
        });
      };

      if (childTiers && childTiers.length > 0) {
        processChildren(childTiers);
      }

      XLSX.writeFile(wb, `${widgetTitle}.xlsx`);
      toast.success("Excel downloaded successfully");
    } catch (error) {
      console.error("Excel download failed", error);
      toast.error("Failed to download Excel");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAddTierClick = () => {
    setShowAddTierModal(true);
  };

  const handleChartClick = () => {
    if (childTiers?.length > 0) {
      setShowChildrenModal(true);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import("xlsx/dist/xlsx.mini.min.js");
        const bstr = evt.target?.result as string;
        const wb = XLSX.read(bstr, { type: "binary" });
        const allData: { [key: string]: ChartData[] } = {};

        wb.SheetNames.forEach((sheetName) => {
          const ws = wb.Sheets[sheetName];
          const rawData: any[] = XLSX.utils.sheet_to_json(ws);

          if (rawData.length > 0) {
            const processedData = rawData.map((row: any) => {
              const item: ChartData = { name: row["Label"] || "" };
              legendValues.forEach((l) => {
                if (row[l.label] !== undefined) {
                  item[l.field] = Number(row[l.label]);
                } else if (row[l.field] !== undefined) {
                  item[l.field] = Number(row[l.field]);
                }
              });
              return item;
            });
            allData[sheetName] = processedData;
          }
        });

        setLocalUploadedData(allData);
        toast.success("Data uploaded successfully");
      } catch (err) {
        console.error("Upload failed", err);
        toast.error("Failed to parse Excel file");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <ChartCardWrapper
        title={widgetTitle}
        subtitle="Stacked Distribution"
        tierLevel={tierLevel}
        onHeaderClick={handleChartClick}
        menuActions={{
          onCopy: handleCopy,
          onDownload: handleDownload,
          onDelete: onDelete,
          onAddTier: handleAddTierClick,
          onToggleWidget: onToggleWidget,
        }}
        isDownloading={isDownloading}
        isPreview={isPreview}
        customHeaderContent={
          tierLevel === 0 && (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  document
                    .getElementById(`upload-input-${chartId || widgetTitle}`)
                    ?.click();
                }}
                className="p-1 px-2 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
              >
                <Upload size={14} />
                <span>Upload</span>
              </button>
              <input
                id={`upload-input-${chartId || widgetTitle}`}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
          )
        }
        footer={
          childTiers?.length > 0 ? (
            <p className="text-sm text-blue-600 font-medium">
              Click chart to view {childTiers?.length} child tier
              {childTiers?.length > 1 ? "s" : ""}
            </p>
          ) : undefined
        }
      >
        <div style={{ height: `${chartHeight || 350}px`, width: "100%", minHeight: "350px" }}>
          <ReactApexChart
            options={options as any}
            series={series}
            type="bar"
            height={chartHeight || 350}
            width="100%"
          />
        </div>
      </ChartCardWrapper>

      <AddTierModal
        isOpen={showAddTierModal}
        onClose={() => setShowAddTierModal(false)}
        parentChartName={widgetTitle}
      />

      {showChildrenModal && (
        <TierChartModal
          isOpen={showChildrenModal}
          onClose={() => setShowChildrenModal(false)}
          tierLevel={tierLevel + 1}
          title={widgetTitle}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {childTiers &&
              childTiers?.map((tier: any) => (
                <HorizontalStackedBarChart
                  newData={tier?.children || []}
                  key={tier?.id}
                  widgetTitle={tier?.name || tier?.taskName}
                  xAxisValues={tier?.xAxisValues}
                  legendValues={tier?.legendValues}
                  numOfLegendDataSet={tier?.legendValues?.length}
                  startingRange={startingRange}
                  endingRange={endingRange}
                  tierLevel={tierLevel + 1}
                  chartId={tier?.id}
                  allUploadedData={localUploadedData || allUploadedData}
                  isPreview={isPreview}
                />
              ))}
          </div>
        </TierChartModal>
      )}
    </>
  );
}
