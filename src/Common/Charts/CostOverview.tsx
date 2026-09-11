import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CostData {
  name: string;
  value: number;
}

const initialData: CostData[] = [
  { name: "Feb-24 C...", value: 280 },
  { name: "Curr. Cost.", value: 250 },
  { name: "Diff...", value: 225 },
  { name: "A.C.V", value: 180 },
  { name: "O.A.V", value: 155 },
  { name: "Pending", value: 125 },
  { name: "C.F.C", value: 75 },
  { name: "O.A.V", value: 155 },
  { name: "Pending", value: 125 },
  { name: "Diff...", value: 225 },
  { name: "Feb-24 C...", value: 280 },
  { name: "Curr. Cost.", value: 250 },
  { name: "C.F.C", value: 75 },
  { name: "O.A.V", value: 155 },
  { name: "Curr. Cost.", value: 250 },
  { name: "Feb-24 C...", value: 280 },
  { name: "C.F.C", value: 75 },
  { name: "A.C.V", value: 180 },
  { name: "C.F.C", value: 75 },
  { name: "Diff...", value: 225 },
];

export default function CostOverview() {
  const [data] = useState<CostData[]>(initialData);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full h-full overflow-x-auto">
      <div className="h-full bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Cost Overview</h2>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
              formatter={(value) => `${value}k`}
              cursor={{ fill: "rgba(167, 139, 250, 0.1)" }}
            />
            <Bar
              dataKey="value"
              fill="#a78bfa"
              radius={[8, 8, 0, 0]}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {data.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    hoveredIndex === null || hoveredIndex === index
                      ? "#a78bfa"
                      : "#d8b4fe"
                  }
                  opacity={
                    hoveredIndex === null || hoveredIndex === index ? 1 : 0.5
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
