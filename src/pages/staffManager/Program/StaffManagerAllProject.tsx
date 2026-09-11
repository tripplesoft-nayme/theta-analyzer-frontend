/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { FaSpinner, FaEye } from "react-icons/fa";
import PriorityDropdown from "@/pages/client/Program/Components/PriorityDropdown";
import Pagination from "@/Common/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetProjectsByProgramIdQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssignedStaffAvatars } from "@/Common/AssignedStaffAvatars";
import UpdateProjectModal from "@/pages/client/Program/Components/UpdateProjectModal";

interface IProjectTableProps {
  title?: string;
  programId: string;
}

const priorityOrder: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const StaffManagerAllProject = ({
  title = "All Projects",
  programId,
}: IProjectTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<
    "All" | "HIGH" | "MEDIUM" | "LOW"
  >("All");

  const [sortColumn, setSortColumn] = useState<any | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const debouncedSearch = useDebounce(search, 500);

  const [editProject] = useState<any | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data, isLoading } = useGetProjectsByProgramIdQuery({
    programId,
    args: {
      page: currentPage,
      limit,
      search: debouncedSearch || undefined,
      priority: priorityFilter !== "All" ? priorityFilter : undefined,
    },
  });

  const navigate = useNavigate();

  const projects = useMemo(() => data?.data?.data ?? [], [data]);
  const meta = data?.data?.meta;
  const totalProjects = meta?.total ?? projects.length;
  const itemsPerPage = meta?.limit ?? limit;
  const totalPages =
    meta?.totalPages ?? Math.ceil(totalProjects / itemsPerPage);

  const handleSort = (column: any) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedProjects = useMemo(() => {
    const list = [...projects];

    if (!sortColumn) {
      return list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return list.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (sortColumn === "priority") {
        return sortOrder === "asc"
          ? priorityOrder[aVal as string] - priorityOrder[bVal as string]
          : priorityOrder[bVal as string] - priorityOrder[aVal as string];
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [projects, sortColumn, sortOrder]);

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      : "-";



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <FaSpinner className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 w-full">
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
        {/* Header */}
        <div className="flex justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{title}</h1>

          <div className="flex gap-3 items-center">
            <input
              value={search}
              onChange={(e) => {
                setCurrentPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search project..."
              className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded px-4 py-2 text-sm text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />

            <Select
              value={priorityFilter}
              onValueChange={(value) => {
                setCurrentPage(1);
                setPriorityFilter(value as any);
              }}
            >
              <SelectTrigger className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 rounded min-w-30 text-gray-900 dark:text-slate-300">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                <SelectGroup>
                  <SelectLabel className="text-gray-500 dark:text-slate-400">Filter By Priority</SelectLabel>
                  {["All", "HIGH", "MEDIUM", "LOW"].map((p) => (
                    <SelectItem key={p} value={p} className="dark:focus:bg-slate-800 cursor-pointer">
                      {p}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-900/50 h-12 border-b border-gray-200 dark:border-slate-800">
            <tr>
              {[
                "project",
                "Assigned Staff",
                "priority",
                "updated On",
                "deadline",
                "progress",
                // Staff Manager might not need edit/delete actions for projects, but user says "same functionality". So we keep or remove.
                // Keeping them for now, but commented out if we want to be safe. "same functionality" probably means identically to client.
                "actions",
              ].map(
                (col) =>
                  col && (
                    <th
                      key={col}
                      onClick={
                        col !== "actions"
                          ? () => handleSort(col as any)
                          : undefined
                      }
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 cursor-pointer capitalize transition-colors hover:text-gray-900 dark:hover:text-slate-100"
                    >
                      {col.replace(/([A-Z])/g, " $1")}
                    </th>
                  ),
              )}
            </tr>
          </thead>

          <tbody className="">
            {sortedProjects.map((project) => {
              return (
                <tr
                  key={project.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer odd:bg-white dark:odd:bg-slate-900 even:bg-gray-100/50 dark:even:bg-slate-900/30 border-b border-border dark:border-slate-800/50 transition-colors"
                  onClick={() =>
                    navigate(
                      `/staff-manager-panel/all-program/program-overview/${programId}/project-details/${project.id}`,
                    )
                  }
                >
                  <td className="px-6 py-4 max-w-42 text-gray-900 dark:text-slate-100">{project.name}</td>
                  <td className="px-6 py-4">
                    <AssignedStaffAvatars
                      manager={project.manager}
                      employees={
                        project.projectEmployees?.map(
                          (pe: any) => pe.employee,
                        ) || []
                      }
                      viewers={
                        project.projectViewers?.map((pv: any) => pv.viewer) ||
                        []
                      }
                      maxVisible={3}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <PriorityDropdown defaultPriority={project.priority} />
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{formatDate(project.updatedAt)}</td>

                  <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{formatDate(project.deadline)}</td>

                  <td className="px-6 py-4 w-[180px]">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500 dark:text-slate-500">
                        {project.progress}%
                      </span>
                      <Progress value={project.progress} />
                    </div>
                  </td>

                  <td className="px-6 py-4 space-x-2">
                    {/* <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditProject(project);
                                                setEditModalOpen(true);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <FaEdit className="text-blue-600" />
                                        </button> */}
                    {/* <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(project);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <FaTrash className="text-red-600" />
                                        </button> */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/staff-manager-panel/all-program/program-overview/${programId}/project-details/${project.id}`,
                        );
                      }}
                      className="cursor-pointer"
                    >
                      <FaEye className="text-blue-600 size-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          total={totalProjects}
          onPageChange={setCurrentPage}
        />
      </div>

      {editModalOpen && editProject && (
        <UpdateProjectModal
          project={editProject}
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default StaffManagerAllProject;
