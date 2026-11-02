const ColumnBarChartSkeleton = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col justify-between">
      <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mb-8 flex-shrink-0" />
      <div className="flex-1 min-h-0 flex items-end justify-around gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
            <div className="flex gap-1 items-end h-full min-h-0">
              <div className="w-4 bg-slate-100 dark:bg-slate-800 h-2/3 rounded-sm animate-pulse" />
              <div className="w-4 bg-slate-200 dark:bg-slate-700 h-1/2 rounded-sm animate-pulse" />
              <div className="w-4 bg-slate-100 dark:bg-slate-800 h-5/6 rounded-sm animate-pulse" />
            </div>
            <div className="h-3 w-10 bg-slate-100 dark:bg-slate-800 rounded flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColumnBarChartSkeleton;
