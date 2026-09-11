import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useGetManagerByIdQuery } from "@/store/Api/UserApi/UserApi";
import { useGetAllTagsQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { CreateTagModal } from "./CreateTagModal";
import { ProgramManageSkeleton } from "@/Common/Skeleton/Skeleton";

interface Tag {
  id: number;
  name: string;
  color: string;
}

// interface Alert {
//   id: number;
//   type: "error" | "warning" | "info" | "success";
//   title: string;
//   description: string;
//   time: string;
//   by: string;
// }

const ProgramManager = ({
  managerId,
  programId,
  programOverviewData,
}: {
  managerId: string;
  programId: string;
  programOverviewData?: any;
}) => {
  const { data, isLoading: isManagerLoading } = useGetManagerByIdQuery(managerId, {
    skip: !managerId,
  });

  const { data: tagsData, isLoading: isTagsLoading } = useGetAllTagsQuery(programId, {
    skip: !programId,
  });

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  if (isManagerLoading) return <ProgramManageSkeleton />;

  const manager = data?.data;
  const tags = tagsData?.data || [];

  const programDuration = programOverviewData?.data?.programDuration || {};
  const startDate = programDuration.startDate;
  const endDate = programDuration.endDate;
  const remainingDays = programDuration.remainingDays ?? 0;
  const totalDays = programDuration.totalDays ?? 1;
  const progressPercent = totalDays > 0 ? Math.min(100, Math.max(0, Math.round(((totalDays - remainingDays) / totalDays) * 100))) : 0;

  const formatDateStr = (iso?: string) => {
    if (!iso) return "N/A";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "N/A";
    const day = String(d.getDate()).padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // const alerts: Alert[] = [
  //   {
  //     id: 1,
  //     type: "error",
  //     title: "Overdue Material Delivery",
  //     description: "Segment A - 2 days overdue",
  //     time: "10 minutes ago",
  //     by: "By System",
  //   },
  //   {
  //     id: 2,
  //     type: "warning",
  //     title: "Safety Inspection Required",
  //     description: "Bridge support structure",
  //     time: "43 minutes ago",
  //     by: "By Santa Claus",
  //   },
  //   {
  //     id: 3,
  //     type: "info",
  //     title: "Permit Approval Pending",
  //     description: "Environmental Assessment",
  //     time: "10 minutes ago",
  //     by: "By System",
  //   },
  //   {
  //     id: 4,
  //     type: "success",
  //     title: "Excavation completed",
  //     description: "Ground floor excavation completed",
  //     time: "10 minutes ago",
  //     by: "By Project Manager",
  //   },
  // ];

  // const getAlertColor = (type: string) => {
  //   switch (type) {
  //     case "error":
  //       return "bg-red-500";
  //     case "warning":
  //       return "bg-orange-500";
  //     case "info":
  //       return "bg-teal-500";
  //     case "success":
  //       return "bg-blue-500";
  //     default:
  //       return "bg-gray-500";
  //   }
  // };

  const getTagColor = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      case "green":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case "purple":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
      case "gray":
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
      case "yellow":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "red":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  const addTag = () => {
    setIsTagModalOpen(true);
  };

  return (
    <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6 ">
      {/* Program Manager Section */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-3 uppercase tracking-wider">
          Program Manager
        </h3>
        <div className="flex items-center gap-3">
          {manager?.user?.profileImage ? (
            <img
              src={manager.user.profileImage}
              alt={manager.user.name}
              className="w-10 h-10 rounded-full object-cover border border-border dark:border-slate-800"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold text-sm border border-blue-100 dark:border-blue-500/20">
              {manager?.user?.name?.substring(0, 2).toUpperCase() || "NA"}
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              {manager?.user?.name || "Unknown Manager"}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-500">
              {manager?.user?.email || "No email available"}
            </div>
          </div>
        </div>
      </div>

      {/* Program Duration Section */}
      <h3 className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-3 uppercase tracking-wider">
        Program Duration
      </h3>
      <div className="mb-6 bg-gray-100 dark:bg-slate-900 p-4 rounded-md border border-border dark:border-slate-800/50">
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-gray-500 dark:text-slate-500 uppercase mb-1">Start Date</div>
            <div className="text-sm font-medium text-gray-900 dark:text-slate-200">{formatDateStr(startDate)}</div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold text-gray-500 dark:text-slate-500 uppercase mb-1">End Date</div>
            <div className="text-sm font-medium text-gray-900 dark:text-slate-200">{formatDateStr(endDate)}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Time Remaining
            </span>
            <span className="text-xs text-gray-900 dark:text-slate-300 font-medium">{remainingDays} {remainingDays === 1 ? "day" : "days"}</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.3)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">Tags</h3>
          <button
            onClick={addTag}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer transition-colors"
          >
            <Plus size={14} />
            Add more
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {isTagsLoading ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 size={12} className="animate-spin" />
              Loading tags...
            </div>
          ) : tags.length > 0 ? (
            tags.map((tag: Tag) => {
              const COLORS_LIST = ["blue", "green", "purple", "gray", "yellow", "red"];
              // Stable random color based on ID if no color provided, or just override with random
              const idNum = typeof tag.id === 'number' ? tag.id : parseInt(tag.id) || 0;
              const displayColor = tag.color || COLORS_LIST[idNum % COLORS_LIST.length];

              return (
                <span
                  key={tag.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border transition-all hover:scale-105 ${getTagColor(
                    displayColor,
                  )}`}
                >
                  {tag.name}
                </span>
              );
            })
          ) : (
            <span className="text-xs text-gray-400 dark:text-slate-600 italic">No tags added yet</span>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {/* <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">Alerts</h3>
          <span className="text-xs text-red-600 dark:text-rose-400 font-bold">3 Issues</span>
        </div>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex gap-3">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getAlertColor(
                  alert.type,
                )}`}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-0.5">
                  {alert.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">
                  {alert.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-slate-500 font-medium">
                  <span>{alert.time}</span>
                  <span>{alert.by}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      <CreateTagModal
        open={isTagModalOpen}
        onOpenChange={setIsTagModalOpen}
        programId={programId}
      />
    </div>
  );
};

export default ProgramManager;

