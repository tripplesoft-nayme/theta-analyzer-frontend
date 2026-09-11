import React from "react";

const ViewerPanelSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Row */}
      <div className="flex gap-6 items-stretch">
        <div className="bg-gray-200 dark:bg-slate-800 transition-colors animate-pulse rounded-lg h-64 flex-1"></div>
        <div className="bg-gray-200 dark:bg-slate-800 transition-colors animate-pulse rounded-lg h-64 w-64"></div>
        <div className="bg-gray-200 dark:bg-slate-800 transition-colors animate-pulse rounded-lg h-64 w-64"></div>
      </div>

      {/* Middle Row */}
      <div className="flex gap-6">
        <div className="bg-gray-200 dark:bg-slate-800 transition-colors animate-pulse rounded-lg h-64 flex-1"></div>
        <div className="bg-gray-200 dark:bg-slate-800 transition-colors animate-pulse rounded-lg h-64 flex-1"></div>
      </div>

      {/* Bottom Row */}
      <div className="flex gap-6 mt-6">
        <div className="bg-gray-200 dark:bg-slate-800 transition-colors animate-pulse rounded-lg h-64 flex-1"></div>
        <div className="bg-gray-200 dark:bg-slate-800 transition-colors animate-pulse rounded-lg h-64 flex-1"></div>
      </div>

      {/* Footer Image */}
      <div className="flex justify-end mt-6">
        <div className="bg-gray-200 dark:bg-slate-800 transition-colors animate-pulse rounded-lg h-32 w-32"></div>
      </div>
    </div>
  );
};

export default ViewerPanelSkeleton;
