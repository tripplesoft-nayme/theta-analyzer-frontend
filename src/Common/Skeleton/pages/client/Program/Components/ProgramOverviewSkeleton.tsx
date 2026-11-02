import DashboardPanelStatsCardSkeleton from "@/Common/Skeleton/DashboardPanelStatsCardSkeleton";


const ProgramOverviewSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse p-1">
      {/* 4 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <DashboardPanelStatsCardSkeleton key={index} />
        ))}
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left: Projects Table Card (col-span-3) */}
        <div className="xl:col-span-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden p-6 space-y-6 h-fit">
          {/* Table Header & Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="h-10 w-full sm:w-64 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-md" />
              <div className="h-10 w-24 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-md" />
            </div>
          </div>

          {/* Table Rows skeleton */}
          <div className="space-y-4">
            {/* Table Header Row */}
            <div className="flex justify-between items-center pb-3 border-b border-border dark:border-slate-800">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-4 w-20 bg-gray-200 dark:bg-slate-800 rounded" />
              ))}
            </div>
            {/* Table Body Rows */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="h-5 w-32 bg-gray-155 dark:bg-slate-850 rounded" />
                <div className="h-5 w-24 bg-gray-155 dark:bg-slate-850 rounded" />
                <div className="h-5 w-16 bg-gray-155 dark:bg-slate-850 rounded-full" />
                <div className="h-5 w-20 bg-gray-155 dark:bg-slate-850 rounded" />
                <div className="h-5 w-12 bg-gray-155 dark:bg-slate-855 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sidebar Cards (col-span-1) */}
        <div className="xl:col-span-1 space-y-6">
          {/* Program Manager Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="h-3.5 w-28 bg-gray-200 dark:bg-slate-800 rounded font-semibold" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="h-3.5 w-24 bg-gray-150 dark:bg-slate-850 rounded" />
              </div>
            </div>
          </div>

          {/* Program Duration Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="h-3.5 w-32 bg-gray-200 dark:bg-slate-800 rounded font-semibold" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="h-3 w-16 bg-gray-150 dark:bg-slate-850 rounded" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-16 bg-gray-150 dark:bg-slate-850 rounded" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
            {/* progress line */}
            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full" />
              <div className="flex justify-between items-center">
                <div className="h-3.5 w-24 bg-gray-150 dark:bg-slate-855 rounded" />
                <div className="h-3.5 w-12 bg-gray-150 dark:bg-slate-855 rounded" />
              </div>
            </div>
          </div>

          {/* Tags Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="h-3 w-12 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-16 bg-gray-150 dark:bg-slate-855 rounded" />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-16 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-full" />
              <div className="h-6 w-20 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-full" />
            </div>
          </div>

          {/* Alerts Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="h-4 w-12 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-16 bg-gray-150 dark:bg-slate-850 rounded" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, k) => (
                <div key={k} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-full bg-gray-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-28 bg-gray-150 dark:bg-slate-850 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map card at the bottom */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="h-5 w-48 bg-gray-200 dark:bg-slate-800 rounded font-semibold" />
        <div className="w-full h-80 bg-gray-100 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg flex items-center justify-center">
          <div className="h-8 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
    </div>
  );
};

export default ProgramOverviewSkeleton;
