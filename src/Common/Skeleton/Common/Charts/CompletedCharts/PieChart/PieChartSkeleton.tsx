const PieChartSkeleton = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
      <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mb-8" />
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="relative w-48 h-48">
          <div className="absolute inset-0 border-[24px] border-slate-100 dark:border-slate-800 rounded-full animate-pulse" />
          <div className="absolute inset-0 border-[24px] border-transparent border-t-slate-200 dark:border-t-slate-700 rounded-full animate-pulse rotate-45" />
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-3 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
              <div className="h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChartSkeleton;
