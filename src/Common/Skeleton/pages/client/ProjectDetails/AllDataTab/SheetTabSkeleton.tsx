const SheetTabSkeleton = () => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded"></div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
      <div className="border border-border dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="h-10 bg-gray-100 dark:bg-slate-800 flex items-center px-4 gap-4">
          <div className="h-4 w-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 border-t border-border dark:border-slate-800 flex items-center px-4 gap-4">
            <div className="h-4 w-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SheetTabSkeleton;
