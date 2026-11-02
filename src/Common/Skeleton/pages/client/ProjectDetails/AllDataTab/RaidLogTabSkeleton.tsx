const RaidLogTabSkeleton = () => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg animate-pulse space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded"></div>
        <div className="h-8 w-28 bg-gray-200 dark:bg-slate-700 rounded"></div>
      </div>
      <div className="border border-border dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="h-10 bg-gray-100 dark:bg-slate-800 flex items-center px-4 gap-4">
          <div className="h-4 w-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 border-t border-border dark:border-slate-800 flex items-center px-4 gap-4">
            <div className="h-4 w-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RaidLogTabSkeleton;
