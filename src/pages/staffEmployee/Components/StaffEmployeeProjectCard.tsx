/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flag, Layers, Star } from "lucide-react";
import { FaStar } from "react-icons/fa6";
import { toast } from "sonner";
import {
    useAddProjectToFavoriteMutation,
    useGetFavoriteProjectsQuery,
    useRemoveProjectFromFavoriteMutation
} from "@/store/Api/staffManagerApi/StaffManagerApi";
import { AssignedStaffAvatars } from "@/Common/AssignedStaffAvatars";
import PrimaryButton from "@/Common/PrimaryButton";
import { useNavigate } from "react-router-dom";

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
    projectEmployees?: any;
    projectViewers?: any;
    manager?: any;
    program?: any;
}

interface StaffEmployeeProgramCardProps {
    project: StaffEmployeeProject;
}

const formatDate = (date: string) =>
    date ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }) : "-";

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

const StaffEmployeeProjectCard = ({
    project,
}: StaffEmployeeProgramCardProps) => {
    const {
        id,
        name,
        programName: propProgramName,
        priority,
        deadline,
        startDate,
        progress,
        status,
        program,
    } = project;

    const programName = program?.programName || propProgramName;

    const { data, isLoading: favLoading } = useGetFavoriteProjectsQuery();
    const [addProjectToFavorite] = useAddProjectToFavoriteMutation();
    const [removeProjectFromFavorite] = useRemoveProjectFromFavoriteMutation();
    const navigate = useNavigate();

    const isFavorite = data?.data?.some((element: any) => element.projectId === id);

    const priorityColor =
        priority === "HIGH"
            ? "text-[#DA4352]"
            : priority === "MEDIUM"
                ? "text-[#F59E0B]"
                : "text-[#16A34A]";

    const handleAddToFavourite = async (projectId: string) => {
        try {
            const res = await addProjectToFavorite({ projectId });
            if ("error" in res) {
                toast.error((res.error as any)?.data?.message || "Failed to add to favorites");
            } else {
                toast.success("Project added to favorites successfully");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleRemoveFromFavourite = async (projectId: string) => {
        try {
            const res = await removeProjectFromFavorite(projectId);
            if ("error" in res) {
                toast.error((res.error as any)?.data?.message || "Failed to remove from favorites");
            } else {
                toast.success("Succesfully removed from favorite.");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    return (
        <Card className="w-full bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800  transition flex flex-col">
            <CardContent className="flex flex-col justify-between p-0">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-200 dark:border-slate-800 py-2 px-4">
                    <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#069576] flex items-center justify-center">
                            <Layers className="w-6 h-6 text-white" />
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-slate-100 leading-tight">
                                {programName || "Program Name"}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 mt-1 flex items-center gap-x-2">
                                <span className="truncate max-w-32" title={name || "Project Name"}>
                                    {name || "Project Name"}
                                </span>
                                {favLoading ? (
                                    <FaStar className="text-gray-200 dark:text-slate-700 animate-pulse" size={18} />
                                ) : isFavorite ? (
                                    <button
                                        title="Remove from favorite"
                                        onClick={() => handleRemoveFromFavourite(id)}
                                    >
                                        <FaStar className="text-yellow-500" size={18} />
                                    </button>
                                ) : (
                                    <button
                                        title="Add to favorite"
                                        onClick={() => handleAddToFavourite(id)}
                                    >
                                        <Star className="text-gray-500 dark:text-slate-600" size={18} />
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
                            <h3 className="mb-1 text-gray-900 dark:text-slate-200 text-sm font-medium">Assigned People</h3>
                            <AssignedStaffAvatars
                                manager={(project as any).manager}
                                employees={Array.isArray((project as any).projectEmployees)
                                    ? (project as any).projectEmployees.map((pe: any) => pe.employee)
                                    : (project as any).projectEmployees
                                        ? [(project as any).projectEmployees.employee]
                                        : []}
                                viewers={Array.isArray((project as any).projectViewers)
                                    ? (project as any).projectViewers.map((pv: any) => pv.viewer)
                                    : (project as any).projectViewers
                                        ? [(project as any).projectViewers.viewer]
                                        : []}
                                maxVisible={3}
                            />
                        </div>

                        <div className="flex flex-col gap-y-4 text-sm py-2 px-4">
                            <div>
                                <p className="text-gray-500 dark:text-slate-400">Project start</p>
                                <p className="font-medium text-gray-900 dark:text-slate-200">{formatDate(startDate)}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 dark:text-slate-400">Project finish</p>
                                <p className="font-medium text-gray-900 dark:text-slate-200">{formatDate(deadline)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Priority */}
                <div className="px-4 py-2">
                    <p className="text-gray-500 dark:text-slate-400 text-sm">Priority</p>
                    <div className="flex items-center gap-1">
                        <Flag className={`w-4 h-4 ${priorityColor}`} />
                        <span className={`text-sm font-medium ${priorityColor}`}>
                            {priority}
                        </span>
                    </div>
                </div>

                {/* Progress */}
                <div className="py-2 px-4 space-y-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-slate-400">Overall Progress</span>
                        <span className="font-medium text-gray-900 dark:text-slate-100">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <PrimaryButton
                        title="View Project Details"
                        type="Primary"
                        className="w-full h-10"
                        onClick={() => navigate(`/staff-employee-panel/projects/project-details/${project.id}`)}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default StaffEmployeeProjectCard;
