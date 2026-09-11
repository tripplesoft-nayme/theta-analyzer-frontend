import {
  AlignStartHorizontal,
  ArrowDownUp,
  ArrowRight,
  ChevronDown,
  TableIcon,
  Search,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useGetEmployeeAllProjectsQuery } from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";
import Pagination from "@/Common/Pagination";
import { useEmployeeId } from "@/hooks/useEmployeeId";
import DropdownSelect from "@/Common/DropdownSelect";
import PrimaryButton from "@/Common/PrimaryButton";
import StaffEmployeeProjectTable from "./StaffEmployeeProjectTable";
import StaffEmployeeProjectCard from "@/pages/staffEmployee/Components/StaffEmployeeProjectCard";
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
export type ProjectPriority = "HIGH" | "MEDIUM" | "LOW";

export interface StaffEmployeeProject {
  id: string;
  programId: string;
  programName?: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  deadline: string;
  progress: number;
  managerId: string;
  viewerId: string;
  chartList: unknown[];
  estimatedCompletedDate: string;
  projectCompleteDate: string | null;
  currentRate: string;
  budget: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;

  projectEmployees?: {
    employee: {
      user: {
        name: string;
        profileImage: string;
      };
    };
  };
  projectViewers?: {
    viewer: {
      user: {
        name: string;
        profileImage: string;
      };
    };
  };
  manager?: {
    user: {
      name: string;
      profileImage: string;
    };
  };
  program?: any;
}

interface AllProgramProjectProps {
  limit?: number;
  showViewAll?: boolean;
  showSearch?: boolean;
  title?: string;
}

const AllProgramProject = ({
  limit = 10,
  showViewAll = true,
  showSearch = false,
  title = "Assigned Programs & Projects",
}: AllProgramProjectProps) => {
  const [viewMode, setViewMode] = useState<"table" | "board">("board");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const itemsPerPage = limit;

  const employeeId = useEmployeeId();

  const { data, isLoading } = useGetEmployeeAllProjectsQuery({
    employeeId: employeeId || "",
    page: currentPage,
    limit: itemsPerPage,
    ...(statusFilter && statusFilter !== "ALL" && { status: statusFilter }),
    ...(priorityFilter &&
      priorityFilter !== "ALL" && { priority: priorityFilter }),
    ...(sortBy && { sortBy }),
    sortOrder: sortOrder,
    ...(showSearch && search && { search }),
  });

  const projects = data?.data?.projects?.data || [];
  const meta = data?.data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? Math.ceil(total / itemsPerPage);
  const statusOptions = [
    { value: "ALL", title: "All Status" },
    { value: "PENDING", title: "PENDING" },
    { value: "COMPLETED", title: "COMPLETED" },
    { value: "PROBLEM", title: "PROBLEM" },
    { value: "OVERDUE", title: "OVERDUE" },
    { value: "DRAFT", title: "DRAFT" },
    { value: "LIVE", title: "LIVE" },
  ];
  const priorityOptions = [
    { value: "ALL", title: "All Priority" },
    { value: "HIGH", title: "High" },
    { value: "MEDIUM", title: "Medium" },
    { value: "LOW", title: "Low" },
    { value: "NORMAL", title: "Default" },
  ];

  if (isLoading) {
    return (
      <div className="pb-6">
        <h2 className="mb-3 text-gray-900 dark:text-slate-100 text-xl font-medium">{title}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // if (projects.length === 0) {
  //   return (
  //     <>
  //       <h4 className="mb-3 text-gray-900 text-xl font-semibold">{title}</h4>
  //       <div className="border border-[#E2E8F0] rounded-lg flex items-center justify-center h-96 text-gray-500 text-xl">
  //         Yet no projects found
  //       </div>
  //     </>
  //   );
  // }

  return (
    <div className="pb-6 min-h-[500px]">
      {/* Header  */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 gap-4">
        <h2 className=" text-gray-900 dark:text-slate-100 text-xl font-medium">{title}</h2>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          {!showSearch && (
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400 dark:text-slate-500 size-4" />
              <input
                value={search}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search project..."
                className="pl-9 pr-4 py-3 border border-[#CAD2DB] dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="flex items-center gap-2 bg-transparent dark:bg-slate-900 border border-[#CAD2DB] dark:border-slate-800 h-12 text-gray-900 dark:text-slate-100"
              >
                <ArrowDownUp className="size-5" /> Sort By{" "}
                <ChevronDown className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white dark:bg-slate-900 border border-[#CAD2DB] dark:border-slate-800 p-1"
            >
              {/* Field Selection */}
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                Field
              </div>
              <DropdownMenuItem
                className={`rounded-md cursor-pointer dark:text-slate-100 hover:dark:bg-slate-800 ${sortBy === "startDate" ? "bg-indigo-50 dark:bg-blue-500/10 text-indigo-600 dark:text-blue-400" : ""
                  }`}
                onClick={() => setSortBy("startDate")}
              >
                Start Date
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`rounded-md cursor-pointer dark:text-slate-100 hover:dark:bg-slate-800 ${sortBy === "endDate" ? "bg-indigo-50 dark:bg-blue-500/10 text-indigo-600 dark:text-blue-400" : ""
                  }`}
                onClick={() => setSortBy("endDate")}
              >
                End Date
              </DropdownMenuItem>
              <div className="my-1 border-t border-border dark:border-slate-800" />

              {/* Order Selection */}
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                Order
              </div>
              <DropdownMenuItem
                className={`rounded-md cursor-pointer dark:text-slate-100 hover:dark:bg-slate-800 ${sortOrder === "asc" ? "bg-indigo-50 dark:bg-blue-500/10 text-indigo-600 dark:text-blue-400" : ""
                  }`}
                onClick={() => setSortOrder("asc")}
              >
                Ascending
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`rounded-md cursor-pointer dark:text-slate-100 hover:dark:bg-slate-800 ${sortOrder === "desc" ? "bg-indigo-50 dark:bg-blue-500/10 text-indigo-600 dark:text-blue-400" : ""
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
                className="flex items-center gap-2 bg-transparent dark:bg-slate-900 border border-[#CAD2DB] dark:border-slate-800 h-12 text-gray-900 dark:text-slate-300"
              >
                <ArrowDownUp className="size-5 rotate-90" /> Filter By{" "}
                <ChevronDown className="size-5" />
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
      {viewMode === "table" ? (
        <div className="">
          <StaffEmployeeProjectTable
            projects={projects as StaffEmployeeProject[]}
            isLoading={isLoading}
          />

          {showViewAll ? (
            <div className="pt-2">
              <Link to="/staff-employee-panel/projects">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                >
                  {/* Display total count */}
                  View all
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              total={projects.length}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
            />
          )}
        </div>
      ) : (
        <div className="rounded-md min-h-88">
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {projects?.map((projectData: StaffEmployeeProject) => {
              return (
                <div key={projectData.id}>
                  <StaffEmployeeProjectCard project={projectData} />
                </div>
              );
            })}
          </div>
          {showViewAll ? (
            <div className="pt-2">
              <Link to="/staff-employee-panel/projects">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                >
                  {/* Display total count */}
                  View all
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-3">
              <Pagination
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                total={projects.length}
                itemsPerPage={itemsPerPage}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllProgramProject;
