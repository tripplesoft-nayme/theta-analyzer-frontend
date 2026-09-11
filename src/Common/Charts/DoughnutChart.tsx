/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ChartData {
  name: string;
  value: number;
  count: number;
  color: string;
  [key: string]: string | number;
}

interface DoughnutChartProps {
  title: string;
  data: ChartData[];
  centerLabel: string;
  onDelete?: () => void;
  onCopy?: (data: any) => void;
  allUploadedData?: any;
  chartHeight?: number;
}

export default function DoughnutChart({
  title,
  data,
  centerLabel,
  onDelete,
  // onCopy,
  allUploadedData,
  chartHeight,
}: DoughnutChartProps) {
  const chartData = useMemo(() => {
    if (allUploadedData) {
      const sheetName = (title || "Sheet")
        .replace(/[:/?*[\\]\\\\]/g, " ")
        .trim()
        .substring(0, 31);
      return allUploadedData?.[sheetName] ?? data;
    }
    return data;
  }, [allUploadedData, title, data]);
  // const handleCopy = () => {
  //   if (onCopy) {
  //     onCopy(chartData);
  //   } else {
  //     navigator.clipboard.writeText(JSON.stringify(chartData));
  //     // toast could be added here if imported
  //   }
  // };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    } else {
      console.log("Delete action");
    }
  };

  const total = chartData.reduce(
    (sum: number, item: ChartData) => sum + Number(item.value),
    0,
  );

  return (
    <Card className="w-full h-full bg-white dark:bg-slate-900 p-6 border border-gray-200 dark:border-slate-800">
      {/* Header with title and actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{title}</h2>
        <div className="flex gap-2">
          {/* <button
            onClick={handleCopy}
            className="p-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            aria-label="Copy chart data"
          >
            <Copy size={18} className="text-gray-600 dark:text-slate-400" />
          </button> */}
          <button
            onClick={handleDelete}
            className="p-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            aria-label="Delete chart"
          >
            <Trash2 size={18} className="text-gray-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 mb-8">
        {chartData.map((item: ChartData) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{item.name}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {item.value}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Doughnut Chart with Center Content */}
      <div className="flex justify-center items-center relative">
        <ResponsiveContainer width="100%" height={chartHeight || 350}>
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={130}
              fill="#8884d8"
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry: ChartData, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, props) => {
                const item = props.payload;
                return [`${item.name} ${item.count} ${value}%`, ""];
              }}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                padding: "8px 12px",
              }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{centerLabel}</p>
          <p className="text-4xl font-bold text-gray-900 dark:text-slate-100">{total}</p>
        </div>
      </div>
    </Card>
  );
}
