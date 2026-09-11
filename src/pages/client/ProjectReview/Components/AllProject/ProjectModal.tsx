import React from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/store/Api/ProjectApi/ProjectType";

interface ProjectDetailsModalProps {
  project: Project;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const formatDate = (date: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    case "ACTIVE":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
  }
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
    case "MEDIUM":
      return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
  }
};

const ProjectDetailsModal = ({ project, open, setOpen }: ProjectDetailsModalProps) => {

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl px-1 py-5 overflow-hidden gap-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        {/* Decorative Header Accent */}
        <div className="h-2 bg-primary w-full" />

        <div className="p-6">
          <DialogHeader className="space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {project.name}
                </DialogTitle>
                <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                  {project.description}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityStyles(
                    project.priority
                  )}`}
                >
                  {project.priority} Priority
                </span>
              </div>
            </div>
          </DialogHeader>

          {/* Progress Section */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary dark:text-blue-400" /> Project Progress
              </span>
              <span className="text-sm font-bold text-primary dark:text-blue-400">
                {project.progress}%
              </span>
            </div>
            <Progress value={project.progress} className="h-2 dark:bg-slate-800" />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timeline Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-uppercase font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Timeline
              </h4>
              <div className="space-y-3">
                <InfoItem
                  icon={<Clock className="w-4 h-4" />}
                  label="Start Date"
                  value={formatDate(project.startDate)}
                />
                <InfoItem
                  icon={<AlertCircle className="w-4 h-4" />}
                  label="Deadline"
                  value={formatDate(project.deadline)}
                  highlight
                />
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Est. Completion"
                  value={formatDate(project.estimatedCompletedDate)}
                />
              </div>
            </div>

            {/* Financials & Resources */}
            <div className="space-y-4">
              <h4 className="text-xs font-uppercase font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" /> Project Data
              </h4>
              <div className="space-y-3">
                <InfoItem
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Budget"
                  value={project.budget || "Not Set"}
                />
                <InfoItem
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Current Rate"
                  value={project.currentRate || "N/A"}
                />
                <InfoItem
                  icon={<MapPin className="w-4 h-4" />}
                  label="Location"
                  value={`${(project?.latitude ?? 0).toFixed(2)}, ${(
                    project?.longitude ?? 0
                  ).toFixed(2)}`}
                />
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500">
            <div className="flex gap-4"></div>
            <div className="text-right">
              Last updated {formatDate(project.updatedAt)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* Helper Component for cleaner code */
const InfoItem = ({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) => (
  <div className="flex items-center gap-3">
    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{icon}</div>
    <div>
      <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 leading-none mb-1">
        {label}
      </p>
      <p
        className={`text-sm font-semibold ${highlight ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-200"
          }`}
      >
        {value}
      </p>
    </div>
  </div>
);

export default ProjectDetailsModal;
