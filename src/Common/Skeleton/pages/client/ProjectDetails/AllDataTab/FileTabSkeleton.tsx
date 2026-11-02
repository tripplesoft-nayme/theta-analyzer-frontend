const FileTabSkeleton = () => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
        <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-36 border border-border dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-between">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded mt-2"></div>
            <div className="h-3 w-12 bg-gray-200 dark:bg-slate-700 rounded mt-1"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default FileTabSkeleton;
