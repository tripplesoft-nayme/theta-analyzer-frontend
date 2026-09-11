import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Copy, Trash2 } from "lucide-react";

interface TaskData {
  name: string;
  value: number;
  count: number;
  color: string;
  [key: string]: string | number;
}

interface ProgressRingProps {
  title?: string;
  centerLabel?: string;
  data?: TaskData[];
}

const COLORS = {
  notStarted: "#6366f1",
  inProgress: "#f97316",
  completed: "#14b8a6",
};

export default function ProgressRing({
  title = "Task Status",
  // centerLabel = "Total Tasks",
  data: initialData,
}: ProgressRingProps) {
  const [data, setData] = useState<TaskData[]>(
    initialData || [
      { name: "Not Started", value: 65, count: 38, color: COLORS.notStarted },
      { name: "In Progress", value: 21, count: 12, color: COLORS.inProgress },
      { name: "Completed", value: 14, count: 8, color: COLORS.completed },
    ],
  );

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // const totalTasks = data.reduce((sum, item) => sum + item.count, 0);

  const handleCopy = () => {
    const text = data
      .map((item) => `${item.name}: ${item.value}% (${item.count} tasks)`)
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  const handleReset = () => {
    setData([
      { name: "Not Started", value: 65, count: 38, color: COLORS.notStarted },
      { name: "In Progress", value: 21, count: 12, color: COLORS.inProgress },
      { name: "Completed", value: 14, count: 8, color: COLORS.completed },
    ]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">{data.count} tasks</p>
          <p className="text-sm font-bold text-gray-800">{data.value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 w-full h-full ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy data"
          >
            <Copy size={18} className="text-gray-600" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset chart"
          >
            <Trash2 size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mb-6 justify-center">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-sm font-medium text-gray-700">
              {item.name} <span className="font-bold">{item.value}%</span>
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={
                    hoveredIndex === null || hoveredIndex === index ? 1 : 0.6
                  }
                  style={{ transition: "opacity 0.2s ease" }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        {/* <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-sm font-medium text-gray-600">{centerLabel}</p>
          <p className="text-3xl font-bold text-gray-800">{totalTasks}</p>
        </div> */}
      </div>

      {/* Hover Info */}
      {/* {hoveredIndex !== null && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 ">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: data[hoveredIndex].color }}
            ></div>
            <span className="text-sm font-medium text-gray-700">
              {data[hoveredIndex].name}
            </span>
            <span className="text-sm font-bold text-gray-800">
              {data[hoveredIndex].count} ({data[hoveredIndex].value}%)
            </span>
          </div>
        </div>
      )} */}
    </div>
  );
}
