import DashboardPanelStatsCardSkeleton from "@/Common/Skeleton/DashboardPanelStatsCardSkeleton";
import ProjectCardSkeleton from "@/Common/Skeleton/ProjectCardSkeleton";

const StaffManagerProjectsSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* ── 1. Project Stats Skeleton ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <DashboardPanelStatsCardSkeleton key={index} />
        ))}
      </div>

      {/* ── 2. All Program & Projects Skeleton ── */}
      <div className="pb-6">
        {/* Header toolbar */}
        <div className="flex items-center justify-between pb-6">
          <div className="h-6 w-48 bg-gray-200 dark:bg-slate-800 rounded" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-10 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-10 w-28 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-10 w-28 bg-gray-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
        {/* Project Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* ── 3. Map Skeleton ── */}
      <div className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 mb-10 h-[80vh] flex flex-col gap-4">
        <div className="h-6 w-48 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="flex-1 bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
      </div>
    </div>
  );
};

export default StaffManagerProjectsSkeleton;
