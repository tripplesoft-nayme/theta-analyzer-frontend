import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ApexColumnChartProps {
  onDelete?: () => void;
  title?: string;
}

const ApexColumnChart = ({ onDelete, title = "Project Timeline" }: ApexColumnChartProps = {}) => {
  const categories = [
    "Project Name",
    "Project Name",
    "Project Name",
    "Project Name",
    "Project Name",
    "Project Name",
    "Project Name",
    "Project Name",
    "Project Name",
    "Project Name",
  ];

  const completionData = [30, 60, 58, 149, 98, 118, 200, 152, 78, 120];
  const savedData = [16, 0, 0, 7, 98, 0, 0, 44, 78, 0];
  const overdueData = [0, 16, 58, 0, 0, 118, 36, 0, 0, 0];

  const [data] = useState(() =>
    categories.map((cat, index) => ({
      name: `${cat} ${index + 1}`,
      displayName: cat,
      completion: completionData[index],
      saved: savedData[index],
      overdue: overdueData[index],
    }))
  );

  return (
    <Card className="w-full h-full bg-white dark:bg-slate-900 p-6 border border-gray-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{title}</h2>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            aria-label="Delete chart"
          >
            <Trash2 size={18} className="text-gray-600 dark:text-slate-400" />
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8D79F6]" />
          <span>Completion Time</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#169E7B]" />
          <span>Saved Time</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DA4352]" />
          <span>Overdue Time</span>
        </div>
      </div>

      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="completionTimeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8D79F6" stopOpacity={1} />
                <stop offset="100%" stopColor="#B09FFF" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-slate-100 dark:stroke-slate-800"
            />
            <XAxis
              dataKey="name"
              tickFormatter={() => "Project Name"}
              tick={{ fontSize: 13, fill: "currentColor" }}
              className="text-slate-500"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 13, fill: "currentColor" }}
              className="text-slate-500"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(val: number) => [`${val} units`, "Time"]}
              contentStyle={{
                borderRadius: "6px",
                fontSize: "13px",
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "none",
                color: "#FFF",
              }}
              itemStyle={{ color: "#FFF" }}
              labelStyle={{ color: "#94A3B8" }}
            />
            <Bar
              dataKey="completion"
              name="Completion Time"
              stackId="a"
              fill="url(#completionTimeGrad)"
              barSize={20}
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="saved"
              name="Saved Time"
              stackId="a"
              fill="#169E7B"
              barSize={20}
            />
            <Bar
              dataKey="overdue"
              name="Overdue Time"
              stackId="a"
              fill="#DA4352"
              barSize={20}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ApexColumnChart;

