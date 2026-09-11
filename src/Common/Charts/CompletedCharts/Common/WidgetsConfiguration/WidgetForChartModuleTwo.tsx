import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { AssignedByProfile } from "./WidgetCommon";

export type LegendValue = {
  label: string;
  field: string;
  color: string;
};

const WidgetForChartModuleTwo = ({
  widgedName,
  widgetTitle,
  widgetCategory,
  setWidgetTitle,
  numOfLegendDataSet,
  setNumOfLegendDataSet,
  legendValues,
  setLegendValues,
  startingRange,
  setStartingRange,
  endingRange,
  setEndingRange,
  onClose,
}: {
  widgedName: string;
  widgetTitle: string;
  widgetCategory: string;
  setWidgetTitle: React.Dispatch<React.SetStateAction<string>>;
  numOfLegendDataSet: number;
  setNumOfLegendDataSet: React.Dispatch<React.SetStateAction<number>>;
  legendValues: LegendValue[];
  setLegendValues: React.Dispatch<React.SetStateAction<LegendValue[]>>;
  startingRange?: number;
  setStartingRange?: React.Dispatch<React.SetStateAction<number>>;
  endingRange?: number;
  setEndingRange?: React.Dispatch<React.SetStateAction<number>>;
  onClose?: () => void;
}) => {
  const [filter, setFilter] = useState<string>("");
  const [showFilter] = useState(false);

  // for showing user info below
  const assignedBy = {
    name: "Alexis Burg",
    role: "Admin",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  };

  // handler for Legend inputs
  const minLegend = 1;
  const maxLegend = 15;
  const handleSetNumOfLegendDataSet = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(e.target.value, 10);

    if (isNaN(value) || value < minLegend || value > maxLegend) {
      toast.error(`Please enter a number between ${minLegend} and ${maxLegend}`);
      return;
    }

    setNumOfLegendDataSet(value);

    setLegendValues((prev) => {
      const updated = [...prev];

      while (updated.length < value) {
        updated.push({
          label: "",
          field: "",
          color: "#000000",
        });
      }
      return updated.slice(0, value);
    });
  };

  const handleLegendLabelChange = (index: number, value: string) => {
    setLegendValues((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        label: value,
        field: value.toLowerCase().replace(/\s+/g, ""),
      };
      return updated;
    });
  };

  const handleLegendColorChange = (index: number, color: string) => {
    setLegendValues((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        color: color,
      };
      return updated;
    });
  };

  console.log(widgetCategory);

  return (
    <div className="max-w-78 min-w-78 h-auto self-start flex flex-col bg-white dark:bg-slate-900 border border-border dark:border-slate-800/50 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          Widget Configuration
        </h2>
        <button className="text-gray-500 dark:text-slate-500 hover:text-gray-700" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Stacked BarChart Widget Details Link */}
        <a href="#" className="text-xs text-blue-600  ">
          {widgedName} Widget Details
        </a>

        {/* Widget Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-slate-200 mb-1.5 mt-5">
            Widget Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={widgetTitle}
            onChange={(e) => setWidgetTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-slate-800 rounded focus:outline-none"
          />
        </div>

        {/* Show Filter */}
        {/* <div className="flex items-center justify-between py-2">
          <label className="text-xs font-medium text-gray-700 dark:text-slate-200">
            Show Filter
          </label>
          <div className="relative inline-block w-10 h-5">
            <input
              type="checkbox"
              checked={showFilter}
              onChange={(e) => setShowFilter(e.target.checked)}
              className="sr-only peer"
            />
            <div
              onClick={() => setShowFilter(!showFilter)}
              className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${showFilter ? "bg-blue-600" : "bg-gray-300"
                }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${showFilter ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </div>
          </div>
        </div> */}

        {/* Filter By */}
        {showFilter && (
          <div className="flex items-center">
            <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">Filter By:</label>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pr-12 pl-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-md text-sm text-gray-500 dark:text-slate-500 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="onTime">On time</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>

              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400 dark:text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Data Mapping for Y-Axis Section */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 mb-3">
            Data Mapping for Legend
          </h3>

          {/* Number of Data sets */}
          <div className="flex items-center mb-3">
            <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">
              Number of Data sets:
            </label>
            <input
              type="number"
              min={minLegend}
              max={maxLegend}
              value={numOfLegendDataSet}
              onChange={handleSetNumOfLegendDataSet}
              className="w-12 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded focus:outline-none"
            />
          </div>

          {widgedName !== "Pie Chart" && (
            <>
              {/* 1st field Data */}
              <div className="flex items-center mb-2">
                <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">
                  1st field Data:
                </label>
                <input
                  type="number"
                  min={0}
                  onChange={(e) => setStartingRange?.(Math.max(0, Number(e.target.value)))}
                  defaultValue={startingRange}
                  className="w-16 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded focus:outline-none"
                />
              </div>

              {/* Last field Data */}
              <div className="flex items-center mb-2">
                <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">
                  Last field Data:
                </label>
                <input
                  type="number"
                  min={0}
                  onChange={(e) => setEndingRange?.(Math.max(0, Number(e.target.value)))}
                  defaultValue={endingRange}
                  className="w-16 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded focus:outline-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Display Settings Section */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 mb-3">
            Display Settings
          </h3>


          {Array.from({ length: numOfLegendDataSet }).map((_, index) => (
            <div key={index}>
              {/* Legend Name */}
              <div className="flex items-center justify-between mb-2">
                <label
                  className="text-xs text-gray-700 dark:text-slate-200"
                  style={{ width: "110px" }}
                >
                  {index + 1}
                  {index === 0
                    ? "st"
                    : index === 1
                      ? "nd"
                      : index === 2
                        ? "rd"
                        : "th"}{" "}
                  Legend Name:
                </label>

                <input
                  type="text"
                  placeholder="Enter name here"
                  value={legendValues[index]?.label || ""}
                  onChange={(e) =>
                    handleLegendLabelChange(index, e.target.value)
                  }
                  className="w-[50%] px-2 py-1 text-xs border border-gray-300 dark:border-slate-800 rounded"
                />
              </div>

              {/* Legend Color */}
              <div className="flex items-center mb-3">
                <label
                  className="text-xs text-gray-700 dark:text-slate-200"
                  style={{ width: "110px" }}
                >
                  {index + 1}
                  {index === 0
                    ? "st"
                    : index === 1
                      ? "nd"
                      : index === 2
                        ? "rd"
                        : "th"}{" "}
                  Legend Color:
                </label>

                <div className="flex items-center justify-end gap-2 flex-1">
                  <input
                    type="text"
                    value={legendValues[index]?.color || "#000000"}
                    onChange={(e) =>
                      handleLegendColorChange(index, e.target.value)
                    }
                    className="text-xs px-2 py-1 border border-gray-200 dark:border-slate-800 rounded w-22"
                  />

                  <input
                    type="color"
                    value={legendValues[index]?.color || "#000000"}
                    onChange={(e) =>
                      handleLegendColorChange(index, e.target.value)
                    }
                    className="w-14 h-6 rounded border border-gray-200 dark:border-slate-800 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Assigned By */}
        <AssignedByProfile assignedBy={assignedBy} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-slate-800 shrink-0 mt-auto bg-white dark:bg-slate-900">
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-medium border border-gray-200 dark:border-slate-800 rounded-md text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-slate-100"
        >
          Cancel
        </button>
        <button className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default WidgetForChartModuleTwo;
