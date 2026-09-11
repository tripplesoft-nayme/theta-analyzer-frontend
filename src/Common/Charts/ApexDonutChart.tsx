import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import DropdownSelect from "@/Common/DropdownSelect";

export interface ProjectStatus {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface ProjectStatusData {
  totalProjects: number;
  statuses: ProjectStatus[];
}

const chartData = {
  totalProjects: 520,
  statuses: [
    {
      name: "In Progress",
      value: 338,
      percentage: 65,
      color: "#8B5CF6",
    },
    {
      name: "Completed",
      value: 73,
      percentage: 14,
      color: "#10B981",
    },
    {
      name: "Overdue",
      value: 68,
      percentage: 13,
      color: "#EF4444",
    },
    {
      name: "Not Started",
      value: 41,
      percentage: 8,
      color: "#9CA3AF",
    },
  ],
};

const ApexDonutChart = () => {
  const data = chartData.statuses;
  const [sortBy, setSortBy] = useState("");

  const dropdownItem = [
    { value: "this-week", title: "This Week" },
    { value: "this-month", title: "This Month" },
    { value: "this-quarter", title: "This Quarter" },
    { value: "this-year", title: "This Year" },
  ];

  const handleChange = (e: string) => {
    setSortBy(e);
    console.log(sortBy);
  };

  return (
    <Card className="w-full border-[#E2E8F0] shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 mb-7">
        <h4 className="font-semibold">Project Status</h4>
        <DropdownSelect
          placeholderText="Sort By"
          dropdownItem={dropdownItem}
          onChange={handleChange}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {data.map((status, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                <span className="text-muted-foreground">{status.name}</span>
                <span className="font-medium ml-auto">
                  {status.percentage}%
                </span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="relative w-full h-[280px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={95}
                  stroke="#fff"
                  strokeWidth={5}
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, entry: any) => {
                    const percentage = entry.payload?.percentage;
                    return [`${value} (${percentage}%)`, name];
                  }}
                  contentStyle={{
                    borderRadius: "6px",
                    fontSize: "13px",
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    color: "#FFF",
                  }}
                  itemStyle={{ color: "#FFF" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-3xl font-semibold text-slate-800 dark:text-slate-100 leading-none mb-1">
                {chartData.totalProjects}
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Total Project
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApexDonutChart;

