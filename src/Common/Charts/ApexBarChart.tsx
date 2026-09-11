/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import BoxContainer from "@/Common/BoxContainer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  Text,
  CartesianGrid,
} from "recharts";

interface DataItem {
  name: string;
  value: number;
  level: string;
  color: string;
}

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <Text
        x={-10}
        y={0}
        dy={4}
        textAnchor="end"
        verticalAnchor="middle"
        width={130}
        style={{
          fontSize: "13px",
          fontWeight: 500,
          fill: "currentColor",
        }}
        className="text-slate-600 dark:text-slate-400"
      >
        {payload.value}
      </Text>
    </g>
  );
};

const ApexBarChart = () => {
  const [data, setData] = useState<DataItem[]>([]);

  // ✅ simulate dynamic data loading (you can replace with API or JSON file)
  useEffect(() => {
    const fetchData = async () => {
      const rawData = [
        {
          name: "Customer Feedback Report",
          value: 37,
          level: "Critical",
        },
        {
          name: "Sales Forecast Revision",
          value: 33,
          level: "Critical",
        },
        { name: "Product Launch Plan", value: 27, level: "Critical" },
        {
          name: "Marketing Budget Review",
          value: 23,
          level: "Medium",
        },
        { name: "Website Redesign", value: 18, level: "Low" },
      ];

      // color coding by level
      const mappedData = rawData.map((item) => {
        let color = "#888";
        if (item.level === "Critical") color = "#DA4352";
        else if (item.level === "Medium") color = "#FF974B";
        else if (item.level === "Low") color = "#F5B31A";
        return {
          ...item,
          color,
        };
      });

      setData(mappedData);
    };

    fetchData();
  }, []);

  return (
    <BoxContainer>
      <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Top Overdue: 25 Project
      </h2>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F5B31A]" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF974B]" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DA4352]" />
          <span>Critical</span>
        </div>
      </div>

      {data.length > 0 && (
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                className="stroke-slate-100 dark:stroke-slate-800"
              />
              <XAxis
                type="number"
                tick={{ fontSize: 13, fill: "currentColor" }}
                className="text-slate-500"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={<CustomYAxisTick />}
                width={140}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: number) => [`${val} days overdue`, "Overdue"]}
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
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="insideLeft"
                  formatter={(val: number) => `${val}d`}
                  fill="#FFF"
                  style={{ fontSize: "12px", fontWeight: "500" }}
                  offset={10}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </BoxContainer>
  );
};

export default ApexBarChart;

