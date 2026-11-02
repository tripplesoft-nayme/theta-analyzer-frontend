const CandleChartConfigurationSkeleton = () => {
  return (
    <div className="w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-6">
      <div className="h-6 w-1/2 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
            <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />
          </div>
        ))}
      </div>
      <div className="flex gap-3 pt-4">
        <div className="h-10 flex-1 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />
        <div className="h-10 flex-1 bg-blue-100 dark:bg-blue-900/30 animate-pulse rounded-md" />
      </div>
    </div>
  );
};

export default CandleChartConfigurationSkeleton;
