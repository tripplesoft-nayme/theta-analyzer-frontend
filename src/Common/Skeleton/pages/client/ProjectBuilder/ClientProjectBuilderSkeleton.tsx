const ClientProjectBuilderSkeleton = () => {
  return (
    <div className="relative flex min-h-full h-full gap-6 animate-pulse p-1">
      {/* Left Sidebar Widget Library Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 h-[calc(100vh-140px)] flex flex-col sticky top-5 rounded-lg max-w-[312px] min-w-[312px] transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-150 dark:border-slate-800">
          <div className="h-6 w-32 bg-gray-250 dark:bg-slate-800 rounded" />
          <div className="h-6 w-6 bg-gray-200 dark:bg-slate-800 rounded" />
        </div>

        {/* Inputs */}
        <div className="px-4 pt-4 space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-250 dark:bg-slate-800 rounded" />
            <div className="w-full h-10 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-250 dark:bg-slate-800 rounded" />
            <div className="w-full h-10 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-250 dark:bg-slate-800 rounded" />
            <div className="w-full h-10 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
          </div>
        </div>

        {/* Search & Header */}
        <div className="px-4 pt-6 space-y-3">
          <div className="h-6 w-36 bg-gray-250 dark:bg-slate-800 rounded" />
          <div className="h-3 w-48 bg-gray-200 dark:bg-slate-800 rounded" />
          <div className="w-full h-10 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
        </div>

        {/* Widget Items list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start p-3 rounded-lg border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3">
              <div className="w-5 h-5 bg-gray-200 dark:bg-slate-800 rounded mt-0.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-gray-250 dark:bg-slate-850 rounded" />
                <div className="h-3 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <div className="h-3 w-full bg-gray-200 dark:bg-slate-800 rounded mb-1" />
          <div className="h-3 w-5/6 bg-gray-200 dark:bg-slate-800 rounded" />
        </div>
      </div>

      {/* Right Dashboard Area Skeleton */}
      <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)] gap-6">
        {/* Project Stats Skeleton (Full Width) */}
        <div className="w-full h-32 bg-slate-200/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-xl" />

        {/* Charts Row Skeleton */}
        <div className="flex gap-4">
          {/* Radar Chart Skeleton */}
          <div className="flex-1 h-64 bg-slate-200/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-xl" />

          {/* Doughnut Chart Skeleton */}
          <div className="flex-1 h-64 bg-slate-200/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-xl" />
        </div>

        {/* Heat Map Skeleton */}
        <div className="w-full h-80 bg-slate-200/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-xl" />
      </div>
    </div>
  );
};
export default ClientProjectBuilderSkeleton;
