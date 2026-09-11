import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useGetProgramByIdQuery, useGetAllTagsQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { CreateTagModal } from "@/Common/CreateTagModal";
import { useGetUser } from "@/hooks/useGetUser";
import { useGetManagerProgramOverviewQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";

interface Tag {
  id: string;
  name: string;
  color: string;
}

const SideManager = ({ programId }: { programId?: string }) => {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const { name: currentUserName, email: currentUserEmail, profileImage: currentUserProfileImage } = useGetUser();

  const { isLoading: isProgramLoading } = useGetProgramByIdQuery(programId, {
    skip: !programId,
  });

  const { data: overviewRes } = useGetManagerProgramOverviewQuery(programId as string, {
    skip: !programId,
  });

  const { data: tagsData, isLoading: isTagsLoading } = useGetAllTagsQuery(programId, {
    skip: !programId,
  });

  const overviewData = overviewRes?.data || {};
  const duration = overviewData?.programDuration;
  const tags = tagsData?.data || [];

  const getTagColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "green": return "bg-green-100 dark:bg-emerald-900/30 text-green-700 dark:text-emerald-400 border-green-200 dark:border-emerald-800";
      case "purple": return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "gray": return "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700";
      case "yellow": return "bg-yellow-100 dark:bg-amber-900/30 text-yellow-700 dark:text-amber-400 border-yellow-200 dark:border-amber-800";
      case "red": return "bg-red-100 dark:bg-rose-900/30 text-red-700 dark:text-rose-400 border-red-200 dark:border-rose-800";
      default: return "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-700";
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isProgramLoading) {
    return (
      <div className="min-h-screen w-[30%] pt-6 animate-pulse">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 space-y-4">
          <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
          <div className="flex gap-3">
            <div className="w-11 h-11 bg-gray-200 dark:bg-slate-800 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-[30%] pt-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
        {/* Program Manager Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-3 uppercase tracking-wider">
            Program Manager
          </h3>
          <div className="flex items-center gap-3">
            {currentUserProfileImage ? (
              <img
                src={currentUserProfileImage}
                alt={currentUserName}
                className="w-11 h-11 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-100 dark:border-blue-800">
                {currentUserName?.substring(0, 2).toUpperCase() || "NA"}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                {currentUserName || "No Manager Assigned"}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{currentUserEmail || "No email available"}</p>
            </div>
          </div>
        </div>

        {/* Program Duration Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-3 uppercase tracking-wider">
            Program Duration
          </h3>

          <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4 border border-border dark:border-slate-800">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase mb-1">Start Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {formatDate(duration?.startDate)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase mb-1">End Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {formatDate(duration?.endDate)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium tracking-tight">Time Remaining</p>
                <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
                  {duration?.remainingDays ?? 0} days
                </p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(duration?.totalDays ?? 0) > 0
                      ? Math.round(
                        (Math.max(0, (duration?.totalDays ?? 0) - (duration?.remainingDays ?? 0)) / (duration?.totalDays ?? 0)) *
                        100,
                      )
                      : 0
                      }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
              {tags.length} {tags.length === 1 ? "Tag" : "Tags"}
            </h3>
            <button
              onClick={() => setIsTagModalOpen(true)}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              Add Tags
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-8">
            {isTagsLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
                <Loader2 size={12} className="animate-spin" />
                Loading tags...
              </div>
            ) : tags.length > 0 ? (
              tags.map((tag: Tag) => {
                const COLORS_LIST = ["blue", "green", "purple", "gray", "yellow", "red"];
                const displayColor = tag.color || COLORS_LIST[parseInt(tag.id) % COLORS_LIST.length] || COLORS_LIST[0];

                return (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105 ${getTagColor(
                      displayColor,
                    )}`}
                  >
                    {tag.name}
                  </span>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 dark:text-slate-500 italic">No tags added yet</p>
            )}
          </div>
        </div>

        {/* No Issues Section */}
        <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl py-8 text-center border border-dashed border-gray-200 dark:border-slate-800">
          <p className="text-sm font-medium text-gray-400 dark:text-slate-500">No Issues reported yet</p>
        </div>
      </div>

      <CreateTagModal
        open={isTagModalOpen}
        onOpenChange={setIsTagModalOpen}
        programId={programId as string}
      />
    </div>
  );
};

export default SideManager;

