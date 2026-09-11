/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flag, Layers } from "lucide-react";
import { FaStar } from "react-icons/fa6";
import { toast } from "sonner";
// import ProjectDetailsModal from "@/components/staffManager/overview/ProjectDetailsModal";
import {
  useAddFavoriteProjectMutation,
  useGetFavoriteProjectsQuery,
  useRemoveFavoriteProjectMutation,
} from "@/store/Api/FavoriteProjectApi/FavoriteProjectApi";
import PrimaryButton from "@/Common/PrimaryButton";
import { useNavigate, useLocation } from "react-router-dom";
import { AssignedStaffAvatars } from "@/Common/AssignedStaffAvatars";
import { Project } from "@/store/Api/ProjectApi/ProjectType";

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

interface ProjectCardProps {
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
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
  COMPLETED: "bg-green-50 text-green-700 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
};

const renderStatusBadge = (status: ProjectStatus) => (
  <Badge
    variant="outline"
    className={`text-xs px-2 py-1 font-medium ${statusStyles[status]}`}
  >
    {status.replace("_", " ")}
  </Badge>
);

const ProjectCard = ({ project }: ProjectCardProps) => {
  const {
    id,
    name,
    program,
    priority,
    deadline,
    startDate,
    progress,
    status,
    manager,
    projectEmployees,
    projectViewers,
  } = project;
  const navigate = useNavigate();
  const location = useLocation();
  const [addFavoriteProject] = useAddFavoriteProjectMutation();
  const [removeFavoriteProject] = useRemoveFavoriteProjectMutation();
  const { data, isLoading } = useGetFavoriteProjectsQuery({});
  const FavoriteProjects = data?.data.map((item: any) => item?.projectId);
  const isFavorite = FavoriteProjects?.includes(id);
  const priorityColor =
    priority === "HIGH"
      ? "text-[#DA4352]"
      : priority === "MEDIUM"
        ? "text-[#F59E0B]"
        : "text-[#16A34A]";

  const handleAddToFavorite = async (projectId: string) => {
    let res: any;
    const toastId = toast.loading(
      isFavorite ? "Removing from favorites..." : "Adding to favorites...",
    );
    try {
      if (isFavorite) {
        res = await removeFavoriteProject(projectId).unwrap();
      } else {
        res = await addFavoriteProject(projectId).unwrap();
      }
      if (res.success) {
        toast.success(
          isFavorite
            ? "Project removed from favorites successfully"
            : "Project added to favorites successfully",
          { id: toastId },
        );
      }
    } catch (error: any) {
      toast.error(error?.data?.message, { id: toastId });
    }
  };
  return (
    <Card className="w-full bg-white dark:bg-slate-900 border border-border transition flex flex-col shadow-none!">
      <CardContent className="flex flex-col justify-between p-0">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border py-2 px-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#069576] flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-slate-100 leading-tight">
                {program?.programName || "Program Name"}
              </h4>
              <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 mt-1 flex items-center gap-x-2 cursor-pointer">
                <span
                  className="truncate max-w-32"
                  title={name || "Project Name"}
                >
                  {name || "Project Name"}
                </span>
                <button onClick={() => handleAddToFavorite(id)}>
                  {isLoading ? (
                    <FaStar className="text-gray-200 dark:text-slate-700 animate-pulse" size={18} />
                  ) : isFavorite ? (
                    <FaStar className="text-yellow-500" size={18} />
                  ) : (
                    <FaStar className="text-gray-500 dark:text-slate-600" size={18} />
                  )}
                </button>
              </p>
            </div>
          </div>

          {renderStatusBadge(status)}
        </div>

        {/* Assigned People */}
        <div className="py-2 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-1 text-gray-900 dark:text-slate-200">Assigned People</h3>
              {/* Kept intentionally even if data is not available */}
              <AssignedStaffAvatars
                manager={manager}
                employees={
                  projectEmployees?.map((pe: any) => pe.employee) || []
                }
                viewers={projectViewers?.map((pv: any) => pv.viewer) || []}
                maxVisible={3}
              />
            </div>

            <div className="flex flex-col gap-y-4 text-sm py-2 px-4">
              <div>
                <p className="text-gray-500 dark:text-slate-400">Project start</p>
                <p className="font-medium text-gray-900 dark:text-slate-200">
                  {startDate === null ? "-" : formatDate(startDate)}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-slate-400">Project finish</p>
                <p className="font-medium text-gray-900 dark:text-slate-200">
                  {deadline === null ? "-" : formatDate(deadline)}
                </p>
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
        <div className="py-2 space-y-4 px-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-slate-400">Overall Progress</span>
            <span className="font-medium text-gray-900 dark:text-slate-100">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <PrimaryButton
            onClick={() => {
              if (location.pathname.includes("viewer-panel")) {
                navigate(`/viewer-panel/project-details/${id}`);
              } else {
                navigate(`/client-panel/overview/project-details/${id}`);
              }
            }}
            disabled={location.pathname.includes("viewer-panel") && status !== "LIVE"}
            title="View Project Details"
            type="Primary"
            className="w-full h-10"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
