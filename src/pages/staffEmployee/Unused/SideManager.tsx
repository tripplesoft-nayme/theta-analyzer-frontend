import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useGetAllTagsQuery, useGetProgramByIdQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { CreateTagModal } from "../../common/CreateTagModal";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface SideManagerProps {
  programId: string;
}

const SideManager: React.FC<SideManagerProps> = ({ programId }) => {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const { data: programResponse, isLoading: isProgramLoading } = useGetProgramByIdQuery(programId, {
    skip: !programId,
  });

  const { data: tagsData, isLoading: isTagsLoading } = useGetAllTagsQuery(programId, {
    skip: !programId,
  });

  const program = programResponse?.data;
  const tags = tagsData?.data || [];

  const getTagColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-100 text-blue-700 border-blue-200";
      case "green": return "bg-green-100 text-green-700 border-green-200";
      case "purple": return "bg-purple-100 text-purple-700 border-purple-200";
      case "gray": return "bg-gray-100 text-gray-700 border-gray-200";
      case "yellow": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "red": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
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
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="flex gap-3">
            <div className="w-11 h-11 bg-gray-200 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-[30%] pt-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {/* Program Manager Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">
            Program Manager
          </h3>
          <div className="flex items-center gap-3">
            {program?.manager?.user?.profileImage ? (
              <img
                src={program.manager.user.profileImage}
                alt={program.manager.user.name}
                className="w-11 h-11 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
                {program?.manager?.user?.name?.substring(0, 2).toUpperCase() || "NA"}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {program?.manager?.user?.name || "No Manager Assigned"}
              </p>
              <p className="text-xs text-gray-500">{program?.manager?.user?.email || "No email available"}</p>
            </div>
          </div>
        </div>

        {/* Program Duration Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">
            Program Duration
          </h3>

          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-border">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Start Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(program?.datetime)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">End Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(program?.deadline)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-blue-600 font-medium tracking-tight">Time Remaining</p>
                <p className="text-sm font-bold text-gray-900">
                  {program?.remainingDays || 0} days
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${program?.progress || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {tags.length} {tags.length === 1 ? "Tag" : "Tags"}
            </h3>
            <button
              onClick={() => setIsTagModalOpen(true)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              Add Tags
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-8">
            {isTagsLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
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
              <p className="text-xs text-gray-400 italic">No tags added yet</p>
            )}
          </div>
        </div>

        {/* No Issues Section */}
        <div className="bg-gray-50 rounded-xl py-8 text-center border border-dashed border-gray-200">
          <p className="text-sm font-medium text-gray-400">No Issues reported yet</p>
        </div>
      </div>

      <CreateTagModal
        open={isTagModalOpen}
        onOpenChange={setIsTagModalOpen}
        programId={programId}
      />
    </div>
  );
};

export default SideManager;

