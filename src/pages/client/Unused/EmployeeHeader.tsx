import { Dispatch, SetStateAction } from "react";
import {
  ChevronDown,
  Filter,
  ListChecks,
  LucideTable2,
  Search,
} from "lucide-react";

interface IEmployeeHeaderProps {
  selectedEmployees: Set<string>;
  handleDeleteSelected: () => void;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<"tables" | "task">>;
  showFilterDropdown: boolean;
  setShowFilterDropdown: (show: boolean) => void;
  filterBy: string;
  setFilterBy: (filter: string) => void;
}

export default function EmployeeHeader({
  selectedEmployees,
  handleDeleteSelected,
  activeTab,
  setActiveTab,
  showFilterDropdown,
  setShowFilterDropdown,
  filterBy,
  setFilterBy,
}: IEmployeeHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Employees List
          </h1>
          {selectedEmployees.size > 0 && (
            <div className="flex items-center space-x-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {selectedEmployees.size} selected
              </span>
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          {activeTab === "task" ? (
            <button className="p-2 rounded-lg">
              <Search className="w-6 h-6 text-gray-600" />
            </button>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Project..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>
          )}

          {/* Tab */}
          <div className="relative">
            <button
              onClick={() => setActiveTab("tables")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === "tables"
                  ? "bg-black text-white"
                  : "border border-gray-300 text-website-color-black"
              }`}
            >
              <LucideTable2 className="w-4 h-4" />
              <span>Tables</span>
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setActiveTab("task")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === "task"
                  ? "bg-black text-white"
                  : "border border-gray-300 text-website-color-black"
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>Task</span>
            </button>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              <span>Filter By</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showFilterDropdown && (
              <div
                id="filter-dropdown"
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
              >
                <div className="py-2">
                  <h3 className="text-sm font-semibold text-website-color-black px-4 pb-2">
                    By Role:
                  </h3>
                  <div className="flex items-center gap-2 pl-6 py-1">
                    <input type="checkbox" className="cursor-pointer" />
                    <p className="text-sm text-website-color-black">Editor</p>
                  </div>
                  <div className="flex items-center gap-2 pl-6 py-1">
                    <input type="checkbox" className="cursor-pointer" />
                    <p className="text-sm text-website-color-black">
                      Moderator
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pl-6 py-1">
                    <input type="checkbox" className="cursor-pointer" />
                    <p className="text-sm text-website-color-black">Viewer</p>
                  </div>
                </div>
                <div className="py-2">
                  <h3 className="text-sm font-semibold text-website-color-black px-4 pb-2">
                    By Status:
                  </h3>
                  <div className="flex items-center gap-2 pl-6 py-1">
                    <input
                      type="checkbox"
                      checked={filterBy === "active"}
                      onChange={(e) => {
                        setFilterBy(e.target.checked ? "active" : "all");
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-website-color-black">
                      Active Only
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pl-6 py-1">
                    <input
                      type="checkbox"
                      checked={filterBy === "in active"}
                      onChange={(e) => {
                        setFilterBy(e.target.checked ? "in active" : "all");
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-website-color-black">
                      Inactive Only
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
