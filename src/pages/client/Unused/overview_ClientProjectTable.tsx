import { Edit, Eye, Flag, Trash2 } from "lucide-react";
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
import { AssignedStaffAvatars } from "@/components/client/AssignedStaffAvatars";
import { Progress } from "@/components/ui/progress";
import {
  Project,
  ProjectEmployee,
  ProjectViewer,
} from "@/store/Api/ProjectApi/ProjectType";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type ProjectStatus =
  | "LIVE"
  | "RETURNED"
  | "OVERDUE"
  | "DRAFT"
  | "IN_REVIEW"
  | "COMPLETED"
  | "SUBMITTED"
  | "PENDING";

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
}

interface ClientProjectTableProps {
  projects: StaffEmployeeProject[];
}

/* -------------------------------------------------------------------------- */
/*                                   UTILS                                    */
/* -------------------------------------------------------------------------- */

const statusStyles: Record<ProjectStatus, string> = {
  LIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_REVIEW: "bg-indigo-50 text-indigo-700 border-indigo-200",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  RETURNED: "bg-orange-50 text-orange-700 border-orange-200",
  OVERDUE: "bg-red-50 text-red-700 border-red-200",
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
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
  HIGH: "text-red-600",
  MEDIUM: "text-orange-600",
  LOW: "text-blue-600",
  NORMAL: "text-gray-600",
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
    <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {project.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Project details overview
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Project ID</p>
          <p className="font-medium text-gray-900">{project.id}</p>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Status</p>
          {renderStatusBadge(project.status)}
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Deadline</p>
          <p className="font-medium text-gray-900">
            {formatDate(project.deadline)}
          </p>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Priority</p>
          {renderPriority(project.priority)}
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Progress</p>
          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <p className="mt-1 text-sm font-medium">{project.progress}%</p>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Description</p>
          <p className="leading-relaxed">
            {project.description || "No description provided."}
          </p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-slate-50 flex justify-end gap-2">
        <Button variant="outline" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

/* -------------------------------------------------------------------------- */
/*                               TABLE                                        */
/* -------------------------------------------------------------------------- */

const ClientProjectTable = ({
  projects,
}: ClientProjectTableProps) => {
  const [selectedProject, setSelectedProject] =
    useState<StaffEmployeeProject | null>(null);
  const [open, setOpen] = useState(false);

  const handleViewProject = (project: StaffEmployeeProject) => {
    setSelectedProject(project);
    setOpen(true);
  };

  return (
    <Card className="w-full shadow-none border-none">
      <CardContent className="p-0 border border-[#E2E8F0] rounded-lg w-full min-h-[420px]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-[#F7F9FA]">
              <TableHead className="px-6 py-3.5">Program</TableHead>
              <TableHead className="px-6 py-3.5">Project</TableHead>
              <TableHead className="px-6 py-3.5">Status</TableHead>
              <TableHead className="px-6 py-3.5">Assigned People</TableHead>
              <TableHead className="px-6 py-3.5">Priority</TableHead>
              <TableHead className="px-6 py-3.5">Started On</TableHead>
              <TableHead className="px-6 py-3.5">Deadline</TableHead>
              <TableHead className="px-6 py-3.5">Progress</TableHead>
              <TableHead className="px-6 py-3.5">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects?.map((project) => (
              <TableRow
                key={project.id}
                className="border-b border-gray-200 hover:bg-muted/30 odd:bg-white even:bg-[#F7F9FA]"
              >
                <TableCell className="px-6 py-3.5 font-medium">
                  {project.programName || "Program Name"}
                </TableCell>

                <TableCell className="px-6 py-3.5 font-medium">
                  {project.name}
                </TableCell>

                <TableCell className="px-6 py-3.5">
                  {renderStatusBadge(project.status)}
                </TableCell>

                <TableCell className="px-6 py-3.5">
                  <AssignedStaffAvatars
                    manager={(project as unknown as Project).manager}
                    employees={
                      project.projectEmployees?.map(
                        (pe: ProjectEmployee) => pe.employee,
                      ) || []
                    }
                    viewers={
                      project.projectViewers?.map(
                        (pv: ProjectViewer) => pv.viewer,
                      ) || []
                    }
                    maxVisible={3}
                  />
                </TableCell>

                <TableCell className="px-6 py-3.5">
                  {renderPriority(project.priority)}
                </TableCell>

                <TableCell className="px-6 py-3.5 text-muted-foreground">
                  {formatDate(project.startDate)}
                </TableCell>

                <TableCell className="px-6 py-3.5 text-muted-foreground">
                  {formatDate(project.deadline)}
                </TableCell>

                <TableCell className="px-6 py-3.5 text-muted-foreground flex items-center gap-2">
                  <Progress value={project.progress} className="h-2" />
                  <span className="font-medium">{project.progress}%</span>
                </TableCell>

                <TableCell className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProject(project)}
                    >
                      <Eye className="w-4 h-4 text-[#1C73E0]" />
                    </Button>

                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4 text-[#169E7B]" />
                    </Button>

                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-[#B00020]" />
                    </Button>
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

export default ClientProjectTable;
