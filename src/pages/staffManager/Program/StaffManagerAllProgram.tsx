/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import PriorityDropdown from "@/pages/client/Program/Components/PriorityDropdown";
import { useGetAllManagerProgramsForProgramPageQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";
import Pagination from "@/Common/Pagination";
import { IProgram } from "@/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
// import RenderStaffAvatars from "@/components/client/RenderStaffAvater";
import StaffManagerAllProgramSkeleton from "@/Common/Skeleton/pages/staffManager/StaffManagerAllProgramSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetManagerByIdQuery } from "@/store/Api/UserApi/UserApi";

const ManagerAvatarCell = ({ managerId }: { managerId?: string }) => {
  const { data, isLoading } = useGetManagerByIdQuery(managerId, {
    skip: !managerId,
  });

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse border-2 border-white dark:border-slate-900" />
    );
  }

  const manager = data?.data;
  if (!manager) return <span className="text-gray-400 text-xs">N/A</span>;

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-8 h-8 border-2 border-gray-200">
        <AvatarImage src={manager.user?.profileImage || "/placeholder.svg"} />
        <AvatarFallback>
          {manager.user?.name ? manager.user.name.charAt(0).toUpperCase() : "M"}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium text-gray-900 dark:text-slate-100 whitespace-nowrap">
        {manager.user?.name || "Unknown"}
      </span>
    </div>
  );
};

interface IProgramTableProps {
  title?: string;
  hideCreatedOn?: boolean;
}

