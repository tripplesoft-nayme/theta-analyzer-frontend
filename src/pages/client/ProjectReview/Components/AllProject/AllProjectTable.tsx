/* eslint-disable @typescript-eslint/no-explicit-any */
import { Eye, Flag, Trash2, Radio } from "lucide-react";
import { useState } from "react";
import { useDeleteProjectMutation } from "@/store/Api/ProjectApi/ProjectApi";
import { useDeleteEmployeeSubmissionMutation } from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReusableTable, ReusableTableColumn } from "@/components/ui/ReusableTable";

import ProjectModal from "./ProjectModal";
import { useNavigate, useLocation } from "react-router-dom";
// import { Checkbox } from "@/components/ui/checkbox";
import { AssignedStaffAvatars } from "@/Common/AssignedStaffAvatars";
import { Project } from "@/store/Api/ProjectApi/ProjectType";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type SortKey =
  | "programName"
  | "name"
  | "status"
  | "priority"
  | "startDate"
  | "deadline"
  | "progress";

export type SortOrder = "asc" | "desc";

/* -------------------------------------------------------------------------- */
/*                                   UTILS                                    */
/* -------------------------------------------------------------------------- */
export type ProjectStatus =
  | "LIVE"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "PENDING"
  | "REJECTED"
  | "OVERDUE"
  | "APPROVED"
  | "DRAFT"
  | "PREVIEW";
const statusStyles: Record<ProjectStatus, string> = {
  LIVE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  IN_REVIEW: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  OVERDUE: "bg-red-50 text-red-700 border-red-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  APPROVED: "bg-green-50 text-green-700 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  PREVIEW: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
};

const renderStatusBadge = (status: ProjectStatus) => (
  <Badge
    variant="outline"
    className={`text-xs px-2 py-1 font-medium ${statusStyles[status]}`}
  >
    {status.replace("_", " ")}
  </Badge>
);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const priorityColors: Record<Project["priority"], string> = {
  HIGH: "text-red-600 dark:text-rose-400",
  MEDIUM: "text-orange-600 dark:text-amber-400",
  LOW: "text-blue-600 dark:text-blue-400",
  NORMAL: "text-gray-600 dark:text-slate-400",
};

