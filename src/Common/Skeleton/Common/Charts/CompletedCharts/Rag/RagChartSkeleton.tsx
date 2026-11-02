const RagChartSkeleton = () => {
  return (
    <div className="w-full h-full min-h-[200px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col space-y-4">
      <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
      <div className="flex-1 w-full bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-md" />
    </div>
  );
};

export default RagChartSkeleton;