const priorityOrder: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const StaffManagerAllProgram = ({
  title = "All Program",
  hideCreatedOn = false,
}: IProgramTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<
    "ALL" | "HIGH" | "MEDIUM" | "LOW"
  >("ALL");

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebounce(search, 500);

  // API calls
  const { data, isLoading } = useGetAllManagerProgramsForProgramPageQuery({
    page: currentPage,
    limit,
    programName: debouncedSearch || undefined,
    priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
  });

  const programs = useMemo(() => data?.data?.data ?? [], [data]);
  const meta = data?.data?.meta;
  const navigate = useNavigate();

  const totalPrograms = meta?.total ?? programs.length;
  const itemsPerPage = meta?.limit ?? limit;
  const totalPages =
    meta?.totalPages ?? Math.ceil(totalPrograms / itemsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedPrograms = useMemo(() => {
    const list = [...programs];

    if (!sortColumn) {
      return list;
    }

    return list.sort((a: any, b: any) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortColumn === "programName") {
        valA = a.programName || "";
        valB = b.programName || "";
      } else if (sortColumn === "projects") {
        valA = a.projects?.length || 0;
        valB = b.projects?.length || 0;
      } else if (sortColumn === "assigned Manager") {
        valA = a.managerId || "";
        valB = b.managerId || "";
      } else if (sortColumn === "priority") {
        const pA = priorityOrder[a.priority as string] || 0;
        const pB = priorityOrder[b.priority as string] || 0;
        return sortOrder === "asc" ? pA - pB : pB - pA;
      } else if (sortColumn === "created On") {
        valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      } else if (sortColumn === "updated On" || sortColumn === "updatedAt") {
        valA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        valB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      } else if (sortColumn === "deadline") {
        valA = a.deadline ? new Date(a.deadline).getTime() : 0;
        valB = b.deadline ? new Date(b.deadline).getTime() : 0;
      } else if (sortColumn === "progress") {
        valA = a.progress || 0;
        valB = b.progress || 0;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }, [programs, sortColumn, sortOrder]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalRows = 1;
  const emptyRowsCount = totalRows - sortedPrograms.length;
  const tableRows = [
    ...sortedPrograms,
    ...Array.from({ length: emptyRowsCount }).map(() => null),
  ];

  const handleRowClick = (programId: string) => {
    navigate(`/staff-manager-panel/all-program/program-overview/${programId}`);
  };

  if (isLoading) {
    return <StaffManagerAllProgramSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex md:flex-row flex-col justify-between items-center gap-3 px-6 py-4 border-gray-200 dark:border-slate-800 border-b">
          <h1 className="font-semibold text-gray-900 dark:text-slate-100 text-lg">{title}</h1>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by program name..."
              value={search}
              onChange={(e) => {
                setCurrentPage(1);
                setSearch(e.target.value);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-md w-64 text-sm text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {/* Sort By Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white dark:bg-slate-900 px-4 py-2 pr-8 border border-gray-300 dark:border-slate-800 rounded-lg focus:outline-none text-sm appearance-none cursor-pointer text-gray-700 dark:text-slate-300"
                >
                  <ArrowDownUp className="size-5" />
                  Sort By
                  <ChevronDown className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white dark:bg-slate-900 p-1 border border-[#CAD2DB] dark:border-slate-800 w-56 shadow-lg"
              >
                {/* Field Selection */}
                <div className="px-2 py-1.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Field
                </div>
                <DropdownMenuItem
                  className={`rounded-md cursor-pointer transition-colors ${sortColumn === "programName"
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    }`}
                  onClick={() => setSortColumn("programName")}
                >
                  Program Name
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`rounded-md cursor-pointer transition-colors ${sortColumn === "updatedAt"
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    }`}
                  onClick={() => setSortColumn("updatedAt")}
                >
                  Updated At
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`rounded-md cursor-pointer transition-colors ${sortColumn === "deadline"
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    }`}
                  onClick={() => setSortColumn("deadline")}
                >
                  Deadline
                </DropdownMenuItem>

                <div className="my-1 border-border dark:border-slate-800 border-t" />

                {/* Order Selection */}
                <div className="px-2 py-1.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Order
                </div>
                <DropdownMenuItem
                  className={`rounded-md cursor-pointer transition-colors ${sortOrder === "asc" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    }`}
                  onClick={() => setSortOrder("asc")}
                >
                  Ascending
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`rounded-md cursor-pointer transition-colors ${sortOrder === "desc" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    }`}
                  onClick={() => setSortOrder("desc")}
                >
                  Descending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-md min-w-32 font-semibold text-sm text-gray-700 dark:text-slate-300 outline-none">
                {priorityFilter === "ALL" ? "All Priorities" : priorityFilter}
                <ChevronDown className="w-5 h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border border-[#CAD2DB] dark:border-slate-800 p-1">
                {["ALL", "HIGH", "MEDIUM", "LOW"].map((p) => (
                  <DropdownMenuItem
                    key={p}
                    onClick={() => {
                      setCurrentPage(1);
                      setPriorityFilter(p as any);
                    }}
                    className="rounded-md cursor-pointer text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {p}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 border-b">
              <tr>
                {[
                  "programName",
                  "projects",
                  "assigned Manager",
                  "priority",
                  !hideCreatedOn && "created On",
                  "updated On",
                  "deadline",
                  "progress",
                  // "actions", // Removed Actions column for manager view as per typical permissioning, but can add back if needed
                ].map(
                  (col) =>
                    col && (
                      <th
                        key={col}
                        onClick={() => handleSort(col as keyof IProgram)}
                        className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 capitalize cursor-pointer hover:text-gray-900 dark:hover:text-slate-100 transition-colors`}
                      >
                        {col.toString().replace(/([A-Z])/g, " $1")}
                        {sortColumn === col &&
                          (sortOrder === "asc" ? " ▲" : " ▼")}
                      </th>
                    ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {tableRows.map((program, idx) =>
                program ? (
                  <tr
                    key={program.id}
                    onClick={() => handleRowClick(program.id)}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 h-[60px] cursor-pointer odd:bg-white dark:odd:bg-slate-900 even:bg-gray-50/50 dark:even:bg-slate-900/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm align-middle text-gray-900 dark:text-slate-100">
                      {program.programName}
                    </td>
                    <td className="px-6 py-4 align-middle text-gray-900 dark:text-slate-100">
                      {program?.projects.length}{" "}
                      <span className="text-xs text-gray-500 dark:text-slate-500">
                        Projects
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle text-left">
                      <ManagerAvatarCell
                        managerId={(program as any).managerId}
                      />
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <PriorityDropdown
                        defaultPriority={program.priority}
                      />
                    </td>
                    {!hideCreatedOn && (
                      <td className="px-6 py-4 text-gray-600 dark:text-slate-400 text-sm align-middle">
                        {formatDate(program.createdAt)}
                      </td>
                    )}
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400 text-sm align-middle">
                      {formatDate(program.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400 text-sm">
                      {formatDate(program.deadline)}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 dark:bg-slate-800 rounded-full max-w-[120px] h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-full transition-all shadow-sm shadow-blue-500/20"
                            style={{ width: `${program.progress}%` }}
                          />
                        </div>
                        <span className="text-gray-600 dark:text-slate-400 text-sm font-medium">
                          {program.progress}%
                        </span>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 align-middle">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // handleEditClick(program);
                      }}
                      className="cursor-pointer"
                    >
                       <FaEdit className="text-blue-600" />
                    </button>
                  </div>
                </td> */}
                  </tr>
                ) : (
                  <tr key={`empty-${idx}`} className="h-[60px]">
                    {[
                      "programName",
                      "projects",
                      "assigned Manager",
                      "priority",
                      !hideCreatedOn && "created On",
                      "updated At",
                      "deadline",
                      "progress",
                      // "actions",
                    ]
                      .filter(Boolean)
                      .map((_, i) => (
                        <td
                          key={i}
                          className="px-6 py-4 text-gray-200 text-sm capitalize"
                        >
                          &nbsp;
                        </td>
                      ))}
                  </tr>
                ),
              )}
            </tbody>
          </table>
          {sortedPrograms.length === 0 && (
            <div className="flex justify-center items-center w-full h-[60vh]">
              <h2 className="font-semibold text-gray-200 dark:text-slate-800 text-5xl text-center uppercase">
                No Program Data Available
              </h2>
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          total={totalPrograms}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default StaffManagerAllProgram;
