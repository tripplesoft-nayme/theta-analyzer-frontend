import { lazyWithRetry } from "@/utils/lazyWithRetry";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useGetAllReviewProjectsQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";
import SmUpcomingDeadline from "@/pages/staffManager/Overview/Components/SmUpcomingDeadline";
import ReviewerActivity from "./Components/ReviewerActivity";
import ProjectReviewOverviewCard from "./Components/ProjectReviewOverviewCard";
import Pagination from "@/Common/Pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AllProjectTable, {
  SortKey,
  SortOrder,
} from "@/pages/client/ProjectReview/Components/AllProject/AllProjectTable";
import { Suspense } from "react";
const Calendar = lazyWithRetry(() => import("react-calendar"));
import {
  Search,
  X,
  Info,
  Calendar as CalendarIcon,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IProjectTableProps {
  title?: string;
  programId?: string;
}

const AllProjectsReview = ({ title = "All Projects" }: IProjectTableProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>("startDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const ITEMS_PER_PAGE = 10;

  const formatYMD = (d?: Date) => {
    if (!d) return undefined;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const startDate =
    Array.isArray(dateRange) && dateRange[0]
      ? formatYMD(dateRange[0] as Date)
      : undefined;
  const endDate =
    Array.isArray(dateRange) && dateRange[1]
      ? formatYMD(dateRange[1] as Date)
      : dateRange instanceof Date
        ? formatYMD(dateRange as Date)
        : undefined;

  /*   RTK QUERY   */
  const {
    data: project,
    isLoading,
    isFetching,
  } = useGetAllReviewProjectsQuery({
    status:
      selectedStatus && selectedStatus !== "ALL" ? selectedStatus : undefined,
    fromDate: startDate,
    toDate: endDate,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: searchQuery || undefined,
  });

  const projects = useMemo(() => {
    return (
      project?.data
        ?.filter((item: any) => item.status?.toUpperCase() !== "PREVIEW")
        ?.map((item: any) => ({
          ...item,
          id: item.id,
          submissionId: item.id,
          projectId: item.project?.id,
          name: item.project?.name || item.information,
          status: item.status?.toUpperCase(),
          priority: item.project?.priority || "MEDIUM",
          startDate: item.createdAt,
          manager: item.project?.manager || {},
          projectEmployees: item.employee
            ? [
              {
                employee: {
                  ...item.employee,
                  user: {
                    ...item.employee.user,
                    role: item.employee.user.role || "EMPLOYEE",
                  },
                },
              },
            ]
            : [],
          projectViewers: [],
        }))
        .sort((a: any, b: any) =>
          sortKey
            ? sortOrder === "asc"
              ? String(a[sortKey]).localeCompare(String(b[sortKey]))
              : String(b[sortKey]).localeCompare(String(a[sortKey]))
            : new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
        ) ?? []
    );
  }, [project, sortKey, sortOrder]);

  const meta = project?.meta;
  const totalItems: number = meta?.total ?? projects.length;
  const totalPages: number =
    meta?.totalPages ?? Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedProjects = meta
    ? projects
    : projects.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev: SortOrder) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      if (projects.length === 0) {
        toast.error("No data available to export");
        return;
      }

      const exportData = projects.map((p: any) => ({
        "Project Name": p.name,
        Status: p.status,
        Priority: p.priority,
        "Start Date": p.startDate
          ? new Date(p.startDate).toLocaleDateString()
          : "-",
        Deadline: p.deadline ? new Date(p.deadline).toLocaleDateString() : "-",
        Progress: `${p.progress}%`,
        Budget: p.budget || "-",
      }));

      const XLSX = await import("xlsx/dist/xlsx.mini.min.js");

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Projects");

      XLSX.writeFile(
        wb,
        `Project_Review_Export_${new Date().toISOString().split("T")[0]}.xlsx`,
      );

      toast.success("Spreadsheet exported successfully");
    } catch {
      toast.error("Failed to export spreadsheet");
    }
  };

  return (
    <>
      <ProjectReviewOverviewCard />
      <div className="min-h-screen my-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-6 pb-0!">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{title}</h1>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                  <Input
                    placeholder="Search submissions..."
                    className="pl-9 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select
                  value={selectedStatus}
                  onValueChange={(value) => {
                    setSelectedStatus(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 transition-all outline-none">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
                    <SelectItem value="ALL" className="dark:focus:bg-slate-800 dark:text-slate-300 cursor-pointer transition-colors">All Status</SelectItem>
                    <SelectItem value="APPROVED" className="dark:focus:bg-slate-800 dark:text-slate-300 cursor-pointer transition-colors">Approved</SelectItem>
                    <SelectItem value="PENDING" className="dark:focus:bg-slate-800 dark:text-slate-300 cursor-pointer transition-colors">Pending</SelectItem>
                    <SelectItem value="REJECTED" className="dark:focus:bg-slate-800 dark:text-slate-300 cursor-pointer transition-colors">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-10 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900 transition-all shadow-sm"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <CalendarIcon size={18} className="text-gray-400 dark:text-slate-500" />
                    <span className="text-sm font-medium">
                      {dateRange
                        ? Array.isArray(dateRange)
                          ? `${dateRange[0] ? formatShortDate(dateRange[0]) : ""} - ${dateRange[1] ? formatShortDate(dateRange[1]) : ""}`
                          : formatShortDate(dateRange)
                        : "Date Range"}
                    </span>
                  </Button>

                  {showCalendar && (
                    <div className="absolute top-12 right-0 z-[100] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-border dark:border-slate-800 p-5 min-w-[320px] animate-in fade-in zoom-in duration-200">
                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-50 dark:border-slate-800">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                            Select Date Range
                          </h4>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                            Project Schedule
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCalendar(false)}
                          className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 transition-colors"
                        >
                          <X size={16} />
                        </Button>
                      </div>

                      <div className="custom-calendar-wrapper">
                        <Suspense
                          fallback={
                            <div className="h-[280px] w-full flex items-center justify-center text-sm text-gray-400 animate-pulse font-medium">
                              Loading Calendar...
                            </div>
                          }
                        >
                          <Calendar
                            selectRange={true}
                            onChange={(val: any) => {
                              setDateRange(val);
                              setCurrentPage(1);
                            }}
                            value={dateRange}
                            className="border-none font-inter w-full"
                            nextLabel={
                              <span className="text-gray-400 dark:text-slate-500">&gt;</span>
                            }
                            prevLabel={
                              <span className="text-gray-400 dark:text-slate-500">&lt;</span>
                            }
                            next2Label={null}
                            prev2Label={null}
                          />
                        </Suspense>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800 flex items-start gap-2">
                        <Info
                          size={14}
                          className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0"
                        />
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                          {Array.isArray(dateRange) &&
                            dateRange[0] &&
                            dateRange[1] ? (
                            <span>
                              Selected:{" "}
                              <span className="font-semibold text-gray-700 dark:text-slate-200">
                                {dateRange[0].toLocaleDateString()}
                              </span>{" "}
                              to{" "}
                              <span className="font-semibold text-gray-700 dark:text-slate-200">
                                {dateRange[1].toLocaleDateString()}
                              </span>
                            </span>
                          ) : (
                            "Click a start date and then an end date to select a range."
                          )}
                        </p>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 h-9 text-xs border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 transition-all shadow-sm"
                          onClick={() => {
                            setDateRange(null);
                            setShowCalendar(false);
                            setCurrentPage(1);
                          }}
                        >
                          Reset
                        </Button>
                        <Button
                          className="flex-1 h-9 text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
                          onClick={() => setShowCalendar(false)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-10 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                  onClick={handleExport}
                >
                  <Download className="mr-2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                  Export
                </Button>
              </div>
            </div>

            <div
              className={`w-full transition-opacity duration-150 ${isFetching || isLoading ? "opacity-50 pointer-events-none" : ""}`}
            >
              <AllProjectTable
                projects={paginatedProjects}
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                total={totalItems}
              />
            </div>
          </div>

          <div className="w-full lg:w-[450px] space-y-6">
            <SmUpcomingDeadline className="h-fit" />
            <ReviewerActivity />
          </div>
        </div>
      </div>

      <style>{`
        .custom-calendar-wrapper .react-calendar {
          background: transparent;
          border: none;
          font-family: inherit;
          color: inherit;
        }
        .dark .custom-calendar-wrapper .react-calendar {
          background: transparent;
          color: #f1f5f9;
        }
        .custom-calendar-wrapper .react-calendar__navigation {
          margin-bottom: 10px;
        }
        .custom-calendar-wrapper .react-calendar__navigation button {
          min-width: 30px;
          background: none;
          font-weight: 600;
          color: #374151;
        }
        .dark .custom-calendar-wrapper .react-calendar__navigation button {
          color: #f1f5f9;
        }
        .custom-calendar-wrapper .react-calendar__navigation button:enabled:hover,
        .custom-calendar-wrapper .react-calendar__navigation button:enabled:focus {
          background-color: #f9fafb;
          border-radius: 6px;
        }
        .dark .custom-calendar-wrapper .react-calendar__navigation button:enabled:hover {
          background-color: #1e293b;
        }
        .custom-calendar-wrapper .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-weight: 700;
          font-size: 10px;
          color: #9ca3af;
          margin-bottom: 8px;
        }
        .custom-calendar-wrapper .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }
        .custom-calendar-wrapper .react-calendar__tile {
          padding: 10px 5px !important;
          font-size: 13px;
          color: #4b5563;
          border-radius: 6px;
        }
        .dark .custom-calendar-wrapper .react-calendar__tile {
          color: #cbd5e1;
        }
        .custom-calendar-wrapper .react-calendar__tile:enabled:hover,
        .custom-calendar-wrapper .react-calendar__tile:enabled:focus {
          background-color: #eff6ff;
          color: #1d4ed8;
        }
        .dark .custom-calendar-wrapper .react-calendar__tile:enabled:hover {
          background-color: #1e293b;
          color: #60a5fa;
        }
        .custom-calendar-wrapper .react-calendar__tile--now {
          background: #f3f4f6;
          color: #111827;
          font-weight: bold;
        }
        .dark .custom-calendar-wrapper .react-calendar__tile--now {
          background: #1e293b;
          color: #f1f5f9;
        }
        .custom-calendar-wrapper .react-calendar__tile--active {
          background: #1c73e0 !important;
          color: white !important;
        }
        .custom-calendar-wrapper .react-calendar__tile--selectRange {
          background: #eff6ff;
          color: #1d4ed8;
          border-radius: 0;
        }
        .dark .custom-calendar-wrapper .react-calendar__tile--selectRange {
          background: #1e293b;
          color: #60a5fa;
        }
      `}</style>
    </>
  );
};

export default AllProjectsReview;