const renderPriority = (priority: Project["priority"]) => (
  <div className="flex items-center gap-1">
    <Flag className={`w-4 h-4 ${priorityColors[priority]}`} />
    <span className={`text-sm font-medium ${priorityColors[priority]}`}>
      {priority}
    </span>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                               COMPONENT                                    */
/* -------------------------------------------------------------------------- */

const AllProjectTable = ({
  projects,
  sortKey,
  sortOrder,
  onSort,
}: {
  projects: any[];
  sortKey: SortKey | null;
  sortOrder: SortOrder;
  onSort: (key: SortKey) => void;
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openProjectModal, setOpenProjectModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const baseUrl = location.pathname.split("/")[1];
  const getReviewPath = (p: any) => {
    let path = "";
    if (p.status?.toUpperCase() === "PREVIEW") {
      path = `/staff-employee-panel/project-review/submission-preview/${p.submissionId}/${p.projectId}`;
    } else {
      path = `${p.submissionId}/${p.projectId}`;
    }
    if (p.isFileSubmission) {
      path += "?tab=files";
    }
    return path;
  };
  const isEmployee = baseUrl === "staff-employee-panel";
  // const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteProject] = useDeleteProjectMutation();
  const [deleteEmployeeSubmission] = useDeleteEmployeeSubmissionMutation();

  const handleSort = (key: SortKey) => {
    onSort(key);
  };

  // const toggleSelectAll = (checked: boolean) => {
  //   if (checked) {
  //     setSelectedIds(projects.map((p) => p.id));
  //   } else {
  //     setSelectedIds([]);
  //   }
  // };

  // const toggleSelectIndividual = (id: string, checked: boolean) => {
  //   if (checked) {
  //     setSelectedIds((prev) => [...prev, id]);
  //   } else {
  //     setSelectedIds((prev) => prev.filter((pId) => pId !== id));
  //   }
  // };

  const handleDelete = async (projectIdOrSubmissionId: string, projectName: string) => {
    try {
      const Swal = (await import("sweetalert2")).default;
      const result = await Swal.fire({
        title: "Are you sure?",
        text: isEmployee
          ? `Do you want to delete this submission? This action cannot be undone!`
          : `Do you want to delete "${projectName}"? This action cannot be undone!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        if (isEmployee) {
          await deleteEmployeeSubmission(projectIdOrSubmissionId).unwrap();
          Swal.fire("Deleted!", "Submission has been deleted.", "success");
        } else {
          await deleteProject(projectIdOrSubmissionId).unwrap();
          Swal.fire("Deleted!", "Project has been deleted.", "success");
        }
      }
    } catch (err: unknown) {
      const Swal = (await import("sweetalert2")).default;
      Swal.fire(
        "Error",
        (err as any)?.data?.message || "Failed to delete item",
        "error",
      );
    }
  };
  const columns: ReusableTableColumn<any>[] = [
    {
      key: "name",
      header: "Submitted Project Name",
      sortKey: "name",
      headerClassName: "text-left justify-start",
      className: "text-left",
      render: (project) => (
        <span className="block truncate max-w-[180px] md:max-w-none">
          {project.name}
        </span>
      ),
    },
    {
      key: "assignStaff",
      header: "Assign Staff",
      headerClassName: "text-center justify-center",
      render: (project) => (
        <div className="flex justify-center">
          <AssignedStaffAvatars
            manager={project.manager}
            employees={project.projectEmployees?.map((pe: any) => pe.employee) || []}
            viewers={project.projectViewers?.map((pv: any) => pv.viewer) || []}
            maxVisible={3}
          />
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortKey: "status",
      headerClassName: "text-center justify-center",
      className: "text-center",
      render: (project) => renderStatusBadge(project.status),
    },
    {
      key: "priority",
      header: "Priority",
      sortKey: "priority",
      headerClassName: "text-center justify-center",
      render: (project) => (
        <div className="flex justify-center">
          {renderPriority(project.priority)}
        </div>
      ),
    },
    {
      key: "startDate",
      header: "Submit Date",
      sortKey: "startDate",
      headerClassName: "text-center justify-center",
      className: "whitespace-nowrap text-gray-600 dark:text-slate-400 text-center",
      render: (project) => formatDate(project.startDate),
    },
    {
      key: "actions",
      header: "Action",
      headerClassName: "text-center justify-center",
      className: "text-center",
      render: (project) => (
        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
          {project.status === "APPROVED" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                const path =
                  baseUrl === "staff-employee-panel" ||
                    baseUrl === "staff-manager-panel"
                    ? `/${baseUrl}/projects/project-details/${project.projectId || project.project?.id}`
                    : `/${baseUrl}/project-details/${project.projectId || project.project?.id}`;
                navigate(path);
              }}
              className="h-8 w-8 p-0 cursor-pointer dark:hover:bg-slate-800"
              title="View Live Project"
            >
              <Radio className="size-[18px] text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProject(project);
              navigate(getReviewPath(project), { state: { status: project.status } });
            }}
            className="h-8 w-8 p-0 cursor-pointer dark:hover:bg-slate-800"
          >
            <Eye className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </Button>
          {baseUrl !== "staff-manager-panel" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(project.id, project.name);
              }}
              className="h-8 w-8 p-0 cursor-pointer dark:hover:bg-slate-800"
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-rose-400" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card className="shadow-none border-none p-0 bg-transparent">
      <CardContent className="p-0 min-h-[420px] overflow-hidden">
        <ReusableTable
          data={projects}
          columns={columns}
          rowKey={(p) => p.id}
          onRowClick={(p) => navigate(getReviewPath(p), { state: { status: p.status } })}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={handleSort}
          padEmptyRowsTo={10}
          emptyState={
            <span className="text-gray-500 dark:text-slate-500">
              No submissions found
            </span>
          }
        />
      </CardContent>

      {openProjectModal && (
        <ProjectModal
          project={selectedProject as Project}
          open={openProjectModal}
          setOpen={setOpenProjectModal}
        />
      )}
    </Card>
  );
};

export default AllProjectTable;
