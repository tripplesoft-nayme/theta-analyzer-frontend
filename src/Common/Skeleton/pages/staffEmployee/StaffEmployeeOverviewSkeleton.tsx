import DashboardPanelStatsCardSkeleton from "../../DashboardPanelStatsCardSkeleton";
import ProjectCardSkeleton from "../../ProjectCardSkeleton";

const StaffEmployeeOverviewSkeleton = () => {
  return (
    <div className="mb-4 animate-pulse">
      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 my-6">
        {[...Array(5)].map((_, i) => (
          <DashboardPanelStatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Projects Title and Cards Section */}
      <div className="py-4">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-56 bg-slate-250 dark:bg-slate-800 rounded" />
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-850 rounded" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 mb-8">
          {[...Array(4)].map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Charts & Deadlines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="space-y-6 col-span-1 lg:col-span-2 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Overdue Chart Skeleton */}
            <div className="w-full h-80 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div className="h-6 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="flex-1 flex items-end justify-between gap-4 mt-6">
                {[50, 80, 40, 90, 60, 75].map((h, j) => (
                  <div
                    key={j}
                    style={{ height: `${h}%` }}
                    className="w-full bg-slate-200 dark:bg-slate-800 rounded-t"
                  />
                ))}
              </div>
            </div>

            {/* Project Status Chart Skeleton */}
            <div className="w-full h-80 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div className="h-6 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="flex-1 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-[16px] border-slate-200 dark:border-slate-800 flex items-center justify-center" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadline Skeleton */}
        <div className="space-y-6 h-full col-span-1 w-full">
          <div className="w-full h-80 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div className="h-6 w-44 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
            <div className="space-y-4 flex-1">
              {[...Array(3)].map((_, k) => (
                <div key={k} className="flex justify-between items-center">
                  <div className="space-y-2 flex-1 mr-4">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-20 bg-slate-150 dark:bg-slate-850 rounded" />
                  </div>
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Submissions Skeleton */}
      <div className="w-full h-48 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div className="h-6 w-44 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <div className="space-y-4">
          <div className="h-4 w-full bg-slate-150 dark:bg-slate-850 rounded" />
          <div className="h-4 w-5/6 bg-slate-150 dark:bg-slate-850 rounded" />
          <div className="h-4 w-4/5 bg-slate-150 dark:bg-slate-850 rounded" />
        </div>
      </div>
    </div>
  );
};

export default StaffEmployeeOverviewSkeleton;
