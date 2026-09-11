import DashboardPanelStatsCardSkeleton from "./DashboardPanelStatsCardSkeleton";
import { ProjectTableSkeleton } from "./Skeleton";
import { DueDateHeaderSkeleton, DueDateCardSkeleton } from "./ProjectDueSkeleton";

const ClientProjectReviewSkeleton = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* 4 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <DashboardPanelStatsCardSkeleton key={index} />
        ))}
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Table Area */}
        <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden p-6 space-y-6 h-fit">
          {/* Header & Controls Placeholder */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="h-7 w-48 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-11 w-48 bg-gray-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-11 w-44 bg-gray-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-11 w-32 bg-gray-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-11 w-28 bg-gray-200 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="w-full">
            <ProjectTableSkeleton />
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="w-full lg:w-[450px] space-y-6">
          {/* Due Date Skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-4">
            <DueDateHeaderSkeleton />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <DueDateCardSkeleton key={idx} />
              ))}
            </div>
          </div>

          {/* Reviewer Activity Skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-gray-200 dark:bg-slate-800" />
                <div className="w-32 h-5 rounded bg-gray-200 dark:bg-slate-800" />
              </div>
            </div>
            {/* Activity Items */}
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-slate-800 mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-slate-800" />
                      <div className="w-24 h-4 bg-gray-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-16 h-5 bg-gray-200 dark:bg-slate-800 rounded-full" />
                      <div className="w-16 h-5 bg-gray-200 dark:bg-slate-800 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProjectReviewSkeleton;
