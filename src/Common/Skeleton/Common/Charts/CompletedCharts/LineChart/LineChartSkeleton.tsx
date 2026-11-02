const LineChartSkeleton = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col justify-between">
      <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mb-8 flex-shrink-0" />
      <div className="relative flex-1 min-h-0 w-full flex flex-col justify-between">
        <div className="flex-1 min-h-0 w-full">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M0,80 L20,60 L40,70 L60,30 L80,50 L100,20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-slate-100 dark:text-slate-800 animate-pulse"
            />
          </svg>
        </div>
        <div className="flex justify-around mt-4 flex-shrink-0">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-3 w-8 bg-slate-100 dark:bg-slate-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LineChartSkeleton;
