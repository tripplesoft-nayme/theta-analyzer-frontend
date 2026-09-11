/* eslint-disable @typescript-eslint/no-explicit-any */
import { Eye, Flag, ArrowDownUp } from "lucide-react";
import { useState, useMemo } from "react";

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
    program?: any;
}

interface StaffEmployeeProjectTableProps {
    projects: StaffEmployeeProject[];
    isLoading?: boolean;
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

const formatDate = (date: string) =>
    date ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }) : "-";

const priorityColors: Record<ProjectPriority, string> = {
    HIGH: "text-rose-600 dark:text-rose-400",
    MEDIUM: "text-amber-600 dark:text-amber-400",
    LOW: "text-blue-600 dark:text-blue-400",
    NORMAL: "text-slate-600 dark:text-slate-400",
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
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl dark:bg-slate-900 dark:border-slate-800">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/50">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                        {project.name}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground dark:text-slate-400">
                        Project details overview
                    </DialogDescription>
                </DialogHeader>
            </div>

            <div className="px-6 py-6 space-y-6">
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
                    <p className="mt-1 text-sm font-medium dark:text-slate-100">{project.progress}%</p>
                </div>

                <div className="text-sm">
                    <p className="text-muted-foreground dark:text-slate-400 mb-1">Description</p>
                    <p className="leading-relaxed dark:text-slate-300">
                        {project.description || "No description provided."}
                    </p>
                </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-2">
                <Button variant="outline" className="dark:border-slate-800 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>
                    Close
                </Button>
            </div>
        </DialogContent>
    </Dialog>
);

const TABLE_SKELETON_ROWS = 4;

const StaffEmployeeProjectTable = ({
    projects,
    isLoading = false,
}: StaffEmployeeProjectTableProps) => {
    const navigate = useNavigate();
    const [selectedProject,] = useState<StaffEmployeeProject | null>(null);
    const [open, setOpen] = useState(false);
    const [sortBy, setSortBy] = useState<string>("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const columns: { label: string; field?: string }[] = [
        { label: "Program", field: "programName" },
        { label: "Project", field: "name" },
        { label: "Status", field: "status" },
        { label: "Assigned People" },
        { label: "Priority", field: "priority" },
        { label: "Started On", field: "startDate" },
        { label: "Deadline", field: "deadline" },
        { label: "Progress", field: "progress" },
        { label: "Action" },
    ];

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    const sortedProjects = useMemo(() => {
        if (!projects) return [];
        const list = [...projects];
        list.sort((a: any, b: any) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === "startDate" || sortBy === "deadline") {
                aValue = aValue ? new Date(aValue).getTime() : 0;
                bValue = bValue ? new Date(bValue).getTime() : 0;
            }

            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });
        return list;
    }, [projects, sortBy, sortOrder]);

    return (
        <Card className="w-full shadow-none border-none bg-white dark:bg-slate-900 p-0! overflow-hidden rounded-lg">
            <CardContent className="p-0 border border-[#E2E8F0] dark:border-slate-800 rounded-lg w-full min-h-[420px]">
                {projects.length > 0 || isLoading ? (
                    <Table className="border-collapse min-w-[1000px]">
                        <TableHeader>
                            <TableRow className="bg-[#F7F9FA] dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-800 border-b">
                                {columns.map((col) => (
                                    <TableHead
                                        key={col.label}
                                        className={`px-6 py-3.5 ${col.field ? "cursor-pointer select-none" : ""} text-gray-900 dark:text-slate-300`}
                                        onClick={col.field ? () => handleSort(col.field!) : undefined}
                                    >
                                        <div className="inline-flex items-center gap-1">
                                            {col.label}
                                            {col.field && (
                                                <ArrowDownUp
                                                    className={`w-4 h-4 transition-transform duration-200 ${sortBy === col.field
                                                        ? sortOrder === "asc" ? "rotate-180" : "rotate-0"
                                                        : "opacity-30"
                                                        }`}
                                                />
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading
                                ? Array.from({ length: TABLE_SKELETON_ROWS }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse dark:border-slate-800">
                                        {columns.map((_, j) => (
                                            <TableCell key={j} className="px-6 py-3.5">
                                                <div className="bg-gray-200 dark:bg-slate-800 rounded w-full h-4"></div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                                : sortedProjects.map((project) => (
                                    <TableRow
                                        key={project.id}
                                        className="hover:bg-muted/30 even:bg-[#F7F9FA] dark:even:bg-slate-900 odd:bg-white dark:odd:bg-slate-800/30 border-[#E2E8F0] dark:border-slate-800 border-b cursor-pointer"
                                        onClick={() => navigate(`/staff-employee-panel/projects/project-details/${project.id}`)}
                                    >
                                        <TableCell className="px-6 py-3.5 font-medium text-gray-900 dark:text-slate-100">
                                            {project.program?.programName || project.programName || "Program Name"}
                                        </TableCell>
                                        <TableCell className="px-6 py-3.5 font-medium text-gray-900 dark:text-slate-100">
                                            {project.name}
                                        </TableCell>
                                        <TableCell className="px-6 py-3.5">
                                            {renderStatusBadge(project.status)}
                                        </TableCell>
                                        <TableCell className="px-6 py-3.5">
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
                                        </TableCell>
                                        <TableCell className="px-6 py-3.5">
                                            {renderPriority(project.priority)}
                                        </TableCell>
                                        <TableCell className="px-6 py-3.5 text-muted-foreground dark:text-slate-400">
                                            {formatDate(project.startDate)}
                                        </TableCell>
                                        <TableCell className="px-6 py-3.5 text-muted-foreground dark:text-slate-400">
                                            {formatDate(project.deadline)}
                                        </TableCell>
                                        <TableCell className="px-6 py-3.5 text-muted-foreground dark:text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Progress value={project.progress} className="h-2" />
                                                <span className="font-medium text-gray-900 dark:text-slate-100">{project.progress}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/staff-employee-panel/projects/project-details/${project.id}`);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4 text-[#1C73E0] dark:text-blue-400" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex justify-center items-center h-96 text-gray-500 dark:text-slate-400 text-xl">
                        No projects found
                    </div>
                )}
            </CardContent>

            {selectedProject && (
                <ProjectModal project={selectedProject} open={open} setOpen={setOpen} />
            )}
        </Card>
    );
};

export default StaffEmployeeProjectTable;
