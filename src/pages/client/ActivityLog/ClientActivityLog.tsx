import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import Pagination from "@/Common/Pagination";
import SearchBar from "@/Common/SearchBar";
import DateRange from "@/Common/DateRange";
import DropdownSelect from "@/Common/DropdownSelect";
import ActivityLogTable from "@/pages/client/ActivityLog/Components/ActivityLogTable";
import { useGetAllActivityLogQuery } from "@/store/Api/ActivityLogApi/ActivityLogApi";
import ClientActivityLogSkeleton from "@/Common/Skeleton/client/ActivityLog/ClientActivityLogSkeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ClientActivityLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [selectedAction, setSelectedAction] = useState("All Actions");
  const [sortConfig, setSortConfig] = useState<{
    key: "user" | "date" | "time" | "ipAddress" | null;
    direction: "asc" | "desc" | null;
  }>({ key: null, direction: null });
  const [dateRange, setDateRange] = useState<[Date | null, Date | null] | null>(null);

  const itemsPerPage = 10;

  const { data, isLoading, isError } = useGetAllActivityLogQuery();

  // Extract unique users dynamically
  const usersList = useMemo(() => {
    const activityLogs = data?.data || [];
    const uniqueUsers = Array.from(
      new Set(activityLogs.map((entry) => entry.user?.name).filter(Boolean)),
    );
    return ["All Users", ...uniqueUsers];
  }, [data]);

  // Extract unique projects dynamically
  const projectsList = useMemo(() => {
    const activityLogs = data?.data || [];
    const uniqueProjects = Array.from(
      new Set(activityLogs.map((entry) => entry.projectName).filter(Boolean)),
    );
    return ["All Projects", ...uniqueProjects];
  }, [data]);

  // Extract unique action types dynamically and format them beautifully
  const actionTypesList = useMemo(() => {
    const activityLogs = data?.data || [];
    const uniqueActions = Array.from(
      new Set(
        activityLogs
          .map((entry) => {
            if (entry.actionType) return String(entry.actionType);
            if (typeof entry.description === "string") {
              return entry.description.split(":")[0].trim();
            }
            return "";
          })
          .filter(Boolean),
      ),
    );

    const formattedActions = uniqueActions.map((act) => {
      const title = act
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return { value: act, title };
    });

    return [
      { value: "All Actions", title: "All Action Types" },
      ...formattedActions,
    ];
  }, [data]);

  // Filter data using all filter states
  const filteredData = useMemo(() => {
    let activityLogs = data?.data || [];

    // 1. Search term filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      activityLogs = activityLogs.filter((entry) =>
        Object.values(entry).some((value) => {
          if (value && typeof value === "string") {
            return value.toLowerCase().includes(lowerSearch);
          }
          if (value && typeof value === "object") {
            return Object.values(value).some(
              (subVal) =>
                subVal &&
                typeof subVal === "string" &&
                subVal.toLowerCase().includes(lowerSearch),
            );
          }
          return false;
        }),
      );
    }

    // 2. User filter
    if (selectedUser !== "All Users") {
      activityLogs = activityLogs.filter(
        (entry) => entry.user?.name === selectedUser,
      );
    }

    // 3. Project filter
    if (selectedProject !== "All Projects") {
      activityLogs = activityLogs.filter(
        (entry) => entry.projectName === selectedProject,
      );
    }

    // 4. Action Type filter
    if (selectedAction !== "All Actions") {
      activityLogs = activityLogs.filter((entry) => {
        if (entry.actionType) {
          return String(entry.actionType) === selectedAction;
        }
        if (typeof entry.description === "string") {
          const action = entry.description.split(":")[0].trim();
          return action === selectedAction;
        }
        return false;
      });
    }

    // 5. Date Range filter
    if (dateRange && Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange[1]);
      endDate.setHours(23, 59, 59, 999);

      activityLogs = activityLogs.filter((entry) => {
        if (!entry.timestamp) return false;
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }

    return activityLogs;
  }, [
    data,
    searchTerm,
    selectedUser,
    selectedProject,
    selectedAction,
    dateRange,
  ]);

  const sortedData = useMemo(() => {
    const dataToSort = [...filteredData];
    if (!sortConfig.key || !sortConfig.direction) return dataToSort;

    return dataToSort.sort((a, b) => {
      let aVal: any = "";
      let bVal: any = "";

      if (sortConfig.key === "user") {
        aVal = a.user?.name || "";
        bVal = b.user?.name || "";
      } else if (sortConfig.key === "date" || sortConfig.key === "time") {
        aVal = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        bVal = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      } else if (sortConfig.key === "ipAddress") {
        aVal = a.ipAddress || "";
        bVal = b.ipAddress || "";
      }

      const cleanA = String(aVal).toLowerCase().trim();
      const cleanB = String(bVal).toLowerCase().trim();

      if (sortConfig.key === "date" || sortConfig.key === "time") {
        const numA = Number(aVal);
        const numB = Number(bVal);
        if (numA < numB) return sortConfig.direction === "asc" ? -1 : 1;
        if (numA > numB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }

      if (cleanA < cleanB) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (cleanA > cleanB) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const handleSort = (key: "user" | "date" | "time" | "ipAddress") => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") {
          return { key, direction: "desc" };
        }
        return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const tableHeaders = [
    "projectName",
    "user",
    "description",
    "date",
    "time",
    "ipAddress",
  ];

  // Export CSV
  const handleExport = () => {
    const headers = tableHeaders;
    const csvContent = [
      headers.join(","),
      ...filteredData.map((entry) =>
        headers
          .map((key) => {
            if (key === "user") {
              return `"${entry.user?.name || ""}"`;
            }
            if (key === "date") {
              return entry.timestamp
                ? `"${new Date(entry.timestamp).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}"`
                : '""';
            }
            if (key === "time") {
              return entry.timestamp
                ? `"${new Date(entry.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}"`
                : '""';
            }
            return `"${entry[key as keyof typeof entry] || ""}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees-activity-log.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const hasActiveFilters =
    selectedUser !== "All Users" ||
    selectedProject !== "All Projects" ||
    selectedAction !== "All Actions" ||
    searchTerm !== "" ||
    dateRange !== null;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedUser !== "All Users") count++;
    if (selectedProject !== "All Projects") count++;
    if (selectedAction !== "All Actions") count++;
    return count;
  }, [selectedUser, selectedProject, selectedAction]);

  return (
    <div className="bg-primary-bg rounded-lg border border-border transition-colors w-full mb-10">
      {isLoading ? (
        <ClientActivityLogSkeleton />
      ) : isError ? (
        <div className="flex h-[400px] items-center justify-center text-error font-medium">
          Failed to load activity logs.
        </div>
      ) : (
        <>
          <div className="p-6 border-b border-border flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 w-full">
            <h4 className="text-xl font-medium text-primary-text shrink-0">
              All Employees Activity Log
            </h4>
            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-start xl:justify-end">
              {/* Search Bar */}
              <div className="w-full sm:w-[240px]">
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  className="w-full"
                />
              </div>

              {/* Combined Filters Popover (User, Project, Action) */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className={`gap-2 border border-border bg-primary-bg text-primary-text hover:bg-secondary-bg h-12! rounded-md px-4 font-medium transition-all shrink-0 w-full sm:w-auto justify-center shadow-none! ${activeFilterCount > 0 ? "ring-2 ring-brand-primary" : ""
                      }`}
                  >
                    <Filter className="h-4 w-4 text-secondary-text" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-sm font-semibold">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 p-5 bg-primary-bg border border-border rounded-lg flex flex-col gap-4 shadow-none!"
                  align="end"
                >
                  <h5 className="text-sm font-semibold text-primary-text border-b border-border pb-2 mb-1">
                    Filter Logs
                  </h5>
                  <div className="flex flex-col gap-4">
                    <DropdownSelect
                      placeholderText="Select User"
                      dropdownItem={usersList}
                      onChange={setSelectedUser}
                      label="User"
                      value={selectedUser}
                    />
                    <DropdownSelect
                      placeholderText="Select Project"
                      dropdownItem={projectsList}
                      onChange={setSelectedProject}
                      label="Project"
                      value={selectedProject}
                    />
                    <DropdownSelect
                      placeholderText="Select Action"
                      dropdownItem={actionTypesList}
                      onChange={setSelectedAction}
                      label="Action"
                      value={selectedAction}
                    />
                  </div>
                  {hasActiveFilters && (
                    <div className="flex justify-end pt-2 border-t border-border mt-1">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedUser("All Users");
                          setSelectedProject("All Projects");
                          setSelectedAction("All Actions");
                          setDateRange(null);
                        }}
                        className="text-xs text-error hover:text-error hover:bg-red-50 dark:hover:bg-red-950/20 h-8 rounded-md"
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* Date Range Picker */}
              <div className="w-full sm:w-auto shrink-0">
                <DateRange dateRange={dateRange} setDateRange={setDateRange} />
              </div>

              {/* Export Button */}
              <Button
                variant="outline"
                onClick={handleExport}
                size="lg"
                className="gap-2 bg-transparent border border-border text-primary-text hover:bg-secondary-bg transition-all h-11 rounded-md shrink-0 w-full sm:w-auto justify-center shadow-none!"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="w-full">
            <ActivityLogTable
              paginatedData={paginatedData}
              tableHeaders={tableHeaders}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </div>
          <div className="p-6">
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              total={filteredData.length}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
            />
          </div>
        </>
      )}
    </div>
  );
}
