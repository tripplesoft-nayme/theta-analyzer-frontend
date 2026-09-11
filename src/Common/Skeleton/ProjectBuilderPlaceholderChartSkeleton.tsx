const ProjectBuilderPlaceholderChartSkeleton = () => {
  return (
    <div className="animate-pulse space-y-2 w-full">
      {/* 1. Project Information Skeleton */}
      <div className="flex items-center justify-center gap-2">
        <div className="w-full bg-slate-200/20 dark:bg-slate-800/20 border border-gray-200 dark:border-slate-800 rounded-xl p-6 transition-colors">
          <div className="h-5 w-40 bg-slate-300 dark:bg-slate-700 rounded mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center border-b border-border dark:border-slate-800/50 pb-2">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-40 bg-slate-300 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* 2. Media Widget Skeleton */}
        <div className="w-full bg-slate-200/20 dark:bg-slate-800/20 border border-gray-200 dark:border-slate-800 rounded-xl p-6 flex flex-col transition-colors">
          <div className="h-5 w-32 bg-slate-300 dark:bg-slate-700 rounded mb-4" />
          <div className="border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-lg flex flex-col items-center justify-center p-6 text-center h-48">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-3">
              {/* Fake file/media icon */}
              <div className="w-4 h-4 bg-slate-300 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-4 w-48 bg-slate-300 dark:bg-slate-700 rounded mb-2" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>

      {/* 3. Charts Row Skeleton */}
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Radar/Bar Chart Skeleton */}
        <div className="flex-1 min-h-[320px] bg-slate-200/20 dark:bg-slate-800/20 border border-gray-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between transition-colors">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="flex items-end justify-between h-48 px-4 mt-2 gap-3">
            {[60, 80, 45, 90, 30, 70, 50, 85].map((height, idx) => (
              <div
                key={idx}
                className="w-full bg-slate-200 dark:bg-slate-800 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <div className="h-3 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>

        {/* Doughnut Chart Skeleton */}
        <div className="flex-1 min-h-[320px] bg-slate-200/20 dark:bg-slate-800/20 border border-gray-200 dark:border-slate-800 rounded-xl p-6 flex flex-col transition-colors">
          <div className="h-5 w-36 bg-slate-300 dark:bg-slate-700 rounded mb-6" />
          <div className="flex flex-1 items-center justify-center gap-8">
            {/* Circle shape using border-8 to simulate doughnut */}
            <div className="w-36 h-36 rounded-full border-[16px] border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <div className="h-4 w-12 bg-slate-300 dark:bg-slate-700 rounded" />
            </div>
            {/* Legend Skeletons */}
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-20 bg-slate-300 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Heat Map / Grid Skeleton */}
      <div className="w-full bg-slate-200/20 dark:bg-slate-800/20 border border-gray-200 dark:border-slate-800 rounded-xl p-6 transition-colors">
        <div className="h-5 w-40 bg-slate-300 dark:bg-slate-700 rounded mb-6" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectBuilderPlaceholderChartSkeleton;
