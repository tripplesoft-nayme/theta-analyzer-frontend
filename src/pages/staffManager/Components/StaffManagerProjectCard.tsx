/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flag, Layers, Star } from "lucide-react";
// import RenderStaffAvatars from "../ViewerPanel/RenderStaffAvater";
import { FaStar } from "react-icons/fa6";
// import ProjectDetailsModal from "./overview/ProjectDetailsModal";
import { toast } from "sonner";
import {
  useAddProjectToFavoriteMutation,
  useGetFavoriteProjectsQuery,
  useRemoveProjectFromFavoriteMutation
} from "@/store/Api/staffManagerApi/StaffManagerApi";
import { AssignedStaffAvatars } from "@/Common/AssignedStaffAvatars";
import PrimaryButton from "@/Common/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { Project, ProjectEmployee, ProjectViewer, ProjectUser } from "@/store/Api/ProjectApi/ProjectType";

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

  dateDate: string;
  createdAt: string;
  updatedAt: string;
  dataDate?: string;

  projectEmployees?: ProjectEmployee[];
  projectViewers?: ProjectViewer[];
  manager?: {
    id: string;
    userId: string;
    user: ProjectUser;
  };
}

interface StaffEmployeeProgramCardProps {
  project: Project;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

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

const StaffManagerProjectCard = ({
  project,
}: StaffEmployeeProgramCardProps) => {
  const {
    id,
    name,
    program,
    priority,
    deadline,
    startDate,
    progress,
    status,
  } = project;

  const assignedStaffImg = []
  if (project?.manager?.user?.profileImage) assignedStaffImg.push({
    name: project?.manager?.user?.name,
    avatar: project?.manager?.user?.profileImage
  })
  if (project?.projectEmployees && project.projectEmployees.length > 0) {
    project.projectEmployees.forEach(pe => {
      if (pe.employee?.user?.profileImage) {
        assignedStaffImg.push({
          name: pe.employee.user.name,
          avatar: pe.employee.user.profileImage
        })
      }
    })
  }

  const { data } = useGetFavoriteProjectsQuery();
  const [addProjectToFavorite] = useAddProjectToFavoriteMutation();
  const [removeProjectFromFavorite] = useRemoveProjectFromFavoriteMutation();
  const navigate = useNavigate();

  const priorityColor =
    priority === "HIGH"
      ? "text-[#DA4352] dark:text-rose-400"
      : priority === "MEDIUM"
        ? "text-[#F59E0B] dark:text-amber-400"
        : "text-[#16A34A] dark:text-emerald-400";

  const handleAddToFavourite = async (projectId: string) => {
    try {
      const res = await addProjectToFavorite({ projectId });

      // Handle error response
      if ("error" in res) {
        const errorData = res.error as any;
        const errorMessage =
          errorData?.data?.message ||
          errorData?.message ||
          "Failed to add project to favorites";

        toast.error(errorMessage);
        return;
      }

      // Handle success response
      if ("data" in res) {
        const successData = res.data as any;

        if (successData?.success === false) {
          const errorMessage =
            successData?.message || "Failed to add project to favorites";
          toast.error(errorMessage);
          return;
        }

        toast.success("Project added to favorites successfully");
        return;
      }

      toast.error("Unexpected response from server");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="min-w-60 lg:min-w-80 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800  transition flex flex-col">
      <CardContent className="flex flex-col justify-between p-0">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 dark:border-slate-800 py-2 px-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#069576] flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-slate-100 leading-tight">
                {program?.programName || "Program Name"}
              </h4>
              <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 mt-1 flex items-center gap-x-2">
                <span>{name || "Project Name"}</span>{" "}
                {data?.data?.some((element: any) => element.projectId === id) ? (
                  <button
                    title="Remove from favorite"
                    className=""
                    onClick={() => {
                      removeProjectFromFavorite(id)
                      toast.success("Succesfully removed from favorite.")
                    }}
                  >
                    <FaStar className="text-yellow-500" size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddToFavourite(id)}
                    title="Add to favorite"
                    className="hover:scale-105 hover:cursor-pointer duration-300"
                  >
                    <Star className="text-gray-500 dark:text-slate-500" size={18} />
                  </button>
                )}
              </p>
            </div>
          </div>

          {renderStatusBadge(status)}
        </div>

        {/* Assigned People */}
        <div className="py-2 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-1 text-gray-900 dark:text-slate-100 font-medium">Assigned People</h3>
              {/* Kept intentionally even if data is not available */}
              <AssignedStaffAvatars
                manager={project.manager}
                employees={project.projectEmployees?.map((pe: ProjectEmployee) => pe.employee) || []}
                viewers={project.projectViewers?.map((pv: ProjectViewer) => pv.viewer) || []}
                maxVisible={3}
              />
              {/* -- */}
            </div>

            <div className="flex flex-col gap-y-4 text-sm py-2 px-4">
              <div>
                <p className="text-gray-500 dark:text-slate-400">Project start</p>
                <p className="font-medium text-gray-900 dark:text-slate-100">{formatDate(startDate)}</p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-slate-400">Project finish</p>
                <p className="font-medium text-gray-900 dark:text-slate-100">{formatDate(deadline)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="px-4 py-2">
          <p className="text-gray-500 dark:text-slate-400">Priority</p>
          <div className="flex items-center gap-1">
            <Flag className={`w-4 h-4 ${priorityColor}`} />
            <span className={`text-sm font-medium ${priorityColor}`}>
              {priority}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="py-2 px-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-slate-400">Overall Progress</span>
            <span className="font-medium text-gray-900 dark:text-slate-100">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* CTA */}
        <div className="py-2 px-4">
          <PrimaryButton
            title="View Project Details"
            type="Primary"
            className="w-full h-10"
            onClick={() => navigate(`/staff-manager-panel/projects/project-details/${project.id}`)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffManagerProjectCard;
