import { Eye, Flag } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { AssignedStaffAvatars } from "@/Common/AssignedStaffAvatars";
// import DeleteModal from "@/Common/Modal/DeleteModal";
// import { useDeleteManagerProjectMutation } from "@/store/Api/staffManagerApi/StaffManagerApi";
// import EditProjectModal from "./EditProjectModal";
import { useNavigate } from "react-router-dom";
import { ProjectEmployee, ProjectViewer, ProjectUser } from "@/store/Api/ProjectApi/ProjectType";

export type ProjectStatus =
  | "LIVE"
  | "RETURNED"
  | "OVERDUE"
  | "DRAFT"
  | "IN_REVIEW"
  | "SUBMITTED"
  | "PENDING"
  | "COMPLETED";

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

  projectEmployees?: ProjectEmployee[];
  projectViewers?: ProjectViewer[];
  manager?: {
    id: string;
    userId: string;
    user: ProjectUser;
  };
}

interface StaffEmployeeProjectTableProps {
  projects: StaffEmployeeProject[];
}

/* -------------------------------------------------------------------------- */
/*                                   UTILS                                    */
/* -------------------------------------------------------------------------- */

const statusStyles: Record<ProjectStatus, string> = {
  LIVE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  IN_REVIEW: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  RETURNED: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  OVERDUE: "bg-red-50 text-red-700 border-red-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  COMPLETED: "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
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

const priorityColors: Record<ProjectPriority, string> = {
  HIGH: "text-red-600 dark:text-rose-400",
  MEDIUM: "text-orange-600 dark:text-orange-400",
  LOW: "text-blue-600 dark:text-blue-400",
  NORMAL: "text-blue-600 dark:text-blue-400",
};

const renderPriority = (priority: ProjectPriority) => (
  <div className="flex items-center gap-1">
    <Flag className={`w-4 h-4 ${priorityColors[priority]}`} />
    <span className={`text-sm font-medium ${priorityColors[priority]}`}>
      {priority}
    </span>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                                 MODAL                                      */
/* -------------------------------------------------------------------------- */

const ProjectModal = ({
  project,
  open,
  setOpen,
}: {
  project: StaffEmployeeProject;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            {project.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground dark:text-slate-400">
            Project details overview
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="px-6 py-6 space-y-6 text-gray-700 dark:text-slate-300">
        <div className="text-sm">
          <p className="text-muted-foreground dark:text-slate-400 mb-1">Project ID</p>
          <p className="font-medium text-gray-900 dark:text-slate-100">{project.id}</p>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground dark:text-slate-400 mb-1">Status</p>
          {renderStatusBadge(project.status)}
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground dark:text-slate-400 mb-1">Deadline</p>
          <p className="font-medium text-gray-900 dark:text-slate-100">
            {formatDate(project.deadline)}
          </p>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground dark:text-slate-400 mb-1">Priority</p>
          {renderPriority(project.priority)}
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground dark:text-slate-400 mb-1">Progress</p>
          <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <p className="mt-1 text-sm font-medium text-gray-900 dark:text-slate-100">{project.progress}%</p>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground dark:text-slate-400 mb-1">Description</p>
          <p className="leading-relaxed">
            {project.description || "No description provided."}
          </p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2">
        <Button variant="outline" onClick={() => setOpen(false)} className="dark:border-slate-800 dark:hover:bg-slate-800">
          Close
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

const StaffManagerProjectTable = ({
  projects,
}: StaffEmployeeProjectTableProps) => {
  const navigate = useNavigate();
  const [selectedProject,] =
    useState<StaffEmployeeProject | null>(null);
  const [open, setOpen] = useState(false);

  // const handleViewProject = (project: StaffEmployeeProject) => {
  //   setSelectedProject(project);
  //   setOpen(true);
  // };

  // const [deleteProject] = useDeleteManagerProjectMutation();

  // const handleDelete = (id: string) => {
  //   deleteProject({ id });
  //   setOpen(false);
  // };

  return (
    <Card className="w-full shadow-none border-none p-0 overflow-hidden">
      <CardContent className="p-0 w-full overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-slate-800 bg-[#F7F9FA] dark:bg-slate-900">
              <TableHead className="px-6 py-3.5 text-gray-900 dark:text-slate-300 font-semibold">Program</TableHead>
              <TableHead className="px-6 py-3.5 text-gray-900 dark:text-slate-300 font-semibold">Project</TableHead>
              <TableHead className="px-6 py-3.5 text-gray-900 dark:text-slate-300 font-semibold">Status</TableHead>
              <TableHead className="px-6 py-3.5 text-gray-900 dark:text-slate-300 font-semibold">Assigned People</TableHead>
              <TableHead className="px-6 py-3.5 text-gray-900 dark:text-slate-300 font-semibold">Priority</TableHead>
              <TableHead className="px-6 py-3.5 text-gray-900 dark:text-slate-300 font-semibold">Started On</TableHead>
              <TableHead className="px-6 py-3.5 text-gray-900 dark:text-slate-300 font-semibold">Deadline</TableHead>
              <TableHead className="px-6 py-3.5 text-gray-900 dark:text-slate-300 font-semibold">Progress</TableHead>
              <TableHead className="px-6 py-3.5 text-gray-900 dark:text-slate-300 font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects?.map((project) => (
              <TableRow
                key={project.id}
                className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 odd:bg-white dark:odd:bg-slate-900 even:bg-[#F7F9FA] dark:even:bg-slate-900/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/staff-manager-panel/projects/project-details/${project.id}`)}
              >
                <TableCell className="px-6 py-3.5 font-medium text-gray-900 dark:text-slate-300">
                  {project.programName || "Program Name"}
                </TableCell>

                <TableCell className="px-6 py-3.5 font-medium text-gray-900 dark:text-slate-300">
                  {project.name}
                </TableCell>

                <TableCell className="px-6 py-3.5">
                  {renderStatusBadge(project.status)}
                </TableCell>

                <TableCell className="px-6 py-3.5">
                  <AssignedStaffAvatars
                    manager={project.manager}
                    employees={project.projectEmployees?.map((pe) => pe.employee) || []}
                    viewers={project.projectViewers?.map((pv) => pv.viewer) || []}
                    maxVisible={3}
                  />
                </TableCell>

                <TableCell className="px-6 py-3.5">
                  {renderPriority(project.priority)}
                </TableCell>

                <TableCell className="px-6 py-3.5 text-gray-600 dark:text-slate-400">
                  {formatDate(project.startDate)}
                </TableCell>

                <TableCell className="px-6 py-3.5 text-gray-600 dark:text-slate-400">
                  {formatDate(project.deadline)}
                </TableCell>

                <TableCell className="px-6 py-3.5 text-gray-600 dark:text-slate-400 flex items-center gap-2">
                  <Progress value={project.progress} className="h-2" />
                  <span className="font-medium text-gray-900 dark:text-slate-300">{project.progress}%</span>
                </TableCell>

                <TableCell className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/staff-manager-panel/projects/project-details/${project.id}`)}
                    >
                      <Eye className="w-4 h-4 text-[#1C73E0]" />
                    </Button>

                    {/* <EditProjectModal id={project.id} /> */}

                    {/* <DeleteModal
                      deletingItemTitle={project.name}
                      deletingItemId={project.id}
                      onDelete={handleDelete}
                    /> */}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {selectedProject && (
        <ProjectModal project={selectedProject} open={open} setOpen={setOpen} />
      )}
    </Card>
  );
};

export default StaffManagerProjectTable;
