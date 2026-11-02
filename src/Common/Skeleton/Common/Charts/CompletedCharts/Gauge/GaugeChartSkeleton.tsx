const GaugeChartSkeleton = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
      <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mb-8" />
      <div className="flex flex-col items-center justify-center pt-8">
        <div className="relative w-48 h-24 overflow-hidden">
          <div className="absolute inset-0 border-[20px] border-slate-100 dark:border-slate-800 rounded-t-full animate-pulse" />
          <div className="absolute inset-0 border-[20px] border-transparent border-t-slate-200 dark:border-t-slate-700 rounded-t-full animate-pulse rotate-[30deg] origin-bottom" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-4 w-4 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-4" />
      </div>
    </div>
  );
};

export default GaugeChartSkeleton;
