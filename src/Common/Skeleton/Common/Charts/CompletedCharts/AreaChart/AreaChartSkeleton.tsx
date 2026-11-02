const AreaChartSkeleton = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col justify-between">
      <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mb-8 flex-shrink-0" />
      <div className="relative flex-1 min-h-0 w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 to-transparent dark:from-slate-800/50 dark:to-transparent animate-pulse rounded-b-lg" />
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M0,80 L20,50 L40,60 L60,20 L80,40 L100,10 L100,100 L0,100 Z"
            className="fill-slate-100 dark:fill-slate-800 animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
};

export default AreaChartSkeleton;
