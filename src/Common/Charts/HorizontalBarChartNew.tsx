import { LegendValue } from "@/Common/Charts/CompletedCharts/Common/WidgetsConfiguration/WidgetForChartModuleOne";
import ChartCardWrapper from "./CompletedCharts/Common/ChartCardWrapper";

type Props = {
  widgetTitle?: string;
  legendValues?: LegendValue[];
  startingRange?: number;
  endingRange?: number;
  onDelete?: () => void;
  isPreview?: boolean;
};

const generateId = () =>
  crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 10);

export default function HorizontalBarChartNew({
  widgetTitle = "My CSV",
  legendValues = [],
  startingRange,
  endingRange,
  onDelete,
  isPreview,
}: Props) {
  const isAllLegendFieldEmpty = legendValues.filter((l) => l.field !== "");

  // Placeholder value for visual width
  const MAX_VALUE = 100;

  const data = legendValues
    .filter((l) => l.label)
    .map((l) => ({
      label: l.label,
      value: Math.floor(Math.random() * MAX_VALUE),
      color: l.color,
    }));

  const totalUsage = data.reduce((sum, d) => sum + d.value, 0);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  // CSV export (widget rule)
  const handleExportCSV = () => {
    const id = generateId();

    const header = "Label,Value";
    const rows = legendValues.map((l) => `${l.label},`);
    const csv = [header, ...rows].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${widgetTitle}-${id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ChartCardWrapper
      title={widgetTitle}
      menuActions={{
        onCopy: handleCopy,
        onDownload: handleExportCSV,
        onDelete: onDelete,
      }}
      isPreview={isPreview}
    >
      {/* Legend + Total */}
      <div className="flex justify-between mb-6 text-sm xl:text-lg">
        <div className="flex items-center gap-3">
          {data.map((item, i) => (
            <div className="flex items-center gap-2" key={i}>
              <div
                className={`w-3 h-3 rounded-full `}
                style={{
                  backgroundColor: item.color,
                }}
              />
              <span className=" text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
        {totalUsage !== 0 && (
          <div className=" text-gray-600">
            Total usage <span className="font-semibold">{totalUsage}</span>k
          </div>
        )}
      </div>

      {/* Bars */}
      <div className="space-y-4 mt-10">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-20 text-right text-sm text-gray-600">
              {item.label}
            </div>

            <div className="flex-1 flex items-center gap-3 h-10 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-500"
                style={{
                  width: `${item.value}%`,
                  backgroundColor: item.color,
                }}
              />
              <div className="w-10 text-sm font-medium">{item.value}k</div>
            </div>
          </div>
        ))}

        {isAllLegendFieldEmpty.length !== 0 ? (
          <div className=" ml-24 flex justify-between">
            <div className="text-sm text-gray-500 flex flex-col items-center justify-center">
              <div className="">.</div>
              <div className="">{startingRange && startingRange}</div>
            </div>
            <div className="text-sm text-gray-500 flex flex-col items-center justify-center">
              <div className="">.</div>
              <div className="">
                {endingRange && startingRange && startingRange !== 0
                  ? Math.floor(
                    (endingRange - startingRange) / 2 + startingRange,
                  )
                  : endingRange && Math.floor(endingRange / 2)}
              </div>
            </div>
            <div className="text-sm text-gray-500 flex flex-col items-center justify-center">
              <div className="">.</div>
              <div className="">{endingRange && endingRange}</div>
            </div>
          </div>
        ) : (
          <div className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400">
            No data selected. Please input legend value for visual.
          </div>
        )}
      </div>
    </ChartCardWrapper>
  );
}
