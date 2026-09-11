/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import PriorityDropdown from "./PriorityDropdown";
import //   useUpdateProjectMutation,
  "@/store/Api/ProjectApi/ProjectApi";
import Pagination from "@/Common/Pagination";
// import { IProject } from "@/types/project";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetProjectsByProgramIdQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { Progress } from "@/components/ui/progress";
import { ProjectTableSkeleton } from "@/Common/Skeleton/Skeleton";
import { useGetUser } from "@/hooks/useGetUser";
import UpdateProjectModal from "./UpdateProjectModal";
// import { useUpdateProjectMutation } from "@/store/Api/ProjectApi/ProjectApi";
import { UpdateProjectPayload } from "@/types/Projects";
import { useDeleteProjectMutation } from "@/store/Api/ProjectApi/ProjectApi";
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
import { ReusableTable, ReusableTableColumn } from "@/components/ui/ReusableTable";
// import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";

// import EditProjectModal from "./EditProjectModal";

interface IProjectTableProps {
  title?: string;
  programId: string;
}

export type ProjectStatus =
  | "LIVE"
  | "RETURNED"
  | "OVERDUE"
  | "DRAFT"
  | "IN_REVIEW"
  | "SUBMITTED"
  | "PENDING"
  | "COMPLETED";

const statusStyles: Record<ProjectStatus, string> = {
  LIVE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  IN_REVIEW: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  RETURNED: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  OVERDUE: "bg-red-50 text-red-700 border-red-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
  COMPLETED: "bg-green-50 text-green-700 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
};

const renderStatusBadge = (status: ProjectStatus) => {
  const normalizedStatus = (status || "DRAFT").toUpperCase() as ProjectStatus;
  const style = statusStyles[normalizedStatus] || statusStyles.DRAFT;
  return (
    <Badge
      variant="outline"
      className={`text-xs px-2 py-1 font-medium rounded-md ${style}`}
    >
      {(status || "DRAFT").replace("_", " ")}
    </Badge>
  );
};

const priorityOrder: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const AllProject = ({
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

  const [editProject, setEditProject] = useState<UpdateProjectPayload | null>(
    null,
  );
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

  const [deleteProject] = useDeleteProjectMutation();

  // const [updateProject] = useUpdateProjectMutation();

  // const handleUpdateProject = async (project: UpdateProjectPayload) => {
  //   console.log(project);
  //   console.log(editProject);
  //   try {
  //     const res = await updateProject({
  //       id: editProject?.id,
  //       ...project,
  //     }).unwrap();
  //     console.log(res);
  //     if (res.success) {
  //       toast.success("Project updated successfully");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("Failed to update project");
  //   }
  // };
  const navigate = useNavigate();

  const projects = useMemo(() => data?.data?.data ?? [], [data]);
  const meta = data?.data?.meta;
  const totalProjects = meta?.total ?? projects.length;
  const { role } = useGetUser();
  const isViewer = role === "VIEWER";

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

  const handleDelete = async (project: UpdateProjectPayload) => {
    try {
      const Swal = (await import("sweetalert2")).default;
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
      });

      if (result.isConfirmed) {
        await deleteProject(project.id).unwrap();
        Swal.fire("Deleted!", "Project removed.", "success");
      }
    } catch (err: any) {
      const Swal = (await import("sweetalert2")).default;
      Swal.fire("Error", err?.data?.message || "Something went wrong", "error");
    }
  };

  const columns: ReusableTableColumn<any>[] = [
    {
      key: "name",
      header: "project",
      sortKey: "name",
      className: "max-w-42",
    },
    {
      key: "assignStaff",
      header: "Assigned Staff",
      render: (project) => (
        <AssignedStaffAvatars
          manager={project.manager}
          employees={project.projectEmployees?.map((pe: any) => pe.employee) || []}
          viewers={project.projectViewers?.map((pv: any) => pv.viewer) || []}
          maxVisible={3}
        />
      ),
    },
    {
      key: "status",
      header: "status",
      sortKey: "status",
      render: (project) => renderStatusBadge(project.status),
    },
    {
      key: "priority",
      header: "priority",
      sortKey: "priority",
      render: (project) => <PriorityDropdown defaultPriority={project.priority} />,
    },
    {
      key: "updatedAt",
      header: "updated On",
      sortKey: "updatedAt",
      className: "text-gray-700 dark:text-slate-300",
      render: (project) => formatDate(project.updatedAt),
    },
    {
      key: "deadline",
      header: "deadline",
      sortKey: "deadline",
      className: "text-gray-700 dark:text-slate-300",
      render: (project) => formatDate(project.deadline),
    },
    {
      key: "progress",
      header: "progress",
      sortKey: "progress",
      className: "w-[180px]",
      render: (project) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 dark:text-slate-500">
            {project.progress}%
          </span>
          <Progress value={project.progress} />
        </div>
      ),
    },
  ];

  if (!isViewer) {
    columns.push({
      key: "actions",
      header: "actions",
      render: (project) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditProject(project);
              setEditModalOpen(true);
            }}
            className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-500/10 p-1.5 rounded-md transition-colors"
          >
            <FaEdit className="text-blue-600 dark:text-blue-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(project);
            }}
            className="cursor-pointer hover:bg-red-50 dark:hover:bg-rose-500/10 p-1.5 rounded-md transition-colors"
          >
            <FaTrash className="text-red-600 dark:text-rose-400" />
          </button>
        </div>
      ),
    });
  }

  return (
    <div className="min-h-fit w-full">
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800">
          <h1 className="text-lg font-semibold text-primary-text dark:text-slate-100">{title}</h1>

          <div className="flex gap-3 items-center">
            <input
              value={search}
              onChange={(e) => {
                setCurrentPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search project..."
              className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />

            <Select
              onValueChange={(value) => {
                setCurrentPage(1);
                setPriorityFilter(value as any);
              }}
            >
              <SelectTrigger className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-300 px-4 py-2 rounded min-w-30">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                <SelectGroup>
                  <SelectLabel>Filter By Priority</SelectLabel>
                  {["All", "HIGH", "MEDIUM", "LOW"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-6">
            <ProjectTableSkeleton />
          </div>
        ) : (
          <ReusableTable
            data={sortedProjects}
            columns={columns}
            rowKey={(p) => p.id}
            onRowClick={(p) => navigate(`project-details/${p.id}`)}
            sortKey={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
            emptyState={
              <div className="h-48 flex items-center justify-center text-gray-500 dark:text-slate-500">
                No projects found.
              </div>
            }
          />
        )}

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
        // onSubmit={handleUpdateProject}
        />
      )}
    </div>
  );
};

export default AllProject;
