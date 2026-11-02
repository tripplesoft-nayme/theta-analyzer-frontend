const CandleChartSkeleton = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col justify-between">
      <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mb-8 flex-shrink-0" />
      <div className="flex-1 min-h-0 flex items-end justify-around gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1 h-full min-h-0 justify-center">
            <div className="w-0.5 bg-slate-100 dark:bg-slate-800 h-1/5 flex-shrink-0" />
            <div className="w-6 bg-slate-100 dark:bg-slate-800 h-2/5 rounded-sm animate-pulse flex-shrink-0" />
            <div className="w-0.5 bg-slate-100 dark:bg-slate-800 h-1/5 flex-shrink-0" />
            <div className="h-3 w-8 bg-slate-100 dark:bg-slate-800 rounded mt-2 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandleChartSkeleton;
