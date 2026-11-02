const BoxPlotChartSkeleton = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col justify-between">
      <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mb-8 flex-shrink-0" />
      <div className="flex-1 min-h-0 flex items-end justify-around gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-12 space-y-2 flex flex-col items-center justify-end h-full min-h-0">
            <div className="w-1 bg-slate-100 dark:bg-slate-800 h-1/5 flex-shrink-0" />
            <div className="w-10 bg-slate-100 dark:bg-slate-800 h-2/5 rounded-sm animate-pulse flex-shrink-0" />
            <div className="w-1 bg-slate-100 dark:bg-slate-800 h-1/5 flex-shrink-0" />
            <div className="h-3 w-8 bg-slate-100 dark:bg-slate-800 rounded mt-2 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoxPlotChartSkeleton;
