import {
  AlignStartHorizontal,
  ArrowDownUp,
  ArrowRight,
  ChevronDown,
  Filter,
  TableIcon,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Pagination from "../Pagination";
import { Button } from "@/components/ui/button";
import PrimaryButton from "../../../Common/PrimaryButton";
import DropdownSelect from "../../../Common/DropdownSelect";
import ClientProjectTable from "./ClientProjectTable";
import { Loader2 as Loader } from "lucide-react";
import { useGetAllProjectsQuery } from "@/store/Api/ProjectApi/ProjectApi";
import StaffManagerProjectCard from "@/pages/staffManager/Components/StaffManagerProjectCard";
import { Project, ProjectEmployee, ProjectViewer } from "@/store/Api/ProjectApi/ProjectType";

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
  dateDate: string;
  latitude: number | null;
  longitude: number | null;

  createdAt: string;
  updatedAt: string;

  projectEmployees?: ProjectEmployee[];
  projectViewers?: ProjectViewer[];
  manager?: {
    user: {
      name: string;
      profileImage: string;
    };
  };
}

const AllProgramProject = () => {
  const [viewMode, setViewMode] = useState<"table" | "board">("board");
  const [, setStatusFilter] = useState<string>("all");
  const [, setPriorityFilter] = useState<string>("all");

  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [sortBy, setSortBy] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  const { data, isLoading } = useGetAllProjectsQuery({});

  const projects = data?.data?.projects?.data || [];

  const totalPages = Math.ceil(projects.length / itemsPerPage);

  const statusOptions = [
    { value: "all", title: "All Status" },
    { value: "Live", title: "Live" },
    { value: "Returned", title: "Returned" },
    { value: "Overdue", title: "Overdue" },
    { value: "Draft", title: "Draft" },
    { value: "In Review", title: "In Review" },
    { value: "Submitted", title: "Submitted" },
  ];

  const priorityOptions = [
    { value: "all", title: "All Priority" },
    { value: "High", title: "High" },
    { value: "Medium", title: "Medium" },
    { value: "Low", title: "Low" },
    { value: "Default", title: "Default" },
  ];

  if (isLoading) {
    return <Loader className="animate-spin" />;
  }

  return (
    <div className="pb-6 min-h-[500px]">
      {/* Header  */}
      <div className="flex items-center justify-between pb-6">
        <h4 className=" text-gray-900">All Program & Project</h4>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center  bg-white gap-3">
            <PrimaryButton
              type="Primary"
              title="Boards"
              leftIcon={<AlignStartHorizontal className="w-4 h-4" />}
              className={`${viewMode === "board"
                ? "bg-black text-white border-black hover:bg-black! hover:text-white!"
                : "bg-white border-black text-black! hover:text-black!"
                }`}
              onClick={() => setViewMode("board")}
            />

            <PrimaryButton
              type="Primary"
              title="Tables"
              leftIcon={<TableIcon className="w-4 h-4" />}
              className={`${viewMode === "table"
                ? "bg-black text-white border-black hover:bg-black! hover:text-white!"
                : "bg-white border-black text-black! hover:text-black!"
                }`}
              onClick={() => setViewMode("table")}
            />
          </div>

          {/* Sort By Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent border border-[#CAD2DB] h-12"
              >
                <ArrowDownUp className="size-5" />
                Sort By
                <ChevronDown className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white border border-[#CAD2DB] p-1"
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
                className="flex items-center gap-2 bg-transparent border border-[#CAD2DB] h-12"
              >
                <Filter className="size-5" />
                Filter By
                <ChevronDown className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-white border border-[#CAD2DB]"
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
        <>
          <ClientProjectTable
            projects={projects as StaffEmployeeProject[]}
          />

          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            filteredDataLength={projects.length}
          />
        </>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-5">
            {projects?.map((projectData: StaffEmployeeProject) => {
              return (
                <div key={projectData.id}>
                  <StaffManagerProjectCard project={projectData as unknown as Project} />
                </div>
              );
            })}
          </div>
          {projects.length > 4 && (
            <div className="pt-6">
              <Link to="all-program">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {/* Display total count */}
                  View all {projects.length}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllProgramProject;
