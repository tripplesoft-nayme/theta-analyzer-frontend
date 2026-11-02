const SupportDashboardSkeleton = () => {
  return (
    <div className="flex h-fit border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 animate-pulse">
      <div className="flex-1 flex flex-col h-fit">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="h-7 w-36 bg-gray-200 dark:bg-slate-800 rounded"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
        </div>
        {/* Table */}
        <div className="flex-1 overflow-auto">
          <div className="bg-white dark:bg-slate-900 shadow-sm min-h-[380px] border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="w-full text-left">
              <div className="bg-slate-50 dark:bg-slate-900/50 flex border-b dark:border-slate-800 px-6 py-4">
                <div className="w-1/12 h-4 bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div className="w-7/12 h-4 bg-gray-200 dark:bg-slate-800 rounded ml-4"></div>
                <div className="w-4/12 h-4 bg-gray-200 dark:bg-slate-800 rounded ml-4"></div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex px-6 py-4 items-center">
                    <div className="w-1/12">
                      <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-8" />
                    </div>
                    <div className="w-7/12 ml-4">
                      <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4" />
                    </div>
                    <div className="w-4/12 ml-4">
                      <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded-full w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboardSkeleton;
