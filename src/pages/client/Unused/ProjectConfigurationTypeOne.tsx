import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

export type LegendValue = {
  label: string;
  field: string;
  color: string;
};

type Props = {
  widgedName: string;
  widgetTitle: string;
  widgetCategory: string;
  setWidgetTitle: React.Dispatch<React.SetStateAction<string>>;
  numOfXAxisDataSet: number;
  handleSetNumOfXAxisDataSet: (e: React.ChangeEvent<HTMLInputElement>) => void;
  xAxisValues: string[];
  handleXAxisValueChange: (index: number, value: string) => void;
  numOfLegendDataSet: number;
  setNumOfLegendDataSet: React.Dispatch<React.SetStateAction<number>>;
  legendValues: LegendValue[];
  setLegendValues: React.Dispatch<React.SetStateAction<LegendValue[]>>;
  startingRange: number;
  setStartingRange: React.Dispatch<React.SetStateAction<number>>;
  endingRange: number;
  setEndingRange: React.Dispatch<React.SetStateAction<number>>;
  onClose?: () => void;
  onSave?: () => void;
};

const ProjectConfigurationTypeOne = ({
  widgedName,
  widgetTitle,
  setWidgetTitle,
  numOfXAxisDataSet,
  handleSetNumOfXAxisDataSet,
  xAxisValues,
  handleXAxisValueChange,
  numOfLegendDataSet,
  setNumOfLegendDataSet,
  legendValues,
  setLegendValues,
  startingRange,
  setStartingRange,
  endingRange,
  setEndingRange,
  onClose,
  onSave,
}: Props) => {
  const [filter, setFilter] = useState<string>("onTime");
  const [showFilter, setShowFilter] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // Assigned by info
  const assignedBy = {
    name: "Alexis Burg",
    role: "Admin",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  };

  // Handler for Legend inputs
  const minLegend = 3;
  const maxLegend = 5;

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

  // Check if chart needs X-axis configuration
  const showXAxisConfig = widgedName === "Treemap Chart";

  return (
    <div className="max-w-78 min-w-78 h-full bg-white border border-border rounded-lg shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Widget Configuration
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Widget Details Link */}
        <a href="#" className="text-xs text-blue-600  ">
          {widgedName} Widget Details
        </a>

        {/* Widget Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5 mt-5">
            Widget Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={widgetTitle}
            onChange={(e) => setWidgetTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none"
          />
        </div>

        {/* Show Filter */}
        <div className="flex items-center justify-between py-2">
          <label className="text-xs font-medium text-gray-700">
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
        </div>

        {/* Filter By */}
        {showFilter && (
          <div className="flex items-center">
            <label className="text-xs text-gray-700 flex-1">Filter By:</label>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pr-12 pl-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-500 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="onTime">On time</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>

              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
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

        {/* Data Mapping for X-Axis (only for Treemap) */}
        {showXAxisConfig && (
          <div>
            <h3 className="text-xs font-semibold text-blue-600 mb-3">
              Data Mapping for X-Axis
            </h3>

            {/* Number of Data Points */}
            <div className="flex items-center mb-3">
              <label className="text-xs text-gray-700 flex-1">
                Number of Data Points:
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={numOfXAxisDataSet}
                onChange={handleSetNumOfXAxisDataSet}
                className="w-12 px-2 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none"
              />
            </div>

            {/* X-Axis Labels */}
            {Array.from({ length: numOfXAxisDataSet }).map((_, index) => (
              <div key={index} className="flex items-center mb-2">
                <label
                  className="text-xs text-gray-700"
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
                  Label:
                </label>
                <input
                  type="text"
                  placeholder="Enter label"
                  value={xAxisValues[index] || ""}
                  onChange={(e) =>
                    handleXAxisValueChange(index, e.target.value)
                  }
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        )}

        {/* Data Mapping for Y-Axis Section */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 mb-3">
            Data Mapping for Y-Axis
          </h3>

          {/* Number of Data sets (only show for charts that use it) */}
          {widgedName !== "Calendar Heatmap" && (
            <div className="flex items-center mb-3">
              <label className="text-xs text-gray-700 flex-1">
                Number of Data sets:
              </label>
              <input
                type="number"
                min={minLegend}
                max={maxLegend}
                value={numOfLegendDataSet}
                onChange={handleSetNumOfLegendDataSet}
                className="w-12 px-2 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none"
              />
            </div>
          )}

          {/* 1st field Data */}
          <div className="flex items-center mb-2">
            <label className="text-xs text-gray-700 flex-1">
              1st field Data:
            </label>
            <input
              type="number"
              onChange={(e) => setStartingRange(Number(e.target.value))}
              value={startingRange}
              className="w-16 px-2 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none"
            />
          </div>

          {/* Last field Data */}
          <div className="flex items-center mb-2">
            <label className="text-xs text-gray-700 flex-1">
              Last field Data:
            </label>
            <input
              type="number"
              onChange={(e) => setEndingRange(Number(e.target.value))}
              value={endingRange}
              className="w-16 px-2 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none"
            />
          </div>
        </div>

        {/* Display Settings Section */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 mb-3">
            Display Settings
          </h3>

          {/* Show Legend */}
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium text-gray-700">
              Show Legend
            </label>
            <div className="flex items-center gap-2">
              <div className="relative inline-block w-10 h-5">
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  onClick={() => setShowLegend(!showLegend)}
                  className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${showLegend ? "bg-blue-600" : "bg-gray-300"
                    }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${showLegend ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {showLegend &&
            Array.from({ length: numOfLegendDataSet }).map((_, index) => (
              <div key={index}>
                {/* Legend Name */}
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="text-xs text-gray-700"
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
                    className="w-[50%] px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>

                {/* Legend Color */}
                {widgedName !== "Calendar Heatmap" && (
                  <div className="flex items-center mb-3">
                    <label
                      className="text-xs text-gray-700"
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
                        className="text-xs px-2 py-1 border border-gray-200 rounded w-22"
                      />

                      <input
                        type="color"
                        value={legendValues[index]?.color || "#000000"}
                        onChange={(e) =>
                          handleLegendColorChange(index, e.target.value)
                        }
                        className="w-14 h-6 rounded border border-gray-200 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Assigned By */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Assigned by
          </label>
          <div className="flex items-center">
            <img
              src={assignedBy.image}
              alt={assignedBy.name}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div>
              <p className="text-xs font-medium text-gray-900">
                {assignedBy.name}
              </p>
              <p className="text-xs text-gray-500">{assignedBy.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-medium border border-gray-200 rounded-md cursor-pointer text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer"
          onClick={onSave}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProjectConfigurationTypeOne;
