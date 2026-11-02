const DashboardTabSkeleton = () => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 dark:bg-slate-800 rounded-lg p-4 flex flex-col justify-between">
            <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-8 w-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 bg-gray-100 dark:bg-slate-800 rounded-lg p-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="h-56 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="h-80 bg-gray-100 dark:bg-slate-800 rounded-lg p-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="h-56 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};
export default DashboardTabSkeleton;
