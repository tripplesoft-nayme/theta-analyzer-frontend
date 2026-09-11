import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";

interface WorkloadData {
  name: string;
  completed: number;
  remaining: number;
  overdue: number;
  total: number;
}

const initialData: WorkloadData[] = [
  {
    name: "Mike Smith",
    completed: 15,
    remaining: 3,
    overdue: 1,
    total: 19,
  },
  {
    name: "Jennifer Jones",
    completed: 16,
    remaining: 2,
    overdue: 1,
    total: 19,
  },
  {
    name: "Sam Watson",
    completed: 14,
    remaining: 2,
    overdue: 1,
    total: 17,
  },
  {
    name: "Theresa Webb",
    completed: 8,
    remaining: 4,
    overdue: 3,
    total: 15,
  },
  {
    name: "Jane Cooper",
    completed: 7,
    remaining: 0,
    overdue: 4,
    total: 11,
  },
  {
    name: "Ronald Richards",
    completed: 4,
    remaining: 2,
    overdue: 1,
    total: 7,
  },
];

export default function EmployeeWorkloadChart() {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, _setData] = useState(initialData);

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalEmployees = data.reduce(
    (sum, item) => sum + item.total,
    0
  );
  const maxValue = Math.max(...data.map((item) => item.total));

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Employee workload
        </h2>
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
            />
          </div>

          {/* Filter Button */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between">
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-600">Remaining</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Overdue</span>
          </div>
        </div>

        <div>
          {/* Total Employees */}
          <span className="text-sm font-medium text-gray-600">
            Total employees{" "}
            <span className="text-gray-800 font-semibold">
              {totalEmployees}
            </span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4 mb-6">
        {filteredData.map((item) => {
          const completedWidth = (item.completed / maxValue) * 100;
          const remainingWidth = (item.remaining / maxValue) * 100;
          const overdueWidth = (item.overdue / maxValue) * 100;

          return (
            <div key={item.name} className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 w-32">
                  {item.name}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {item.total} Task
                </span>
              </div>

              {/* Stacked Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                  {/* Completed */}
                  <div
                    className="bg-blue-500 h-full transition-all duration-300 group-hover:opacity-80"
                    style={{ width: `${completedWidth}%` }}
                    title={`Completed: ${item.completed}`}
                  ></div>

                  {/* Remaining */}
                  {item.remaining > 0 && (
                    <div
                      className="bg-orange-500 h-full transition-all duration-300 group-hover:opacity-80"
                      style={{ width: `${remainingWidth}%` }}
                      title={`Remaining: ${item.remaining}`}
                    ></div>
                  )}

                  {/* Overdue */}
                  {item.overdue > 0 && (
                    <div
                      className="bg-red-500 h-full transition-all duration-300 group-hover:opacity-80"
                      style={{ width: `${overdueWidth}%` }}
                      title={`Overdue: ${item.overdue}`}
                    ></div>
                  )}
                </div>

                {/* Scrollbar indicator */}
                <div className="w-1 h-8 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex items-end gap-4 mb-6">
        <div className="w-32"></div>
        <div className="flex-1 flex justify-between text-xs text-gray-500 px-2">
          <span>0</span>
          <span>2</span>
          <span>4</span>
          <span>6</span>
          <span>8</span>
          <span>10</span>
          <span>12</span>
          <span>14</span>
          <span>16</span>
          <span>18</span>
          <span>20</span>
          <span>22</span>
        </div>
      </div>
    </div>
  );
}
