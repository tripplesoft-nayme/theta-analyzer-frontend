/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CostData {
  phase: string;
  actual: number;
  planned: number;
  budget: number;
}

const initialData: CostData[] = [
  { phase: "Phase 1", actual: 25000, planned: 20000, budget: 15000 },
  { phase: "Phase 2", actual: 20000, planned: 25000, budget: 15000 },
  { phase: "Phase 3", actual: 13000, planned: 17000, budget: 25000 },
  { phase: "Phase 4", actual: 20000, planned: 15000, budget: 20000 },
  { phase: "Phase 5", actual: 15000, planned: 20000, budget: 30000 },
  { phase: "Phase 6", actual: 25000, planned: 20000, budget: 15000 },
  { phase: "Phase 7", actual: 15000, planned: 20000, budget: 30000 },
  { phase: "Phase 8", actual: 15000, planned: 25000, budget: 25000 },
];

export default function ProjectCostChart() {
  const [data] = useState<CostData[]>(initialData);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const calculateTotal = (key: keyof Omit<CostData, "phase">) => {
    return data.reduce((sum, item) => sum + item[key], 0);
  };

  const totalActual = calculateTotal("actual");
  const totalPlanned = calculateTotal("planned");
  const totalBudget = calculateTotal("budget");

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg w-full h-full">
          <p className="text-sm font-semibold text-gray-800">
            {payload[0].payload.phase}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: ${(entry.value / 1000).toFixed(0)}k
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Project Cost</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className="text-sm text-gray-600">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm text-gray-600">Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Budget</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total:</p>
            <p className="text-sm font-semibold">
              <span className="text-cyan-500">
                {(totalActual / 1000).toFixed(0)}k
              </span>
              <span className="text-gray-400 mx-1">,</span>
              <span className="text-orange-500">
                {(totalPlanned / 1000).toFixed(0)}k
              </span>
              <span className="text-gray-400 mx-1">,</span>
              <span className="text-blue-500">
                {(totalBudget / 1000).toFixed(0)}k
              </span>
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            vertical={false}
          />
          <XAxis
            dataKey="phase"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
            label={{ value: "Cost", angle: -90, position: "insideLeft" }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="actual"
            fill="#06b6d4"
            radius={[4, 4, 0, 0]}
            onMouseEnter={() => setHoveredBar("actual")}
            onMouseLeave={() => setHoveredBar(null)}
            opacity={hoveredBar === null || hoveredBar === "actual" ? 1 : 0.5}
          />
          <Bar
            dataKey="planned"
            fill="#f97316"
            radius={[4, 4, 0, 0]}
            onMouseEnter={() => setHoveredBar("planned")}
            onMouseLeave={() => setHoveredBar(null)}
            opacity={hoveredBar === null || hoveredBar === "planned" ? 1 : 0.5}
          />
          <Bar
            dataKey="budget"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            onMouseEnter={() => setHoveredBar("budget")}
            onMouseLeave={() => setHoveredBar(null)}
            opacity={hoveredBar === null || hoveredBar === "budget" ? 1 : 0.5}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
