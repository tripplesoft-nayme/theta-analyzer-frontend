"use client";

import { useState, MouseEvent } from "react";
import { Trash2 } from "lucide-react";

interface HeatmapData {
  product: string;
  values: number[];
}

interface TooltipData {
  product: string;
  day: string;
  value: number;
  x: number;
  y: number;
}

interface HeatmapChartProps {
  onDelete?: () => void;
  onCopy?: () => void;
}

export default function HeatmapChart({ onDelete }: HeatmapChartProps) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [data] = useState<HeatmapData[]>([
    {
      product: "Smart Watch",
      values: [450, 1200, 1500, 800, 1800, 1600, 1400],
    },
    {
      product: "Power Bank",
      values: [1100, 600, 1300, 900, 1700, 1200, 1000],
    },
    {
      product: "Smart Phone",
      values: [1400, 1600, 1800, 400, 1500, 1900, 1100],
    },
    {
      product: "Earphone",
      values: [800, 300, 1000, 200, 1300, 700, 500],
    },
    {
      product: "Earbuds",
      values: [350, 250, 400, 300, 450, 380, 320],
    },
  ]);

  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // const handleCopy = () => {
  //   if (onCopy) {
  //     onCopy();
  //   } else {
  //     navigator.clipboard.writeText(JSON.stringify(data));
  //   }
  // };

  const handleDelete = () => {
    if (onDelete) onDelete();
  };

  const getColor = (value: number) => {
    if (value < 500) return "bg-teal-200";
    if (value < 1000) return "bg-teal-300";
    if (value < 1500) return "bg-teal-500";
    return "bg-teal-700";
  };

  const handleCellHover = (
    product: string,
    day: string,
    value: number,
    event: MouseEvent<HTMLDivElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      product,
      day,
      value,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleCellLeave = () => setTooltip(null);

  const totalStock = data.reduce(
    (sum, item) => sum + item.values.reduce((a, b) => a + b, 0),
    0,
  );

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-website-color-darkGray dark:text-slate-100 py-1 rounded">
          Heat Map Chart
        </h2>
        <div className="flex items-center gap-2">
          {/* <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 text-gray-600 dark:text-slate-400" />
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
      <div className="flex items-center justify-between mb-6">
        <div className="w-full flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
            Total in Stock:
            <span className="text-base font-semibold text-teal-600">
              {totalStock}
            </span>
          </span>

          <div className="flex items-center justify-end gap-2">
            {[
              { color: "bg-teal-700", range: "0-499" },
              { color: "bg-teal-500", range: "500-999" },
              { color: "bg-teal-300", range: "1000-2000" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded ${item.color}`} />
                <span className="text-xs text-gray-600 dark:text-slate-400">{item.range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Days Header */}
          <div className="flex mb-2">
            <div className="w-28 shrink-0" />
            {days.map((day) => (
              <div
                key={day}
                className="flex-1 text-center text-xs font-medium text-gray-600 dark:text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap Rows */}
          {data.map((item, rowIndex) => (
            <div key={rowIndex} className="flex items-center mb-2">
              <div className="w-28 shrink-0 text-sm text-gray-700 dark:text-slate-300 pr-4">
                {item.product}
              </div>
              {item.values.map((value, colIndex) => (
                <div
                  key={colIndex}
                  className={`flex-1 h-10 ${getColor(
                    value,
                  )} rounded cursor-pointer transition-all hover:ring-2 hover:ring-teal-400 hover:scale-105 mx-0.5`}
                  onMouseEnter={(e) =>
                    handleCellHover(item.product, days[colIndex], value, e)
                  }
                  onMouseLeave={handleCellLeave}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 dark:bg-slate-800 text-white text-xs rounded px-3 py-2 shadow-lg pointer-events-none border dark:border-slate-700"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="font-semibold">{tooltip.product}</div>
          <div className="text-gray-300">{tooltip.day}</div>
          <div className="font-bold text-teal-300">{tooltip.value} units</div>
        </div>
      )}
    </div>
  );
}
