import { useState, useEffect, useMemo } from "react";
import { CardHeader } from "@/components/ui/card";
import BoxContainer from "@/Common/BoxContainer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, ChevronDown } from "lucide-react";
import SubmissionTable from "./SubmissionTable";
import { useGetAllLatestSubmissionsQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";
import SkeletonLoading from "@/Common/Skeleton/SkeletonLoading";
import DateRangePicker from "@/Common/DateRange";

const LatestSubmission = () => {
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [pageNumber, setPageNumber] = useState(1);
  const [limitFilter, setLimitFilter] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);

  const startDateFilter = useMemo(() => {
    if (!dateRange || !dateRange[0]) return "";
    const date = dateRange[0];
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, [dateRange]);

  const endDateFilter = useMemo(() => {
    if (!dateRange || !dateRange[1]) return "";
    const date = dateRange[1];
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, [dateRange]);

  // Reset to first page on filter change
  useEffect(() => {
    setPageNumber(1);
  }, [statusFilter, startDateFilter, endDateFilter]);

  const queryParams = useMemo(() => {
    const params: any = {
      page: pageNumber,
      limit: limitFilter,
      sortBy,
      sortOrder,
    };
    if (statusFilter !== "all") params.status = statusFilter;
    if (startDateFilter) params.startDate = startDateFilter;
    if (endDateFilter) params.endDate = endDateFilter;
    return params;
  }, [
    pageNumber,
    limitFilter,
    sortBy,
    sortOrder,
    statusFilter,
    startDateFilter,
    endDateFilter,
  ]);

  const { data, isLoading, isFetching } = useGetAllLatestSubmissionsQuery(queryParams);

  const submissionsData = useMemo(() => {
    const raw = data?.data?.submissions || data?.data?.data || data?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const meta = data?.meta || data?.data?.meta;
  const totalPages = useMemo(() => {
    if (meta?.totalPages) return meta.totalPages;
    if (meta?.total) return Math.ceil(meta.total / limitFilter);
    return 1;
  }, [meta, limitFilter]);

  return (
    <BoxContainer>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4 px-0 border-b border-gray-100 dark:border-slate-800/50">
        <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100 shrink-0">Latest Submission</h4>

        <div className="flex items-center gap-3 shrink-0">
          {/* Status Select Popover Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-[#CAD2DB] dark:border-slate-800 h-10 px-4 text-xs text-gray-700 dark:text-slate-300 cursor-pointer shadow-sm rounded-lg min-w-[120px]"
              >
                <span>
                  {statusFilter === "all"
                    ? "All Status"
                    : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).toLowerCase()}
                </span>
                <ChevronDown className="size-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-40 bg-white dark:bg-slate-900 border border-[#CAD2DB] dark:border-slate-800 p-1"
            >
              {[
                { value: "all", label: "All Status" },
                { value: "PENDING", label: "Pending" },
                { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Rejected" },
                { value: "RESUBMITTED", label: "Resubmitted" },
                { value: "PREVIEW", label: "Preview" },
              ].map((item) => (
                <DropdownMenuItem
                  key={item.value}
                  className={`rounded-md cursor-pointer ${statusFilter === item.value ? "bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-slate-100" : ""
                    }`}
                  onClick={() => setStatusFilter(item.value)}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Picker */}
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} className="h-10 text-xs shadow-sm" />

          {/* Sort By Dropdown */}
          {submissionsData.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-[#CAD2DB] dark:border-slate-800 h-10 text-xs text-gray-900 dark:text-slate-100 cursor-pointer shadow-sm rounded-lg"
                >
                  <ArrowDownUp className="size-4 text-gray-500 dark:text-slate-400" />
                  Sort By
                  <ChevronDown className="size-4 text-gray-500 dark:text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white dark:bg-slate-900 border border-[#CAD2DB] dark:border-slate-800 p-1"
              >
                {/* Field Selection */}
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Field
                </div>
                <DropdownMenuItem
                  className={`rounded-md cursor-pointer ${sortBy === "createdAt" ? "bg-indigo-50 text-indigo-600" : ""}`}
                  onClick={() => setSortBy("createdAt")}
                >
                  Created At
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`rounded-md cursor-pointer ${sortBy === "updatedAt" ? "bg-indigo-50 text-indigo-600" : ""}`}
                  onClick={() => setSortBy("updatedAt")}
                >
                  Updated At
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`rounded-md cursor-pointer ${sortBy === "status" ? "bg-indigo-50 text-indigo-600" : ""}`}
                  onClick={() => setSortBy("status")}
                >
                  Status
                </DropdownMenuItem>

                <div className="my-1 border-t border-border" />

                {/* Order Selection */}
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Order
                </div>
                <DropdownMenuItem
                  className={`rounded-md cursor-pointer ${sortOrder === "asc" ? "bg-indigo-50 text-indigo-600" : ""}`}
                  onClick={() => setSortOrder("asc")}
                >
                  Ascending
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`rounded-md cursor-pointer ${sortOrder === "desc" ? "bg-indigo-50 text-indigo-600" : ""}`}
                  onClick={() => setSortOrder("desc")}
                >
                  Descending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      {isLoading || isFetching ? (
        <SkeletonLoading count={5} height="h-12" direction="vertical" />
      ) : submissionsData.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-slate-400 text-sm">
          No submissions found
        </div>
      ) : (
        <>
          <SubmissionTable submissions={submissionsData} />

          {/* Pagination Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-slate-400">Rows per page:</span>
              <select
                value={limitFilter}
                onChange={(e) => {
                  setLimitFilter(Number(e.target.value));
                  setPageNumber(1);
                }}
                className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md text-gray-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={pageNumber === 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                className="h-8 text-xs px-3 border-gray-200 dark:border-slate-800 bg-transparent text-gray-700 dark:text-slate-300 cursor-pointer disabled:opacity-50"
              >
                Previous
              </Button>
              <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
                Page {pageNumber} {totalPages ? `of ${totalPages}` : ""}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={submissionsData.length < limitFilter || pageNumber >= totalPages}
                onClick={() => setPageNumber((p) => p + 1)}
                className="h-8 text-xs px-3 border-gray-200 dark:border-slate-800 bg-transparent text-gray-700 dark:text-slate-300 cursor-pointer disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </BoxContainer>
  );
};

export default LatestSubmission;
