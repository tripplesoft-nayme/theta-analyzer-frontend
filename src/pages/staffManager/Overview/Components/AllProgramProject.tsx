/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AlignStartHorizontal,
  ArrowDownUp,
  ChevronDown,
  Filter,
  TableIcon,
  Search,
} from "lucide-react";

import { useState, useMemo, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import PrimaryButton from "@/Common/PrimaryButton";
import DropdownSelect from "@/Common/DropdownSelect";
import { useGetProgramAllProjectsQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";
import StaffManagerProjectCard from "@/pages/staffManager/Components/StaffManagerProjectCard";
import Pagination from "@/Common/Pagination";
import StaffManagerProjectTable from "./StaffManagerProjectTable";
import { useSelector } from "react-redux";
import { Project } from "@/store/Api/ProjectApi/ProjectType";
import ProjectCardSkeleton from "@/Common/Skeleton/ProjectCardSkeleton";

export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type ProjectStatus =
  | "LIVE"
  | "PENDING"
  | "RETURNED"
  | "OVERDUE"
  | "DRAFT"
  | "IN_REVIEW"
  | "SUBMITTED";
export type ProjectPriority = "HIGH" | "MEDIUM" | "LOW" | "NORMAL";


interface AllProgramProjectProps {
  limit?: number;
  showSearch?: boolean;
  showViewAll?: boolean;
  title?: string;
}

const AllProgramProject = ({
  limit = 4,
  showSearch = false,
  title = "All Program & Project",
}: AllProgramProjectProps) => {
  const [viewMode, setViewMode] = useState<"table" | "board">("board");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const itemsPerPage = limit;

  const managerId = useSelector((state: any) => state.auth.user?.userId);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, search]);

  const queryParams = useMemo(() => {
    const params: any = {
      managerId,
      page: currentPage,
      limit: itemsPerPage,
      sortOrder,
    };
    if (statusFilter && statusFilter !== "ALL") params.status = statusFilter;
    if (priorityFilter && priorityFilter !== "ALL") params.priority = priorityFilter;
    if (sortBy) params.sortBy = sortBy;
    if (showSearch && search) params.search = search;
    return params;
  }, [
    managerId,
    currentPage,
    itemsPerPage,
    statusFilter,
    priorityFilter,
    sortBy,
    sortOrder,
    showSearch,
    search,
  ]);

  const { data, isFetching, isLoading } = useGetProgramAllProjectsQuery(
    queryParams,
    { skip: !managerId },
  );

  const projects = data?.data?.projects?.data || [];
  const projectInfo = data?.data?.projects;
  const total = projectInfo?.total ?? 0;
  const totalPages = projectInfo?.totalPages ?? Math.ceil(total / itemsPerPage);

  const statusOptions = [
    { value: "ALL", title: "All Status" },
    { value: "LIVE", title: "LIVE" },
    { value: "OVERDUE", title: "OVERDUE" },
    { value: "DRAFT", title: "DRAFT" },
  ];

  const priorityOptions = [
    { value: "ALL", title: "All Priority" },
    { value: "HIGH", title: "High" },
    { value: "MEDIUM", title: "Medium" },
    { value: "LOW", title: "Low" },
    { value: "NORMAL", title: "Default" },
  ];



  return (
    <div className=" min-h-[500px]">
      {/* Header  */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6">
        <h4 className="text-gray-900 dark:text-slate-100 text-xl font-semibold">{title}</h4>
        <div className="flex items-center gap-3">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400 size-4" />
              <input
                value={search}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search project..."
                className="pl-9 pr-4 py-3 border border-[#CAD2DB] dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              />
            </div>
          )}

          {/* View Toggle */}
          <div className="flex items-center  gap-3">
            <PrimaryButton
              type="Primary"
              title="Boards"
              leftIcon={<AlignStartHorizontal className="w-4 h-4" />}
              className={`${viewMode === "board"
                ? "bg-black dark:bg-blue-600 text-white border-black dark:border-blue-600 hover:bg-black! dark:hover:bg-blue-700! hover:text-white!"
                : "bg-white dark:bg-slate-900 border-black dark:border-slate-800 text-black! dark:text-slate-300! hover:text-black! dark:hover:text-blue-400!"
                }`}
              onClick={() => setViewMode("board")}
            />
            <PrimaryButton
              type="Primary"
              title="Tables"
              leftIcon={<TableIcon className="w-4 h-4" />}
              className={`${viewMode === "table"
                ? "bg-black dark:bg-blue-600 text-white border-black dark:border-blue-600 hover:bg-black! dark:hover:bg-blue-700! hover:text-white!"
                : "bg-white dark:bg-slate-900 border-black dark:border-slate-800 text-black! dark:text-slate-300! hover:text-black! dark:hover:text-blue-400!"
                }`}
              onClick={() => setViewMode("table")}
            />
          </div>

          {/* Sort By Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent border border-[#CAD2DB] h-12 text-gray-900 dark:text-slate-100 cursor-pointer rounded-lg"
              >
                <ArrowDownUp className="size-5 text-gray-500 dark:text-slate-400" />
                Sort By
                <ChevronDown className="size-5 text-gray-500 dark:text-slate-400" />
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
                className={`rounded-md cursor-pointer ${sortBy === "startDate" ? "bg-indigo-50 text-indigo-600" : ""
                  }`}
                onClick={() => setSortBy("startDate")}
              >
                Starting Date
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`rounded-md cursor-pointer ${sortBy === "endDate" ? "bg-indigo-50 text-indigo-600" : ""
                  }`}
                onClick={() => setSortBy("endDate")}
              >
                Ending Date
              </DropdownMenuItem>

              <div className="my-1 border-t border-border" />

              {/* Order Selection */}
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Order
              </div>
              <DropdownMenuItem
                className={`rounded-md cursor-pointer ${sortOrder === "asc" ? "bg-indigo-50 text-indigo-600" : ""
                  }`}
                onClick={() => setSortOrder("asc")}
              >
                Ascending
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`rounded-md cursor-pointer ${sortOrder === "desc" ? "bg-indigo-50 text-indigo-600" : ""
                  }`}
                onClick={() => setSortOrder("desc")}
              >
                Descending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent border border-[#CAD2DB] h-12 text-gray-900 dark:text-slate-100 cursor-pointer rounded-lg"
              >
                <Filter className="size-5 text-gray-500 dark:text-slate-400" />
                Filter By
                <ChevronDown className="size-5 text-gray-500 dark:text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-white dark:bg-slate-900 border border-[#CAD2DB] dark:border-slate-800"
            >
              <div className="p-2">
                <div className="mb-3">
                  <DropdownSelect
                    placeholderText="Status"
                    dropdownItem={statusOptions}
                    onChange={setStatusFilter}
                    label="Status"
                  />
                </div>
                <div>
                  <DropdownSelect
                    placeholderText="Priority"
                    dropdownItem={priorityOptions}
                    onChange={setPriorityFilter}
                    label="Priority"
                  />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Content */}
      {(isLoading || isFetching) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {viewMode === "table" ? (
            <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-lg">
              <div className="h-[350px] overflow-y-auto overflow-x-auto scrollbar-hide">
                <StaffManagerProjectTable
                  projects={projects as Project[]}
                />
              </div>
              <div className="p-4 border-t border-border dark:border-slate-800">
                <Pagination
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  total={total}
                  itemsPerPage={itemsPerPage}
                  totalPages={totalPages}
                />
              </div>
            </div>
          ) : (
            <div className="min-h-88">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-1">
                {projects?.map((projectData: Project) => {
                  return (
                    <div key={projectData.id}>
                      <StaffManagerProjectCard project={projectData} />
                    </div>
                  );
                })}
              </div>
              {projects.length === 0 && (
                <div className="flex flex-col items-center justify-center h-60 bg-gray-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-800">
                  <p className="text-gray-500 dark:text-slate-400">No projects found matching your filters.</p>
                </div>
              )}
              {projects.length > 0 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    total={total}
                    itemsPerPage={itemsPerPage}
                    totalPages={totalPages}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllProgramProject;
