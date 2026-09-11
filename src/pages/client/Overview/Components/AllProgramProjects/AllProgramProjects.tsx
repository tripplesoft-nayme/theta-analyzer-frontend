import {
  AlignStartHorizontal,
  ArrowDownUp,
  ChevronDown,
  Filter,
  TableIcon,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useGetAllProjectsQuery } from "@/store/Api/ProjectApi/ProjectApi";
import PrimaryButton from "@/Common/PrimaryButton";
import DropdownSelect from "@/Common/DropdownSelect";
import Pagination from "@/Common/Pagination";
import ProjectCard from "./ProjectCard";
import AllProgramTable from "./AllProgramTable";
import ProjectCardSkeleton from "@/Common/Skeleton/ProjectCardSkeleton";

export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type ProjectStatus =
  | "LIVE"
  | "PENDING"
  | "RETURNED"
  | "OVERDUE"
  | "DRAFT"
  | "IN_REVIEW"
  | "COMPLETED"
  | "SUBMITTED";
export type ProjectPriority = "HIGH" | "MEDIUM" | "LOW" | "NORMAL";

export interface StaffEmployeeProject {
  id: string;
  programId: string;
  programName?: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  progress: number;
  managerId: string;
  viewerId: string;
  chartList: unknown[];
  estimatedCompletedDate: string;
  projectEmployees: unknown[];
  projectViewers: unknown[];
  manager: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      profileImage: string | null;
      role: string;
    };
  };
  projectCompleteDate: string | null;
  currentRate: string;
  budget: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

const AllProgramProject = () => {
  const [viewMode, setViewMode] = useState<"table" | "board">("board");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortBy, setSortBy] = useState<string>("startDate");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 4;

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter]);

  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      sortOrder,
    };
    if (statusFilter && statusFilter !== "all" && statusFilter !== "ALL") params.status = statusFilter;
    if (priorityFilter && priorityFilter !== "all" && priorityFilter !== "ALL") params.priority = priorityFilter;
    if (sortBy) params.sortBy = sortBy;
    return params;
  }, [currentPage, statusFilter, priorityFilter, sortBy, sortOrder]);

  const { data, isLoading, isFetching } = useGetAllProjectsQuery(queryParams);

  const projects = useMemo(
    () => data?.data?.projects?.data || data?.data?.projects || [],
    [data],
  );
  const meta = data?.data?.meta || data?.data?.projects?.meta;
  const totalProjects = meta?.total ?? projects.length;
  const totalPages =
    meta?.totalPages ??
    data?.data?.projects?.totalPages ??
    Math.ceil(totalProjects / ITEMS_PER_PAGE);

  const statusOptions = [
    { value: "all", title: "All Status" },
    { value: "LIVE", title: "Live" },
    { value: "OVERDUE", title: "Overdue" },
    { value: "DRAFT", title: "Draft" },
  ];

  const priorityOptions = [
    { value: "all", title: "All Priority" },
    { value: "HIGH", title: "High" },
    { value: "MEDIUM", title: "Medium" },
    { value: "LOW", title: "Low" },
  ];

  return (
    <div className="pt-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-slate-100">
          All Program & Project
        </h2>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-3">
            <PrimaryButton
              type="Primary"
              title="Boards"
              leftIcon={<AlignStartHorizontal className="w-4 h-4" />}
              className={`${viewMode === "board"
                ? "bg-black dark:bg-blue-600 text-white border-brand-primary dark:border-blue-600 hover:bg-black! dark:hover:bg-blue-700! hover:text-white!"
                : "bg-white dark:bg-slate-900 border-black dark:border-slate-800 text-black! dark:text-slate-300! hover:text-black! dark:hover:text-blue-400!"
                }`}
              onClick={() => setViewMode("board")}
            />
            <PrimaryButton
              type="Primary"
              title="Tables"
              leftIcon={<TableIcon className="w-4 h-4" />}
              className={`${viewMode === "table"
                ? "bg-black dark:bg-blue-600 text-white border-brand-primary dark:border-blue-600 hover:bg-black! dark:hover:bg-blue-700! hover:text-white!"
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
                className="flex items-center gap-2 bg-transparent border border-[#CAD2DB] dark:border-slate-800 h-12 text-gray-900 dark:text-slate-100 cursor-pointer shadow-sm rounded-lg"
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
                className="flex items-center gap-2 bg-transparent border border-[#CAD2DB] dark:border-slate-800 h-12 text-gray-900 dark:text-slate-100 cursor-pointer shadow-sm rounded-lg"
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : viewMode === "table" ? (
        <>
          <AllProgramTable projects={projects} isLoading={false} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              total={totalProjects}
              itemsPerPage={ITEMS_PER_PAGE}
              totalPages={totalPages}
            />
          )}
        </>
      ) : (
        <>
          <div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {projects.length > 0 ? (
                projects.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="w-full col-span-full flex items-center justify-center h-96 text-gray-500 dark:text-slate-400 text-xl">
                  No projects found
                </div>
              )}
            </div>
          </div>
          {totalPages > 1 && (
            <div className="pt-6 flex justify-center">
              <Pagination
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                total={totalProjects}
                itemsPerPage={ITEMS_PER_PAGE}
                totalPages={totalPages}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllProgramProject;
