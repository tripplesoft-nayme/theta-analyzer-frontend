import React, { useState } from "react";
import { X } from "lucide-react";

const WidgetConfiguration: React.FC = () => {
  const [widgetTitle, setWidgetTitle] = useState(
    "Campaign Performance"
  );
  const [dataSource, setDataSource] = useState(
    "Q2 Marketing Campaign data"
  );
  const [xAxis, setXAxis] = useState("Campaign Name");
  const [yAxis, setYAxis] = useState("Campaign Name");
  const [groupBy, setGroupBy] = useState("Campaign Name");
  const [showLegend, setShowLegend] = useState(true);
  const [color1, setColor1] = useState("#13A490");
  const [color2, setColor2] = useState("#35B6EE");
  const [color3, setColor3] = useState("#6F78F9");

  // Color picker visibility state

  return (
    <div className="w-[40%] h-full max-w-md mx-auto bg-white border border-border rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">
          Widget Configuration
        </h2>
        <button className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-5">
        {/* Widget Details Section */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 mb-3">
            Widget Details
          </h3>

          {/* Widget Title */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Widget Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={widgetTitle}
              onChange={(e) => setWidgetTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Data Source */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Data source <span className="text-red-500">*</span>
            </label>
            <select
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
              }}
            >
              <option>{dataSource}</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Last updated: 28 July 2025
            </p>
          </div>
        </div>

        {/* Data Mapping Section */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 mb-3">
            Data Mapping
          </h3>

          {/* X-Axis */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              X-Axis:
            </label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
              }}
            >
              <option>{xAxis}</option>
            </select>
          </div>

          {/* Y-Axis */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Y-Axis:
            </label>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
              }}
            >
              <option>{yAxis}</option>
            </select>
          </div>

          {/* Group By */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Group By:
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
              }}
            >
              <option>{groupBy}</option>
            </select>
          </div>
        </div>

        {/* Display Settings Section */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 mb-3">
            Display Settings
          </h3>

          {/* Show Legend */}
          <div className="flex items-center mb-4">
            <label className="text-xs font-medium text-gray-700 mr-auto">
              Show Legend
            </label>
            <input
              type="checkbox"
              checked={showLegend}
              onChange={(e) => setShowLegend(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-xs text-gray-700">Yes</span>
          </div>

          {/* Color Schemes */}
          <div className="space-y-3">
            {/* 1st Legend Color */}
            <div className="flex items-center mb-3">
              <label
                className="text-xs text-gray-700"
                style={{ width: "110px" }}
              >
                Color Scheme #1:
              </label>
              <div className="flex items-center justify-end gap-2 flex-1">
                <input
                  type="text"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="text-xs text-gray-600 px-2 py-1 border border-gray-300 rounded w-20"
                />
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-14 h-6 rounded border border-gray-300 cursor-pointer"
                />
              </div>
            </div>
            {/* 2nd Legend Color */}
            <div className="flex items-center mb-3">
              <label
                className="text-xs text-gray-700"
                style={{ width: "110px" }}
              >
                Color Scheme #2:
              </label>
              <div className="flex items-cente justify-end gap-2 flex-1">
                <input
                  type="text"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="text-xs text-gray-600 px-2 py-1 border border-gray-300 rounded w-20"
                />
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-14 h-6 rounded border border-gray-300 cursor-pointer"
                />
              </div>
            </div>
            {/* 3rd Legend Color */}
            <div className="flex items-center mb-3">
              <label
                className="text-xs text-gray-700"
                style={{ width: "110px" }}
              >
                Color Scheme #3:
              </label>
              <div className="flex items-center justify-end gap-2 flex-1">
                <input
                  type="text"
                  value={color3}
                  onChange={(e) => setColor3(e.target.value)}
                  className="text-xs text-gray-600 px-2 py-1 border border-gray-300 rounded w-20"
                />
                <input
                  type="color"
                  value={color3}
                  onChange={(e) => setColor3(e.target.value)}
                  className="w-14 h-6 rounded border border-gray-300 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Assigned By */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Assigned by
          </label>
          <div className="flex items-center">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
              alt="Kathryn Murphy"
              className="w-8 h-8 rounded-full mr-2"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Kathryn Murphy
              </p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-200">
        <button className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg cursor-pointer text-gray-700 hover:text-gray-900">
          Cancel
        </button>
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer">
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default WidgetConfiguration;
