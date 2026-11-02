const BubbleChartSkeleton = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col justify-between">
      <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mb-8 flex-shrink-0" />
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-around">
        {[24, 48, 32, 56, 40].map((size, i) => (
          <div
            key={i}
            style={{ width: size, height: size }}
            className="bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full"
          />
        ))}
      </div>
    </div>
  );
};

export default BubbleChartSkeleton;
